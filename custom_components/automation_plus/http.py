"""Routes HTTP du mode « dossier dédié » — voir claude-integration/ARCHITECTURE.md §1-2.

Consommées par la page Réglages (bascule de mode) et la page Édition
(enregistrer/créer) du panel — pas encore construites, ces routes sont donc
testables pour l'instant uniquement via appel HTTP direct (curl,
`hass.callApi` depuis la console du panel, etc.). Le dossier du mode dossier
dédié est fixe (DEFAULT_STORAGE_PATH), aucune route de sélection/création de
dossier arbitraire.
"""

from __future__ import annotations

import logging
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from . import storage
from .const import (
    API_AUTOMATIONS_URL,
    API_CONFIG_CHECK_URL,
    API_EXPORT_URL,
    API_SETTINGS_URL,
    API_YAML_CHECK_URL,
    CONF_STORAGE_MODE,
    CONFIGURATION_YAML_FOLDER_DIRECTIVE,
    CONFIGURATION_YAML_STANDARD_DIRECTIVE,
    DEFAULT_STORAGE_MODE,
    DEFAULT_STORAGE_PATH,
    DOMAIN,
    STANDARD_AUTOMATIONS_FILE,
    STORAGE_MODE_FOLDER,
    STORAGE_MODE_STANDARD,
)

_LOGGER = logging.getLogger(__name__)


def _config_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.config_dir)


def _current_entry(hass: HomeAssistant):
    """Instance unique (config_flow single_instance_allowed) — la première entrée suffit."""
    entries = hass.config_entries.async_entries(DOMAIN)
    return entries[0] if entries else None


class AutomationPlusSettingsView(HomeAssistantView):
    """Lire/écrire le mode de stockage choisi (Réglages > Bloc Stockage).

    Le chemin du mode dossier dédié est fixe (DEFAULT_STORAGE_PATH, auto-créé
    par async_setup_entry) — plus de sélecteur de dossier, voir
    ARCHITECTURE.md §2 (révisé 2026-09-03). Cette vue ne fait donc plus que
    basculer le mode, le chemin n'est jamais fourni par le client.
    """

    url = API_SETTINGS_URL
    name = "api:automation_plus:settings"
    requires_admin = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        options = entry.options if entry else {}
        return self.json(
            {
                "storage_mode": options.get(CONF_STORAGE_MODE, DEFAULT_STORAGE_MODE),
                "storage_path": DEFAULT_STORAGE_PATH,
            }
        )

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        if entry is None:
            return self.json_message("Intégration non configurée.", status_code=404)

        body = await request.json()
        mode = body.get("storage_mode", DEFAULT_STORAGE_MODE)

        if mode not in (STORAGE_MODE_STANDARD, STORAGE_MODE_FOLDER):
            return self.json_message(f"storage_mode invalide : {mode!r}", status_code=400)

        hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_STORAGE_MODE: mode}
        )
        return self.json({"storage_mode": mode, "storage_path": DEFAULT_STORAGE_PATH})


class AutomationPlusAutomationView(HomeAssistantView):
    """Enregistrer/créer une automatisation en mode dossier dédié (issue #20/#21).

    Uniquement pour le mode dossier dédié : en mode fichier standard, le
    panel appelle directement l'API REST native de HA (voir ARCHITECTURE.md
    §1) — cette route n'a rien à faire dans ce cas.
    """

    url = API_AUTOMATIONS_URL
    name = "api:automation_plus:automations"
    requires_admin = True

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        options = entry.options if entry else {}
        mode = options.get(CONF_STORAGE_MODE, DEFAULT_STORAGE_MODE)
        folder = DEFAULT_STORAGE_PATH

        if mode != STORAGE_MODE_FOLDER:
            return self.json_message(
                "Mode de stockage actif = fichier standard : utiliser l'API HA native.",
                status_code=409,
            )

        body = await request.json()
        config = body.get("config")
        if not isinstance(config, dict):
            return self.json_message("Le champ 'config' (objet) est requis.", status_code=400)
        automation_id = body.get("automation_id") or storage.generate_automation_id()

        try:
            written_path = await hass.async_add_executor_job(
                storage.write_automation_file, _config_dir(hass), folder, automation_id, config
            )
        except storage.UnsafePathError as err:
            return self.json_message(str(err), status_code=400)

        await hass.services.async_call("automation", "reload", blocking=True)

        return self.json({"id": automation_id, "path": written_path})


class AutomationPlusConfigCheckView(HomeAssistantView):
    """Vérifie que configuration.yaml pointe vers le mode actuellement actif (issue #17).

    Deux contrôles indépendants, selon le mode actif :
    - mode standard : la clé `automation:` pointe bien vers
      `!include automations.yaml`, ET ce fichier existe sur le disque ;
    - mode dossier dédié : la clé pointe bien vers
      `!include_dir_merge_list automations_plus/`, ET ce dossier existe.

    Lecture seule (ARCHITECTURE.md §3) — pas de réécriture automatique de
    configuration.yaml, risque de casser le démarrage de HA. Ne vérifie pas
    la syntaxe globale du fichier : ce check-là reste l'outil natif HA
    (Outils de développement > YAML), déjà référencé dans les popups de #34.
    """

    url = API_CONFIG_CHECK_URL
    name = "api:automation_plus:config_check"
    requires_admin = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        options = entry.options if entry else {}
        mode = options.get(CONF_STORAGE_MODE, DEFAULT_STORAGE_MODE)

        if mode == STORAGE_MODE_FOLDER:
            expected = CONFIGURATION_YAML_FOLDER_DIRECTIVE
            target_relative = DEFAULT_STORAGE_PATH
            target_is_dir = True
        else:
            expected = CONFIGURATION_YAML_STANDARD_DIRECTIVE
            target_relative = STANDARD_AUTOMATIONS_FILE
            target_is_dir = False

        result = await hass.async_add_executor_job(
            storage.check_configuration_target,
            _config_dir(hass),
            expected,
            target_relative,
            target_is_dir,
        )

        return self.json(
            {
                "ok": result["directive_ok"] and result["target_exists"],
                "storage_mode": mode,
                "expected_directive": expected,
                "found_directive": result["found_directive"],
                "directive_ok": result["directive_ok"],
                "target_path": target_relative,
                "target_exists": result["target_exists"],
            }
        )


class AutomationPlusExportView(HomeAssistantView):
    """Télécharge le fichier d'automatisations réellement utilisé (Bloc Import/Export).

    Mode standard uniquement pour l'instant : le mode dossier dédié n'est pas
    encore sélectionnable côté UI (Bloc Stockage verrouillé sur "Fichier
    standard"). Un export multi-fichiers (zip du dossier) reste à concevoir
    le jour où ce mode devient sélectionnable — refus explicite (409) en
    attendant plutôt qu'un comportement silencieux incorrect.
    """

    url = API_EXPORT_URL
    name = "api:automation_plus:export"
    requires_admin = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        options = entry.options if entry else {}
        mode = options.get(CONF_STORAGE_MODE, DEFAULT_STORAGE_MODE)

        if mode != STORAGE_MODE_STANDARD:
            return self.json_message(
                "Export du mode dossier dédié non encore supporté.", status_code=409
            )

        target = _config_dir(hass) / STANDARD_AUTOMATIONS_FILE
        exists = await hass.async_add_executor_job(target.is_file)
        if not exists:
            return self.json_message(f"{STANDARD_AUTOMATIONS_FILE} introuvable.", status_code=404)

        return web.FileResponse(
            path=target,
            headers={"Content-Disposition": f'attachment; filename="{STANDARD_AUTOMATIONS_FILE}"'},
        )


class AutomationPlusYamlCheckView(HomeAssistantView):
    """Vérifie la syntaxe YAML du/des fichier(s) d'automatisations (Bloc Réglages).

    Renvoie une liste (même forme qu'en mode dossier dédié aura plusieurs
    entrées) pour que le rendu JS reste identique quel que soit le mode —
    en mode standard, un seul élément : automations.yaml.
    """

    url = API_YAML_CHECK_URL
    name = "api:automation_plus:yaml_check"
    requires_admin = True

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entry = _current_entry(hass)
        options = entry.options if entry else {}
        mode = options.get(CONF_STORAGE_MODE, DEFAULT_STORAGE_MODE)

        if mode != STORAGE_MODE_STANDARD:
            return self.json_message(
                "Vérification du mode dossier dédié non encore supportée.", status_code=409
            )

        result = await hass.async_add_executor_job(
            storage.check_yaml_syntax, _config_dir(hass), STANDARD_AUTOMATIONS_FILE
        )
        return self.json({"files": [{"name": STANDARD_AUTOMATIONS_FILE, **result}]})


VIEWS = (
    AutomationPlusSettingsView,
    AutomationPlusAutomationView,
    AutomationPlusConfigCheckView,
    AutomationPlusExportView,
    AutomationPlusYamlCheckView,
)

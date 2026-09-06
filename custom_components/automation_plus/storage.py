# AutomationPlus — intégration Home Assistant custom
# Copyright (C) 2026  Louis-XII
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""Accès disque du mode « dossier dédié ».

Dérogation ciblée à la règle générale du projet (jamais de lecture/écriture
directe de fichiers YAML HA) — voir claude-integration/ARCHITECTURE.md §1 et
la mémoire Claude project_dual_storage_architecture. Toutes les fonctions
d'I/O ici sont synchrones et bloquantes par conception : à n'appeler que via
hass.async_add_executor_job depuis http.py, jamais directement depuis une
coroutine.
"""

from __future__ import annotations

import re
import time

import yaml

from pathlib import Path

# Nom de dossier/fichier : lettres, chiffres, tiret, underscore uniquement —
# bloque tout séparateur de chemin (/, \, ..) dès la validation du nom.
_SAFE_NAME_RE = re.compile(r"^[A-Za-z0-9_-]+$")


class UnsafePathError(ValueError):
    """Le chemin demandé sort de /config ou le nom fourni n'est pas sûr."""


def resolve_safe_path(config_dir: Path, relative: str) -> Path:
    """Résout `relative` sous `config_dir`, refuse toute sortie de ce dossier."""
    config_dir = config_dir.resolve()
    target = (config_dir / relative).resolve()
    if target != config_dir and config_dir not in target.parents:
        raise UnsafePathError(f"Chemin hors de /config : {relative!r}")
    return target


def ensure_folder(config_dir: Path, relative: str) -> Path:
    """Crée `relative` sous /config s'il n'existe pas déjà (dossier fixe du mode dossier dédié)."""
    target = resolve_safe_path(config_dir, relative)
    target.mkdir(parents=True, exist_ok=True)
    return target


# Clé top-level (flush left) `automation:` suivie d'une valeur sur la même
# ligne (ex. `!include automations.yaml`) — ne capture pas la forme bloc
# (mapping imbriqué sur les lignes suivantes), hors scope ici.
_AUTOMATION_KEY_RE = re.compile(r"^automation:\s*(\S.*?)\s*$")


def read_automation_directive(config_dir: Path) -> str | None:
    """Lit la valeur littérale de la clé `automation:` de configuration.yaml.

    Lecture texte ligne par ligne, pas un vrai parsing YAML : les tags
    `!include`/`!include_dir_merge_list` ne sont pas parsables par PyYAML
    standard (nécessite le loader custom de HA, qui résoudrait le contenu
    inclus plutôt que de renvoyer le tag lui-même — inutile ici, on veut
    justement savoir QUEL tag est utilisé). Retourne None si le fichier
    n'existe pas ou si la clé n'est pas trouvée sous cette forme simple.
    """
    config_file = config_dir / "configuration.yaml"
    if not config_file.is_file():
        return None
    with config_file.open("r", encoding="utf-8") as handle:
        for line in handle:
            match = _AUTOMATION_KEY_RE.match(line)
            if match:
                return match.group(1)
    return None


def check_configuration_target(
    config_dir: Path, expected_directive: str, target_relative: str, target_is_dir: bool
) -> dict:
    """Vérifie la directive `automation:` de configuration.yaml ET l'existence de sa cible.

    Deux contrôles distincts (issue #17) : la ligne pointe-t-elle vers ce
    qu'on attend pour le mode actif, et cette cible (fichier en mode
    standard, dossier en mode dossier dédié) existe-t-elle réellement sur
    le disque — les deux peuvent diverger indépendamment (ex. la ligne est
    correcte mais le dossier a été supprimé manuellement entretemps).
    """
    found = read_automation_directive(config_dir)
    target = config_dir / target_relative
    target_exists = target.is_dir() if target_is_dir else target.is_file()
    return {
        "directive_ok": found == expected_directive,
        "found_directive": found,
        "target_exists": target_exists,
    }


def generate_automation_id() -> str:
    """Même convention que l'éditeur natif HA : timestamp ms en chaîne."""
    return str(int(time.time() * 1000))


def write_automation_file(config_dir: Path, folder_relative: str, automation_id: str, config: dict) -> str:
    """Écrit <folder>/<automation_id>.yaml — une liste à un élément (include_dir_merge_list)."""
    if not _SAFE_NAME_RE.match(automation_id):
        raise UnsafePathError(f"Identifiant d'automatisation invalide : {automation_id!r}")
    folder = resolve_safe_path(config_dir, folder_relative)
    if not folder.is_dir():
        raise UnsafePathError(f"Dossier introuvable : {folder_relative!r}")
    file_path = folder / f"{automation_id}.yaml"
    payload = {**config, "id": automation_id}
    with file_path.open("w", encoding="utf-8") as handle:
        yaml.safe_dump([payload], handle, allow_unicode=True, sort_keys=False)
    return str(file_path.relative_to(config_dir.resolve()))


def validate_automation_id(automation_id: str) -> None:
    """Lève UnsafePathError si `automation_id` n'est pas un nom de fichier sûr.

    Partagé par delete_automation_file() et par la route GET de téléchargement
    (http.py) — même garde que write_automation_file(), qui ne passe que par
    generate_automation_id() côté écriture mais reçoit un id arbitraire côté
    lecture/suppression (fourni par le client).
    """
    if not _SAFE_NAME_RE.match(automation_id):
        raise UnsafePathError(f"Identifiant d'automatisation invalide : {automation_id!r}")


def delete_automation_file(config_dir: Path, folder_relative: str, automation_id: str) -> bool:
    """Supprime <folder>/<automation_id>.yaml (mode dossier dédié, menu Options > Supprimer).

    Retourne False si le fichier n'existait déjà pas (suppression idempotente
    plutôt qu'une erreur) — seul un identifiant non sûr lève UnsafePathError.
    """
    validate_automation_id(automation_id)
    folder = resolve_safe_path(config_dir, folder_relative)
    file_path = folder / f"{automation_id}.yaml"
    if not file_path.is_file():
        return False
    file_path.unlink()
    return True


class _HaTagTolerantLoader(yaml.SafeLoader):
    """SafeLoader tolérant aux tags custom HA (`!secret`, `!include*`, etc.).

    Ne les résout pas (contrairement au loader custom de HA) — on vérifie
    juste que le fichier se parse, pas le contenu inclus/résolu. Sans ça,
    `yaml.safe_load` lève un `ConstructorError` sur tout tag inconnu, faux
    positif systématique sur des fichiers pourtant valides pour HA (issue #65).
    """


_HaTagTolerantLoader.add_multi_constructor("!", lambda loader, suffix, node: None)


def check_yaml_syntax(config_dir: Path, relative_path: str) -> dict:
    """Vérifie qu'un fichier YAML sous /config se parse sans erreur (Bloc
    Réglages > Vérification des fichiers YAML).

    Loader dérivé de `SafeLoader` tolérant aux tags custom HA (`!secret`,
    `!include*`...) sans les résoudre — on vérifie juste la syntaxe du
    fichier lui-même, pas le contenu inclus (voir _HaTagTolerantLoader). Un
    fichier absent est signalé comme une erreur plutôt que silencieusement
    ignoré, pour rester cohérent avec le contrôle d'existence déjà fait par
    check_configuration_target().
    """
    target = resolve_safe_path(config_dir, relative_path)
    if not target.is_file():
        return {"ok": False, "error": "Fichier introuvable."}
    try:
        with target.open("r", encoding="utf-8") as handle:
            yaml.load(handle, Loader=_HaTagTolerantLoader)
    except yaml.YAMLError as err:
        return {"ok": False, "error": str(err)}
    return {"ok": True, "error": None}

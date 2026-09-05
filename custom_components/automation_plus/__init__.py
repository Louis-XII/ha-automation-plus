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

"""Intégration AutomationPlus — enregistre le panel custom dans la sidebar HA."""

from pathlib import Path

from homeassistant.components.frontend import async_remove_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from . import storage
from .const import DEFAULT_STORAGE_PATH, DOMAIN, FRONTEND_JS, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .http import VIEWS

STATIC_PATH = f"/{DOMAIN}_static"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Enregistre les fichiers statiques du panel et l'ajoute à la sidebar."""
    frontend_dir = Path(__file__).parent / "frontend"
    integration = await async_get_integration(hass, DOMAIN)

    # Dossier fixe du mode "Dossier dédié" — créé au premier lancement, pas
    # de sélecteur de dossier (voir ARCHITECTURE.md §2, révisé 2026-09-03).
    # Hors garde ci-dessous : doit pouvoir recréer le dossier s'il a été
    # supprimé entre deux rechargements de l'entry.
    await hass.async_add_executor_job(
        storage.ensure_folder, Path(hass.config.config_dir), DEFAULT_STORAGE_PATH
    )

    # Instance unique (config_flow single_instance_allowed) : le chemin
    # statique et les routes ne sont enregistrés qu'une fois même si l'entry
    # est rechargée sans redémarrage complet de HA (hass.http ne propose pas
    # de désenregistrement).
    domain_data = hass.data.setdefault(DOMAIN, {})
    if not domain_data.get("setup_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_PATH, str(frontend_dir), True)]
        )
        for view_cls in VIEWS:
            hass.http.register_view(view_cls())
        domain_data["setup_registered"] = True

    await async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="automation-plus-panel",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        # module_url (pas js_url) : un script module a un scope isolé par
        # module, donc une ré-exécution après bump de version (URL différente)
        # ne peut jamais provoquer de redéclaration `const`/`class` en conflit
        # dans le scope global de la page HA — contrairement à js_url, qui
        # partage le scope global de la page (voir claude-integration/
        # CHANGELOG.md pour l'analyse complète).
        module_url=f"{STATIC_PATH}/{FRONTEND_JS}?v={integration.version}",
        require_admin=True,
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Retire le panel de la sidebar."""
    async_remove_panel(hass, PANEL_URL)
    return True

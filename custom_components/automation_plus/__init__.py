"""Intégration AutomationPlus — enregistre le panel custom dans la sidebar HA."""

from pathlib import Path

from homeassistant.components.frontend import async_remove_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN, FRONTEND_JS, PANEL_ICON, PANEL_TITLE, PANEL_URL

STATIC_PATH = f"/{DOMAIN}_static"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Enregistre les fichiers statiques du panel et l'ajoute à la sidebar."""
    frontend_dir = Path(__file__).parent / "frontend"
    integration = await async_get_integration(hass, DOMAIN)

    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_PATH, str(frontend_dir), True)]
    )

    await async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="automation-plus-panel",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{STATIC_PATH}/{FRONTEND_JS}?v={integration.version}",
        require_admin=True,
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Retire le panel de la sidebar."""
    async_remove_panel(hass, PANEL_URL)
    return True

"""Constantes de l'intégration AutomationPlus."""

DOMAIN = "automation_plus"
PANEL_URL = "automation-plus"
PANEL_TITLE = "AutomationPlus"
PANEL_ICON = "mdi:robot"
FRONTEND_JS = "automation-panel.js"

# Options de config entry — mode de stockage choisi dans la page Réglages.
# Voir claude-integration/ARCHITECTURE.md §1-2.
CONF_STORAGE_MODE = "storage_mode"

STORAGE_MODE_STANDARD = "standard"
STORAGE_MODE_FOLDER = "folder"
DEFAULT_STORAGE_MODE = STORAGE_MODE_STANDARD

# Dossier fixe du mode "Dossier dédié", auto-créé sous /config — pas de
# sélecteur de dossier, voir ARCHITECTURE.md §2 (révisé 2026-09-03).
DEFAULT_STORAGE_PATH = "automations_plus"

# Routes HTTP de l'intégration (voir http.py).
API_SETTINGS_URL = f"/api/{DOMAIN}/settings"
API_AUTOMATIONS_URL = f"/api/{DOMAIN}/automations"

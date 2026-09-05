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

# Fichier ciblé par le mode "Fichier standard" — nom conventionnel HA, câblé
# en dur dans l'API REST native (/api/config/automation/config/<id>), voir
# ARCHITECTURE.md §1.
STANDARD_AUTOMATIONS_FILE = "automations.yaml"

# Valeurs attendues de la clé top-level `automation:` dans configuration.yaml
# selon le mode — voir ARCHITECTURE.md §3 (issue #17).
CONFIGURATION_YAML_STANDARD_DIRECTIVE = f"!include {STANDARD_AUTOMATIONS_FILE}"
CONFIGURATION_YAML_FOLDER_DIRECTIVE = f"!include_dir_merge_list {DEFAULT_STORAGE_PATH}/"

# Routes HTTP de l'intégration (voir http.py).
API_SETTINGS_URL = f"/api/{DOMAIN}/settings"
API_AUTOMATIONS_URL = f"/api/{DOMAIN}/automations"
# Item individuel (mode dossier dédié uniquement) : téléchargement (GET) et
# suppression (DELETE) d'une automatisation par son id — voir
# AutomationPlusAutomationItemView. `automation_id` : même identifiant que le
# nom de fichier <id>.yaml (voir storage.write_automation_file) et que
# entity_registry.unique_id pour une entité automation.*.
API_AUTOMATION_ITEM_URL = f"{API_AUTOMATIONS_URL}/{{automation_id}}"
API_CONFIG_CHECK_URL = f"/api/{DOMAIN}/config_check"
API_EXPORT_URL = f"/api/{DOMAIN}/export"
API_YAML_CHECK_URL = f"/api/{DOMAIN}/yaml_check"

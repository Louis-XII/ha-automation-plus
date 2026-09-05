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

"""Config flow AutomationPlus — aucune donnée à saisir, une seule étape de confirmation."""

from homeassistant.config_entries import ConfigFlow

from .const import DOMAIN, PANEL_TITLE


class AutomationPlusConfigFlow(ConfigFlow, domain=DOMAIN):
    """Gère la création de l'entry AutomationPlus."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None):
        """Étape unique : confirmation, aucun champ à saisir."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data={})

        return self.async_show_form(step_id="user")

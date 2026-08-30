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

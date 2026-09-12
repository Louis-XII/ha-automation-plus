// AutomationPlus — intégration Home Assistant custom
// Copyright (C) 2026  la12lab
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Catalogue statique des types de blocs (déclencheurs/conditions/actions) —
// issue #22. Aucune API HA n'expose cette traduction en résumé lisible :
// même l'éditeur visuel natif de HA la code en dur dans son propre frontend
// (fonctions describeTrigger/describeCondition/describeAction, non exposées).
// Fichier statique séparé du panel (chargé via import ES module), à relire
// et mettre à jour manuellement à chaque évolution notable des plateformes
// de trigger/condition/action de HA.
//
// BLOCK_REGISTRY_HA_VERSION : dernière version HA (core) contre laquelle ce
// registre a été relu — indépendante du numéro de version du panel lui-même.
export const BLOCK_REGISTRY_HA_VERSION = "2026.9.2";

const ICON_TOGGLE_RIGHT = `<rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="2"/>`;
const ICON_ALARM_CLOCK = `<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>`;
const ICON_MAP_PIN = `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`;
const ICON_RADIO = `<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>`;
const ICON_CIRCLE_CHECK = `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`;
const ICON_CALENDAR_CLOCK = `<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M17.5 17.5 16 16.25V14"/><circle cx="16" cy="16" r="6"/>`;
const ICON_SIGMA = `<path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6.2a2 2 0 0 1 0 2l-4.5 6.2a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/>`;
const ICON_CODE = `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`;
const ICON_TERMINAL = `<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>`;
const ICON_HOURGLASS = `<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>`;
const ICON_BELL = `<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>`;
const ICON_SPLIT = `<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>`;
// Icône neutre du repli générique (plateforme non couverte par le registre).
const ICON_GENERIC = `<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>`;

function entityLabel(hass, entityId) {
  if (!entityId) return "";
  const friendly = hass?.states?.[entityId]?.attributes?.friendly_name;
  return friendly || entityId;
}

function entityListLabel(hass, entityIdOrList) {
  const ids = Array.isArray(entityIdOrList) ? entityIdOrList : [entityIdOrList];
  return ids.filter(Boolean).map((id) => entityLabel(hass, id)).join(", ");
}

function formatDuration(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const parts = [];
    if (value.hours) parts.push(`${value.hours} h`);
    if (value.minutes) parts.push(`${value.minutes} min`);
    if (value.seconds) parts.push(`${value.seconds} s`);
    return parts.join(" ") || "durée non précisée";
  }
  return "durée non précisée";
}

function compactSummary(config, skipKeys) {
  const entries = Object.entries(config).filter(([key]) => !skipKeys.includes(key));
  if (entries.length === 0) return "Aucun paramètre";
  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
    .join(" · ");
}

// Repli générique : n'importe quelle plateforme/service HA non listée
// ci-dessous reste affichée (icône neutre + clé brute + résumé compact),
// plutôt que de faire disparaître le bloc de la vue Liste.
function genericFallback(kind, typeKey, config, skipKeys) {
  return {
    icon: ICON_GENERIC,
    title: typeKey ? `${kind} : ${typeKey}` : kind,
    summary: compactSummary(config, skipKeys),
  };
}

export function describeTrigger(trigger, hass) {
  const typeKey = trigger.trigger ?? trigger.platform;
  switch (typeKey) {
    case "state": {
      const entity = entityListLabel(hass, trigger.entity_id);
      const to = trigger.to !== undefined ? ` passe à "${trigger.to}"` : " change d'état";
      return {
        icon: ICON_TOGGLE_RIGHT,
        title: "État d'une entité",
        summary: `Quand ${entity || "l'entité"}${to}`,
      };
    }
    case "time": {
      const at = Array.isArray(trigger.at) ? trigger.at.join(", ") : trigger.at;
      return { icon: ICON_ALARM_CLOCK, title: "Heure", summary: `Tous les jours à ${at ?? "?"}` };
    }
    case "zone": {
      const entity = entityListLabel(hass, trigger.entity_id);
      const verb = trigger.event === "leave" ? "sort de" : "entre dans";
      return {
        icon: ICON_MAP_PIN,
        title: "Zone",
        summary: `Quand ${entity || "l'entité"} ${verb} ${trigger.zone ?? "la zone"}`,
      };
    }
    case "event": {
      return { icon: ICON_RADIO, title: "Événement HA", summary: `Sur l'événement "${trigger.event_type ?? "?"}"` };
    }
    default:
      return genericFallback("Déclencheur", typeKey, trigger, ["trigger", "platform"]);
  }
}

export function describeCondition(condition, hass) {
  const typeKey = condition.condition;
  switch (typeKey) {
    case "state": {
      const entity = entityListLabel(hass, condition.entity_id);
      return {
        icon: ICON_CIRCLE_CHECK,
        title: "État",
        summary: `${entity || "L'entité"} est à "${condition.state ?? "?"}"`,
      };
    }
    case "time": {
      const parts = [];
      if (condition.after) parts.push(`après ${condition.after}`);
      if (condition.before) parts.push(`avant ${condition.before}`);
      return { icon: ICON_CALENDAR_CLOCK, title: "Plage horaire", summary: parts.join(" et ") || "Toute heure" };
    }
    case "numeric_state": {
      const entity = entityListLabel(hass, condition.entity_id);
      const parts = [];
      if (condition.above !== undefined) parts.push(`> ${condition.above}`);
      if (condition.below !== undefined) parts.push(`< ${condition.below}`);
      return {
        icon: ICON_SIGMA,
        title: "Valeur numérique",
        summary: `${entity || "L'entité"} ${parts.join(" et ") || "a une valeur numérique"}`,
      };
    }
    case "template": {
      const template = String(condition.value_template ?? "").trim();
      return {
        icon: ICON_CODE,
        title: "Modèle Jinja2",
        summary: template.length > 60 ? `${template.slice(0, 60)}…` : template || "(vide)",
      };
    }
    default:
      return genericFallback("Condition", typeKey, condition, ["condition"]);
  }
}

export function describeAction(action, hass) {
  if (action.service !== undefined || action.action !== undefined) {
    const service = action.service ?? action.action;
    if (typeof service === "string" && service.startsWith("notify.")) {
      const message = action.data?.message ?? action.data?.title ?? "";
      return { icon: ICON_BELL, title: "Notification", summary: message ? `"${message}"` : service };
    }
    const target = entityListLabel(hass, action.target?.entity_id ?? action.entity_id);
    return {
      icon: ICON_TERMINAL,
      title: "Appeler un service",
      summary: target ? `${service} → ${target}` : service,
    };
  }
  if (action.delay !== undefined) {
    return { icon: ICON_HOURGLASS, title: "Attendre", summary: `Pendant ${formatDuration(action.delay)}` };
  }
  if (action.wait_template !== undefined || action.wait_for_trigger !== undefined) {
    return { icon: ICON_HOURGLASS, title: "Attendre", summary: "Attendre qu'une condition soit vraie" };
  }
  if (action.choose !== undefined || action.if !== undefined) {
    const branches = Array.isArray(action.choose) ? action.choose.length : action.if ? 1 : 0;
    return {
      icon: ICON_SPLIT,
      title: "Choisir (si/alors)",
      summary: branches ? `${branches} cas` : "Structure conditionnelle",
    };
  }
  const typeKey = Object.keys(action)[0];
  return genericFallback("Action", typeKey, action, []);
}

// Métadonnées pures (icône + titre, sans résumé) des 11 types de blocs
// couverts par le registre — pilote la Sidebar Palette de la vue Liste (#5),
// qui n'a besoin que de la liste des types disponibles, pas d'une
// automatisation réelle à décrire.
export const BLOCK_TYPES = {
  trigger: [
    { icon: ICON_TOGGLE_RIGHT, title: "État d'une entité" },
    { icon: ICON_ALARM_CLOCK, title: "Heure" },
    { icon: ICON_MAP_PIN, title: "Zone" },
    { icon: ICON_RADIO, title: "Événement HA" },
  ],
  condition: [
    { icon: ICON_CIRCLE_CHECK, title: "État" },
    { icon: ICON_CALENDAR_CLOCK, title: "Plage horaire" },
    { icon: ICON_SIGMA, title: "Valeur numérique" },
    { icon: ICON_CODE, title: "Modèle Jinja2" },
  ],
  action: [
    { icon: ICON_TERMINAL, title: "Appeler un service" },
    { icon: ICON_HOURGLASS, title: "Attendre" },
    { icon: ICON_BELL, title: "Notification" },
    { icon: ICON_SPLIT, title: "Choisir (si/alors)" },
  ],
};

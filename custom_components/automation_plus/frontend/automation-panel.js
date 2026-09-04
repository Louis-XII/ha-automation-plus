// Panel AutomationPlus — squelette v0.1 (validation du mécanisme panel_custom).
// HA assigne directement les propriétés hass / narrow / panel sur l'élément,
// pas via des attributs HTML — d'où l'usage de set hass(value) plutôt que attributeChangedCallback.

// Infos de debug — pas de pipeline de build pour l'instant, donc à tenir à
// jour manuellement en même temps que manifest.json. DEBUG_VERSION reste
// affiché dans le badge du header ; DEBUG_BUILD_DATE n'est plus dans le
// header (retiré sur demande) et sera affiché dans le futur bloc « À propos »
// de la page Réglages (pas encore codée).
const DEBUG_VERSION = "0.6.0";
const DEBUG_BUILD_DATE = "2026-09-04";

const REPO_URL = "https://github.com/Louis-XII/ha-automation-plus";
const ISSUES_URL = `${REPO_URL}/issues`;
const RELEASES_URL = `${REPO_URL}/releases`;

const GROUP_OPTIONS = [
  { id: "none", label: "Ne pas regrouper" },
  { id: "category", label: "Catégorie" },
  { id: "state", label: "État" },
  { id: "label", label: "Étiquette" },
];

const STATUS_FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "on", label: "Activées" },
  { id: "off", label: "Désactivées" },
];

// Couleur de repli pour une étiquette HA sans couleur définie.
const DEFAULT_LABEL_COLOR = "#6b7280";

// Préférences d'affichage du dashboard persistées côté navigateur
// (localStorage) — propres à cet appareil/navigateur, pas synchronisées
// entre appareils. Ne couvre volontairement pas la recherche texte, qui
// reste une saisie ponctuelle.
const PREFS_STORAGE_KEY = "automation_plus.dashboard_prefs";

// Chemins des routes HTTP de l'intégration (voir http.py / const.py côté
// Python — API_*_URL). hass.callApi() préfixe déjà "/api/", donc ces valeurs
// restent sans le préfixe ; auth/sign_path (téléchargement) le veut inclus,
// voir _exportAutomations().
const API_PATHS = {
  configCheck: "automation_plus/config_check",
  yamlCheck: "automation_plus/yaml_check",
  export: "automation_plus/export",
};

// Délai avant disparition automatique du toast d'erreur (fermeture manuelle
// via le bouton × toujours possible avant ce délai).
const ERROR_TOAST_AUTO_DISMISS_MS = 5000;

// Icônes en SVG inline (pas de dépendance CDN — le panel doit fonctionner
// sans accès internet sur une instance HA locale).
const ICON_ARROW_LEFT = `<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>`;
const ICON_BUG = `<path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>`;
const ICON_HELP_CIRCLE = `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`;
const ICON_SETTINGS = `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`;
const ICON_SEARCH = `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`;
const ICON_LAYERS = `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>`;
const ICON_CHEVRON_DOWN = `<path d="m6 9 6 6 6-6"/>`;
const ICON_CHECK = `<path d="M20 6 9 17l-5-5"/>`;
const ICON_PLUS = `<path d="M5 12h14"/><path d="M12 5v14"/>`;
const ICON_FOLDER = `<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>`;
const ICON_MAP_PIN = `<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`;
const ICON_ALERT_TRIANGLE = `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`;
const ICON_X = `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`;
const ICON_FILE_TEXT = `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>`;
const ICON_SHIELD_CHECK = `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.79 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>`;
const ICON_DOWNLOAD = `<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>`;
const ICON_UPLOAD = `<path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/>`;
const ICON_SCROLL_TEXT = `<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

class AutomationPlusPanel extends HTMLElement {
  constructor() {
    super();
    // "dashboard" (par défaut) ou "settings" — état interne, pas de routeur :
    // pas de bundler dans ce projet, la page Réglages est un état du même
    // custom element plutôt qu'un composant séparé (voir ARCHITECTURE.md §5).
    this._view = "dashboard";
    this._configCheckState = { loading: false, result: null, error: false };
    this._yamlCheckState = { loading: false, files: null, error: false, checkedAt: null };

    const prefs = this._loadPrefs();
    this._filterText = "";
    this._statusFilter = prefs.statusFilter;
    this._activeLabelFilters = new Set(prefs.activeLabelFilters);
    this._groupBy = prefs.groupBy;
    this._groupMenuOpen = false;
    // entity_id des automatisations dont le toggle est en attente de
    // confirmation par HA — évite un double clic pendant l'aller-retour
    // service call / mise à jour d'état.
    this._pendingToggles = new Set();
    // Toast d'erreur affiché uniquement en cas d'échec d'une action (ex.
    // toggle) — jamais de bannière de confirmation en cas de succès, le
    // changement visuel (ex. position du toggle) suffit déjà comme feedback.
    this._errorToast = null;
    this._errorToastTimeoutId = null;

    // Registres HA (entity/area/label/category) — chargés une seule fois
    // par connexion hass via WebSocket, voir _loadRegistries().
    this._entityRegistryByEntityId = new Map();
    this._areaRegistry = new Map();
    this._labelRegistry = new Map();
    this._categoryRegistry = new Map();
    this._registriesLoaded = false;
    this._registriesLoading = false;
  }

  // localStorage peut échouer (navigation privée, stockage désactivé) —
  // dans ce cas le dashboard reste utilisable, seul le rappel des
  // préférences est perdu.
  _loadPrefs() {
    const defaults = { groupBy: "none", statusFilter: "all", activeLabelFilters: [] };
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        groupBy: GROUP_OPTIONS.some((option) => option.id === parsed.groupBy) ? parsed.groupBy : defaults.groupBy,
        statusFilter: STATUS_FILTERS.some((filter) => filter.id === parsed.statusFilter)
          ? parsed.statusFilter
          : defaults.statusFilter,
        activeLabelFilters: Array.isArray(parsed.activeLabelFilters)
          ? parsed.activeLabelFilters.filter((id) => typeof id === "string")
          : defaults.activeLabelFilters,
      };
    } catch (err) {
      return defaults;
    }
  }

  _savePrefs() {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          groupBy: this._groupBy,
          statusFilter: this._statusFilter,
          activeLabelFilters: [...this._activeLabelFilters],
        })
      );
    } catch (err) {
      // Stockage indisponible — pas bloquant, on continue sans persister.
    }
  }

  set hass(value) {
    const isFirstAssignment = !this._hass;
    this._hass = value;
    this._renderPreservingFocus();
    if (isFirstAssignment) {
      this._loadRegistries();
    }
  }

  // HA réassigne `hass` à chaque changement d'état dans l'instance (pas
  // seulement sur les automatisations), donc très fréquemment. Un _render()
  // complet recrée le champ de recherche à chaque fois et lui fait perdre le
  // focus pendant la frappe — on sauvegarde donc le focus/la sélection avant
  // de re-render et on les restaure juste après.
  _renderPreservingFocus() {
    const root = this.shadowRoot;
    const activeIsSearch =
      root && root.activeElement && root.activeElement.classList.contains("search-input");
    const selectionStart = activeIsSearch ? root.activeElement.selectionStart : null;
    const selectionEnd = activeIsSearch ? root.activeElement.selectionEnd : null;
    // Zone scrollable de la vue active (header/toolbar figés, voir CSS
    // `.scroll-area`/`.settings-view`) — un _render() complet la recrée et
    // remet son scroll à 0 à chaque réassignation de `hass`, aussi gênant
    // que la perte de focus du champ recherche ci-dessus.
    const scrollSelector = this._view === "settings" ? ".settings-view" : ".scroll-area";
    const previousScrollEl = root && root.querySelector(scrollSelector);
    const scrollTop = previousScrollEl ? previousScrollEl.scrollTop : 0;
    this._render();
    if (activeIsSearch) {
      const input = root.querySelector(".search-input");
      if (input) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    const newScrollEl = root.querySelector(scrollSelector);
    if (newScrollEl) {
      newScrollEl.scrollTop = scrollTop;
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this._render();
  }

  // Charge une seule fois les registres HA nécessaires pour enrichir la
  // liste des automatisations (pièce, catégorie, étiquettes) — hass.states
  // seul ne donne que le nom et l'état on/off.
  async _loadRegistries() {
    if (!this._hass || this._registriesLoading) return;
    this._registriesLoading = true;
    try {
      const [entities, areas, labels, categories] = await Promise.all([
        this._hass.callWS({ type: "config/entity_registry/list" }),
        this._hass.callWS({ type: "config/area_registry/list" }),
        this._hass.callWS({ type: "config/label_registry/list" }),
        this._hass.callWS({ type: "config/category_registry/list", scope: "automation" }),
      ]);
      this._entityRegistryByEntityId = new Map(entities.map((entry) => [entry.entity_id, entry]));
      this._areaRegistry = new Map(areas.map((area) => [area.area_id, area]));
      this._labelRegistry = new Map(labels.map((label) => [label.label_id, label]));
      this._categoryRegistry = new Map(categories.map((category) => [category.category_id, category]));
      this._registriesLoaded = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AutomationPlus: échec du chargement des registres HA", err);
    } finally {
      this._registriesLoading = false;
      this._render();
    }
  }

  _icon(paths, size = 16) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  // Construit la liste des automatisations à partir de hass.states, enrichie
  // avec les registres (pièce, catégorie, étiquettes). Ne dépend pas du mode
  // de stockage choisi dans Réglages (fichier standard / dossier dédié) :
  // hass.states reflète toujours ce que HA a chargé, quelle que soit la source.
  _getAutomations() {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter((stateObj) => stateObj.entity_id.startsWith("automation."))
      .map((stateObj) => {
        const entry = this._entityRegistryByEntityId.get(stateObj.entity_id);
        const areaId = entry ? entry.area_id : null;
        const categoryId = entry && entry.categories ? entry.categories.automation : null;
        const labelIds = entry ? entry.labels || [] : [];
        const area = areaId ? this._areaRegistry.get(areaId) : null;
        const category = categoryId ? this._categoryRegistry.get(categoryId) : null;
        const labels = labelIds
          .map((id) => this._labelRegistry.get(id))
          .filter(Boolean)
          .map((label) => ({ id: label.label_id, name: label.name, color: label.color, icon: label.icon }));
        return {
          entity_id: stateObj.entity_id,
          name: (stateObj.attributes && stateObj.attributes.friendly_name) || stateObj.entity_id,
          icon: (stateObj.attributes && stateObj.attributes.icon) || null,
          state: stateObj.state,
          area: area ? area.name : null,
          category: category ? category.name : null,
          labels,
        };
      });
  }

  // Étiquettes réellement utilisées par au moins une automatisation, pour la
  // rangée de chips-filtres de la toolbar — jamais de valeur fictive codée
  // en dur, uniquement ce qui vient effectivement du label_registry.
  _getUsedLabels() {
    const seen = new Map();
    this._getAutomations().forEach((automation) => {
      automation.labels.forEach((label) => {
        if (!seen.has(label.id)) seen.set(label.id, label);
      });
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  _getFilteredAutomations() {
    let list = this._getAutomations();
    const needle = this._filterText.trim().toLowerCase();
    if (needle) {
      list = list.filter((automation) => automation.name.toLowerCase().includes(needle));
    }
    if (this._statusFilter !== "all") {
      list = list.filter((automation) => automation.state === this._statusFilter);
    }
    if (this._activeLabelFilters.size > 0) {
      // ET logique : une automatisation doit porter TOUTES les étiquettes
      // sélectionnées, pas juste une (comportement corrigé — c'était un OU
      // avant, qui élargissait au lieu d'affiner la sélection).
      list = list.filter((automation) =>
        [...this._activeLabelFilters].every((id) => automation.labels.some((label) => label.id === id))
      );
    }
    return list;
  }

  _groupAutomations(automations) {
    const buckets = new Map();
    const pushTo = (key, item) => {
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(item);
    };

    if (this._groupBy === "state") {
      automations.forEach((a) => pushTo(a.state === "on" ? "Activées" : "Désactivées", a));
      return ["Activées", "Désactivées"]
        .filter((key) => buckets.has(key))
        .map((key) => ({ title: key, items: buckets.get(key) }));
    }

    if (this._groupBy === "category") {
      automations.forEach((a) => pushTo(a.category || "Sans catégorie", a));
      const keys = [...buckets.keys()].sort((a, b) =>
        a === "Sans catégorie" ? 1 : b === "Sans catégorie" ? -1 : a.localeCompare(b)
      );
      return keys.map((key) => ({ title: key, items: buckets.get(key) }));
    }

    if (this._groupBy === "label") {
      automations.forEach((a) => {
        if (a.labels.length === 0) {
          pushTo("Sans étiquette", a);
        } else {
          a.labels.forEach((label) => pushTo(label.name, a));
        }
      });
      const keys = [...buckets.keys()].sort((a, b) =>
        a === "Sans étiquette" ? 1 : b === "Sans étiquette" ? -1 : a.localeCompare(b)
      );
      return keys.map((key) => ({ title: key, items: buckets.get(key) }));
    }

    return [{ title: "", items: automations }];
  }

  // Style unique pour les chips étiquette : plein pastel (inactif) ou plein
  // soutenu (actif, uniquement pour le filtre toolbar), avec un liseré de la
  // même couleur que le texte — généré dynamiquement via color-mix() à
  // partir de la couleur réelle de l'étiquette HA, qui n'est pas limitée à
  // 3 teintes fixes.
  _renderLabelChip(label, { clickable = false, active = false } = {}) {
    const color = label.color || DEFAULT_LABEL_COLOR;
    const style = active
      ? `--chip-color:${escapeHtml(color)};background:var(--chip-color);color:#fff;border:1px solid color-mix(in srgb, var(--chip-color) 65%, black);`
      : `--chip-color:${escapeHtml(color)};background:color-mix(in srgb, var(--chip-color) 14%, white);color:color-mix(in srgb, var(--chip-color) 60%, black);border:1px solid color-mix(in srgb, var(--chip-color) 45%, white);`;
    const classes = ["chip", clickable ? "chip-clickable" : "", active ? "active" : ""]
      .filter(Boolean)
      .join(" ");
    const dataAttr = clickable ? ` data-label-id="${escapeHtml(label.id)}"` : "";
    // <ha-icon> : élément custom déjà défini globalement par le frontend HA
    // (le panel s'exécute dans la même page) — pas de dépendance CDN, et
    // résout n'importe quelle icône mdi:* choisie pour l'étiquette sans
    // avoir à embarquer un jeu d'icônes ici.
    const iconHtml = label.icon ? `<ha-icon icon="${escapeHtml(label.icon)}" class="chip-icon"></ha-icon>` : "";
    return `<span class="${classes}" style="${style}"${dataAttr}>${iconHtml}${escapeHtml(label.name)}</span>`;
  }

  _renderChips() {
    const usedLabels = this._getUsedLabels();
    if (usedLabels.length === 0) return "";
    const hasSelection = this._activeLabelFilters.size > 0;
    // Chip de réinitialisation toujours en première position — sélection
    // multiple des étiquettes, donc pas de clic "bascule" évident pour tout
    // désélectionner d'un coup sans elle.
    const resetChip = `<button class="chip chip-reset${hasSelection ? "" : " active"}" data-action="reset-labels" ${hasSelection ? "" : "disabled"}>Tout</button>`;
    const chips = usedLabels
      .map((label) =>
        this._renderLabelChip(label, { clickable: true, active: this._activeLabelFilters.has(label.id) })
      )
      .join("");
    return `<div class="chips-row">${resetChip}${chips}</div>`;
  }

  _groupLabel() {
    const option = GROUP_OPTIONS.find((item) => item.id === this._groupBy);
    if (!option || option.id === "none") return "Regrouper";
    return `Regroupé par ${option.label.toLowerCase()}`;
  }

  _renderGroupMenu() {
    if (!this._groupMenuOpen) return "";
    const options = GROUP_OPTIONS.map((option) => {
      const selected = option.id === this._groupBy;
      return `
        <div class="dropdown-option${selected ? " selected" : ""}" data-value="${option.id}">
          <span>${option.label}</span>
          ${selected ? this._icon(ICON_CHECK, 14) : ""}
        </div>
      `;
    }).join("");
    return `
      <div class="dropdown-backdrop"></div>
      <div class="dropdown">${options}</div>
    `;
  }

  _renderStatusFilters() {
    const chips = STATUS_FILTERS.map((filter) => {
      const active = filter.id === this._statusFilter;
      return `<button class="status-chip${active ? " active" : ""}" data-value="${filter.id}">${filter.label}</button>`;
    }).join("");
    return `<div class="status-filters">${chips}</div>`;
  }

  _renderTableHeader() {
    return `
      <div class="automation-row automation-row-header">
        <div class="col-name">Nom</div>
        <div class="col-labels">Étiquettes</div>
        <div class="col-category">Catégorie</div>
        <div class="col-area">Pièce</div>
        <div class="col-state">État</div>
      </div>
    `;
  }

  _renderAutomationRow(automation) {
    const stateOn = automation.state === "on";
    const labelsHtml = automation.labels.map((label) => this._renderLabelChip(label)).join("");
    const categoryHtml = automation.category
      ? `<span class="meta-badge">${this._icon(ICON_FOLDER, 13)}<span>${escapeHtml(automation.category)}</span></span>`
      : `<span class="meta-empty">—</span>`;
    const areaHtml = automation.area
      ? `<span class="meta-badge">${this._icon(ICON_MAP_PIN, 13)}<span>${escapeHtml(automation.area)}</span></span>`
      : `<span class="meta-empty">—</span>`;
    return `
      <div class="automation-row${stateOn ? "" : " automation-row-off"}">
        <div class="col-name" title="${escapeHtml(automation.name)}">
          <ha-icon class="row-icon" icon="${escapeHtml(automation.icon || "mdi:robot")}"></ha-icon>
          <div class="row-name-block">
            <span class="row-name-text">${escapeHtml(automation.name)}</span>
            <span class="row-entity-id">${escapeHtml(automation.entity_id)}</span>
          </div>
        </div>
        <div class="col-labels">${labelsHtml || '<span class="meta-empty">—</span>'}</div>
        <div class="col-category">${categoryHtml}</div>
        <div class="col-area">${areaHtml}</div>
        <div class="col-state">
          <span class="state-toggle ${stateOn ? "on" : "off"}${this._pendingToggles.has(automation.entity_id) ? " pending" : ""}" data-entity-id="${escapeHtml(automation.entity_id)}" title="${stateOn ? "Cliquer pour désactiver" : "Cliquer pour activer"}">
            <span class="state-toggle-knob"></span>
          </span>
        </div>
      </div>
    `;
  }

  _renderAutomationList(automations) {
    if (this._groupBy === "none") {
      return `<div class="automation-table">${this._renderTableHeader()}${automations
        .map((a) => this._renderAutomationRow(a))
        .join("")}</div>`;
    }
    return this._groupAutomations(automations)
      .map(
        ({ title, items }) => `
          <div class="automation-group">
            <div class="automation-group-title">${escapeHtml(title)} <span class="group-count">${items.length}</span></div>
            <div class="automation-table">${this._renderTableHeader()}${items
              .map((a) => this._renderAutomationRow(a))
              .join("")}</div>
          </div>
        `
      )
      .join("");
  }

  // Retourne uniquement le contenu interne de la liste (pas de wrapper),
  // pour permettre un re-render partiel via _renderListOnly() sans perdre
  // le focus du champ de recherche à chaque frappe.
  _renderBody() {
    if (!this._hass) {
      return `<p class="empty-state">Chargement…</p>`;
    }
    if (!this._registriesLoaded) {
      return `<p class="empty-state">Chargement des automatisations…</p>`;
    }
    const automations = this._getFilteredAutomations();
    if (automations.length === 0) {
      const filtersActive = this._filterText || this._statusFilter !== "all" || this._activeLabelFilters.size > 0;
      const message = filtersActive
        ? "Aucune automatisation ne correspond aux filtres actuels."
        : "Aucune automatisation trouvée.";
      return `<p class="empty-state">${message}</p>`;
    }
    return this._renderAutomationList(automations);
  }

  // Re-render partiel du seul conteneur de liste : les lignes d'automatisation
  // n'ont aucun listener à ré-attacher (toggle État non interactif pour
  // l'instant), donc un simple remplacement d'innerHTML suffit.
  _renderListOnly() {
    const container = this.shadowRoot && this.shadowRoot.querySelector(".list-container");
    if (!container) return;
    container.innerHTML = this._renderBody();
  }

  _renderToast() {
    if (!this._errorToast) return "";
    return `
      <div class="toast toast-error">
        ${this._icon(ICON_ALERT_TRIANGLE, 18)}
        <span class="toast-message">${escapeHtml(this._errorToast.message)}</span>
        <button class="toast-close" title="Fermer">${this._icon(ICON_X, 14)}</button>
      </div>
    `;
  }

  // Même principe que _renderListOnly() : remplace uniquement le contenu du
  // conteneur toast (élément stable, voir _render()) pour ne pas perdre le
  // focus du champ de recherche si un toast apparaît pendant une frappe.
  _renderToastOnly() {
    const container = this.shadowRoot && this.shadowRoot.querySelector(".toast-container");
    if (!container) return;
    container.innerHTML = this._renderToast();
  }

  // Un seul toast à la fois : un nouvel appel remplace le précédent et
  // relance le délai d'auto-fermeture plutôt que d'empiler les messages.
  _showErrorToast(message) {
    if (this._errorToastTimeoutId) {
      clearTimeout(this._errorToastTimeoutId);
    }
    this._errorToast = { message };
    this._renderToastOnly();
    this._errorToastTimeoutId = setTimeout(() => {
      this._errorToastTimeoutId = null;
      this._dismissErrorToast();
    }, ERROR_TOAST_AUTO_DISMISS_MS);
  }

  _dismissErrorToast() {
    if (this._errorToastTimeoutId) {
      clearTimeout(this._errorToastTimeoutId);
      this._errorToastTimeoutId = null;
    }
    this._errorToast = null;
    this._renderToastOnly();
  }

  // Décrit le résultat de /config_check en français, en s'appuyant sur le
  // détail renvoyé par le backend (directive_ok / target_exists) plutôt que
  // sur un simple "erreur" générique — les deux peuvent diverger
  // indépendamment (voir ARCHITECTURE.md §3).
  _describeConfigCheck(result) {
    if (result.ok) return "la configuration correspond au mode actif.";
    const reasons = [];
    if (!result.directive_ok) {
      reasons.push("la ligne « automation: » de configuration.yaml ne correspond pas au mode actif");
    }
    if (!result.target_exists) {
      reasons.push(`« ${result.target_path} » est introuvable`);
    }
    return reasons.length > 0
      ? `${reasons.join(" ; ")}.`
      : "la configuration ne correspond pas au mode actif.";
  }

  async _checkConfig() {
    if (!this._hass || this._configCheckState.loading) return;
    this._configCheckState = { loading: true, result: null, error: false };
    this._render();
    try {
      const result = await this._hass.callApi("GET", API_PATHS.configCheck);
      this._configCheckState = { loading: false, result, error: false };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AutomationPlus: échec de la vérification de configuration", err);
      this._configCheckState = { loading: false, result: null, error: true };
    }
    this._render();
  }

  async _checkYaml() {
    if (!this._hass || this._yamlCheckState.loading) return;
    this._yamlCheckState = { loading: true, files: null, error: false, checkedAt: this._yamlCheckState.checkedAt };
    this._render();
    try {
      const { files } = await this._hass.callApi("GET", API_PATHS.yamlCheck);
      this._yamlCheckState = { loading: false, files, error: false, checkedAt: new Date() };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AutomationPlus: échec de la vérification YAML", err);
      this._yamlCheckState = { loading: false, files: null, error: true, checkedAt: this._yamlCheckState.checkedAt };
    }
    this._render();
  }

  // Téléchargement d'un fichier protégé par l'auth HA : pas de <a href>
  // simple possible (API derrière bearer token), on passe par le mécanisme
  // natif "signed path" (utilisé par HA lui-même pour backups/diagnostics) —
  // une URL signée à usage court plutôt qu'un token exposé côté client.
  async _exportAutomations() {
    if (!this._hass) return;
    try {
      const signed = await this._hass.callWS({ type: "auth/sign_path", path: `/api/${API_PATHS.export}` });
      window.open(signed.path, "_blank", "noopener,noreferrer");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AutomationPlus: échec de l'export des automatisations", err);
      this._showErrorToast("Impossible d'exporter les automatisations.");
    }
  }

  _renderSoonBadge() {
    return `<span class="soon-badge">Bientôt disponible</span>`;
  }

  // Bloc Stockage : verrouillé sur "Fichier standard" — le segment "Dossier
  // dédié" reste visuellement présent (design déjà fait, ARCHITECTURE.md
  // §2) mais inerte (pas de listener posé dessus), en attendant les popups
  // de confirmation de bascule (#34/#35, pas encore codées).
  _renderStorageBlock() {
    const checkState = this._configCheckState;
    let checkResultHtml = "";
    if (checkState.loading) {
      checkResultHtml = `<p class="check-result">Vérification en cours…</p>`;
    } else if (checkState.error) {
      checkResultHtml = `<p class="check-result check-error">${this._icon(ICON_X, 14)}<span>Impossible de contacter Home Assistant.</span></p>`;
    } else if (checkState.result) {
      const ok = checkState.result.ok;
      checkResultHtml = `
        <p class="check-result ${ok ? "check-ok" : "check-error"}">
          ${this._icon(ok ? ICON_CHECK : ICON_X, 14)}
          <span><strong>${ok ? "OK," : "Erreur,"}</strong> ${escapeHtml(this._describeConfigCheck(checkState.result))}</span>
        </p>
      `;
    }
    return `
      <div class="settings-block">
        <div class="settings-block-header">
          <h2>Stockage des automatisations</h2>
          <p>Choisir où sont stockées les automatisations.</p>
        </div>
        <div class="storage-selector-row">
          <div class="storage-selector">
            <div class="storage-segment active">
              ${this._icon(ICON_FILE_TEXT, 14)}
              <span>Fichier standard</span>
            </div>
            <div class="storage-segment disabled" title="Bientôt disponible">
              ${this._icon(ICON_FOLDER, 14)}
              <span>Dossier dédié</span>
            </div>
          </div>
          <p class="storage-path-info">${this._icon(ICON_FILE_TEXT, 12)}<span>Chemin : <code>config/automations.yaml</code></span></p>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-action-row">
          <button class="settings-btn" data-action="check-config">
            ${this._icon(ICON_SHIELD_CHECK, 14)}
            <span>Vérifier la configuration</span>
          </button>
        </div>
        ${checkResultHtml}
      </div>
    `;
  }

  // Horodatage affiché au-dessus de la liste — conservé tel quel (pas remis
  // à null) tant que l'utilisateur ne relance pas une analyse : un
  // changement de vue (Dashboard <-> Réglages) ne doit pas le faire
  // disparaître, seul un nouveau clic sur "Analyser" le met à jour.
  _formatCheckTimestamp(date) {
    const datePart = date.toLocaleDateString("fr-FR");
    const timePart = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} à ${timePart}`;
  }

  // Bloc Vérification YAML : fonctionnel pour le fichier actif (mode
  // standard) — même mécanique/rendu qu'un futur mode dossier multi-fichiers
  // (le backend renvoie déjà une liste, à un seul élément pour l'instant ;
  // en mode dossier elle listera tous les fichiers YAML trouvés). Chaque
  // ligne reprend la palette OK/Erreur du bloc Stockage (_renderStorageBlock)
  // pour rester cohérent visuellement entre les deux vérifications.
  _renderYamlCheckBlock() {
    const state = this._yamlCheckState;
    let resultsHtml = "";
    if (state.loading) {
      resultsHtml = `<p class="check-result">Analyse en cours…</p>`;
    } else if (state.error) {
      resultsHtml = `<p class="check-result check-error">${this._icon(ICON_X, 14)}<span>Impossible de contacter Home Assistant.</span></p>`;
    } else if (state.files) {
      const timestampHtml = state.checkedAt
        ? `<p class="yaml-check-timestamp">Vérifié le ${this._formatCheckTimestamp(state.checkedAt)}</p>`
        : "";
      resultsHtml = `
        ${timestampHtml}
        <div class="yaml-check-results">${state.files
          .map(
            (file) => `
              <div class="yaml-check-row ${file.ok ? "check-ok" : "check-error"}">
                ${this._icon(file.ok ? ICON_CHECK : ICON_X, 14)}
                <span class="yaml-check-name">${escapeHtml(file.name)}</span>
                <span class="yaml-check-status"><strong>${file.ok ? "OK," : "Erreur,"}</strong> ${file.ok ? "syntaxe valide." : escapeHtml(file.error)}</span>
              </div>
            `
          )
          .join("")}</div>
      `;
    }
    return `
      <div class="settings-block">
        <div class="settings-block-header">
          <h2>Vérification des fichiers YAML</h2>
          <p>Analyser les fichiers qui seront lus par l'intégration.</p>
        </div>
        <div class="settings-action-row">
          <button class="settings-btn" data-action="check-yaml">
            ${this._icon(ICON_SHIELD_CHECK, 14)}
            <span>Analyser</span>
          </button>
        </div>
        ${resultsHtml}
      </div>
    `;
  }

  _renderDisplayBlock() {
    return `
      <div class="settings-block">
        <div class="settings-block-header settings-block-header-inline">
          <h2>Affichage</h2>
          ${this._renderSoonBadge()}
        </div>
        <p>Les options d'affichage (densité de liste, thème du graphe) arriveront dans une prochaine version.</p>
      </div>
    `;
  }

  // Import inerte (pas de listener posé) — pas encore utile tant que le
  // mode dossier dédié, seul mode où "importer" a un sens, n'est pas
  // sélectionnable.
  _renderImportExportBlock() {
    return `
      <div class="settings-block">
        <div class="settings-block-header">
          <h2>Import / Export</h2>
          <p>Sauvegarder ou restaurer vos automatisations au format YAML.</p>
        </div>
        <div class="settings-action-row">
          <button class="settings-btn" data-action="export">
            ${this._icon(ICON_DOWNLOAD, 14)}
            <span>Exporter les automatisations</span>
          </button>
          <button class="settings-btn disabled" title="Bientôt disponible" disabled>
            ${this._icon(ICON_UPLOAD, 14)}
            <span>Importer des automatisations</span>
          </button>
        </div>
      </div>
    `;
  }

  _renderAboutBlock() {
    return `
      <div class="settings-block">
        <h2>À propos</h2>
        <div class="about-version-row">
          <span class="about-version-badge">v${DEBUG_VERSION} · ${DEBUG_BUILD_DATE}</span>
        </div>
        <div class="about-links">
          <a class="about-link" href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer">
            ${this._icon(ICON_SCROLL_TEXT, 13)}<span>Voir les nouveautés</span>
          </a>
          <a class="about-link" href="${ISSUES_URL}" target="_blank" rel="noopener noreferrer">
            ${this._icon(ICON_BUG, 13)}<span>Signaler un bug / Voir les issues</span>
          </a>
        </div>
        <p class="about-credits">AutomationPlus — intégration Home Assistant open source</p>
        <p class="about-credits">${DEBUG_BUILD_DATE.slice(0, 4)} · MIT License · Développeur indépendant · 🇫🇷 codé en France</p>
      </div>
    `;
  }

  _renderSettingsView() {
    return `
      <div class="settings-view">
        ${this._renderStorageBlock()}
        ${this._renderYamlCheckBlock()}
        ${this._renderDisplayBlock()}
        ${this._renderImportExportBlock()}
        ${this._renderAboutBlock()}
      </div>
    `;
  }

  _renderDashboardView() {
    return `
      <div class="toolbar">
        <div class="search-wrap">
          ${this._icon(ICON_SEARCH, 16)}
          <input class="search-input" type="text" placeholder="Rechercher une automatisation..." value="${escapeHtml(this._filterText)}" />
        </div>
        <div class="regroup-wrap">
          <button class="regroup-btn">
            ${this._icon(ICON_LAYERS, 16)}
            <span>${this._groupLabel()}</span>
            ${this._icon(ICON_CHEVRON_DOWN, 14)}
          </button>
          ${this._renderGroupMenu()}
        </div>
        ${this._renderStatusFilters()}
      </div>
      ${this._renderChips()}
      <div class="scroll-area">
        <div class="list-container">${this._renderBody()}</div>
      </div>
      <button class="fab" title="Nouvelle automatisation">
        ${this._icon(ICON_PLUS, 24)}
      </button>
    `;
  }

  _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100vh;
          overflow: hidden;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          height: 64px;
          padding: 0 16px;
          background: var(--card-background-color, #fff);
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          color: var(--secondary-text-color, #666);
        }
        .icon-button svg {
          width: 22px;
          height: 22px;
        }
        h1 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--primary-text-color, #212121);
        }
        .version-badge {
          font-family: monospace;
          font-size: 11px;
          color: var(--secondary-text-color, #666);
          background: var(--secondary-background-color, #f1f3f4);
          padding: 2px 8px;
          border-radius: 10px;
          text-decoration: none;
          cursor: pointer;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .toolbar {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 12px;
          height: 48px;
          padding: 0 16px;
          background: var(--card-background-color, #fff);
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 0 0 240px;
          height: 32px;
          padding: 0 10px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          background: var(--primary-background-color, #fafafa);
          color: var(--secondary-text-color, #666);
        }
        .search-wrap input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          color: var(--primary-text-color, #212121);
        }
        .regroup-wrap {
          position: relative;
        }
        .regroup-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--secondary-text-color, #666);
          font-size: 13px;
          cursor: pointer;
        }
        .dropdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9;
        }
        .dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 200px;
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 10;
        }
        .dropdown-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          font-size: 13px;
          color: var(--primary-text-color, #212121);
          cursor: pointer;
        }
        .dropdown-option:hover {
          background: var(--primary-background-color, #fafafa);
        }
        .dropdown-option.selected {
          background: var(--primary-background-color, #fafafa);
          font-weight: 600;
          color: var(--primary-color, #03a9f4);
        }
        .chips-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          flex-shrink: 0;
          gap: 6px;
          padding: 10px 16px;
          background: var(--card-background-color, #fff);
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .status-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .status-chip {
          box-sizing: border-box;
          border: 1px solid transparent;
          border-radius: 14px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 400;
          font-family: inherit;
          cursor: pointer;
          background: var(--secondary-background-color, #f1f3f4);
          color: var(--secondary-text-color, #666);
        }
        .status-chip.active {
          background: var(--primary-text-color, #212121);
          color: var(--card-background-color, #fff);
          font-weight: 700;
        }
        .status-chip.active[data-value="on"] {
          background: var(--primary-color, #03a9f4);
        }
        .status-chip[data-value="on"]:not(.active) {
          border-color: color-mix(in srgb, var(--primary-color, #03a9f4) 45%, white);
        }
        .chip {
          display: inline-flex;
          align-items: center;
          box-sizing: border-box;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 9px;
          border-radius: 12px;
          border: none;
          font-family: inherit;
          flex-shrink: 0;
        }
        .chip.chip-clickable {
          cursor: pointer;
        }
        .chip.active {
          font-weight: 700;
        }
        .chip-icon {
          --mdc-icon-size: 10px;
          width: 10px;
          height: 10px;
          color: inherit;
        }
        .chip-reset {
          background: var(--secondary-background-color, #f1f3f4);
          color: var(--secondary-text-color, #666);
          cursor: pointer;
          padding-left: 10px;
          padding-right: 10px;
        }
        .chip-reset:not(:disabled):hover {
          background: var(--divider-color, #e0e0e0);
        }
        .chip-reset.active {
          background: var(--primary-text-color, #212121);
          color: var(--card-background-color, #fff);
          cursor: default;
        }
        .scroll-area {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .list-container {
          padding: 16px;
        }
        .empty-state {
          margin: 0;
          padding: 24px 0;
          text-align: center;
          color: var(--secondary-text-color, #666);
        }
        .automation-group {
          margin-bottom: 20px;
        }
        .automation-group-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary-text-color, #212121);
          margin: 0 0 8px;
        }
        .group-count {
          font-weight: 400;
          color: var(--secondary-text-color, #666);
        }
        .automation-table {
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          overflow: hidden;
        }
        .automation-row {
          display: grid;
          grid-template-columns: minmax(180px, 2fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) 100px;
          gap: 12px;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .automation-row:last-child {
          border-bottom: none;
        }
        .automation-row-off {
          background: var(--secondary-background-color, #f1f3f4);
        }
        .automation-row-header {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--secondary-text-color, #666);
          background: var(--primary-background-color, #fafafa);
        }
        .col-name {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          font-size: 13px;
          color: var(--primary-text-color, #212121);
        }
        .row-icon {
          --mdc-icon-size: 18px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: var(--secondary-text-color, #666);
        }
        .row-name-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .row-name-text {
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 700;
        }
        .row-entity-id {
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-family: var(--code-font-family, monospace);
          font-size: 12px;
          color: var(--secondary-text-color, #666);
        }
        .col-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          min-width: 0;
        }
        .col-category,
        .col-area {
          min-width: 0;
        }
        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--secondary-text-color, #666);
          max-width: 100%;
        }
        .meta-badge span {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .meta-empty {
          color: var(--secondary-text-color, #666);
          opacity: 0.5;
        }
        .col-state {
          display: flex;
          justify-content: flex-start;
        }
        .state-toggle {
          display: inline-flex;
          align-items: center;
          box-sizing: border-box;
          width: 40px;
          height: 24px;
          border-radius: 12px;
          padding: 2px;
          background: var(--divider-color, #e0e0e0);
          cursor: pointer;
        }
        .state-toggle.pending {
          opacity: 0.5;
          pointer-events: none;
        }
        .state-toggle.on {
          background: var(--primary-color, #03a9f4);
          justify-content: flex-end;
        }
        .state-toggle-knob {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .fab {
          position: fixed;
          right: 32px;
          bottom: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: var(--primary-color, #03a9f4);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .toast-container {
          position: fixed;
          top: 64px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 420px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--error-color, #c62828);
          background: color-mix(in srgb, var(--card-background-color, #fff) 90%, transparent);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.13);
        }
        .toast svg {
          color: var(--error-color, #c62828);
          flex-shrink: 0;
        }
        .toast-message {
          flex: 1;
          font-size: 13px;
          line-height: 1.35;
          color: var(--error-color, #c62828);
        }
        .toast-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          color: var(--error-color, #c62828);
          flex-shrink: 0;
        }
        .settings-view {
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 16px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .settings-block {
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 12px;
          padding: 20px;
        }
        .settings-block h2 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--primary-text-color, #212121);
        }
        .settings-block > p {
          margin: 0;
          font-size: 13px;
          color: var(--secondary-text-color, #666);
        }
        .settings-block-header {
          margin-bottom: 16px;
        }
        .settings-block-header > p {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--secondary-text-color, #666);
        }
        .settings-block-header-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .settings-block-header-inline h2 {
          margin: 0;
        }
        .soon-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
          background: var(--secondary-background-color, #f1f3f4);
          color: var(--secondary-text-color, #666);
        }
        .storage-selector-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .storage-selector {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 2px;
          padding: 3px;
          border-radius: 9px;
          background: var(--secondary-background-color, #f1f3f4);
        }
        .storage-segment {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: var(--secondary-text-color, #666);
        }
        .storage-segment.active {
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.13);
        }
        .storage-segment.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .storage-path-info {
          display: flex;
          flex: 1;
          min-width: 0;
          align-items: center;
          gap: 5px;
          margin: 0;
          font-size: 11px;
          color: var(--secondary-text-color, #666);
        }
        .storage-path-info span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .storage-path-info code {
          font-family: var(--code-font-family, monospace);
        }
        .settings-divider {
          height: 1px;
          margin: 16px 0;
          background: var(--divider-color, #e0e0e0);
        }
        .settings-action-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .settings-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 16px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--secondary-text-color, #666);
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
        }
        .settings-btn:hover:not(.disabled):not(:disabled) {
          border-color: var(--primary-color, #03a9f4);
          color: var(--primary-text-color, #212121);
        }
        .settings-btn.disabled,
        .settings-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .settings-block > .check-result {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin: 12px 0 0;
          font-size: 13px;
          color: var(--secondary-text-color, #666);
        }
        .check-result.check-ok {
          color: var(--success-color, #2e7d32);
        }
        .check-result.check-error {
          color: var(--error-color, #c62828);
        }
        .check-result svg {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .settings-block > .yaml-check-timestamp {
          margin: 12px 0 8px;
          font-size: 12px;
          color: var(--secondary-text-color, #666);
        }
        .yaml-check-results {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .yaml-check-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--secondary-text-color, #666);
        }
        .yaml-check-row.check-ok {
          color: var(--success-color, #2e7d32);
        }
        .yaml-check-row.check-error {
          color: var(--error-color, #c62828);
        }
        .yaml-check-row svg {
          flex-shrink: 0;
        }
        .yaml-check-name {
          font-family: var(--code-font-family, monospace);
          color: inherit;
        }
        .yaml-check-status {
          margin-left: auto;
          text-align: right;
          flex-shrink: 0;
          color: inherit;
        }
        .about-version-row {
          margin-bottom: 12px;
        }
        .about-version-badge {
          display: inline-block;
          font-family: var(--code-font-family, monospace);
          font-size: 11px;
          color: var(--secondary-text-color, #666);
          background: var(--secondary-background-color, #f1f3f4);
          padding: 3px 10px;
          border-radius: 10px;
        }
        .about-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .about-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--primary-color, #03a9f4);
          text-decoration: none;
        }
        .about-link:hover {
          text-decoration: underline;
        }
        .about-credits {
          margin: 0;
          font-size: 11px;
          color: var(--secondary-text-color, #666);
        }
        .about-credits + .about-credits {
          margin-top: 3px;
        }
      </style>
      <div class="header">
        <div class="header-left">
          <button class="icon-button back-btn" title="${this._view === "settings" ? "Retour au Dashboard" : "Retour à Home Assistant"}">
            ${this._icon(ICON_ARROW_LEFT, 22)}
          </button>
          <h1>AutomationPlus</h1>
          <a class="version-badge" href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer" title="Voir les releases sur GitHub">v${DEBUG_VERSION}</a>
        </div>
        <div class="header-actions">
          <button class="icon-button" title="Signaler un bug" onclick="window.open('${ISSUES_URL}', '_blank', 'noopener,noreferrer')">
            ${this._icon(ICON_BUG, 22)}
          </button>
          <button class="icon-button" title="Aide">
            ${this._icon(ICON_HELP_CIRCLE, 22)}
          </button>
          <button class="icon-button settings-btn-header" title="Paramètres">
            ${this._icon(ICON_SETTINGS, 22)}
          </button>
        </div>
      </div>
      ${this._view === "settings" ? this._renderSettingsView() : this._renderDashboardView()}
      <div class="toast-container">${this._renderToast()}</div>
    `;
    this._attachListeners();
  }

  // Bascule l'état d'une automatisation via le service HA standard
  // `automation.toggle` — jamais d'état optimiste : le state affiché reste
  // dérivé de hass.states, seule source de vérité, mise à jour par HA lui-même
  // (hass est réassigné très fréquemment, voir _renderPreservingFocus()).
  // `pending` bloque juste les clics répétés le temps de l'aller-retour.
  async _toggleAutomation(entityId) {
    if (!entityId || !this._hass || this._pendingToggles.has(entityId)) return;
    this._pendingToggles.add(entityId);
    this._renderListOnly();
    try {
      await this._hass.callService("automation", "toggle", { entity_id: entityId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("AutomationPlus: échec du toggle d'automatisation", entityId, err);
      const stateObj = this._hass.states[entityId];
      const name = (stateObj && stateObj.attributes && stateObj.attributes.friendly_name) || entityId;
      this._showErrorToast(`Impossible de basculer « ${name} » — vérifiez vos permissions.`);
    } finally {
      this._pendingToggles.delete(entityId);
      this._renderListOnly();
    }
  }

  _attachListeners() {
    const root = this.shadowRoot;

    const searchInput = root.querySelector(".search-input");
    if (searchInput) {
      // Re-render partiel uniquement (_renderListOnly) : un _render() complet
      // recréerait le champ et ferait perdre le focus à chaque frappe.
      searchInput.addEventListener("input", (event) => {
        this._filterText = event.target.value;
        this._renderListOnly();
      });
    }

    const regroupBtn = root.querySelector(".regroup-btn");
    if (regroupBtn) {
      regroupBtn.addEventListener("click", () => {
        this._groupMenuOpen = !this._groupMenuOpen;
        this._render();
      });
    }

    root.querySelectorAll(".dropdown-option").forEach((option) => {
      option.addEventListener("click", () => {
        this._groupBy = option.dataset.value;
        this._groupMenuOpen = false;
        this._savePrefs();
        this._render();
      });
    });

    const dropdownBackdrop = root.querySelector(".dropdown-backdrop");
    if (dropdownBackdrop) {
      dropdownBackdrop.addEventListener("click", () => {
        this._groupMenuOpen = false;
        this._render();
      });
    }

    root.querySelectorAll(".status-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this._statusFilter = chip.dataset.value;
        this._savePrefs();
        this._render();
      });
    });

    root.querySelectorAll(".chip-clickable").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = chip.dataset.labelId;
        if (this._activeLabelFilters.has(id)) {
          this._activeLabelFilters.delete(id);
        } else {
          this._activeLabelFilters.add(id);
        }
        this._savePrefs();
        this._render();
      });
    });

    const resetLabelsChip = root.querySelector(".chip-reset");
    if (resetLabelsChip) {
      resetLabelsChip.addEventListener("click", () => {
        this._activeLabelFilters.clear();
        this._savePrefs();
        this._render();
      });
    }

    // Écouteur délégué sur le conteneur (pas sur chaque .state-toggle) :
    // seul .innerHTML change lors d'un _renderListOnly() (filtre de
    // recherche), le conteneur lui-même reste le même élément — un
    // écouteur posé directement sur chaque toggle serait perdu à la
    // prochaine frappe dans le champ de recherche.
    const listContainer = root.querySelector(".list-container");
    if (listContainer) {
      listContainer.addEventListener("click", (event) => {
        const toggle = event.target.closest(".state-toggle");
        if (!toggle) return;
        this._toggleAutomation(toggle.dataset.entityId);
      });
    }

    const toastContainer = root.querySelector(".toast-container");
    if (toastContainer) {
      toastContainer.addEventListener("click", (event) => {
        if (event.target.closest(".toast-close")) {
          this._dismissErrorToast();
        }
      });
    }

    // FAB "+" : pas encore de lien vers la page Édition (pas codée), voir
    // BACKLOG.md — le bouton reste visuellement en place mais inactif.

    const backBtn = root.querySelector(".back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (this._view === "settings") {
          this._view = "dashboard";
          this._render();
        } else {
          history.back();
        }
      });
    }

    const settingsBtnHeader = root.querySelector(".settings-btn-header");
    if (settingsBtnHeader) {
      settingsBtnHeader.addEventListener("click", () => {
        this._view = "settings";
        this._render();
      });
    }

    // Écouteur délégué sur .settings-view : les blocs Réglages sont
    // recréés à chaque _render() (résultats de vérif/export), un seul
    // listener sur le conteneur stable évite d'avoir à le reposer.
    const settingsView = root.querySelector(".settings-view");
    if (settingsView) {
      settingsView.addEventListener("click", (event) => {
        const actionEl = event.target.closest("[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === "check-config") {
          this._checkConfig();
        } else if (action === "check-yaml") {
          this._checkYaml();
        } else if (action === "export") {
          this._exportAutomations();
        }
      });
    }
  }
}

customElements.define("automation-plus-panel", AutomationPlusPanel);

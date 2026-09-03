// Panel AutomationPlus — squelette v0.1 (validation du mécanisme panel_custom).
// HA assigne directement les propriétés hass / narrow / panel sur l'élément,
// pas via des attributs HTML — d'où l'usage de set hass(value) plutôt que attributeChangedCallback.

// Infos de debug affichées dans le badge du header — pas de pipeline de build
// pour l'instant, donc à tenir à jour manuellement en même temps que manifest.json.
const DEBUG_VERSION = "0.5.0";
const DEBUG_BUILD_DATE = "2026-09-03";

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
    this._filterText = "";
    this._statusFilter = "all";
    this._activeLabelFilter = null;
    this._groupBy = "none";
    this._groupMenuOpen = false;

    // Registres HA (entity/area/label/category) — chargés une seule fois
    // par connexion hass via WebSocket, voir _loadRegistries().
    this._entityRegistryByEntityId = new Map();
    this._areaRegistry = new Map();
    this._labelRegistry = new Map();
    this._categoryRegistry = new Map();
    this._registriesLoaded = false;
    this._registriesLoading = false;
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
    this._render();
    if (activeIsSearch) {
      const input = root.querySelector(".search-input");
      if (input) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
      }
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
          .map((label) => ({ id: label.label_id, name: label.name, color: label.color }));
        return {
          entity_id: stateObj.entity_id,
          name: (stateObj.attributes && stateObj.attributes.friendly_name) || stateObj.entity_id,
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
    if (this._activeLabelFilter) {
      list = list.filter((automation) =>
        automation.labels.some((label) => label.id === this._activeLabelFilter)
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

  // Style unique pour les chips étiquette : pastel + léger dégradé (inactif)
  // ou plein + dégradé soutenu (actif, uniquement pour le filtre toolbar) —
  // généré dynamiquement via color-mix() à partir de la couleur réelle de
  // l'étiquette HA, qui n'est pas limitée à 3 teintes fixes.
  _renderLabelChip(label, { clickable = false, active = false } = {}) {
    const color = label.color || DEFAULT_LABEL_COLOR;
    const style = active
      ? `--chip-color:${escapeHtml(color)};background:linear-gradient(180deg, var(--chip-color), color-mix(in srgb, var(--chip-color) 65%, black));color:#fff;`
      : `--chip-color:${escapeHtml(color)};background:linear-gradient(180deg, color-mix(in srgb, var(--chip-color) 20%, white), color-mix(in srgb, var(--chip-color) 38%, white));color:color-mix(in srgb, var(--chip-color) 60%, black);`;
    const classes = ["chip", clickable ? "chip-clickable" : "", active ? "active" : ""]
      .filter(Boolean)
      .join(" ");
    const dataAttr = clickable ? ` data-label-id="${escapeHtml(label.id)}"` : "";
    return `<span class="${classes}" style="${style}"${dataAttr}>${escapeHtml(label.name)}</span>`;
  }

  _renderChips() {
    const usedLabels = this._getUsedLabels();
    if (usedLabels.length === 0) return "";
    const chips = usedLabels
      .map((label) =>
        this._renderLabelChip(label, { clickable: true, active: label.id === this._activeLabelFilter })
      )
      .join("");
    return `<div class="chips">${chips}</div>`;
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
        <div class="col-name" title="${escapeHtml(automation.name)}">${escapeHtml(automation.name)}</div>
        <div class="col-labels">${labelsHtml || '<span class="meta-empty">—</span>'}</div>
        <div class="col-category">${categoryHtml}</div>
        <div class="col-area">${areaHtml}</div>
        <div class="col-state">
          <span class="state-toggle ${stateOn ? "on" : "off"}" title="${stateOn ? "Activée" : "Désactivée"}">
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
      const filtersActive = this._filterText || this._statusFilter !== "all" || this._activeLabelFilter;
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

  _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        .chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          min-width: 0;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: thin;
          /* Empêche l'overscroll en bout de scroll de remonter à la page —
             sans ça, un swipe horizontal (trackpad) qui atteint la limite de
             la barre de chips peut déclencher le geste "page précédente" du
             navigateur, dans HA comme dans un onglet classique. */
          overscroll-behavior-x: contain;
        }
        .chips::-webkit-scrollbar {
          height: 4px;
        }
        .chips::-webkit-scrollbar-thumb {
          background: var(--divider-color, #e0e0e0);
          border-radius: 2px;
        }
        .status-filters {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .status-chip {
          border: none;
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
        .chip {
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
          padding: 10px 16px;
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
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 13px;
          color: var(--primary-text-color, #212121);
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
          width: 32px;
          height: 18px;
          border-radius: 9px;
          padding: 2px;
          background: var(--divider-color, #e0e0e0);
        }
        .state-toggle.on {
          background: var(--primary-color, #03a9f4);
          justify-content: flex-end;
        }
        .state-toggle-knob {
          width: 14px;
          height: 14px;
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
      </style>
      <div class="header">
        <div class="header-left">
          <button class="icon-button" title="Retour à Home Assistant" onclick="history.back()">
            ${this._icon(ICON_ARROW_LEFT, 22)}
          </button>
          <h1>AutomationPlus</h1>
          <a class="version-badge" href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer" title="Voir les releases sur GitHub">v${DEBUG_VERSION} · ${DEBUG_BUILD_DATE}</a>
        </div>
        <div class="header-actions">
          <button class="icon-button" title="Signaler un bug" onclick="window.open('${ISSUES_URL}', '_blank', 'noopener,noreferrer')">
            ${this._icon(ICON_BUG, 22)}
          </button>
          <button class="icon-button" title="Aide">
            ${this._icon(ICON_HELP_CIRCLE, 22)}
          </button>
          <button class="icon-button" title="Paramètres">
            ${this._icon(ICON_SETTINGS, 22)}
          </button>
        </div>
      </div>
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
        ${this._renderChips()}
        ${this._renderStatusFilters()}
      </div>
      <div class="list-container">${this._renderBody()}</div>
      <button class="fab" title="Nouvelle automatisation">
        ${this._icon(ICON_PLUS, 24)}
      </button>
    `;
    this._attachListeners();
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
        this._render();
      });
    });

    // Une molette de souris classique ne défile que verticalement ; seul
    // Chrome redirige automatiquement vers l'axe horizontal sur un conteneur
    // qui ne déborde que là — Safari/Firefox ne le font pas. On convertit
    // donc nous-mêmes le deltaY en scroll horizontal pour la barre de chips.
    const chipsEl = root.querySelector(".chips");
    if (chipsEl) {
      chipsEl.addEventListener(
        "wheel",
        (event) => {
          if (event.deltaY === 0 || chipsEl.scrollWidth <= chipsEl.clientWidth) return;
          event.preventDefault();
          chipsEl.scrollLeft += event.deltaY;
        },
        { passive: false }
      );
    }

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
        this._render();
      });
    });

    root.querySelectorAll(".chip-clickable").forEach((chip) => {
      chip.addEventListener("click", () => {
        const id = chip.dataset.labelId;
        this._activeLabelFilter = this._activeLabelFilter === id ? null : id;
        this._render();
      });
    });

    // FAB "+" : pas encore de lien vers la page Édition (pas codée), voir
    // BACKLOG.md — le bouton reste visuellement en place mais inactif.
  }
}

customElements.define("automation-plus-panel", AutomationPlusPanel);

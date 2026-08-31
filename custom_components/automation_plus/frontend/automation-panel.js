// Panel AutomationPlus — squelette v0.1 (validation du mécanisme panel_custom).
// HA assigne directement les propriétés hass / narrow / panel sur l'élément,
// pas via des attributs HTML — d'où l'usage de set hass(value) plutôt que attributeChangedCallback.

// Infos de debug affichées dans le badge du header — pas de pipeline de build
// pour l'instant, donc à tenir à jour manuellement en même temps que manifest.json.
const DEBUG_VERSION = "0.3.1";
const DEBUG_BUILD_DATE = "2026-08-31";

const REPO_URL = "https://github.com/Louis-XII/ha-automation-plus";
const ISSUES_URL = `${REPO_URL}/issues`;
const COMMITS_URL = `${REPO_URL}/commits/main`;

const GROUP_OPTIONS = [
  { id: "none", label: "Ne pas regrouper" },
  { id: "category", label: "Catégorie" },
  { id: "state", label: "État" },
  { id: "label", label: "Label" },
];

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
    this._groupBy = "none";
    this._groupMenuOpen = false;
    this._createPopupOpen = false;
    // Vrais labels HA (label_registry) — vide tant que le backend ne les
    // expose pas encore au panel. La rangée de chips ne s'affiche que si
    // ce tableau est rempli, jamais de labels fictifs codés en dur ici.
    this._labels = [];
  }

  set hass(value) {
    this._hass = value;
    this._render();
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this._render();
  }

  _icon(paths, size = 16) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  _renderChips() {
    if (this._labels.length === 0) return "";
    const chips = this._labels
      .map((label) => `<span class="chip" style="--chip-color:${escapeHtml(label.color || "#666")}">${escapeHtml(label.name)}</span>`)
      .join("");
    return `<div class="chips">${chips}</div>`;
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

  _renderCreatePopup() {
    if (!this._createPopupOpen) return "";
    return `
      <div class="popup-backdrop">
        <div class="popup">
          <h2>Nouvelle automatisation</h2>
          <p>Cette fonctionnalité arrive bientôt — pour l'instant, crée ton automatisation directement dans Home Assistant.</p>
          <button class="popup-close-btn">Fermer</button>
        </div>
      </div>
    `;
  }

  _render() {
    if (!this.shadowRoot) return;
    const entityCount = this._hass ? Object.keys(this._hass.states).length : 0;
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
          flex: 0 0 320px;
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
        }
        .chip {
          font-size: 11px;
          padding: 3px 9px;
          border-radius: 10px;
          background: var(--chip-color);
          color: #fff;
        }
        .body {
          padding: 16px;
        }
        .body p {
          margin: 0;
          color: var(--primary-text-color, #212121);
        }
        .fab {
          position: absolute;
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
        .popup-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.32);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .popup {
          width: 280px;
          padding: 24px;
          border-radius: 12px;
          background: var(--card-background-color, #fff);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        .popup h2 {
          margin: 0 0 8px;
          font-size: 16px;
          color: var(--primary-text-color, #212121);
        }
        .popup p {
          margin: 0 0 16px;
          font-size: 13px;
          color: var(--secondary-text-color, #666);
        }
        .popup-close-btn {
          border: 1px solid var(--divider-color, #e0e0e0);
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
        }
      </style>
      <div class="header">
        <div class="header-left">
          <button class="icon-button" title="Retour à Home Assistant" onclick="history.back()">
            ${this._icon(ICON_ARROW_LEFT, 22)}
          </button>
          <h1>AutomationPlus</h1>
          <a class="version-badge" href="${COMMITS_URL}" target="_blank" rel="noopener noreferrer" title="Voir l'historique des commits sur GitHub">v${DEBUG_VERSION} · ${DEBUG_BUILD_DATE}</a>
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
            <span>Regrouper</span>
            ${this._icon(ICON_CHEVRON_DOWN, 14)}
          </button>
          ${this._renderGroupMenu()}
        </div>
        ${this._renderChips()}
      </div>
      <div class="body">
        <p>Panel connecté — ${entityCount} entités visibles.</p>
      </div>
      <button class="fab" title="Nouvelle automatisation">
        ${this._icon(ICON_PLUS, 24)}
      </button>
      ${this._renderCreatePopup()}
    `;
    this._attachListeners();
  }

  _attachListeners() {
    const root = this.shadowRoot;

    const searchInput = root.querySelector(".search-input");
    if (searchInput) {
      // Pas de re-render au clavier : rien n'affiche encore de liste à
      // filtrer, et un re-render à chaque frappe ferait perdre le focus.
      searchInput.addEventListener("input", (event) => {
        this._filterText = event.target.value;
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

    const dropdownBackdrop = root.querySelector(".dropdown-backdrop");
    if (dropdownBackdrop) {
      dropdownBackdrop.addEventListener("click", () => {
        this._groupMenuOpen = false;
        this._render();
      });
    }

    const fab = root.querySelector(".fab");
    if (fab) {
      fab.addEventListener("click", () => {
        this._createPopupOpen = true;
        this._render();
      });
    }

    const popupBackdrop = root.querySelector(".popup-backdrop");
    if (popupBackdrop) {
      popupBackdrop.addEventListener("click", (event) => {
        if (event.target === popupBackdrop) {
          this._createPopupOpen = false;
          this._render();
        }
      });
    }

    const popupCloseBtn = root.querySelector(".popup-close-btn");
    if (popupCloseBtn) {
      popupCloseBtn.addEventListener("click", () => {
        this._createPopupOpen = false;
        this._render();
      });
    }
  }
}

customElements.define("automation-plus-panel", AutomationPlusPanel);

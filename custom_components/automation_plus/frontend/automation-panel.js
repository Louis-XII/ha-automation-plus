// Panel AutomationPlus — squelette v0.1 (validation du mécanisme panel_custom).
// HA assigne directement les propriétés hass / narrow / panel sur l'élément,
// pas via des attributs HTML — d'où l'usage de set hass(value) plutôt que attributeChangedCallback.

// Infos de debug affichées en haut du panel — pas de pipeline de build pour
// l'instant, donc à tenir à jour manuellement en même temps que manifest.json.
const DEBUG_VERSION = "0.2.0";
const DEBUG_COMMIT = "a2941bc";
const DEBUG_BUILD_DATE = "2026-08-30";

class AutomationPlusPanel extends HTMLElement {
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

  _render() {
    if (!this.shadowRoot) return;
    const entityCount = this._hass ? Object.keys(this._hass.states).length : 0;
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
        }
        h1 { font-size: 1.4em; margin-bottom: 0; }
        .debug {
          font-family: monospace;
          font-size: 0.8em;
          color: var(--secondary-text-color, #666);
          margin: 4px 0 16px;
        }
      </style>
      <h1>AutomationPlus</h1>
      <p class="debug">v${DEBUG_VERSION} · ${DEBUG_COMMIT} · ${DEBUG_BUILD_DATE}</p>
      <p>Panel connecté — ${entityCount} entités visibles.</p>
    `;
  }
}

customElements.define("automation-plus-panel", AutomationPlusPanel);

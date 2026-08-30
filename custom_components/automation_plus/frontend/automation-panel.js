// Panel AutomationPlus — squelette v0.1 (validation du mécanisme panel_custom).
// HA assigne directement les propriétés hass / narrow / panel sur l'élément,
// pas via des attributs HTML — d'où l'usage de set hass(value) plutôt que attributeChangedCallback.
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
        h1 { font-size: 1.4em; }
      </style>
      <h1>AutomationPlus</h1>
      <p>Panel connecté — ${entityCount} entités visibles.</p>
    `;
  }
}

customElements.define("automation-plus-panel", AutomationPlusPanel);

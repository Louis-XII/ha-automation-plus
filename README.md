# AutomationPlus

Panel Home Assistant (via HACS) pour visualiser et gérer les automatisations
directement dans la sidebar de HA.

## Statut

🚧 v0.2.0 — installation via config flow (Paramètres → Appareils et
services → Ajouter une intégration). Panel toujours minimal, aucune gestion
réelle des automatisations pour l'instant.

- v0.1 — squelette minimal validant le mécanisme `panel_custom` depuis une
  custom integration. Activation manuelle via `automation_plus:` dans
  `configuration.yaml`.

## Installation (test)

Voir [`info.md`](./info.md).

## Développement

- `custom_components/automation_plus/` — intégration Python, enregistre le
  panel et sert le fichier JS statique
- `custom_components/automation_plus/frontend/automation-panel.js` — web
  component du panel (vanilla JS pour l'instant, migration Lit envisagée)

## Licence

MIT — voir [`LICENSE`](./LICENSE).

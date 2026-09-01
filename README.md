# AutomationPlus

Panel Home Assistant (via HACS) pour visualiser et gérer les automatisations
directement dans la sidebar de HA.

## Statut

🚧 v0.3.2 — correctifs : bouton flottant "+" repositionné en bas de l'écran
(position fixe au lieu d'absolue, il se calait auparavant sur le bas du
contenu au lieu du viewport), badge version pointant vers les releases
GitHub (au lieu des commits), libellé du bouton "Regrouper" reflétant le
regroupement actif ("Regroupé par catégorie", etc.). Aucune gestion réelle
des automatisations pour l'instant — la liste et l'édition arrivent dans une
prochaine version.

- v0.3.1 — correctif : cache-busting versionné sur l'URL du panel JS pour
  que les navigateurs rechargent bien le fichier à chaque mise à jour (le
  panel restait figé sur l'ancienne version après update HACS).
- v0.3.0 — panel doté d'un header (retour vers HA, badge version, accès
  issues GitHub) et d'une toolbar (recherche, regroupement par catégorie/
  état/label, création d'automatisation).
- v0.2.0 — installation via config flow (Paramètres → Appareils et
  services → Ajouter une intégration).
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

### Preview du panel sans instance HA

`dev/preview.html` charge directement `automation-panel.js` avec un `hass`
factice (variables CSS du thème HA + quelques entités `automation.*` bidon)
pour visualiser et itérer sur le panel sans déployer sur une instance HA
réelle. Nécessite un serveur local (pas de `file://`, sinon page blanche) :

```bash
python3 -m http.server 8642
```

puis ouvrir <http://localhost:8642/dev/preview.html>.

## Licence

MIT — voir [`LICENSE`](./LICENSE).

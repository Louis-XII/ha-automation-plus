# AutomationPlus

Panel Home Assistant (via HACS) pour visualiser et gérer les automatisations
directement dans la sidebar de HA.

## Statut

🚧 v0.5.0 — socle backend du mode « dossier dédié » (un fichier YAML par
automatisation, dans un dossier fixe `automations_plus/` auto-créé — pas de
sélecteur de dossier) : nouvelles routes HTTP pour basculer le mode de
stockage (`/api/automation_plus/settings`) et enregistrer une automatisation
dans ce mode avec rechargement automatique (`/api/automation_plus/automations`).
Pas encore relié à une interface : la page Réglages (bascule de mode,
popups de confirmation déjà designées) et la page Édition (bouton
Enregistrer) restent à construire — ces routes seront alors directement
exploitables.

- v0.4.1 — correctifs : le champ de recherche perdait le focus en cours de
  frappe (le panel se re-rendait entièrement à chaque mise à jour de `hass`,
  très fréquente sur une instance HA active) ; la barre de chips d'étiquettes
  passait sur 2 lignes et cassait la toolbar quand il y en avait beaucoup —
  remplacée par un défilement horizontal (molette, trackpad, glisser) qui
  n'interfère plus avec la navigation du navigateur ; largeur du champ de
  recherche réduite pour laisser plus de place aux chips.
- v0.4.0 — première vraie fonctionnalité de données : le Dashboard affiche
  la liste réelle des automatisations (nom, étiquettes, catégorie, pièce,
  état), branchée sur `hass.states` et les registres Home Assistant (aucun
  backend requis pour cette lecture). Recherche, regroupement (catégorie/
  état/étiquette) et filtres de statut fonctionnels. Le toggle d'état est
  pour l'instant visuel uniquement ; l'édition d'une automatisation n'est
  pas encore disponible.
- v0.3.2 — correctifs : bouton flottant "+" repositionné en bas de l'écran
  (position fixe au lieu d'absolue, il se calait auparavant sur le bas du
  contenu au lieu du viewport), badge version pointant vers les releases
  GitHub (au lieu des commits), libellé du bouton "Regrouper" reflétant le
  regroupement actif ("Regroupé par catégorie", etc.).
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

## Licence

MIT — voir [`LICENSE`](./LICENSE).

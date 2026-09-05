# AutomationPlus

Panel Home Assistant (via HACS) pour visualiser et gérer les automatisations
directement dans la sidebar de HA.

## Présentation

AutomationPlus ajoute un panel dédié dans la sidebar de Home Assistant pour
consulter et piloter ses automatisations sans dépendre de la taille du
fichier `automations.yaml` ni de l'éditeur YAML natif. Recherche, filtres
(étiquette, catégorie, pièce, statut) et activation/désactivation en un
clic depuis une liste claire, plus une page Réglages pour vérifier que la
configuration est cohérente et exporter ses automatisations. Un mode de
stockage alternatif (un fichier par automatisation, dans un dossier dédié)
est en cours de développement pour les configurations volumineuses.

## Statut

🚧 v0.6.4 — correctif de la page blanche persistante depuis la v0.6.0 :
`hass` pouvait être assigné au panel avant son insertion dans le DOM par
Home Assistant, provoquant une exception JS qui empêchait l'affichage.
Historique détaillé des versions : voir la
[page Releases](https://github.com/Louis-XII/ha-automation-plus/releases).

## Installation (test)

Voir [`info.md`](./info.md).

## Développement

- `custom_components/automation_plus/` — intégration Python, enregistre le
  panel et sert le fichier JS statique
- `custom_components/automation_plus/frontend/automation-panel.js` — web
  component du panel (vanilla JS pour l'instant, migration Lit envisagée)

## Licence

MIT — voir [`LICENSE`](./LICENSE).

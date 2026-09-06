![AutomationPlus](./images/logo.png)

[![Version](https://img.shields.io/github/v/release/Louis-XII/ha-automation-plus?label=version&color=4f8eff)](https://github.com/Louis-XII/ha-automation-plus/releases/latest)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories/)
[![License: GPL-3.0](https://img.shields.io/github/license/Louis-XII/ha-automation-plus)](LICENSE)
[![Issues ouvertes](https://img.shields.io/github/issues/Louis-XII/ha-automation-plus)](https://github.com/Louis-XII/ha-automation-plus/issues)
[![Dernier commit](https://img.shields.io/github/last-commit/Louis-XII/ha-automation-plus)](https://github.com/Louis-XII/ha-automation-plus/commits/main)
[![Installations HA](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fanalytics.home-assistant.io%2Fcustom_integrations.json&label=installs%20HA&query=%24.automation_plus.total)](https://analytics.home-assistant.io/)

Panel Home Assistant (via HACS) pour visualiser et gérer les automatisations.

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

🚧 v0.6.9 — nettoyage technique mineur : réponses d'erreur plus propres sur
requête malformée, bouton « Signaler un bug » plus robuste, petites
corrections internes sans impact fonctionnel majeur.
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

GPL-3.0 — voir [`LICENSE`](./LICENSE).

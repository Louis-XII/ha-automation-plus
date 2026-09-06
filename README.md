![AutomationPlus](./images/logo.png)

[![Version](https://img.shields.io/github/v/release/Louis-XII/ha-automation-plus?label=version&color=4f8eff&logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/releases/latest)
[![Date de release](https://img.shields.io/github/release-date/Louis-XII/ha-automation-plus?logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/releases/latest)
[![License: GPL-3.0](https://img.shields.io/github/license/Louis-XII/ha-automation-plus?logo=github&logoColor=9a9a9a)](LICENSE)
<br/>
[![Validate for HACS](https://img.shields.io/github/actions/workflow/status/Louis-XII/ha-automation-plus/hacs.yml?branch=main&label=Validate%20for%20HACS&logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/actions/workflows/hacs.yml)
[![Validate with hassfest](https://img.shields.io/github/actions/workflow/status/Louis-XII/ha-automation-plus/hassfest.yml?branch=main&label=Validate%20with%20hassfest&logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/actions/workflows/hassfest.yml)
<br/>
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?logo=home-assistant&logoColor=9a9a9a)](https://hacs.xyz/docs/faq/custom_repositories/)
[![Home Assistant minimum](https://img.shields.io/badge/Home%20Assistant-2024.1.0%2B-41BDF5?logo=home-assistant&logoColor=9a9a9a)](https://www.home-assistant.io/)
<br/>
[![Dernier commit](https://img.shields.io/github/last-commit/Louis-XII/ha-automation-plus?logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/commits/main)
[![Issues ouvertes](https://img.shields.io/github/issues/Louis-XII/ha-automation-plus?logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/issues)
[![Issues fermées](https://img.shields.io/github/issues-closed/Louis-XII/ha-automation-plus?logo=github&logoColor=9a9a9a)](https://github.com/Louis-XII/ha-automation-plus/issues?q=is%3Aissue+is%3Aclosed)
<br/>
[![Installations HA](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fanalytics.home-assistant.io%2Fcustom_integrations.json&label=installs%20HA&query=%24.automation_plus.total&logo=home-assistant&logoColor=9a9a9a)](https://analytics.home-assistant.io/)
[![GitHub Stars](https://img.shields.io/github/stars/Louis-XII/ha-automation-plus)](https://github.com/Louis-XII/ha-automation-plus/stargazers)

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

🚧 v0.6.12-beta.2 — pre-release en test : 8 correctifs (dépendances manifest,
faux positif de vérification YAML, robustesse XSS d'une chip étiquette, menu
Options borné sur petit viewport, mode de stockage, popup Détail) + mention
de licence oubliée corrigée. Historique détaillé des versions : voir la
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

# CLAUDE.md

Ce fichier guide Claude Code sur ce dépôt. Il est public (repo GitHub public
pour permettre l'installation via HACS) — rester générique, ne jamais y
référencer de détails d'installation domotique personnelle (entités, noms de
pièces, tokens, IP).

## Nature du projet

`AutomationPlus` — intégration Home Assistant custom (HACS, catégorie
Integration) qui enregistre un panel dans la sidebar HA pour visualiser et
gérer les automatisations sans dépendre de la taille de `automations.yaml`.

- `domain` HA : `automation_plus`
- Nom d'affichage : `AutomationPlus`

## Architecture

- `custom_components/automation_plus/` — intégration Python
  - `__init__.py` — enregistre le fichier statique du panel et l'ajoute à la
    sidebar via `async_register_panel` (module `homeassistant.components.panel_custom`)
  - `manifest.json` — métadonnées HA (domain, version, requirements)
  - `const.py` — constantes (domain, url panel, titre, icône)
  - `frontend/automation-panel.js` — web component du panel (custom element
    vanilla JS ; propriétés `hass`/`narrow`/`panel` assignées directement par
    le frontend HA, pas via attributs HTML)
- `hacs.json` / `info.md` — métadonnées et page d'installation HACS
- Le repo entier est visible publiquement mais **seul**
  `custom_components/automation_plus/` est copié chez les utilisateurs par
  HACS — tout le reste (README, CLAUDE.md, doc de suivi) reste sur GitHub sans
  jamais atteindre leur instance HA

## État d'avancement

v0.1 — squelette minimal validant le mécanisme `panel_custom` (panel vide
affichant le nombre d'entités). Aucune gestion réelle des automatisations pour
l'instant (pas d'appel à `/api/config/automation/config/<id>`, pas de liste,
pas d'édition).

## Suivi de projet (`claude-integration/`)

Dossier **local, gitignoré** (le repo est public pour permettre l'installation
HACS — voir avertissement en tête de fichier) qui centralise toute la doc de
suivi, sur le modèle du dépôt `domotique` :

- `claude-integration/CHANGELOG.md` — table `ID | Date | Fichier(s) | Type |
  Description`, nouvel ID = dernier ID + 1, inséré en haut du tableau juste
  après l'en-tête. Après toute modification, création ou suppression
  substantielle (fichier Python, panel JS, structure HACS, doc…), y ajouter
  une ligne — sans attendre que l'utilisateur le demande.
- D'autres fichiers `.md` (idées d'évolution, synthèse d'état…) peuvent y être
  ajoutés au besoin, toujours dans ce dossier plutôt qu'à la racine.

## Conventions

- Commits en Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- Ne jamais committer de secrets (tokens HA, IP, identifiants) — voir
  `.gitignore`
- Toute logique de gestion des automatisations passe par l'API HA
  (REST `/api/config/automation/config/<id>` + WebSocket pour l'état live),
  jamais par une lecture/écriture directe de `automations.yaml`

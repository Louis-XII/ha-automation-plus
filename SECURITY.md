# Politique de sécurité

## Versions supportées

AutomationPlus suit un développement continu sur une seule ligne de version :
seule la **dernière release publiée** (voir [Releases](https://github.com/Louis-XII/ha-automation-plus/releases))
reçoit des correctifs de sécurité. Aucune version antérieure n'est maintenue
en parallèle.

## Signaler une vulnérabilité

**Ne pas ouvrir d'issue publique** pour un problème de sécurité — merci
d'utiliser le signalement privé de GitHub :

👉 [Report a vulnerability](https://github.com/Louis-XII/ha-automation-plus/security/advisories/new)

Cela couvre par exemple :
- Contournement de la protection anti-traversée de chemin (`resolve_safe_path`,
  `UnsafePathError`) permettant de lire/écrire hors de `/config`
- Injection HTML/CSS/JS dans le panel (XSS) via une valeur venant d'un
  registre HA (étiquette, pièce, catégorie, nom d'automatisation)
- Accès à une route HTTP de l'intégration (`/api/automation_plus/...`) sans
  les droits admin requis (`requires_admin`)
- Toute fuite de secret (token, contenu de `!secret`) via une réponse de
  l'intégration

Pour un bug sans impact sécurité (comportement incorrect, régression
visuelle, faux positif...), utiliser le
[suivi d'issues normal](https://github.com/Louis-XII/ha-automation-plus/issues/new/choose)
à la place.

## Ce à quoi s'attendre

Ce projet est maintenu par une seule personne, sur son temps libre — pas de
SLA formel, mais tout signalement de vulnérabilité sera lu et traité en
priorité sur le reste du backlog. Un correctif donne lieu à une nouvelle
release et, si pertinent, à une
[GitHub Security Advisory](https://github.com/Louis-XII/ha-automation-plus/security/advisories)
publique une fois le correctif disponible.

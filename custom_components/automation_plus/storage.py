"""Accès disque du mode « dossier dédié ».

Dérogation ciblée à la règle générale du projet (jamais de lecture/écriture
directe de fichiers YAML HA) — voir claude-integration/ARCHITECTURE.md §1 et
la mémoire Claude project_dual_storage_architecture. Toutes les fonctions
d'I/O ici sont synchrones et bloquantes par conception : à n'appeler que via
hass.async_add_executor_job depuis http.py, jamais directement depuis une
coroutine.
"""

from __future__ import annotations

import re
import time

import yaml

from pathlib import Path

# Nom de dossier/fichier : lettres, chiffres, tiret, underscore uniquement —
# bloque tout séparateur de chemin (/, \, ..) dès la validation du nom.
_SAFE_NAME_RE = re.compile(r"^[A-Za-z0-9_-]+$")


class UnsafePathError(ValueError):
    """Le chemin demandé sort de /config ou le nom fourni n'est pas sûr."""


def resolve_safe_path(config_dir: Path, relative: str) -> Path:
    """Résout `relative` sous `config_dir`, refuse toute sortie de ce dossier."""
    config_dir = config_dir.resolve()
    target = (config_dir / relative).resolve()
    if target != config_dir and config_dir not in target.parents:
        raise UnsafePathError(f"Chemin hors de /config : {relative!r}")
    return target


def ensure_folder(config_dir: Path, relative: str) -> Path:
    """Crée `relative` sous /config s'il n'existe pas déjà (dossier fixe du mode dossier dédié)."""
    target = resolve_safe_path(config_dir, relative)
    target.mkdir(parents=True, exist_ok=True)
    return target


def generate_automation_id() -> str:
    """Même convention que l'éditeur natif HA : timestamp ms en chaîne."""
    return str(int(time.time() * 1000))


def write_automation_file(config_dir: Path, folder_relative: str, automation_id: str, config: dict) -> str:
    """Écrit <folder>/<automation_id>.yaml — une liste à un élément (include_dir_merge_list)."""
    if not _SAFE_NAME_RE.match(automation_id):
        raise UnsafePathError(f"Identifiant d'automatisation invalide : {automation_id!r}")
    folder = resolve_safe_path(config_dir, folder_relative)
    if not folder.is_dir():
        raise UnsafePathError(f"Dossier introuvable : {folder_relative!r}")
    file_path = folder / f"{automation_id}.yaml"
    payload = {**config, "id": automation_id}
    with file_path.open("w", encoding="utf-8") as handle:
        yaml.safe_dump([payload], handle, allow_unicode=True, sort_keys=False)
    return str(file_path.relative_to(config_dir.resolve()))

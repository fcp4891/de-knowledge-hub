"""Repositorio de conocimiento sobre PostgreSQL (A-F2.3, ADR-005).

Mantiene en memoria el ContentIndex leído de la base y lo sirve con la proyección (backend/app/
projection.py), así la API devuelve la misma forma que los mocks. Solo recarga cuando cambia la
huella de content_files (número de archivos y última compilación): una consulta barata por petición.
"""

from __future__ import annotations

import threading
from pathlib import Path

from sqlalchemy import Engine, func, select

from backend.app.projection import ContentIndex
from backend.db import schema as t
from backend.db.reader import load_index_from_db

Fingerprint = tuple[int, object]


class KnowledgeRepository:
    def __init__(self, engine: Engine, schemas_dir: Path) -> None:
        self.engine = engine
        self.schemas_dir = schemas_dir
        self._lock = threading.Lock()
        self._fingerprint: Fingerprint | None = None
        self._index: ContentIndex | None = None

    def fingerprint(self) -> Fingerprint:
        with self.engine.connect() as conn:
            row = conn.execute(select(func.count(), func.max(t.content_files.c.compiled_at))).one()
        return int(row[0]), row[1]

    def index(self) -> ContentIndex:
        current = self.fingerprint()
        with self._lock:
            if self._index is None or current != self._fingerprint:
                self._index = load_index_from_db(self.engine, self.schemas_dir)
                self._fingerprint = current
            return self._index

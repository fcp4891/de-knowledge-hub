"""Tests del compilador content/ → PostgreSQL (A-F2.2) contra un PostgreSQL real.

Cada test usa una base temporal creada y migrada con Alembic, y una copia de content/.
Requieren PostgreSQL (make db-up o el servicio de la CI). Sin base disponible se omiten con
un motivo explícito; la tarea no se da por cerrada con estos tests omitidos.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import Engine, select, text

from backend.db import schema as t
from backend.db.compiler import CompileError, compile_content
from backend.db.reader import load_index_from_db
from scripts.contracts import build_mocks

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
SNAPSHOT_EXCLUDED = {("content_files", "compiled_at"), ("edges", "id")}


def snapshot(engine: Engine) -> dict[str, list[tuple[Any, ...]]]:
    """Contenido de todas las tablas, sin columnas volátiles, en orden estable."""
    result = {}
    with engine.connect() as conn:
        for table in t.metadata.sorted_tables:
            columns = [c for c in table.columns if (table.name, c.name) not in SNAPSHOT_EXCLUDED]
            rows = conn.execute(select(*columns)).all()
            result[table.name] = sorted((tuple(r) for r in rows), key=repr)
    return result


def count(engine: Engine, table: str, where: str = "true") -> int:
    with engine.connect() as conn:
        return int(conn.execute(text(f"select count(*) from {table} where {where}")).scalar_one())


# --- Migración ---------------------------------------------------------------


def test_migration_matches_schema(engine: Engine) -> None:
    with engine.connect() as conn:
        assert compare_metadata(MigrationContext.configure(conn), t.metadata) == []


# --- Idempotencia ------------------------------------------------------------


def test_compile_twice_changes_nothing(engine: Engine, content: Path) -> None:
    first = compile_content(engine, content, SCHEMAS)
    before = snapshot(engine)
    second = compile_content(engine, content, SCHEMAS)
    assert first.added and not second.changed and second.unchanged == len(first.added)
    assert snapshot(engine) == before


def test_full_recompile_produces_same_data(engine: Engine, content: Path) -> None:
    compile_content(engine, content, SCHEMAS)
    before = snapshot(engine)
    stats = compile_content(engine, content, SCHEMAS, full=True)
    assert stats.updated and not stats.added and not stats.deleted
    assert snapshot(engine) == before


def test_only_changed_file_is_recompiled(engine: Engine, content: Path) -> None:
    first = compile_content(engine, content, SCHEMAS)
    page = content / "concepts" / "change-data-capture.md"
    page.write_text(page.read_text(encoding="utf-8") + "\n- 2026-09-30: nota de prueba.\n", encoding="utf-8")
    stats = compile_content(engine, content, SCHEMAS)
    assert stats.updated == ["concepts/change-data-capture.md"] and not stats.added and not stats.deleted
    assert stats.unchanged == len(first.added) - 1
    with engine.connect() as conn:
        body = conn.execute(select(t.entities.c.body_markdown).where(t.entities.c.slug == "change-data-capture")).scalar_one()
    assert "nota de prueba" in body


# --- Borrado -----------------------------------------------------------------

# Ficha temporal de un concepto del blueprint que no tiene ficha: ninguna otra entidad puede relacionarse con él
# (una relación a un slug sin ficha es inválida), así que borrarla no rompe referencias.
EXTRA_PAGE = """---
id: concept:data-platform-engineering
slug: data-platform-engineering
type: concept
stub: true
title: Plataforma de datos como producto
description: Ficha de prueba del compilador.
domain: modern-data-engineering
subdomain: modern-practices
classification: core
level: basic
importance: high
relations:
  - type: RELATED_TO
    target: change-data-capture
created_at: 2026-09-30
updated_at: 2026-09-30
last_verified: 2026-09-30
verification_status: review_required
---

## 1. Resumen

Prueba.
"""


def test_deleted_page_is_removed_with_its_edges(engine: Engine, content: Path) -> None:
    page = content / "concepts" / "data-platform-engineering.md"
    page.write_text(EXTRA_PAGE, encoding="utf-8")
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "entities", "slug = 'data-platform-engineering'") == 1
    assert count(engine, "concept_pages", "slug = 'data-platform-engineering'") == 1
    assert count(engine, "edges", "source_slug = 'data-platform-engineering' and origin = 'entity'") == 1

    page.unlink()
    stats = compile_content(engine, content, SCHEMAS)
    assert stats.deleted == ["concepts/data-platform-engineering.md"]
    assert count(engine, "entities", "slug = 'data-platform-engineering'") == 0
    assert count(engine, "concept_pages", "slug = 'data-platform-engineering'") == 0
    assert count(engine, "edges", "(source_slug = 'data-platform-engineering' or target_slug = 'data-platform-engineering') and origin = 'entity'") == 0
    # El concepto sigue en el blueprint: sus aristas de origen blueprint se mantienen.
    assert count(engine, "concepts", "slug = 'data-platform-engineering'") == 1


def test_deleted_technology_removes_typed_rows_sources_and_edges(engine: Engine, content: Path) -> None:
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "technologies", "slug = 'pgvector'") == 1
    assert count(engine, "edges", "source_slug = 'pgvector'") > 0
    # pgvector no es referenciado por otras entidades ni por el blueprint salvo como related_technologies.
    # (Antes se usaba dagster, que desde el lote F3b-06a cita orchestration-landscape y la fuente dagster-docs.)
    blueprint = content / "blueprint" / "21-ai-for-data-engineering.yaml"
    blueprint.write_text(blueprint.read_text(encoding="utf-8").replace("        related_technologies: [pgvector]\n", ""), encoding="utf-8")
    (content / "technologies" / "pgvector.yaml").unlink()
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "entities", "slug = 'pgvector'") == 0
    assert count(engine, "technologies", "slug = 'pgvector'") == 0
    assert count(engine, "edges", "source_slug = 'pgvector' or target_slug = 'pgvector'") == 0


def test_slug_moved_between_files(engine: Engine, content: Path) -> None:
    compile_content(engine, content, SCHEMAS)
    (content / "technologies" / "debezium.yaml").rename(content / "technologies" / "cdc-debezium.yaml")
    stats = compile_content(engine, content, SCHEMAS)
    assert stats.added == ["technologies/cdc-debezium.yaml"] and stats.deleted == ["technologies/debezium.yaml"]
    with engine.connect() as conn:
        path = conn.execute(select(t.entities.c.file_path).where(t.entities.c.slug == "debezium")).scalar_one()
    assert path == "technologies/cdc-debezium.yaml"


# --- Validación previa -------------------------------------------------------


def test_invalid_content_aborts_without_changes(engine: Engine, content: Path) -> None:
    compile_content(engine, content, SCHEMAS)
    before = snapshot(engine)
    broken = content / "technologies" / "gcp-bigquery.yaml"
    broken.write_text(broken.read_text(encoding="utf-8").replace("category: data-warehouse", "category: warehouse"), encoding="utf-8")
    with pytest.raises(CompileError, match="warehouse"):
        compile_content(engine, content, SCHEMAS)
    assert snapshot(engine) == before


# --- Equivalencia con el contrato --------------------------------------------


def test_projection_from_db_matches_committed_mocks(engine: Engine, tmp_path: Path) -> None:
    compile_content(engine, ROOT / "content", SCHEMAS)
    out = tmp_path / "mock-data"
    build_mocks.build(out, index=load_index_from_db(engine, SCHEMAS))
    committed = ROOT / "docs" / "contracts" / "mock-data"
    generated = {f.relative_to(out).as_posix(): f.read_bytes() for f in out.rglob("*.json")}
    expected = {f.relative_to(committed).as_posix(): f.read_bytes() for f in committed.rglob("*.json")}
    assert generated == expected

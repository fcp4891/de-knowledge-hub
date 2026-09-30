"""Tests del compilador content/ → PostgreSQL (A-F2.2) contra un PostgreSQL real.

Cada test usa una base temporal creada y migrada con Alembic, y una copia de content/.
Requieren PostgreSQL (make db-up o el servicio de la CI). Sin base disponible se omiten con
un motivo explícito; la tarea no se da por cerrada con estos tests omitidos.
"""

from __future__ import annotations

import shutil
import uuid
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import Engine, create_engine, make_url, select, text

from backend.db import schema as t
from backend.db.compiler import CompileError, compile_content
from backend.db.config import database_url
from backend.db.reader import load_index_from_db
from scripts.contracts import build_mocks

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
SNAPSHOT_EXCLUDED = {("content_files", "compiled_at"), ("edges", "id")}


def admin_engine() -> Engine:
    url = make_url(database_url()).set(database="postgres")
    return create_engine(url, isolation_level="AUTOCOMMIT")


@pytest.fixture
def engine() -> Iterator[Engine]:
    admin = admin_engine()
    try:
        with admin.connect() as conn:
            conn.execute(text("select 1"))
    except Exception as exc:  # noqa: BLE001 - cualquier fallo de conexión implica omitir
        pytest.skip(f"PostgreSQL no disponible ({database_url()}): {exc.__class__.__name__}")
    name = f"dekh_test_{uuid.uuid4().hex[:10]}"
    with admin.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{name}"'))
    url = make_url(database_url()).set(database=name)
    config = Config(str(ROOT / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", url.render_as_string(hide_password=False))
    command.upgrade(config, "head")
    engine = create_engine(url)
    yield engine
    engine.dispose()
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE "{name}" WITH (FORCE)'))
    admin.dispose()


@pytest.fixture
def content(tmp_path: Path) -> Path:
    copy = tmp_path / "content"
    shutil.copytree(ROOT / "content", copy)
    return copy


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

EXTRA_PAGE = """---
id: concept:etl-vs-elt
slug: etl-vs-elt
type: concept
title: ETL vs ELT
description: Ficha de prueba del compilador.
domain: fundamentals
subdomain: processing-paradigms
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
    page = content / "concepts" / "etl-vs-elt.md"
    page.write_text(EXTRA_PAGE, encoding="utf-8")
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "entities", "slug = 'etl-vs-elt'") == 1
    assert count(engine, "concept_pages", "slug = 'etl-vs-elt'") == 1
    assert count(engine, "edges", "source_slug = 'etl-vs-elt' and origin = 'entity'") == 1

    page.unlink()
    stats = compile_content(engine, content, SCHEMAS)
    assert stats.deleted == ["concepts/etl-vs-elt.md"]
    assert count(engine, "entities", "slug = 'etl-vs-elt'") == 0
    assert count(engine, "concept_pages", "slug = 'etl-vs-elt'") == 0
    assert count(engine, "edges", "(source_slug = 'etl-vs-elt' or target_slug = 'etl-vs-elt') and origin = 'entity'") == 0
    # El concepto sigue en el blueprint: sus aristas de origen blueprint se mantienen.
    assert count(engine, "concepts", "slug = 'etl-vs-elt'") == 1


def test_deleted_technology_removes_typed_rows_sources_and_edges(engine: Engine, content: Path) -> None:
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "technologies", "slug = 'dagster'") == 1
    assert count(engine, "edges", "source_slug = 'dagster'") > 0
    # dagster no es referenciado por otras entidades ni por el blueprint salvo como related_technologies.
    blueprint = content / "blueprint" / "06-orchestration.yaml"
    blueprint.write_text(blueprint.read_text(encoding="utf-8").replace(", dagster, prefect]", ", prefect]"), encoding="utf-8")
    (content / "technologies" / "dagster.yaml").unlink()
    compile_content(engine, content, SCHEMAS)
    assert count(engine, "entities", "slug = 'dagster'") == 0
    assert count(engine, "technologies", "slug = 'dagster'") == 0
    assert count(engine, "edges", "source_slug = 'dagster' or target_slug = 'dagster'") == 0


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

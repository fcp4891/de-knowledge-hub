"""Fixtures compartidos: PostgreSQL temporal migrado y copia de content/; selección por fichas cambiadas.

Los tests de base de datos requieren PostgreSQL (make db-up o el servicio de la CI). Sin base
disponible se omiten con un motivo explícito; una tarea no se cierra con esos tests omitidos.

Con DEKH_TEST_SCOPE=content (plan de scripts/ci/plan.py) corren los módulos de datos y, de los módulos de
snippets, solo los tests que nombran una ficha de DEKH_CHANGED_SLUGS (o que no nombran ninguna ficha).
"""

from __future__ import annotations

import inspect
import os
import re
import shutil
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import Any

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, create_engine, make_url, text

from backend.db.config import database_url

ROOT = Path(__file__).resolve().parent.parent


def admin_engine() -> Engine:
    url = make_url(database_url()).set(database="postgres")
    return create_engine(url, isolation_level="AUTOCOMMIT")


@contextmanager
def temporary_database() -> Iterator[Engine]:
    """Base nueva migrada con Alembic; se borra al salir. Omite el test si no hay PostgreSQL."""
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
    try:
        yield engine
    finally:
        engine.dispose()
        with admin.connect() as conn:
            conn.execute(text(f'DROP DATABASE "{name}" WITH (FORCE)'))
        admin.dispose()


@pytest.fixture
def engine() -> Iterator[Engine]:
    with temporary_database() as db:
        yield db


@pytest.fixture
def content(tmp_path: Path) -> Path:
    copy = tmp_path / "content"
    shutil.copytree(ROOT / "content", copy)
    return copy


# --- Selección por fichas cambiadas (CLAUDE.md, «Eficiencia») ------------------

DATA_MODULES = {
    "test_validate", "test_validate_legal", "test_validate_part_of", "test_compiler", "test_contract", "test_api",
    "test_static_data", "test_page_sections", "test_diagrams", "test_sources", "test_blueprint", "test_matrix",
    "test_generators", "test_legal_framework_sync", "test_snippets", "test_airflow_dag_checks",
}
SNIPPET_MODULES = re.compile(r"^test_(\w+_snippets|snippet_code|terraform_local)$")
STRING = re.compile(r"[\"']([^\"'\n]{1,120})[\"']")


def all_slugs() -> set[str]:
    """Fichas con código ejecutable: las páginas Markdown de content/ (no tecnologías ni estructura)."""
    return {p.stem for p in (ROOT / "content").rglob("*.md") if not p.name.startswith("_")}


def reachable(function: Any, seen: set[str] | None = None) -> tuple[list[str], list[Any]]:
    """Código de la función y de los helpers del mismo módulo que usa, y las constantes globales que leen."""
    seen = set() if seen is None else seen
    sources, constants = [inspect.getsource(function)], []
    for name in function.__code__.co_names:
        if name in seen:
            continue
        seen.add(name)
        value = function.__globals__.get(name)
        if inspect.isfunction(value) and value.__module__ == function.__module__:
            more_sources, more_constants = reachable(value, seen)
            sources += more_sources
            constants += more_constants
        elif isinstance(value, (str, dict, list, tuple, set, frozenset)):
            constants.append(value)
    return sources, constants


def constant_strings(value: Any, literals: set[str]) -> set[str]:
    if isinstance(value, str):
        return {value}
    if isinstance(value, dict):   # un dict de nombres a fichas: solo las claves que el test usa, si usa alguna
        keys = [k for k in value if k in literals] or list(value)
        return {v for k in keys for v in constant_strings(value[k], literals)} | {str(k) for k in keys}
    return {x for v in value for x in constant_strings(v, literals)}


def named_slugs(item: pytest.Item, known: set[str]) -> set[str]:
    """Fichas que nombra el test: su parámetro, o los literales y constantes de su código y sus helpers."""
    params = {str(v) for v in getattr(getattr(item, "callspec", None), "params", {}).values()} & known
    if params:
        return params
    function = getattr(item, "function", None)
    if function is None:
        return set()
    sources, constants = reachable(function)
    literals = {m for src in sources for m in STRING.findall(src)}
    strings = literals | {x for c in constants for x in constant_strings(c, literals)}
    return {Path(x).stem if x.endswith(".md") else x for x in strings} & known


def keep(item: pytest.Item, changed: set[str], known: set[str]) -> bool:
    module = item.path.stem
    if module in DATA_MODULES:
        return True
    if not SNIPPET_MODULES.match(module):
        return False
    named = named_slugs(item, known)
    return not named or bool(named & changed)


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    if os.environ.get("DEKH_TEST_SCOPE") != "content":
        return
    changed = {s for s in os.environ.get("DEKH_CHANGED_SLUGS", "").split(",") if s}
    known = all_slugs()
    selected = [i for i in items if keep(i, changed, known)]
    deselected = [i for i in items if i not in selected]
    if deselected:
        config.hook.pytest_deselected(items=deselected)
        items[:] = selected

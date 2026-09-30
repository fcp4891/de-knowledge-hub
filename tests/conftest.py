"""Fixtures compartidos: PostgreSQL temporal migrado y copia de content/.

Los tests de base de datos requieren PostgreSQL (make db-up o el servicio de la CI). Sin base
disponible se omiten con un motivo explícito; una tarea no se cierra con esos tests omitidos.
"""

from __future__ import annotations

import shutil
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

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

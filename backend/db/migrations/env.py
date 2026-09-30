"""Entorno de Alembic: toma la URL de config o de DATABASE_URL."""

from __future__ import annotations

from alembic import context
from sqlalchemy import create_engine

from backend.db.config import database_url
from backend.db.schema import metadata

config = context.config
target_metadata = metadata


def url() -> str:
    return config.get_main_option("sqlalchemy.url") or database_url()


def run_offline() -> None:
    context.configure(url=url(), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_online() -> None:
    connection = config.attributes.get("connection")
    if connection is not None:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
        return
    engine = create_engine(url())
    try:
        with engine.connect() as conn:
            context.configure(connection=conn, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()
    finally:
        engine.dispose()  # sin esto, el pool deja la conexión abierta (ResourceWarning)


if context.is_offline_mode():
    run_offline()
else:
    run_online()

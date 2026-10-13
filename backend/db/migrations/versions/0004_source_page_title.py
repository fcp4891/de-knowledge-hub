"""Título de la página citada en entity_sources (ADR-012).

Columna derivada de content/ como las demás de entity_sources: COMPILER_VERSION "4" hace que la
siguiente compilación la rellene.

Revision ID: 0004
Revises: 0003
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("entity_sources", sa.Column("page_title", sa.Text()))


def downgrade() -> None:
    op.drop_column("entity_sources", "page_title")

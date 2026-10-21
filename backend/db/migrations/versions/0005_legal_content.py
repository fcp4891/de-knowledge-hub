"""Contenido con origen legal (ADR-023): jurisdicción y aprobación del dueño en entities, y entity_legal_basis.

Columnas derivadas de content/ como las demás: COMPILER_VERSION "5" hace que la siguiente compilación
las rellene.

Revision ID: 0005
Revises: 0004
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("entities", sa.Column("jurisdiction", sa.ARRAY(sa.String(2)), nullable=False, server_default="{}", comment="ADR-023."))
    op.add_column("entities", sa.Column("owner_approved_at", sa.Date(), comment="ADR-023: aprobación explícita del dueño."))
    op.create_table(
        "entity_legal_basis",
        sa.Column("entity_slug", sa.String(100), sa.ForeignKey("entities.slug", ondelete="CASCADE"), primary_key=True),
        sa.Column("position", sa.Integer(), primary_key=True),
        sa.Column("law", sa.String(20), nullable=False),
        sa.Column("article", sa.String(30), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("note", sa.Text()),
    )


def downgrade() -> None:
    op.drop_table("entity_legal_basis")
    op.drop_column("entities", "owner_approved_at")
    op.drop_column("entities", "jurisdiction")

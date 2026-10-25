"""Implicancia técnica por artículo (enmienda de ADR-023): entity_legal_basis.implication.

Columna derivada de content/ como las demás: COMPILER_VERSION "6" hace que la siguiente compilación
la rellene.

Revision ID: 0006
Revises: 0005
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("entity_legal_basis", sa.Column("implication", sa.Text(), comment="Enmienda de ADR-023."))


def downgrade() -> None:
    op.drop_column("entity_legal_basis", "implication")

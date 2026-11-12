"""ADR-031: tabla ui_texts con los textos de la UI que vienen de content/ui/ (disponibilidad por ficha).

Datos derivados de content/ como los demás: COMPILER_VERSION "8" hace que la siguiente compilación la rellene.

Revision ID: 0008
Revises: 0007
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ui_texts",
        sa.Column("key", sa.String(100), primary_key=True, comment="Nombre del archivo de content/ui/ sin extensión."),
        sa.Column("data", JSONB(), nullable=False),
        sa.Column("file_path", sa.Text(), sa.ForeignKey("content_files.path", ondelete="CASCADE"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ui_texts")

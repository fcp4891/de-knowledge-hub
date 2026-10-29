"""Dominio 24 (ADR-027): banda y marco legal en domains, y la tabla legal_frameworks.

Columnas derivadas de content/ como las demás: COMPILER_VERSION "7" hace que la siguiente compilación
las rellene.

Revision ID: 0007
Revises: 0006
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("domains", sa.Column("band", sa.String(30), comment="ADR-027: banda fuera de las 6 capas (especializacion)."))
    op.add_column("domains", sa.Column("legal_framework", sa.String(100), comment="ADR-027: slug de legal_frameworks."))
    op.create_table(
        "legal_frameworks",
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("data", JSONB(), nullable=False, comment="ADR-027: documento completo, con URL N1 y verified_at por hecho."),
        sa.Column("file_path", sa.Text(), sa.ForeignKey("content_files.path", ondelete="CASCADE"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("legal_frameworks")
    op.drop_column("domains", "legal_framework")
    op.drop_column("domains", "band")

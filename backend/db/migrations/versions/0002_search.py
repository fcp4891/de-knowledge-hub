"""Búsqueda de texto completo en español e inglés (A-F2.3, ADR-005).

Revision ID: 0002
Revises: 0001
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import TSVECTOR

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

TEXT_CONFIGS = {"es_unaccent": ("spanish", "spanish_stem"), "en_unaccent": ("english", "english_stem")}


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")
    for name, (base, stemmer) in TEXT_CONFIGS.items():
        op.execute(f"CREATE TEXT SEARCH CONFIGURATION {name} (COPY = {base})")
        op.execute(f"ALTER TEXT SEARCH CONFIGURATION {name} ALTER MAPPING FOR hword, hword_part, word WITH unaccent, {stemmer}")
    op.create_table(
        "search_documents",
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("origin", sa.String(10), primary_key=True, comment="blueprint | entity"),
        sa.Column("type", sa.String(30), nullable=False, comment="ResultType del contrato"),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("domain", sa.String(100)),
        sa.Column("classification", sa.String(20)),
        sa.Column("snippet", sa.Text(), nullable=False),
        sa.Column("tsv_es", TSVECTOR(), nullable=False, comment="Config es_unaccent: título A, tags B, resumen C, cuerpo D."),
        sa.Column("tsv_en", TSVECTOR(), nullable=False, comment="Config en_unaccent, mismos pesos."),
        sa.Column("file_path", sa.Text(), sa.ForeignKey("content_files.path", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_search_documents_tsv_es", "search_documents", ["tsv_es"], postgresql_using="gin")
    op.create_index("ix_search_documents_tsv_en", "search_documents", ["tsv_en"], postgresql_using="gin")


def downgrade() -> None:
    op.drop_table("search_documents")
    for name in TEXT_CONFIGS:
        op.execute(f"DROP TEXT SEARCH CONFIGURATION {name}")

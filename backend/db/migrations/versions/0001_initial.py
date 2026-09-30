"""Esquema inicial derivado de content/ (A-F2.2).

Revision ID: 0001
Revises:
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def file_fk() -> sa.Column:
    return sa.Column("file_path", sa.Text(), sa.ForeignKey("content_files.path", ondelete="CASCADE"), nullable=False)


def entity_fk() -> sa.Column:
    return sa.Column("slug", sa.String(100), sa.ForeignKey("entities.slug", ondelete="CASCADE"), primary_key=True)


def upgrade() -> None:
    op.create_table(
        "content_files",
        sa.Column("path", sa.Text(), primary_key=True, comment="Ruta relativa a content/, formato POSIX."),
        sa.Column("sha256", sa.String(64), nullable=False),
        sa.Column("compiler_version", sa.String(20), nullable=False),
        sa.Column("compiled_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "entities",
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("id", sa.String(120), nullable=False, unique=True),
        sa.Column("type", sa.String(30), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("domain", sa.String(100)),
        sa.Column("subdomain", sa.String(100)),
        sa.Column("classification", sa.String(20)),
        sa.Column("level", sa.String(20)),
        sa.Column("verification_status", sa.String(30), nullable=False),
        sa.Column("last_verified", sa.Date()),
        sa.Column("created_at", sa.Date(), nullable=False),
        sa.Column("updated_at", sa.Date(), nullable=False),
        sa.Column("stub", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("data", JSONB(), nullable=False, comment="Frontmatter completo normalizado."),
        sa.Column("body_markdown", sa.Text(), comment="Cuerpo Markdown; NULL si la entidad viene de un YAML."),
        sa.Column("position", sa.Integer(), nullable=False, comment="Índice del documento dentro del archivo."),
        file_fk(),
    )
    op.create_index("ix_entities_type", "entities", ["type"])
    op.create_table(
        "technologies",
        entity_fk(),
        sa.Column("type", sa.String(30), nullable=False),
        sa.Column("origin", sa.String(20), nullable=False),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("mvp", sa.Boolean(), nullable=False),
        sa.Column("stub", sa.Boolean(), nullable=False),
        sa.Column("note", sa.Text()),
    )
    op.create_index("ix_technologies_category", "technologies", ["category"])
    op.create_table(
        "sources",
        entity_fk(),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("source_type", sa.String(30), nullable=False),
        sa.Column("authority_level", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(60), nullable=False),
        sa.Column("url_verified", sa.Boolean(), nullable=False),
        sa.Column("review_frequency", sa.String(20)),
        sa.Column("trust", sa.String(10)),
    )
    op.create_table(
        "concept_pages",
        entity_fk(),
        sa.Column("importance", sa.String(10)),
        sa.Column("category", sa.String(100)),
        sa.Column("section_count", sa.Integer(), nullable=False),
    )
    op.create_table(
        "entity_sources",
        sa.Column("entity_slug", sa.String(100), sa.ForeignKey("entities.slug", ondelete="CASCADE"), primary_key=True),
        sa.Column("position", sa.Integer(), primary_key=True),
        sa.Column("source_slug", sa.String(100), nullable=False),
        sa.Column("url", sa.Text()),
        sa.Column("accessed", sa.Date()),
        sa.Column("note", sa.Text()),
    )
    op.create_index("ix_entity_sources_source_slug", "entity_sources", ["source_slug"])
    op.create_table(
        "edges",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_slug", sa.String(100), nullable=False),
        sa.Column("relation_type", sa.String(30), nullable=False),
        sa.Column("target_slug", sa.String(100), nullable=False),
        sa.Column("origin", sa.String(10), nullable=False, comment="entity | blueprint"),
        sa.Column("metadata", JSONB(), nullable=False, server_default="{}"),
        sa.Column("position", sa.Integer(), nullable=False),
        file_fk(),
    )
    op.create_index("ix_edges_source_slug", "edges", ["source_slug"])
    op.create_index("ix_edges_target_slug", "edges", ["target_slug"])
    op.create_table(
        "domains",
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("id", sa.String(2), nullable=False, unique=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        file_fk(),
    )
    op.create_table(
        "subdomains",
        sa.Column("domain_slug", sa.String(100), sa.ForeignKey("domains.slug", ondelete="CASCADE"), primary_key=True),
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
    )
    op.create_table(
        "concepts",
        sa.Column("slug", sa.String(100), primary_key=True),
        sa.Column("domain_slug", sa.String(100), nullable=False),
        sa.Column("subdomain_slug", sa.String(100), nullable=False),
        sa.Column("subdomain_position", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, comment="Posición dentro del subdominio."),
        sa.Column("kind", sa.String(20), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("classification", sa.String(20), nullable=False),
        sa.Column("level", sa.String(20), nullable=False),
        sa.Column("importance", sa.String(10), nullable=False),
        sa.Column("mvp", sa.Boolean(), nullable=False),
        sa.Column("data", JSONB(), nullable=False, comment="Entrada completa del blueprint."),
        file_fk(),
    )
    op.create_index("ix_concepts_domain_slug", "concepts", ["domain_slug"])
    op.create_table(
        "capabilities",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("verification_status", sa.String(30), nullable=False),
        sa.Column("last_verified", sa.Date(), nullable=False),
        sa.Column("data", JSONB(), nullable=False, comment="Capacidad completa de la matriz."),
        file_fk(),
    )
    op.create_table(
        "capability_cells",
        sa.Column("capability_id", sa.String(40), sa.ForeignKey("capabilities.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("cloud", sa.String(10), primary_key=True),
        sa.Column("services", sa.ARRAY(sa.String(100)), nullable=False),
        sa.Column("differences", sa.Text(), nullable=False),
        sa.Column("not_equivalent_when", sa.Text(), nullable=False),
    )


def downgrade() -> None:
    for table in [
        "capability_cells", "capabilities", "concepts", "subdomains", "domains", "edges",
        "entity_sources", "concept_pages", "sources", "technologies", "entities", "content_files",
    ]:
        op.drop_table(table)

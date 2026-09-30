"""Esquema de PostgreSQL derivado de content/ (ADR-000, ADR-001, A-F2.2).

Definición única en SQLAlchemy Core. La migración 0001 la replica de forma explícita y un test
verifica que coinciden. Cada fila guarda el archivo del que sale (`file_path` → content_files,
ON DELETE CASCADE): recompilar o borrar un archivo elimina exactamente lo que ese archivo produjo.
`data` guarda el frontmatter / documento completo (JSONB) para reconstruir content/ sin pérdida;
las columnas tipadas existen para consultar.
"""

from __future__ import annotations

from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR

metadata = MetaData()


def file_fk() -> Column[str]:
    return Column("file_path", Text, ForeignKey("content_files.path", ondelete="CASCADE"), nullable=False)


def entity_fk() -> Column[str]:
    return Column("slug", String(100), ForeignKey("entities.slug", ondelete="CASCADE"), primary_key=True)


content_files = Table(
    "content_files",
    metadata,
    Column("path", Text, primary_key=True, comment="Ruta relativa a content/, formato POSIX."),
    Column("sha256", String(64), nullable=False),
    Column("compiler_version", String(20), nullable=False),
    Column("compiled_at", DateTime(timezone=True), nullable=False),
)

entities = Table(
    "entities",
    metadata,
    Column("slug", String(100), primary_key=True),
    Column("id", String(120), nullable=False, unique=True),
    Column("type", String(30), nullable=False, index=True),
    Column("title", Text, nullable=False),
    Column("description", Text),
    Column("domain", String(100)),
    Column("subdomain", String(100)),
    Column("classification", String(20)),
    Column("level", String(20)),
    Column("verification_status", String(30), nullable=False),
    Column("last_verified", Date),
    Column("created_at", Date, nullable=False),
    Column("updated_at", Date, nullable=False),
    Column("stub", Boolean, nullable=False, server_default="false"),
    Column("data", JSONB, nullable=False, comment="Frontmatter completo normalizado."),
    Column("body_markdown", Text, comment="Cuerpo Markdown; NULL si la entidad viene de un YAML."),
    Column("position", Integer, nullable=False, comment="Índice del documento dentro del archivo."),
    file_fk(),
)

technologies = Table(
    "technologies",
    metadata,
    entity_fk(),
    Column("type", String(30), nullable=False),
    Column("origin", String(20), nullable=False),
    Column("category", String(40), nullable=False, index=True),
    Column("mvp", Boolean, nullable=False),
    Column("stub", Boolean, nullable=False),
    Column("note", Text),
)

sources = Table(
    "sources",
    metadata,
    entity_fk(),
    Column("url", Text, nullable=False),
    Column("source_type", String(30), nullable=False),
    Column("authority_level", Integer, nullable=False),
    Column("provider", String(60), nullable=False),
    Column("url_verified", Boolean, nullable=False),
    Column("review_frequency", String(20)),
    Column("trust", String(10)),
)

concept_pages = Table(
    "concept_pages",
    metadata,
    entity_fk(),
    Column("importance", String(10)),
    Column("category", String(100)),
    Column("section_count", Integer, nullable=False),
)

entity_sources = Table(
    "entity_sources",
    metadata,
    Column("entity_slug", String(100), ForeignKey("entities.slug", ondelete="CASCADE"), primary_key=True),
    Column("position", Integer, primary_key=True),
    Column("source_slug", String(100), nullable=False, index=True),
    Column("url", Text),
    Column("accessed", Date),
    Column("note", Text),
)

edges = Table(
    "edges",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("source_slug", String(100), nullable=False),
    Column("relation_type", String(30), nullable=False),
    Column("target_slug", String(100), nullable=False),
    Column("origin", String(10), nullable=False, comment="entity | blueprint"),
    Column("metadata", JSONB, nullable=False, server_default="{}"),
    Column("position", Integer, nullable=False),
    file_fk(),
    Index("ix_edges_source_slug", "source_slug"),
    Index("ix_edges_target_slug", "target_slug"),
)

domains = Table(
    "domains",
    metadata,
    Column("slug", String(100), primary_key=True),
    Column("id", String(2), nullable=False, unique=True),
    Column("title", Text, nullable=False),
    Column("description", Text, nullable=False),
    file_fk(),
)

subdomains = Table(
    "subdomains",
    metadata,
    Column("domain_slug", String(100), ForeignKey("domains.slug", ondelete="CASCADE"), primary_key=True),
    Column("slug", String(100), primary_key=True),
    Column("title", Text, nullable=False),
    Column("position", Integer, nullable=False),
)

concepts = Table(
    "concepts",
    metadata,
    Column("slug", String(100), primary_key=True),
    Column("domain_slug", String(100), nullable=False, index=True),
    Column("subdomain_slug", String(100), nullable=False),
    Column("subdomain_position", Integer, nullable=False),
    Column("position", Integer, nullable=False, comment="Posición dentro del subdominio."),
    Column("kind", String(20), nullable=False),
    Column("title", Text, nullable=False),
    Column("classification", String(20), nullable=False),
    Column("level", String(20), nullable=False),
    Column("importance", String(10), nullable=False),
    Column("mvp", Boolean, nullable=False),
    Column("data", JSONB, nullable=False, comment="Entrada completa del blueprint."),
    file_fk(),
)

capabilities = Table(
    "capabilities",
    metadata,
    Column("id", String(40), primary_key=True),
    Column("title", Text, nullable=False),
    Column("position", Integer, nullable=False),
    Column("verification_status", String(30), nullable=False),
    Column("last_verified", Date, nullable=False),
    Column("data", JSONB, nullable=False, comment="Capacidad completa de la matriz."),
    file_fk(),
)

capability_cells = Table(
    "capability_cells",
    metadata,
    Column("capability_id", String(40), ForeignKey("capabilities.id", ondelete="CASCADE"), primary_key=True),
    Column("cloud", String(10), primary_key=True),
    Column("services", ARRAY(String(100)), nullable=False),
    Column("differences", Text, nullable=False),
    Column("not_equivalent_when", Text, nullable=False),
)

search_documents = Table(
    "search_documents",
    metadata,
    Column("slug", String(100), primary_key=True),
    Column("origin", String(10), primary_key=True, comment="blueprint | entity"),
    Column("type", String(30), nullable=False, comment="ResultType del contrato"),
    Column("title", Text, nullable=False),
    Column("domain", String(100)),
    Column("classification", String(20)),
    Column("snippet", Text, nullable=False),
    Column("tsv_es", TSVECTOR, nullable=False, comment="Config es_unaccent: título A, tags B, resumen C, cuerpo D."),
    Column("tsv_en", TSVECTOR, nullable=False, comment="Config en_unaccent, mismos pesos."),
    file_fk(),
    Index("ix_search_documents_tsv_es", "tsv_es", postgresql_using="gin"),
    Index("ix_search_documents_tsv_en", "tsv_en", postgresql_using="gin"),
)

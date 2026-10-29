"""Lee PostgreSQL y reconstruye el ContentIndex que usa scripts/contracts/projection.py (A-F2.2).

El orden replica la carga desde content/ (archivo y posición), así la proyección produce las
mismas respuestas leyendo la base que leyendo los archivos. Lo verifica tests/test_compiler.py.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from sqlalchemy import Connection, Engine, select

from backend.db import schema as t
from backend.content import validate as v
from backend.app.projection import BlueprintEntry, ContentIndex


def read_entities(conn: Connection, index: ContentIndex) -> None:
    rows = conn.execute(
        select(t.entities.c.slug, t.entities.c.data, t.entities.c.body_markdown)
        .order_by(t.entities.c.file_path, t.entities.c.position)
    )
    for slug, data, body in rows:
        index.entities[slug] = data
        if body is not None:
            index.bodies[slug] = body


def read_concepts(conn: Connection) -> dict[str, list[dict[str, Any]]]:
    """Conceptos agrupados por subdominio (clave "dominio/subdominio"), en su orden del blueprint."""
    rows = conn.execute(
        select(t.concepts.c.domain_slug, t.concepts.c.subdomain_slug, t.concepts.c.data)
        .order_by(t.concepts.c.domain_slug, t.concepts.c.subdomain_position, t.concepts.c.position)
    )
    grouped: dict[str, list[dict[str, Any]]] = {}
    for domain, subdomain, data in rows:
        grouped.setdefault(f"{domain}/{subdomain}", []).append(data)
    return grouped


def read_blueprint(conn: Connection, index: ContentIndex) -> None:
    concepts = read_concepts(conn)
    subdomain_rows = conn.execute(
        select(t.subdomains.c.domain_slug, t.subdomains.c.slug, t.subdomains.c.title)
        .order_by(t.subdomains.c.domain_slug, t.subdomains.c.position)
    ).all()
    domains = conn.execute(
        select(t.domains.c.id, t.domains.c.slug, t.domains.c.title, t.domains.c.description, t.domains.c.band,
               t.domains.c.legal_framework).order_by(t.domains.c.id)
    )
    for domain_id, slug, title, description, band, legal_framework in domains:
        domain = {"id": domain_id, "slug": slug, "title": title, "description": description}
        domain.update({k: val for k, val in (("band", band), ("legal_framework", legal_framework)) if val is not None})
        subdomains = [
            {"slug": sub, "title": sub_title, "concepts": concepts.get(f"{slug}/{sub}", [])}
            for dom, sub, sub_title in subdomain_rows
            if dom == slug
        ]
        index.domains.append({"domain": domain, "subdomains": subdomains})
        for subdomain in subdomains:
            for concept in subdomain["concepts"]:
                index.concepts[concept["slug"]] = BlueprintEntry(domain, subdomain, concept, len(index.concepts))


def read_legal_frameworks(conn: Connection, index: ContentIndex) -> None:
    for slug, data in conn.execute(select(t.legal_frameworks.c.slug, t.legal_frameworks.c.data)):
        index.legal_frameworks[slug] = data


def read_matrix(conn: Connection, index: ContentIndex) -> None:
    rows = conn.execute(
        select(t.capabilities.c.data).order_by(t.capabilities.c.file_path, t.capabilities.c.position)
    )
    index.capabilities.extend(data for (data,) in rows)


def load_index_from_db(engine: Engine, schemas_dir: Path) -> ContentIndex:
    index = ContentIndex(catalog=v.load_relation_catalog(schemas_dir))
    with engine.connect() as conn:
        read_entities(conn, index)
        read_blueprint(conn, index)
        read_legal_frameworks(conn, index)
        read_matrix(conn, index)
    return index

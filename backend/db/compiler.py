"""Compilador content/ → PostgreSQL (A-F2.2, ADR-000).

- Valida content/ antes de tocar la base; si hay errores, aborta sin cambios.
- Trabaja por archivo: cada fila guarda su `file_path` (FK a content_files con ON DELETE CASCADE).
  Un archivo sin cambios (mismo sha256 y misma versión del compilador) se salta; uno cambiado se
  borra (en cascada) y se reinserta; uno que ya no existe se borra con todo lo que produjo.
- Todo ocurre en una sola transacción: la base nunca queda a medio compilar.
Es correcto por archivo porque cada fila depende solo de su archivo, y la validación previa
garantiza que no quedan referencias colgando.
"""

from __future__ import annotations

import hashlib
from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

import yaml
from sqlalchemy import Connection, Engine, cast, delete, func, insert, literal, literal_column, select
from sqlalchemy.dialects.postgresql import REGCONFIG, TSVECTOR
from sqlalchemy.sql.elements import ColumnElement

from backend.db import schema as t
from backend.content import validate as v
from backend.app.projection import markdown_body, sections

COMPILER_VERSION = "7"  # 2: search_documents (A-F2.3); 3: aliases en la búsqueda (ADR-010); 4: page_title (ADR-012); 5: ADR-023; 6: implication (enmienda de ADR-023); 7: band y legal_frameworks (ADR-027)
TECHNOLOGY_TYPES = {"technology", "cloud_service"}
SEARCHABLE_TYPES = {"concept", "pattern", "architecture", "technology", "cloud_service", "code_snippet", "source"}
SEARCH_CONFIGS = {"tsv_es": "es_unaccent", "tsv_en": "en_unaccent"}
WEIGHTS = ("A", "B", "C", "D")


class CompileError(Exception):
    """content/ no valida: no se compila nada."""


@dataclass
class CompileStats:
    added: list[str] = field(default_factory=list)
    updated: list[str] = field(default_factory=list)
    deleted: list[str] = field(default_factory=list)
    unchanged: int = 0

    @property
    def changed(self) -> bool:
        return bool(self.added or self.updated or self.deleted)


def to_date(value: str | None) -> date | None:
    return date.fromisoformat(value) if value else None


# --- Archivos ----------------------------------------------------------------


def relative(content_dir: Path, path: Path) -> str:
    return path.relative_to(content_dir).as_posix()


def content_files(content_dir: Path) -> dict[str, Path]:
    """Todos los archivos compilables: entidades, blueprint y matriz."""
    files = {relative(content_dir, p): p for p in v.iter_content_files(content_dir, exclude_top=v.STRUCTURE_DIRS)}
    for subdir in sorted(v.STRUCTURE_DIRS):
        if (content_dir / subdir).is_dir():
            files.update({relative(content_dir, p): p for p in v.iter_content_files(content_dir / subdir)})
    return files


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# --- Filas por tipo de archivo -----------------------------------------------


def entity_documents(path: Path) -> Iterator[tuple[int, dict[str, Any], str | None]]:
    body = markdown_body(path) if path.suffix == ".md" else None
    for index, raw in enumerate(v.parse_file(path)):
        yield index, v.normalize(raw), body


def insert_entity(conn: Connection, file_path: str, position: int, data: dict[str, Any], body: str | None) -> None:
    conn.execute(insert(t.entities).values(
        slug=data["slug"], id=data["id"], type=data["type"], title=data["title"], description=data.get("description"),
        domain=data.get("domain"), subdomain=data.get("subdomain"), classification=data.get("classification"),
        level=data.get("level"), verification_status=data["verification_status"],
        last_verified=to_date(data.get("last_verified")), created_at=to_date(data["created_at"]),
        updated_at=to_date(data["updated_at"]),
        stub=data.get("stub", False), jurisdiction=data.get("jurisdiction", []),
        owner_approved_at=to_date(data.get("owner_approved_at")),
        data=data, body_markdown=body, position=position, file_path=file_path,
    ))
    insert_typed(conn, data, body)
    if data["type"] in SEARCHABLE_TYPES:
        insert_search_document(conn, file_path, "entity", entity_search_document(data, body))
    for i, ref in enumerate(data.get("sources", [])):
        conn.execute(insert(t.entity_sources).values(
            entity_slug=data["slug"], position=i, source_slug=ref["source"], url=ref.get("url"),
            accessed=to_date(ref.get("accessed")), page_title=ref.get("page_title"), note=ref.get("note"),
        ))
    for i, basis in enumerate(data.get("legal_basis", [])):
        conn.execute(insert(t.entity_legal_basis).values(
            entity_slug=data["slug"], position=i, law=basis["law"], article=basis["article"], url=basis["url"],
            note=basis.get("note"), implication=basis["implication"],
        ))
    for i, relation in enumerate(data.get("relations", [])):
        insert_edge(conn, file_path, i, data["slug"], relation["type"], relation["target"], "entity", relation.get("note"))


def insert_typed(conn: Connection, data: dict[str, Any], body: str | None) -> None:
    slug, entity_type = data["slug"], data["type"]
    if entity_type in TECHNOLOGY_TYPES:
        conn.execute(insert(t.technologies).values(
            slug=slug, type=entity_type, origin=data.get("provider") or data["vendor"], category=data["category"],
            mvp=data.get("mvp", False), stub=data.get("stub", False), note=data.get("note"),
        ))
    elif entity_type == "source":
        conn.execute(insert(t.sources).values(
            slug=slug, url=data["url"], source_type=data["source_type"], authority_level=data["authority_level"],
            provider=data["provider"], url_verified=data.get("url_verified", False),
            review_frequency=data.get("review_frequency"), trust=data.get("trust"),
        ))
    elif entity_type == "concept":
        conn.execute(insert(t.concept_pages).values(
            slug=slug, importance=data.get("importance"), category=data.get("category"),
            section_count=len(sections(body or "")),
        ))


def weighted_tsvector(config: str, parts: list[tuple[str, str]]) -> ColumnElement[Any]:
    """setweight(to_tsvector(config, texto), peso) concatenado para cada (peso, texto)."""
    vectors = [
        func.setweight(
            func.to_tsvector(cast(literal(config), REGCONFIG), text or ""),
            literal_column(f"'{weight}'::\"char\""),  # peso fijo A–D, no viene de content/
            type_=TSVECTOR,
        )
        for weight, text in parts
        if weight in WEIGHTS
    ]
    expression = vectors[0]
    for vector in vectors[1:]:
        expression = expression.op("||", return_type=TSVECTOR)(vector)
    return expression


def insert_search_document(conn: Connection, file_path: str, origin: str, doc: dict[str, Any]) -> None:
    """doc: slug, type, title, domain, classification, snippet, tags, summary, body, aliases."""
    # El slug (en inglés) se indexa junto al título (en español): "partitioning" encuentra "Particionamiento".
    # Los alias (nombres anteriores, ADR-010) también: "Dataplex" encuentra "Knowledge Catalog".
    title = " ".join([doc["title"], doc["slug"].replace("-", " "), *doc.get("aliases", [])])
    parts = [("A", title), ("B", doc["tags"]), ("C", doc["summary"]), ("D", doc["body"])]
    conn.execute(insert(t.search_documents).values(
        slug=doc["slug"], origin=origin, type=doc["type"], title=doc["title"], domain=doc["domain"],
        classification=doc["classification"], snippet=doc["snippet"][:200], file_path=file_path,
        **{column: weighted_tsvector(config, parts) for column, config in SEARCH_CONFIGS.items()},
    ))


def entity_search_document(data: dict[str, Any], body: str | None) -> dict[str, Any]:
    return {
        "slug": data["slug"], "type": data["type"], "title": data["title"], "domain": data.get("domain"),
        "classification": data.get("classification"), "snippet": data.get("description") or data["title"],
        "tags": " ".join(data.get("tags", [])), "summary": data.get("description") or "", "body": body or "",
        "aliases": data.get("aliases", []),
    }


def concept_search_document(domain: str, concept: dict[str, Any]) -> dict[str, Any]:
    note = concept.get("note") or ""
    return {
        "slug": concept["slug"], "type": concept["kind"], "title": concept["title"], "domain": domain,
        "classification": concept["classification"], "snippet": note or concept["title"],
        "tags": "", "summary": note, "body": "",
    }


def insert_edge(
    conn: Connection, file_path: str, position: int, source: str, rel_type: str, target: str, origin: str, note: str | None
) -> None:
    conn.execute(insert(t.edges).values(
        source_slug=source, relation_type=rel_type, target_slug=target, origin=origin,
        metadata={"note": note} if note else {}, position=position, file_path=file_path,
    ))


def insert_blueprint(conn: Connection, file_path: str, doc: dict[str, Any]) -> None:
    domain = doc["domain"]
    conn.execute(insert(t.domains).values(
        slug=domain["slug"], id=domain["id"], title=domain["title"], description=domain["description"],
        band=domain.get("band"), legal_framework=domain.get("legal_framework"), file_path=file_path,
    ))
    for s_pos, subdomain in enumerate(doc["subdomains"]):
        conn.execute(insert(t.subdomains).values(
            domain_slug=domain["slug"], slug=subdomain["slug"], title=subdomain["title"], position=s_pos,
        ))
        for c_pos, concept in enumerate(subdomain["concepts"]):
            insert_concept(conn, file_path, domain["slug"], subdomain["slug"], s_pos, c_pos, concept)


def insert_concept(
    conn: Connection, file_path: str, domain: str, subdomain: str, s_pos: int, c_pos: int, concept: dict[str, Any]
) -> None:
    conn.execute(insert(t.concepts).values(
        slug=concept["slug"], domain_slug=domain, subdomain_slug=subdomain, subdomain_position=s_pos, position=c_pos,
        kind=concept["kind"], title=concept["title"], classification=concept["classification"], level=concept["level"],
        importance=concept["importance"], mvp=concept["mvp"], data=concept, file_path=file_path,
    ))
    insert_search_document(conn, file_path, "blueprint", concept_search_document(domain, concept))
    targets = [*concept.get("related_concepts", []), *concept.get("related_technologies", [])]
    for i, target in enumerate(targets):
        insert_edge(conn, file_path, i, concept["slug"], "RELATED_TO", target, "blueprint", None)


def insert_matrix(conn: Connection, file_path: str, doc: dict[str, Any]) -> None:
    for position, capability in enumerate(doc["capabilities"]):
        conn.execute(insert(t.capabilities).values(
            id=capability["id"], title=capability["title"], position=position,
            verification_status=capability["verification_status"], last_verified=to_date(capability["last_verified"]),
            data=capability, file_path=file_path,
        ))
        for cloud, cell in capability["clouds"].items():
            conn.execute(insert(t.capability_cells).values(
                capability_id=capability["id"], cloud=cloud, services=cell["services"],
                differences=cell["differences"], not_equivalent_when=cell["not_equivalent_when"],
            ))


def insert_legal_framework(conn: Connection, file_path: str, doc: dict[str, Any]) -> None:
    conn.execute(insert(t.legal_frameworks).values(slug=doc["slug"], data=doc, file_path=file_path))


STRUCTURE_LOADERS = {v.BLUEPRINT_DIR: insert_blueprint, v.MATRIX_DIR: insert_matrix,
                     v.LEGAL_FRAMEWORKS_DIR: insert_legal_framework}


def load_file(conn: Connection, rel: str, path: Path) -> None:
    top = rel.split("/", 1)[0]
    if top in v.STRUCTURE_DIRS:
        doc = v.normalize(yaml.safe_load(path.read_text(encoding="utf-8")))
        STRUCTURE_LOADERS[top](conn, rel, doc)
        return
    for position, data, body in entity_documents(path):
        insert_entity(conn, rel, position, data, body)


# --- Orquestación ------------------------------------------------------------


def compiled_files(conn: Connection) -> dict[str, tuple[str, str]]:
    rows = conn.execute(select(t.content_files.c.path, t.content_files.c.sha256, t.content_files.c.compiler_version))
    return {path: (digest, version) for path, digest, version in rows}


def compile_content(engine: Engine, content_dir: Path, schemas_dir: Path, full: bool = False) -> CompileStats:
    report = v.validate(content_dir, schemas_dir)
    if not report.ok:
        raise CompileError("\n".join(report.errors))
    files = content_files(content_dir)
    digests = {rel: sha256(path) for rel, path in files.items()}
    stats = CompileStats()
    with engine.begin() as conn:
        previous = compiled_files(conn)
        stats.deleted = sorted(set(previous) - set(files))
        pending = [rel for rel in sorted(files) if full or previous.get(rel) != (digests[rel], COMPILER_VERSION)]
        stats.unchanged = len(files) - len(pending)
        # Fase 1: borrar lo eliminado y lo cambiado (cascada). Fase 2: insertar lo cambiado.
        # Así un slug que se mueve de un archivo a otro no choca con su versión anterior.
        for rel in [*stats.deleted, *(r for r in pending if r in previous)]:
            conn.execute(delete(t.content_files).where(t.content_files.c.path == rel))
        now = datetime.now(UTC)
        for rel in pending:
            conn.execute(insert(t.content_files).values(
                path=rel, sha256=digests[rel], compiler_version=COMPILER_VERSION, compiled_at=now,
            ))
            load_file(conn, rel, files[rel])
            (stats.updated if rel in previous else stats.added).append(rel)
    return stats

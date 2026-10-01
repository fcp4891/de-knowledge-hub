"""Proyección del ContentIndex a las representaciones de docs/contracts/api.yaml (ADR-002, ADR-005).

Funciones puras sobre un ContentIndex. Las usa build_mocks.py y son la referencia de forma
para la API real (A-F2.3): la API debe devolver exactamente estas estructuras.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from backend.content import validate as v

TECHNOLOGY_TYPES = {"technology", "cloud_service"}
SECTION_KEYS = [
    "summary", "what_is", "problem", "how_it_works", "when_to_use", "when_not_to_use", "simple_example",
    "production_example", "architecture", "code", "gcp", "aws", "azure", "best_practices", "common_mistakes",
    "trade_offs", "related_concepts", "open_questions", "related_lab", "sources", "last_verified", "change_history",
]
SNIPPET_TYPE = "code_snippet"
SNIPPET_SECTION_KEYS = [  # ADR-008: las 10 secciones de content/_templates/snippet.md
    "what_it_solves", "code", "how_it_works", "when_to_use", "when_not_to_use", "risks", "requirements",
    "related_concepts", "sources", "change_history",
]
PAGE_BONUS = 0.3  # ADR-007: igual que backend/app/search.py
SECTION_HEADING = re.compile(r"^## (\d+)\. (.+)$")
CLOUDS = ("gcp", "aws", "azure")


@dataclass(frozen=True)
class BlueprintEntry:
    domain: dict[str, Any]
    subdomain: dict[str, Any]
    concept: dict[str, Any]
    position: int


@dataclass
class ContentIndex:
    entities: dict[str, dict[str, Any]] = field(default_factory=dict)
    bodies: dict[str, str] = field(default_factory=dict)
    domains: list[dict[str, Any]] = field(default_factory=list)
    concepts: dict[str, BlueprintEntry] = field(default_factory=dict)
    capabilities: list[dict[str, Any]] = field(default_factory=list)
    catalog: dict[str, dict[str, Any]] = field(default_factory=dict)


# --- Carga -------------------------------------------------------------------


def markdown_body(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    closing = next(i for i, line in enumerate(lines[1:], start=1) if line.strip() == "---")
    return "\n".join(lines[closing + 1 :]).strip()


def load_index(content_dir: Path, schemas_dir: Path) -> ContentIndex:
    report = v.validate(content_dir, schemas_dir)
    if not report.ok:
        raise ValueError("content/ no valida; ejecuta make validate:\n" + "\n".join(report.errors))
    index = ContentIndex(catalog=v.load_relation_catalog(schemas_dir))
    for doc in v.load_documents(content_dir, v.Report()):
        index.entities[doc.data["slug"]] = doc.data
        if doc.path.suffix == ".md":
            index.bodies[doc.data["slug"]] = markdown_body(content_dir.parent / doc.path)
    blueprints = v.load_structures(content_dir, v.BLUEPRINT_DIR, v.Report())
    for doc in sorted(blueprints, key=lambda d: d.data["domain"]["id"]):
        index.domains.append(doc.data)
        for subdomain in doc.data["subdomains"]:
            for concept in subdomain["concepts"]:
                entry = BlueprintEntry(doc.data["domain"], subdomain, concept, len(index.concepts))
                index.concepts[concept["slug"]] = entry
    for doc in v.load_structures(content_dir, v.MATRIX_DIR, v.Report()):
        index.capabilities.extend(doc.data["capabilities"])
    return index


def exists(index: ContentIndex, slug: str) -> bool:
    return slug in index.concepts or slug in index.entities


# --- Dominios ----------------------------------------------------------------


def domain_summary(domain_doc: dict[str, Any]) -> dict[str, Any]:
    concepts = [c for s in domain_doc["subdomains"] for c in s["concepts"]]
    domain = domain_doc["domain"]
    return {
        "id": domain["id"], "slug": domain["slug"], "title": domain["title"], "description": domain["description"],
        "concept_count": len(concepts), "mvp_count": sum(1 for c in concepts if c["mvp"]),
    }


def domain_list(index: ContentIndex) -> dict[str, Any]:
    return {"items": [domain_summary(d) for d in index.domains]}


def domain_detail(index: ContentIndex, slug: str) -> dict[str, Any]:
    doc = next(d for d in index.domains if d["domain"]["slug"] == slug)
    subdomains = [
        {"slug": s["slug"], "title": s["title"], "concepts": [concept_summary(index, c["slug"]) for c in s["concepts"]]}
        for s in doc["subdomains"]
    ]
    return {**domain_summary(doc), "subdomains": subdomains}


# --- Conceptos ---------------------------------------------------------------


def concept_summary(index: ContentIndex, slug: str) -> dict[str, Any]:
    entry = index.concepts[slug]
    concept, page = entry.concept, index.entities.get(slug)
    return {
        "slug": slug, "title": concept["title"], "kind": concept["kind"],
        "domain": entry.domain["slug"], "subdomain": entry.subdomain["slug"],
        "classification": concept["classification"], "level": concept["level"], "importance": concept["importance"],
        "mvp": concept["mvp"], "has_page": page is not None,
        "verification_status": page["verification_status"] if page else None,
        "last_verified": page.get("last_verified") if page else None,
    }


def page_of(items: list[Any], limit: int, offset: int) -> dict[str, Any]:
    return {"total": len(items), "limit": limit, "offset": offset, "items": items[offset : offset + limit]}


def matches(item: dict[str, Any], filters: dict[str, Any]) -> bool:
    """True si el item cumple todos los filtros con valor (None = sin filtro)."""
    return all(item.get(key) == value for key, value in filters.items() if value is not None)


def concept_list(
    index: ContentIndex, limit: int = 50, offset: int = 0, filters: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Filtros: domain, subdomain, kind, classification, level, mvp, has_page (claves de ConceptSummary)."""
    items = [concept_summary(index, slug) for slug in index.concepts]
    return page_of([i for i in items if matches(i, filters or {})], limit, offset)


def sections(body: str, keys: list[str] = SECTION_KEYS) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    buffer: list[str] = []
    for line in body.splitlines():
        match = SECTION_HEADING.match(line)
        if match and 1 <= int(match.group(1)) <= len(keys):
            if current:
                result.append({**current, "markdown": "\n".join(buffer).strip()})
            number = int(match.group(1))
            current, buffer = {"number": number, "key": keys[number - 1], "title": match.group(2).strip()}, []
        elif current:
            buffer.append(line)
    if current:
        result.append({**current, "markdown": "\n".join(buffer).strip()})
    return result


def source_refs(index: ContentIndex, refs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    resolved = []
    for ref in refs:
        source = index.entities[ref["source"]]
        resolved.append({
            "source": source["slug"], "title": source["title"], "url": ref.get("url", source["url"]),
            "source_type": source["source_type"], "authority_level": source["authority_level"],
            "accessed": ref.get("accessed"), "note": ref.get("note"),
        })
    return resolved


def union(*lists: list[str]) -> list[str]:
    seen: list[str] = []
    for items in lists:
        seen += [item for item in items if item not in seen]
    return seen


def concept_detail(index: ContentIndex, slug: str) -> dict[str, Any]:
    entry = index.concepts[slug]
    concept, page = entry.concept, index.entities.get(slug, {})
    return {
        "id": page.get("id", f"{concept['kind']}:{slug}"), "title": page.get("title", concept["title"]), "slug": slug,
        "description": page.get("description"), "type": concept["kind"],
        "domain": entry.domain["slug"], "subdomain": entry.subdomain["slug"],
        "classification": concept["classification"], "level": concept["level"],
        "cloud": page.get("cloud", []),
        "technologies": union(page.get("technologies", []), concept.get("related_technologies", [])),
        "tags": page.get("tags", []),
        "related_topics": union(page.get("related_topics", []), concept.get("related_concepts", [])),
        "sources": source_refs(index, page.get("sources", [])),
        "created_at": page.get("created_at"), "updated_at": page.get("updated_at"),
        "last_verified": page.get("last_verified"), "verification_status": page.get("verification_status"),
        "kind": concept["kind"], "importance": concept["importance"], "mvp": concept["mvp"],
        "has_page": bool(page), "stub": page.get("stub", False), "note": concept.get("note"),
        "sections": sections(index.bodies.get(slug, "")),
    }


# --- Tecnologías -------------------------------------------------------------


def origin(tech: dict[str, Any]) -> str:
    return str(tech.get("provider") or tech["vendor"])


def technology_summary(tech: dict[str, Any]) -> dict[str, Any]:
    return {
        "slug": tech["slug"], "title": tech["title"], "type": tech["type"], "origin": origin(tech),
        "category": tech["category"], "classification": tech["classification"], "mvp": tech.get("mvp", False),
        "stub": tech.get("stub", False), "verification_status": tech["verification_status"],
    }


def technology_list(
    index: ContentIndex, limit: int = 50, offset: int = 0, filters: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Filtros: type, origin, category, classification, mvp (claves de TechnologySummary)."""
    techs = sorted((e for e in index.entities.values() if e["type"] in TECHNOLOGY_TYPES), key=lambda e: e["slug"])
    items = [technology_summary(t) for t in techs]
    return page_of([i for i in items if matches(i, filters or {})], limit, offset)


def capability_cells(index: ContentIndex, slug: str) -> list[dict[str, Any]]:
    cells = []
    for capability in index.capabilities:
        for cloud in CLOUDS:
            cell = capability["clouds"][cloud]
            if slug not in cell["services"]:
                continue
            equivalents = {other: capability["clouds"][other] for other in CLOUDS if other != cloud}
            cells.append({
                "capability": capability["id"], "title": capability["title"], "cloud": cloud,
                "differences": cell["differences"], "not_equivalent_when": cell["not_equivalent_when"],
                "equivalents": equivalents, "verification_status": capability["verification_status"],
            })
    return cells


def technology_detail(index: ContentIndex, slug: str) -> dict[str, Any]:
    tech = index.entities[slug]
    return {
        "id": tech["id"], "title": tech["title"], "slug": slug, "description": tech["description"], "type": tech["type"],
        "domain": None, "subdomain": None, "classification": tech["classification"], "level": tech.get("level"),
        "cloud": tech.get("cloud", []), "technologies": tech.get("technologies", []), "tags": tech.get("tags", []),
        "related_topics": tech.get("related_topics", []), "sources": source_refs(index, tech.get("sources", [])),
        "created_at": tech["created_at"], "updated_at": tech["updated_at"],
        "last_verified": tech.get("last_verified"), "verification_status": tech["verification_status"],
        "origin": origin(tech), "category": tech["category"], "mvp": tech.get("mvp", False),
        "stub": tech.get("stub", False), "note": tech.get("note"), "capabilities": capability_cells(index, slug),
    }


# --- Code Library (ADR-008) ---------------------------------------------------


def implemented(entity: dict[str, Any]) -> list[str]:
    return [r["target"] for r in entity.get("relations", []) if r["type"] == "IMPLEMENTS"]


def snippet_summary(snippet: dict[str, Any]) -> dict[str, Any]:
    return {
        "slug": snippet["slug"], "title": snippet["title"], "description": snippet["description"],
        "language": snippet["language"], "dialect": snippet.get("dialect"), "cloud": snippet.get("cloud", []),
        "implements": implemented(snippet), "verification_status": snippet["verification_status"],
    }


def snippet_matches(item: dict[str, Any], filters: dict[str, Any]) -> bool:
    """language exacto; cloud e implements por pertenencia a la lista (None = sin filtro)."""
    return (
        filters.get("language") in (None, item["language"])
        and (filters.get("cloud") is None or filters["cloud"] in item["cloud"])
        and (filters.get("implements") is None or filters["implements"] in item["implements"])
    )


def snippet_list(
    index: ContentIndex, limit: int = 50, offset: int = 0, filters: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Filtros: language, cloud, implements."""
    snippets = sorted((e for e in index.entities.values() if e["type"] == SNIPPET_TYPE), key=lambda e: e["slug"])
    items = [snippet_summary(s) for s in snippets]
    return page_of([i for i in items if snippet_matches(i, filters or {})], limit, offset)


def snippet_detail(index: ContentIndex, slug: str) -> dict[str, Any]:
    s = index.entities[slug]
    return {
        "id": s["id"], "title": s["title"], "slug": slug, "description": s["description"], "type": s["type"],
        "domain": s.get("domain"), "subdomain": s.get("subdomain"), "classification": s.get("classification"),
        "level": s.get("level"), "cloud": s.get("cloud", []), "technologies": s.get("technologies", []),
        "tags": s.get("tags", []), "related_topics": s.get("related_topics", []),
        "sources": source_refs(index, s.get("sources", [])),
        "created_at": s["created_at"], "updated_at": s["updated_at"],
        "last_verified": s.get("last_verified"), "verification_status": s["verification_status"],
        "language": s["language"], "dialect": s.get("dialect"), "requirements": s.get("requirements", []),
        "implements": implemented(s), "sections": sections(index.bodies.get(slug, ""), SNIPPET_SECTION_KEYS),
    }


# --- Fuentes -----------------------------------------------------------------


def source_detail(index: ContentIndex, slug: str) -> dict[str, Any]:
    s = index.entities[slug]
    keys = ["slug", "title", "description", "url", "source_type", "authority_level", "provider", "url_verified",
            "review_frequency", "trust", "technologies", "last_verified", "verification_status"]
    return {key: s.get(key) for key in keys}


# --- Relaciones --------------------------------------------------------------


@dataclass(frozen=True)
class Edge:
    source: str
    type: str
    target: str
    origin: str
    note: str | None


def edges(index: ContentIndex) -> list[Edge]:
    result = [
        Edge(e["slug"], r["type"], r["target"], "entity", r.get("note"))
        for e in index.entities.values()
        for r in e.get("relations", [])
    ]
    for slug, entry in index.concepts.items():
        for target in [*entry.concept.get("related_concepts", []), *entry.concept.get("related_technologies", [])]:
            result.append(Edge(slug, "RELATED_TO", target, "blueprint", None))
    return result


def describe(index: ContentIndex, slug: str) -> tuple[str, str]:
    if slug in index.entities:
        entity = index.entities[slug]
        return entity["title"], entity["type"]
    entry = index.concepts[slug]
    return entry.concept["title"], entry.concept["kind"]


def relation_item(index: ContentIndex, slug: str, edge: Edge) -> dict[str, Any]:
    title, entity_type = describe(index, slug)
    return {"slug": slug, "title": title, "entity_type": entity_type, "origin": edge.origin, "note": edge.note}


def add_item(groups: dict[tuple[str, str], dict[str, Any]], key: tuple[str, str], label: str, item: dict[str, Any]) -> None:
    group = groups.setdefault(key, {"type": key[0], "direction": key[1], "label": label, "items": []})
    existing = next((i for i in group["items"] if i["slug"] == item["slug"]), None)
    if existing is None:
        group["items"].append(item)
    elif existing["origin"] == "blueprint" and item["origin"] == "entity":
        group["items"][group["items"].index(existing)] = item


def relation_groups(index: ContentIndex, slug: str) -> dict[str, Any]:
    groups: dict[tuple[str, str], dict[str, Any]] = {}
    for edge in edges(index):
        if slug not in (edge.source, edge.target) or edge.source == edge.target:
            continue
        rule = index.catalog[edge.type]
        outgoing = edge.source == slug
        other = edge.target if outgoing else edge.source
        if rule["symmetric"]:
            key, label = (edge.type, "both"), rule["inverse"]
        elif outgoing:
            key, label = (edge.type, "outgoing"), edge.type.lower()
        else:
            key, label = (edge.type, "incoming"), rule["inverse"]
        add_item(groups, key, label, relation_item(index, other, edge))
    order = list(index.catalog)
    direction_order = {"outgoing": 0, "incoming": 1, "both": 2}
    ordered = sorted(groups.values(), key=lambda g: (order.index(g["type"]), direction_order[g["direction"]]))
    for group in ordered:
        group["items"].sort(key=lambda i: (i["title"].lower(), i["slug"]))
    return {"slug": slug, "groups": ordered}


# --- Búsqueda (referencia simple; la real es FTS en A-F2.3) ------------------


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text.lower())
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))


def candidates(index: ContentIndex) -> list[dict[str, Any]]:
    items = []
    for slug, entry in index.concepts.items():
        page = index.entities.get(slug, {})
        items.append({
            "slug": slug, "title": entry.concept["title"], "type": entry.concept["kind"], "domain": entry.domain["slug"],
            "classification": entry.concept["classification"],
            "text": page.get("description") or entry.concept.get("note") or entry.concept["title"],
            "has_page": bool(page),
        })
    for e in index.entities.values():
        if e["type"] in TECHNOLOGY_TYPES or e["type"] in ("source", SNIPPET_TYPE):
            items.append({
                "slug": e["slug"], "title": e["title"], "type": e["type"], "domain": None,
                "classification": e.get("classification"), "text": e["description"], "has_page": True,
            })
    return items


def score(query: str, item: dict[str, Any]) -> float:
    q = normalize(query)
    points = 3.0 * (q in normalize(item["title"])) + 2.0 * (q in item["slug"]) + 1.0 * (q in normalize(item["text"]))
    if not points:
        return points
    page_bonus = PAGE_BONUS * (item["has_page"] and item["type"] != SNIPPET_TYPE)  # ADR-008
    return round(points + 0.5 * (item["classification"] == "core") + page_bonus, 4)


def search(index: ContentIndex, query: str, limit: int = 20) -> dict[str, Any]:
    scored = [(score(query, item), item) for item in candidates(index)]
    hits = sorted((pair for pair in scored if pair[0] > 0), key=lambda p: (-p[0], p[1]["title"].lower()))[:limit]
    groups: dict[str, list[dict[str, Any]]] = {}
    for points, item in hits:
        result = {key: item[key] for key in ("slug", "title", "type", "domain", "classification", "has_page")}
        groups.setdefault(item["type"], []).append({**result, "snippet": item["text"][:200], "score": points})
    return {"query": query, "total": len(hits), "groups": [{"type": t, "items": i} for t, i in groups.items()]}


def dumps(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"

"""Genera docs/contracts/mock-data/ desde content/ (A-F2.1, ADR-002).

Determinista e idempotente: borra y reescribe el directorio; re-ejecutarlo sin cambios en
content/ produce los mismos archivos (lo verifica tests/test_contract.py).
index.json asocia "MÉTODO /ruta[?query]" con el archivo de respuesta, para el modo mock del frontend.

Uso: python -m scripts.contracts.build_mocks [--out DIR]
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Any

from backend.app import projection as p

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "contracts" / "mock-data"

# 10 conceptos MVP (2 con ficha) y 5 tecnologías MVP, todos reales del blueprint e inventario.
CONCEPTS = [
    "change-data-capture", "idempotency", "etl-vs-elt", "batch-vs-streaming", "partitioning",
    "sql-merge", "scd-type-2", "incremental-load", "dead-letter-queue", "bigquery-partitioning",
]
TECHNOLOGIES = ["gcp-bigquery", "gcp-cloud-storage", "gcp-pubsub", "gcp-dataflow", "apache-airflow"]
QUERIES = ["bigquery", "streaming", "idempotencia"]
LIST_LIMIT = 500

# Estado personal de ejemplo: no sale de content/ (vive en PostgreSQL, ADR-000).
STUDY_STATES = [
    {"slug": "change-data-capture", "state": "reviewing", "pending_deep_dive": True,
     "last_studied_at": "2026-09-29T10:00:00Z", "updated_at": "2026-09-29T10:00:00Z"},
    {"slug": "idempotency", "state": "needs_review", "pending_deep_dive": False,
     "last_studied_at": "2026-09-20T18:30:00Z", "updated_at": "2026-09-28T09:00:00Z"},
    {"slug": "sql-merge", "state": "understood", "pending_deep_dive": False,
     "last_studied_at": "2026-09-25T21:15:00Z", "updated_at": "2026-09-25T21:15:00Z"},
]
NOTE = {
    "id": "note-0001", "slug": "change-data-capture",
    "body_markdown": "Revisar qué pasa con los replication slots si el consumidor se detiene un fin de semana.",
    "created_at": "2026-09-29T10:05:00Z", "updated_at": "2026-09-29T10:05:00Z",
}
NOTE_UPDATED = {
    **NOTE,
    "body_markdown": NOTE["body_markdown"] + " Confirmado: el WAL retenido crece hasta que el slot se consume o se elimina.",
    "updated_at": "2026-09-30T08:00:00Z",
}
FAVORITE = {"slug": "change-data-capture", "favorite": True, "updated_at": "2026-09-29T10:06:00Z"}


class MockWriter:
    def __init__(self, out: Path) -> None:
        self.out = out
        self.index: dict[str, str] = {}

    def write(self, request: str, relative: str, data: Any) -> None:
        path = self.out / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(p.dumps(data), encoding="utf-8", newline="\n")
        self.index[request] = relative

    def close(self) -> None:
        (self.out / "index.json").write_text(p.dumps(dict(sorted(self.index.items()))), encoding="utf-8", newline="\n")


def cited_sources(details: list[dict[str, Any]]) -> list[str]:
    return sorted({ref["source"] for detail in details for ref in detail["sources"]})


def write_knowledge(index: p.ContentIndex, w: MockWriter) -> None:
    w.write("GET /domains", "domains.json", p.domain_list(index))
    for domain in index.domains:
        slug = domain["domain"]["slug"]
        w.write(f"GET /domains/{slug}", f"domains/{slug}.json", p.domain_detail(index, slug))
    w.write(f"GET /concepts?limit={LIST_LIMIT}", "concepts.json", p.concept_list(index, limit=LIST_LIMIT))
    w.write(f"GET /technologies?limit={LIST_LIMIT}", "technologies.json", p.technology_list(index, limit=LIST_LIMIT))
    details = []
    for slug in CONCEPTS:
        details.append(p.concept_detail(index, slug))
        w.write(f"GET /concepts/{slug}", f"concepts/{slug}.json", details[-1])
    for slug in TECHNOLOGIES:
        details.append(p.technology_detail(index, slug))
        w.write(f"GET /technologies/{slug}", f"technologies/{slug}.json", details[-1])
    w.write(f"GET /snippets?limit={LIST_LIMIT}", "snippets.json", p.snippet_list(index, limit=LIST_LIMIT))
    snippets = sorted(e["slug"] for e in index.entities.values() if e["type"] == p.SNIPPET_TYPE)
    for slug in snippets:
        details.append(p.snippet_detail(index, slug))
        w.write(f"GET /snippets/{slug}", f"snippets/{slug}.json", details[-1])
    for slug in [*CONCEPTS, *TECHNOLOGIES, *snippets]:
        w.write(f"GET /entities/{slug}/relations", f"relations/{slug}.json", p.relation_groups(index, slug))
    for slug in cited_sources(details):
        w.write(f"GET /sources/{slug}", f"sources/{slug}.json", p.source_detail(index, slug))
    for query in QUERIES:
        w.write(f"GET /search?q={query}", f"search/{query}.json", p.search(index, query))


def write_me(w: MockWriter) -> None:
    ordered = sorted(STUDY_STATES, key=lambda s: s["updated_at"], reverse=True)
    w.write("GET /me/study-state", "me/study-state.json", {"total": len(ordered), "limit": 50, "offset": 0, "items": ordered})
    needs_review = [s for s in ordered if s["state"] == "needs_review"]
    w.write("GET /me/study-state?state=needs_review", "me/study-state-needs-review.json",
            {"total": len(needs_review), "limit": 50, "offset": 0, "items": needs_review})
    w.write("GET /me/study-state/change-data-capture", "me/study-state/change-data-capture.json", STUDY_STATES[0])
    w.write("PUT /me/study-state/change-data-capture", "me/study-state/change-data-capture.json", STUDY_STATES[0])
    w.write("GET /me/study-state/etl-vs-elt", "me/study-state/etl-vs-elt.json",
            {"slug": "etl-vs-elt", "state": "not_reviewed", "pending_deep_dive": False, "last_studied_at": None, "updated_at": None})
    w.write("GET /me/notes/change-data-capture", "me/notes/change-data-capture.json", {"slug": "change-data-capture", "items": [NOTE]})
    w.write("POST /me/notes/change-data-capture", "me/notes/change-data-capture.created.json", NOTE)
    w.write("PUT /me/notes/change-data-capture/note-0001", "me/notes/change-data-capture.updated.json", NOTE_UPDATED)
    w.write("GET /me/favorites", "me/favorites.json", {"total": 1, "limit": 50, "offset": 0, "items": [FAVORITE]})
    w.write("GET /me/favorites/change-data-capture", "me/favorites/change-data-capture.json", FAVORITE)
    w.write("PUT /me/favorites/change-data-capture", "me/favorites/change-data-capture.json", FAVORITE)


def build(
    out: Path,
    content_dir: Path = ROOT / "content",
    schemas_dir: Path = ROOT / "schemas",
    index: p.ContentIndex | None = None,
) -> dict[str, str]:
    """Escribe los mocks. Con `index` usa ese índice (p. ej. leído de PostgreSQL) en vez de content/."""
    index = index or p.load_index(content_dir, schemas_dir)
    if out.exists():
        shutil.rmtree(out)
    writer = MockWriter(out)
    write_knowledge(index, writer)
    write_me(writer)
    writer.close()
    return writer.index


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Genera docs/contracts/mock-data/ desde content/.")
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args(argv)
    written = build(args.out)
    print(f"mocks: {len(written)} respuestas en {args.out}")


if __name__ == "__main__":
    main()

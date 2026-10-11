"""Genera frontend/public/data/ para la demo estática: una respuesta JSON por cada GET de la API.

Usa la misma proyección y el mismo formato que los mocks (scripts/contracts/build_mocks.py), pero
para todo el contenido: dominios, los conceptos del blueprint (con y sin ficha), tecnologías,
snippets, relaciones de cada entidad y fuentes. index.json asocia "GET /ruta" con su archivo,
como lo lee frontend/lib/api/staticRead.ts. search-index.json alimenta la búsqueda del navegador
(frontend/lib/browserSearch.ts). Excluye /me y /search: en estático el estado personal va a
localStorage y la búsqueda es local.

Determinista e idempotente: borra y reescribe el directorio.

Uso: python -m scripts.static.build_static_data [--out DIR]
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Any

from backend.app import projection as p
from scripts.contracts.build_mocks import LIST_LIMIT, MockWriter

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "frontend" / "public" / "data"
SEARCH_TYPES = {"concept", "pattern", "architecture", *p.TECHNOLOGY_TYPES, p.SNIPPET_TYPE}  # sin fuentes: no tienen página


def slugs_of(index: p.ContentIndex, types: set[str]) -> list[str]:
    return sorted(e["slug"] for e in index.entities.values() if e["type"] in types)


def write_knowledge(index: p.ContentIndex, w: MockWriter) -> None:
    w.write("GET /domains", "domains.json", p.domain_list(index))
    for domain in index.domains:
        slug = domain["domain"]["slug"]
        w.write(f"GET /domains/{slug}", f"domains/{slug}.json", p.domain_detail(index, slug))
    w.write(f"GET /concepts?limit={LIST_LIMIT}", "concepts.json", p.concept_list(index, limit=LIST_LIMIT))
    w.write(f"GET /technologies?limit={LIST_LIMIT}", "technologies.json", p.technology_list(index, limit=LIST_LIMIT))
    w.write(f"GET /snippets?limit={LIST_LIMIT}", "snippets.json", p.snippet_list(index, limit=LIST_LIMIT))
    concepts = sorted(index.concepts)
    technologies = slugs_of(index, p.TECHNOLOGY_TYPES)
    snippets = slugs_of(index, {p.SNIPPET_TYPE})
    for slug in concepts:
        w.write(f"GET /concepts/{slug}", f"concepts/{slug}.json", p.concept_detail(index, slug))
    for slug in technologies:
        w.write(f"GET /technologies/{slug}", f"technologies/{slug}.json", p.technology_detail(index, slug))
    for slug in snippets:
        w.write(f"GET /snippets/{slug}", f"snippets/{slug}.json", p.snippet_detail(index, slug))
    for slug in [*concepts, *technologies, *snippets]:
        w.write(f"GET /entities/{slug}/relations", f"relations/{slug}.json", p.relation_groups(index, slug))
    for slug in slugs_of(index, {"source"}):
        w.write(f"GET /sources/{slug}", f"sources/{slug}.json", p.source_detail(index, slug))


def search_documents(index: p.ContentIndex) -> list[dict[str, Any]]:
    """Mismos candidatos y texto que la búsqueda de la API, más las etiquetas de cada ficha."""
    documents = []
    for item in p.candidates(index):
        if item["type"] not in SEARCH_TYPES:
            continue
        documents.append({
            "id": f"{item['type']}:{item['slug']}",
            "slug": item["slug"],
            "title": item["title"],
            "type": item["type"],
            "domain": item["domain"],
            "classification": item["classification"],
            "has_page": item["has_page"],
            "snippet": item["text"],
            "tags": sorted(index.entities.get(item["slug"], {}).get("tags") or []),
            "aliases": item["aliases"],   # ADR-010; el navegador los indexa si browserSearch.ts los incluye
        })
    return sorted(documents, key=lambda d: d["id"])


def build(out: Path = OUT, content_dir: Path = ROOT / "content", schemas_dir: Path = ROOT / "schemas") -> dict[str, str]:
    index = p.load_index(content_dir, schemas_dir)
    if out.exists():
        shutil.rmtree(out)
    writer = MockWriter(out)
    write_knowledge(index, writer)
    writer.close()
    search_index = {"documents": search_documents(index)}
    (out / "search-index.json").write_text(p.dumps(search_index), encoding="utf-8", newline="\n")
    written: dict[str, str] = writer.index
    return written


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Genera los JSON de la demo estática.")
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args(argv)
    written = build(args.out)
    print(f"datos estáticos: {len(written)} respuestas en {args.out}")


if __name__ == "__main__":
    main()

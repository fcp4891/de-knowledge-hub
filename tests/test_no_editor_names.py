"""El contenido y lo que muestra cada ficha no nombran a quien edita ni al asistente que redacta.

Las fechas de aprobación y verificación (owner_approved_at, last_verified) se conservan; los nombres, no.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from backend.app import projection

ROOT = Path(__file__).resolve().parent.parent
NAMES = re.compile(r"felipe|claude", re.IGNORECASE)
DETAIL = {
    "concept": projection.concept_detail,
    "architecture": projection.concept_detail,
    "pattern": projection.concept_detail,
    "technology": projection.technology_detail,
    "cloud_service": projection.technology_detail,
    "code_snippet": projection.snippet_detail,
    "source": projection.source_detail,
}


def hits(text: str) -> list[str]:
    return [text[max(0, m.start() - 40):m.end() + 40] for m in NAMES.finditer(text)]


def test_content_files_name_no_editor() -> None:
    found = {
        str(path.relative_to(ROOT)): hits(path.read_text(encoding="utf-8"))
        for path in (ROOT / "content").rglob("*")
        if path.suffix in (".md", ".yaml", ".yml", ".json")
    }
    assert {path: found_hits for path, found_hits in found.items() if found_hits} == {}


def test_rendered_fichas_name_no_editor() -> None:
    index = projection.load_index(ROOT / "content", ROOT / "schemas")
    found: dict[str, list[str]] = {}
    for slug, entity in index.entities.items():
        detail = DETAIL[entity["type"]]
        text_hits = hits(json.dumps(detail(index, slug), ensure_ascii=False, default=str))
        if text_hits:
            found[slug] = text_hits
    assert found == {}

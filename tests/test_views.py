"""Vistas estructuradas de una ficha (ADR-030): marcas, datos y fuentes agrupadas."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from backend.content import views
from tests.test_page_sections import TITLES, full_body, with_template  # noqa: F401
from tests.test_validate import assert_error, concept, content, run, write_md  # noqa: F401

LANES = {"lanes": [{"title": "Proteger", "items": [{"title": "Privilegios", "text": "Mínimos."}]}]}
GROUPED = {"groups": [{"title": "Docs", "sources": [{"title": "A", "urls": ["https://example.org/a"], "publisher": "X"}]}]}


def test_marker_needs_data_and_data_needs_marker() -> None:
    assert views.check({}, "<!-- view: central_idea -->", []) == ["[views] marca 'central_idea' sin datos en views"]
    assert views.check({"severity_cards": {}}, "texto", []) == [
        "[views] 'severity_cards' no se marca en el cuerpo con <!-- view: severity_cards -->"]
    assert views.check({"central_idea": {}}, "<!-- view: central_idea -->\n<!-- view: central_idea -->", []) == [
        "[views] marca 'central_idea' repetida"]


def test_placed_views_have_no_marker() -> None:
    assert views.check({"approach": {}}, "<!-- view: approach -->", []) == [
        "[views] 'approach' no lleva marca: su posición es fija"]
    assert views.check({"approach": {}}, "", []) == []


def test_sources_grouped_covers_each_citation_once() -> None:
    assert views.check({"sources_grouped": GROUPED}, "", ["https://example.org/a"]) == []
    errors = views.check({"sources_grouped": GROUPED}, "", ["https://example.org/b"])
    assert "[views.sources_grouped] 'https://example.org/a' no es una cita de sources" in errors
    assert "[views.sources_grouped] la cita 'https://example.org/b' no está en ningún grupo" in errors
    twice: dict[str, Any] = {"groups": [GROUPED["groups"][0], GROUPED["groups"][0]]}
    assert "[views.sources_grouped] 'https://example.org/a' está en más de un grupo o entrada" in views.check(
        {"sources_grouped": twice}, "", ["https://example.org/a"])


def practices_body(practices: str) -> str:
    return full_body(practices=practices)


def test_practice_lanes_replaces_the_practice_bullets(with_template: Path) -> None:  # noqa: F811
    body = practices_body("Ordenadas por etapa.\n\n<!-- view: practice_lanes -->")
    write_md(with_template, "concepts/a.md", concept("a", views={"practice_lanes": LANES}), body=body)
    assert run(with_template).ok
    write_md(with_template, "concepts/a.md", concept("a"), body=body)
    assert_error(run(with_template), "necesita la viñeta '- **Seguridad...**'")


def test_views_are_validated_against_the_schema(with_template: Path) -> None:  # noqa: F811
    bad = {"severity_cards": {"levels": [{"name": "Leve", "level": 4, "amount": "1", "examples": ["x"]}]}}
    write_md(with_template, "concepts/a.md", concept("a", views=bad), body=full_body() + "\n<!-- view: severity_cards -->\n")
    assert_error(run(with_template), "views.severity_cards.levels.0.level")

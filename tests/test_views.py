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


def test_every_link_in_a_view_is_a_citation() -> None:
    """ADR-030, enmienda 1: href y enlaces Markdown dentro de los textos deben estar en sources."""
    view = {"treatment_map": {"lead": "Ver [art. 2](https://example.org/ley).", "sources": [
        {"title": "Ley", "href": "https://example.org/ley", "detail": "x"}]}}
    body = "<!-- view: treatment_map -->"
    assert views.check(view, body, ["https://example.org/ley"]) == []
    assert views.check(view, body, []) == ["[views] el enlace 'https://example.org/ley' no es una cita de sources"]


def test_a_view_mark_is_section_content() -> None:
    from backend.content import page_sections
    assert not page_sections.is_empty("\n<!-- view: problem_journey -->\n")
    assert page_sections.is_empty("\n<!-- pendiente -->\n")


def test_anchors_must_exist_in_the_page() -> None:
    """ADR-030, enmienda 2: un ancla interna va a una sección presente, a un id de las vistas o al catálogo legal."""
    view = {"control_matrix": {"rows": [{"id": "matriz-finalidad"}]},
            "design_board": {"groups": [{"items": [{"tags": [{"label": "x", "href": "#matriz-finalidad"},
                                                             {"label": "y", "href": "#s10"},
                                                             {"label": "art. 15 bis", "href": "#lb-ley-19628-15-bis"},
                                                             {"label": "z", "href": "#matriz-otra"}]}]}]}}
    anchors = views.page_anchors(view, [4, 10], [{"law": "ley-19628", "article": "15 bis"}])
    body = "<!-- view: control_matrix -->\n<!-- view: design_board -->"
    assert views.check(view, body, [], anchors) == ["[views] el ancla '#matriz-otra' no existe en la ficha"]
    assert views.legal_row_id("ley-19628", "14 quáter") == "lb-ley-19628-14-quater"


def test_chile_data_protection_pills_link_to_real_anchors() -> None:
    """Cada píldora de Cómo funciona y Cuándo utilizarlo enlaza a un ancla que existe; «Ver código ↓» va al §10."""
    import yaml
    from pathlib import Path

    from backend.content import page_sections
    text = (Path(__file__).resolve().parent.parent / "content/concepts/chile-data-protection.md").read_text(encoding="utf-8")
    data = yaml.safe_load(text.split("---\n", 2)[1])
    present = [n for n, _, _ in page_sections.sections(page_sections.body_of(text))]
    anchors = views.page_anchors(data["views"], present, data["legal_basis"])
    tags = [tag for key in ("design_board", "when_to_use") for group in data["views"][key]["groups"]
            for item in group["items"] for tag in item["tags"]]
    assert tags and all(tag.get("href", "").startswith("#") for tag in tags)
    assert not [tag["href"] for tag in tags if tag["href"][1:] not in anchors]
    assert data["views"]["control_evidence"]["example"]["code_link"] == {"label": "Ver código ↓", "href": "#s10"}


def test_chile_data_protection_principles_practices_sanctions_and_questions() -> None:
    """Principios con píldoras, 13 prácticas (4 etapas y la franja «Demostrar»), 3 niveles con artículo y 4 modificadores,
    y 8 preguntas con píldoras; todas las anclas existen."""
    import yaml
    from pathlib import Path

    from backend.content import page_sections
    text = (Path(__file__).resolve().parent.parent / "content/concepts/chile-data-protection.md").read_text(encoding="utf-8")
    data = yaml.safe_load(text.split("---\n", 2)[1])
    v = data["views"]
    present = [n for n, _, _ in page_sections.sections(page_sections.body_of(text))]
    anchors = views.page_anchors(v, present, data["legal_basis"])
    principles = v["legal_foundations"]["principles"]
    assert len(principles) == 8 and all(p["tags"] for p in principles)
    lanes = v["practice_lanes"]
    assert [lane["title"] for lane in lanes["lanes"]] == ["Descubrir", "Proteger", "Operar", "Suprimir"]
    assert lanes["cross"]["title"] == "Demostrar"
    assert sum(len(lane["items"]) for lane in lanes["lanes"]) + len(lanes["cross"]["items"]) == 13
    sanctions = v["severity_cards"]
    assert [level["article"] for level in sanctions["levels"]] == ["art. 34 bis", "art. 34 ter", "art. 34 quáter"]
    assert [m["effect"] for m in sanctions["modifiers"]] == ["up", "up", "up", "down"]
    questions = v["open_questions"]["items"]
    assert len(questions) == 8 and all(q["tags"] for q in questions)
    tags = [t for p in principles for t in p["tags"]] + [t for q in questions for t in q["tags"]]
    assert not [t["href"] for t in tags if t["href"][1:] not in anchors]
    assert len(v["trade_offs"]["items"]) == 5 and v["trade_offs"]["items"][1]["a"] == "Seudonimización"

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


ROLES = {"responsible": {"title": "Responsable", "lead": "Decide fines y medios.",
                         "decide": {"kicker": "Decide", "items": [{"title": "Negocio", "text": "Finalidad."}]},
                         "build": {"kicker": "Implementa", "items": [{"title": "Datos", "text": "Controles."}]}},
         "processor": {"title": "Encargado", "text": "Trata datos por cuenta del responsable."}}


def test_roles_validate_without_evaluate_or_alert(with_template: Path) -> None:  # noqa: F811
    """ADR-030, enmienda 4: responsible.evaluate y processor.alert son opcionales; con ellos también valida."""
    import copy
    write_md(with_template, "concepts/a.md", concept("a", views={"legal_foundations": {"title": "Roles", "roles": ROLES}}),
             body=full_body())
    assert run(with_template).ok
    full = copy.deepcopy(ROLES)
    full["responsible"]["evaluate"] = {"kicker": "Evalúa", "items": [{"title": "Privacidad", "text": "Riesgo."}]}
    full["processor"]["alert"] = {"title": "Ojo", "text": "Si los cede, es responsable."}
    write_md(with_template, "concepts/a.md", concept("a", views={"legal_foundations": {"title": "Roles", "roles": full}}),
             body=full_body())
    assert run(with_template).ok


def test_keyed_views_need_one_marker_per_entry() -> None:
    """ADR-030, enmienda 5: «<!-- view: note <id> -->» toma views.notes.<id>; cada entrada se marca una vez."""
    view = {"notes": {"a": {"text": "x"}, "b": {"text": "y"}}, "chips": {"c": {"label": "z", "items": []}}}
    body = "<!-- view: note a -->\n<!-- view: note b -->\n<!-- view: chips c -->"
    assert views.check(view, body, []) == []
    assert views.check(view, "<!-- view: note a -->\n<!-- view: chips c -->\n<!-- view: note x -->", []) == [
        "[views] marca 'note x' sin datos en views.notes", "[views] views.notes.b no se marca con <!-- view: note b -->"]
    assert views.check({}, "<!-- view: otra a -->", []) == ["[views] marca 'otra a' desconocida"]


def test_section_refs_and_internal_links_are_checked() -> None:
    """Enmienda 5: «[§](#sN)» es un ancla de la ficha; los enlaces /concepts/<slug>/ y las entradas page se listan."""
    view = {"notes": {"a": {"text": "Ver [§](#s4) y [la ficha](/concepts/otra/#x)."}},
            "chips": {"c": {"label": "z", "items": [{"label": "y", "href": "/concepts/tercera/"}]}},
            "sources_grouped": {"groups": [{"title": "g", "sources": [{"title": "t", "page": "cuarta", "label": "Ficha"}]}]}}
    body = "<!-- view: note a -->\n<!-- view: chips c -->"
    assert views.check(view, body, [], {"s3"}) == ["[views] el ancla '#s4' no existe en la ficha"]
    assert views.check(view, body, [], {"s4"}) == []
    assert sorted(views.internal_targets(view)) == ["cuarta", "otra", "tercera"]


def test_articles_cited_by_views() -> None:
    """ADR-023, enmienda 9: los artículos que las vistas citan con enlace cuentan como citados por la ficha."""
    url = "https://example.org/ley"
    view = {"concept_map": {"personal": {"kicker": f"Dato personal · [art. 2 letra f]({url})"}},
            "notes": {"a": {"text": f"Cifrado [(art. 14 quinquies letra a)]({url}); regla [art. 16 quáter]({url})."}},
            "trade_offs": {"items": [{"resolution": "las reglas del art. 2 letra g)."}]}}
    assert views.cited_articles(view) == {"2", "14 quinquies", "16 quáter"}


def test_pii_identification_views_are_complete() -> None:
    """Las 11 secciones de la maqueta: cada sección presente tiene título visible y toda vista con datos tiene marca."""
    import yaml
    from pathlib import Path

    from backend.content import page_sections
    text = (Path(__file__).resolve().parent.parent / "content/concepts/pii-identification.md").read_text(encoding="utf-8")
    data = yaml.safe_load(text.split("---\n", 2)[1])
    body = page_sections.body_of(text)
    present = [n for n, _, _ in page_sections.sections(body) if n != 22]
    assert present == [1, 2, 3, 4, 5, 10, 11, 14, 16, 18, 20]
    assert [t["section"] for t in data["views"]["section_titles"]] == present
    assert data["verification_status"] == "review_required" and "owner_approved_at" not in data
    assert len(data["views"]["decision_tree"]["examples"]) == 8 and len(data["views"]["practice_pairs"]["items"]) == 8
    assert [r["count"] for r in data["views"]["coverage_strip"]["rows"]] == ["3 de 9", "7 de 9", "9 de 9"]

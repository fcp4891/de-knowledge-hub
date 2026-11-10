"""Tests de la estructura de fichas: las 22 secciones de la plantilla (§22)."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

from backend.content import page_sections
from tests.test_blueprint import bp_concept, domain_doc, write_domain
from tests.test_validate import assert_error, concept, content, entity, run, write_md  # noqa: F401

ROOT = Path(__file__).resolve().parent.parent
TITLES = page_sections.template_titles(ROOT / "content")


PRACTICES = "- **Seguridad:** x.\n- **Observabilidad:** y.\n- **Costo:** z."


def full_body(titles: list[str] | None = None, empty: int | None = None, practices: str = PRACTICES) -> str:
    titles = titles or TITLES or []

    def content(n: int) -> str:
        if n == empty:
            return "<!-- solo comentario -->"
        return practices if n == page_sections.PRACTICES_SECTION else "Contenido."

    parts = [f"## {n}. {t}\n\n{content(n)}\n" for n, t in enumerate(titles, 1)]
    return "\n".join(parts)


@pytest.fixture
def with_template(content: Path) -> Path:
    (content / "_templates").mkdir()
    shutil.copy(ROOT / "content/_templates/concept.md", content / "_templates/concept.md")
    return content


def test_template_has_22_sections() -> None:
    assert TITLES is not None and len(TITLES) == 22
    assert TITLES[0] == "Resumen" and TITLES[-1] == "Historial de cambios importantes"


def test_complete_page_is_valid(with_template: Path) -> None:
    write_md(with_template, "concepts/a.md", concept("a"), body=full_body())
    assert run(with_template).ok


def test_pattern_pages_are_checked(with_template: Path) -> None:
    pattern = entity("pattern", "p", domain="pipelines", classification="core", level="intermediate")
    write_md(with_template, "concepts/p.md", pattern, body="## 1. Resumen\n\nx\n")
    assert_error(run(with_template), "[secciones]")


def test_missing_section(with_template: Path) -> None:
    body = full_body(TITLES[:21])
    write_md(with_template, "concepts/a.md", concept("a"), body=body)
    assert_error(run(with_template), "faltan [22]")


def test_sections_out_of_order(with_template: Path) -> None:
    sections = full_body().split("\n## ")
    sections[1], sections[2] = sections[2], sections[1]
    write_md(with_template, "concepts/a.md", concept("a"), body="\n## ".join(sections))
    assert_error(run(with_template), "orden encontrado")


def test_wrong_title(with_template: Path) -> None:
    titles = list(TITLES)
    titles[5] = "Cuándo evitarlo"
    write_md(with_template, "concepts/a.md", concept("a"), body=full_body(titles))
    assert_error(run(with_template), "la sección 6 debe titularse 'Cuándo no utilizarlo'")


def test_section_with_only_a_comment_is_empty(with_template: Path) -> None:
    write_md(with_template, "concepts/a.md", concept("a"), body=full_body(empty=18))
    assert_error(run(with_template), "la sección 18 ('Preguntas técnicas abiertas') está vacía")


def test_practices_need_security_observability_and_cost(with_template: Path) -> None:
    body = full_body(practices="- **Seguridad:** x.\n- Observabilidad sin rótulo.\n- **Costo y capacidad:** z.")
    write_md(with_template, "concepts/a.md", concept("a"), body=body)
    report = run(with_template)
    assert_error(report, "necesita la viñeta '- **Observabilidad...**'")
    assert not any("Seguridad..." in e or "Costo..." in e for e in report.errors)


def test_check_practices_only_looks_at_section_14() -> None:
    assert page_sections.check_practices("## 14. Buenas prácticas\n\n- **Seguridad:** x.\n") != []
    assert page_sections.check_practices("## 1. Qué resuelve\n\nx\n") == []


def test_stub_is_exempt(with_template: Path) -> None:
    write_md(with_template, "concepts/a.md", concept("a", stub=True), body="<!-- pendiente -->\n")
    assert run(with_template).ok


def test_without_template_the_check_is_skipped(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a"), body="sin secciones\n")
    assert run(content).ok


# --- Coherencia con el blueprint ---------------------------------------------


def test_page_domain_must_match_blueprint(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a"), subdomain="core-topics"))
    write_domain(content, domain_doc("05", "pipelines", bp_concept("b"), subdomain="ingestion"))
    write_md(content, "concepts/a.md", concept("a", domain="pipelines", subdomain="ingestion"))
    assert_error(run(content), "el blueprint ubica 'a' en fundamentals/core-topics, no en pipelines/ingestion")


def test_page_matching_blueprint_is_valid(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a"), subdomain="core-topics"))
    write_md(content, "concepts/a.md", concept("a", domain="fundamentals", subdomain="core-topics"))
    assert run(content).ok


# --- related_topics también en relations (criterio de la revisión B-F3.1) ------


def test_related_topic_must_be_a_relation(content: Path) -> None:
    write_md(content, "concepts/b.md", concept("b"))
    write_md(content, "concepts/a.md", concept("a", related_topics=["b"]))
    assert_error(run(content), "[related_topics] 'b' no está en relations")


def test_related_topic_with_relation_is_valid(content: Path) -> None:
    write_md(content, "concepts/b.md", concept("b"))
    write_md(content, "concepts/a.md", concept("a", related_topics=["b"], relations=[{"type": "RELATED_TO", "target": "b"}]))
    assert run(content).ok


# --- Code Library (§23, ADR-008) ----------------------------------------------

SNIPPET_TITLES = page_sections.template_titles(ROOT / "content", page_sections.SNIPPET_TEMPLATE)


def snippet(slug: str, **fields: object) -> dict[str, object]:
    defaults: dict[str, object] = {
        "language": "sql", "requirements": ["una tabla de staging"],
        "relations": [{"type": "IMPLEMENTS", "target": "a"}],
    }
    return entity("code_snippet", slug, **{**defaults, **fields})


def verified_concept(content: Path, verification_status: str = "verified") -> None:
    from tests.test_validate import source, write_yaml

    write_yaml(content, "sources/r.yaml", source("docs-a"))
    write_md(content, "concepts/a.md", concept("a", verification_status=verification_status, sources=[{"source": "docs-a", "url": "https://example.org/docs-a"}]))


def test_snippet_template_has_10_sections() -> None:
    assert SNIPPET_TITLES is not None and len(SNIPPET_TITLES) == 10
    assert SNIPPET_TITLES[1] == "Código" and SNIPPET_TITLES[-1] == "Historial de cambios"


def test_complete_snippet_is_valid(content: Path) -> None:
    verified_concept(content)
    write_md(content, "snippets/s.md", snippet("s"), body=full_body(SNIPPET_TITLES))
    assert run(content).ok


def test_snippet_sections_follow_their_template(content: Path) -> None:
    (content / "_templates").mkdir()
    shutil.copy(ROOT / "content/_templates/snippet.md", content / "_templates/snippet.md")
    verified_concept(content)
    write_md(content, "snippets/s.md", snippet("s"), body=full_body(SNIPPET_TITLES[:9]))
    assert_error(run(content), "se esperan las 10 secciones de la plantilla en orden; faltan [10]")


def test_snippet_needs_requirements(content: Path) -> None:
    verified_concept(content)
    write_md(content, "snippets/s.md", snippet("s", requirements=[]))
    assert_error(run(content), "[requirements] un snippet debe indicar qué necesita para ejecutarse")


def test_snippet_must_implement_a_verified_page(content: Path) -> None:
    verified_concept(content, verification_status="review_required")
    write_md(content, "snippets/s.md", snippet("s"))
    assert_error(run(content), "al menos un IMPLEMENTS hacia un concept o pattern verified")


# --- Arquitecturas de referencia (ADR-028) -----------------------------------

ARCH_TITLES = page_sections.template_titles(ROOT / "content", page_sections.ARCHITECTURE_TEMPLATE)
VIEW = "```mermaid\nflowchart LR\n  A[\"Origen\"] --> B[\"Plataforma\"] --> C[\"Consumidor\"]\n```"


def architecture_body(views: dict[int, str] | None = None) -> str:
    views = {3: VIEW, 5: VIEW, 6: VIEW} if views is None else views
    titles = ARCH_TITLES or []
    return "\n".join(f"## {n}. {t}\n\n{views.get(n, 'Contenido.')}\n" for n, t in enumerate(titles, 1))


def architecture(slug: str = "arq") -> dict[str, object]:
    return entity("architecture", slug, domain="architecture", classification="core", level="intermediate")


@pytest.fixture
def with_architecture_template(content: Path) -> Path:
    (content / "_templates").mkdir()
    shutil.copy(ROOT / "content/_templates/architecture.md", content / "_templates/architecture.md")
    return content


def test_architecture_template_has_22_sections_and_three_views() -> None:
    assert ARCH_TITLES is not None and len(ARCH_TITLES) == 22
    assert [ARCH_TITLES[n - 1] for n in page_sections.VIEW_SECTIONS] == ["Vista de contexto", "Vista de datos", "Vista de despliegue"]
    assert ARCH_TITLES[10:13] == ["GCP", "AWS", "Azure"] and ARCH_TITLES[16] == "Conceptos relacionados"


def test_complete_architecture_is_valid_without_practice_bullets(with_architecture_template: Path) -> None:
    write_md(with_architecture_template, "architectures/arq.md", architecture(), body=architecture_body())
    report = run(with_architecture_template)
    assert report.ok, report.errors


def test_architecture_needs_each_view(with_architecture_template: Path) -> None:
    write_md(with_architecture_template, "architectures/arq.md", architecture(), body=architecture_body({3: VIEW, 6: VIEW}))
    assert_error(run(with_architecture_template), "[§5] la vista de datos necesita un diagrama Mermaid (ADR-028)")


def test_architecture_view_counts_subgraphs_as_nodes(with_architecture_template: Path) -> None:
    nodes = "\n".join(f"  N{i}[\"n{i}\"] --> N{i + 1}[\"n{i + 1}\"]" for i in range(6))   # 7 nodos
    big = f"```mermaid\nflowchart TB\n  subgraph S[\"Capa\"]\n{nodes}\n  end\n  subgraph T[\"Otra\"]\n  end\n```"
    write_md(with_architecture_template, "architectures/arq.md", architecture(), body=architecture_body({3: VIEW, 5: big, 6: VIEW}))
    assert_error(run(with_architecture_template), "[§5] la vista de datos tiene 9 nodos contando los subgraph; máximo 8")


# --- Excepción de chile-data-protection (ADR-029) ------------------------------

CDP = "chile-data-protection"
CDP_OMITTED = {6, 7, 8, 12, 13, 15, 17, 19, 21}


def body_without(omitted: set[int], tail: str = "") -> str:
    parts = [f"## {n}. {t}\n\n{PRACTICES if n == page_sections.PRACTICES_SECTION else 'Contenido.'}\n"
             for n, t in enumerate(TITLES, 1) if n not in omitted]
    return "\n".join(parts) + tail


def test_chile_data_protection_may_omit_its_sections_and_keep_an_annex(with_template: Path) -> None:
    write_md(with_template, f"concepts/{CDP}.md", concept(CDP), body=body_without(CDP_OMITTED, "\n## Anexo · Catálogo\n\nx\n"))
    assert run(with_template).ok


def test_chile_data_protection_may_still_have_all_sections(with_template: Path) -> None:
    write_md(with_template, f"concepts/{CDP}.md", concept(CDP), body=full_body())
    assert run(with_template).ok


def test_other_pages_keep_the_22_sections(with_template: Path) -> None:
    write_md(with_template, "concepts/a.md", concept("a"), body=body_without(CDP_OMITTED))
    assert_error(run(with_template), "faltan [6, 7, 8, 12, 13, 15, 17, 19, 21]")


def test_chile_data_protection_cannot_omit_other_sections(with_template: Path) -> None:
    write_md(with_template, f"concepts/{CDP}.md", concept(CDP), body=body_without(CDP_OMITTED | {5}))
    assert_error(run(with_template), "faltan [5]")


def test_annex_only_in_the_excepted_page(with_template: Path) -> None:
    write_md(with_template, "concepts/a.md", concept("a"), body=full_body() + "\n## Anexo · Catálogo\n\nx\n")
    assert_error(run(with_template), "solo las fichas con la excepción del ADR-029 llevan anexos")


def test_annex_goes_last_and_is_not_empty() -> None:
    assert page_sections.check_annexes("## 22. Historial\n\nx\n\n## Anexo · A\n\n<!-- nada -->\n", CDP) == [
        "[secciones] el anexo 'A' está vacío"]
    assert page_sections.check_annexes("## Anexo · A\n\nx\n\n## 22. Historial\n\nx\n", CDP) == [
        "[secciones] los anexos van después de la última sección"]


def test_annex_does_not_belong_to_the_last_section() -> None:
    body = "## 22. Historial\n\n- línea\n\n## Anexo · Catálogo\n\n### Grupo\n\n- art.\n"
    assert page_sections.sections(body) == [(22, "Historial", "\n- línea\n")]
    assert page_sections.annexes(body) == [("Catálogo", "\n### Grupo\n\n- art.")]

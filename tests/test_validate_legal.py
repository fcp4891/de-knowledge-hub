"""Tests de las reglas de ADR-023 (contenido con origen legal) en backend/content/validate.py."""

from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Any

import pytest

from backend.content import validate as v
from tests.test_validate import TODAY, assert_error, concept, entity, run, source, write_md, write_yaml

LAW_URL = "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01"

BODY = f"""## 1. Resumen

Resumen. Esta ficha no es asesoría legal.

## 2. Qué es

- **[Obligación legal · art. 3]** Los principios rigen el tratamiento.
- **[Buena práctica]** Un catálogo con la finalidad de cada dataset.

## 3. Problema que resuelve

**[Decisión de arquitectura]** Los datos personales quedan en una capa aparte.

## 8. Ejemplo de producción

### Evidencia de cumplimiento

| Evidencia | Dónde |
|---|---|
| Informe | CI |

## 11. GCP

| | Este ejemplo | Google Cloud | Etiqueta |
|---|---|---|---|
| Qué | A | B | **[Buena práctica]** |
"""


def legislative(slug: str = "bcn-leychile", **fields: Any) -> dict[str, Any]:
    data = entity("source", slug, url="https://www.bcn.cl/leychile/", source_type="legislative", authority_level=1,
                  provider="bcn", jurisdiction=["CL"], review_frequency="monthly")
    return {k: val for k, val in {**data, **fields}.items() if val is not None}


def legal_concept(slug: str = "chile-data-protection", **fields: Any) -> dict[str, Any]:
    defaults = {
        "domain": "compliance",
        "jurisdiction": ["CL"],
        "sources": [
            {"source": "bcn-leychile", "url": LAW_URL, "accessed": TODAY, "page_title": "Ley Chile - Ley 19628"},
            {"source": "docs-a", "url": "https://example.org/a"},
        ],
        "legal_basis": [{"law": "ley-19628", "article": "3", "url": LAW_URL}],
    }
    return concept(slug, **{**defaults, **fields})


def setup(content: Path, body: str = BODY, **fields: Any) -> v.Report:
    write_yaml(content, "sources/r.yaml", legislative(), source("docs-a"))
    write_md(content, "concepts/chile-data-protection.md", legal_concept(**fields), body)
    return run(content)


@pytest.fixture
def content(tmp_path: Path) -> Path:
    return tmp_path / "content"


def test_compliant_legal_concept_passes(content: Path) -> None:
    report = setup(content)
    assert report.ok, report.errors


def test_legislative_source_needs_one_jurisdiction_monthly_review_and_level_1(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", legislative(jurisdiction=None, review_frequency="quarterly", authority_level=2))
    report = run(content)
    assert_error(report, "[jurisdiction] una fuente legislative declara exactamente un país",
                 "[review_frequency] una fuente legislative se revisa monthly", "legislative corresponde al Nivel 1")


def test_jurisdiction_only_in_compliance_fichas(content: Path) -> None:
    report = setup(content, domain="pipelines")
    assert_error(report, "[jurisdiction] solo en fichas (concept o pattern) del dominio compliance")


def test_legislative_source_only_in_fichas_with_jurisdiction(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", legislative())
    write_md(content, "concepts/p.md", concept("p", sources=[{"source": "bcn-leychile", "url": LAW_URL}]))
    assert_error(run(content), "[sources.0] 'bcn-leychile' es legislative: solo en fichas con jurisdiction")


def test_disclaimer_evidence_labels_and_label_column_are_required(content: Path) -> None:
    body = (BODY.replace("Esta ficha no es asesoría legal.", "")
            .replace("### Evidencia de cumplimiento", "### Evidencia")
            .replace("- **[Buena práctica]** Un catálogo", "- Un catálogo")
            .replace("| Etiqueta |", "| Nota |"))
    assert_error(setup(content, body), "falta el aviso «Esta ficha no es asesoría legal»",
                 "falta la subsección «### Evidencia de cumplimiento»", "[§2] ítem o párrafo sin etiqueta",
                 "[§11] tabla sin columna «Etiqueta»")


def test_articles_in_body_and_legal_basis_must_match(content: Path) -> None:
    body = BODY.replace("art. 3]", "art. 14 quinquies]")
    assert_error(setup(content, body), "el cuerpo cita art. 14 quinquies y no está en legal_basis",
                 "Ley 19.628, art. 3 está en legal_basis y el cuerpo no lo cita")


def test_article_in_two_laws_needs_the_law_in_the_label(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": LAW_URL}, {"law": "ley-21663", "article": "3", "url": LAW_URL}]
    assert_error(setup(content, legal_basis=basis), "art. 3 existe en varias leyes: la etiqueta debe nombrar la ley")
    report = setup(content, BODY.replace("art. 3]", "Ley 19.628, art. 3]") + "\n**[Obligación legal · Ley 21.663, art. 3]** Otra.\n",
                   legal_basis=basis)
    assert report.ok, report.errors


def test_legal_basis_url_must_be_a_legislative_citation(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": "https://example.org/a"}]
    assert_error(setup(content, legal_basis=basis), "[legal_basis.0.url] no es una cita legislative")


def test_verified_needs_owner_approval_and_legal_citation_accessed_on_last_verified(content: Path) -> None:
    sources = [{"source": "bcn-leychile", "url": LAW_URL, "accessed": "2026-09-01"}, {"source": "docs-a", "url": "https://example.org/a"}]
    report = setup(content, verification_status="verified", sources=sources)
    assert_error(report, "[owner_approved_at] verified exige la aprobación explícita del dueño",
                 f"[sources.0.accessed] la cita legal se consulta el día de last_verified ({TODAY})")
    assert setup(content, verification_status="verified", owner_approved_at=TODAY).ok


def test_owner_approval_or_legal_basis_without_jurisdiction_is_an_error(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"))
    write_md(content, "concepts/p.md", concept("p", owner_approved_at=TODAY))
    assert_error(run(content), "[owner_approved_at] requiere jurisdiction")


def test_monthly_review_is_a_warning(content: Path) -> None:
    setup(content)
    report = v.Report()
    docs = v.load_documents(content, report)
    by_slug = {d.data["slug"]: d for d in docs}
    v.check_legal_content(content, docs, by_slug, report, today=dt.date.fromisoformat(TODAY) + dt.timedelta(days=32))
    assert any("más de 31 días" in w for w in report.warnings), report.warnings
    assert report.ok, report.errors

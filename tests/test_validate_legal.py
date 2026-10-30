"""Tests de las reglas de ADR-023 (contenido con origen legal) en backend/content/validate.py."""

from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Any

import pytest

from backend.content import validate as v
from tests.test_validate import TODAY, assert_error, concept, entity, run, source, write_md, write_yaml

LAW_URL = "https://www.bcn.cl/leychile/navegar?idNorma=141599&idVersion=2026-12-01"
IMPL = "Cada principio necesita un control y una evidencia."

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
| Cómo | C | D | **[Decisión de arquitectura]** |
"""


def legislative(slug: str = "bcn-leychile", **fields: Any) -> dict[str, Any]:
    data = entity("source", slug, url="https://www.bcn.cl/leychile/", source_type="legislative", authority_level=1,
                  provider="bcn", jurisdiction=["CL"], review_frequency="monthly")
    return {k: val for k, val in {**data, **fields}.items() if val is not None}


def legal_concept(slug: str = "chile-data-protection", **fields: Any) -> dict[str, Any]:
    defaults = {
        "domain": "privacy-engineering",
        "jurisdiction": ["CL"],
        "sources": [
            {"source": "bcn-leychile", "url": LAW_URL, "accessed": TODAY, "page_title": "Ley Chile - Ley 19628"},
            {"source": "docs-a", "url": "https://example.org/a"},
        ],
        "legal_basis": [{"law": "ley-19628", "article": "3", "url": LAW_URL, "implication": IMPL}],
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


def test_jurisdiction_only_in_legal_domain_fichas(content: Path) -> None:
    report = setup(content, domain="pipelines")
    assert_error(report, "[jurisdiction] solo en fichas (concept o pattern) de los dominios privacy-engineering")


def test_privacy_engineering_is_a_legal_domain(content: Path) -> None:
    """Enmienda de ADR-023 por ADR-027: rige en el dominio 24 (19 se integró al 24 el 2026-10-30)."""
    report = setup(content, domain="privacy-engineering")
    assert report.ok, report.errors


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
    basis = [{"law": "ley-19628", "article": "3", "url": LAW_URL, "implication": IMPL}, {"law": "ley-21663", "article": "3", "url": LAW_URL, "implication": IMPL}]
    assert_error(setup(content, legal_basis=basis), "art. 3 existe en varias leyes: la etiqueta debe nombrar la ley")
    report = setup(content, BODY.replace("art. 3]", "Ley 19.628, art. 3]") + "\n**[Obligación legal · Ley 21.663, art. 3]** Otra.\n",
                   legal_basis=basis)
    assert report.ok, report.errors


def test_legal_basis_needs_an_implication(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": LAW_URL}]
    assert_error(setup(content, legal_basis=basis), "[legal_basis.0]", "'implication' is a required property")


def test_legal_basis_url_must_be_a_legislative_citation(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": "https://example.org/a", "implication": IMPL}]
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


# --- Marcos legales (ADR-027) -------------------------------------------------


def framework(url: str = "https://www.bcn.cl/leychile/navegar?idNorma=1209272", source: str = "bcn-leychile") -> dict[str, Any]:
    fact = {"key": "effective-date", "label": "Vigencia", "value": "2026-12-01", "url": url, "source": source,
            "verified_at": TODAY}
    return {"slug": "cl-ley-21719", "title": "Ley 21.719", "jurisdiction": "CL", "facts": [fact]}


def test_legal_framework_with_n1_url_and_legislative_source_passes(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", legislative(), source("docs-a"))
    write_yaml(content, "legal-frameworks/cl-ley-21719.yaml", framework())
    report = run(content)
    assert report.ok, report.errors


def test_legal_framework_url_must_be_bcn_or_congress(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", legislative(), source("docs-a"))
    write_yaml(content, "legal-frameworks/cl-ley-21719.yaml", framework(url="https://example.org/ley"))
    assert_error(run(content), "does not match")


def test_legal_framework_source_must_be_legislative(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", legislative(), source("docs-a"))
    write_yaml(content, "legal-frameworks/cl-ley-21719.yaml", framework(source="docs-a"))
    assert_error(run(content), "[facts.0.source] 'docs-a' no es una fuente legislative del registro")


# --- Enmienda 3: línea «Etiqueta: […]» en §4 y §11–13 -------------------------

UNIFORM_TABLE = "| Necesidad | Servicio |\n|---|---|\n| Auditar | Logs |\n| Descubrir | Escáner |\n"


def test_uniform_label_line_before_the_table_passes(content: Path) -> None:
    body = BODY + "\n## 12. AWS\n\nEtiqueta: **[Buena práctica]**\n\n" + UNIFORM_TABLE
    report = setup(content, body)
    assert report.ok, report.errors


def test_same_label_in_every_row_must_use_the_line(content: Path) -> None:
    table = ("| Necesidad | Servicio | Etiqueta |\n|---|---|---|\n| Auditar | Logs | **[Buena práctica]** |\n"
             "| Descubrir | Escáner | **[Buena práctica]** |\n")
    assert_error(setup(content, BODY + "\n## 12. AWS\n\n" + table),
                 "[§12] todas las filas llevan **[Buena práctica]**: va la línea «Etiqueta: **[Buena práctica]**»")


def test_table_without_column_or_line_is_an_error(content: Path) -> None:
    assert_error(setup(content, BODY + "\n## 12. AWS\n\nServicios de la nube.\n\n" + UNIFORM_TABLE),
                 "[§12] tabla sin columna «Etiqueta» ni línea «Etiqueta: […]» antes")


def test_label_line_does_not_replace_the_column_outside_4_and_11_to_13(content: Path) -> None:
    body = BODY.replace("## 3. Problema que resuelve\n\n",
                        "## 3. Problema que resuelve\n\nEtiqueta: **[Buena práctica]**\n\n" + UNIFORM_TABLE + "\n")
    assert_error(setup(content, body), "[§3] tabla sin columna «Etiqueta» (ADR-023)")




# --- Enmienda 4: marcos comparados (EU y BR) ----------------------------------

GDPR_URL = "https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807"


def setup_gdpr(content: Path, body: str, basis: list[dict[str, str]] | None = None) -> v.Report:
    eu = legislative("boe-doue", url="https://www.boe.es/", provider="boe", jurisdiction=["EU"])
    write_yaml(content, "sources/r.yaml", legislative(), eu, source("docs-a"))
    sources = [{"source": "bcn-leychile", "url": LAW_URL, "accessed": TODAY, "page_title": "Ley Chile - Ley 19628"},
               {"source": "boe-doue", "url": GDPR_URL, "accessed": TODAY, "page_title": "Documento DOUE-L-2016-80807"},
               {"source": "docs-a", "url": "https://example.org/a"}]
    gdpr = {"law": "eu-2016-679", "article": "33", "url": GDPR_URL, "implication": IMPL}
    basis = basis if basis is not None else [{"law": "ley-19628", "article": "3", "url": LAW_URL, "implication": IMPL}, gdpr]
    write_md(content, "concepts/gdpr.md", legal_concept("gdpr", jurisdiction=["CL", "EU"], sources=sources, legal_basis=basis), body)
    return run(content)


def test_eu_jurisdiction_with_gdpr_label_passes(content: Path) -> None:
    body = BODY + "\n**[Obligación legal · GDPR art. 33]** Notificar a la autoridad de control.\n"
    report = setup_gdpr(content, body.replace("## 3. Problema que resuelve\n\n", "## 3. Problema que resuelve\n\n**[Obligación legal · GDPR art. 33]** 72 horas.\n\n"))
    assert report.ok, report.errors


def test_gdpr_label_must_match_legal_basis(content: Path) -> None:
    body = BODY.replace("## 3. Problema que resuelve\n\n", "## 3. Problema que resuelve\n\n**[Obligación legal · GDPR art. 34]** Interesado.\n\n")
    assert_error(setup_gdpr(content, body), "el cuerpo cita GDPR art. 34 y no está en legal_basis",
                 "GDPR, art. 33 está en legal_basis y el cuerpo no lo cita")


def test_same_article_in_ley_and_gdpr_needs_the_law_in_the_label(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": LAW_URL, "implication": IMPL},
             {"law": "eu-2016-679", "article": "3", "url": GDPR_URL, "implication": IMPL}]
    assert_error(setup_gdpr(content, BODY, basis), "art. 3 existe en varias leyes: la etiqueta debe nombrar la ley")


def test_gdpr_basis_needs_an_eu_legislative_citation(content: Path) -> None:
    basis = [{"law": "ley-19628", "article": "3", "url": LAW_URL, "implication": IMPL},
             {"law": "eu-2016-679", "article": "33", "url": "https://example.org/a", "implication": IMPL}]
    body = BODY + "\n**[Obligación legal · GDPR art. 33]** 72 horas.\n"
    assert_error(setup_gdpr(content, body, basis), "[legal_basis.1.url] no es una cita legislative")

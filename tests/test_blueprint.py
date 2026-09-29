"""Tests de la validación de content/blueprint/ (ADR-003)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
import yaml

from tests.test_validate import assert_error, concept, content, run, technology, write_md, write_yaml  # noqa: F401


def bp_concept(slug: str, **fields: Any) -> dict[str, Any]:
    base = {
        "slug": slug,
        "title": slug.replace("-", " ").title(),
        "kind": "concept",
        "classification": "core",
        "level": "intermediate",
        "importance": "high",
        "mvp": False,
    }
    return {**base, **fields}


def domain_doc(domain_id: str, slug: str, *concepts: dict[str, Any], subdomain: str = "core-topics") -> dict[str, Any]:
    return {
        "domain": {"id": domain_id, "slug": slug, "title": slug.title(), "description": f"Dominio {slug}."},
        "subdomains": [{"slug": subdomain, "title": subdomain.title(), "concepts": list(concepts)}],
    }


def write_domain(content: Path, doc: dict[str, Any], filename: str | None = None) -> None:
    name = filename or f"{doc['domain']['id']}-{doc['domain']['slug']}.yaml"
    path = content / "blueprint" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(doc, allow_unicode=True, sort_keys=False), encoding="utf-8")


# --- Casos válidos -----------------------------------------------------------


def test_valid_blueprint_and_summary(content: Path) -> None:
    write_domain(
        content,
        domain_doc(
            "01",
            "fundamentals",
            bp_concept("idempotency", mvp=True),
            bp_concept("backfill", related_concepts=["idempotency"], added_by="blueprint"),
        ),
    )
    report = run(content)
    assert report.ok, report.errors
    row = report.blueprint_rows[0]
    assert (row.domain_id, row.concepts, row.mvp, row.added) == ("01", 2, 1, 1)


def test_blueprint_is_not_validated_as_entity(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency")))
    report = run(content)
    assert report.ok, report.errors
    assert report.documents == 0


def test_cross_domain_related_concepts(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency")))
    write_domain(content, domain_doc("05", "pipelines", bp_concept("backfill", related_concepts=["idempotency"])))
    assert run(content).ok


def test_mvp_outside_mvp_domains_with_reason(content: Path) -> None:
    write_domain(content, domain_doc("03", "python", bp_concept("retries-in-python", mvp=True, mvp_reason="Python (§51)")))
    assert run(content).ok


def test_related_technology_resolved(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka"))
    write_domain(content, domain_doc("14", "streaming", bp_concept("topics", related_technologies=["kafka"])))
    assert run(content).ok


def test_entity_matches_blueprint(content: Path) -> None:
    write_domain(content, domain_doc("05", "pipelines", bp_concept("cdc"), subdomain="ingestion"))
    write_md(content, "concepts/cdc.md", concept("cdc", domain="pipelines", subdomain="ingestion"))
    assert run(content).ok


# --- Errores -----------------------------------------------------------------


def test_invalid_blueprint_schema(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency", level="expert")))
    assert_error(run(content), "01-fundamentals.yaml", "[subdomains.0.concepts.0.level]")


def test_unknown_blueprint_field(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency", priority="high")))
    assert_error(run(content), "Additional properties are not allowed")


def test_mvp_reason_forbidden_when_not_mvp(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency", mvp_reason="x")))
    assert_error(run(content), "[subdomains.0.concepts.0]")


def test_filename_must_match_domain(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("idempotency")), filename="fundamentals.yaml")
    assert_error(run(content), "debe llamarse '01-fundamentals.yaml'")


def test_duplicate_concept_across_domains(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("backfill")))
    write_domain(content, domain_doc("05", "pipelines", bp_concept("backfill")))
    assert_error(run(content), "concepto 'backfill' duplicado")


def test_duplicate_domain(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a")))
    write_domain(content, domain_doc("01", "sql", bp_concept("b")))
    assert_error(run(content), "dominio duplicado")


def test_duplicate_subdomain(content: Path) -> None:
    doc = domain_doc("01", "fundamentals", bp_concept("a"))
    doc["subdomains"].append({"slug": "core-topics", "title": "Otra", "concepts": [bp_concept("b")]})
    write_domain(content, doc)
    assert_error(run(content), "subdominio duplicado")


def test_missing_related_concept(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a", related_concepts=["ghost"])))
    assert_error(run(content), "concepto inexistente: 'ghost'")


def test_self_related_concept(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a", related_concepts=["a"])))
    assert_error(run(content), "consigo mismo")


def test_mvp_outside_mvp_domains_without_reason(content: Path) -> None:
    write_domain(content, domain_doc("03", "python", bp_concept("retries-in-python", mvp=True)))
    assert_error(run(content), "[mvp_reason]")


def test_unresolved_related_technology_is_error(content: Path) -> None:
    write_domain(content, domain_doc("14", "streaming", bp_concept("topics", related_technologies=["gcp-pubsub"])))
    assert_error(run(content), "[related_technologies] tecnología inexistente: 'gcp-pubsub'")


def test_related_technology_with_wrong_type(content: Path) -> None:
    write_md(content, "concepts/b.md", concept("b", domain="fundamentals", subdomain="core-topics"))
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("b"), bp_concept("a", related_technologies=["b"])))
    assert_error(run(content), "[related_technologies] 'b' es concept")


@pytest.mark.parametrize(
    ("fields", "fragment"),
    [
        ({"domain": "ghost"}, "[domain] 'ghost' no existe"),
        ({"domain": "fundamentals", "subdomain": "ghost"}, "[subdomain] 'ghost' no existe"),
    ],
)
def test_entity_domain_must_exist(content: Path, fields: dict[str, Any], fragment: str) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("a")))
    write_md(content, "concepts/x.md", concept("x", **fields))
    assert_error(run(content), fragment)


def test_entity_type_must_match_kind(content: Path) -> None:
    write_domain(content, domain_doc("01", "fundamentals", bp_concept("kafka")))
    write_yaml(content, "technologies/kafka.yaml", technology("kafka"))
    assert_error(run(content), "[type] el blueprint declara 'kafka' como concept")

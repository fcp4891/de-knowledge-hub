"""Tests de backend/content/validate.py con contenido temporal y los schemas reales."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
import yaml

from backend.content import validate as v

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
TODAY = "2026-09-28"


def entity(type_: str, slug: str, **fields: Any) -> dict[str, Any]:
    base = {
        "id": f"{type_}:{slug}",
        "slug": slug,
        "type": type_,
        "title": slug.replace("-", " ").title(),
        "description": f"Descripción de {slug}.",
        "created_at": TODAY,
        "updated_at": TODAY,
        "verification_status": "review_required",
    }
    return {**base, **fields}


def concept(slug: str, **fields: Any) -> dict[str, Any]:
    defaults = {
        "domain": "pipelines",
        "classification": "core",
        "level": "intermediate",
        "importance": "high",
        "last_verified": TODAY,
    }
    return entity("concept", slug, **{**defaults, **fields})


def technology(slug: str, **fields: Any) -> dict[str, Any]:
    defaults = {"vendor": "open-source", "category": "stream-messaging", "classification": "modern"}
    return entity("technology", slug, **{**defaults, **fields})


def source(slug: str, source_type: str = "official_docs", authority_level: int = 1) -> dict[str, Any]:
    return entity(
        "source",
        slug,
        url="https://example.org/docs/",
        source_type=source_type,
        authority_level=authority_level,
        provider="example",
    )


def write_md(content: Path, relative: str, data: dict[str, Any], body: str = "## 1. Resumen\n") -> None:
    path = content / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(f"---\n{yaml.safe_dump(data, allow_unicode=True)}---\n\n{body}", encoding="utf-8")


def write_yaml(content: Path, relative: str, *docs: dict[str, Any]) -> None:
    path = content / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump_all(docs, allow_unicode=True), encoding="utf-8")


def run(content: Path) -> v.Report:
    return v.validate(content, SCHEMAS)


def assert_error(report: v.Report, *fragments: str) -> None:
    assert not report.ok
    joined = "\n".join(report.errors)
    for fragment in fragments:
        assert fragment in joined, f"'{fragment}' no aparece en:\n{joined}"


@pytest.fixture
def content(tmp_path: Path) -> Path:
    root = tmp_path / "content"
    root.mkdir()
    return root


# --- Contenido real ----------------------------------------------------------


def test_repository_content_is_valid() -> None:
    report = run(ROOT / "content")
    assert report.ok, "\n".join(report.errors)
    assert report.documents > 0


def test_main_returns_zero_for_repository(capsys: pytest.CaptureFixture[str]) -> None:
    assert v.main([]) == 0
    assert "OK:" in capsys.readouterr().out


# --- Casos válidos -----------------------------------------------------------


def test_minimal_valid_concept(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc"))
    report = run(content)
    assert report.ok, report.errors
    assert report.documents == 1


def test_valid_graph_with_relations_and_sources(content: Path) -> None:
    write_yaml(content, "sources/registry.yaml", source("docs-a"), source("docs-b"))
    write_md(
        content,
        "concepts/cdc.md",
        concept(
            "cdc",
            technologies=["kafka"],
            related_topics=["idempotency"],
            sources=[{"source": "docs-a", "url": "https://example.org/docs/cdc", "accessed": TODAY}],
            relations=[{"type": "RELATED_TO", "target": "idempotency"}],
        ),
    )
    write_md(content, "concepts/idempotency.md", concept("idempotency", stub=True))
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", relations=[{"type": "IMPLEMENTS", "target": "cdc"}]))
    report = run(content)
    assert report.ok, report.errors
    assert report.documents == 5


def test_verified_with_sources_is_valid(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"))
    write_md(content, "concepts/cdc.md", concept("cdc", verification_status="verified", sources=[{"source": "docs-a"}]))
    assert run(content).ok


def test_source_level_must_match_source_type(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("kimball", source_type="spec_paper", authority_level=1))
    assert_error(run(content), "[authority_level] spec_paper corresponde al Nivel 4, no al 1")


def test_page_may_cite_canonical_level_4_with_a_level_1_source(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"), source("kimball", "spec_paper", 4))
    write_md(content, "concepts/scd.md", concept("scd", sources=[{"source": "docs-a"}, {"source": "kimball"}]))
    assert run(content).ok


def test_page_rejects_level_3_and_5_sources(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"), source("blog", "engineering_blog", 3), source("wiki", "secondary", 5))
    write_md(content, "concepts/a.md", concept("a", sources=[{"source": "docs-a"}, {"source": "blog"}, {"source": "wiki"}]))
    assert_error(
        run(content),
        "[sources.1.source] 'blog' es Nivel 3: en fichas solo Nivel 1–2 o Nivel 4 canónico",
        "[sources.2.source] 'wiki' es Nivel 5",
    )


def test_page_needs_a_level_1_or_2_source(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("kimball", "spec_paper", 4))
    write_md(content, "concepts/scd.md", concept("scd", sources=[{"source": "kimball"}]))
    assert_error(run(content), "la ficha necesita al menos una fuente Nivel 1–2")


def test_underscore_directories_are_ignored(content: Path) -> None:
    write_md(content, "_templates/concept.md", {"type": "concept"})
    write_md(content, "concepts/cdc.md", concept("cdc"), body="## 1. Resumen\n\nContenido.\n")
    report = run(content)
    assert report.ok, report.errors
    assert report.documents == 1


# --- Errores de schema -------------------------------------------------------


def test_missing_required_field(content: Path) -> None:
    data = concept("cdc")
    del data["classification"]
    write_md(content, "concepts/cdc.md", data)
    assert_error(run(content), "concepts", "cdc.md", "'classification' is a required property")


def test_invalid_enum_value(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", classification="legacy"))
    assert_error(run(content), "[classification]", "'legacy' is not one of")


def test_unknown_property_is_rejected(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", clasification="core"))
    assert_error(run(content), "Unevaluated properties are not allowed", "clasification")


def test_technology_category_must_be_in_enum(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", category="streaming"))
    assert_error(run(content), "[category] 'streaming' is not one of")


def test_technology_mvp_must_be_boolean(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", mvp="yes"))
    assert_error(run(content), "[mvp]")


def test_stub_must_be_boolean(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", stub="yes"))
    assert_error(run(content), "[stub]")


def test_invalid_slug_format(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("Change_Data_Capture", id="concept:change-data-capture"))
    assert_error(run(content), "[slug]")


def test_invalid_date(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", last_verified="28-09-2026"))
    assert_error(run(content), "[last_verified]")


def test_unknown_type(content: Path) -> None:
    write_md(content, "concepts/x.md", entity("widget", "x"))
    assert_error(run(content), "type desconocido o ausente: 'widget'")


def test_verified_without_sources(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", verification_status="verified"))
    assert_error(run(content), "'sources' is a required property")


def test_markdown_without_frontmatter(content: Path) -> None:
    (content / "concepts").mkdir()
    (content / "concepts" / "cdc.md").write_text("# CDC\n", encoding="utf-8")
    assert_error(run(content), "no empieza con frontmatter")


def test_unclosed_frontmatter(content: Path) -> None:
    (content / "concepts").mkdir()
    (content / "concepts" / "cdc.md").write_text("---\ntitle: x\n", encoding="utf-8")
    assert_error(run(content), "sin delimitador de cierre")


def test_invalid_yaml(content: Path) -> None:
    (content / "sources").mkdir()
    (content / "sources" / "bad.yaml").write_text("id: [unclosed\n", encoding="utf-8")
    assert_error(run(content), "no se pudo parsear")


# --- Errores globales --------------------------------------------------------


def test_id_must_match_type_and_slug(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", id="concept:other"))
    assert_error(run(content), "[id] debe ser 'concept:cdc'")


def test_duplicate_slug(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc"))
    write_yaml(content, "technologies/cdc.yaml", technology("cdc"))
    assert_error(run(content), "[slug] 'cdc' duplicado")


def test_duplicate_within_multidocument_yaml(content: Path) -> None:
    write_yaml(content, "sources/registry.yaml", source("docs-a"), source("docs-a"))
    assert_error(run(content), "registry.yaml#1", "duplicado")


def test_relation_to_missing_slug(content: Path) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", relations=[{"type": "RELATED_TO", "target": "ghost"}]))
    assert_error(run(content), "RELATED_TO -> 'ghost'", "slug destino inexistente")


def test_relation_with_disallowed_source_type(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", relations=[{"type": "PRACTICES", "target": "b"}]))
    write_md(content, "concepts/b.md", concept("b"))
    assert_error(run(content), "origen de tipo concept no permitido")


def test_relation_with_disallowed_target_type(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"))
    write_md(content, "concepts/a.md", concept("a", relations=[{"type": "USES", "target": "docs-a"}]))
    assert_error(run(content), "destino de tipo source no permitido")


def test_alternative_to_rejects_different_type_group(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", relations=[{"type": "ALTERNATIVE_TO", "target": "kafka"}]))
    write_yaml(content, "technologies/kafka.yaml", technology("kafka"))
    assert_error(run(content), "concept y technology no pertenecen al mismo grupo")


def test_alternative_to_allows_technology_and_cloud_service(content: Path) -> None:
    service = entity(
        "cloud_service", "pubsub", provider="gcp", category="stream-messaging", classification="modern",
        relations=[{"type": "ALTERNATIVE_TO", "target": "kafka"}],
    )
    write_yaml(content, "technologies/pubsub.yaml", service)
    write_yaml(content, "technologies/kafka.yaml", technology("kafka"))
    assert run(content).ok


def test_self_relation(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", relations=[{"type": "RELATED_TO", "target": "a"}]))
    assert_error(run(content), "consigo misma")


def test_unknown_relation_type(content: Path) -> None:
    write_md(content, "concepts/b.md", concept("b"))
    write_md(content, "concepts/a.md", concept("a", relations=[{"type": "LIKES", "target": "b"}]))
    assert_error(run(content), "[relations.0.type]")


def test_missing_related_topic(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", related_topics=["ghost"]))
    assert_error(run(content), "[related_topics.0] slug inexistente")


def test_technologies_must_reference_technology(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", technologies=["b"]))
    write_md(content, "concepts/b.md", concept("b"))
    assert_error(run(content), "se esperaba technology o cloud_service")


def test_source_ref_must_point_to_source(content: Path) -> None:
    write_md(content, "concepts/a.md", concept("a", sources=[{"source": "b"}]))
    write_md(content, "concepts/b.md", concept("b"))
    assert_error(run(content), "[sources.0.source] 'b' es concept, no source")


def test_main_returns_one_on_errors(content: Path, capsys: pytest.CaptureFixture[str]) -> None:
    write_md(content, "concepts/cdc.md", concept("cdc", classification="legacy"))
    assert v.main(["--content", str(content)]) == 1
    assert "ERROR" in capsys.readouterr().out


# --- Coherencia de los schemas -----------------------------------------------


def load_json(name: str) -> dict[str, Any]:
    return json.loads((SCHEMAS / name).read_text(encoding="utf-8"))


def test_every_entity_type_has_a_schema() -> None:
    types = set(load_json("enums.schema.json")["$defs"]["entity_type"]["enum"])
    files = {p.name.removesuffix(".schema.json") for p in (SCHEMAS / "entities").glob("*.schema.json")}
    assert types == files


def test_relation_catalog_matches_enum() -> None:
    schema = load_json("relationships.schema.json")
    assert set(schema["$defs"]["relation_type"]["enum"]) == set(schema["x-relation-catalog"])


def test_relation_catalog_is_well_formed() -> None:
    types = set(load_json("enums.schema.json")["$defs"]["entity_type"]["enum"])
    for name, rule in load_json("relationships.schema.json")["x-relation-catalog"].items():
        assert rule["inverse"], name
        assert set(rule["source_types"]) <= types, name
        assert set(rule["target_types"]) <= types, name
        if rule["symmetric"]:
            assert rule["inverse"] == name.lower(), name
        for group in rule.get("type_groups", []):
            assert set(group) <= set(rule["source_types"]) & set(rule["target_types"]), name


ALL_TYPES = "*"
REQUIRED_PAIRS = [
    ("IMPLEMENTS", ["code_snippet"], ["concept", "pattern"]),
    ("USES", ["architecture"], ["technology", "cloud_service", "concept"]),
    ("PRACTICES", ["lab"], ["concept", "architecture"]),
    ("AFFECTS", ["news"], ["technology", "cloud_service"]),
    ("REQUIRES", ["job_description"], ["concept", "technology", "cloud_service"]),
    ("RUNS_ON", ["technology"], ["cloud_service"]),
    ("RELATED_TO", ALL_TYPES, ALL_TYPES),
]


@pytest.mark.parametrize(("relation", "sources", "targets"), REQUIRED_PAIRS)
def test_relation_catalog_covers_required_pairs(relation: str, sources: Any, targets: Any) -> None:
    """Pares que F2–F6 necesitan (acordados en el gate de F0)."""
    all_types = load_json("enums.schema.json")["$defs"]["entity_type"]["enum"]
    rule = load_json("relationships.schema.json")["x-relation-catalog"][relation]
    assert set(all_types if sources == ALL_TYPES else sources) <= set(rule["source_types"])
    assert set(all_types if targets == ALL_TYPES else targets) <= set(rule["target_types"])


def test_alternative_to_is_symmetric_within_type_groups() -> None:
    rule = load_json("relationships.schema.json")["x-relation-catalog"]["ALTERNATIVE_TO"]
    assert rule["symmetric"] is True
    assert ["technology", "cloud_service"] in rule["type_groups"]


# --- aliases (ADR-010) ---------------------------------------------------------


def test_aliases_are_a_list_of_unique_strings(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", aliases=["Kafka", "Apache Kafka"]))
    assert run(content).ok


def test_aliases_reject_duplicates_and_non_lists(content: Path) -> None:
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", aliases=["Kafka", "Kafka"]))
    assert_error(run(content), "[aliases]", "non-unique")
    write_yaml(content, "technologies/kafka.yaml", technology("kafka", aliases="Kafka"))
    assert_error(run(content), "[aliases]", "is not of type 'array'")


# --- Citas: page_title (ADR-012) ------------------------------------------------


def test_duplicate_citation_url_or_page_title_is_a_warning_not_an_error(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"), source("docs-b"))
    refs = [
        {"source": "docs-a", "url": "https://example.org/a", "page_title": "Partitioned tables"},
        {"source": "docs-b", "url": "https://example.org/a", "page_title": "Otra"},  # URL repetida: aviso siempre
        {"source": "docs-b", "url": "https://example.org/b", "page_title": "Partitioned tables"},  # otra fuente: sin aviso
        {"source": "docs-a", "url": "https://example.org/c", "page_title": "Partitioned tables"},  # misma fuente: aviso
        {"source": "docs-b", "url": "https://example.org/d"},
    ]
    write_md(content, "concepts/p.md", concept("p", sources=refs))
    report = run(content)
    assert report.ok, report.errors
    joined = "\n".join(report.warnings)
    assert "[sources.1.url] repite el de sources.0: 'https://example.org/a'" in joined
    assert "[sources.3.page_title] repite el de sources.0 con la misma fuente 'docs-a': 'Partitioned tables'" in joined
    assert len(report.warnings) == 2


def test_page_title_must_not_be_empty(content: Path) -> None:
    write_yaml(content, "sources/r.yaml", source("docs-a"))
    write_md(content, "concepts/p.md", concept("p", sources=[{"source": "docs-a", "url": "https://example.org/a", "page_title": ""}]))
    assert_error(run(content), "page_title")


def test_bigquery_citations_are_distinguishable_by_page_title() -> None:
    mock = json.loads((ROOT / "docs/contracts/mock-data/concepts/bigquery-partitioning.json").read_text(encoding="utf-8"))
    bq = [s for s in mock["sources"] if s["source"] == "gcp-bigquery-docs"]
    assert len(bq) >= 5 and len({s["title"] for s in bq}) == 1  # mismo registro
    assert all(s["page_title"] for s in bq) and len({s["page_title"] for s in bq}) == len(bq)


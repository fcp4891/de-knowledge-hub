"""Tests del contrato de API (docs/contracts/api.yaml) y sus mocks (ADR-002)."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import pytest
import yaml
from jsonschema import Draft202012Validator
from referencing import Registry
from referencing.jsonschema import DRAFT202012

from scripts.contracts import build_mocks
from backend.app import projection as p

ROOT = Path(__file__).resolve().parent.parent
API = yaml.safe_load((ROOT / "docs/contracts/api.yaml").read_text(encoding="utf-8"))
MOCKS = ROOT / "docs/contracts/mock-data"
INDEX: dict[str, str] = json.loads((MOCKS / "index.json").read_text(encoding="utf-8"))
ENUMS = json.loads((ROOT / "schemas/enums.schema.json").read_text(encoding="utf-8"))["$defs"]
RELATIONS = json.loads((ROOT / "schemas/relationships.schema.json").read_text(encoding="utf-8"))
REGISTRY = Registry().with_resource("urn:api", DRAFT202012.create_resource(API))


def pointer(*parts: str) -> str:
    return "/".join(part.replace("~", "~0").replace("/", "~1") for part in parts)


def match_path(path: str) -> str:
    """Plantilla de api.yaml que corresponde a una ruta concreta."""
    for template in API["paths"]:
        pattern = "^" + re.sub(r"\{[^}]+\}", "[^/]+", template) + "$"
        if re.match(pattern, path):
            return template
    raise AssertionError(f"ruta sin plantilla en api.yaml: {path}")


def response_validator(method: str, template: str) -> Draft202012Validator:
    responses = API["paths"][template][method.lower()]["responses"]
    status = "201" if "201" in responses else "200"
    ref = "urn:api#/" + pointer("paths", template, method.lower(), "responses", status, "content", "application/json", "schema")
    return Draft202012Validator({"$ref": ref}, registry=REGISTRY, format_checker=Draft202012Validator.FORMAT_CHECKER)


def split_request(request: str) -> tuple[str, str]:
    method, target = request.split(" ", 1)
    return method, target.split("?", 1)[0]


@pytest.mark.parametrize("request_key", sorted(INDEX))
def test_mock_matches_contract(request_key: str) -> None:
    method, path = split_request(request_key)
    template = match_path(path)
    assert method.lower() in API["paths"][template], f"{method} no definido en {template}"
    data = json.loads((MOCKS / INDEX[request_key]).read_text(encoding="utf-8"))
    errors = sorted(response_validator(method, template).iter_errors(data), key=lambda e: list(e.path))
    assert not errors, "\n".join(f"{list(e.path)}: {e.message}" for e in errors[:5])


def test_every_operation_has_a_mock() -> None:
    covered = {(split_request(k)[0].lower(), match_path(split_request(k)[1])) for k in INDEX}
    declared = {(method, template) for template, ops in API["paths"].items() for method in ops}
    assert declared == covered


def test_mocks_are_up_to_date(tmp_path: Path) -> None:
    build_mocks.build(tmp_path / "mock-data")
    generated = {f.relative_to(tmp_path / "mock-data"): f.read_bytes() for f in (tmp_path / "mock-data").rglob("*.json")}
    committed = {f.relative_to(MOCKS): f.read_bytes() for f in MOCKS.rglob("*.json")}
    assert generated == committed, "mocks desactualizados: ejecuta make mocks"


def test_mock_coverage_minimum() -> None:
    concepts = [k for k in INDEX if re.match(r"GET /concepts/[^?]+$", k)]
    technologies = [k for k in INDEX if re.match(r"GET /technologies/[^?]+$", k)]
    assert len(concepts) >= 10 and len(technologies) >= 5


@pytest.mark.parametrize(
    ("api_enum", "source"),
    [
        ("Classification", ENUMS["classification"]),
        ("Level", ENUMS["level"]),
        ("Importance", ENUMS["importance"]),
        ("VerificationStatus", ENUMS["verification_status"]),
        ("Cloud", ENUMS["cloud"]),
        ("SourceType", ENUMS["source_type"]),
        ("EntityType", ENUMS["entity_type"]),
        ("Origin", ENUMS["vendor"]),
        ("RelationType", RELATIONS["$defs"]["relation_type"]),
    ],
)
def test_contract_enums_match_schemas(api_enum: str, source: dict[str, Any]) -> None:
    assert set(API["components"]["schemas"][api_enum]["enum"]) == set(source["enum"])


def test_section_keys_match_contract() -> None:
    assert API["components"]["schemas"]["Section"]["properties"]["key"]["enum"] == p.SECTION_KEYS


# --- Proyección --------------------------------------------------------------


@pytest.fixture(scope="module")
def index() -> p.ContentIndex:
    return p.load_index(ROOT / "content", ROOT / "schemas")


def test_concept_list_covers_blueprint(index: p.ContentIndex) -> None:
    listing = p.concept_list(index, limit=1000)
    assert listing["total"] == len(index.concepts)
    with_page = {c["slug"] for c in listing["items"] if c["has_page"]}
    assert with_page == {"change-data-capture", "idempotency"}


def test_concept_without_page_has_no_sections(index: p.ContentIndex) -> None:
    detail = p.concept_detail(index, "etl-vs-elt")
    assert detail["has_page"] is False and detail["sections"] == [] and detail["verification_status"] is None


def test_cdc_sections_follow_template(index: p.ContentIndex) -> None:
    detail = p.concept_detail(index, "change-data-capture")
    assert [s["key"] for s in detail["sections"]] == p.SECTION_KEYS


def test_incoming_relation_uses_inverse_label(index: p.ContentIndex) -> None:
    groups = p.relation_groups(index, "change-data-capture")["groups"]
    implemented = next(g for g in groups if g["type"] == "IMPLEMENTS")
    assert implemented["direction"] == "incoming" and implemented["label"] == "implemented_by"
    assert "debezium" in {i["slug"] for i in implemented["items"]}


def test_runs_on_outgoing_from_open_source(index: p.ContentIndex) -> None:
    groups = p.relation_groups(index, "apache-airflow")["groups"]
    runs_on = next(g for g in groups if g["type"] == "RUNS_ON" and g["direction"] == "outgoing")
    assert {"gcp-cloud-composer", "aws-mwaa"} <= {i["slug"] for i in runs_on["items"]}


def test_symmetric_relation_is_deduplicated(index: p.ContentIndex) -> None:
    groups = p.relation_groups(index, "change-data-capture")["groups"]
    related = next(g for g in groups if g["type"] == "RELATED_TO")
    slugs = [i["slug"] for i in related["items"]]
    assert related["direction"] == "both" and len(slugs) == len(set(slugs))
    idempotency = next(i for i in related["items"] if i["slug"] == "idempotency")
    assert idempotency["origin"] == "entity"


def test_technology_capability_has_equivalents(index: p.ContentIndex) -> None:
    cells = p.technology_detail(index, "gcp-pubsub")["capabilities"]
    stream = next(c for c in cells if c["capability"] == "stream-messaging")
    assert set(stream["equivalents"]) == {"aws", "azure"}


def test_search_prefers_title_matches(index: p.ContentIndex) -> None:
    result = p.search(index, "bigquery")
    first = result["groups"][0]["items"][0]
    assert "bigquery" in first["title"].lower()

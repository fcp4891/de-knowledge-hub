"""Tests de la API FastAPI (A-F2.3, ADR-005) contra PostgreSQL real.

- Equivalencia: toda respuesta con mock (salvo /me, A-F2.4, y /search, ADR-005) es idéntica al mock.
- Contrato: toda respuesta cumple el schema de docs/contracts/api.yaml (incluye 404, 422 y búsqueda).
- Filtros, búsqueda FTS y recarga del índice tras recompilar.
"""

from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest
import yaml
from fastapi.testclient import TestClient
from httpx2 import Response
from jsonschema import Draft202012Validator

from backend.app import projection as p
from backend.app.main import DEFAULT_CORS_ORIGINS, cors_origins, create_app
from backend.db.compiler import compile_content
from tests.conftest import temporary_database
from tests.test_contract import INDEX, MOCKS, REGISTRY, match_path, pointer, split_request

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
PREFIX = "/api/v1"
EXCLUDED = ("/me/", "/search")
EQUIVALENT = sorted(k for k in INDEX if split_request(k)[0] == "GET" and not any(e in k for e in EXCLUDED))
PAGES = {p.stem for p in (ROOT / "content" / "concepts").glob("*.md")}
API = yaml.safe_load((ROOT / "docs/contracts/api.yaml").read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def client() -> Iterator[TestClient]:
    with temporary_database() as engine:
        compile_content(engine, ROOT / "content", SCHEMAS)
        with TestClient(create_app(engine)) as test_client:
            yield test_client


def get(client: TestClient, target: str, **params: Any) -> Response:
    return client.get(PREFIX + target, params=params or None)


def validate_response(method: str, target: str, response: Response) -> list[str]:
    """Errores de la respuesta frente al schema de su operación y código en api.yaml."""
    template = match_path(target.split("?", 1)[0])
    status = str(response.status_code)
    media = "application/json" if status.startswith("2") else "application/problem+json"
    assert response.headers["content-type"].startswith(media), response.headers["content-type"]
    responses = API["paths"][template][method.lower()]["responses"]
    assert status in responses, f"{status} no declarado para {method} {template}"
    ref = "#/" + pointer("paths", template, method.lower(), "responses", status)
    declared = responses[status]
    if "$ref" in declared:
        ref = "#/" + declared["$ref"].removeprefix("#/")
    schema_ref = f"urn:api{ref}/" + pointer("content", media, "schema")
    validator = Draft202012Validator({"$ref": schema_ref}, registry=REGISTRY, format_checker=Draft202012Validator.FORMAT_CHECKER)
    return [f"{list(e.path)}: {e.message}" for e in validator.iter_errors(response.json())]


# --- Equivalencia con los mocks ----------------------------------------------


@pytest.mark.parametrize("request_key", EQUIVALENT)
def test_api_serves_exactly_the_mock(client: TestClient, request_key: str) -> None:
    _, target = request_key.split(" ", 1)
    response = client.get(PREFIX + target)
    assert response.status_code == 200
    expected = (MOCKS / INDEX[request_key]).read_text(encoding="utf-8")
    assert p.dumps(response.json()) == expected


def test_equivalence_covers_all_knowledge_mocks() -> None:
    assert len(EQUIVALENT) == len([k for k in INDEX if not any(e in k for e in EXCLUDED)])
    assert len(EQUIVALENT) >= 60


# --- Contrato ----------------------------------------------------------------

CONTRACT_CASES = [
    "/domains", "/domains/sql", "/domains/ghost",
    "/concepts?domain=sql&mvp=true", "/concepts?kind=pattern&limit=5&offset=5", "/concepts?has_page=true",
    "/concepts/change-data-capture", "/concepts/etl-vs-elt", "/concepts/ghost", "/concepts/Bad_Slug",
    "/concepts?level=expert", "/concepts?limit=0",
    "/technologies?type=cloud_service&origin=gcp", "/technologies?mvp=true", "/technologies/gcp-pubsub",
    "/technologies/change-data-capture", "/entities/gcp-cloud-composer/relations", "/entities/ghost/relations",
    "/sources/gcp-bigquery-docs", "/sources/gcp-bigquery",
    "/search?q=idempotencia", "/search?q=bigquery&type=cloud_service", "/search?q=particion&domain=fundamentals",
    "/search?q=x", "/search?q=bigquery&type=widget",
]


@pytest.mark.parametrize("target", CONTRACT_CASES)
def test_response_matches_contract(client: TestClient, target: str) -> None:
    response = client.get(PREFIX + target)
    errors = validate_response("GET", target, response)
    assert not errors, "\n".join(errors[:5])


@pytest.mark.parametrize(
    ("target", "status"),
    [("/domains/ghost", 404), ("/concepts/ghost", 404), ("/technologies/change-data-capture", 404),
     ("/sources/gcp-bigquery", 404), ("/entities/ghost/relations", 404), ("/concepts/Bad_Slug", 422),
     ("/search?q=x", 422), ("/concepts?level=expert", 422), ("/concepts?limit=501", 422)],
)
def test_error_statuses(client: TestClient, target: str, status: int) -> None:
    response = client.get(PREFIX + target)
    assert response.status_code == status
    assert response.json()["status"] == status


def test_openapi_serves_the_contract(client: TestClient) -> None:
    spec = client.get("/openapi.json").json()
    assert spec["paths"].keys() == API["paths"].keys()
    assert spec["servers"] == [{"url": PREFIX}]


# --- Filtros -----------------------------------------------------------------


def blueprint_concepts() -> list[dict[str, Any]]:
    concepts = []
    for path in sorted((ROOT / "content/blueprint").glob("*.yaml")):
        doc = yaml.safe_load(path.read_text(encoding="utf-8"))
        for sub in doc["subdomains"]:
            concepts += [{**c, "domain": doc["domain"]["slug"], "subdomain": sub["slug"]} for c in sub["concepts"]]
    return concepts


@pytest.mark.parametrize(
    ("params", "predicate"),
    [
        ({"domain": "sql", "mvp": "true"}, lambda c: c["domain"] == "sql" and c["mvp"]),
        ({"kind": "architecture"}, lambda c: c["kind"] == "architecture"),
        ({"classification": "emerging"}, lambda c: c["classification"] == "emerging"),
        ({"domain": "fundamentals", "subdomain": "data-formats"}, lambda c: c["subdomain"] == "data-formats"),
        ({"level": "advanced", "mvp": "true"}, lambda c: c["level"] == "advanced" and c["mvp"]),
    ],
)
def test_concept_filters_match_content(client: TestClient, params: dict[str, str], predicate: Any) -> None:
    body = get(client, "/concepts", limit=500, **params).json()
    expected = [c["slug"] for c in blueprint_concepts() if predicate(c)]
    assert body["total"] == len(expected) and [c["slug"] for c in body["items"]] == expected


def test_has_page_filter(client: TestClient) -> None:
    body = get(client, "/concepts", has_page="true", limit=500).json()
    assert {c["slug"] for c in body["items"]} == PAGES


def test_technology_filters(client: TestClient) -> None:
    mvp = get(client, "/technologies", mvp="true").json()
    assert mvp["total"] == 9
    gcp = get(client, "/technologies", type="cloud_service", origin="gcp", limit=500).json()
    assert gcp["total"] == 19 and all(t["origin"] == "gcp" for t in gcp["items"])


def test_pagination(client: TestClient) -> None:
    first = get(client, "/concepts", limit=10, offset=0).json()
    second = get(client, "/concepts", limit=10, offset=10).json()
    everything = get(client, "/concepts", limit=500).json()
    assert [c["slug"] for c in first["items"] + second["items"]] == [c["slug"] for c in everything["items"][:20]]


# --- Búsqueda FTS ------------------------------------------------------------


def slugs(body: dict[str, Any]) -> list[str]:
    return [item["slug"] for group in body["groups"] for item in group["items"]]


def top(body: dict[str, Any]) -> str:
    items = [item for group in body["groups"] for item in group["items"]]
    return max(items, key=lambda i: i["score"])["slug"]


@pytest.mark.parametrize(
    ("query", "expected_top"),
    [
        ("idempotencia", "idempotency"),     # español, título en español
        ("idempotency", "idempotency"),      # inglés, vía slug indexado
        ("particion", "partitioning"),       # sin tilde encuentra "Particionamiento"
        ("partitioning", "partitioning"),    # inglés
        ("data lake", "data-lake"),          # coincidencia exacta gana a "Arquitectura Data Lake"
        ("bigquery", "gcp-bigquery"),
    ],
)
def test_search_ranking(client: TestClient, query: str, expected_top: str) -> None:
    assert top(get(client, "/search", q=query).json()) == expected_top


def test_search_ignores_substring_inside_words(client: TestClient) -> None:
    assert "data-sharing" not in slugs(get(client, "/search", q="particion").json())


def test_search_finds_body_text(client: TestClient) -> None:
    assert "change-data-capture" in slugs(get(client, "/search", q="replication slot").json())


def test_search_filters(client: TestClient) -> None:
    by_type = get(client, "/search", q="bigquery", type="source").json()
    assert by_type["groups"] and all(g["type"] == "source" for g in by_type["groups"])
    by_domain = get(client, "/search", q="bigquery", domain="gcp").json()
    assert all(i["domain"] == "gcp" for g in by_domain["groups"] for i in g["items"])


def test_search_groups_by_type_and_orders_by_score(client: TestClient) -> None:
    body = get(client, "/search", q="bigquery").json()
    assert body["total"] == len(slugs(body))
    for group in body["groups"]:
        scores = [i["score"] for i in group["items"]]
        assert scores == sorted(scores, reverse=True)


def test_search_flags_pages(client: TestClient) -> None:
    items = {i["slug"]: i for g in get(client, "/search", q="data lake").json()["groups"] for i in g["items"]}
    assert items["data-lake"]["has_page"] is True           # concepto con ficha (lote 5)
    assert items["azure-adls"]["has_page"] is True          # tecnología: tiene entidad
    lake = {i["slug"]: i for g in get(client, "/search", q="lakehouse").json()["groups"] for i in g["items"]}
    assert lake["lakehouse"]["has_page"] is True            # concepto con ficha (F3b-01a)
    plat = {i["slug"]: i for g in get(client, "/search", q="plataforma de datos").json()["groups"] for i in g["items"]}
    assert plat["data-platform-engineering"]["has_page"] is False   # concepto del blueprint sin ficha (dominio 22)
    parti = {i["slug"]: i for g in get(client, "/search", q="particion").json()["groups"] for i in g["items"]}
    assert parti["partitioning"]["has_page"] is True and parti["topics-and-partitions"]["has_page"] is False


def test_page_bonus_breaks_ties_in_favor_of_pages(client: TestClient) -> None:
    items = {i["slug"]: i["score"] for g in get(client, "/search", q="particion").json()["groups"] for i in g["items"]}
    # Mismo texto de coincidencia; antes empataban. Ahora gana el que tiene ficha.
    assert items["partitioning"] > items["topics-and-partitions"]


def test_search_finds_snippets(client: TestClient) -> None:
    body = get(client, "/search", q="deduplicar", type="code_snippet").json()
    assert "bigquery-deduplicate-latest" in slugs(body)
    assert all(g["type"] == "code_snippet" for g in body["groups"])


def test_snippet_filters_and_not_found(client: TestClient) -> None:
    terraform = get(client, "/snippets", language="terraform").json()
    assert "terraform-bigquery-partitioned-table" in [i["slug"] for i in terraform["items"]]
    assert all(i["language"] == "terraform" for i in terraform["items"])
    assert get(client, "/snippets", implements="upsert").json()["items"][0]["slug"] == "bigquery-deduplicate-latest"
    assert get(client, "/snippets/scd-type-2").status_code == 404   # existe, pero no es un snippet
    assert get(client, "/snippets", language="cobol").status_code == 422


def test_search_escapes_like_wildcards(client: TestClient) -> None:
    assert get(client, "/search", q="%%").json()["total"] == 0


# --- Recarga del índice ------------------------------------------------------


def test_api_reloads_after_recompile(content: Path) -> None:
    with temporary_database() as engine, TestClient(create_app(engine)) as api:
        compile_content(engine, content, SCHEMAS)
        before = api.get(PREFIX + "/concepts/change-data-capture").json()["description"]
        page = content / "concepts" / "change-data-capture.md"
        page.write_text(page.read_text(encoding="utf-8").replace(before, "Descripción recompilada."), encoding="utf-8")
        compile_content(engine, content, SCHEMAS)
        after = api.get(PREFIX + "/concepts/change-data-capture").json()["description"]
    assert after == "Descripción recompilada." != before


# --- CORS (configurable con CORS_ORIGINS) ---


def test_cors_defaults_include_local_frontend_ports(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    assert cors_origins() == ["http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:3010"]


def test_cors_env_overrides_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", " http://localhost:4000 , http://127.0.0.1:4010,")
    assert cors_origins() == ["http://localhost:4000", "http://127.0.0.1:4010"]


def test_cors_empty_env_falls_back_to_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", " , ")
    assert cors_origins() == list(DEFAULT_CORS_ORIGINS)


@pytest.mark.parametrize(("origin", "allowed"), [
    ("http://127.0.0.1:3010", True),
    ("http://localhost:3000", True),
    ("http://otro-sitio.example", False),
])
def test_cors_preflight(client: TestClient, origin: str, allowed: bool) -> None:
    response = client.options(PREFIX + "/domains", headers={"Origin": origin, "Access-Control-Request-Method": "GET"})
    assert (response.headers.get("access-control-allow-origin") == origin) is allowed

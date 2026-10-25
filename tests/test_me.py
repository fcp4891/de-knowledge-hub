"""Tests del estado personal /me (A-F2.4, ADR-006) contra PostgreSQL real."""

from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, text

from backend.app.main import create_app
from backend.db.compiler import compile_content
from scripts.contracts import build_mocks
from tests.conftest import temporary_database
from tests.test_api import validate_response
from tests.test_compiler import TMP_TECHNOLOGY
from tests.test_contract import INDEX, MOCKS

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
ME = "/api/v1/me"
SERVER_FIELDS = {"updated_at", "created_at", "id"}
ME_MOCKS = sorted(k for k in INDEX if " /me/" in k)


@pytest.fixture(scope="module")
def db() -> Iterator[tuple[Engine, TestClient]]:
    with temporary_database() as engine:
        compile_content(engine, ROOT / "content", SCHEMAS)
        with TestClient(create_app(engine)) as client:
            yield engine, client


@pytest.fixture
def client(db: tuple[Engine, TestClient]) -> TestClient:
    """Cliente con el estado personal vacío al empezar cada test."""
    engine, client = db
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE me_study_states, me_notes, me_favorites"))
    return client


def without_server_fields(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: without_server_fields(v) for k, v in value.items() if k not in SERVER_FIELDS}
    if isinstance(value, list):
        return [without_server_fields(v) for v in value]
    return value


def seed_mock_state(client: TestClient) -> str:
    """Reproduce por la API el estado de ejemplo de los mocks, en el orden de su updated_at."""
    for state in sorted(build_mocks.STUDY_STATES, key=lambda s: s["updated_at"]):
        body = {k: state[k] for k in ("state", "pending_deep_dive", "last_studied_at")}
        assert client.put(f"{ME}/study-state/{state['slug']}", json=body).status_code == 200
    note = client.post(f"{ME}/notes/change-data-capture", json={"body_markdown": build_mocks.NOTE["body_markdown"]})
    assert client.put(f"{ME}/favorites/change-data-capture", json={"favorite": True}).status_code == 200
    return str(note.json()["id"])


REQUEST_BODIES: dict[str, dict[str, Any]] = {
    "PUT /me/study-state/change-data-capture": {k: build_mocks.STUDY_STATES[0][k] for k in ("state", "pending_deep_dive", "last_studied_at")},
    "POST /me/notes/change-data-capture": {"body_markdown": build_mocks.NOTE["body_markdown"]},
    "PUT /me/notes/change-data-capture/note-0001": {"body_markdown": build_mocks.NOTE_UPDATED["body_markdown"]},
    "PUT /me/favorites/change-data-capture": {"favorite": True},
}


@pytest.mark.parametrize("request_key", ME_MOCKS)
def test_me_matches_mock_except_server_fields(client: TestClient, request_key: str) -> None:
    note_id = seed_mock_state(client)
    method, target = request_key.split(" ", 1)
    target = target.replace("note-0001", note_id)
    response = client.request(method, "/api/v1" + target, json=REQUEST_BODIES.get(request_key))
    assert response.status_code in (200, 201)
    expected = json.loads((MOCKS / INDEX[request_key]).read_text(encoding="utf-8"))
    assert without_server_fields(response.json()) == without_server_fields(expected)


# --- Contrato ----------------------------------------------------------------


@pytest.mark.parametrize(
    ("method", "target", "body", "status"),
    [
        ("GET", "/me/study-state", None, 200),
        ("GET", "/me/study-state?state=reviewing&limit=5", None, 200),
        ("GET", "/me/study-state?state=bored", None, 422),
        ("GET", "/me/study-state/etl-vs-elt", None, 200),
        ("GET", "/me/study-state/ghost", None, 404),
        ("GET", "/me/study-state/gcp-bigquery-docs", None, 404),
        ("PUT", "/me/study-state/etl-vs-elt", {"state": "applied"}, 200),
        ("PUT", "/me/study-state/etl-vs-elt", {"state": "bored"}, 422),
        ("PUT", "/me/study-state/etl-vs-elt", {"state": "applied", "extra": 1}, 422),
        ("PUT", "/me/study-state/etl-vs-elt", {"state": "applied", "last_studied_at": "2026-09-30T10:00:00"}, 422),
        ("GET", "/me/notes/etl-vs-elt", None, 200),
        ("POST", "/me/notes/etl-vs-elt", {"body_markdown": "Hola"}, 201),
        ("POST", "/me/notes/etl-vs-elt", {"body_markdown": ""}, 422),
        ("POST", "/me/notes/ghost", {"body_markdown": "Hola"}, 404),
        ("PUT", "/me/notes/etl-vs-elt/no-existe", {"body_markdown": "x"}, 404),
        ("DELETE", "/me/notes/etl-vs-elt/no-existe", None, 404),
        ("GET", "/me/favorites", None, 200),
        ("GET", "/me/favorites/gcp-pubsub", None, 200),
        ("PUT", "/me/favorites/gcp-pubsub", {"favorite": True}, 200),
        ("PUT", "/me/favorites/gcp-pubsub", {"favorite": "sí"}, 422),
    ],
)
def test_me_responses_match_contract(client: TestClient, method: str, target: str, body: Any, status: int) -> None:
    response = client.request(method, "/api/v1" + target, json=body)
    assert response.status_code == status
    errors = validate_response(method, target, response)
    assert not errors, "\n".join(errors[:5])


def test_delete_note_returns_204_without_body(client: TestClient) -> None:
    note = client.post(f"{ME}/notes/etl-vs-elt", json={"body_markdown": "borrar"}).json()
    response = client.delete(f"{ME}/notes/etl-vs-elt/{note['id']}")
    assert response.status_code == 204 and response.content == b""


# --- Estado de estudio -------------------------------------------------------


def test_default_state_without_record(client: TestClient) -> None:
    assert client.get(f"{ME}/study-state/etl-vs-elt").json() == {
        "slug": "etl-vs-elt", "state": "not_reviewed", "pending_deep_dive": False,
        "last_studied_at": None, "updated_at": None,
    }


def test_put_is_idempotent(client: TestClient) -> None:
    body = {"state": "reviewing", "pending_deep_dive": True, "last_studied_at": "2026-09-30T09:00:00Z"}
    first = client.put(f"{ME}/study-state/etl-vs-elt", json=body).json()
    second = client.put(f"{ME}/study-state/etl-vs-elt", json=body).json()
    assert without_server_fields(first) == without_server_fields(second)
    assert client.get(f"{ME}/study-state").json()["total"] == 1


def test_last_studied_at_is_kept_when_omitted(client: TestClient) -> None:
    client.put(f"{ME}/study-state/etl-vs-elt", json={"state": "reviewing", "last_studied_at": "2026-09-30T09:00:00Z"})
    after = client.put(f"{ME}/study-state/etl-vs-elt", json={"state": "understood"}).json()
    assert after["state"] == "understood" and after["last_studied_at"] == "2026-09-30T09:00:00Z"


def test_put_replaces_pending_deep_dive(client: TestClient) -> None:
    client.put(f"{ME}/study-state/etl-vs-elt", json={"state": "reviewing", "pending_deep_dive": True})
    after = client.put(f"{ME}/study-state/etl-vs-elt", json={"state": "reviewing"}).json()
    assert after["pending_deep_dive"] is False


def test_technologies_accept_personal_state(client: TestClient) -> None:
    assert client.put(f"{ME}/study-state/gcp-bigquery", json={"state": "applied"}).json()["state"] == "applied"


def test_list_filters_orders_and_paginates(client: TestClient) -> None:
    for slug in ("etl-vs-elt", "sql-merge", "partitioning"):
        client.put(f"{ME}/study-state/{slug}", json={"state": "needs_review"})
    client.put(f"{ME}/study-state/idempotency", json={"state": "applied"})
    needs = client.get(f"{ME}/study-state", params={"state": "needs_review"}).json()
    assert needs["total"] == 3 and [i["slug"] for i in needs["items"]] == ["partitioning", "sql-merge", "etl-vs-elt"]
    page = client.get(f"{ME}/study-state", params={"limit": 2, "offset": 1}).json()
    assert page["total"] == 4 and [i["slug"] for i in page["items"]] == ["partitioning", "sql-merge"]


# --- Notas -------------------------------------------------------------------


def test_notes_lifecycle(client: TestClient) -> None:
    first = client.post(f"{ME}/notes/etl-vs-elt", json={"body_markdown": "uno"}).json()
    second = client.post(f"{ME}/notes/etl-vs-elt", json={"body_markdown": "dos"}).json()
    assert [n["body_markdown"] for n in client.get(f"{ME}/notes/etl-vs-elt").json()["items"]] == ["dos", "uno"]
    edited = client.put(f"{ME}/notes/etl-vs-elt/{first['id']}", json={"body_markdown": "uno editado"}).json()
    assert edited["created_at"] == first["created_at"] and edited["updated_at"] >= first["updated_at"]
    assert client.delete(f"{ME}/notes/etl-vs-elt/{second['id']}").status_code == 204
    assert [n["body_markdown"] for n in client.get(f"{ME}/notes/etl-vs-elt").json()["items"]] == ["uno editado"]


def test_note_id_is_scoped_to_its_slug(client: TestClient) -> None:
    note = client.post(f"{ME}/notes/etl-vs-elt", json={"body_markdown": "uno"}).json()
    assert client.put(f"{ME}/notes/sql-merge/{note['id']}", json={"body_markdown": "x"}).status_code == 404
    assert client.delete(f"{ME}/notes/sql-merge/{note['id']}").status_code == 404


def test_note_length_limit(client: TestClient) -> None:
    assert client.post(f"{ME}/notes/etl-vs-elt", json={"body_markdown": "x" * 20001}).status_code == 422


# --- Favoritos ---------------------------------------------------------------


def test_favorites_toggle_and_list(client: TestClient) -> None:
    assert client.get(f"{ME}/favorites/gcp-pubsub").json()["favorite"] is False
    client.put(f"{ME}/favorites/gcp-pubsub", json={"favorite": True})
    client.put(f"{ME}/favorites/etl-vs-elt", json={"favorite": True})
    client.put(f"{ME}/favorites/gcp-pubsub", json={"favorite": False})
    listing = client.get(f"{ME}/favorites").json()
    assert listing["total"] == 1 and [f["slug"] for f in listing["items"]] == ["etl-vs-elt"]


# --- Independencia del contenido (ADR-000, ADR-006) ----------------------------


def personal_rows(engine: Engine) -> tuple[int, int, int]:
    with engine.connect() as conn:
        row = conn.execute(text(
            "select (select count(*) from me_study_states), (select count(*) from me_notes), (select count(*) from me_favorites)"
        )).one()
    return int(row[0]), int(row[1]), int(row[2])


def test_compiler_never_touches_personal_state(content: Path) -> None:
    with temporary_database() as engine, TestClient(create_app(engine)) as api:
        compile_content(engine, content, SCHEMAS)
        api.put(f"{ME}/study-state/change-data-capture", json={"state": "reviewing"})
        api.post(f"{ME}/notes/change-data-capture", json={"body_markdown": "mía"})
        api.put(f"{ME}/favorites/change-data-capture", json={"favorite": True})
        before = personal_rows(engine)
        compile_content(engine, content, SCHEMAS, full=True)
        (content / "technologies" / "debezium.yaml").rename(content / "technologies" / "cdc-debezium.yaml")
        compile_content(engine, content, SCHEMAS)
        assert personal_rows(engine) == before == (1, 1, 1)


def test_orphaned_state_is_kept_but_hidden(content: Path) -> None:
    with temporary_database() as engine, TestClient(create_app(engine)) as api:
        # Tecnología temporal sin referencias (desde F3b-21b las fichas de retrieval citan pgvector).
        tech = content / "technologies" / "tmp-vector-store.yaml"
        tech.write_text(TMP_TECHNOLOGY, encoding="utf-8")
        compile_content(engine, content, SCHEMAS)
        api.put(f"{ME}/favorites/tmp-vector-store", json={"favorite": True})
        api.put(f"{ME}/study-state/tmp-vector-store", json={"state": "reviewing"})
        assert api.get(f"{ME}/favorites").json()["total"] == 1
        tech.unlink()
        compile_content(engine, content, SCHEMAS)
        assert api.get(f"{ME}/favorites").json()["total"] == 0
        assert api.get(f"{ME}/study-state").json()["total"] == 0
        assert api.get(f"{ME}/favorites/tmp-vector-store").status_code == 404
        assert personal_rows(engine) == (1, 0, 1)

"""Code Library (§23, A-F3.2): el código de los snippets compila y el de Python se comporta como dice."""

from __future__ import annotations

import io
import json
import re
from email.message import Message
from pathlib import Path
from typing import Any
from unittest import mock
from urllib.error import HTTPError

import pytest

ROOT = Path(__file__).resolve().parent.parent
SNIPPETS = sorted((ROOT / "content" / "snippets").glob("*.md"))
FENCE = re.compile(r"^```(\w+)\n(.*?)^```", re.S | re.M)


def blocks(path: Path, language: str) -> list[str]:
    return [code for lang, code in FENCE.findall(path.read_text(encoding="utf-8")) if lang == language]


def test_there_are_snippets() -> None:
    assert len(SNIPPETS) >= 7


@pytest.mark.parametrize("path", SNIPPETS, ids=lambda p: p.stem)
def test_python_blocks_compile(path: Path) -> None:
    for code in blocks(path, "python"):
        compile(code, str(path), "exec")


@pytest.mark.parametrize("path", SNIPPETS, ids=lambda p: p.stem)
def test_json_blocks_parse(path: Path) -> None:
    for code in blocks(path, "json"):
        json.loads(code)


def test_terraform_snippets_have_one_hcl_block() -> None:
    for path in SNIPPETS:
        if "language: terraform" in path.read_text(encoding="utf-8"):
            assert len(blocks(path, "hcl")) == 1, path.stem


# --- python-api-ingestion-retries ---------------------------------------------


@pytest.fixture
def ingestion(monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    namespace: dict[str, Any] = {"__name__": "snippet"}
    exec(blocks(ROOT / "content/snippets/python-api-ingestion-retries.md", "python")[0], namespace)
    namespace["time"] = mock.Mock(sleep=lambda seconds: None)
    monkeypatch.delenv("API_TOKEN", raising=False)
    return namespace


def response(page: dict[str, Any]) -> mock.MagicMock:
    return mock.MagicMock(__enter__=lambda self: io.BytesIO(json.dumps(page).encode()), __exit__=lambda self, *a: False)


def fake_api(calls: list[str], fail_first_with: int | None = None):  # noqa: ANN201
    def urlopen(request: Any, timeout: float) -> mock.MagicMock:
        url = request.full_url
        calls.append(url)
        if fail_first_with and len(calls) == 1:
            headers = Message()
            headers["Retry-After"] = "1"
            raise HTTPError(url, fail_first_with, "error", headers, None)
        if "cursor=c2" in url:
            return response({"data": [3], "next": None})
        return response({"data": [1, 2], "next": "c2"})
    return urlopen


def test_ingest_day_writes_deterministic_pages_and_is_idempotent(ingestion: dict[str, Any], tmp_path: Path) -> None:
    calls: list[str] = []
    ingestion["urlopen"] = fake_api(calls)
    args = ("https://api.example/v1/pedidos", "pedidos", "2026-09-30", "2026-10-01", tmp_path)
    assert ingestion["ingest_day"](*args) == 3
    first = sorted(p.name for p in (tmp_path / "pedidos" / "fecha=2026-09-30").iterdir())
    assert ingestion["ingest_day"](*args) == 3
    second = sorted(p.name for p in (tmp_path / "pedidos" / "fecha=2026-09-30").iterdir())
    assert first == second == ["pagina=00001.json", "pagina=00002.json"]


def test_429_is_retried(ingestion: dict[str, Any], tmp_path: Path) -> None:
    calls: list[str] = []
    ingestion["urlopen"] = fake_api(calls, fail_first_with=429)
    assert ingestion["ingest_day"]("https://api.example/v1/p", "p", "2026-09-30", "2026-10-01", tmp_path) == 3
    assert len(calls) == 3  # 429, página 1 reintentada, página 2


def test_404_is_not_retried(ingestion: dict[str, Any]) -> None:
    calls: list[str] = []
    ingestion["urlopen"] = fake_api(calls, fail_first_with=404)
    with pytest.raises(HTTPError):
        ingestion["get_page"]("https://api.example/v1/p", {})
    assert len(calls) == 1


# --- Extracción de Terraform para la CI (make validate-terraform) ------------


def test_extract_terraform_is_idempotent(tmp_path: Path) -> None:
    from scripts.snippets import extract

    first = extract.extract("terraform", tmp_path / "tf")
    second = extract.extract("terraform", tmp_path / "tf")
    assert [p.relative_to(tmp_path) for p in first] == [p.relative_to(tmp_path) for p in second]
    assert first and all(p.name == "main.tf" and "required_providers" in p.read_text(encoding="utf-8") for p in first)

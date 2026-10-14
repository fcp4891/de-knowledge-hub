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


def test_extract_concepts_writes_each_hcl_block_and_reports_exclusions(tmp_path: Path) -> None:
    from scripts.snippets import extract

    concepts = tmp_path / "concepts"
    concepts.mkdir()
    hcl = 'terraform {\n  required_version = ">= 1.0"\n}\n'
    (concepts / "a.md").write_text(f"## 10. Código\n\n```hcl\n{hcl}```\n\n```hcl\n{hcl}```\n", encoding="utf-8")
    (concepts / "b.md").write_text(
        "## 10. Código\n\n<!-- validate-terraform: excluido — fragmento de un bloque mayor -->\n```hcl\nbucket = \"x\"\n```\n",
        encoding="utf-8",
    )
    written, excluded = extract.extract_concepts("terraform", tmp_path / "out", concepts)
    assert sorted(p.parent.name for p in written) == ["a-1", "a-2"]
    assert [(e.path.name, e.reason) for e in excluded] == [("b.md", "fragmento de un bloque mayor")]


def test_repository_concepts_with_hcl_are_extracted(tmp_path: Path) -> None:
    from scripts.snippets import extract

    written, _ = extract.extract_concepts("terraform", tmp_path / "out")
    assert {p.parent.name for p in written} >= {"infrastructure-as-code", "terraform-providers", "terraform-state"}
    assert all(p.read_text(encoding="utf-8").strip() for p in written)


def test_extract_github_actions_takes_only_marked_yaml_blocks(tmp_path: Path) -> None:
    from scripts.snippets import extract

    concepts = tmp_path / "concepts"
    concepts.mkdir()
    workflow = "# GitHub Actions (ejemplo)\nname: ci\non: push\njobs: {}\n"
    gitlab = "# GitLab CI (no ejecutado)\nstages: [test]\n"
    (concepts / "a.md").write_text(f"## 10. Código\n\n```yaml\n{workflow}```\n\n```yaml\n{gitlab}```\n", encoding="utf-8")
    (concepts / "b.md").write_text(
        f"## 10. Código\n\n<!-- validate-actions: excluido — fragmento de un job -->\n```yaml\n{workflow}```\n",
        encoding="utf-8",
    )
    written, excluded = extract.extract_concepts("github-actions", tmp_path / "out", concepts)
    assert [(p.parent.name, p.name) for p in written] == [("a", "workflow.yml")]
    assert written[0].read_text(encoding="utf-8") == workflow
    assert [(e.path.name, e.reason) for e in excluded] == [("b.md", "fragmento de un job")]


def test_repository_concepts_with_workflows_are_extracted(tmp_path: Path) -> None:
    from scripts.snippets import extract

    written, _ = extract.extract_concepts("github-actions", tmp_path / "out")
    assert {p.parent.name for p in written} >= {"ci-cd-pipelines", "automated-testing-in-ci", "build-artifacts"}
    assert all(p.read_text(encoding="utf-8").startswith("# GitHub Actions") for p in written)


def test_extract_cloudformation_and_bicep_blocks(tmp_path: Path) -> None:
    from scripts.snippets import extract

    concepts = tmp_path / "concepts"
    concepts.mkdir()
    cfn = '# CloudFormation (ejemplo)\nAWSTemplateFormatVersion: "2010-09-09"\nResources: {}\n'
    other = "# GitHub Actions (ejemplo)\nname: ci\n"
    bicep = "param environment string\n"
    (concepts / "a.md").write_text(f"## 10. Código\n\n```yaml\n{cfn}```\n\n```yaml\n{other}```\n\n```bicep\n{bicep}```\n",
                                   encoding="utf-8")
    cfn_written, _ = extract.extract_concepts("cloudformation", tmp_path / "cfn", concepts)
    bicep_written, _ = extract.extract_concepts("bicep", tmp_path / "bicep", concepts)
    assert [(p.parent.name, p.name, p.read_text(encoding="utf-8")) for p in cfn_written] == [("a", "template.yaml", cfn)]
    assert [(p.parent.name, p.name, p.read_text(encoding="utf-8")) for p in bicep_written] == [("a", "main.bicep", bicep)]

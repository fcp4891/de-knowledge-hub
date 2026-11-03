"""Plan de la CI por rutas cambiadas (scripts/ci/plan.py) y selección de tests por fichas (tests/conftest.py)."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from scripts.ci.plan import NULL_SHA, changed_paths, plan_for
from tests.conftest import constant_strings

ROOT = Path(__file__).resolve().parent.parent


def test_backend_tests_ci_or_contract_changes_run_everything() -> None:
    for path in ("backend/app/main.py", "schemas/base.schema.json", "tests/test_api.py", ".github/workflows/ci.yml",
                 "docs/contracts/api.yaml", "requirements-snippets.txt", "Makefile", "scripts/validate.py"):
        plan = plan_for([path, "content/concepts/events.md"])
        assert plan.mode == "full" and plan.frontend and plan.outputs()["terraform"] == "true", path
        assert plan.outputs()["airflow_slugs"] == ""   # vacío: todas las fichas declaradas


def test_content_change_selects_its_slugs_and_block_validators() -> None:
    plan = plan_for(["content/concepts/terraform-modules.md", "content/architectures/kappa-architecture.md"])
    out = plan.outputs()
    assert out["mode"] == "content" and out["backend"] == "true" and out["frontend"] == "false"
    assert out["slugs"] == "kappa-architecture,terraform-modules"
    assert out["terraform"] == "true" and out["bicep"] == "false" and out["k8s"] == "false"


def test_airflow_checks_run_only_for_changed_dags() -> None:
    from scripts.snippets.airflow_dag_checks import CHECKS
    slug = sorted(CHECKS)[0]
    out = plan_for([f"content/concepts/{slug}.md"]).outputs()
    assert out["airflow"] == "true" and out["airflow_slugs"] == slug
    assert plan_for(["content/concepts/events.md"]).outputs()["airflow"] == "false"


def test_frontend_and_docs_changes() -> None:
    front = plan_for(["frontend/components/card/ArchitectureStage.tsx", "tests/frontend/architecture.test.ts"])
    assert front.mode == "none" and front.frontend and front.outputs()["backend"] == "false"
    docs = plan_for(["docs/status/lane-a.md", "CLAUDE.md", "docs/adr/ADR-028-reference-architecture-page.md"])
    assert docs.mode == "none" and not docs.frontend


def test_deleted_page_and_missing_base() -> None:
    assert plan_for(["content/concepts/no-existe.md"]).slugs == ["no-existe"]
    assert changed_paths(NULL_SHA, "HEAD") is None and changed_paths("", "HEAD") is None   # primer push: todo
    assert plan_for([], full=True).mode == "full"


def test_dict_constants_resolve_only_the_keys_the_test_uses() -> None:
    table = {"s3": "s3-data-lake.md", "glue": "glue-catalog-and-etl.md"}
    assert constant_strings(table, {"s3"}) == {"s3", "s3-data-lake.md"}
    assert constant_strings(table, set()) == {"s3", "glue", "s3-data-lake.md", "glue-catalog-and-etl.md"}
    assert constant_strings({"con-brechas": 1, "corregido": 0}, set()) == {"con-brechas", "corregido"}   # valores int


def collected(slugs: str, target: str) -> list[str]:
    env = {**os.environ, "DEKH_TEST_SCOPE": "content", "DEKH_CHANGED_SLUGS": slugs}
    result = subprocess.run([sys.executable, "-m", "pytest", "-o", "addopts=", "--collect-only", "-q", "-p",
                             "no:cacheprovider", target], cwd=ROOT, env=env, capture_output=True, text=True)
    return [line for line in result.stdout.splitlines() if "::" in line]


def test_content_scope_keeps_only_tests_of_changed_fichas() -> None:
    aws = collected("s3-data-lake", "tests/test_snippet_code.py")
    assert aws == ["tests/test_snippet_code.py::test_s3_snippet_writes_hive_partitions_idempotently",
                   "tests/test_snippet_code.py::test_aws_snippets_pass_mypy_strict"]
    kafka = collected("kappa-architecture", "tests/test_architecture_snippets.py")
    assert kafka == ["tests/test_architecture_snippets.py::test_kafka_architectures_print_the_documented_output"
                     "[kappa-architecture]"]
    assert collected("", "tests/test_kafka_snippets.py") == []


def test_content_scope_collects_the_whole_suite_without_errors() -> None:
    """La selección por fichas recorre todos los módulos: un valor inesperado no debe romper la colección."""
    env = {**os.environ, "DEKH_TEST_SCOPE": "content", "DEKH_CHANGED_SLUGS": "gdpr"}
    result = subprocess.run([sys.executable, "-m", "pytest", "-o", "addopts=", "--collect-only", "-q", "-p",
                             "no:cacheprovider", "tests"], cwd=ROOT, env=env, capture_output=True, text=True)
    assert result.returncode == 0, result.stdout[-2000:] + result.stderr[-2000:]

"""Código del §10 de las arquitecturas de referencia ejecutado en la CI (ADR-028).

- Biblioteca estándar: batch-pipeline-architecture, data-lake-architecture y medallion-architecture.
- modern-data-warehouse-architecture: dbt Core y dbt-postgres contra una base temporal del PostgreSQL de la CI (ADR-018).
- lakehouse-architecture: PyIceberg con catálogo SQLite en Linux (ADR-018).
Cada test exige que la salida documentada en el bloque ```text del §10 sea la que imprime el script.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_compliance_snippets import UTF8, assert_mypy_strict
from tests.test_docker_snippets import blocks
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture


def documented(ficha: str) -> str:
    (text,) = blocks(ficha, "text")
    return text.strip()


@pytest.mark.parametrize("ficha", ["batch-pipeline-architecture", "medallion-architecture"])
def test_stdlib_architectures_print_the_documented_output(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    assert out.strip() == documented(ficha), out
    assert_mypy_strict(tmp_path)


def test_data_lake_zones_partitions_and_quarantine(tmp_path: Path) -> None:
    out = run_python_block("data-lake-architecture", tmp_path, UTF8, args=(str(tmp_path / "lake"),))
    assert out.strip() == documented("data-lake-architecture"), out
    assert_mypy_strict(tmp_path)


def test_modern_data_warehouse_dbt_build_and_relationship_gate(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    pytest.importorskip("dbt.cli.main", reason="falta dbt-core (make snippets-deps)")
    out = run_python_block("modern-data-warehouse-architecture", tmp_path, {**pg_env, **UTF8}, args=(str(tmp_path / "p"),))
    assert out.strip() == documented("modern-data-warehouse-architecture"), out
    assert_mypy_strict(tmp_path)


def test_lakehouse_commits_delete_time_travel_and_schema_evolution(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("lakehouse-architecture", tmp_path, UTF8, args=(str(tmp_path / "work"),))
    assert out.strip() == documented("lakehouse-architecture"), out
    assert_mypy_strict(tmp_path)

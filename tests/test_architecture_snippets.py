"""Código del §10 de las arquitecturas de referencia ejecutado en la CI (ADR-028).

- Biblioteca estándar: batch-pipeline-architecture, data-lake-architecture y medallion-architecture.
- modern-data-warehouse-architecture: dbt Core y dbt-postgres contra una base temporal del PostgreSQL de la CI (ADR-018).
- lakehouse-architecture: PyIceberg con catálogo SQLite en Linux (ADR-018).
- Biblioteca estándar (07b): lambda-architecture y real-time-analytics-architecture.
- streaming-pipeline-architecture: PySpark 4.2.0 en modo local (REQUIRE_PYSPARK=1 en la CI).
- event-driven-architecture y kappa-architecture: el broker Kafka 4.3.1 de la sesión (ADR-017).
Cada test exige que la salida documentada en el bloque ```text del §10 sea la que imprime el script.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_compliance_snippets import UTF8, assert_mypy_strict
from tests.test_docker_snippets import bash, blocks, docker_ready  # noqa: F401 - fixtures
from tests.test_kafka_snippets import kafka, run_kafka_snippet  # noqa: F401 - fixture
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture
from tests.test_streaming_snippets import run_spark_snippet


def documented(ficha: str) -> str:
    (text,) = blocks(ficha, "text")
    return text.strip()


@pytest.mark.parametrize("ficha", ["batch-pipeline-architecture", "medallion-architecture", "lambda-architecture",
                                   "real-time-analytics-architecture"])
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


def test_streaming_pipeline_dlq_watermark_and_idempotent_sink(tmp_path: Path) -> None:
    out = run_spark_snippet("streaming-pipeline-architecture", tmp_path)
    assert out.strip() == documented("streaming-pipeline-architecture"), out


@pytest.mark.parametrize("ficha", ["event-driven-architecture", "kappa-architecture"])
def test_kafka_architectures_print_the_documented_output(ficha: str, kafka: dict[str, str], bash: str,  # noqa: F811
                                                         tmp_path: Path) -> None:
    out = run_kafka_snippet(ficha, bash, kafka, tmp_path)
    assert out.strip() == documented(ficha), out

"""Código del §10 de las arquitecturas de referencia ejecutado en la CI (ADR-028).

- Biblioteca estándar: batch-pipeline-architecture, data-lake-architecture y medallion-architecture.
- modern-data-warehouse-architecture: dbt Core y dbt-postgres contra una base temporal del PostgreSQL de la CI (ADR-018).
- lakehouse-architecture: PyIceberg con catálogo SQLite en Linux (ADR-018).
- Biblioteca estándar (07b): lambda-architecture y real-time-analytics-architecture.
- streaming-pipeline-architecture: PySpark 4.2.0 en modo local (REQUIRE_PYSPARK=1 en la CI).
- event-driven-architecture y kappa-architecture: el broker Kafka 4.3.1 de la sesión (ADR-017).
- Biblioteca estándar (07c): api-to-warehouse-architecture, iot-pipeline-architecture y ml-feature-pipeline-architecture;
  rag-data-pipeline-architecture con numpy (ADR-025, opción A).
- cdc-architecture: psycopg contra un PostgreSQL 17 con wal_level=logical que el test levanta en Docker (la imagen
  fijada por digest de open-data-stack-overview), porque el de la CI corre con wal_level=replica.
Cada test exige que la salida documentada en el bloque ```text del §10 sea la que imprime el script.
"""

from __future__ import annotations

import os
import time
import uuid
from collections.abc import Iterator
from pathlib import Path

import pytest

from tests.test_compliance_snippets import UTF8, assert_mypy_strict
from tests.test_docker_snippets import bash, blocks, docker_ready  # noqa: F401 - fixtures
from tests.test_kafka_snippets import kafka, run_kafka_snippet  # noqa: F401 - fixture
from tests.test_ai_snippets import require
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture
from tests.test_retrieval_snippets import docker, free_port
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


@pytest.mark.parametrize("ficha", ["api-to-warehouse-architecture", "iot-pipeline-architecture",
                                   "ml-feature-pipeline-architecture"])
def test_stdlib_integration_and_ml_architectures_print_the_documented_output(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8, args=(str(tmp_path / "work"),))
    assert out.strip() == documented(ficha), out
    assert_mypy_strict(tmp_path)


def test_rag_data_pipeline_reembeds_only_changes_and_drops_retired_documents(tmp_path: Path) -> None:
    require("numpy")
    out = run_python_block("rag-data-pipeline-architecture", tmp_path, UTF8)
    assert out.strip() == documented("rag-data-pipeline-architecture"), out
    assert_mypy_strict(tmp_path)


POSTGRES_IMAGE = "postgres:17@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3"


@pytest.fixture
def logical_pg_dsn() -> Iterator[str]:
    """PostgreSQL 17 con wal_level=logical para la decodificación lógica; se borra al terminar."""
    require("psycopg")
    if docker("info").returncode != 0:
        if os.environ.get("REQUIRE_DOCKER") == "1":
            pytest.fail("Docker no responde y REQUIRE_DOCKER=1")
        pytest.skip("Docker no disponible")
    import psycopg

    name, port = f"dekh-pglogical-{uuid.uuid4().hex[:8]}", free_port()
    started = docker("run", "-d", "--rm", "--name", name, "-e", "POSTGRES_PASSWORD=dekh", "-p", f"127.0.0.1:{port}:5432",
                     POSTGRES_IMAGE, "-c", "wal_level=logical")
    assert started.returncode == 0, started.stderr
    dsn = f"host=127.0.0.1 port={port} user=postgres password=dekh dbname=postgres connect_timeout=5"
    try:
        for _ in range(60):
            try:
                with psycopg.connect(dsn) as conn:
                    conn.execute("select 1")
                break
            except psycopg.OperationalError:
                time.sleep(1)
        else:
            pytest.fail("PostgreSQL no respondió en 60 s")
        yield dsn
    finally:
        docker("rm", "-f", name)


def test_cdc_reads_applies_idempotently_and_confirms_with_test_decoding(logical_pg_dsn: str, tmp_path: Path) -> None:
    out = run_python_block("cdc-architecture", tmp_path, {"PG_DSN": logical_pg_dsn, **UTF8})
    assert out.strip() == documented("cdc-architecture"), out
    assert_mypy_strict(tmp_path)

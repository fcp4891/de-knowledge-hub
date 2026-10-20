"""Ejemplos de 20-open-data-stack ejecutados en la CI.

- open-data-stack-overview: docker compose up de PostgreSQL 17 y Kafka 4.3.1, por digest (ADR-016 y ADR-017).
- kafka-architecture: el broker Kafka de la sesión de test_kafka_snippets (ADR-017).
- spark-execution-model: PySpark 4.2.0 en modo local (REQUIRE_PYSPARK=1 en la CI).
- postgresql-for-data-engineers: psycopg contra una base temporal en el PostgreSQL de la CI, que el test crea y borra.
- open-table-formats y table-format-comparison: PyIceberg con catálogo SQLite (ADR-018); se salta en Windows.
- dbt-core-concepts: dbt Core contra una base temporal en el PostgreSQL de la CI (ADR-018).
"""

from __future__ import annotations

import os
import subprocess
import sys
import uuid
from collections.abc import Iterator
from pathlib import Path

import psycopg
import pytest
from sqlalchemy import make_url

from backend.db.config import database_url
from tests.test_docker_snippets import bash, blocks, docker_ready, run_snippet  # noqa: F401 - fixtures
from tests.test_kafka_snippets import kafka  # noqa: F401 - fixture
from tests.test_snippet_code import require_pyspark


def run_python_block(ficha: str, tmp_path: Path, env: dict[str, str] | None = None, marker: str = "",
                     args: tuple[str, ...] = ()) -> str:
    """Corre el bloque ```python de la sección 10 cuya primera línea contiene marker (si hay varios)."""
    (code,) = [b for b in blocks(ficha, "python") if marker in b.splitlines()[0]]
    script = tmp_path / "snippet.py"
    script.write_text(code, encoding="utf-8", newline="\n")
    result = subprocess.run([sys.executable, script.name, *args], cwd=tmp_path, env={**os.environ, **(env or {})},
                            capture_output=True, text=True, encoding="utf-8", timeout=900)
    assert result.returncode == 0, result.stdout[-3000:] + result.stderr[-3000:]
    return result.stdout


@pytest.fixture
def pg_env() -> Iterator[dict[str, str]]:
    """Base vacía en el PostgreSQL de la CI (o el de make db-up), como variables de entorno; se borra al terminar."""
    url = make_url(database_url())
    params = {"PG_HOST": str(url.host), "PG_PORT": str(url.port), "PG_USER": str(url.username),
              "PG_PASSWORD": str(url.password), "PG_DB": f"dekh_snippet_{uuid.uuid4().hex[:10]}"}
    base = f"host={params['PG_HOST']} port={params['PG_PORT']} user={params['PG_USER']} password={params['PG_PASSWORD']}"
    try:
        admin = psycopg.connect(f"{base} dbname=postgres", autocommit=True, connect_timeout=5)
    except psycopg.OperationalError as exc:
        pytest.skip(f"PostgreSQL no disponible: {exc.__class__.__name__}")
    with admin:
        admin.execute(f"CREATE DATABASE {params['PG_DB']}")
        try:
            yield {**params, "PG_DSN": f"{base} dbname={params['PG_DB']}"}
        finally:
            admin.execute(f"DROP DATABASE {params['PG_DB']} WITH (FORCE)")


def require_iceberg() -> None:
    pytest.importorskip("pyiceberg", reason="falta pyiceberg (make snippets-deps)")
    if os.name == "nt":   # ADR-018: PyArrow no abre las rutas file:///C:/… que arma el catálogo SQL en Windows
        pytest.skip("PyIceberg con catálogo local corre en Linux (la CI)")


def test_open_stack_compose_brings_up_postgres_and_kafka(docker_ready: None, bash: str, tmp_path: Path) -> None:
    (compose,) = [b for b in blocks("open-data-stack-overview", "yaml") if b.startswith("# Docker Compose")]
    (code,) = blocks("open-data-stack-overview", "bash")
    (tmp_path / "compose.yaml").write_text(compose, encoding="utf-8", newline="\n")
    try:
        out = run_snippet(bash, code, tmp_path)
    finally:
        subprocess.run(["docker", "compose", "down", "--volumes"], cwd=tmp_path, capture_output=True)
    assert "servicios sanos: broker db" in out
    assert "base: 17." in out
    assert "broker: pedidos" in out


def test_kafka_quorum_partition_state_and_compaction(kafka: dict[str, str], bash: str, tmp_path: Path) -> None:
    (code,) = blocks("kafka-architecture", "bash")
    out = run_snippet(bash, code, tmp_path, kafka)
    assert "LeaderId: 1" in out
    assert "Partition: 0, Leader: 1, Replicas: 1, Isr: 1" in out
    assert "antes de compactar: 5 eventos" in out
    assert "después de compactar: cuenta-1=75 cuenta-2=60" in out


def test_spark_job_has_shuffle_stages_and_adaptive_plan(tmp_path: Path) -> None:
    require_pyspark()
    out = run_python_block("spark-execution-model", tmp_path)
    assert "resultado: [(0, 33334), (1, 33333), (2, 33333)]" in out
    assert "stages: 2 o más; tareas del primer stage: 4 (una por partición de entrada)" in out
    assert "Exchange en el plan: True" in out
    assert "plan adaptativo final: True" in out


def test_postgres_prunes_partitions_and_merge_is_idempotent(pg_env: dict[str, str], tmp_path: Path) -> None:
    out = run_python_block("postgresql-for-data-engineers", tmp_path, pg_env)
    assert "particiones en el plan: ['ventas_2026_10']" in out
    assert "resumen de octubre: [('norte', 40), ('sur', 10)]" in out
    script = tmp_path / "snippet.py"
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", script.name], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr


def test_iceberg_snapshots_time_travel_and_schema_evolution(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("open-table-formats", tmp_path, args=(str(tmp_path / "work"),))
    for line in ("snapshots: 2", "filas hoy: 3", "filas en el primer snapshot: 2",
                 "columnas: ['id', 'monto', 'tienda']", "tienda en filas viejas: [None, None, None]"):
        assert line in out, out


def test_iceberg_hidden_partitioning_prunes_files_and_spec_evolves(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("table-format-comparison", tmp_path, marker="PyIceberg", args=(str(tmp_path / "work"),))
    assert "archivos de la tabla: 3; archivos que lee un filtro por un día: 1" in out
    assert "especificaciones de partición: 2; actual: ts_month" in out
    assert "filas: 6" in out


def test_dbt_build_runs_seed_models_and_tests_twice(pg_env: dict[str, str], tmp_path: Path) -> None:
    pytest.importorskip("dbt.cli.main", reason="falta dbt-core (make snippets-deps)")
    out = run_python_block("dbt-core-concepts", tmp_path, pg_env, args=(str(tmp_path / "proyecto"),))
    assert "build 1: 7 nodos (model, seed, test), todos ok" in out
    assert "build 2: 7 nodos (model, seed, test), todos ok" in out
    assert "objetos: [('raw_ventas', 'BASE TABLE'), ('stg_ventas', 'VIEW'), ('ventas_por_tienda', 'BASE TABLE')]" in out
    assert "ventas_por_tienda: [('norte', 2, 30.5), ('sur', 1, 4.25)]" in out

"""Ejemplos de 16-observability ejecutados en la CI.

- data-observability y volume-anomalies: solo biblioteca estándar.
- observability-logs, observability-metrics y observability-traces: OpenTelemetry SDK con exporters en memoria,
  sin collector (ADR-020).
- data-freshness y schema-change-detection: psycopg contra una base temporal en el PostgreSQL de la CI.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

from tests.test_open_stack_snippets import pg_env, run_python_block  # noqa: F401 - fixture

UTF8 = {"PYTHONIOENCODING": "utf-8"}   # los ejemplos imprimen tildes; en Windows la salida sería cp1252


def assert_mypy_strict(tmp_path: Path) -> None:
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", "snippet.py"], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr


def require_otel() -> None:
    pytest.importorskip("opentelemetry.sdk", reason="falta opentelemetry-sdk (make snippets-deps)")


def test_data_observability_signals_differ_from_a_quality_rule(tmp_path: Path) -> None:
    out = run_python_block("data-observability", tmp_path, UTF8)
    for line in ("frescura: última carga hace 2:57:00 -> ok", "volumen: 410 filas vs media 1007 (-59%) -> ANÓMALO",
                 "schema: agregadas ['canal'], quitadas []", "calidad (monto >= 0): 2/3 filas cumplen"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_volume_threshold_compares_same_weekday_median(tmp_path: Path) -> None:
    out = run_python_block("volume-anomalies", tmp_path, UTF8)
    assert "2026-10-14 (mié): 640 filas, mediana 1015, -37 % -> ANOMALÍA" in out, out
    assert "2026-10-19 (lun): 405 filas, mediana 400, +1 % -> ok" in out, out
    assert out.count("ANOMALÍA") == 1, out
    assert_mypy_strict(tmp_path)


def test_logs_carry_trace_id_only_inside_a_span(tmp_path: Path) -> None:
    require_otel()
    out = run_python_block("observability-logs", tmp_path, UTF8)
    assert "'message': 'inicio', 'logger': 'pipeline.ventas', 'run_id': '2026-10-20'} sin trace_id" in out, out
    assert "'table': 'pedidos', 'rows': 1200} con trace_id" in out, out
    assert "mismo trace_id en los logs del span: True" in out, out
    assert_mypy_strict(tmp_path)


def test_metrics_aggregate_by_table_in_memory(tmp_path: Path) -> None:
    require_otel()
    out = run_python_block("observability-metrics", tmp_path, UTF8)
    for line in ("pipeline.rows{table=pedidos}: suma 2000", "pipeline.rows{table=clientes}: suma 50",
                 "pipeline.duration{table=pedidos}: 2 cargas, total 7.3 s",
                 "pipeline.duration{table=clientes}: 1 cargas, total 0.4 s"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_traces_one_trace_per_run_with_failed_load(tmp_path: Path) -> None:
    require_otel()
    out = run_python_block("observability-traces", tmp_path, UTF8)
    for line in ("spans: 4; una sola traza: True", "extract: padre=corrida, estado=UNSET",
                 "load: padre=corrida, estado=ERROR, eventos=['exception']", "corrida: padre=raíz"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_freshness_compares_latest_data_with_agreement(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-freshness", tmp_path, {**pg_env, **UTF8})
    assert "pedidos: dato más reciente 2026-10-20 06:40 UTC, retraso 2.3 h, acuerdo 1 h -> ATRASADA" in out, out
    assert "clientes: dato más reciente 2026-10-20 01:30 UTC, retraso 7.5 h, acuerdo 24 h -> ok" in out, out
    assert_mypy_strict(tmp_path)


def test_schema_change_detects_added_removed_and_modified(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("schema-change-detection", tmp_path, {**pg_env, **UTF8})
    for line in ("sin cambios contra sí misma: True", "agregada canal text",
                 "cambió monto: ('numeric', 'YES') -> ('bigint', 'YES')",
                 "cambió tienda: ('text', 'YES') -> ('text', 'NO')", "quitada cupon"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

"""Ejemplos de 16-observability ejecutados en la CI.

- data-observability y volume-anomalies: solo biblioteca estándar.
- observability-logs, observability-metrics y observability-traces: OpenTelemetry SDK con exporters en memoria,
  sin collector (ADR-020).
- data-freshness y schema-change-detection: psycopg contra una base temporal en el PostgreSQL de la CI.
- pipeline-health, data-sla, data-slo, alerting, incident-response y root-cause-analysis: solo biblioteca estándar.
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


RELIABILITY = {
    "pipeline-health": ["ventas_diarias: amarillo (última corrida 98 min vs mediana 30)",
                        "clientes: rojo (éxito 43%; sin éxito hace 79 h)", "inventario: verde"],
    "data-sla": ["SLO interno (antes de 07:45 en el 95 %): 86.4% -> no cumple",
                 "SLA (antes de 08:00 en el 90 %): 90.9% -> cumple", "sin consecuencia del SLA; el SLO avisó antes"],
    "data-slo": ["SLI: 0.9931 (SLO 0.99) -> cumple", "error budget: 7.2 horas malas permitidas; consumidas 5; quedan 2.2",
                 "burn rate 30 días: 0.69", "burn rate últimas 24 h: 8.33"],
    "alerting": ["min 310: ABRE alerta (burn 5 min 100, 60 min 17)", "min 395: cierra alerta",
                 "alertas abiertas en total: 1"],
    "incident-response": ["severidad: SEV2", "tiempo hasta detectar: 35 min", "tiempo hasta reconocer: 7 min",
                          "tiempo hasta mitigar: 55 min", "tiempo hasta resolver: 210 min",
                          "consumidores avisados antes de mitigar: True"],
    "root-cause-analysis": ["errores: 3 en etapas {'transform': 1, 'load': 1, 'publish': 1}",
                            "primer error: transform a las 06:02: monto sin decimales: margen 0",
                            "cambio previo (20 min antes de la corrida): schema cambió: monto numeric -> bigint en raw_pedidos"],
}


@pytest.mark.parametrize("ficha", sorted(RELIABILITY))
def test_reliability_examples_print_their_measurements(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in RELIABILITY[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)

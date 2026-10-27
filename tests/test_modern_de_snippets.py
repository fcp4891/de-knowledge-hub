"""Ejemplos de 22-modern-data-engineering (lote F3b-22a) ejecutados en la CI.

- analytics-engineering: dbt Core contra una base temporal en el PostgreSQL de la CI (ADR-018).
- data-versioning: PyIceberg con catálogo SQLite, en Linux (ADR-018).
- dataops, finops-for-data y data-platform-engineering: biblioteca estándar, con datos fijos.
- modern-data-stack es una ficha mapa, sin código propio.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture


def test_analytics_engineering_contract_blocks_a_breaking_change(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    pytest.importorskip("dbt.cli.main", reason="falta dbt-core (make snippets-deps)")
    out = run_python_block("analytics-engineering", tmp_path, {**pg_env, **UTF8}, args=(str(tmp_path / "proyecto"),))
    for line in ("v1: 10 nodos ok, 5 tests", "v2: build falla; modelo con error: ['ventas_por_region']",
                 "contrato roto: ['pedidos | | LONGINTEGER | missing in definition']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_dataops_delivery_metrics(tmp_path: Path) -> None:
    out = run_python_block("dataops", tmp_path, UTF8)
    for line in ("despliegues por semana: 2.6", "tasa de cambios que fallan: 33%",
                 "tiempo mediano de recuperación: 1:37:30",
                 "ventas_diarias: frescura incumplida en 2 de 4 cargas (objetivo 6:00:00)"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_finops_attribution_without_double_counting_scripts(tmp_path: Path) -> None:
    out = run_python_block("finops-for-data", tmp_path, UTF8)
    for line in ("TiB por equipo: {'ventas': 4.0, '(sin etiqueta)': 4.0, 'riesgo': 2.0}", "sin dueño: 40% del consumo",
                 "consulta que más escanea: j4 (4 TiB, etiquetas ninguna)"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_golden_path_accepts_and_rejects_manifests(tmp_path: Path) -> None:
    out = run_python_block("data-platform-engineering", tmp_path, UTF8)
    assert "ventas_diarias: aceptado; esqueleto: ['pipelines/ventas/ventas_diarias/dag.py'" in out, out
    assert "'pipelines/ventas/ventas_diarias/retention_policy.yml']" in out, out
    assert ("Reporte-Final: rechazado: ['falta retention_days', 'sin dueño', 'clasificación desconocida: secreto', "
            "'nombre fuera de la convención: Reporte-Final', 'sin tests']") in out, out
    assert_mypy_strict(tmp_path)


def test_versioning_tag_reproduces_and_rolls_back(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("data-versioning", tmp_path, UTF8, args=(str(tmp_path / "work"),))
    for line in ("filas hoy: 1; total hoy: 80.0", "reporte del cierre (etiqueta): 400.0",
                 "tras volver a la etiqueta: 3 filas, total 400.0", "snapshot actual es el del cierre: True",
                 "snapshots guardados: 3; referencias: ['cierre-2026-09', 'main']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

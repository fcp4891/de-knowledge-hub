"""Ejemplos de activación, compartición y acceso de 22-modern-data-engineering (lote F3b-22b) ejecutados en la CI.

- reverse-etl, data-sharing y zero-etl-and-federation: psycopg contra una base temporal en el PostgreSQL de la CI.
  data-sharing crea un rol con el nombre de la base como sufijo y lo borra; zero-etl-and-federation crea y borra una
  base operacional y necesita un superusuario para postgres_fdw (si no lo es, el test se salta: «no ejecutado»).
- semantic-layer: dbt Core contra el PostgreSQL de la CI (ADR-018) y un compilador de juguete del manifiesto semántico.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import pg_env, run_python_block  # noqa: F401 - fixture


def test_reverse_etl_syncs_only_changes_and_retries(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("reverse-etl", tmp_path, {**pg_env, **UTF8})
    for line in ("corrida 1: {'candidatas': 3, 'enviadas': 2, 'fallidas': 1}",
                 "corrida 2: {'candidatas': 1, 'enviadas': 1, 'fallidas': 0}",
                 "corrida 3: {'candidatas': 0, 'enviadas': 0, 'fallidas': 0}",
                 "tras un cambio: {'candidatas': 1, 'enviadas': 1, 'fallidas': 0}",
                 "CRM: {1: 'oro', 2: 'plata', 3: 'oro'}"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_data_sharing_view_live_readonly_and_revocable(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-sharing", tmp_path, {**pg_env, **UTF8})
    for line in ("socio lee la vista: [(1, 'norte', 100), (2, 'norte', 50)]",
                 "socio lee la tabla base: denegado (42501)", "dato nuevo visible sin copiar: [(3,)]",
                 "tras revocar: denegado (42501)"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_semantic_layer_metrics_defined_once(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    pytest.importorskip("dbt.cli.main", reason="falta dbt-core (make snippets-deps)")
    out = run_python_block("semantic-layer", tmp_path, {**pg_env, **UTF8}, args=(str(tmp_path / "proyecto"),))
    for line in ("métricas definidas: ['cantidad_pedidos', 'ingresos', 'ticket_promedio']",
                 "dashboard: [('norte', 160.0, 80.0), ('sur', 40.0, 40.0)]", "mismo resultado en el notebook: True",
                 "rechazada: métrica no definida: margen"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_federation_reads_live_and_pushes_filters(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("zero-etl-and-federation", tmp_path, {**pg_env, **UTF8})
    if out.startswith("no ejecutado"):
        pytest.skip(out.strip())
    for line in ("reporte federado: [('empresa', 100), ('persona', 50)]",
                 "tras un pedido nuevo en la base operacional: [('empresa', 100), ('persona', 80)]",
                 "filtro enviado al remoto: True"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

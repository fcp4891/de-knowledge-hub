"""Ejemplos de casos de uso de IA en Data Engineering (lote F3b-21d) ejecutados en la CI (ADR-025).

- ai-assisted-sql-generation: PostgreSQL de la CI (EXPLAIN en una transacción READ ONLY).
- ai-data-classification, ai-anomaly-detection y ai-generated-documentation: biblioteca estándar, con salidas de modelo fijas.
- rag-over-technical-docs: numpy (opción A del ADR-025).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import pg_env, run_python_block  # noqa: F401 - fixture


def test_generated_sql_is_validated_before_running(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("ai-assisted-sql-generation", tmp_path, {**pg_env, **UTF8})
    for line in ("aceptada: SELECT region, sum(monto) AS total FROM pedidos … → con su LIMIT",
                 "aceptada: SELECT * FROM pedidos WHERE monto > 100… → LIMIT 100 agregado",
                 "rechazada: DELETE FROM pedidos WHERE region = 'norte'… → no es una consulta de lectura",
                 'rechazada: SELECT region, sum(descuento) FROM pedidos GROUP… → UndefinedColumn: column "descuento" does not exist',
                 "rechazada: SELECT p.region, c.rut FROM pedidos p JOIN clien… → tablas no permitidas: ['clientes_pii']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_classification_rule_wins_and_doubts_go_to_review(tmp_path: Path) -> None:
    out = run_python_block("ai-data-classification", tmp_path, UTF8)
    for line in ("id_cliente_txt: personal — regla (RUT o correo en las muestras)",
                 "diagnostico: sensible — modelo (0.93)",
                 "comuna: revisión — confianza 0.55 < 0.8",
                 "canal: no_personal — modelo (0.97)",
                 "obs: revisión — etiqueta fuera de la taxonomía: confidencial"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_anomaly_is_statistical_and_the_model_only_drafts(tmp_path: Path) -> None:
    out = run_python_block("ai-anomaly-detection", tmp_path, UTF8)
    for line in ("2026-10-20 (mar): 410 filas; mismo día anteriores [640, 630]; z robusto -30.4",
                 "anomalía: sí; contexto para el modelo:",
                 "borrador (respuesta fija del modelo):"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_docs_index_sync_is_idempotent_and_filters_by_version(tmp_path: Path) -> None:
    pytest.importorskip("numpy", reason="falta numpy (make snippets-deps)")
    out = run_python_block("rag-over-technical-docs", tmp_path, UTF8)
    for line in ("primera carga: {'vectorizadas': 3, 'borradas': 0, 'total': 3}",
                 "misma carga otra vez: {'vectorizadas': 0, 'borradas': 0, 'total': 3}",
                 "tras editar un documento: {'vectorizadas': 1, 'borradas': 1, 'total': 2}",
                 "timeout en 2.x: runbooks/ventas_diarias.md#timeout-al-escribir",
                 "timeout en 1.x: runbooks/ventas_diarias_v1.md#timeout-al-escribir"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_generated_docs_reject_invented_columns(tmp_path: Path) -> None:
    out = run_python_block("ai-generated-documentation", tmp_path, UTF8)
    assert "esquema: 5 columnas; perfil con 2 columnas" in out, out
    assert ("{'estado': 'borrador: requiere revisión del dueño', 'aceptadas': 4, "
            "'inventadas_rechazadas': ['descuento'], 'sin_descripcion': ['creado']}") in out, out
    assert_mypy_strict(tmp_path)

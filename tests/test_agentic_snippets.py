"""Ejemplos de IA agéntica aplicada a datos de 23-emerging-technologies (lote F3b-23a) ejecutados en la CI.

- model-context-protocol: SDK oficial mcp 2.3.0, servidor y cliente locales por stdio, sin red ni modelo (ADR-026).
- data-agents, agentic-workflows, agentic-data-engineering, llm-driven-automation y ai-assisted-development:
  biblioteca estándar, con decisiones de modelo fijas.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import run_python_block


def test_mcp_stdio_server_with_read_only_tool(tmp_path: Path) -> None:
    pytest.importorskip("mcp", reason="falta mcp (make snippets-deps)")
    out = run_python_block("model-context-protocol", tmp_path, UTF8, args=(str(tmp_path / "work"),))
    for line in ("protocolo: 2026-07-28", "herramientas: ['describir_tabla']",
                 "resultado: {'tabla': 'ventas', 'columnas': ['fecha date', 'monto numeric', 'region text']}",
                 "tabla desconocida: is_error = True"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_data_agent_tools_are_read_only(tmp_path: Path) -> None:
    out = run_python_block("data-agents", tmp_path, UTF8)
    for line in ("listar_tablas() → ['ventas']", "→ [('norte', 160), ('sur', 40)]",
                 "consultar rechazada: solo una sentencia SELECT"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_agentic_loop_has_step_limit_and_approval(tmp_path: Path) -> None:
    out = run_python_block("agentic-workflows", tmp_path, UTF8)
    for line in ("DAG: ['revisar_estado', 'recargar(2026-10-26)', 'avisar(partición recargada)']",
                 "bucle: corte en el paso 5, límite de 4",
                 "bucle: ['revisar_estado', 'recargar(2026-10-26)', 'recargar: espera aprobación', 'recargar: espera aprobación']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_agentic_plan_is_reviewed_step_by_step(tmp_path: Path) -> None:
    out = run_python_block("agentic-data-engineering", tmp_path, UTF8)
    for line in ("desplegar a producción: requiere aprobación (pull request)",
                 "borrar pedidos_v1 en producción: rechazado: fuera del alcance del agente",
                 "pasos autónomos: 3 de 5; el resto lo decide una persona"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_llm_automation_by_risk_tier(tmp_path: Path) -> None:
    out = run_python_block("llm-driven-automation", tmp_path, UTF8)
    for line in ("puerta de evaluación: acierto 100%; activa", "consultar_estado (lectura): ejecutada",
                 "reintentar_job (cambio): espera aprobación", "borrar_tabla (prohibido): rechazada"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_ai_generated_change_goes_through_the_same_gate(tmp_path: Path) -> None:
    out = run_python_block("ai-assisted-development", tmp_path, UTF8)
    for line in ("test: ok", "FALLA SQL destructivo en migracion.sql",
                 "FALLA la aprobación es de quien pidió el cambio; falta otra persona", "resultado: no se mergea"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

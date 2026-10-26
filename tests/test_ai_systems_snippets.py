"""Ejemplos de sistemas con IA de 21-ai-for-data-engineering (lote F3b-21c) ejecutados en la CI (ADR-025).

- llm-evaluation, guardrails, llm-agents y multi-agent-systems: biblioteca estándar, con salidas de modelo fijas.
- llm-observability: SDK de OpenTelemetry con un exporter propio en memoria, sin collector (ADR-020).
"""

from __future__ import annotations

from pathlib import Path

from tests.test_observability_snippets import UTF8, assert_mypy_strict, require_otel
from tests.test_open_stack_snippets import run_python_block


def test_evaluation_gate_blocks_the_regression(tmp_path: Path) -> None:
    out = run_python_block("llm-evaluation", tmp_path, UTF8)
    for line in ("v1: {'recall@3': 1.0, 'mrr': 0.875, 'acierto': 1.0, 'citas_correctas': 1.0}",
                 "v2: {'recall@3': 1.0, 'mrr': 0.875, 'acierto': 0.75, 'citas_correctas': 0.75}",
                 "puerta: bloquea v2, empeoran acierto, citas_correctas"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_genai_spans_without_content_by_default_and_masked_when_enabled(tmp_path: Path) -> None:
    require_otel()
    out = run_python_block("llm-observability", tmp_path, UTF8)
    assert "chat amazon.nova-pro-v1:0 [CLIENT] tokens=52+11 contenido=no PII en el span=False" in out, out
    assert "chat amazon.nova-pro-v1:0 [CLIENT] tokens=52+11 contenido=sí PII en el span=False" in out, out
    assert "contenido registrado: El cliente [RUT] ([CORREO]) pregunta por qué falló ventas_diarias." in out, out
    assert_mypy_strict(tmp_path)


def test_guardrails_mask_review_and_block(tmp_path: Path) -> None:
    out = run_python_block("guardrails", tmp_path, UTF8)
    for line in ("entrada → pasa: No puedo entrar al dashboard de ventas, mi RUT es [RUT]",
                 "entrada → revisión (posible inyección):", "entrada → bloquea (demasiado largo):",
                 "salida «acceso» → pasa", "salida «Cliente 12345678-5» → bloquea (datos personales en la salida)",
                 "salida «reembolso inmediato» → bloquea (categoría no permitida: reembolso inmediato)"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_agent_loop_finishes_pauses_for_approval_and_cuts_cycles(tmp_path: Path) -> None:
    out = run_python_block("llm-agents", tmp_path, UTF8)
    for line in ("3: respuesta final: falló por timeout del warehouse; reintentar",
                 "2: relanzar_job(ventas_diarias) → pausa: requiere aprobación humana",
                 "corte: 4 pasos sin respuesta final"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_multi_agent_only_when_the_task_crosses_domains(tmp_path: Path) -> None:
    out = run_python_block("multi-agent-systems", tmp_path, UTF8)
    for line in ("clasificar un mensaje de error: llamada directa, 1 llamada (~2 s); con varios agentes serían 6 llamadas (~12 s)",
                 "diagnosticar una carga fallida: un agente con herramientas, 3 llamadas (~6 s); con varios agentes serían 6 llamadas (~12 s)",
                 "conciliar ventas (finanzas) con despachos (logística): varios agentes, 6 llamadas (~12 s)"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

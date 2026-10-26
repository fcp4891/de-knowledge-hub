"""Ejemplos de casos de uso emergentes de IA en Data Engineering (lote F3b-21e) ejecutados en la CI (ADR-025).

Los cuatro usan la biblioteca estándar, con salidas de modelo fijas: lo que se prueba es el control determinista
alrededor de la propuesta del modelo.
"""

from __future__ import annotations

from pathlib import Path

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import run_python_block


def test_enrichment_respects_glossary_and_people_and_is_idempotent(tmp_path: Path) -> None:
    out = run_python_block("ai-metadata-enrichment", tmp_path, UTF8)
    for line in ("rechazada: id_cliente: ya tiene descripción de una persona; no se pisa",
                 "rechazada: flag_x: término fuera del glosario: pedido de prueba",
                 "cola de revisión: [('canal', 0.62), ('monto_neto', 0.91)]",
                 "aplicadas: 1", "aplicadas otra vez: 0"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_generated_pipeline_is_validated_as_code(tmp_path: Path) -> None:
    out = run_python_block("ai-pipeline-generation", tmp_path, UTF8)
    for line in ("propuesta A: borrador para pull request, orden ['stg_pedidos', 'stg_clientes', 'fct_ventas']",
                 "propuesta B: rechazada", "- stg_pedidos: sin tests",
                 "- ventas_tmp: no sigue la convención de nombres", "- ventas_tmp: DROP o TRUNCATE no permitido",
                 "- fct_ventas: depende de un paso inexistente: stg_envios",
                 "- ciclo: stg_pedidos → fct_ventas → stg_pedidos"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_error_hypotheses_must_cite_evidence(tmp_path: Path) -> None:
    out = run_python_block("ai-error-analysis", tmp_path, UTF8)
    for line in ("categoría por firma: ['OUT_OF_MEMORY']; líneas de evidencia: [2, 3, 4]",
                 "se mantiene: Sesgo en la clave del join",
                 "se descarta: La credencial del bucket expiró (cita líneas sin evidencia: [9])",
                 "se descarta: El clúster se apagó por mantenimiento (cita líneas sin evidencia: [5])",
                 "acción: ninguna automática; diagnóstico para la persona de guardia"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_catalog_search_filters_permissions_and_validates_citations(tmp_path: Path) -> None:
    out = run_python_block("natural-language-catalog-interfaces", tmp_path, UTF8)
    for line in ("resultados para analista_ventas: [('ventas.fct_ventas', 3.0)]",
                 "finanzas.ingresos_contables visible: False",
                 "respuesta 1: aceptada",
                 "respuesta 2: rechazada: cita activos fuera de los resultados ['finanzas.ingresos_contables']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

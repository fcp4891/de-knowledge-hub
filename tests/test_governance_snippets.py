"""Ejemplos de 17-governance ejecutados en la CI.

- data-catalog, metadata-management y data-retention: psycopg contra una base temporal en el PostgreSQL de la CI.
- data-lineage: openlineage-python con transporte a archivo, sin backend (ADR-021).
- data-lifecycle-management, data-ownership, data-stewardship, data-domains y data-classification: solo biblioteca estándar.
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


def test_catalog_search_finds_tables_by_name_and_description(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-catalog", tmp_path, {**pg_env, **UTF8})
    for line in ("finanzas.facturas: Facturas emitidas por pedido. Dueño: finanzas",
                 "ventas.devoluciones: Devoluciones de pedidos. Dueño: comercial",
                 "ventas.pedidos: Pedidos confirmados, uno por fila. Dueño: comercial"):
        assert line in out, out
    assert out.split("buscar «finanzas»:")[1].count("\n  ") == 1, out
    assert_mypy_strict(tmp_path)


def test_metadata_coverage_shows_missing_descriptions(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("metadata-management", tmp_path, {**pg_env, **UTF8})
    for line in ("pedidos: Un pedido por fila; dueño: equipo comercial",
                 "monto (numeric, nulos=YES): Monto total en CLP, con impuestos",
                 "cliente_id (integer, nulos=NO): SIN DESCRIPCIÓN",
                 "cobertura de descripciones: 2/4; faltan ['cliente_id', 'canal']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_lineage_upstream_and_downstream_from_openlineage_events(tmp_path: Path) -> None:
    pytest.importorskip("openlineage.client", reason="falta openlineage-python (make snippets-deps)")
    work = tmp_path / "work"
    work.mkdir()
    out = run_python_block("data-lineage", tmp_path, UTF8, args=(str(work),))
    for line in ("eventos: 8 (4 COMPLETE)",
                 "de dónde viene export.finanzas_diario: ['mart.ventas_por_cliente', 'raw.clientes', 'raw.pedidos', "
                 "'stg.clientes', 'stg.pedidos']",
                 "qué se ve afectado si cambia raw.clientes: ['export.finanzas_diario', 'mart.ventas_por_cliente', "
                 "'stg.clientes']"):
        assert line in out, out
    assert (work / "lineage.jsonl").exists()
    assert_mypy_strict(tmp_path)


def test_retention_drops_expired_partitions_once(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-retention", tmp_path, {**pg_env, **UTF8})
    assert "primera corrida, borradas: ['eventos_2026_05', 'eventos_2026_06']" in out, out
    assert "segunda corrida, borradas: []" in out, out
    assert "quedan: (datetime.date(2026, 7, 15), datetime.date(2026, 10, 15), 4)" in out, out
    assert_mypy_strict(tmp_path)


def test_lifecycle_policy_assigns_an_action_per_class_and_age(tmp_path: Path) -> None:
    out = run_python_block("data-lifecycle-management", tmp_path, UTF8)
    for line in ("raw/pedidos/2026-10-01.json (19 días): mantener",
                 "raw/pedidos/2026-08-01.json (80 días): pasar a almacenamiento frío",
                 "raw/pedidos/2025-09-01.json (414 días): borrar",
                 "auditoria/accesos/2024-01.log (993 días): mantener",
                 "tmp/sin-clase.csv (292 días): SIN CLASE: revisar"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


ORGANIZATION = {
    "data-ownership": ["ventas.pedidos: ok", "ventas.devoluciones: sin dueño de negocio; sin respaldo",
                       "marketing.campanias: dueño 'marketing' no es un equipo registrado",
                       "tmp.cargas_manuales: el equipo técnico figura como dueño de negocio; sin respaldo",
                       "datasets con problemas: 4/5"],
    "data-stewardship": ["ana · termino · cliente activo: 81 días -> VENCIDO: escalar al dueño",
                         "luis · calidad · montos negativos en pedidos: 8 días -> VENCIDO: escalar al dueño",
                         "ana · calidad · clientes duplicados: 2 días -> en plazo",
                         "pendientes por steward: {'ana': 3, 'luis': 1}"],
    "data-domains": ["margen_diario [finanzas] lee ventas.pedidos: ok (producto publicado por ventas)",
                     "atribucion [marketing] lee ventas.stg_pedidos: NO: tabla interna de ventas; pedir que la publique"],
    "data-classification": ["contacto: email (75%)", "fono: telefono_cl (67%)", "medio_pago: tarjeta (67%)",
                            "comentario: sin etiqueta", "codigo_pedido: sin etiqueta"],
}


@pytest.mark.parametrize("ficha", sorted(ORGANIZATION))
def test_organization_examples_print_their_checks(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in ORGANIZATION[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)

"""Ejemplos de 19-compliance ejecutados en la CI (ADR-023).

- chile-data-protection y pii-identification: solo biblioteca estándar.
- processing-activities-inventory: openlineage-python con transporte a archivo, sin backend (ADR-021).
- data-minimization-by-layer: psycopg contra una base temporal en el PostgreSQL de la CI; el rol lleva como sufijo el
  nombre de la base temporal y se borra al terminar.
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


STDLIB = {
    "chile-data-protection": [
        "requisitos: 5; con control y evidencia: 3", "sin control: ['art. 15 bis encargo a terceros']",
        "sin evidencia: ['art. 14 quáter protección desde el diseño']",
        "los decide el área legal: ['art. 14 a) acreditar la licitud', 'art. 15 bis encargo a terceros']",
        "la CI falla: True (2 brechas)"],
    "pii-identification": [
        "rut_cliente: personal (RUT con DV válido 100%)", "contacto: personal (correo 75%)",
        "fono: personal (teléfono 67%)", "diagnostico_principal: sensible (datos relativos a la salud)",
        "tramo_ingreso: sensible (situación socioeconómica)",
        "rut_sin_guion: sin datos personales detectados (nada calza)",
        "rut_dv_cambiado: sin datos personales detectados (nada calza)"],
}
MINIMIZATION = [
    "bronze: ['rut', 'nombre', 'email', 'comuna', 'edad', 'monto']; valores con RUT o correo en claro: 10",
    "silver: ['cliente_key', 'comuna', 'tramo_edad', 'monto']; valores con RUT o correo en claro: 0",
    "gold: ['comuna', 'clientes', 'monto_total']; valores con RUT o correo en claro: 0",
    "gold: [('Maipú', 2), ('Ñuñoa', 2)]",
    "analista lee gold: ok (2 filas); lee bronze: denegado (42501)",
]


@pytest.mark.parametrize("ficha", sorted(STDLIB))
def test_compliance_examples_in_python(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in STDLIB[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_processing_inventory_from_openlineage_and_catalog(tmp_path: Path) -> None:
    pytest.importorskip("openlineage.client", reason="falta openlineage-python (make snippets-deps)")
    work = tmp_path / "work"
    work.mkdir()
    out = run_python_block("processing-activities-inventory", tmp_path, UTF8, args=(str(work),))
    assert "actividades con datos personales: 2" in out, out
    assert '"dataset": "silver.clientes", "origen": ["crm.clientes"]' in out, out
    assert ("brechas del registro: ['mkt.audiencia_campana: falta finalidad', 'mkt.audiencia_campana: falta base', "
            "'mkt.audiencia_campana: falta retencion_dias']") in out, out
    assert_mypy_strict(tmp_path)


def test_minimization_by_layer_in_postgres(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-minimization-by-layer", tmp_path, {**pg_env, **UTF8})
    for line in MINIMIZATION:
        assert line in out, out
    assert_mypy_strict(tmp_path)

"""Ejemplos de 19-compliance ejecutados en la CI (ADR-023).

- chile-data-protection y pii-identification: solo biblioteca estándar.
- processing-activities-inventory: openlineage-python con transporte a archivo, sin backend (ADR-021).
- data-minimization-by-layer y data-subject-requests: psycopg contra una base temporal en el PostgreSQL de la CI; el rol
  lleva como sufijo el nombre de la base temporal y se borra al terminar.
- chilean-identifier-pseudonymization, personal-data-breach-readiness y dpia-technical-input: biblioteca estándar.
- privacy-by-design-checklist: jsonschema (ya en requirements.txt); sin mypy, porque jsonschema no trae tipos.
- erasure-across-copies: PyIceberg con catálogo SQL en SQLite (ADR-018) y cryptography (ADR-022); se salta en Windows.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture

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
    "chilean-identifier-pseudonymization": [
        "variantes del mismo RUT, mismo seudónimo: True", "sin normalizar, seudónimos distintos: 3",
        "DV inválido: RUT no válido: '11111111-0'", "hash simple revertido probando 1.000.000 RUT del tramo: True",
        "con HMAC y sin la clave, el mismo ataque no sirve: True"],
    "personal-data-breach-readiness": [
        "alcance: 4 titulares [1, 2, 3, 4]; desde 2026-12-03T22:10:00; vía ['bucket público']",
        "categorías afectadas: ['contacto', 'identificación', 'obligaciones económicas y financieras']",
        "preparar comunicación a los titulares: True ['obligaciones económicas y financieras']",
        '"titulares_aprox": 4',
        "plazos al CSIRT Nacional: {'alerta temprana': '2026-12-04T11:30', 'actualización': '2026-12-07T08:30', "
        "'informe final': '2026-12-19T08:30'}"],
    "dpia-technical-input": [
        "casos que exigen evaluación: ['a) decisiones automatizadas o perfiles con efectos significativos', "
        "'b) tratamiento masivo o a gran escala']",
        "flujo de datos de gold.puntajes: ['modelo_riesgo', 'silver.clientes', 'silver.creditos']",
        "riesgo de reidentificación de la salida: k=1, l=1 entre las clases con 2 o más filas",
        "clases únicas (k=1): [('norte', '50-59', 'M'), ('sur', '40-49', 'F')]"],
}
PRIVACY_GATE = [
    "- SQL: SELECT * sobre la tabla personal bronze.clientes", "- contrato: 'base_licitud' is a required property",
    "- contrato: 'retencion_dias' is a required property", "- log 1: dato personal en claro", "- log 2: dato personal en claro",
    "puerta de privacidad: falla (5 hallazgos)",
]
DSR = [
    "acceso: {'clientes': (1, 'venta y despacho'), 'optin': (1, 'envío de ofertas'), 'pedidos': (2, 'venta y despacho')}",
    "portabilidad: JSON de 3 tablas", "rectificación: ('ana@nuevo.invalid',)",
    "bloqueo: el pipeline procesa 1 de 2 clientes; los datos siguen guardados",
    "supresión: {'clientes': 1, 'optin': 1} | se conserva: pedidos (obligación legal)",
    "verificación: {'clientes': 0, 'optin': 0, 'pedidos': 2}", "log de evidencia íntegro: True (6 registros)",
    "tras alterar un registro, íntegro: False", "plazo de respuesta: 2027-01-01; con prórroga: 2027-01-31",
]
ERASURE = [
    "tabla actual tiene a la titular: False", "snapshot anterior (time travel) todavía la tiene: True",
    "snapshots que quedan: 1 | el anterior expiró: True",
    "tras expirar, archivos Parquet que todavía contienen el correo: 1",
    "archivos sin referencia borrados: 1; con el correo: 0",
    "respaldo: ['ilegible (clave destruida)', 'luis@example.org']",
]
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


def test_data_subject_requests_in_postgres(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-subject-requests", tmp_path, {**pg_env, **UTF8})
    for line in DSR:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_erasure_across_copies_with_pyiceberg_and_crypto_shredding(tmp_path: Path) -> None:
    require_iceberg()  # se salta en Windows (ADR-018)
    pytest.importorskip("cryptography")
    work = tmp_path / "work"
    work.mkdir()
    out = run_python_block("erasure-across-copies", tmp_path, UTF8, args=(str(work),))
    for line in ERASURE:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_privacy_gate_with_jsonschema(tmp_path: Path) -> None:
    out = run_python_block("privacy-by-design-checklist", tmp_path, UTF8)
    for line in PRIVACY_GATE:
        assert line in out, out

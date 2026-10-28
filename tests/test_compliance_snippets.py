"""Ejemplos de 19-compliance ejecutados en la CI (ADR-023, upgrade de 19 del 2026-10-22).

- Biblioteca estándar: chile-data-protection, pii-identification, processing-activities-inventory,
  chilean-identifier-pseudonymization, data-subject-rights-pipeline, retention-and-erasure, data-breach-response,
  dpia-and-automated-decisions, processors-and-international-transfers y privacy-controls-as-code.
- data-minimization-by-layer: psycopg contra una base temporal en el PostgreSQL de la CI; el rol lleva como sufijo el
  nombre de la base temporal y se borra al terminar.
- Los ejemplos que hacen fallar la CI con brechas terminan con código 1: el test verifica ese código y la salida.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

from tests.test_docker_snippets import blocks
from tests.test_open_stack_snippets import pg_env, run_python_block  # noqa: F401 - fixture

UTF8 = {"PYTHONIOENCODING": "utf-8"}   # los ejemplos imprimen tildes; en Windows la salida sería cp1252


def assert_mypy_strict(tmp_path: Path) -> None:
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", "snippet.py"], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr


def run_gate(ficha: str, tmp_path: Path) -> str:
    """Corre el bloque ```python de la §10 que termina con código 1 (brechas): la CI del ejemplo falla a propósito."""
    (code,) = blocks(ficha, "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")
    result = subprocess.run([sys.executable, "snippet.py"], cwd=tmp_path, env={**os.environ, **UTF8},
                            capture_output=True, text=True, encoding="utf-8", timeout=300)
    assert result.returncode == 1, f"se esperaba código 1 (brechas): {result.returncode}\n{result.stdout}{result.stderr}"
    return result.stdout


STDLIB = {
    "pii-identification": [
        "rut_cliente: personal: RUT con DV válido (2 de 2)", "contacto: personal: correo en el valor (1 de 2)",
        "cliente_id: revisión personal: posible identificador indirecto o texto libre",
        "diagnostico: revisión sensible: nombre asociado a datos relativos a la salud",
        "tramo_ingreso: revisión sensible: nombre asociado a situación socioeconómica",
        "comentarios: personal: correo en el valor (1 de 2)",
        "comentarios: revisión personal: posible identificador indirecto o texto libre",
        "rut_malformado: revisión personal: forma de RUT con DV inválido (1 de 1)",
        "sin hallazgos (no significa anónimo): ['comuna', 'producto']"],
    "chilean-identifier-pseudonymization": [
        "variantes del mismo RUT, mismo seudónimo: True", "sin normalizar, seudónimos distintos: 3",
        "DV inválido: RUT no válido: '11111111-0' → cuarentena para revisión, no se descarta",
        "mismo RUT en dos dominios con claves distintas, mismo seudónimo: False", "hash simple revertido probando 1.000.000 RUT del tramo: True",
        "con HMAC y sin la clave, el mismo ataque no sirve: True", "k con datos exactos: 1",
        "k generalizando comuna y década: 1", "grupos únicos a suprimir: [('Tarapacá', '1950s', 'M')]",
        "k tras suprimir atípicos: 2"],
    "data-subject-rights-pipeline": [
        "plazos supresión: {'respuesta': '2026-11-28', 'con_prorroga': '2026-12-28', 'bloqueo_si_se_pide': '2026-11-02'}",
        '"actividad": "riesgo_fraude"', '"interes_legitimo": "prevenir fraude en pagos"',
        '"logica_automatizada": "puntaje de riesgo; transacciones sobre el umbral pasan a revisión humana"',
        '"actividad": "venta_pasajes"', "tablas portables: []",
        "tras el backfill, ¿sigue rectificado?: True",
        "cierre de la rectificación: no permitido: ['plataforma_campanas: pendiente']"],
    "retention-and-erasure": [
        "evidencia: {'solicitud': 'SOL-2026-0042', 'borradas': {'bronze.reservas': 1, 'silver.pasajeros': 1}, "
        "'conservadas_por_obligacion_legal': {'gold.facturas': 1}, 'en_lista_supresion': True}",
        "llave del titular en la evidencia: 16 caracteres hex, sin RUT",
        "retención vencida al 2026-10-22: {'bronze.reservas': (1, 'suprimir')}",
        "¿el backfill reintroduce al titular?: False",
        "alcance en la lista de supresión: ['bronze.reservas', 'silver.pasajeros']",
        "SOL-2026-0042 aún no verificada: ['silver.pasajeros: pendiente_expiracion_copias', 'proveedor_email: pendiente', "
        "'proveedor_email: falta evidencia']"],
    "data-breach-response": [
        "'tablas': ['export.tmp_reservas', 'silver.pagos', 'silver.pasajeros'], 'titulares_aprox': 4, "
        "'categorias': ['contacto', 'financiero', 'identificación'], 'incluye_menores_14': True",
        "'limitaciones': ['sin catálogo: export.tmp_reservas', 'índice parcial: silver.pagos']",
        "'aviso_a_titulares_si_se_reporta': True}", "'tablas': ['gold.vuelos_agregados'], 'titulares_aprox': 0",
        "'aviso_a_titulares_si_se_reporta': False}",
        "plazos Ley 21.663 (no operador vital): {'alerta_temprana': '2026-10-22T12:40', "
        "'actualizacion': '2026-10-25T09:40', 'informe_final': '2026-11-06T12:40'}",
        "plazos Ley 21.663 (operador vital, sin servicios esenciales afectados): {'alerta_temprana': '2026-10-22T12:40', "
        "'actualizacion': '2026-10-25T09:40', 'informe_final': '2026-11-06T12:40', 'plan_de_accion': '2026-10-29T09:40'}",
        "plazos Ley 21.663 (operador vital, servicios esenciales afectados): {'alerta_temprana': '2026-10-22T12:40', "
        "'actualizacion': '2026-10-23T09:40', 'informe_final': '2026-11-06T12:40', 'plan_de_accion': '2026-10-29T09:40'}"],
    "dpia-and-automated-decisions": [
        "score_fraude_pagos → EIPD obligatoria por: ['a) perfilamiento con efectos significativos', "
        "'b) tratamiento masivo o a gran escala']",
        "tablero_ocupacion_vuelos → EIPD obligatoria por: ningún caso tasado", "despliegue fraude-v3.3: permitido",
        "despliegue fraude-v4.0: bloqueado: EIPD obligatoria sin aprobación vigente para la versión mayor 4",
        "'huella_entradas': '3c4c036d2fd4', 'variables_principales': ['pais_tarjeta_distinto', 'monto_relativo']",
        "'resultado': 'derivada a revisión humana', 'titular_puede_pedir_revision': True}"],
}
GATES = {
    "processing-activities-inventory": [
        "- emitir y gestionar pasajes | base: contrato (art. 13 c) | datos: identificación, contacto, itinerario "
        "| destinatarios: aerolíneas socias | plazo: 5 años",
        "BRECHA tabla con PII sin actividad: gold.score_fraude", "BRECHA marketing: sin plazo de conservación",
        "BRECHA sin aprobación: job_fraude → silver.pasajeros (modelo_fraude)",
        "BRECHA sin vínculo: dashboard_externo → silver.pasajeros"],
    "processors-and-international-transfers": [
        "flujos: 7; brechas: 6", "BRECHA tickets_soporte → API de LLM externa: sin contrato de encargo (art. 15 bis)",
        "BRECHA silver.pasajeros → plataforma de email: finalidad «perfilamiento» fuera del alcance aprobado "
        "(['notificaciones'])",
        "BRECHA logs_aplicacion → soporte remoto del proveedor de monitoreo: transferencia a US sin mecanismo (art. 27)",
        "BRECHA tickets_soporte → API de LLM externa: transferencia a US sin mecanismo (art. 27)",
        "BRECHA silver.reservas → proveedor de ETL (contrato cerrado): terminado sin constancia de supresión o devolución "
        "(art. 15 bis)"],
    "privacy-controls-as-code": [
        "cobertura de etiquetas: 3/5; columnas PII con máscara: 1/5 (1 sin verificar)",
        "FAIL PII sin etiqueta: silver.pasajeros.telefono",
        "EXCEPCIÓN PII con demasiados lectores sin máscara (vence 2026-11-30, dueño equipo-clientes): "
        "silver.pasajeros.telefono",
        "FAIL PII real en ambiente no productivo (excepción vencida el 2026-10-01): dev.pasajeros_copia.email",
        "UNKNOWN PII de contacto sin máscara: gold.clientes_contacto.telefono",
        "FAIL tabla sin retención o dueño: dev.pasajeros_copia", "FAIL SELECT * sobre tabla con PII: silver.pasajeros",
        "FAIL PII en claro en el log: línea 1", "FAIL PII en claro en el log: línea 2",
        "FAIL contrato sin base_licitud: gold.ventas", "FAIL contrato sin retencion_dias: gold.ventas",
        "DERIVA silver.pasajeros.telefono: máscara declarada en Git y ausente en producción",
        "pruebas negativas: 4/4 reglas detectan su caso malo",
        "resultados: {'EXCEPCIÓN': 1, 'FAIL': 10, 'PASS': 13, 'UNKNOWN': 2}"],
}
MINIMIZATION = [
    "bronze: ['rut', 'nombre', 'email', 'comuna', 'edad', 'monto']; valores con RUT o correo en claro: 10",
    "silver: ['cliente_key', 'comuna', 'tramo_edad', 'monto']; valores con RUT o correo en claro: 0",
    "gold: ['comuna', 'clientes', 'monto_total']; valores con RUT o correo en claro: 0",
    "gold: [('Maipú', 2), ('Ñuñoa', 2)]",
    "analista lee gold: ok (2 filas); lee bronze: denegado (42501)",
    "contrato: sin columnas fuera del contrato",
    "tras agregar email a silver, fuera del contrato: {'silver': ['email']}",
]


@pytest.mark.parametrize("ficha", sorted(STDLIB))
def test_compliance_examples_in_python(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8)
    for line in STDLIB[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


@pytest.mark.parametrize("ficha", sorted(GATES))
def test_compliance_gates_fail_the_ci_with_gaps(ficha: str, tmp_path: Path) -> None:
    out = run_gate(ficha, tmp_path)
    for line in GATES[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


FIXTURE = Path(__file__).parent / "fixtures" / "privacy-control-results.json"


def test_privacy_control_results_fail_the_ci_with_gaps(tmp_path: Path) -> None:
    """chile-data-protection §10: valida la entrada versionada con una fecha fija; la entrada del §10 es la misma."""
    (code,) = blocks("chile-data-protection", "python")
    (shown,) = blocks("chile-data-protection", "json")
    assert shown.strip() == FIXTURE.read_text(encoding="utf-8").strip()
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")
    result = subprocess.run([sys.executable, "snippet.py", str(FIXTURE), "2026-10-26"], cwd=tmp_path,
                            env={**os.environ, **UTF8}, capture_output=True, text=True, encoding="utf-8", timeout=300)
    assert result.returncode == 1, result.stdout + result.stderr
    for line in ("controles exigidos: 4; resultados: 3; brechas: 4",
                 "BRECHA access_review: evidencia vencida (86 días)", "BRECHA erasure_replay_check: sin resultado",
                 "BRECHA retention_check: prueba no aprobada (failed)",
                 "BRECHA retention_check: falta run_id o evidence_uri"):
        assert line in result.stdout, result.stdout
    assert_mypy_strict(tmp_path)


def test_minimization_by_layer_in_postgres(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-minimization-by-layer", tmp_path, {**pg_env, **UTF8})
    for line in MINIMIZATION:
        assert line in out, out
    assert_mypy_strict(tmp_path)

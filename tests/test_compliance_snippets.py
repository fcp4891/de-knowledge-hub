"""Ejemplos de las fichas de la Ley 21.719 (antes en 19-compliance, hoy en 24-privacy-engineering) ejecutados en la CI (ADR-023, upgrade del 2026-10-22).

- Biblioteca estándar: gdpr y lgpd (lote P4, reglas por jurisdicción), chile-data-protection, pii-identification (escenarios con
  su salida documentada), processing-activities-inventory,
  chilean-identifier-pseudonymization, data-subject-rights-pipeline, retention-and-erasure, data-breach-response,
  dpia-and-automated-decisions, processors-and-international-transfers y privacy-controls-as-code.
- retention-and-erasure: además del ejemplo con biblioteca estándar, PyIceberg con catálogo SQLite en Linux (ADR-018) y
  crypto-shredding con cryptography (ADR-022); las llaves por titular las genera el test, no el snippet.
- data-minimization-by-layer: psycopg contra una base temporal en el PostgreSQL de la CI; el rol lleva como sufijo el
  nombre de la base temporal y se borra al terminar.
- Los ejemplos que hacen fallar la CI con brechas terminan con código 1: el test verifica ese código y la salida.
"""

from __future__ import annotations

import importlib.util
import inspect
import json
import os
import secrets
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest

from tests.test_docker_snippets import blocks
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture

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
    "gdpr": [
        "reglas versión 2026-10-30",
        "BR → ANPD: 2026-12-09T10:00+00:00 si hay risco ou dano relevante (días hábiles sin feriados)",
        "CL → Agencia de Protección de Datos Personales: sin dilación indebida (sin plazo fijo)",
        "EU → autoridad de control: 2026-12-07T10:00+00:00",
        "AR: sin regla configurada → revisar con el área legal antes de operar",
        "CL → titular: 2027-01-03T10:00+00:00 (prórroga hasta 2027-02-02) · Ley 19.628, art. 11",
        "EU → interesado: 2027-01-04T10:00+00:00 (prórroga hasta 2027-03-04) · GDPR art. 12.3",
        "BR → titular: 2026-12-19T10:00+00:00 si se pide la declaración completa (días corridos) · LGPD art. 19, II [ilustrativo]"],
    "lgpd": [
        "incidente conocido el 2026-12-04: ANPD y titulares hasta 2026-12-10 (sin feriado sería 2026-12-09)",
        "pedidos de clientes en Brasil → bodega en la UE: OK: destino adecuado según el origen",
        "clientes en Brasil → analítica en Chile: BRECHA: las cláusulas-padrão se adoptan sin modificaciones",
        "clientes en Brasil → CRM en EE. UU.: OK: cláusulas-padrão contratuais da ANPD",
        "clientes en Chile → API de LLM en EE. UU.: BRECHA: sin adecuación ni cláusulas",
        "brechas: 2 de 5"],
    "privacy-in-ai-rag-llm": [
        "público pregunta por equipaje: ['c1']", "soporte pregunta por equipaje: ['c1', 'c2', 'c3']",
        "respuesta='Reclamo de [REDACTADO] ([REDACTADO]) por equipaje.'",
        "supresión de reclamo-0042: {'fragmentos': 2, 'cache': 1, 'trazas': 1}", "reconciliación, restos: ninguno",
        "soporte vuelve a preguntar: ['c1']"],
    "privacy-backup-and-recovery": [
        "sin reconciliar, reaparecen: ['t-02', 't-03'] → no se libera", "órdenes posteriores al respaldo: [11, 12, 13]",
        "filas tras reconciliar: {'t-01': 'SCL-LIM'}", "¿idempotente?: True",
        "lectores del respaldo: ['grp-ex-proveedor', 'grp-soporte'] | se reaplican los vigentes: ['grp-soporte']",
        "liberar a consumidores: sí"],
    "distributed-erasure-propagation": [
        "aplicaciones en bigquery.silver tras el reintento: 1",
        "CDC tardío con la versión 2: rechazado (versión 2 ≤ corte de la orden 2)",
        "¿reaparece en bigquery.silver?: False", "otro titular intacto: {'a1b2c3d4e5f60718': 5}",
        "cierre de SOL-2026-0042: ['proveedor_email: PENDING']"],
    "purpose-based-authorization": [
        "grp-soporte · atencion_cliente · contacto_minimo: PERMITIR",
        "grp-soporte · campana_ofertas · contacto_minimo: DENEGAR: la finalidad «campana_ofertas» no es la aprobada",
        "grp-soporte · auditoria_reclamos · contacto_minimo: ESCALAR: finalidad en revisión",
        "sa-bi-operacional · estadistica_operacional · contacto_minimo: DENEGAR: sin concesión para ese producto",
        "grp-marketing · campana_ofertas · contacto_con_consentimiento: DENEGAR: concesión vencida",
        "pruebas negativas: 4/4 no se permiten"],
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


MARKERS = {"retention-and-erasure": "biblioteca estándar"}   # fichas con más de un bloque ```python


@pytest.mark.parametrize("ficha", sorted(STDLIB))
def test_compliance_examples_in_python(ficha: str, tmp_path: Path) -> None:
    out = run_python_block(ficha, tmp_path, UTF8, marker=MARKERS.get(ficha, ""))
    for line in STDLIB[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


@pytest.mark.parametrize("ficha", sorted(GATES))
def test_compliance_gates_fail_the_ci_with_gaps(ficha: str, tmp_path: Path) -> None:
    out = run_gate(ficha, tmp_path)
    for line in GATES[ficha]:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def run_scenario(tmp_path: Path, scenario: str) -> subprocess.CompletedProcess[str]:
    (code,) = blocks("chile-data-protection", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")
    return subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                          capture_output=True, text=True, encoding="utf-8", timeout=300)


SCENARIOS = {"con-brechas": 1, "corregido": 0, "sin-revision": 1, "evidencia-alterada": 1}


def load_controls(tmp_path: Path) -> Any:
    (code,) = blocks("chile-data-protection", "python")
    module = tmp_path / "controles.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("controles", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules["controles"] = m   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(m)
    return m


def test_privacy_controls_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """chile-data-protection §10: un bloque text por escenario, con su línea «$ python controles.py <escenario>»."""
    documented = {block.splitlines()[0].removeprefix("$ python controles.py "): block
                  for block in blocks("chile-data-protection", "text")}
    assert list(documented) == list(SCENARIOS)
    for scenario, exit_code in SCENARIOS.items():
        result = run_scenario(tmp_path, scenario)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
    assert_mypy_strict(tmp_path)


def test_privacy_controls_guided_code_rules(tmp_path: Path) -> None:
    """Piloto de código guiado: pasos 1–4, un docstring con su letra del art. 3 por control y sin ternarios encadenados."""
    (code,) = blocks("chile-data-protection", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Datos", "2 Controles", "3 Validación", "4 Resultado"]
    assert not [line for line in code.splitlines() if line.count(" if ") >= 2 and line.count(" else ") >= 2]
    m = load_controls(tmp_path)
    for control in m.CONTROLS:
        assert control.__doc__ and control.__doc__.startswith("Art. 3 "), control.__name__


def test_privacy_controls_replay_brings_back_the_expired_record_until_fixed(tmp_path: Path) -> None:
    m = load_controls(tmp_path)
    purged_only = m.replace(m.fix(m.with_gaps()), replay_applies_retention=False)   # purga el warehouse, no el replay
    status, detail = m.retention_check(purged_only)
    assert status == "FAIL" and detail == "vencidos sin purgar: []; en la salida del replay: [104]"
    assert m.retention_check(m.fix(m.with_gaps())) == ("PASS", "ok")


def test_privacy_controls_validation_rejects_duplicates_stale_and_tampered_evidence(tmp_path: Path) -> None:
    m = load_controls(tmp_path)
    results = m.run_controls(m.fix(m.with_gaps()))
    stored = {r.control_id: r.sha256() for r in results}
    stale = m.replace(results[0], executed_at=m.REFERENCE - m.timedelta(days=31))
    tampered = m.replace(results[1], evidence={"status": "PASS", "detail": "editado"})
    gaps = m.validate([*results, results[2], stale, tampered], stored)
    assert "retention_check: resultado duplicado" in gaps
    assert "access_review: evidencia vencida (31 días)" in gaps
    assert "erasure_replay_check: evidencia sin URI o con huella distinta" in gaps
    assert m.validate(results, stored) == []


def test_minimization_by_layer_in_postgres(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    out = run_python_block("data-minimization-by-layer", tmp_path, {**pg_env, **UTF8})
    for line in MINIMIZATION:
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_erasure_expires_iceberg_snapshots(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("retention-and-erasure", tmp_path, UTF8, marker="PyIceberg", args=(str(tmp_path / "work"),))
    for line in ("lectura actual tras el DELETE: False", "time travel al snapshot anterior: True",
                 "snapshots vigentes tras expirar: 1", "¿algún snapshot vigente lo devuelve?: False"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_erasure_by_crypto_shredding(tmp_path: Path) -> None:
    pytest.importorskip("cryptography", reason="falta cryptography (make snippets-deps)")
    llaves = tmp_path / "llaves.json"   # las llaves por titular las genera el test; el snippet no trae ninguna
    llaves.write_text(json.dumps({t: secrets.token_bytes(32).hex() for t in ("a1b2c3", "d4e5f6")}), encoding="utf-8")
    out = run_python_block("retention-and-erasure", tmp_path, UTF8, marker="cryptography", args=(str(llaves),))
    for line in ("titulares con llave: ['d4e5f6']", "a1b2c3 en el respaldo: no se puede descifrar: la llave no existe",
                 "a1b2c3 con la llave de otro titular: no se puede descifrar: llave incorrecta",
                 "d4e5f6 en el respaldo: reserva SCL-PMC"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


PII_SCENARIOS = {"muestra": 1, "revisado": 0, "fuente-nueva": 1}


def run_detector(tmp_path: Path, scenario: str) -> subprocess.CompletedProcess[str]:
    (code,) = blocks("pii-identification", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    return subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                          capture_output=True, text=True, encoding="utf-8", timeout=300)


def test_pii_detector_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """pii-identification §10: un bloque text por escenario, con su línea «$ python detector.py <escenario>»."""
    documented = {block.splitlines()[0].removeprefix("$ python detector.py "): block
                  for block in blocks("pii-identification", "text")}
    assert list(documented) == list(PII_SCENARIOS)
    for scenario, exit_code in PII_SCENARIOS.items():
        result = run_detector(tmp_path, scenario)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
        assert "@example.test" not in result.stdout and "111" not in result.stdout   # el reporte no imprime valores
    assert_mypy_strict(tmp_path)


def test_pii_detector_rules(tmp_path: Path) -> None:
    (code,) = blocks("pii-identification", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Reglas", "2 Detección", "3 Catálogo", "4 Puerta y reporte"]
    module = tmp_path / "detector.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("detector", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules["detector"] = m   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(m)
    rut = m.ficticio(11_111_111)
    assert [m.clasificar_rut(v) for v in (rut, m.con_dv_alterado(rut), "2026-01-10")] == ["valido", "dv_invalido", "no_rut"]
    assert m.sensibles_por_nombre("fecha_ingreso") == [] and m.sensibles_por_nombre("herramienta_renta_id")
    assert [h.fundamento for h in m.sensibles_por_nombre("tramo_ingreso")] == ["art. 2 g), situación socioeconómica"]
    assert m.sensibles_por_nombre("herramienta_id") == []   # «renta» como substring no cuenta
    (indirecta,) = m.identificacion_indirecta(m.MUESTRA)
    assert (indirecta.categoria, indirecta.metodo) == ("revisión", "combinación única en 2 de 4 filas")


INVENTORY_SCENARIOS = {"actual": 1, "corregido": 0, "despliegue-nuevo": 1}


def run_inventory(tmp_path: Path, scenario: str) -> subprocess.CompletedProcess[str]:
    (code,) = blocks("processing-activities-inventory", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    return subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                          capture_output=True, text=True, encoding="utf-8", timeout=300)


def test_inventory_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """processing-activities-inventory §10: un bloque text por escenario, con su línea «$ python inventario.py …»."""
    documented = {block.splitlines()[0].removeprefix("$ python inventario.py "): block
                  for block in blocks("processing-activities-inventory", "text")}
    assert list(documented) == list(INVENTORY_SCENARIOS)
    for scenario, exit_code in INVENTORY_SCENARIOS.items():
        result = run_inventory(tmp_path, scenario)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
    assert_mypy_strict(tmp_path)


def test_inventory_rules(tmp_path: Path) -> None:
    (code,) = blocks("processing-activities-inventory", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Registro", "2 Usos observados", "3 Conciliación", "4 Insumo y salida"]
    module = tmp_path / "inventario.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("inventario", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules["inventario"] = m   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(m)
    assert set(m.ARTICULO) == set(m.Base.__args__)   # cada base tiene su artículo en el mapa aparte
    registro, usos, _ = m.escenario("actual")
    for f in (m.tablas_sin_actividad, m.actividades_incompletas, m.conciliar, m.verificar_despliegues, m.insumo_14_ter):
        assert next(iter(inspect.signature(f).parameters)) == "registro", f.__name__   # sin globales: recibe el registro
    unknown = [h for h in m.conciliar(registro, usos, m.REFERENCIA) if h.estado == "UNKNOWN"]
    assert [h.detalle for h in unknown] == ["consumidor no identificado: sa-7f3c → silver.reservas"]
    assert "BRECHA proporcionalidad: dag_campanas lee rut, no necesario para marketing" in run_inventory(
        tmp_path, "actual").stdout

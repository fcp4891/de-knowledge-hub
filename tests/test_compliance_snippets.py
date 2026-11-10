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
import re
import secrets
import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest
import yaml

from tests.test_docker_snippets import blocks
from tests.test_open_stack_snippets import pg_env, require_iceberg, run_python_block  # noqa: F401 - fixture

UTF8 = {"PYTHONIOENCODING": "utf-8"}   # los ejemplos imprimen tildes; en Windows la salida sería cp1252
CONTENT = Path(__file__).resolve().parent.parent / "content"


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


SCENARIOS = {"con-brechas": 1, "corregido": 0, "sin-revision": 1, "evidencia-alterada": 1, "control-faltante": 1,
             "evidencia-vencida": 1}


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
    """Código guiado: pasos 1–4, un docstring por control que nombra su principio o derecho sin letra, sin ternarios
    encadenados, sin assert ni globals mutables (set/list) y la lista de escenarios igual a la documentada."""
    (code,) = blocks("chile-data-protection", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Datos", "2 Controles", "3 Validación", "4 Resultado"]
    assert not [line for line in code.splitlines() if line.count(" if ") >= 2 and line.count(" else ") >= 2]
    m = load_controls(tmp_path)
    assert not [line for line in code.splitlines() if re.match(r"\s*assert ", line)]
    assert not [line for line in code.splitlines() if re.match(r"[A-Z_]+ = (\[|\{|set\()", line)]
    docs = {control.__name__: control.__doc__ or "" for control in m.CONTROLS}
    assert docs["access_review"].startswith("Principio de seguridad (art. 3)")
    assert docs["erasure_replay_check"].startswith("Derecho de supresión (art. 7)")
    assert all(doc.startswith(("Principio de ", "Derecho de ")) for doc in docs.values()), docs
    assert not [name for name, doc in docs.items() if "«" in doc]   # sin citas textuales que no se pudieron verificar
    assert [c.__name__ for c in m.CONTROLS] == ["purpose_check", "schema_minimization", "retention_check", "access_review",
                                                "erasure_replay_check"]


def test_privacy_controls_code_guide_matches_the_ci() -> None:
    """ADR-030: la guía bajo el código (views.code_guide) nombra los mismos escenarios y salidas que la CI, y sus reglas son
    las funciones de CONTROLS."""
    text = (CONTENT / "concepts" / "chile-data-protection.md").read_text(encoding="utf-8")
    guide = yaml.safe_load(text.split("---\n", 2)[1])["views"]["code_guide"]
    assert {item["name"]: item["exit_code"] for item in guide["scenarios"]["items"]} == SCENARIOS
    assert [item["name"] for item in guide["scenarios"]["items"]] == list(SCENARIOS)
    (code,) = blocks("chile-data-protection", "python")
    assert all(f"def {item['fn']}(" in code for item in guide["rules"]["items"])


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
    purpose, schema, retention, access, erasure = results
    stale = m.replace(access, executed_at=m.REFERENCE - m.timedelta(days=31))
    tampered = m.replace(erasure, evidence={"status": "PASS", "detail": "editado"})
    no_uri = m.replace(schema, evidence_uri="")
    gaps = m.validate([purpose, no_uri, retention, retention, stale, tampered], stored)
    assert "retention_check: resultado duplicado (2)" in gaps
    assert "access_review: evidencia vencida (31 días)" in gaps
    assert "erasure_replay_check: huella distinta a la guardada" in gaps
    assert "schema_minimization: evidencia sin URI" in gaps
    assert "schema_minimization: huella distinta a la guardada" not in gaps
    assert m.validate([purpose, retention, access, erasure], stored) == ["schema_minimization: falta el resultado"]
    assert m.validate(results, stored) == []


MINIMIZATION_SCENARIOS = {"correcto": 0, "deriva-esquema": 1, "select-star": 1, "sin-purga": 1, "sin-clasificar": 1}


def test_minimization_each_scenario_prints_its_documented_output(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    """data-minimization-by-layer §10, contra PostgreSQL: un bloque text por escenario, con su línea «$ python …»."""
    documented = {block.splitlines()[0].removeprefix("$ python minimizacion.py "): block
                  for block in blocks("data-minimization-by-layer", "text")}
    assert list(documented) == list(MINIMIZATION_SCENARIOS)
    (code,) = blocks("data-minimization-by-layer", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    for scenario, exit_code in MINIMIZATION_SCENARIOS.items():
        result = subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path,
                                env={**os.environ, **pg_env, **UTF8}, capture_output=True, text=True, encoding="utf-8",
                                timeout=300)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
    assert_mypy_strict(tmp_path)


def test_minimization_guided_code_rules() -> None:
    (code,) = blocks("data-minimization-by-layer", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Capas", "2 Transformación", "3 Controles", "4 Puerta y reporte"]
    assert not [line for line in code.splitlines() if re.match(r"\s+def ", line)]   # sin funciones anidadas
    assert not [line for line in code.splitlines() if re.match(r"\s*assert ", line)]
    assert "PERSONALES" in code and "ingested_at" in code   # catálogo como base del control y dimensión de tiempo
    assert "CLASIFICADAS" in code and "UNKNOWN" in code   # sin clasificar no aprueba, como en las otras fichas


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
    # Los ejemplos del §15 son reales: cada término es substring de su columna y la regla por tokens no lo toma.
    ficha = (Path(__file__).parents[1] / "content/concepts/pii-identification.md").read_text(encoding="utf-8")
    (linea,) = [x for x in ficha.splitlines() if x.startswith("- Comparar nombres por substring")]
    ejemplos = re.findall(r"«(\w+)»(?: calza)? en `(\w+)`", linea)
    assert len(ejemplos) == 2
    for termino, columna in ejemplos:
        assert termino in columna and m.sensibles_por_nombre(columna) == [], columna
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
    # Declarado en una actividad sin aprobación vigente: el motivo es «actividad no vigente», no «no declarado».
    motivos = [h.detalle for h in m.verificar_despliegues(
        registro, [m.Despliegue("job_fraude", "modelo_fraude"), m.Despliegue("dag_x", "modelo_fraude")], m.REFERENCIA)]
    assert motivos == ["despliegue bloqueado: job_fraude → modelo_fraude: actividad no vigente",
                       "despliegue bloqueado: dag_x no declarado en modelo_fraude"]
    assert m.puerta_ci(registro, [m.Despliegue("dag_reservas", "venta_pasajes")]) == 0


PSEUDONYM_SCENARIOS = {"publicar-exacto": 1, "publicar-generalizado": 0, "sin-normalizar": 1}


def test_pseudonymization_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """chilean-identifier-pseudonymization §10: un bloque text por escenario, con su línea «$ python …»."""
    documented = {block.splitlines()[0].removeprefix("$ python seudonimizacion.py "): block
                  for block in blocks("chilean-identifier-pseudonymization", "text")}
    assert list(documented) == list(PSEUDONYM_SCENARIOS)
    (code,) = blocks("chilean-identifier-pseudonymization", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    for scenario, exit_code in PSEUDONYM_SCENARIOS.items():
        result = subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                                capture_output=True, text=True, encoding="utf-8", timeout=300)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
    assert_mypy_strict(tmp_path)


def test_pseudonymization_rules(tmp_path: Path) -> None:
    (code,) = blocks("chilean-identifier-pseudonymization", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Normalizar y validar", "2 Seudónimo por dominio", "3 Ataque al hash simple",
                     "4 Anonimizar y puerta"]
    module = tmp_path / "seudonimizacion.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("seudonimizacion", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    tabla = m.rotar("reservas", ["11111111-1"], "k1", "k2")
    assert tabla[0][0].startswith("k1:") and tabla[0][1].startswith("k2:") and tabla[0][0][3:] != tabla[0][1][3:]
    datos = [("RM", "1980s", "F")] * m.K_MIN
    assert m.puerta_publicacion(datos, m.CUASI_CATALOGO) == []
    assert m.puerta_publicacion(datos, ("comuna", "sexo")) == ["cuasi-identificador no declarado: nacimiento"]
    validos, cuarentena = m.separar([("r1", "11.111.111-1"), ("r2", "11111111-0"), ("r3", "abc")])
    assert validos == [("r1", "11111111-1")]
    assert cuarentena == [("r2", "DV inválido"), ("r3", "formato no válido")]   # id y motivo, nunca el valor
    rut = "11111111-1"
    reservas = {m.seudonimo("reservas", "k1", rut): 1}
    assert m.unir(reservas, {m.seudonimo("marketing", "k1", rut): "a"}) == 0
    assert m.unir(reservas, {m.seudonimo("reservas", "k1", rut): "a"}) == 1
    filas, suprimidos = m.suprimir_atipicos([("RM", "1980s", "F")] * m.K_MIN + [("Tarapacá", "1950s", "M")])
    assert suprimidos == 1 and ("Tarapacá", "1950s", "M") not in filas


PURPOSE_SCENARIOS = {"solicitudes": 0, "fuga": 1, "revision": 1}


def test_purpose_authorization_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """purpose-based-authorization §10: un bloque text por escenario, con su línea «$ python finalidad.py …»."""
    documented = {block.splitlines()[0].removeprefix("$ python finalidad.py "): block
                  for block in blocks("purpose-based-authorization", "text")}
    assert list(documented) == list(PURPOSE_SCENARIOS)
    (code,) = blocks("purpose-based-authorization", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    for scenario, exit_code in PURPOSE_SCENARIOS.items():
        result = subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                                capture_output=True, text=True, encoding="utf-8", timeout=300)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
    assert_mypy_strict(tmp_path)


def test_purpose_authorization_rules(tmp_path: Path) -> None:
    (code,) = blocks("purpose-based-authorization", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Registro de concesiones", "2 Decisión", "3 Pruebas negativas", "4 Revisión y salida"]
    assert not [line for line in code.splitlines() if re.match(r"\s+def ", line)]   # sin funciones anidadas
    module = tmp_path / "finalidad.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("finalidad", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules["finalidad"] = m   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(m)
    assert m.Decision.__args__ == ("PERMITIR", "DENEGAR", "ESCALAR")
    for f in (m.vigentes, m.del_producto, m.decidir, m.probar, m.cuentas_compartidas, m.sin_confirmar):
        assert next(iter(inspect.signature(f).parameters)) == "registro", f.__name__   # sin globales: recibe el registro
    base = m.registro_base()
    assert "grp-marketing" not in {c.identidad for c in m.vigentes(base, m.REFERENCIA)}   # vencida: no es vigente
    pide_rut = m.pide("grp-soporte", "atencion_cliente", "contacto_minimo", "rut")
    assert m.decidir(base, pide_rut, m.REFERENCIA) == ("DENEGAR", "pide rut, fuera de contacto_minimo")
    # Lo esperado se declara a mano: casos() no recibe el registro, así que una fuga cambia la decisión, no el caso.
    assert not inspect.signature(m.casos).parameters
    fuga = m.probar(m.escenario("fuga"), m.casos(), m.REFERENCIA)
    assert [(caso.solicitud.columnas, decision) for caso, decision, _ in fuga if decision != caso.esperada] == [
        (frozenset({"nombre", "rut"}), "PERMITIR")]
    assert m.cuentas_compartidas(m.escenario("revision"), m.REFERENCIA) == [
        "cuenta compartida: sa-compartida usa campana_ofertas y atencion_cliente"]
    assert m.sin_confirmar(base, m.REFERENCIA) == [] and len(m.sin_confirmar(m.escenario("revision"), m.REFERENCIA)) == 1


RIGHTS_SCENARIOS = {"acceso": 0, "rectificacion": 1, "bloqueo": 0, "reintento": 0}


def test_rights_pipeline_each_scenario_prints_its_documented_output(tmp_path: Path) -> None:
    """data-subject-rights-pipeline §10: un bloque text por escenario, con su línea «$ python derechos.py …»."""
    documented = {block.splitlines()[0].removeprefix("$ python derechos.py "): block
                  for block in blocks("data-subject-rights-pipeline", "text")}
    assert list(documented) == list(RIGHTS_SCENARIOS)
    (code,) = blocks("data-subject-rights-pipeline", "python")
    (tmp_path / "snippet.py").write_text(code, encoding="utf-8", newline="\n")   # assert_mypy_strict revisa snippet.py
    for scenario, exit_code in RIGHTS_SCENARIOS.items():
        result = subprocess.run([sys.executable, "snippet.py", scenario], cwd=tmp_path, env={**os.environ, **UTF8},
                                capture_output=True, text=True, encoding="utf-8", timeout=300)
        expected = documented[scenario].split("\n", 1)[1].strip()
        assert result.returncode == exit_code and result.stdout.strip() == expected, result.stdout + result.stderr
        assert "@" not in result.stdout   # la salida no imprime correos
    assert_mypy_strict(tmp_path)


def test_rights_pipeline_rules(tmp_path: Path) -> None:
    (code,) = blocks("data-subject-rights-pipeline", "python")
    steps = [line.split("@paso", 1)[1].strip() for line in code.splitlines() if line.startswith("# @paso")]
    assert steps == ["1 Ingreso y plazos", "2 Localizar", "3 Ejecutar por derecho", "4 Verificar y cerrar"]
    assert not [line for line in code.splitlines() if re.match(r"\s*assert ", line)]
    module = tmp_path / "derechos.py"
    module.write_text(code, encoding="utf-8", newline="\n")
    spec = importlib.util.spec_from_file_location("derechos", module)
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules["derechos"] = m   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(m)
    cfg, cat, idx = m.configuracion(), m.catalogo(), m.indice()
    # Plazos desde la configuración: el feriado del martes corre un día el bloqueo temporal, que solo existe si se pide.
    lunes = m.Solicitud("x", "t", "rectificación", m.date(2026, 12, 7), bloqueo_temporal=True)
    assert str(m.plazos(cfg, lunes)["bloqueo temporal"]) == "2026-12-10"
    assert str(m.plazos(m.replace(cfg, feriados=frozenset()), lunes)["bloqueo temporal"]) == "2026-12-09"
    assert "bloqueo temporal" not in m.plazos(cfg, m.replace(lunes, bloqueo_temporal=False))
    a, b = "c3d3a94d7560c6ae", "7e1f04b2a9d35c18"
    assert m.portabilidad(cat, idx, a) == [] and m.portabilidad(cat, idx, b) == ["silver.preferencias"]
    # Acceso completo exige la lógica de la decisión automatizada (art. 5) y los datos con su origen (art. 5 a)).
    assert m.faltantes_art5(cat, idx, a) == []
    sin_logica = {**cat, "riesgo_fraude": m.replace(cat["riesgo_fraude"], logica=None)}
    assert m.faltantes_art5(sin_logica, idx, a) == ["gold.score_fraude: riesgo_fraude"]
    sin_datos = {**cat, "venta_pasajes": m.replace(cat["venta_pasajes"], datos="")}
    assert m.faltantes_art5(sin_datos, idx, a) == ["crm: venta_pasajes", "silver.clientes: venta_pasajes"]
    # La sonda lee el destino: si alguien revierte el valor, deja de estar verificado aunque el job diga «aplicada».
    p = m.plataforma()
    s = m.Solicitud("SOL-T", a, "rectificación", lunes.ingreso, ("crm",))
    assert m.ejecutar(p, s, "crm", "rectificar", "nuevo@example.com") == "aplicada"
    assert m.sonda_valor(p, "crm", a, "nuevo@example.com") == "verificado"
    p.datos["crm"][a] = "antiguo@example.com"
    assert m.sonda_valor(p, "crm", a, "nuevo@example.com") == "pendiente"
    # Idempotencia: la misma acción no se aplica dos veces.
    assert m.ejecutar(p, s, "crm", "rectificar", "nuevo@example.com") == "ya aplicada, no se repite"
    assert p.aplicadas == {("SOL-T", "crm", "rectificar"): 1}
    # Bloqueo: fuera del consumo, sigue almacenado. Oposición: solo la actividad objetada.
    p.bloqueados.add(a)
    p.oposiciones.add((b, "marketing_directo"))
    assert a not in m.consumo(p, "venta_pasajes") and a in p.datos["silver.clientes"]
    assert b in m.consumo(p, "venta_pasajes") and b not in m.consumo(p, "marketing_directo")

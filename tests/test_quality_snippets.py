"""Ejemplos de 15-data-quality ejecutados en la CI.

- data-quality-dimensions: las seis dimensiones de DAMA UK sobre un lote, solo biblioteca estándar.
- schema-validation: jsonschema (ya en requirements.txt) con JSON Schema 2020-12; sin mypy, porque jsonschema no trae tipos.
- custom-data-validators: validadores de Pydantic y reglas de lote con umbral y severidad.
- quality-gate: Source -> Validation -> Transformation -> Quality Gate -> Publish con os.replace.
- dbt-tests: dbt Core contra una base temporal en el PostgreSQL de la CI (ADR-018).
- great-expectations-validation: GX Core 1.24.0 con un Data Context efímero (ADR-019); sin mypy, GX no declara sus exportaciones.
- write-audit-publish: Write y Audit con ramas de PyIceberg 0.12.0 (ADR-018); se salta en Windows.
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


def test_dimensions_measures_each_rule_against_its_reference(tmp_path: Path) -> None:
    out = run_python_block("data-quality-dimensions", tmp_path)
    for line in ("completitud: 4/5 = 80%", "unicidad: 4/5 = 80%", "validez: 3/5 = 60%",
                 "consistencia: 3/4 = 75%", "exactitud: 2/4 = 50%", "oportunidad: 4/5 = 80%"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_schema_validation_reports_every_error_and_format_only_when_enabled(tmp_path: Path) -> None:
    out = run_python_block("schema-validation", tmp_path, UTF8)
    for line in ("P1: ok", "P2: $.moneda enum; $.monto minimum", "P3: $ additionalProperties",
                 "P4: $ required; $.fecha format", "2026-02-30 sin format_checker: válido=True",
                 "2026-02-30 con format_checker: válido=False"):
        assert line in out, out


def test_custom_validators_reject_rows_and_grade_batch_rules(tmp_path: Path) -> None:
    out = run_python_block("custom-data-validators", tmp_path, UTF8)
    for line in ("rechazado E2: Value error, región desconocida: oeste",
                 "rechazado E3: Value error, la entrega es anterior al pedido",
                 "ids únicos: 0.25 (umbral 0.00) -> ERROR", "entregas de más de 7 días: 0.75 (umbral 0.25) -> WARN"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_quality_gate_blocks_bad_batch_and_keeps_published_version(tmp_path: Path) -> None:
    work = tmp_path / "work"
    out = run_python_block("quality-gate", tmp_path, args=(str(work),))
    assert "lote-1: publicado {'norte': 45, 'sur': 10}" in out, out
    assert "lote-2: BLOQUEADO (rechazos 2/3); se mantiene lo publicado" in out, out
    assert 'lo publicado: {"norte": 45, "sur": 10}' in out, out
    assert (work / "cuarentena" / "lote-2.json").exists()
    assert not (work / "cuarentena" / "lote-1.json").exists()
    assert_mypy_strict(tmp_path)


def test_dbt_tests_warn_fail_skip_and_store_failures(pg_env: dict[str, str], tmp_path: Path) -> None:  # noqa: F811
    pytest.importorskip("dbt.cli.main", reason="falta dbt-core (make snippets-deps)")
    out = run_python_block("dbt-tests", tmp_path, {**pg_env, **UTF8}, args=(str(tmp_path / "proyecto"),))
    for line in ("build ok: False", "relationships_stg_envios_tienda_id__id__ref_raw_tiendas_: fail (1 fallas)",
                 "envios_por_tienda: skipped", "accepted_values_stg_envios_estado__entregado__en_camino: warn (1 fallas)",
                 "envios_lentos: warn (1 fallas)", "unique_stg_envios_id: pass (0 fallas)", "stg_envios: success",
                 "tablas de fallas: 5", "filas huérfanas guardadas: [(3,)]"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_great_expectations_decides_with_the_most_severe_failure(tmp_path: Path) -> None:
    pytest.importorskip("great_expectations", reason="falta great_expectations (make snippets-deps)")
    out = run_python_block("great-expectations-validation", tmp_path, UTF8)
    for line in ("lote-1: success=False", "expect_column_values_to_be_between [warning]: True (inesperados: 1)",
                 "expect_column_values_to_be_in_set [warning]: False (inesperados: 1)",
                 "falla más grave: warning -> publicar", "lote-2: success=False",
                 "expect_column_values_to_be_unique [critical]: False (inesperados: 2)",
                 "falla más grave: critical -> bloquear"):
        assert line in out, out


def test_write_audit_on_iceberg_branch_never_touches_main(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("write-audit-publish", tmp_path, args=(str(tmp_path / "work"),))
    for line in ("audit-1: auditoría pasa; filas en la rama: 3; filas en main: 2",
                 "audit-2: auditoría falla; filas en la rama: 3; filas en main: 2",
                 "ramas: ['audit-1', 'main']", "montos en main: [10.0, 25.0]"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

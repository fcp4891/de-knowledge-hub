"""Ejemplos de 15-data-quality ejecutados en la CI.

- data-quality-dimensions: las seis dimensiones de DAMA UK sobre un lote, solo biblioteca estándar.
- schema-validation: jsonschema (ya en requirements.txt) con JSON Schema 2020-12; sin mypy, porque jsonschema no trae tipos.
- custom-data-validators: validadores de Pydantic y reglas de lote con umbral y severidad.
- quality-gate: Source -> Validation -> Transformation -> Quality Gate -> Publish con os.replace.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from tests.test_open_stack_snippets import run_python_block

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

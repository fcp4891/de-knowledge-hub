"""Code Library: ejecuta snippets de Python completos tal como están en content/.

- python-structured-logging: solo biblioteca estándar; se ejecuta siempre.
- pytest-ingestion-test: arma ingest.py desde la sección 10 de data-validation-with-pydantic y de
  batch-ingestion, escribe el test del snippet y lo corre con pytest en un directorio temporal.
  Necesita requirements-snippets.txt (`make snippets-deps`; la CI lo instala); si falta, se salta.
- pyspark-dataframes: ejecuta la sección 10 de la ficha en modo local. Necesita pyspark y Java 17+;
  sin ellos se salta, salvo con REQUIRE_PYSPARK=1 (la CI), donde falla.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PYTHON_FENCE = re.compile(r"^```python\n(.*?)^```", re.S | re.M)


def section_code(path: Path, heading: str) -> str:
    """Primer bloque ```python a partir del encabezado dado."""
    text = path.read_text(encoding="utf-8")
    match = PYTHON_FENCE.search(text, text.index(heading))
    assert match, f"{path.name}: sin bloque python después de {heading!r}"
    return match.group(1)


def before(code: str, marker: str) -> str:
    """Código hasta el marcador (deja fuera el ejemplo de uso al final del bloque)."""
    return code[: code.index(marker)].rstrip() + "\n"


def run_python(args: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run([sys.executable, *args], cwd=cwd, capture_output=True, text=True, encoding="utf-8", timeout=300)


def test_structured_logging_snippet_writes_json_with_run_id_and_redaction(tmp_path: Path) -> None:
    code = section_code(CONTENT / "snippets" / "python-structured-logging.md", "## 2. Código")
    (tmp_path / "logging_setup.py").write_text(code, encoding="utf-8")
    result = run_python(["logging_setup.py"], tmp_path)
    assert result.returncode == 0, result.stderr
    events = [json.loads(line) for line in result.stdout.splitlines()]
    assert [e["message"] for e in events] == ["lote recibido", "reintento"]
    assert {e["run_id"] for e in events} == {"2026-10-04T02:00:00Z"}
    assert events[1]["token"] == "[REDACTED]"


def test_pytest_ingestion_snippet_passes_against_the_fichas_code(tmp_path: Path) -> None:
    pytest.importorskip("google.cloud.bigquery", reason="falta requirements-snippets.txt (make snippets-deps)")
    validation = section_code(CONTENT / "concepts" / "data-validation-with-pydantic.md", "## 10. Código")
    loading = section_code(CONTENT / "concepts" / "batch-ingestion.md", "## 10. Código")
    ingest = before(validation, "\nok, bad = validate_page(") + "\n\n" + before(loading, '\nif __name__ == "__main__":')
    (tmp_path / "ingest.py").write_text(ingest, encoding="utf-8")
    tests = tmp_path / "tests"
    tests.mkdir()
    test_code = section_code(CONTENT / "snippets" / "pytest-ingestion-test.md", "## 2. Código")
    (tests / "test_ingest.py").write_text(test_code, encoding="utf-8")
    result = run_python(["-m", "pytest", "-q", "-p", "no:cacheprovider", "--rootdir", str(tmp_path), "tests"], tmp_path)
    assert result.returncode == 0, result.stdout + result.stderr
    assert "7 passed" in result.stdout  # el snippet promete 7 tests (el parametrizado cuenta 4)


def test_pyspark_dataframes_code_runs_in_local_mode(tmp_path: Path) -> None:
    required = os.environ.get("REQUIRE_PYSPARK") == "1"
    java = os.environ.get("JAVA_HOME") or shutil.which("java")
    try:
        import pyspark  # noqa: F401
    except ImportError:
        if required:
            raise
        pytest.skip("falta pyspark (make snippets-deps)")
    if not java:
        if required:
            pytest.fail("REQUIRE_PYSPARK=1 pero no hay Java (JAVA_HOME o java en el PATH)")
        pytest.skip("falta Java 17+ para PySpark")
    code = section_code(CONTENT / "concepts" / "pyspark-dataframes.md", "## 10. Código")
    (tmp_path / "pyspark_df.py").write_text(code, encoding="utf-8")
    result = run_python(["pyspark_df.py"], tmp_path)
    assert result.returncode == 0, result.stdout[-3000:] + result.stderr[-3000:]
    assert "'region': 'norte', 'total': 120" in result.stdout
    assert "BroadcastHashJoin" in result.stdout

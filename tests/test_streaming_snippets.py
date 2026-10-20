"""Ejemplos de 14-streaming (tiempo, estado y motores) ejecutados con PySpark 4.2.0 en modo local.

El bloque ```python de la sección 10 de cada ficha es un script que recibe un directorio de trabajo, arma su entrada
como archivos y corre una consulta de Structured Streaming con trigger(availableNow=True). Sin pyspark o Java los tests
se saltan, salvo con REQUIRE_PYSPARK=1 (la CI). El código de Flink de las fichas es «no ejecutado» y no se corre aquí.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

from tests.test_docker_snippets import blocks
from tests.test_snippet_code import require_pyspark


def run_spark_snippet(ficha: str, tmp_path: Path, index: int = 0) -> str:
    require_pyspark()
    code = [b for b in blocks(ficha, "python") if "PySpark" in b.splitlines()[0]][index]
    script = tmp_path / "snippet.py"
    script.write_text(code, encoding="utf-8", newline="\n")
    result = subprocess.run([sys.executable, script.name, str(tmp_path / "work")], cwd=tmp_path, capture_output=True,
                            text=True, encoding="utf-8", timeout=900)
    assert result.returncode == 0, result.stdout[-3000:] + result.stderr[-3000:]
    return result.stdout


def test_event_time_and_arrival_time_put_the_late_sale_on_different_days(tmp_path: Path) -> None:
    out = run_spark_snippet("event-time-vs-processing-time", tmp_path)
    assert "por event_time: 2026-10-18 2, 2026-10-19 1" in out
    assert "por arrival_time: 2026-10-18 1, 2026-10-19 2" in out


def test_tumbling_windows_hold_each_event_once_and_sliding_windows_twice(tmp_path: Path) -> None:
    out = run_spark_snippet("windowing", tmp_path)
    assert "tumbling: [10:00, 10:10) 3, [10:10, 10:20) 2" in out
    assert "sliding: [09:55, 10:05) 2, [10:00, 10:10) 3, [10:05, 10:15) 2, [10:10, 10:20) 2, [10:15, 10:25) 1" in out


def test_watermark_keeps_late_event_within_threshold_and_drops_older_one(tmp_path: Path) -> None:
    out = run_spark_snippet("watermarks", tmp_path)
    assert re.search(r"^batch \d+: ventana 10:00 cerrada con 3 eventos$", out, re.M), out   # 10:07 entra; 10:03 no
    assert re.search(r"^batch \d+: ventana 10:10 cerrada con 1 eventos$", out, re.M), out
    assert "ventana 10:20" not in out   # la watermark (10:21) todavía no pasó el fin de esa ventana


def test_state_survives_a_restart_with_the_same_checkpoint(tmp_path: Path) -> None:
    out = run_spark_snippet("stateful-stream-processing", tmp_path)
    assert "tras 1.json: norte 100, sur 40" in out
    assert "tras 2.json: norte 125, sur 50" in out


def test_exactly_once_depends_on_the_sink_after_a_failure(tmp_path: Path) -> None:
    out = run_spark_snippet("exactly-once-semantics", tmp_path)
    assert "sink que agrega, tras una caída y un reinicio: 6 filas para 3 pagos" in out
    assert "sink idempotente por batch_id, tras una caída y un reinicio: 3 filas para 3 pagos" in out


def test_max_files_per_trigger_spreads_the_backlog_over_micro_batches(tmp_path: Path) -> None:
    out = run_spark_snippet("backpressure", tmp_path)
    assert "sin límite: micro-batches de [600] filas" in out
    assert "maxFilesPerTrigger=2: micro-batches de [200, 200, 200] filas" in out


def test_structured_streaming_query_writes_closed_windows_and_resumes(tmp_path: Path) -> None:
    out = run_spark_snippet("spark-structured-streaming", tmp_path)
    assert out.splitlines()[-3:] == ["09:00 norte: 50.0", "09:00 sur: 12.5", "10:00 norte: 5.0"], out

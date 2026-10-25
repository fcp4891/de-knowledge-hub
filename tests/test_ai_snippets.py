"""Ejemplos de 21-ai-for-data-engineering ejecutados en la CI, sin APIs pagadas (ADR-025).

- llm-fundamentals, context-windows y prompt-engineering: biblioteca estándar.
- tokens y tool-calling: boto3 con un Stubber y un cliente sin firma; botocore valida los requests contra el modelo
  del servicio y no sale a la red.
- embeddings, opción A: numpy, vectores deterministas por hashing.
- embeddings, opción B: fastembed con un modelo local fijado por revisión. Si la descarga falla, el test queda
  «no ejecutado» (skip) y no rompe el build; si el modelo carga, el resultado tiene que coincidir.
- structured-outputs: Pydantic.
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import run_python_block

MODEL_REPO = "Qdrant/paraphrase-multilingual-MiniLM-L12-v2-onnx-Q"
MODEL_REVISION = "faf4aa4225822f3bc6376869cb1164e8e3feedd0"
MODEL_CACHE = os.environ.get("DEKH_MODEL_CACHE", str(Path.home() / ".cache" / "dekh-models"))


def require(module: str) -> None:
    """boto3 y numpy llegan con make snippets-deps; en la CI faltar es un error, no un salto."""
    try:
        __import__(module)
    except ImportError:
        if os.environ.get("REQUIRE_AWS_SNIPPETS") == "1":
            raise
        pytest.skip(f"falta {module} (make snippets-deps)")


def test_llm_temperature_concentrates_or_spreads_the_next_token(tmp_path: Path) -> None:
    out = run_python_block("llm-fundamentals", tmp_path, UTF8)
    for line in ("temperatura 0.2: pedidos=0.92, ventas=0.08, clientes=0.00, zapatos=0.00",
                 "temperatura 2.0: pedidos=0.43, ventas=0.33, clientes=0.18, zapatos=0.06",
                 "greedy (temperatura 0), 5 corridas: {'pedidos'}",
                 "temperatura 2.0, 5 corridas: ['clientes', 'pedidos', 'zapatos', 'pedidos', 'pedidos']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_tokens_estimate_and_count_tokens_request_validated_offline(tmp_path: Path) -> None:
    require("boto3")
    out = run_python_block("tokens", tmp_path, UTF8)
    for line in ("estimado local: 41 tokens; CountTokens (respuesta fija): 47 tokens",
                 "ventana 300000 con 10000 de salida reservados: cabe", "ventana 60 con 30 de salida reservados: NO cabe",
                 "request mal formado: ParamValidationError"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_context_is_trimmed_by_complete_turns(tmp_path: Path) -> None:
    out = run_python_block("context-windows", tmp_path, UTF8)
    for line in ("ventana 400, salida 100: 12 de 12 mensajes, 190 tokens; el más antiguo: Pregunta 1:",
                 "ventana 150, salida 60: 4 de 12 mensajes, 74 tokens; el más antiguo: Pregunta 5:",
                 "ventana 30, salida 20: el mensaje de sistema y la salida reservada no caben en la ventana"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_embeddings_option_a_lexical_vectors_rank_shared_words(tmp_path: Path) -> None:
    require("numpy")
    out = run_python_block("embeddings", tmp_path, UTF8, marker="opción A")
    assert "dimensiones: 256; norma de cada vector: [1.0, 1.0, 1.0, 1.0]" in out, out
    ranking = [line.split("  ", 2)[-1] for line in out.splitlines() if line.startswith("  0.")]
    assert ranking == ["ventas mensuales por región", "ventas canceladas por error del job",
                       "ingresos por zona geográfica", "inventario de bodegas"], out
    assert_mypy_strict(tmp_path)


def test_embeddings_option_b_local_model_ranks_the_synonym_second(tmp_path: Path) -> None:
    require("numpy")
    try:
        from huggingface_hub import snapshot_download

        import fastembed  # noqa: F401
    except ImportError:
        if os.environ.get("REQUIRE_AWS_SNIPPETS") == "1":
            raise
        pytest.skip("falta fastembed (make snippets-deps)")
    try:
        snapshot_download(MODEL_REPO, revision=MODEL_REVISION, cache_dir=MODEL_CACHE)
    except Exception as exc:  # noqa: BLE001 - cualquier falla de descarga deja el ejemplo «no ejecutado» (ADR-025)
        pytest.skip(f"no ejecutado: no se pudo descargar {MODEL_REPO}@{MODEL_REVISION[:8]} ({exc.__class__.__name__})")
    out = run_python_block("embeddings", tmp_path, {**UTF8, "DEKH_MODEL_CACHE": MODEL_CACHE, "HF_HUB_OFFLINE": "1"},
                           marker="opción B")
    assert "dimensiones: 384" in out, out
    ranking = [line.split("  ", 2)[-1] for line in out.splitlines() if line.startswith("  0.")]
    assert ranking == ["ventas mensuales por región", "ingresos por zona geográfica",
                       "inventario de bodegas", "ventas canceladas por error del job"], out
    assert_mypy_strict(tmp_path)


def test_structured_output_rejects_then_accepts(tmp_path: Path) -> None:
    out = run_python_block("structured-outputs", tmp_path, UTF8)
    assert '"required": ["tabla", "severidad", "filas_afectadas"]' in out, out
    assert "intento 1: rechazado, campos inválidos ['filas_afectadas', 'severidad']" in out, out
    assert "intento aceptado: {'tabla': 'silver.pedidos', 'severidad': 'alta', 'filas_afectadas': 1200}" in out, out
    assert_mypy_strict(tmp_path)


def test_tool_use_round_trip_with_allow_list(tmp_path: Path) -> None:
    require("boto3")
    out = run_python_block("tool-calling", tmp_path, UTF8)
    for line in ("stopReason: tool_use",
                 "la aplicación ejecuta filas_por_dia {'tabla': 'silver.pedidos', 'dia': '2026-10-25'} -> {'json': {'filas': 0}}",
                 "stopReason: end_turn -> No: silver.pedidos tiene 0 filas el 2026-10-25.",
                 "pedido de una herramienta no declarada: error"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_prompt_template_versioned_with_stable_holdout(tmp_path: Path) -> None:
    out = run_python_block("prompt-engineering", tmp_path, UTF8)
    for line in ("plantilla v8fce0a2acc01; ejemplos: 5 de desarrollo, 3 de prueba (no van al prompt)",
                 "categorías sin ejemplo en el prompt: ninguna", "Mensaje: <<<unexpected field 'descuento' in record>>>",
                 "Mensaje: <<<permission denied for table gold.ventas>>>"):
        assert line in out, out
    assert "column 'canal' not found in source>>>" not in out.split("Clasifica", 1)[1], "un ejemplo de prueba entró al prompt"
    assert_mypy_strict(tmp_path)

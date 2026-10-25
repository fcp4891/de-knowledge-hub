"""Ejemplos de retrieval de 21-ai-for-data-engineering (lote F3b-21b) ejecutados en la CI (ADR-025).

- chunking: biblioteca estándar.
- rag (opción A) y reranking: numpy, vectores deterministas por hashing.
- rag (opción B): fastembed con el modelo local fijado por revisión; si la descarga falla, «no ejecutado» (skip).
- vector-databases, hybrid-rag y metadata-filtering: psycopg contra pgvector/pgvector:0.8.7-pg17 en Docker, fijada
  por digest y levantada por el test en un puerto libre; con REQUIRE_DOCKER=1 (la CI) no se salta.
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import time
import uuid
from collections.abc import Iterator
from pathlib import Path

import pytest

from tests.test_ai_snippets import MODEL_CACHE, MODEL_REPO, MODEL_REVISION, require
from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import run_python_block

PGVECTOR_IMAGE = "pgvector/pgvector:0.8.7-pg17@sha256:ac08538c6f8b9904c33c8224c5e5706dbe760aca29db1d096972b4052c22a75d"


def docker(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["docker", *args], capture_output=True, text=True, encoding="utf-8", timeout=600)


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


@pytest.fixture(scope="module")
def pgvector_dsn() -> Iterator[str]:
    """Un contenedor de pgvector para el módulo; se borra al terminar."""
    require("psycopg")
    if shutil.which("docker") is None or docker("info").returncode != 0:
        if os.environ.get("REQUIRE_DOCKER") == "1":
            pytest.fail("Docker no responde y REQUIRE_DOCKER=1")
        pytest.skip("Docker no disponible")
    import psycopg

    name, port = f"dekh-pgvector-{uuid.uuid4().hex[:8]}", free_port()
    started = docker("run", "-d", "--rm", "--name", name, "-e", "POSTGRES_PASSWORD=dekh", "-p", f"127.0.0.1:{port}:5432",
                     PGVECTOR_IMAGE)
    assert started.returncode == 0, started.stderr
    dsn = f"host=127.0.0.1 port={port} user=postgres password=dekh dbname=postgres connect_timeout=5"
    try:
        for _ in range(60):
            try:
                with psycopg.connect(dsn) as conn:
                    conn.execute("select 1")
                break
            except psycopg.OperationalError:
                time.sleep(1)
        else:
            pytest.fail("pgvector no respondió en 60 s")
        yield dsn
    finally:
        docker("rm", "-f", name)


def test_chunking_by_section_keeps_the_procedure_whole(tmp_path: Path) -> None:
    out = run_python_block("chunking", tmp_path, UTF8)
    assert "tamaño fijo (20 palabras, solape 5): 5 fragmentos" in out, out
    assert "por sección: 3 fragmentos" in out, out
    flags = [line.rsplit(": ", 1)[1] for line in out.splitlines() if line.startswith("el procedimiento queda entero")]
    assert flags == ["False", "True"], out
    assert_mypy_strict(tmp_path)


def test_rag_option_a_retrieves_cites_and_refuses_without_context(tmp_path: Path) -> None:
    require("numpy")
    out = run_python_block("rag", tmp_path, UTF8, marker="opción A")
    for line in ("recuperados: [('runbook-ventas#timeout', 0.62), ('runbook-ventas#dueno', 0.42)]",
                 "[1] Si ventas_diarias falla por timeout", "| citas válidas: True", "una respuesta que cita [3]: False",
                 "pregunta fuera del corpus: sin contexto: no se llama al modelo"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_rag_option_b_local_model_finds_the_paraphrased_runbook(tmp_path: Path) -> None:
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
    out = run_python_block("rag", tmp_path, {**UTF8, "DEKH_MODEL_CACHE": MODEL_CACHE, "HF_HUB_OFFLINE": "1"},
                           marker="opción B")
    assert "modelo local: top 2 = ['runbook-ventas#timeout', 'runbook-ventas#dueno']; recupera el runbook de timeout: True" in out, out
    assert "léxico (opción A): top 2 = ['runbook-ventas#dueno', 'catalogo#pedidos']; recupera el runbook de timeout: False" in out, out
    assert_mypy_strict(tmp_path)


def test_reranking_mmr_drops_near_duplicates(tmp_path: Path) -> None:
    require("numpy")
    out = run_python_block("reranking", tmp_path, UTF8)
    for line in ("top 3 por similitud: [2, 0, 1]", "top 3 con MMR (λ=0.7): [2, 3, 1]",
                 "¿el top por similitud incluye la escalada (3)? False | ¿y con MMR? True"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_vector_database_exact_and_hnsw_agree_on_small_table(pgvector_dsn: str, tmp_path: Path) -> None:
    out = run_python_block("vector-databases", tmp_path, {**UTF8, "PGVECTOR_DSN": pgvector_dsn})
    for line in ("exacta (sin índice): [('ventas mensuales por región', 0.141)", "usa el índice HNSW: True",
                 "mismo top 3 con HNSW: True"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_hybrid_rrf_fuses_full_text_and_vectors(pgvector_dsn: str, tmp_path: Path) -> None:
    out = run_python_block("hybrid-rag", tmp_path, {**UTF8, "PGVECTOR_DSN": pgvector_dsn})
    for line in ("doc 1: léxica 1, vectorial 1, RRF 0.0328", "doc 2: léxica None, vectorial 2, RRF 0.0161",
                 "doc 3: léxica 1, vectorial 1, RRF 0.0328", "doc 1: léxica None, vectorial 2, RRF 0.0161"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_metadata_filter_with_hnsw_needs_iterative_scan(pgvector_dsn: str, tmp_path: Path) -> None:
    out = run_python_block("metadata-filtering", tmp_path, {**UTF8, "PGVECTOR_DSN": pgvector_dsn})
    for line in ("exacta, sin índice: 10 de 10", "HNSW, ef_search 40, filtro del 10 %: menos de 10: True",
                 "HNSW con iterative_scan = strict_order: 10 de 10"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

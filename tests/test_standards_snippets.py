"""Ejemplos de estándares en evolución de 23-emerging-technologies (lote F3b-23b) ejecutados en la CI.

- interoperability-standards: PyIceberg contra apache/iceberg-rest-fixture:1.10.1 en Docker, fijada por digest
  (ADR-026). El contenedor corre con el uid y gid del runner y comparte una carpeta en la misma ruta, porque el
  catálogo escribe la metadata y el cliente los archivos de datos. El warehouse va con esquema file:// porque
  HadoopFileIO no resuelve una ruta sin esquema («Failed to get file system for path»). Solo en Linux (ADR-018); con REQUIRE_DOCKER=1 no se
  salta.
- open-table-format-evolution: PyIceberg con catálogo SQLite, en Linux (ADR-018).
- emerging-semantic-layers: PyYAML y jsonschema contra el esquema de Apache Ossie fijado por commit; si la descarga
  falla, «no ejecutado» (skip).
"""

from __future__ import annotations

import os
import shutil
import time
import urllib.error
import urllib.request
import uuid
from collections.abc import Iterator
from pathlib import Path

import pytest

from tests.test_observability_snippets import UTF8, assert_mypy_strict
from tests.test_open_stack_snippets import require_iceberg, run_python_block
from tests.test_retrieval_snippets import docker, free_port

ICEBERG_REST_IMAGE = ("apache/iceberg-rest-fixture:1.10.1"
                      "@sha256:f7d679d30ac9c640bdeb2c015dff533cd3c8f1c7d491ebcb5d436f9a42db1d6f")
OSSIE_COMMIT = "89e2e17f8249e68f30df7b29ac8852fa9dd24501"
OSSIE_SCHEMA = f"https://raw.githubusercontent.com/apache/ossie/{OSSIE_COMMIT}/core-spec/ossie-schema.json"


@pytest.fixture
def iceberg_rest_uri(tmp_path: Path) -> Iterator[str]:
    """Un catálogo REST de Iceberg con la carpeta del warehouse compartida en la misma ruta; se borra al terminar."""
    require_iceberg()
    if shutil.which("docker") is None or docker("info").returncode != 0:
        if os.environ.get("REQUIRE_DOCKER") == "1":
            pytest.fail("Docker no responde y REQUIRE_DOCKER=1")
        pytest.skip("Docker no disponible")
    warehouse = tmp_path / "warehouse"
    warehouse.mkdir()
    name, port = f"dekh-iceberg-rest-{uuid.uuid4().hex[:8]}", free_port()
    started = docker("run", "-d", "--rm", "--name", name, "--user", f"{os.getuid()}:{os.getgid()}",  # type: ignore[attr-defined]
                     "-p", f"127.0.0.1:{port}:8181", "-v", f"{warehouse}:{warehouse}",
                     "-e", f"CATALOG_WAREHOUSE=file://{warehouse}", "-e", "CATALOG_IO__IMPL=org.apache.iceberg.hadoop.HadoopFileIO",
                     ICEBERG_REST_IMAGE)
    assert started.returncode == 0, started.stderr
    uri = f"http://127.0.0.1:{port}"
    try:
        for _ in range(60):
            try:
                with urllib.request.urlopen(f"{uri}/v1/config", timeout=2) as response:
                    if response.status == 200:
                        break
            except (urllib.error.URLError, ConnectionError):
                time.sleep(1)
        else:
            pytest.fail("el catálogo REST no respondió en 60 s")
        yield uri
    finally:
        docker("rm", "-f", name)


def test_two_clients_share_a_table_through_the_rest_catalog(iceberg_rest_uri: str, tmp_path: Path) -> None:
    out = run_python_block("interoperability-standards", tmp_path, UTF8, args=(iceberg_rest_uri,))
    for line in ("el lector descubre: [('ventas', 'pedidos')]", "filas que lee el lector: 2",
                 "columnas que ve el lector: ['id', 'monto', 'canal']"):
        assert line in out, out
    assert_mypy_strict(tmp_path)


def test_format_version_v2_delete_and_v3_not_yet_written(tmp_path: Path) -> None:
    require_iceberg()
    out = run_python_block("open-table-format-evolution", tmp_path, UTF8, args=(str(tmp_path / "work"),))
    assert "v2: format-version 2 filas 2 operaciones ['append', 'overwrite']" in out, out
    assert "v3: no ejecutado (Writing V3 is not yet supported)" in out, out
    assert_mypy_strict(tmp_path)


def test_ossie_model_validates_against_the_pinned_schema(tmp_path: Path) -> None:
    schema = tmp_path / "ossie-schema.json"
    try:
        with urllib.request.urlopen(OSSIE_SCHEMA, timeout=30) as response:
            schema.write_bytes(response.read())
    except (urllib.error.URLError, TimeoutError) as exc:
        pytest.skip(f"no ejecutado: no se pudo descargar el esquema de Ossie ({exc})")
    out = run_python_block("emerging-semantic-layers", tmp_path, UTF8, args=(str(schema),))
    for line in ("modelo válido según el esquema de Ossie: 0.2.0.dev0", "modelo inválido: 'datasets' is a required property",
                 "resultado: [('norte', 160), ('sur', 40)]"):
        assert line in out, out
    assert_mypy_strict(tmp_path)

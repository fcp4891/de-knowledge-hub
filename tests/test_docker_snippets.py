"""Ejemplos de 13-containers ejecutados con Docker real (ADR-016).

Los bloques ```bash de la sección 10 de cada ficha corren con el bash del sistema (Git for Windows en Windows) y el
Docker del host (y `docker compose up` en el entorno de Compose). Las imágenes van fijadas por digest en las fichas.
Los ejemplos de imágenes y de registries publican en un registry:2 local que el test levanta en el puerto 5055. Cada
test borra lo que crea. Sin Docker los tests se saltan, salvo con REQUIRE_DOCKER=1 (la CI).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.request
from collections.abc import Iterator
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
CONCEPTS = ROOT / "content" / "concepts"
REGISTRY_IMAGE = "registry:2@sha256:a3d8aaa63ed8681a604f1dea0aa03f100d5895b6a58ace528858a7b332415373"
REGISTRY_PORT = 5055
# En Git Bash, sin esto las rutas de --mount y los nombres con / se convierten a rutas de Windows.
NO_PATH_CONVERSION = {"MSYS_NO_PATHCONV": "1", "MSYS2_ARG_CONV_EXCL": "*"}


def blocks(ficha: str, language: str) -> list[str]:
    """Bloques ```<language> de la sección 10 de la ficha, en orden."""
    text = (CONCEPTS / f"{ficha}.md").read_text(encoding="utf-8")
    start = text.index("## 10. Código")
    section = text[start : text.index("\n## 11.", start)]
    return re.findall(rf"^```{language}\n(.*?)^```", section, re.S | re.M)


def docker(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["docker", *args], capture_output=True, text=True, encoding="utf-8", timeout=300)


@pytest.fixture(scope="session")
def docker_ready() -> None:
    if shutil.which("docker") is None or docker("info").returncode != 0:
        if os.environ.get("REQUIRE_DOCKER") == "1":
            pytest.fail("Docker no responde (REQUIRE_DOCKER=1)")
        pytest.skip("Docker no responde: inicia Docker para correr los ejemplos de 13-containers")


@pytest.fixture(scope="session")
def bash() -> str:
    """bash de Git for Windows en Windows (el de System32 es WSL); el del sistema en Linux."""
    if os.name == "nt":
        git = shutil.which("git")
        for parent in Path(git).resolve().parents if git else []:
            if (parent / "bin" / "bash.exe").is_file():
                return str(parent / "bin" / "bash.exe")
        pytest.skip("falta el bash de Git for Windows")
    found = shutil.which("bash")
    assert found, "falta bash"
    return found


@pytest.fixture(scope="session")
def registry(docker_ready: None) -> Iterator[str]:
    """registry:2 local, fijado por digest; se borra al terminar la sesión."""
    name = "dekh-test-registry"
    docker("rm", "-f", name)
    started = docker("run", "-d", "--rm", "--name", name, "-p", f"{REGISTRY_PORT}:5000", REGISTRY_IMAGE)
    assert started.returncode == 0, started.stderr
    try:
        for _ in range(30):
            try:
                with urllib.request.urlopen(f"http://localhost:{REGISTRY_PORT}/v2/", timeout=2):
                    break
            except OSError:
                time.sleep(1)
        else:
            pytest.fail("registry:2 no respondió en 30 s")
        yield f"localhost:{REGISTRY_PORT}"
    finally:
        docker("rm", "-f", name)


def run_snippet(bash: str, code: str, cwd: Path, env: dict[str, str] | None = None) -> str:
    script = cwd / "snippet.sh"
    script.write_text(code, encoding="utf-8", newline="\n")
    result = subprocess.run([bash, script.name], cwd=cwd, env={**os.environ, **NO_PATH_CONVERSION, **(env or {})},
                            capture_output=True, text=True, encoding="utf-8", timeout=600)
    assert result.returncode == 0, result.stdout + result.stderr
    return result.stdout


def test_container_is_pid_1_and_loses_its_writable_layer(docker_ready: None, bash: str, tmp_path: Path) -> None:
    (code,) = blocks("containers", "bash")
    try:
        out = run_snippet(bash, code, tmp_path)
    finally:
        docker("rm", "-f", "extract-1")
    assert "pid del proceso principal: 1" in out
    assert "sin checkpoint: el contenedor nuevo arranca de la imagen" in out


def test_image_is_pushed_and_pulled_back_by_digest(registry: str, bash: str, tmp_path: Path) -> None:
    (code,) = blocks("container-images", "bash")
    out = run_snippet(bash, code, tmp_path, {"REGISTRY": registry})
    digest = re.search(r"^digest publicado: (sha256:[0-9a-f]{64})$", out, re.M)
    assert digest, out
    docker("image", "rm", "-f", f"{registry}/dekh/base@{digest.group(1)}")
    assert "capas: 1" in out
    assert "bajada por digest: dekh-base" in out


def test_dockerfile_builds_test_stage_and_runs_job_as_non_root(docker_ready: None, bash: str, tmp_path: Path) -> None:
    (dockerfile,) = blocks("dockerfile", "dockerfile")
    (job,) = blocks("dockerfile", "python")
    (code,) = blocks("dockerfile", "bash")
    (tmp_path / "Dockerfile").write_text(dockerfile, encoding="utf-8", newline="\n")
    (tmp_path / "job.py").write_text(job, encoding="utf-8", newline="\n")
    (tmp_path / "data" / "in").mkdir(parents=True)
    (tmp_path / "data" / "out").mkdir()
    (tmp_path / "data" / "out").chmod(0o777)  # en Linux, el usuario 10001 del contenedor escribe en el bind mount
    (tmp_path / "data" / "in" / "ventas.csv").write_text("id,monto\n1,10.5\n2,4.25\n", encoding="utf-8")
    try:
        out = run_snippet(bash, code, tmp_path, {"DATA_DIR": (tmp_path / "data").as_posix()})
    finally:
        docker("image", "rm", "-f", "dekh/job:1.0", "dekh/job:test")
    assert "etapa test: el código compila" in out
    assert "usuario de la imagen: 10001" in out
    assert json.loads((tmp_path / "data" / "out" / "resumen.json").read_text(encoding="utf-8")) == {
        "rows": 2, "total": 14.75}
    typed = subprocess.run([sys.executable, "-m", "mypy", "--strict", "--no-incremental", "job.py"], cwd=tmp_path,
                           capture_output=True, text=True, encoding="utf-8")
    assert typed.returncode == 0, typed.stdout + typed.stderr


def test_volume_keeps_checkpoint_and_bind_mount_is_read_only(docker_ready: None, bash: str, tmp_path: Path) -> None:
    (code,) = blocks("container-volumes", "bash")
    inputs = tmp_path / "input"
    inputs.mkdir()
    (inputs / "a.csv").write_text("id\n1\n", encoding="utf-8")
    (inputs / "b.csv").write_text("id\n2\n", encoding="utf-8")
    try:
        out = run_snippet(bash, code, tmp_path, {"INPUT_DIR": inputs.as_posix()})
    finally:
        docker("volume", "rm", "-f", "dekh-checkpoints")
    assert "corrida 1: ya procesados 0, ahora 2" in out
    assert "corrida 2: ya procesados 2, ahora 2" in out
    assert out.count("la entrada es de solo lectura") == 2
    assert not (inputs / "escribir.txt").exists()


def test_user_defined_network_resolves_names_and_default_bridge_does_not(docker_ready: None, bash: str,
                                                                         tmp_path: Path) -> None:
    (code,) = blocks("container-networking", "bash")
    out = run_snippet(bash, code, tmp_path)
    assert "red propia: datos-api responde" in out
    assert "bridge por defecto: el nombre no resuelve" in out
    assert docker("network", "inspect", "dekh-net").returncode != 0  # el trap del script borró la red


def test_compose_waits_for_healthy_api_and_profiles_keep_debug_off(docker_ready: None, bash: str,
                                                                   tmp_path: Path) -> None:
    (compose,) = [b for b in blocks("docker-compose-environments", "yaml") if b.startswith("# Docker Compose")]
    (code,) = blocks("docker-compose-environments", "bash")
    (tmp_path / "compose.yaml").write_text(compose, encoding="utf-8", newline="\n")
    try:
        out = run_snippet(bash, code, tmp_path)
    finally:
        subprocess.run(["docker", "compose", "down", "--remove-orphans"], cwd=tmp_path, capture_output=True)
    assert "servicios activos: datos-api job" in out
    assert "con el perfil debug: datos-api debug job" in out
    assert "job: la API respondió en http://datos-api:8000/" in out


def test_mutable_tag_moves_and_old_digest_still_pulls(registry: str, bash: str, tmp_path: Path) -> None:
    (code,) = blocks("container-registries", "bash")
    try:
        out = run_snippet(bash, code, tmp_path, {"REGISTRY": registry})
    finally:
        docker("image", "rm", "-f", f"{registry}/dekh/ingesta:1.0")
    assert "el tag 1.0 se movió a otro digest" in out
    assert "1.0 trae hoy: build-2" in out
    assert "el digest anterior trae: build-1" in out

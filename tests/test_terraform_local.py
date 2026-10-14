"""Terraform de las fichas ejecutado con init, plan y apply sobre providers sin nube (ADR-015).

Los bloques ```hcl de la sección 10 de cada ficha se escriben en un directorio temporal, con state local, y se aplican
con hashicorp/local, hashicorp/random o terraform_data: no hay credenciales ni recursos de nube. La caché de providers
se comparte entre tests. Sin binario de Terraform (TERRAFORM o el del PATH) los tests se saltan, salvo con
REQUIRE_TERRAFORM=1 (la CI, con Terraform 1.16.6).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
CONCEPTS = ROOT / "content" / "concepts"
HCL_FENCE = re.compile(r"^```hcl\n(.*?)^```", re.S | re.M)


def hcl_blocks(ficha: str) -> list[str]:
    """Bloques ```hcl de la sección 10 de la ficha, en orden."""
    text = (CONCEPTS / f"{ficha}.md").read_text(encoding="utf-8")
    start = text.index("## 10. Código")
    section = text[start : text.index("\n## 11.", start)]
    return HCL_FENCE.findall(section)


@pytest.fixture(scope="session")
def terraform_bin() -> str:
    found = os.environ.get("TERRAFORM") or shutil.which("terraform")
    if not found:
        if os.environ.get("REQUIRE_TERRAFORM") == "1":
            pytest.fail("falta terraform (REQUIRE_TERRAFORM=1)")
        pytest.skip("falta terraform: TERRAFORM=<ruta> o en el PATH")
    return found


@pytest.fixture(scope="session")
def plugin_cache(tmp_path_factory: pytest.TempPathFactory) -> Path:
    return tmp_path_factory.mktemp("tf-plugin-cache")


@pytest.fixture
def tf(terraform_bin: str, plugin_cache: Path):  # type: ignore[no-untyped-def]
    def run(workdir: Path, *args: str, ok: bool = True, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
        full_env = {**os.environ, "TF_PLUGIN_CACHE_DIR": str(plugin_cache), "TF_IN_AUTOMATION": "1",
                    "TF_INPUT": "0", "CHECKPOINT_DISABLE": "1", **(env or {})}
        result = subprocess.run([terraform_bin, *args, "-no-color"] if args[0] not in ("output", "workspace") else
                                [terraform_bin, *args], cwd=workdir, env=full_env, capture_output=True, text=True,
                                encoding="utf-8", timeout=600)
        if ok:
            assert result.returncode == 0, result.stdout + result.stderr
        return result
    return run


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def test_variables_and_outputs_validate_types_and_keep_sensitive_values_out_of_the_cli(tf, tmp_path: Path) -> None:  # type: ignore[no-untyped-def]
    main, tfvars = hcl_blocks("terraform-variables-and-outputs")
    write(tmp_path / "main.tf", main)
    write(tmp_path / "terraform.tfvars", tfvars)
    token = {"TF_VAR_api_token": "token-de-prueba-123"}
    tf(tmp_path, "init", "-input=false")
    applied = tf(tmp_path, "apply", "-auto-approve", "-input=false", env=token)
    assert "api_token_used = <sensitive>" in applied.stdout and "token-de-prueba-123" not in applied.stdout
    files = json.loads(tf(tmp_path, "output", "-json", "config_files").stdout)
    assert sorted(files) == ["clientes", "ventas"]
    clientes = json.loads((tmp_path / "out" / "dekh-dev-clientes.json").read_text(encoding="utf-8"))
    assert clientes["retention_days"] == 365
    assert json.loads((tmp_path / "out" / "dekh-dev-ventas.json").read_text(encoding="utf-8"))["retention_days"] == 30
    # Según la documentación, Terraform guarda en el state los valores de las variables sensibles.
    assert "token-de-prueba-123" in (tmp_path / "terraform.tfstate").read_text(encoding="utf-8")
    rejected = tf(tmp_path, "plan", "-input=false", "-var", "environment=qa", ok=False, env=token)
    assert rejected.returncode != 0 and "environment debe ser dev, staging o prod." in rejected.stderr


def test_module_called_with_for_each_creates_one_instance_per_dataset(tf, tmp_path: Path) -> None:  # type: ignore[no-untyped-def]
    child, root = hcl_blocks("terraform-modules")
    write(tmp_path / "modules" / "dataset" / "main.tf", child)
    write(tmp_path / "main.tf", root)
    tf(tmp_path, "init", "-input=false")
    tf(tmp_path, "apply", "-auto-approve", "-input=false")
    paths = json.loads(tf(tmp_path, "output", "-json", "dataset_paths").stdout)
    assert sorted(paths) == ["clientes", "ventas"]
    assert sorted(p.relative_to(tmp_path / "out").as_posix() for p in (tmp_path / "out").rglob("*") if p.is_file()) == [
        "clientes/README.md", "clientes/config.json", "ventas/README.md", "ventas/config.json"]
    replan = tf(tmp_path, "plan", "-detailed-exitcode", "-input=false", ok=False)
    assert replan.returncode == 0, replan.stdout + replan.stderr  # 0: sin cambios; aplicar de nuevo no duplica


def test_remote_state_with_local_backend_shares_outputs_between_configurations(tf, tmp_path: Path) -> None:  # type: ignore[no-untyped-def]
    producer, consumer = hcl_blocks("terraform-remote-state")
    write(tmp_path / "storage" / "main.tf", producer)
    write(tmp_path / "ingestion" / "main.tf", consumer)
    for name in ("storage", "ingestion"):
        tf(tmp_path / name, "init", "-input=false")
        tf(tmp_path / name, "apply", "-auto-approve", "-input=false")
    assert sorted(p.name for p in (tmp_path / "state").iterdir()) == ["ingestion.tfstate", "storage.tfstate"]
    bucket = tf(tmp_path / "storage", "output", "-raw", "raw_bucket").stdout
    assert re.fullmatch(r"dekh-raw-[0-9a-f]{8}", bucket)
    config = json.loads((tmp_path / "ingestion" / "out" / "ingestion.json").read_text(encoding="utf-8"))
    assert config == {"landing_bucket": bucket}


def test_workspaces_keep_separate_state_and_size_per_environment(tf, tmp_path: Path) -> None:  # type: ignore[no-untyped-def]
    (main,) = hcl_blocks("terraform-environments")
    write(tmp_path / "main.tf", main)
    tf(tmp_path, "init", "-input=false")
    for workspace in ("dev", "prod"):
        tf(tmp_path, "workspace", "new", workspace)
        tf(tmp_path, "apply", "-auto-approve", "-input=false")
    assert tf(tmp_path, "workspace", "show").stdout.strip() == "prod"
    states = sorted(p.relative_to(tmp_path).as_posix() for p in (tmp_path / "terraform.tfstate.d").rglob("terraform.tfstate"))
    assert states == ["terraform.tfstate.d/dev/terraform.tfstate", "terraform.tfstate.d/prod/terraform.tfstate"]
    assert json.loads((tmp_path / "out" / "dev.json").read_text(encoding="utf-8")) == {"name": "spark-dev", "workers": 1}
    assert json.loads((tmp_path / "out" / "prod.json").read_text(encoding="utf-8")) == {"name": "spark-prod", "workers": 4}

"""Plan de la CI por rutas cambiadas: qué jobs y qué pruebas corren según los archivos del diff.

Reglas (CLAUDE.md, «Eficiencia»):
- backend, schemas, scripts, tests, contrato, dependencias, Makefile o la propia CI → suite completa;
- content/ → validate, compilador, tests de datos y solo los tests de snippets de las fichas cambiadas, más los
  validadores de bloques (Terraform, actionlint, cfn-lint, Bicep, hadolint, kubeconform, Airflow) si alguna ficha
  cambiada tiene un bloque de ese tipo;
- frontend/ o tests/frontend/ → tests de frontend, tsc y build;
- lo demás (docs/ salvo el contrato, CLAUDE.md, README) → nada.
Con --full (workflow_dispatch, o antes de make static) todo corre.

Solo biblioteca estándar: corre con el Python del runner, antes de crear el .venv.

Uso: python scripts/ci/plan.py --base SHA [--head SHA] [--full] [--github-output RUTA]
     python scripts/ci/plan.py --local      (diff contra origin/main más el árbol de trabajo; imprime el plan)
     python scripts/ci/plan.py --local --run   (make test-changed: corre las pruebas del plan local)
"""

from __future__ import annotations

import argparse
import importlib.util
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[2]


def load_checks() -> ModuleType:
    """El registro de Airflow, cargado desde su archivo: importar el paquete scripts exige el .venv, que el job
    plan todavía no tiene."""
    path = ROOT / "scripts" / "snippets" / "airflow_dag_checks.py"
    spec = importlib.util.spec_from_file_location("dekh_airflow_dag_checks", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module   # dataclass busca el módulo de la clase en sys.modules
    spec.loader.exec_module(module)
    return module


CHECKS = load_checks().CHECKS

FULL_PREFIXES = ("backend/", "schemas/", "scripts/", "alembic/", "tests/", ".github/", "docs/contracts/")
FULL_FILES = {"Makefile", "pyproject.toml", "requirements.txt", "requirements-snippets.txt", "alembic.ini",
              "docker-compose.yml"}
FRONTEND_PREFIXES = ("frontend/", "tests/frontend/")
NULL_SHA = "0" * 40

# Tipo de bloque → patrón que lo identifica en una ficha (el mismo criterio que scripts/snippets/extract.py).
BLOCKS = {
    "terraform": re.compile(r"^```hcl\b", re.M),
    "actions": re.compile(r"^```yaml\n# GitHub Actions", re.M),
    "cfn": re.compile(r"^```yaml\n# CloudFormation", re.M),
    "bicep": re.compile(r"^```bicep\b", re.M),
    "dockerfile": re.compile(r"^```dockerfile\b", re.M),
    "k8s": re.compile(r"^```yaml\n# Kubernetes", re.M),
}


@dataclass
class Plan:
    mode: str = "none"                          # full | content | none
    frontend: bool = False
    slugs: list[str] = field(default_factory=list)
    blocks: set[str] = field(default_factory=set)
    airflow: list[str] = field(default_factory=list)

    @property
    def backend(self) -> bool:
        return self.mode != "none"

    def flag(self, block: str) -> bool:
        return self.mode == "full" or block in self.blocks

    def outputs(self) -> dict[str, str]:
        out = {"mode": self.mode, "backend": str(self.backend).lower(), "frontend": str(self.frontend).lower(),
               "slugs": ",".join(self.slugs), "airflow": "true" if self.mode == "full" or self.airflow else "false",
               "airflow_slugs": "" if self.mode == "full" else " ".join(self.airflow)}
        out.update({block: str(self.flag(block)).lower() for block in BLOCKS})
        return out


def is_full(path: str) -> bool:
    if path.startswith("tests/frontend/"):
        return False
    return path in FULL_FILES or path.startswith(FULL_PREFIXES)


def plan_for(paths: list[str], full: bool = False, root: Path = ROOT) -> Plan:
    if full or any(is_full(p) for p in paths):
        return Plan(mode="full", frontend=True)
    plan = Plan(frontend=any(p.startswith(FRONTEND_PREFIXES) for p in paths))
    changed = sorted(p for p in paths if p.startswith("content/"))
    if not changed:
        return plan
    plan.mode = "content"
    plan.slugs = sorted({Path(p).stem for p in changed if Path(p).suffix in {".md", ".yaml", ".yml"}})
    for p in changed:
        file = root / p
        if file.suffix != ".md" or not file.exists():   # borrada: sin bloques que validar
            continue
        text = file.read_text(encoding="utf-8")
        plan.blocks |= {block for block, pattern in BLOCKS.items() if pattern.search(text)}
    plan.airflow = [s for s in plan.slugs if s in CHECKS]
    return plan


def git(*args: str) -> list[str]:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True)
    return [line for line in result.stdout.splitlines() if line]


def changed_paths(base: str, head: str) -> list[str] | None:
    """Archivos del diff; None si no hay base usable (primer push, historia reescrita): corre todo."""
    if not base or base == NULL_SHA:
        return None
    try:
        return git("diff", "--name-only", f"{base}...{head}")
    except subprocess.CalledProcessError:
        return None


def local_paths() -> list[str]:
    committed = git("diff", "--name-only", "origin/main...HEAD")
    working = git("diff", "--name-only", "HEAD") + git("ls-files", "--others", "--exclude-standard")
    return sorted(set(committed + working))


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base", default="")
    parser.add_argument("--head", default="HEAD")
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--local", action="store_true")
    parser.add_argument("--github-output")
    parser.add_argument("--run", action="store_true", help="corre pytest y los tests de frontend del plan")
    args = parser.parse_args(argv)
    paths = local_paths() if args.local else changed_paths(args.base, args.head)
    plan = plan_for(paths or [], full=args.full or paths is None)
    lines = [f"{key}={value}" for key, value in plan.outputs().items()]
    if args.github_output:
        with open(args.github_output, "a", encoding="utf-8") as out:
            out.write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()

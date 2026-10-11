"""Carga con DagBag los Dags de Airflow de las fichas y ejecuta las aserciones que cada una declara.

Se ejecuta en un entorno virtual aparte con apache-airflow fijado (make check-airflow-dag; la CI lo hace),
para no mezclar las dependencias de Airflow con las de la plataforma. De cada ficha toma el único bloque
```python de la sección 10 que empieza con "# Airflow"; las aserciones están en airflow_dag_checks.py.
Las tareas no se ejecutan: solo se parsean los Dags.
Uso: python scripts/snippets/check_airflow_dag.py [slug ...]   (sin argumentos, todas las fichas declaradas)
"""

from __future__ import annotations

import importlib.util
import os
import re
import sys
import tempfile
from pathlib import Path
from types import ModuleType

from airflow_dag_checks import CHECKS  # mismo directorio (scripts/snippets), sin importar Airflow

CONCEPTS = Path(__file__).resolve().parents[2] / "content" / "concepts"
FENCE = re.compile(r"^```python\n(.*?)^```", re.S | re.M)


def dag_code(ficha: Path) -> str:
    text = ficha.read_text(encoding="utf-8")
    section = text[text.index("## 10. Código"): text.index("## 11.")]
    blocks = [b for b in FENCE.findall(section) if b.startswith("# Airflow")]
    if len(blocks) != 1:
        raise SystemExit(f"{ficha}: se esperaba un bloque que empiece con '# Airflow' en la sección 10")
    return blocks[0]


def module_name(slug: str) -> str:
    return "dag_" + slug.replace("-", "_")


def load_module(path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(path.stem, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main(argv: list[str]) -> None:
    slugs = argv[1:] or sorted(CHECKS)
    home = Path(tempfile.mkdtemp(prefix="airflow_home_"))
    dags = home / "dags"
    dags.mkdir()
    for slug in slugs:
        (dags / f"{module_name(slug)}.py").write_text(dag_code(CONCEPTS / f"{slug}.md"), encoding="utf-8")
    os.environ.update({"AIRFLOW_HOME": str(home), "AIRFLOW__CORE__LOAD_EXAMPLES": "False"})

    from airflow.dag_processing.dagbag import DagBag  # import tardío: AIRFLOW_HOME ya está fijado

    bag = DagBag(dag_folder=str(dags))   # los ejemplos ya están desactivados por AIRFLOW__CORE__LOAD_EXAMPLES
    if bag.import_errors:
        raise SystemExit(f"errores de import: {bag.import_errors}")
    # get_dag() consulta la base de metadatos (no existe aquí); los Dags parseados están en bag.dags.
    failures: list[str] = []   # se ejecutan todas las aserciones y se informan todos los fallos juntos
    for slug in slugs:
        declared = CHECKS[slug]
        missing = declared.dag_ids - set(bag.dags)
        if missing:
            failures.append(f"{slug}: faltan Dags {sorted(missing)}")
            continue
        module = load_module(dags / f"{module_name(slug)}.py")
        results = []
        for check in declared.checks:
            try:
                results.append(check(bag.dags, module))
            except AssertionError as error:
                failures.append(f"{slug}: {error!r}")
        print(f"{slug}: Dags {sorted(declared.dag_ids)} sin errores de import; " + "; ".join(results))
    if failures:
        raise SystemExit("aserciones fallidas:\n" + "\n".join(failures))
    print(f"DagBag: {len(bag.dags)} Dags de {len(slugs)} fichas, todas las aserciones en verde")


if __name__ == "__main__":
    main(sys.argv)

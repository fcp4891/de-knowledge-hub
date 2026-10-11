"""Carga con DagBag el Dag de Airflow de una ficha y verifica que no haya errores de import.

Se ejecuta en un entorno virtual aparte con apache-airflow fijado (make check-airflow-dag; la CI lo hace),
para no mezclar las dependencias de Airflow con las de la plataforma. Toma el primer bloque ```python de la
sección 10 que empieza con "# Airflow". Las tareas no se ejecutan: solo se parsean los Dags.
Uso: python scripts/snippets/check_airflow_dag.py content/concepts/pipeline-dependencies.md
"""

from __future__ import annotations

import os
import re
import sys
import tempfile
from pathlib import Path

FENCE = re.compile(r"^```python\n(.*?)^```", re.S | re.M)


def dag_code(ficha: Path) -> str:
    text = ficha.read_text(encoding="utf-8")
    section = text[text.index("## 10. Código"): text.index("## 11.")]
    blocks = [b for b in FENCE.findall(section) if b.startswith("# Airflow")]
    if len(blocks) != 1:
        raise SystemExit(f"{ficha}: se esperaba un bloque que empiece con '# Airflow' en la sección 10")
    return blocks[0]


def main(argv: list[str]) -> None:
    ficha = Path(argv[1])
    home = Path(tempfile.mkdtemp(prefix="airflow_home_"))
    dags = home / "dags"
    dags.mkdir()
    (dags / "dag_ficha.py").write_text(dag_code(ficha), encoding="utf-8")
    os.environ.update({"AIRFLOW_HOME": str(home), "AIRFLOW__CORE__LOAD_EXAMPLES": "False"})

    from airflow.dag_processing.dagbag import DagBag  # import tardío: AIRFLOW_HOME ya está fijado

    bag = DagBag(dag_folder=str(dags))   # los ejemplos ya están desactivados por AIRFLOW__CORE__LOAD_EXAMPLES
    if bag.import_errors:
        raise SystemExit(f"errores de import: {bag.import_errors}")
    ventas = bag.get_dag("ventas_diarias")
    reporte = bag.get_dag("reporte_ventas")
    assert ventas is not None and reporte is not None, sorted(bag.dag_ids)
    validar = ventas.get_task("validar")
    assert validar.upstream_task_ids == {"extraer_pos", "extraer_web"}, validar.upstream_task_ids
    assert ventas.get_task("limpiar_temporales").trigger_rule == "all_done"
    print(f"DagBag sin errores de import: {sorted(bag.dag_ids)}; validar depende de {sorted(validar.upstream_task_ids)}")


if __name__ == "__main__":
    main(sys.argv)

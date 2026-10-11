"""Todo Dag que una ficha presenta como cargado en la CI tiene aserciones declaradas (make check-airflow-dag).

No necesita Airflow: cruza los bloques de la sección 10 cuya primera línea dice "cargado en la CI con DagBag" con
scripts/snippets/airflow_dag_checks.py. Los bloques "# Airflow 3" de fichas anteriores que dependen de otras
bibliotecas (por ejemplo, google-cloud-bigquery) no dicen eso y no se cargan.
"""

from __future__ import annotations

import re
from pathlib import Path

from scripts.snippets.airflow_dag_checks import CHECKS

CONCEPTS = Path(__file__).resolve().parent.parent / "content" / "concepts"
FENCE = re.compile(r"^```python\n(.*?)^```", re.S | re.M)
MARK = "cargado en la CI con DagBag"


def fichas_with_ci_dag() -> set[str]:
    found = set()
    for path in CONCEPTS.glob("*.md"):
        text = path.read_text(encoding="utf-8")
        if "## 10. Código" not in text:
            continue
        section = text[text.index("## 10. Código"): text.index("## 11.")]
        blocks = [b for b in FENCE.findall(section) if MARK in b.splitlines()[0]]
        assert len(blocks) <= 1, f"{path.name}: más de un bloque cargado en la CI en la sección 10"
        if blocks:
            assert blocks[0].startswith("# Airflow"), f"{path.name}: el bloque cargado en la CI empieza con '# Airflow'"
            found.add(path.stem)
    return found


def test_every_dag_presented_as_ci_loaded_has_declared_checks() -> None:
    assert fichas_with_ci_dag() == set(CHECKS)


def test_every_ficha_declares_at_least_one_dag_and_one_check() -> None:
    for slug, declared in CHECKS.items():
        assert declared.dag_ids and declared.checks, slug

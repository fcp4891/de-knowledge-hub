"""Tests del conteo de nodos y aristas de los diagramas Mermaid (backend/content/diagrams.py)."""

from __future__ import annotations

from pathlib import Path

from backend.content import diagrams as d
from tests.test_validate import concept, content, run, write_md  # noqa: F401

REFERENCE = """flowchart LR
  V["-var / -var-file"] --> C["Configuración<br/>(variables, locals)"]
  T["terraform.tfvars<br/>*.auto.tfvars"] --> C
  E["TF_VAR_…"] --> C
  D["default"] --> C
  C --> R["Recursos"]
  R --> O["Outputs:<br/>CLI, módulo padre,<br/>otras configuraciones"]
"""


def test_reference_diagram_is_within_the_limits() -> None:
    assert d.diagram_size(REFERENCE) == d.DiagramSize("flowchart", 7, 6)
    assert not d.diagram_size(REFERENCE).too_big


def test_flowchart_shapes_labels_fan_out_and_subgraphs() -> None:
    code = """flowchart TB
  A[(x)] -- sí --> B{{y}} -->|no| C((z)) & D>w]
  subgraph S["capa"]
    direction LR
    E --- F
  end
  B -.-> E
  B -. tal vez .-> F
  B == fuerte ==> F
  A -.sin espacios.-> F
  style A fill:#fff
"""
    assert d.diagram_size(code) == d.DiagramSize("flowchart", 6, 8)


def test_chained_open_links_are_not_text_labels() -> None:
    code = """flowchart LR
  V[Ventas] --- DF[Fecha] --- DP[Producto] --- DT[Tienda]
  I --- DF
  A -- texto --- B
"""
    assert d.diagram_size(code) == d.DiagramSize("flowchart", 7, 5)


def test_subgraph_used_as_edge_end_is_not_a_node() -> None:
    code = """flowchart TB
  subgraph Q["Quorum"]
    C1 --- C2
  end
  subgraph B
    B1
  end
  Q -.-> B
  P --> B1
"""
    assert d.diagram_size(code) == d.DiagramSize("flowchart", 4, 3)


def test_state_er_sequence_and_git_diagrams() -> None:
    state = "stateDiagram-v2\n  [*] --> a\n  a --> b: ok\n  b --> [*]\n"
    er = 'erDiagram\n  A ||--o{ B : "tiene"\n  B }|--|{ C : "usa"\n'
    seq = "sequenceDiagram\n  participant J as Job\n  participant T as Temp\n  J->>T: crear\n  J-->>T: borrar\n"
    git = 'gitGraph\n  commit id: "a"\n  branch f\n  commit id: "b"\n  checkout main\n  merge f\n'
    assert d.diagram_size(state) == d.DiagramSize("stateDiagram-v2", 2, 3)
    assert d.diagram_size(er) == d.DiagramSize("erDiagram", 3, 2)
    assert d.diagram_size(seq) == d.DiagramSize("sequenceDiagram", 2, 2)
    assert d.diagram_size(git) == d.DiagramSize("gitGraph", 3, 1)


def test_big_diagram_is_a_warning_not_an_error(content: Path) -> None:
    nodes = "\n".join(f"  N{i} --> N{i + 1}" for i in range(9))
    write_md(content, "concepts/a.md", concept("a"), body=f"## 9. Arquitectura\n\n```mermaid\nflowchart TB\n{nodes}\n```\n")
    report = run(content)
    assert report.ok, report.errors
    assert any("[mermaid 1] flowchart: 10 nodos y 9 aristas" in w for w in report.warnings)

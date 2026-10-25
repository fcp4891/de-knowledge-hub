"""Tamaño de los diagramas Mermaid de las fichas (estándar de la §9, CLAUDE.md).

Cuenta nodos y aristas de cada bloque ```mermaid. Lo usa `make validate` para avisar (sin error) si un
diagrama supera MAX_NODES nodos o MAX_EDGES aristas. Cubre flowchart/graph, stateDiagram, erDiagram,
sequenceDiagram (participantes y mensajes) y gitGraph (commits y merges).
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from dataclasses import dataclass

MAX_NODES = 8
MAX_EDGES = 10
MERMAID_BLOCK = re.compile(r"^```mermaid\s*\n(.*?)^```", re.S | re.M)

QUOTED = re.compile(r'"[^"]*"')
SHAPE = re.compile(r"\[[^\[\]]*\]|\([^()]*\)|\{[^{}]*\}|(?<=\w)>[^\]\n]*\]")
PIPE_LABEL = re.compile(r"\|[^|]*\|")
# Etiqueta en medio de la flecha: `A -- texto --> B`, `A -. texto .-> B` (también `-.texto.->`), `A == texto ==> B`.
TEXT_ARROW = re.compile(r"(?<![-.=])--\s+[^-]+?\s+-->|(?<![-.=])--\s+[^-]+?\s+---|-\.\s*[^.>]+?\s*\.->|==\s+.+?\s+==>")
ARROW = re.compile(r"\s*(?:<?(?:-\.+-?>?|-{2,}[>ox]?|={2,}>?)|~~~)\s*")
NODE_ID = re.compile(r"^([A-Za-z0-9_][\w.-]*)")
FLOW_SKIP = ("subgraph", "end", "direction", "classDef", "class ", "style", "linkStyle", "click", "%%")
STATE_EDGE = re.compile(r"^\s*(\[\*\]|[\w.]+)\s*-->\s*(\[\*\]|[\w.]+)")
ER_EDGE = re.compile(r"^\s*([\w-]+)\s+[|}o][|o]?(?:--|\.\.)[|o][|{o]?\s+([\w-]+)")
SEQ_PARTICIPANT = re.compile(r"^\s*(?:participant|actor)\s+(\w+)")
SEQ_MESSAGE = re.compile(r"^\s*(\w+)\s*(?:-{1,2}>>|-{1,2}>|-{1,2}x|-{1,2}\))[+-]?\s*(\w+)\s*:")


@dataclass(frozen=True)
class DiagramSize:
    kind: str
    nodes: int
    edges: int

    @property
    def too_big(self) -> bool:
        return self.nodes > MAX_NODES or self.edges > MAX_EDGES


def mermaid_blocks(markdown: str) -> Iterator[str]:
    for match in MERMAID_BLOCK.finditer(markdown):
        yield match.group(1)


def statements(code: str) -> Iterator[str]:
    for raw in code.splitlines():
        for part in raw.split(";"):
            if part.strip():
                yield part.strip()


def strip_labels(line: str) -> str:
    line = QUOTED.sub('""', line)
    line = PIPE_LABEL.sub("", line)
    for _ in range(3):  # formas anidadas: [("x")], (("x")), {{x}}
        line = SHAPE.sub("", line)
    return TEXT_ARROW.sub("-->", line)


def node_ids(chunk: str) -> list[str]:
    ids = []
    for part in chunk.split("&"):
        match = NODE_ID.match(part.strip().split(":::")[0])
        if match:
            ids.append(match.group(1))
    return ids


def flowchart_size(lines: list[str]) -> tuple[int, int]:
    """Nodos y aristas; un subgraph es un grupo, no un nodo, aunque una arista lo use de extremo."""
    nodes: set[str] = set()
    groups_ids: set[str] = set()
    edges = 0
    for line in lines:
        if line.startswith("subgraph "):
            groups_ids.update(node_ids(strip_labels(line.removeprefix("subgraph "))))
        if line.startswith(FLOW_SKIP):
            continue
        groups = [node_ids(chunk) for chunk in ARROW.split(strip_labels(line))]
        groups = [g for g in groups if g]
        for group in groups:
            nodes.update(group)
        edges += sum(len(a) * len(b) for a, b in zip(groups, groups[1:], strict=False))
    return len(nodes - groups_ids), edges


def pair_size(lines: list[str], edge: re.Pattern[str], extra: re.Pattern[str] | None = None) -> tuple[int, int]:
    nodes: set[str] = set()
    edges = 0
    for line in lines:
        if extra is not None and (m := extra.match(line)):
            nodes.add(m.group(1))
        elif m := edge.match(line):
            nodes.update((m.group(1), m.group(2)))
            edges += 1
    nodes.discard("[*]")
    return len(nodes), edges


def git_size(lines: list[str]) -> tuple[int, int]:
    commits = sum(1 for line in lines if line.startswith(("commit", "merge", "cherry-pick")))
    return commits, sum(1 for line in lines if line.startswith("merge"))


def diagram_size(code: str) -> DiagramSize:
    lines = list(statements(code))
    kind = lines[0].split()[0] if lines else ""
    body = lines[1:]
    if kind in ("flowchart", "graph"):
        nodes, edges = flowchart_size(body)
    elif kind.startswith("stateDiagram"):
        nodes, edges = pair_size(body, STATE_EDGE)
    elif kind == "erDiagram":
        nodes, edges = pair_size(body, ER_EDGE)
    elif kind == "sequenceDiagram":
        nodes, edges = pair_size(body, SEQ_MESSAGE, SEQ_PARTICIPANT)
    elif kind == "gitGraph":
        nodes, edges = git_size(body)
    else:
        nodes, edges = 0, 0
    return DiagramSize(kind, nodes, edges)

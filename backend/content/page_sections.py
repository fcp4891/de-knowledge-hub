"""Estructura de las fichas y snippets: las secciones de su plantilla en content/_templates/.

La plantilla es la fuente única de los títulos. Una ficha `concept` o `pattern` que no es stub debe
tener las 22 secciones de concept.md (§22); un `code_snippet`, las 10 de snippet.md (§23). Los
encabezados `## N. Título` van en orden, con los títulos de la plantilla y sin secciones vacías
(un comentario HTML solo no cuenta como contenido). En las fichas, la §14 (Buenas prácticas)
lleva además las viñetas `- **Seguridad**`, `- **Observabilidad**` y `- **Costo**` (criterio de
la revisión B-F3.1); el rótulo puede seguir con más texto, como `- **Costo y capacidad:**`.
"""

from __future__ import annotations

import re
from pathlib import Path

HEADING = re.compile(r"^## (\d+)\. (.+?)\s*$")
HTML_COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)
TEMPLATE = Path("_templates") / "concept.md"
SNIPPET_TEMPLATE = Path("_templates") / "snippet.md"
PAGE_TYPES = {"concept", "pattern"}
SNIPPET_TYPE = "code_snippet"
TEMPLATES = {"concept": TEMPLATE, "pattern": TEMPLATE, SNIPPET_TYPE: SNIPPET_TEMPLATE}
SECTIONED_TYPES = set(TEMPLATES)  # tipos con cuerpo estructurado por secciones
PRACTICES_SECTION = 14
PRACTICE_BULLETS = ("Seguridad", "Observabilidad", "Costo")


def body_of(text: str) -> str:
    """Cuerpo Markdown tras el frontmatter (el archivo ya pasó split_frontmatter)."""
    lines = text.splitlines()
    closing = next(i for i, line in enumerate(lines[1:], start=1) if line.strip() == "---")
    return "\n".join(lines[closing + 1 :])


def sections(body: str) -> list[tuple[int, str, str]]:
    """(número, título, contenido) de cada encabezado `## N. Título`, en el orden del archivo."""
    found: list[tuple[int, str, list[str]]] = []
    for line in body.splitlines():
        match = HEADING.match(line)
        if match:
            found.append((int(match.group(1)), match.group(2), []))
        elif found:
            found[-1][2].append(line)
    return [(number, title, "\n".join(lines)) for number, title, lines in found]


def template_titles(content_dir: Path, template: Path = TEMPLATE) -> list[str] | None:
    """Títulos de la plantilla en orden; None si content/ no tiene esa plantilla con secciones."""
    path = content_dir / template
    if not path.is_file():
        return None
    titles = [title for _, title, _ in sections(body_of(path.read_text(encoding="utf-8")))]
    return titles or None


def is_empty(content: str) -> bool:
    return not HTML_COMMENT.sub("", content).strip()


def check(body: str, titles: list[str]) -> list[str]:
    """Errores de estructura de la ficha frente a los títulos de la plantilla."""
    found = sections(body)
    errors = []
    numbers = [number for number, _, _ in found]
    expected = list(range(1, len(titles) + 1))
    if numbers != expected:
        missing = sorted(set(expected) - set(numbers))
        detail = f"faltan {missing}" if missing else f"orden encontrado {numbers}"
        errors.append(f"[secciones] se esperan las {len(titles)} secciones de la plantilla en orden; {detail}")
    for number, title, content in found:
        if 1 <= number <= len(titles) and title != titles[number - 1]:
            errors.append(f"[secciones] la sección {number} debe titularse '{titles[number - 1]}', no '{title}'")
        if is_empty(content):
            errors.append(f"[secciones] la sección {number} ('{title}') está vacía")
    return errors


def check_practices(body: str) -> list[str]:
    """Errores si la §14 de una ficha no tiene las viñetas de seguridad, observabilidad y costo."""
    found = [(title, content) for number, title, content in sections(body) if number == PRACTICES_SECTION]
    if not found:
        return []  # check() ya reporta la sección faltante
    title, content = found[0]
    return [
        f"[secciones] la sección {PRACTICES_SECTION} ('{title}') necesita la viñeta '- **{label}...**'"
        for label in PRACTICE_BULLETS
        if not re.search(rf"^- \*\*{label}\b", content, re.M)
    ]

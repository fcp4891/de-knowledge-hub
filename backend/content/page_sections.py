"""Estructura de las fichas y snippets: las secciones de su plantilla en content/_templates/.

La plantilla es la fuente única de los títulos. Una ficha `concept` o `pattern` que no es stub debe
tener las 22 secciones de concept.md (§22); una `architecture`, las 22 de architecture.md (ADR-028); un
`code_snippet`, las 10 de snippet.md (§23). Los
encabezados `## N. Título` van en orden, con los títulos de la plantilla y sin secciones vacías
(un comentario HTML solo no cuenta como contenido). En las fichas, la §14 (Buenas prácticas)
lleva además las viñetas `- **Seguridad**`, `- **Observabilidad**` y `- **Costo**` (criterio de
la revisión B-F3.1); el rótulo puede seguir con más texto, como `- **Costo y capacidad:**`.
Excepción (ADR-029): las fichas de OMITTABLE pueden omitir esas secciones y llevar `## Anexo · Título` al final.
"""

from __future__ import annotations

import re
from pathlib import Path

HEADING = re.compile(r"^## (\d+)\. (.+?)\s*$")
ANNEX_HEADING = re.compile(r"^## Anexo · (.+?)\s*$")   # ADR-029: después de la última sección
# ADR-029: única excepción a las 22 secciones; puede omitir estas y llevar anexos. Las demás fichas, sin cambios.
OMITTABLE = {"chile-data-protection": frozenset({6, 7, 8, 12, 13, 15, 17, 19})}
ANNEX_PAGES = frozenset(OMITTABLE)
HTML_COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)
TEMPLATE = Path("_templates") / "concept.md"
SNIPPET_TEMPLATE = Path("_templates") / "snippet.md"
ARCHITECTURE_TEMPLATE = Path("_templates") / "architecture.md"   # ADR-028
PAGE_TYPES = {"concept", "pattern", "architecture"}
PRACTICE_TYPES = {"concept", "pattern"}   # la §14 con Seguridad, Observabilidad y Costo; en architecture son §7–9
VIEW_SECTIONS = {3: "contexto", 5: "datos", 6: "despliegue"}   # ADR-028: una vista Mermaid por sección
SNIPPET_TYPE = "code_snippet"
TEMPLATES = {"concept": TEMPLATE, "pattern": TEMPLATE, "architecture": ARCHITECTURE_TEMPLATE, SNIPPET_TYPE: SNIPPET_TEMPLATE}
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
        if ANNEX_HEADING.match(line):
            break  # los anexos van al final y no son secciones (ADR-029)
        match = HEADING.match(line)
        if match:
            found.append((int(match.group(1)), match.group(2), []))
        elif found:
            found[-1][2].append(line)
    return [(number, title, "\n".join(lines)) for number, title, lines in found]


def annexes(body: str) -> list[tuple[str, str]]:
    """(título, contenido) de cada `## Anexo · Título`; un anexo termina en el encabezado `## ` siguiente."""
    found: list[tuple[str, list[str]]] = []
    current: list[str] | None = None
    for line in body.splitlines():
        match = ANNEX_HEADING.match(line)
        if match:
            found.append((match.group(1), []))
            current = found[-1][1]
        elif line.startswith("## "):
            current = None
        elif current is not None:
            current.append(line)
    return [(title, "\n".join(lines)) for title, lines in found]


def check_annexes(body: str, slug: str) -> list[str]:
    """ADR-029: solo las fichas de ANNEX_PAGES llevan anexos, al final y con contenido."""
    found = annexes(body)
    if not found:
        return []
    if slug not in ANNEX_PAGES:
        return ["[secciones] solo las fichas con la excepción del ADR-029 llevan anexos"]
    errors = [f"[secciones] el anexo '{title}' está vacío" for title, content in found if is_empty(content)]
    tail = body.split("\n## Anexo · ", 1)[-1]
    if re.search(r"^## \d+\. ", tail, re.M):
        errors.append("[secciones] los anexos van después de la última sección")
    return errors


def template_titles(content_dir: Path, template: Path = TEMPLATE) -> list[str] | None:
    """Títulos de la plantilla en orden; None si content/ no tiene esa plantilla con secciones."""
    path = content_dir / template
    if not path.is_file():
        return None
    titles = [title for _, title, _ in sections(body_of(path.read_text(encoding="utf-8")))]
    return titles or None


VIEW_MARK = re.compile(r"<!--\s*view:\s*[a-z_]+\s*-->")


def is_empty(content: str) -> bool:
    """Un comentario HTML solo no es contenido; una marca de vista sí (ADR-030, enmienda 1)."""
    return not VIEW_MARK.search(content) and not HTML_COMMENT.sub("", content).strip()


def check(body: str, titles: list[str], omittable: frozenset[int] = frozenset()) -> list[str]:
    """Errores de estructura de la ficha frente a los títulos de la plantilla; `omittable`: las secciones
    que la ficha puede omitir (ADR-029)."""
    found = sections(body)
    errors = []
    numbers = [number for number, _, _ in found]
    expected = [n for n in range(1, len(titles) + 1) if n not in omittable or n in numbers]
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
        if not re.search(rf"^- (?:\*\*\[[^\]]+\]\*\* )?\*\*{label}\b", content, re.M)  # etiqueta opcional (ADR-023)
    ]

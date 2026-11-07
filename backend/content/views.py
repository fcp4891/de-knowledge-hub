"""Vistas estructuradas de una ficha (ADR-030).

`views` en el frontmatter guarda los datos de cada vista; el cuerpo Markdown marca dónde va con
`<!-- view: clave -->`. Una vista nunca se activa detectando textos o encabezados: solo por su clave.
"""

from __future__ import annotations

import re
from typing import Any

MARKER = re.compile(r"<!--\s*view:\s*([a-z_]+)\s*-->")
MARKED = ("central_idea", "vigencia_timeline", "practice_lanes", "severity_cards")   # van donde está la marca
PLACED = ("approach", "sources_grouped")   # posición fija: tras el Resumen; en Fuentes


def markers(body: str) -> list[str]:
    """Claves marcadas en el cuerpo, en orden."""
    return MARKER.findall(body)


def check(views: dict[str, Any], body: str, cited_urls: list[str]) -> list[str]:
    """Errores de coherencia entre `views`, las marcas del cuerpo y las citas de `sources`."""
    found = markers(body)
    errors = [f"[views] marca '{key}' sin datos en views" for key in found if key not in views]
    errors += [f"[views] marca '{key}' repetida" for key in sorted(set(found)) if found.count(key) > 1]
    errors += [f"[views] '{key}' no se marca en el cuerpo con <!-- view: {key} -->" for key in MARKED
               if key in views and key not in found]
    errors += [f"[views] '{key}' no lleva marca: su posición es fija" for key in PLACED if key in found]
    return errors + check_sources_grouped(views.get("sources_grouped"), cited_urls)


def check_sources_grouped(grouped: dict[str, Any] | None, cited_urls: list[str]) -> list[str]:
    """Cada URL agrupada es una cita de sources y cada cita aparece una sola vez en los grupos."""
    if grouped is None:
        return []
    listed = [url for group in grouped["groups"] for source in group["sources"] for url in source["urls"]]
    errors = [f"[views.sources_grouped] '{url}' no es una cita de sources" for url in listed if url not in cited_urls]
    errors += [f"[views.sources_grouped] '{url}' está en más de un grupo o entrada"
               for url in sorted(set(listed)) if listed.count(url) > 1]
    errors += [f"[views.sources_grouped] la cita '{url}' no está en ningún grupo" for url in cited_urls if url not in listed]
    return errors

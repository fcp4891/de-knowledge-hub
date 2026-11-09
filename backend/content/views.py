"""Vistas estructuradas de una ficha (ADR-030).

`views` en el frontmatter guarda los datos de cada vista; el cuerpo Markdown marca dónde va con
`<!-- view: clave -->`. Una vista nunca se activa detectando textos o encabezados: solo por su clave.
"""

from __future__ import annotations

import re
from typing import Any

MARKER = re.compile(r"<!--\s*view:\s*([a-z_]+)\s*-->")
MARKED = (   # van donde está la marca
    "central_idea", "vigencia_timeline", "treatment_map", "problem_journey", "design_board", "control_matrix",
    "when_to_use", "requirement_to_data", "control_evidence", "code_guide", "cloud_compare", "practice_lanes",
    "severity_cards",
)
PLACED = ("approach", "legal_foundations", "sources_grouped")   # fija: tras el Resumen; en el §2; en Fuentes
MD_LINK = re.compile(r"\]\((https://[^)\s]+)\)")


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
    errors += check_sources_grouped(views.get("sources_grouped"), cited_urls)
    return errors + [f"[views] el enlace '{url}' no es una cita de sources" for url in sorted(set(hrefs(views)))
                     if url not in cited_urls]


def hrefs(node: Any) -> list[str]:
    """Todos los enlaces https de las vistas: campos href y enlaces Markdown dentro de los textos."""
    if isinstance(node, dict):
        found = [node["href"]] if isinstance(node.get("href"), str) else []
        return found + [url for key, value in node.items() if key != "href" for url in hrefs(value)]
    if isinstance(node, list):
        return [url for value in node for url in hrefs(value)]
    if isinstance(node, str):
        return MD_LINK.findall(node)
    return []


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

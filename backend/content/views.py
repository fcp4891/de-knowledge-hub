"""Vistas estructuradas de una ficha (ADR-030).

`views` en el frontmatter guarda los datos de cada vista; el cuerpo Markdown marca dónde va con
`<!-- view: clave -->`. Una vista nunca se activa detectando textos o encabezados: solo por su clave.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

MARKER = re.compile(r"<!--\s*view:\s*([a-z_]+)(?:\s+([a-z0-9-]+))?\s*-->")
MARKED = (   # van donde está la marca
    "central_idea", "vigencia_timeline", "treatment_map", "problem_journey", "design_board", "control_matrix",
    "when_to_use", "requirement_to_data", "control_evidence", "code_guide", "cloud_compare", "practice_lanes",
    "trade_offs", "severity_cards", "open_questions",
    # enmienda 5 (pii-identification)
    "catalog_fields", "concept_map", "decision_tree", "coverage_strip", "column_types", "evidence_steps", "use_avoid",
    "practice_pairs",
)
# Enmienda 5: varias instancias por ficha; la marca lleva el id («<!-- view: note catalogo -->» -> views.notes.catalogo).
KEYED = {"note": "notes", "chips": "chips"}
PLACED = ("approach", "legal_foundations", "sources_grouped", "section_titles")   # fija: tras el Resumen; en el §2; en Fuentes; títulos
MD_LINK = re.compile(r"\]\((https://[^)\s]+)\)")
MD_ANCHOR = re.compile(r"\]\((#[a-z0-9-]+)\)")   # enmienda 5: «[§](#s10)» es una referencia a otra sección
ARTICLE_LINK = re.compile(r"\[\(?art\. (\d+(?: (?:bis|ter|quáter|quinquies|sexies|septies))?)[^\]]*\]\(https://")


def markers(body: str) -> list[str]:
    """Claves marcadas en el cuerpo, en orden; una marca con id se devuelve como «clave id»."""
    return [f"{key} {item}" if item else key for key, item in MARKER.findall(body)]


def check_keyed(views: dict[str, Any], found: list[str]) -> list[str]:
    """Enmienda 5: cada marca «note <id>» o «chips <id>» tiene su entrada, y cada entrada se marca una vez."""
    errors = []
    for marker, field in KEYED.items():
        used = [m.split(" ", 1)[1] for m in found if m.startswith(f"{marker} ")]
        declared = views.get(field, {})
        errors += [f"[views] marca '{marker} {item}' sin datos en views.{field}" for item in used if item not in declared]
        errors += [f"[views] views.{field}.{item} no se marca con <!-- view: {marker} {item} -->" for item in declared
                   if item not in used]
    return errors


def check(views: dict[str, Any], body: str, cited_urls: list[str], anchors: set[str] | None = None) -> list[str]:
    """Errores de coherencia entre `views`, las marcas del cuerpo, las citas de `sources` y las anclas de la ficha."""
    found = markers(body)
    plain = [key for key in found if " " not in key]
    errors = [f"[views] marca '{key}' sin datos en views" for key in plain if key not in views]
    errors += [f"[views] marca '{key}' repetida" for key in sorted(set(found)) if found.count(key) > 1]
    errors += [f"[views] marca '{key}' desconocida" for key in found if " " in key and key.split(" ")[0] not in KEYED]
    errors += check_keyed(views, found)
    errors += [f"[views] '{key}' no se marca en el cuerpo con <!-- view: {key} -->" for key in MARKED
               if key in views and key not in found]
    errors += [f"[views] '{key}' no lleva marca: su posición es fija" for key in PLACED if key in found]
    errors += check_sources_grouped(views.get("sources_grouped"), cited_urls)
    links = sorted(set(hrefs(views)))
    errors += [f"[views] el enlace '{url}' no es una cita de sources" for url in links
               if url.startswith("https://") and url not in cited_urls]
    if anchors is not None:
        errors += [f"[views] el ancla '{url}' no existe en la ficha" for url in links
                   if url.startswith("#") and url[1:] not in anchors]
    return errors


def element_ids(node: Any) -> set[str]:
    """Ids que las vistas ponen en filas, tarjetas y reglas (destinos de anclas, ADR-030 enmienda 2)."""
    if isinstance(node, dict):
        own = {node["id"]} if isinstance(node.get("id"), str) else set()
        return own.union(*(element_ids(value) for value in node.values()))
    if isinstance(node, list):
        return set().union(*(element_ids(value) for value in node))
    return set()


def legal_row_id(law: str, article: str) -> str:
    """Igual que legalRowId del frontend: lb-<ley>-<artículo en slug>."""
    plain = unicodedata.normalize("NFD", article).encode("ascii", "ignore").decode().lower()
    return f"lb-{law}-" + re.sub(r"[^a-z0-9]+", "-", plain).strip("-")


def page_anchors(views: dict[str, Any], sections: list[int], legal_basis: list[dict[str, Any]]) -> set[str]:
    """Anclas que existen en la ficha: secciones presentes, ids de las vistas y filas del catálogo legal."""
    ids = {f"s{number}" for number in sections} | element_ids(views)
    return ids | {legal_row_id(b["law"], str(b["article"])) for b in legal_basis}


def hrefs(node: Any) -> list[str]:
    """Todos los enlaces https de las vistas: campos href y enlaces Markdown dentro de los textos."""
    if isinstance(node, dict):
        found = [node["href"]] if isinstance(node.get("href"), str) else []
        return found + [url for key, value in node.items() if key != "href" for url in hrefs(value)]
    if isinstance(node, list):
        return [url for value in node for url in hrefs(value)]
    if isinstance(node, str):
        return MD_LINK.findall(node) + MD_ANCHOR.findall(node)
    return []


INTERNAL_PATH = re.compile(r"^/concepts/([a-z0-9-]+)/")
INTERNAL_LINK = re.compile(r"\]\(/concepts/([a-z0-9-]+)/")


def internal_targets(node: Any) -> list[str]:
    """Enmienda 5: fichas que las vistas enlazan (href /concepts/<slug>/, enlaces Markdown y entradas page)."""
    if isinstance(node, dict):
        own = [m.group(1) for m in [INTERNAL_PATH.match(node["href"])] if m] if isinstance(node.get("href"), str) else []
        own += [node["page"]] if isinstance(node.get("page"), str) else []
        return own + [slug for key, value in node.items() if key not in ("href", "page") for slug in internal_targets(value)]
    if isinstance(node, list):
        return [slug for value in node for slug in internal_targets(value)]
    if isinstance(node, str):
        return INTERNAL_LINK.findall(node)
    return []


def cited_articles(node: Any) -> set[str]:
    """ADR-023, enmienda 9: artículos que las vistas citan con enlace («[(art. 2 letra f)](https://…)» -> «2»)."""
    if isinstance(node, dict):
        return set().union(*(cited_articles(value) for value in node.values()))
    if isinstance(node, list):
        return set().union(*(cited_articles(value) for value in node))
    if isinstance(node, str):
        return set(ARTICLE_LINK.findall(node))
    return set()


def check_sources_grouped(grouped: dict[str, Any] | None, cited_urls: list[str]) -> list[str]:
    """Cada URL agrupada es una cita de sources y cada cita aparece una sola vez en los grupos."""
    if grouped is None:
        return []
    listed = [url for group in grouped["groups"] for source in group["sources"] for url in source.get("urls", [])]
    errors = [f"[views.sources_grouped] '{url}' no es una cita de sources" for url in listed if url not in cited_urls]
    errors += [f"[views.sources_grouped] '{url}' está en más de un grupo o entrada"
               for url in sorted(set(listed)) if listed.count(url) > 1]
    errors += [f"[views.sources_grouped] la cita '{url}' no está en ningún grupo" for url in cited_urls if url not in listed]
    return errors

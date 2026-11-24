"""ADR-030, enmienda 12: zoom de arquitectura del Inventario y de pii-identification."""

from __future__ import annotations

import copy
import re
import unicodedata
from pathlib import Path
from typing import Any

import pytest
import yaml

from backend.content import views as page_views

ROOT = Path(__file__).resolve().parents[1]
CONCEPTS = ROOT / "content" / "concepts"

# Microcopy de interfaz de la referencia aprobada por el dueño: no viene del texto de la ficha.
MICROCOPY = {
    "Zoom", "← Volver a la vista general", "Un registro, varios usos", "De la columna a la etiqueta", "versionado", "Escriben",
    "Qué datos", "Por qué", "Hacia dónde", "Cuánto y quién", "el código lo consulta",
    "Detectar · reunir evidencia", "Decidir · qué sigue", "Habilitar · quién pasa", "No bloquea la puerta",
}
# Rótulos «Zoom · <título>»: «Zoom» es microcopy; el resto es un título de la ficha.
KICKER = re.compile(r"^Zoom · (.+)$")


def frontmatter(slug: str) -> tuple[dict[str, Any], str]:
    text = (CONCEPTS / f"{slug}.md").read_text(encoding="utf-8")
    _, head, body = text.split("---\n", 2)
    return yaml.safe_load(head), text


def norm(text: str) -> str:
    plain = unicodedata.normalize("NFC", re.sub(r"\*\*|`", "", text))
    return re.sub(r"\s+", " ", plain).strip().lower()


def zoom_strings(zoom: dict[str, Any]) -> list[str]:
    """Cadenas visibles del zoom que no salen de la madre ni son números de tarjeta, íconos, tonos o ids."""
    skip = {"icon", "tone", "layout", "number", "gate", "href", "concept", "lane", "items_from", "field", "fields", "highlight"}

    def walk(node: Any, key: str = "") -> list[str]:
        if key in skip or key == "fragment":
            return []
        if isinstance(node, dict):
            return [s for k, v in node.items() for s in walk(v, k)]
        if isinstance(node, list):
            return [s for v in node for s in walk(v, key)]
        return [node] if isinstance(node, str) else []

    return walk(zoom)


@pytest.fixture(scope="module")
def mother() -> dict[str, Any]:
    return frontmatter("chile-data-protection")[0]["views"]


@pytest.mark.parametrize("slug", ["processing-activities-inventory", "pii-identification"])
def test_zoom_validates_against_the_mother(slug: str, mother: dict[str, Any]) -> None:
    data, _ = frontmatter(slug)
    assert page_views.check_zoom(data["views"], mother) == []


@pytest.mark.parametrize("slug", ["processing-activities-inventory", "pii-identification"])
def test_every_zoom_string_is_textual_from_the_ficha_or_microcopy(slug: str) -> None:
    data, text = frontmatter(slug)
    zoom = data["views"]["architecture_zoom"]
    start = text.index("\n  architecture_zoom:\n")
    end = re.search(r"\n  [a-z_]+:\n", text[start + 1:])
    rest = norm(text[:start] + text[start + 1 + (end.start() if end else len(text)):])
    missing = []
    for string in zoom_strings(zoom):
        kicker = KICKER.match(string)
        target = kicker.group(1) if kicker else string
        if target in MICROCOPY or norm(target).rstrip(".") in rest:
            continue
        missing.append(string)
    assert missing == []


def test_inventory_register_has_the_13_fields_once_and_four_uses() -> None:
    data, _ = frontmatter("processing-activities-inventory")
    views = data["views"]
    register = views["architecture_zoom"]["register"]
    used = [register["scope"]["field"]] + [f for group in register["groups"] for f in group["fields"]]
    declared = [field["id"] for field in views["register_fields"]["fields"]]
    assert len(declared) == 13
    assert sorted(used) == sorted(declared)
    assert [use["code"] for use in register["uses"]] == ["verificar_despliegues", "conciliar", "actividades_incompletas", "insumo_14_ter"]
    assert "requirement_to_data" not in views   # el §9 se reemplazó: ya no copia el diagrama de la madre


def test_inventory_result_chips_come_from_que_hace() -> None:
    data, _ = frontmatter("processing-activities-inventory")
    guide = data["views"]["code_guide"]
    que_hace = norm(" ".join([guide["lead"]["text"], *guide.get("lead_more", [])]))
    chips = [use["result"]["text"] for use in data["views"]["architecture_zoom"]["register"]["uses"] if "result" in use]
    assert chips and all(norm(chip) in que_hace for chip in chips)


def test_pii_has_architecture_between_when_to_use_and_code() -> None:
    data, text = frontmatter("pii-identification")
    sections = [int(n) for n in re.findall(r"^## (\d+)\. ", text, re.M)]
    assert sections.index(9) == sections.index(5) + 1 and sections.index(10) == sections.index(9) + 1
    assert {"section": 9, "title": "Arquitectura"} in data["views"]["section_titles"]
    assert "<!-- view: control_evidence -->" in text   # «Detección y habilitación» se conserva en §10


@pytest.mark.parametrize(
    ("change", "error"),
    [
        (lambda z, v: z["fragment"]["items"].append("Platino"), "'Platino' no está en la franja"),
        (lambda z, v: z["fragment"].update(items=["Registro de actividades de tratamiento", "Legal y negocio"]), "no sigue el orden"),
        (lambda z, v: z["fragment"].update(highlight=["Gold"]), "highlight 'Gold' no está"),
        (lambda z, v: z["register"]["groups"][0]["fields"].append("fuente"), "campo 'fuente' repetido"),
        (lambda z, v: z["register"]["groups"][0]["fields"].pop(), "falta el campo 'titulares'"),
    ],
)
def test_check_zoom_rejects_inconsistent_fragments(change: Any, error: str, mother: dict[str, Any]) -> None:
    data, _ = frontmatter("processing-activities-inventory")
    views = copy.deepcopy(data["views"])
    change(views["architecture_zoom"], views)
    assert any(error in message for message in page_views.check_zoom(views, mother))


def test_check_zoom_requires_requirement_to_data_in_the_origin() -> None:
    data, _ = frontmatter("pii-identification")
    assert page_views.check_zoom(data["views"], {})[0].endswith("no tiene requirement_to_data")

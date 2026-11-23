"""La vigencia de chile-data-protection no se desfasa del marco legal verificado (ADR-027).

content/legal-frameworks/cl-ley-21719.yaml es el dato que lee la UI; la ficha padre lo cuenta en una frase y en la línea
de vigencia (views.vigencia_timeline, ADR-030). Desde la Ley 21.855 (publicada el 2026-11-23) la vigencia es el
2027-10-15. El test falla si difieren la fecha de vigencia, la fecha de publicación de la ley que la fija o la fecha de
consulta, si queda un hito «proposed» o si la cita de esa ley en la ficha se consultó otro día.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
FICHA = ROOT / "content" / "concepts" / "chile-data-protection.md"
FRAMEWORK = ROOT / "content" / "legal-frameworks" / "cl-ley-21719.yaml"


def facts() -> dict[str, dict[str, Any]]:
    data = yaml.safe_load(FRAMEWORK.read_text(encoding="utf-8"))
    return {f["key"]: f for f in data["facts"]}


def ficha() -> tuple[dict[str, Any], str]:
    _, frontmatter, body = FICHA.read_text(encoding="utf-8").split("---\n", 2)
    return yaml.safe_load(frontmatter), body


MONTHS = {"10": "octubre", "11": "noviembre", "12": "diciembre"}


def long_date(iso: str) -> str:
    year, month, day = iso.split("-")
    return f"{int(day)} de {MONTHS[month]} de {year}"


def timeline() -> dict[str, Any]:
    data, _ = ficha()
    return dict(data["views"]["vigencia_timeline"])


def test_effective_date_matches_the_framework() -> None:
    """La frase del Contexto normativo y el hito vigente de la línea (ADR-030) dicen la fecha del marco legal."""
    _, body = ficha()
    expected = str(facts()["effective-date"]["value"])
    assert f"rigen desde el {long_date(expected)}" in body
    current = [item for item in timeline()["items"] if item["state"] == "current"]
    assert [str(item["date"]) for item in current] == [expected]


PUBLICADA = re.compile(r"publicada el (\d{4}-\d{2}-\d{2})")


def test_amending_law_matches_the_framework() -> None:
    """El hito de la ley que fija la vigencia (el que enlaza su ficha en BCN) lleva su fecha de publicación, nunca posterior
    a la verificación; «as_of» lleva la fecha de consulta; ya no hay fechas propuestas, y la fecha original (2026-12-01)
    solo aparece como sustituida."""
    ley = facts()["amending-law"]
    view = timeline()
    hito = [item for item in view["items"] if any(link["href"] == ley["url"] for link in item.get("links", []))]
    publicada = PUBLICADA.search(str(ley["value"]))
    assert publicada is not None
    assert [str(item["date"]) for item in hito] == [publicada.group(1)]
    assert publicada.group(1) <= str(ley["verified_at"])
    assert long_date(str(ley["verified_at"])) in view["as_of"]
    assert "«15 de octubre de 2027»" in facts()["effective-date"]["note"]
    assert [i for i in view["items"] if i["state"] == "proposed"] == []
    assert "2026-12-01" not in [str(i["date"]) for i in view["items"]]
    assert "sustituida por la Ley 21.855" in hito[0]["detail"]


def test_amending_law_citation_was_read_the_day_of_the_framework() -> None:
    data, _ = ficha()
    ley = facts()["amending-law"]
    accessed = [str(s["accessed"]) for s in data["sources"] if s.get("url") == ley["url"]]
    assert accessed == [str(ley["verified_at"])]

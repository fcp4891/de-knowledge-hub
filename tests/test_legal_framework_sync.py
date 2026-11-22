"""La vigencia de chile-data-protection no se desfasa del marco legal verificado (ADR-027).

content/legal-frameworks/cl-ley-21719.yaml es el dato que lee la UI; la ficha padre lo cuenta en una frase y en la línea
de vigencia (views.vigencia_timeline, ADR-030). El test falla si difieren la fecha de vigencia, la fecha del despacho al
Presidente, la fecha del estado del proyecto de postergación o la fecha despachada, o si la cita del Senado en la ficha se
consultó otro día.
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


DISPATCHED = re.compile(r"Despachado al Presidente de la República el (\d{4}-\d{2}-\d{2})")


def test_postponement_state_matches_the_framework() -> None:
    """El hito del Senado (el que enlaza la tramitación) lleva la fecha del hecho que muestra la tarjeta (el despacho al
    Presidente), nunca posterior a la verificación; el estado de la línea («as_of») lleva la fecha de consulta. La fecha
    propuesta es la del texto despachado al Presidente (oficio 378-26), no la del mensaje."""
    bill = facts()["postponement-bill"]
    view = timeline()
    senate = [item for item in view["items"] if any(link["href"] == bill["url"] for link in item.get("links", []))]
    dispatched = DISPATCHED.search(str(bill["value"]))
    assert dispatched is not None
    assert [str(item["date"]) for item in senate] == [dispatched.group(1)]
    assert dispatched.group(1) <= str(bill["verified_at"])
    assert long_date(dispatched.group(1)) in senate[0]["detail"]
    assert long_date(str(bill["verified_at"])) in view["as_of"]
    assert "«15 de octubre de 2027»" in bill["note"]
    assert [str(i["date"]) for i in view["items"] if i["state"] == "proposed"] == ["2027-10-15"]


def test_senate_citation_was_read_the_day_of_the_framework() -> None:
    data, _ = ficha()
    bill = facts()["postponement-bill"]
    accessed = [str(s["accessed"]) for s in data["sources"] if s.get("url") == bill["url"]]
    assert accessed == [str(bill["verified_at"])]

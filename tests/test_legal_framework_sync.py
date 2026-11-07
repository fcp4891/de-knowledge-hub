"""La vigencia de chile-data-protection no se desfasa del marco legal verificado (ADR-027).

content/legal-frameworks/cl-ley-21719.yaml es el dato que lee la UI; la ficha padre lo cuenta en una frase y en la línea
de vigencia (views.vigencia_timeline, ADR-030). El test falla si difieren la fecha de vigencia, la fecha del estado del
proyecto de postergación o la fecha propuesta, o si la cita del Senado en la ficha se consultó otro día.
"""

from __future__ import annotations

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


MONTHS = {"12": "diciembre"}


def timeline() -> dict[str, Any]:
    data, _ = ficha()
    return dict(data["views"]["vigencia_timeline"])


def test_effective_date_matches_the_framework() -> None:
    """La frase del Contexto normativo y el hito vigente de la línea (ADR-030) dicen la fecha del marco legal."""
    _, body = ficha()
    expected = str(facts()["effective-date"]["value"])
    year, month, day = expected.split("-")
    assert f"rigen desde el {int(day)} de {MONTHS[month]} de {year}" in body
    current = [item for item in timeline()["items"] if item["state"] == "current"]
    assert [str(item["date"]) for item in current] == [expected]


def test_postponement_state_matches_the_framework() -> None:
    """El hito del Senado y «Estado al …» usan la fecha verificada del proyecto; la fecha propuesta es la del mensaje."""
    bill = facts()["postponement-bill"]
    view = timeline()
    senate = [item for item in view["items"] if "18.623-07" in item["title"]]
    assert [str(item["date"]) for item in senate] == [str(bill["verified_at"])]
    assert view["as_of"].startswith(f"Estado al {bill['verified_at']}")
    assert "«1 de diciembre de 2027»" in bill["note"]
    assert [str(i["date"]) for i in view["items"] if i["state"] == "proposed"] == ["2027-12-01"]
    assert {link["href"] for item in senate for link in item.get("links", [])} >= {bill["url"]}


def test_senate_citation_was_read_the_day_of_the_framework() -> None:
    data, _ = ficha()
    bill = facts()["postponement-bill"]
    accessed = [str(s["accessed"]) for s in data["sources"] if s.get("url") == bill["url"]]
    assert accessed == [str(bill["verified_at"])]

"""La vigencia de chile-data-protection no se desfasa del marco legal verificado (ADR-027).

content/legal-frameworks/cl-ley-21719.yaml es el dato que lee la UI; la ficha padre lo cuenta en prosa. El test falla
si difieren la fecha de vigencia, la fecha del estado del proyecto de postergación o los términos citados entre «»
de ese estado, o si la cita del Senado en la ficha se consultó otro día.
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


def test_effective_date_matches_the_framework() -> None:
    _, body = ficha()
    expected = facts()["effective-date"]["value"]
    assert f"rigen desde el **{expected}**" in body
    assert f"mientras no se publique otra ley, rige el {expected}" in body


def test_postponement_state_matches_the_framework() -> None:
    _, body = ficha()
    bill = facts()["postponement-bill"]
    match = re.search(r"\*\*Estado al (\d{4}-\d{2}-\d{2})\.\*\*([^\n]*)", body)
    assert match, "la ficha no tiene el párrafo «Estado al …»"
    assert match.group(1) == str(bill["verified_at"]), "la fecha del estado difiere del marco legal"
    for quoted in re.findall(r"«([^»]+)»", bill["value"]):
        assert f"«{quoted}»" in match.group(2), f"el estado de la ficha no dice «{quoted}»"


def test_senate_citation_was_read_the_day_of_the_framework() -> None:
    data, _ = ficha()
    bill = facts()["postponement-bill"]
    accessed = [str(s["accessed"]) for s in data["sources"] if s.get("url") == bill["url"]]
    assert accessed == [str(bill["verified_at"])]

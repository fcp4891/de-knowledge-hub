"""processing-activities-inventory (ADR-030, enmienda 9): los datos de ejemplo salen de su inventario.py.

- El frontmatter coincide con lo que genera scripts/generators/inventory_views.py; si el código cambia y nadie vuelve a
  generar, el test falla.
- «Campos del registro»: 13 campos, 11 con fuente en la norma y 3 con propuesta, y la hoja del documento muestra los
  mismos campos que la tabla (paridad tabla ↔ hoja) en los 3 casos × 2 estados.
- «9 controles · 14 hallazgos»: las filas y la suma de ×N coinciden con las líneas BRECHA/UNKNOWN de la salida
  documentada de `actual`, y cada corrección de `corregido` responde a un hallazgo real.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import pytest
import yaml

from scripts.generators import inventory_views
from tests.test_docker_snippets import blocks

FICHA = "processing-activities-inventory"


@pytest.fixture(scope="module")
def text() -> str:
    return inventory_views.FICHA.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def views(text: str) -> dict[str, Any]:
    return yaml.safe_load(text.split("---\n", 2)[1])["views"]


def actual_findings() -> list[str]:
    (actual,) = [b for b in blocks(FICHA, "text") if b.startswith("$ python inventario.py actual\n")]
    return [line for line in actual.splitlines() if re.match(r"^(BRECHA|UNKNOWN) ", line)]


def test_generated_data_matches_the_code(text: str) -> None:
    assert inventory_views.generate(text) == text, "corre python -m scripts.generators.inventory_views"
    assert inventory_views.main(["--check"]) == 0


def test_check_fails_when_the_code_changes(text: str, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    changed = text.replace('"venta_pasajes", "emitir y gestionar pasajes", "contrato", 60,',
                           '"venta_pasajes", "emitir y gestionar pasajes", "contrato", 36,', 1)
    assert changed != text
    ficha = tmp_path / "ficha.md"
    ficha.write_text(changed, encoding="utf-8")
    monkeypatch.setattr(inventory_views, "FICHA", ficha)
    assert inventory_views.main(["--check"]) == 1


def test_register_fields_rows_eyes_and_bulbs(views: dict[str, Any]) -> None:
    fields = views["register_fields"]["fields"]
    assert len(fields) == 13
    norm = [f for f in fields if f.get("law_letter") or f.get("decree")]
    bulbs = [f["name"] for f in fields if f.get("proposal")]
    assert len(norm) == 11
    assert bulbs == ["Categorías de bases de datos", "Activos y consumidores", "Aprobación y versión"]
    assert [f.get("decree") for f in fields[:11]] == ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi"]
    assert all(not (f.get("law_letter") or f.get("decree")) for f in fields[11:])   # las dos propias, solo bombilla
    literal = views["register_fields"]["literal"]
    assert {f["law_letter"] for f in fields if f.get("law_letter")} <= set(literal["law"])
    assert {f["decree"] for f in fields if f.get("decree")} == set(literal["decree"])


def test_table_and_sheet_show_the_same_fields(views: dict[str, Any]) -> None:
    rf = views["register_fields"]
    keys = {f["key"] for f in rf["fields"]}
    in_sheet = {f["id"] for f in rf["fields"] if f["sheet_section"] in rf["sheet"]["sections"]}
    header = [f for f in rf["fields"] if f["sheet_section"] not in rf["sheet"]["sections"]]
    assert [f["key"] for f in header] == ["ambito"]   # el ámbito va en el encabezado de la hoja
    combos = [(case["key"], state) for case in rf["cases"] for state in case["states"]]
    assert len(combos) == 6
    for case in rf["cases"]:
        for state, data in case["states"].items():
            assert set(data["values"]) == keys == set(data["status"]), (case["key"], state)
            shown = {row["field"] for section in data["sheet"]["sections"] for row in section["rows"]}
            assert shown == in_sheet, (case["key"], state)
            assert (data["sheet"]["territory"] is None) == (data["values"]["ambito"] is None)


def test_no_unevaluated_value_counts_as_ok(views: dict[str, Any]) -> None:
    for case in views["register_fields"]["cases"]:
        for data in case["states"].values():
            assert all(data["status"][key] != "ok" for key, value in data["values"].items() if value is None)


def test_controls_summary_matches_the_actual_output(views: dict[str, Any]) -> None:
    rules = views["code_guide"]["rules"]
    findings = actual_findings()
    assert len(rules["items"]) == 9 and sum(item["count"] for item in rules["items"]) == len(findings) == 14
    assert rules["summary"].format(rows=len(rules["items"]), total=len(findings)) == "9 controles · 14 hallazgos"


def test_each_fix_answers_a_real_finding(views: dict[str, Any]) -> None:
    (corregido,) = [s for s in views["code_guide"]["scenarios"]["items"] if s["name"] == "corregido"]
    details = [line.split(" ", 1)[1] for line in actual_findings()]
    assert len(corregido["fixes"]) == len(details)
    for fix, detail in zip(corregido["fixes"], details, strict=True):
        assert detail.startswith(fix["finding"]), (fix["finding"], detail)


def test_exit_codes_match_the_documented_runs(views: dict[str, Any]) -> None:
    codes = {s["name"]: s["exit_code"] for s in views["code_guide"]["scenarios"]["items"]}
    assert codes == {"actual": 1, "corregido": 0, "despliegue-nuevo": 1}


def test_explorer_activities_come_from_actual(views: dict[str, Any]) -> None:
    by_key = {a["key"]: a for a in views["activity_explorer"]["activities"]}
    assert list(by_key) == ["venta_pasajes", "marketing", "modelo_fraude"]
    assert by_key["venta_pasajes"]["gaps"] == [] and by_key["venta_pasajes"]["evidence_ok"] is True
    assert len(by_key["marketing"]["gaps"]) == 7
    assert {r["column"]: r["state"] for r in by_key["marketing"]["read"]} == {"correo": "needed", "rut": "extra"}
    assert by_key["modelo_fraude"]["gaps"] == ["sin aprobación vigente: job_fraude → silver.pasajeros (modelo_fraude)"]
    assert {r["state"] for r in by_key["modelo_fraude"]["read"]} == {"unevaluated"}   # sin campos evaluados nunca es OK


def test_ladder_names_the_real_fields(views: dict[str, Any]) -> None:
    """Coherencia: cada campo en negrita de «El registro» en la escalera es una fila de «Campos del registro»."""
    names = {f["name"] for f in views["register_fields"]["fields"]}
    named = {b for row in views["law_ladder"]["rows"] for b in re.findall(r"\*\*([^*]+)\*\*", row["record"])}
    assert named and named <= names, named - names


def test_law_split_has_two_numbered_subsections(text: str, views: dict[str, Any]) -> None:
    """§2 «Qué exige la ley»: 2.1 y 2.2 son los dos ### de la división, en este orden; anclas #ley-1 y #ley-2."""
    (split,) = views["section_splits"]
    assert (split["key"], split.get("subsections")) == ("ley", True)
    part = text.split("<!-- split: ley -->", 1)[1].split("\n## 2.", 1)[0]
    assert re.findall(r"^### (.+)$", part, re.M) == ["Cinco preguntas que la ley obliga a poder responder",
                                                       "Campos del registro y de dónde viene cada uno"]
    assert part.index("Campos del registro") < part.index("<!-- view: register_fields -->")

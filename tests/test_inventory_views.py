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


# Los 9 controles del código (los que listaba la tabla retirada de §8) y cómo los nombra cada línea de la salida.
CONTROLS = {
    "tablas con PII sin actividad": r"^BRECHA tabla con PII sin actividad: ",
    "registro sin ámbito territorial": r"^BRECHA registro sin ámbito territorial$",
    "actividad aprobada incompleta": r"^BRECHA [a-z_]+: (sin plazo|aprobación vencida|base consentimiento sin registro|"
                                     r"transferencias internacionales sin evaluar|decisiones automatizadas sin evaluar)",
    "datos sensibles con otra base (revisión)": r"^BRECHA revisión: datos sensibles con base ",
    "interés legítimo sin justificación": r"^BRECHA [a-z_]+: interés legítimo sin justificación$",
    "uso sin aprobación vigente": r"^BRECHA sin aprobación vigente: ",
    "uso sin vínculo": r"^BRECHA sin vínculo: ",
    "proporcionalidad": r"^BRECHA proporcionalidad: ",
    "consumidor no identificado": r"^UNKNOWN consumidor no identificado: ",
}


def documented(scenario: str) -> str:
    (block,) = [b for b in blocks(FICHA, "text") if b.startswith(f"$ python inventario.py {scenario}\n")]
    return block


def test_controls_summary_matches_the_actual_output(text: str) -> None:
    """«9 controles · 14 hallazgos», ahora contra la «Salida» de actual que muestra la página (la tabla se retiró):
    cada línea BRECHA/UNKNOWN cae en exactamente uno de los 9 controles, aparecen los 9, y el total coincide con la
    línea de resumen de esa salida y con lo que calcula el código."""
    findings = actual_findings()
    per_control = {name: [f for f in findings if re.search(rx, f)] for name, rx in CONTROLS.items()}
    assert all(sum(bool(re.search(rx, f)) for rx in CONTROLS.values()) == 1 for f in findings), findings
    assert all(per_control.values()), [name for name, hits in per_control.items() if not hits]
    summary = re.search(r"^conciliación: alerta \(1\): (\d+) hallazgo\(s\) en lo que ya corre$", documented("actual"), re.M)
    assert summary and int(summary.group(1)) == len(findings)
    m = inventory_views.load_module(inventory_views.python_block(text))
    registro, usos, _ = m.escenario("actual")
    computed = (m.tablas_sin_actividad(registro) + m.actividades_incompletas(registro, m.REFERENCIA)
                + m.conciliar(registro, usos, m.REFERENCIA))
    assert [f"{h.estado} {h.detalle}" for h in computed] == findings
    assert f"{len(CONTROLS)} controles · {len(findings)} hallazgos" == "9 controles · 14 hallazgos"


def test_corregido_resolves_every_finding() -> None:
    """Sin «Escenarios», la «Salida» de corregido es la que muestra el arreglo: ningún hallazgo y cinco actividades en el insumo."""
    salida = documented("corregido")
    assert not re.search(r"^(BRECHA|UNKNOWN) ", salida, re.M)
    assert salida.rstrip().endswith("conciliación: sin hallazgos (0)")
    assert len(re.findall(r"^- .+ · base: ", salida, re.M)) == 5


def test_exit_codes_match_the_documented_runs() -> None:
    """Los códigos de salida que muestra cada «Salida» (la línea final de cada ejecución documentada)."""
    endings = {name: documented(name).rstrip().splitlines()[-1] for name in ("actual", "corregido", "despliegue-nuevo")}
    codes = {name: int(re.search(r"\((\d)\)", line).group(1)) for name, line in endings.items()}
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


def test_cloud_footer_without_dates_but_sources_keep_them(views: dict[str, Any]) -> None:
    """«En la nube»: el pie del Inventario no lleva fechas (decisión del dueño); la verificación queda en Fuentes y en
    `accessed` de cada fuente cloud. pii mantiene la fecha en su pie."""
    note = views["notes"]["equivalencias"]
    assert (note["lead"], note["text"]) == ("No son equivalencias exactas.", "Ningún servicio certifica cumplimiento por sí solo.")
    titles = [g["title"] for g in views["sources_grouped"]["groups"]]
    assert "Servicios cloud · verificados el 2026-11-17" in titles
    pii = yaml.safe_load((inventory_views.ROOT / "content/concepts/pii-identification.md").read_text(encoding="utf-8").split("---\n", 2)[1])
    assert "Documentación consultada el 2026-11-12" in pii["views"]["notes"]["equivalencias"]["text"]

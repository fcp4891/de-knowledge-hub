"""processing-activities-inventory (ADR-030, enmienda 9): los datos de ejemplo salen de su inventario.py.

- El frontmatter coincide con lo que genera scripts/generators/inventory_views.py; si el código cambia y nadie vuelve a
  generar, el test falla.
- «Campos del registro»: 13 campos, 11 con fuente en la norma y 3 con propuesta, y la hoja del documento muestra los
  mismos campos que la tabla (paridad tabla ↔ hoja) en los 3 casos × 2 estados.
- Las líneas BRECHA/UNKNOWN de la salida documentada de `actual` caen cada una en un control y coinciden con lo que
  calcula el código; la salida de `corregido` no tiene hallazgos.
"""

from __future__ import annotations

import re
from dataclasses import replace
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


def test_unevaluated_sensitive_recipients_and_base_never_pass_as_ok(text: str) -> None:
    """None es sin evaluar en sensibles, destinatarios y base: brecha si la actividad está aprobada, `[sin evaluar]` en el
    insumo del art. 14 ter (nunca «ninguno» ni una actividad omitida) y estado pending en la tabla de campos."""
    m = inventory_views.load_module(inventory_views.python_block(text))
    registro, _, _ = m.escenario("corregido")
    (fraude,) = [a for a in registro.actividades if a.id == "modelo_fraude"]
    sin_evaluar = replace(registro, actividades=(replace(fraude, categorias_sensibles=None, destinatarios=None),))
    gaps = [h.detalle for h in m.actividades_incompletas(sin_evaluar, m.REFERENCIA)]
    assert {"modelo_fraude: datos sensibles sin evaluar", "modelo_fraude: destinatarios sin evaluar"} <= set(gaps)
    filas = m.insumo_14_ter(sin_evaluar, m.REFERENCIA)
    assert "  d) datos: identificación, pagos · sensibles: [sin evaluar]" in filas
    assert "  d) titulares: pasajeros, compradores · destinatarios: [sin evaluar]" in filas
    sin_base = replace(registro, actividades=(replace(fraude, base=None),))
    assert m.insumo_14_ter(sin_base, m.REFERENCIA)[0] == "- detectar operaciones sospechosas · base: [sin evaluar]"
    assert "modelo_fraude: aprobada sin base de licitud" in [h.detalle for h in m.actividades_incompletas(sin_base, m.REFERENCIA)]
    a = sin_evaluar.actividades[0]
    values = inventory_views.field_values(m, sin_evaluar, a)
    status = inventory_views.field_status(m, sin_evaluar, a, values)
    assert values["tipo"].endswith("sensibles: [sin evaluar]") and values["destinatarios"] is None
    assert (status["tipo"], status["destinatarios"]) == ("pending", "pending")


# Los controles del código (los que listaba la tabla retirada de §8) y cómo los nombra cada línea de la salida.
CONTROLS = {
    "tablas con PII sin actividad": r"^BRECHA tabla con PII sin actividad: ",
    "registro sin ámbito territorial": r"^BRECHA registro sin ámbito territorial$",
    "actividad aprobada incompleta": r"^BRECHA [a-z_]+: (sin plazo|aprobación vencida|base consentimiento sin registro|"
                                     r"transferencias internacionales sin evaluar|decisiones automatizadas sin evaluar)",
    "datos sensibles con otra base (revisión)": r"^BRECHA revisión: datos sensibles con base ",
    "interés legítimo sin justificación": r"^BRECHA [a-z_]+: interés legítimo sin justificación$",
    "uso sin aprobación vigente": r"^BRECHA sin aprobación vigente: ",
    "uso sin vínculo": r"^BRECHA sin vínculo: ",
    "proporcionalidad": r"^BRECHA (proporcionalidad: |[a-z_]+: campos permitidos: \[sin evaluar\]$)",
    "consumidor no identificado": r"^UNKNOWN consumidor no identificado: ",
}


def documented(scenario: str) -> str:
    (block,) = [b for b in blocks(FICHA, "text") if b.startswith(f"$ python inventario.py {scenario}\n")]
    return block


def test_controls_summary_matches_the_actual_output(text: str) -> None:
    """La «Salida» de actual que muestra la página: cada línea BRECHA/UNKNOWN cae en exactamente uno de los controles de
    CONTROLS, cada control aparece al menos una vez, y el total coincide con la línea de resumen de esa salida y con lo
    que calcula el código."""
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
    assert by_key["modelo_fraude"]["gaps"] == ["sin aprobación vigente: job_fraude → silver.pasajeros (modelo_fraude)",
                                               "modelo_fraude: campos permitidos: [sin evaluar]"]
    assert {r["state"] for r in by_key["modelo_fraude"]["read"]} == {"unevaluated"}   # sin campos evaluados nunca es OK


def test_ladder_names_the_real_fields(views: dict[str, Any]) -> None:
    """Coherencia: cada campo en negrita de «Registro del documento a proponer» en la escalera es una fila de «Campos del
    registro»."""
    names = {f["name"] for f in views["register_fields"]["fields"]}
    named = {b for row in views["law_ladder"]["rows"] for b in re.findall(r"\*\*([^*]+)\*\*", row["record"])}
    assert named and named <= names, named - names


def test_law_split_has_two_numbered_subsections(text: str, views: dict[str, Any]) -> None:
    """§2 «Qué exige la ley»: 2.1 y 2.2 son los dos ### de la división, en este orden; anclas #ley-1 y #ley-2."""
    (split,) = views["section_splits"]
    assert (split["key"], split.get("subsections")) == ("ley", True)
    part = text.split("<!-- split: ley -->", 1)[1].split("\n## 2.", 1)[0]
    assert re.findall(r"^### (.+)$", part, re.M) == ["Cinco preguntas que conviene poder responder",
                                                       "Campos del registro y de dónde viene cada uno"]
    assert part.index("Campos del registro") < part.index("<!-- view: register_fields -->")


def test_cloud_footer_without_dates_but_sources_keep_them(views: dict[str, Any]) -> None:
    """«En la nube»: el pie del Inventario no lleva fechas (decisión del dueño); la verificación queda en Fuentes y en
    `accessed` de cada fuente cloud. pii mantiene la fecha en su pie."""
    note = views["notes"]["equivalencias"]
    assert (note["lead"], note["text"]) == ("No son equivalencias exactas.", "Ningún servicio certifica cumplimiento por sí solo.")
    titles = [g["title"] for g in views["sources_grouped"]["groups"]]
    assert "Servicios cloud · verificados el 2026-11-18" in titles
    pii = yaml.safe_load((inventory_views.ROOT / "content/concepts/pii-identification.md").read_text(encoding="utf-8").split("---\n", 2)[1])
    assert "Documentación consultada el 2026-11-12" in pii["views"]["notes"]["equivalencias"]["text"]


def test_ladder_separates_paraphrase_from_interpretation_and_quotes_letter_k(views: dict[str, Any]) -> None:
    """Revisión independiente (I4, M4, M5, M6): la columna dice que es paráfrasis, la interpretación del plazo va aparte
    (enmienda 11), la letra k del art. 14 ter y la frase final del art. 3 d) del Decreto 662 van literales."""
    ladder = views["law_ladder"]
    assert ladder["headers"][1] == "Lo que se espera (paráfrasis)"
    interpretations = [row for row in ladder["rows"] if row.get("interpretation")]
    # La quinta fila lleva su marca (consecuencia, no obligación) por decisión del dueño (2026-11-18 y 2026-11-22).
    assert [row["principle"] for row in interpretations] == ["Proporcionalidad", "Consecuencia: infracción grave"]
    moved = "La ley no fija un plazo general: lo define el responsable según la finalidad."
    assert interpretations[0]["interpretation"] == f"**Interpretación de la ficha:** {moved}"
    assert all("plazo general" not in row["expected"] for row in ladder["rows"])
    letter_k = ("Cuando el tratamiento está basado en el consentimiento del titular, la existencia del derecho a retirarlo en "
                "cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada")
    (published,) = [row for row in ladder["rows"] if row["principle"] == "Información pública"]
    assert f"la letra k pide (texto literal): «{letter_k}»." in published["expected"]
    assert "«Esta caracterización podrá realizarse a través de un registro de actividades de tratamiento»." in views["notes"]["sin-formato"]["text"]
    assert views["register_fields"]["literal"]["decree_note"].endswith("(paráfrasis del art. 1).")


def test_fifth_row_is_a_consequence_not_an_obligation(views: dict[str, Any]) -> None:
    """2.1, quinta fila: lleva la marca «Consecuencia, no obligación» en la línea de interpretación (ADR-030, enmienda
    11) y su contenido legal no cambia: art. 34 ter, letras a y c, y la alerta que no presume infracción."""
    row = views["law_ladder"]["rows"][4]
    assert (row["question"], row["principle"], row.get("risk")) == (
        "¿Y si un uso no calza?", "Consecuencia: infracción grave", True)
    assert row["cites"] == ["[(art. 34 ter)](https://www.diariooficial.interior.gob.cl/publicaciones/2024/12/13/44023/01/2583630.pdf#page=24)"]
    assert row["interpretation"] == "**Lo que pasa si no se cumple, no un deber más**"
    assert "consecuencia" not in row["interpretation"].lower()   # la marca no repite el principio
    assert [c.split("]")[0] for c in row["cites"]] == ["[(art. 34 ter)"]
    assert row["expected"] == ("Tratar datos sin base o con una finalidad distinta (letra a), o tratar datos innecesarios "
                               "para los fines (letra c).")
    assert row["record"] == "Un uso sin actividad registrada es una alerta que se revisa, no una infracción que se presume."

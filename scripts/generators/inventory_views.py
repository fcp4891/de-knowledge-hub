"""Datos de ejemplo del Inventario de actividades de tratamiento, desde su propio código (ADR-030, enmienda 9).

Lee el bloque ```python de la §10 de content/concepts/processing-activities-inventory.md (inventario.py), lo importa y
escribe dos bloques del frontmatter, cada uno entre sus marcas:

- `views.register_fields.cases`: los tres casos de ejemplo en `actual` y `corregido`, con el valor de cada campo, su
  estado (ok, pending, review) y la hoja del documento propuesto.
- `views.activity_explorer.activities`: las tres actividades sobre silver.pasajeros en `actual`.

Nada se escribe a mano: si el código cambia, se vuelve a correr. Es idempotente. Con --check no escribe y sale con
código 1 si el frontmatter no coincide con lo que genera el código.

Uso: python -m scripts.generators.inventory_views [--check]
"""

from __future__ import annotations

import argparse
import importlib.util
import re
import sys
import tempfile
from pathlib import Path
from types import ModuleType
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
FICHA = ROOT / "content" / "concepts" / "processing-activities-inventory.md"
BEGIN = "# inicio del bloque generado por scripts/generators/inventory_views.py: no editar a mano"
END = "# fin del bloque generado"
SIN_PLAZO = "sin plazo de conservación"

# Casos de la tabla de campos (§2) y actividades del explorador (§3), con su nombre corto visible.
CASES = {"venta_pasajes": "Emitir y gestionar pasajes", "asistencia_especial": "Asistencia en aeropuerto",
         "encuesta_post_vuelo": "Medir la satisfacción"}
STATES = ("actual", "corregido")
EXPLORER = ("venta_pasajes", "marketing", "modelo_fraude")
EXPLORER_ASSET = "silver.pasajeros"

# Brecha de actividades_incompletas → campo de la tabla y estado (review: revisión; pending: sin evaluar).
GAP_FIELD = (
    ("aprobada sin base de licitud", "base", "pending"),
    (SIN_PLAZO, "plazo", "pending"),
    ("aprobación vencida", "aprob", "review"),
    ("sin registro de consentimientos", "aprob", "pending"),
    ("datos sensibles sin evaluar", "tipo", "pending"),
    ("sin categorías de titulares", "titulares", "pending"),
    ("destinatarios sin evaluar", "destinatarios", "pending"),
    ("fuente de los datos sin evaluar", "fuente", "pending"),
    ("transferencias internacionales sin evaluar", "transf", "pending"),
    ("decisiones automatizadas sin evaluar", "decisiones", "pending"),
    ("interés legítimo sin justificación", "base", "pending"),
    ("revisión: datos sensibles", "base", "review"),
)


def python_block(text: str) -> str:
    start = text.index("## 10. Código")
    section = text[start : text.index("\n## 11.", start)]
    (code,) = re.findall(r"^```python\n(.*?)^```", section, re.S | re.M)
    return code


def load_module(code: str) -> ModuleType:
    folder = Path(tempfile.mkdtemp())
    path = folder / "inventario.py"
    path.write_text(code, encoding="utf-8")
    spec = importlib.util.spec_from_file_location("inventario", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules["inventario"] = module   # dataclasses necesita el módulo registrado
    spec.loader.exec_module(module)
    return module


def cap(text: str) -> str:
    return text[:1].upper() + text[1:]


def joined(values: Any) -> str:
    return ", ".join(values)


def field_values(m: ModuleType, registro: Any, a: Any) -> dict[str, str | None]:
    """El valor de cada campo como lo muestra la tabla; None es sin evaluar."""
    base = None
    if a.base is not None:
        articulo = m.ARTICULO[a.base] + ("; art. 16, expreso" if a.categorias_sensibles and a.base == "consentimiento" else "")
        base = f"{cap(a.base)} ({articulo})"
        if a.base == "interés legítimo":
            base += f" · justificación: {a.justificacion_interes_legitimo or m.SIN_EVALUAR}"
    plazo = " o ".join(p for p in (f"{a.plazo_meses} meses" if a.plazo_meses is not None else "", a.plazo_condicion or "") if p)
    aprob = None
    if a.aprobacion is not None:
        aprob = f"Aprobada {a.aprobacion.fecha} · vence {a.aprobacion.vence}"
        if a.consentimientos is not None:
            aprob += f" · consentimientos {a.consentimientos.version_texto} desde {a.consentimientos.desde}"
    publico = None if a.acceso_publico is None else ("sí" if a.acceso_publico else "no")
    return {
        "tipo": f"{cap(joined(a.categorias))} · sensibles: "
                + (m.SIN_EVALUAR if a.categorias_sensibles is None else joined(a.categorias_sensibles) or "ninguno"),
        "ambito": registro.ambito_territorial,
        "bases": joined(sorted(a.activos)),
        "titulares": cap(joined(a.titulares)) if a.titulares else None,
        "finalidad": cap(a.finalidad),
        "fuente": None if a.fuente is None or publico is None else f"{cap(a.fuente)} · acceso público: {publico}",
        "base": base,
        "destinatarios": None if a.destinatarios is None else cap(joined(a.destinatarios)) or "Ninguno",
        "transf": None if a.transferencias is None else joined(a.transferencias) or "Ninguna",
        "plazo": plazo or None,
        "decisiones": None if a.decisiones_automatizadas is None else cap(a.decisiones_automatizadas) or "Ninguna",
        "activos": f"{joined(sorted(a.consumidores))} · campos: {joined(sorted(a.campos))}",
        "aprob": aprob,
    }


def own_gaps(m: ModuleType, registro: Any, a: Any) -> list[str]:
    """Brechas de actividades_incompletas que nombran a la actividad (la del ámbito es del registro)."""
    return [h.detalle for h in m.actividades_incompletas(registro, m.REFERENCIA)
            if h.detalle.startswith(f"{a.id}:") or f" en {a.id} " in h.detalle]


def field_status(m: ModuleType, registro: Any, a: Any, values: dict[str, str | None]) -> dict[str, str]:
    status = {key: "ok" if value is not None else "pending" for key, value in values.items()}
    if registro.ambito_territorial is None:
        status["ambito"] = "pending"
    if a.categorias_sensibles is None:   # el valor muestra las categorías, pero los sensibles siguen sin evaluar
        status["tipo"] = "pending"
    for gap in own_gaps(m, registro, a):
        for fragment, key, state in GAP_FIELD:
            if fragment in gap and status[key] != "review":
                status[key] = state
    return status


def sheet_rows(field: dict[str, Any], a: Any, sheet: dict[str, Any]) -> list[dict[str, Any]]:
    """Las filas de la hoja para un campo, en el orden del documento propuesto."""
    key, name, fid = field["key"], field["name"], field["id"]

    def row(label: str, value: str | None) -> dict[str, Any]:
        return {"label": label, "value": value, "field": fid}

    def blank(label: str) -> dict[str, Any]:
        return {"label": label, "blank": True, "field": fid}

    if key == "finalidad":
        return [row(name, cap(a.finalidad))]
    if key == "base":
        if a.base is None:
            return [row(name, None)]
        expreso = " (consentimiento expreso)" if a.categorias_sensibles and a.base == "consentimiento" else ""
        rows = [row(name, cap(a.base) + expreso)]
        if a.base == "interés legítimo":
            rows.append(row("Justificación del interés legítimo", a.justificacion_interes_legitimo))
        if a.base == "consentimiento":
            c = a.consentimientos
            rows.append(row("Registro de consentimientos", None if c is None else f"{c.version_texto}, desde {c.desde}"))
        return rows
    if key == "tipo":
        s = a.categorias_sensibles
        sensibles = None if s is None else f"Sí · {joined(s)}" if s else "No"
        return [row(name, cap(joined(a.categorias))), row("Datos sensibles", sensibles)]
    if key == "bases":
        tablas = sorted(a.activos)
        return [row(name, f"{joined(tablas)} ({'tablas' if len(tablas) > 1 else 'tabla'})")]
    if key == "titulares":
        return [row(name, cap(joined(a.titulares)) if a.titulares else None)]
    if key == "fuente":
        publico = None if a.acceso_publico is None else ("Sí" if a.acceso_publico else "No")
        return [row(name, None if a.fuente is None else cap(a.fuente)), row("Fuente de acceso público", publico)]
    if key == "destinatarios":
        d = a.destinatarios
        return [row(name, None if d is None else cap(joined(d)) or "Ninguno")]
    if key == "transf":
        if a.transferencias is None:
            return [row(name, None)]
        if not a.transferencias:
            return [row(name, "Ninguna")]
        out = []
        for t in a.transferencias:
            pais, _, mecanismo = t.partition(" · ")
            out += [row(f"{name} · país", pais), row(f"{name} · mecanismo", mecanismo or None)]
        return out
    if key == "plazo":
        return [row(name, sheet["plazo"])]
    if key == "decisiones":
        d = a.decisiones_automatizadas
        return [row(name, None if d is None else cap(d) if d else "No")]
    if key == "activos":
        return [row("Activos", joined(sorted(a.activos))), row("Consumidores", joined(sorted(a.consumidores))),
                row("Campos necesarios", joined(sorted(a.campos)))]
    if key == "aprob":
        ap = a.aprobacion
        return [row("Fecha de aprobación", None if ap is None else str(ap.fecha)),
                row("Vence", None if ap is None else str(ap.vence)),
                row("Versión", sheet["version"]), blank("Aprobado por"), blank("Firma")]
    raise ValueError(f"campo sin filas en la hoja: {key}")


def sheet_state(m: ModuleType, registro: Any, a: Any) -> str:
    if a.aprobacion is None:
        return "Borrador"
    if own_gaps(m, registro, a) or not m.vigente(a, m.REFERENCIA):
        return "En revisión"
    return "Vigente"


def case_state(m: ModuleType, view: dict[str, Any], registro: Any, a: Any, version: str) -> dict[str, Any]:
    values = field_values(m, registro, a)
    status = field_status(m, registro, a, values)
    fields = view["fields"]
    names = {f["key"]: f["name"] for f in fields}
    flagged = [names[k] for k in names if status[k] != "ok" and k != "ambito"]
    plazo = values["plazo"]
    sheet: dict[str, Any] = {"code": a.id, "version": version, "state": sheet_state(m, registro, a), "title": cap(a.finalidad),
                             "territory": None if registro.ambito_territorial is None
                             else registro.ambito_territorial.split(":", 1)[0]}
    if flagged:
        sheet["note"] = f"Pendiente de revisión por privacidad: {', '.join(flagged)}."
    context = {"plazo": plazo, "version": version}
    sections = []
    for title in view["sheet"]["sections"]:
        rows = [r for f in fields if f["sheet_section"] == title for r in sheet_rows(f, a, context)]
        if rows:
            sections.append({"title": title, "rows": rows})
    sheet["sections"] = sections
    return {"values": values, "status": status, "sheet": sheet}


def register_cases(m: ModuleType, view: dict[str, Any]) -> list[dict[str, Any]]:
    by_state = {name: m.escenario(name)[0] for name in STATES}
    activities = {name: {a.id: a for a in registro.actividades} for name, registro in by_state.items()}
    cases = []
    for key, name in CASES.items():
        states = {}
        for state in STATES:
            a = activities[state][key]
            changed = state != STATES[0] and a != activities[STATES[0]][key]
            states[state] = case_state(m, view, by_state[state], a, "v2" if changed else "v1")
        cases.append({"key": key, "name": name, "states": states})
    return cases


def explorer_activities(m: ModuleType) -> list[dict[str, Any]]:
    registro, usos, _ = m.escenario("actual")
    by_id = {a.id: a for a in registro.actividades}
    cuentas = {consumidor: cuenta for cuenta, consumidor in registro.identidades.items()}
    hallazgos = [h.detalle for h in (m.tablas_sin_actividad(registro) + m.actividades_incompletas(registro, m.REFERENCIA)
                                     + m.conciliar(registro, usos, m.REFERENCIA))]
    out = []
    for key in EXPLORER:
        a = by_id[key]
        (consumidor,) = sorted(a.consumidores)
        cuenta = cuentas[consumidor]
        (uso,) = [u for u in usos if u.cuenta == cuenta and u.activo == EXPLORER_ASSET]
        values = field_values(m, registro, a)
        if a.aprobacion is None:
            evidence = "Sin aprobación: no habilitar hasta la revisión"
        elif m.vigente(a, m.REFERENCIA):
            evidence = f"Aprobada el {a.aprobacion.fecha}; vence el {a.aprobacion.vence}"
        else:
            evidence = f"Aprobación vencida el {a.aprobacion.vence}"
        if a.base == "consentimiento" and a.consentimientos is None:
            evidence += "; sin registro de consentimientos"
        fuente = None if a.fuente is None or a.acceso_publico is None else (
            f"{cap(a.fuente)}; {'es' if a.acceso_publico else 'no es'} de acceso público")
        facts = [("Base (ilustrativa)", values["base"]), ("Plazo", values["plazo"]), ("Titulares", values["titulares"]),
                 ("Fuente", fuente), ("Transferencias", values["transf"]), ("Decisiones automatizadas", values["decisiones"])]
        read = [{"column": c, "state": "unevaluated" if not a.campos else "needed" if c in a.campos else "extra"}
                for c in sorted(uso.columnas)]
        gaps = [h for h in hallazgos if a.id in h or consumidor in h]
        out.append({
            "key": key, "name": cap(a.finalidad), "purpose": cap(a.finalidad),
            "facts": [{"label": label, "value": value} for label, value in facts],
            "fields": sorted(a.campos), "consumer": consumidor, "account": cuenta, "read": read,
            "evidence": evidence, "evidence_ok": m.vigente(a, m.REFERENCIA), "gaps": gaps,
            "ok": f"Sin hallazgos: {consumidor} lee solo columnas que su finalidad necesita.",
        })
    return out


def frontmatter(text: str) -> dict[str, Any]:
    return yaml.safe_load(text.split("---\n", 2)[1])


def dump(key: str, value: Any, indent: int) -> str:
    body = yaml.safe_dump({key: value}, allow_unicode=True, sort_keys=False, width=130)
    pad = " " * indent
    return "\n".join(pad + line if line else line for line in body.splitlines()) + "\n"


def replace_block(text: str, view: str, key: str, value: Any) -> str:
    """Reemplaza el bloque entre BEGIN y END dentro de views.<view>; el resto del archivo no se toca."""
    lines = text.splitlines(keepends=True)
    start = lines.index(f"  {view}:\n")
    end_view = next((i for i in range(start + 1, len(lines)) if re.match(r"^ {0,2}\S", lines[i])), len(lines))
    begin = next((i for i in range(start, end_view) if lines[i].strip() == BEGIN), None)
    close = next((i for i in range(begin or start, end_view) if lines[i].strip() == END), None) if begin is not None else None
    if begin is None or close is None:
        raise SystemExit(f"falta el bloque generado en views.{view} ({BEGIN})")
    indent = len(lines[begin]) - len(lines[begin].lstrip())
    return "".join(lines[: begin + 1]) + dump(key, value, indent) + "".join(lines[close:])


def generate(text: str) -> str:
    m = load_module(python_block(text))
    views = frontmatter(text)["views"]
    text = replace_block(text, "register_fields", "cases", register_cases(m, views["register_fields"]))
    return replace_block(text, "activity_explorer", "activities", explorer_activities(m))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="no escribe; sale con 1 si el frontmatter no coincide")
    args = parser.parse_args(argv)
    text = FICHA.read_text(encoding="utf-8")
    new = generate(text)
    if args.check:
        if new != text:
            print("processing-activities-inventory: los datos generados no coinciden con inventario.py; "
                  "corre python -m scripts.generators.inventory_views")
            return 1
        return 0
    if new != text:
        FICHA.write_text(new, encoding="utf-8", newline="\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())

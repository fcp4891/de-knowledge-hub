"""Verificación de solo lectura del estado legislativo contra la API de Ley Chile (BCN).

Consulta la API (https://www.bcn.cl/leychile/api/v1, documentada en https://www.bcn.cl/leychile/api/docs) y deja un
informe en texto, una línea por verificación (OK, ALERTA o ERROR). No escribe en content/ ni cambia last_verified.

- Clave: solo desde la variable de entorno BCN_API_SECRET. Nunca se imprime: toda salida pasa por `redactar`, y las
  URLs que se muestran llevan secret=***.
- Identificadores: los idNorma, la versión citada y el CVE salen del contenido del repo (citas de bcn-leychile y del
  Diario Oficial, y la tarjeta legal-frameworks/cl-ley-21719.yaml); no hay ids fijos en el código.
- Código de salida: 0 todo OK, 1 alguna alerta, 2 error técnico (incluido 401: clave faltante o inactiva).

Uso:
  python -m scripts.verify_bcn --desde 2026-11-01
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Literal, TextIO

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
BASE_URL = "https://www.bcn.cl/leychile/api/v1"
SECRET_ENV = "BCN_API_SECRET"
BOLETIN = "18623-07"
USER_AGENT = "dekh-verify-bcn/1.0 (solo lectura)"

Estado = Literal["OK", "ALERTA", "ERROR"]


@dataclass(frozen=True)
class Resultado:
    estado: Estado
    verificacion: str
    detalle: str


@dataclass(frozen=True)
class Respuesta:
    status: int
    cuerpo: bytes


Fetch = Callable[[str, Mapping[str, str]], Respuesta]


class ApiError(Exception):
    """Error técnico de una consulta (HTTP distinto de 200, sin conexión o respuesta ilegible)."""


class AuthError(ApiError):
    """401: falta la clave o no está activa. Corta la ejecución: las demás consultas fallarían igual."""


# --- Clave y URLs ------------------------------------------------------------------------------------------------


def redactar(texto: str, secret: str) -> str:
    """Reemplaza la clave (en claro o codificada en una URL) por ***."""
    if not secret:
        return texto
    for forma in {secret, urllib.parse.quote(secret, safe=""), urllib.parse.quote_plus(secret)}:
        texto = texto.replace(forma, "***")
    return texto


def armar_url(ruta: str, params: Mapping[str, str], secret: str) -> str:
    """URL real de la consulta; solo se usa por dentro, nunca se imprime."""
    return f"{BASE_URL}{ruta}?{urllib.parse.urlencode({**params, 'secret': secret})}"


def url_visible(ruta: str, params: Mapping[str, str]) -> str:
    """URL para mostrar en el informe, con secret=***."""
    consulta = urllib.parse.urlencode(params)
    return f"{BASE_URL}{ruta}?{consulta + '&' if consulta else ''}secret=***"


def http_fetcher(secret: str, timeout: float) -> Fetch:
    """Cliente HTTP real (urllib). Los errores no arrastran la URL ni la excepción original, que podría contenerla."""

    def fetch(ruta: str, params: Mapping[str, str]) -> Respuesta:
        pedido = urllib.request.Request(armar_url(ruta, params, secret),
                                        headers={"User-Agent": USER_AGENT, "Accept": "application/xml, application/json"})
        try:
            with urllib.request.urlopen(pedido, timeout=timeout) as resp:
                return Respuesta(resp.status, resp.read())
        except urllib.error.HTTPError as e:
            return Respuesta(e.code, b"")
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            raise ApiError(f"sin conexión con la API ({type(e).__name__})") from None

    return fetch


def consultar(fetch: Fetch, ruta: str, params: Mapping[str, str]) -> bytes:
    resp = fetch(ruta, params)
    if resp.status == 401:
        raise AuthError(f"la API respondió 401 en {url_visible(ruta, params)}: falta la clave o no está activa "
                        f"(variable {SECRET_ENV})")
    if resp.status != 200:
        raise ApiError(f"{url_visible(ruta, params)} respondió HTTP {resp.status}")
    return resp.cuerpo


# --- Referencias desde el repo -----------------------------------------------------------------------------------


@dataclass(frozen=True)
class Referencias:
    ley_19628: int
    versiones_citadas: frozenset[str]
    decreto_662: int
    ley_21719: int
    cve_21719: int | None


def frontmatter(texto: str) -> str:
    partes = texto.split("\n---\n", 1) if texto.startswith("---\n") else []
    return partes[0][4:] if partes else ""


def bloques(texto: str, clave: str) -> list[dict[str, str]]:
    """Ítems de lista YAML que empiezan con «- <clave>:», con sus pares clave: valor de una línea."""
    out: list[dict[str, str]] = []
    actual: dict[str, str] | None = None
    sangria = -1
    for linea in texto.splitlines():
        inicio = re.match(rf"^(\s*)- {clave}: (.*)$", linea)
        if inicio:
            actual = {clave: inicio.group(2).strip().strip("'\"")}
            sangria = len(inicio.group(1))
            out.append(actual)
            continue
        par = re.match(r"^(\s*)([a-z_]+): (.*)$", linea)
        if actual is not None and par and len(par.group(1)) > sangria:
            actual.setdefault(par.group(2), par.group(3).strip().strip("'\""))
        elif linea.strip() and not linea.startswith(" " * (sangria + 1)):
            actual = None
    return out


def un_id(candidatos: set[int], que: str) -> int:
    if len(candidatos) != 1:
        raise ValueError(f"no se pudo determinar un único idNorma para {que} en el repo: {sorted(candidatos) or 'ninguno'}")
    return next(iter(candidatos))


def id_norma(url: str) -> int | None:
    valores = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query).get("idNorma", [])
    return int(valores[0]) if valores and valores[0].isdigit() else None


def referencias(content_dir: Path = CONTENT) -> Referencias:
    """idNorma de la Ley 19.628, del Decreto 662 y de la Ley 21.719, versión citada y CVE, tal como están en el repo."""
    fichas = [p.read_text(encoding="utf-8") for p in sorted(content_dir.rglob("*.md"))]
    citas = [b for texto in fichas for b in bloques(frontmatter(texto), "source")]
    ley_19628 = un_id({i for b in citas if b.get("source") == "bcn-leychile" and b.get("page_title", "").startswith("Ley 19628")
                       if (i := id_norma(b.get("url", ""))) is not None}, "la Ley 19.628")
    decreto = un_id({i for b in citas if b.get("source") == "bcn-leychile" and b.get("page_title", "").startswith("Decreto 662")
                     if (i := id_norma(b.get("url", ""))) is not None}, "el Decreto 662")
    tarjetas = [b for p in sorted((content_dir / "legal-frameworks").glob("*.yaml"))
                for b in bloques(p.read_text(encoding="utf-8"), "key")]
    ley_21719 = un_id({i for b in tarjetas if b.get("key") == "law-name" and b.get("value", "").startswith("Ley 21.719")
                       if (i := id_norma(b.get("url", ""))) is not None}, "la Ley 21.719")
    versiones = {v for texto in fichas for url in re.findall(r"https://www\.bcn\.cl/leychile/navegar\?[^\s\"')]+", texto)
                 if id_norma(url) == ley_19628
                 for v in urllib.parse.parse_qs(urllib.parse.urlsplit(url).query).get("idVersion", [])}
    cves = {int(m) for b in citas if b.get("source") == "diario-oficial-cl" and "21.719" in b.get("page_title", "")
            for m in re.findall(r"CVE (\d+)", b.get("note", ""))}
    return Referencias(ley_19628, frozenset(versiones), decreto, ley_21719, next(iter(cves)) if len(cves) == 1 else None)


# --- Lectura de respuestas (esquemas de la documentación oficial) ------------------------------------------------


def xml_raiz(cuerpo: bytes, esperado: str) -> ET.Element:
    try:
        raiz = ET.fromstring(cuerpo)
    except ET.ParseError as e:
        raise ApiError(f"respuesta XML ilegible ({e.msg})") from None
    if etiqueta(raiz) != esperado:
        raise ApiError(f"se esperaba <{esperado}> y llegó <{etiqueta(raiz)}>")
    return raiz


def etiqueta(e: ET.Element) -> str:
    return e.tag.rsplit("}", 1)[-1]


def json_objeto(cuerpo: bytes) -> dict[str, Any]:
    try:
        datos = json.loads(cuerpo)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ApiError("respuesta JSON ilegible") from None
    if not isinstance(datos, dict):
        raise ApiError("se esperaba un objeto JSON")
    return datos


def versiones_80(cuerpo: bytes) -> list[tuple[str, str]]:
    """/servicio/80/ (EsquemaIntercambioServicio80): <Versiones><Version tipoVersion vigenteDesde [vigenteHasta]>."""
    raiz = xml_raiz(cuerpo, "Versiones")
    return [(v.get("vigenteDesde", ""), v.get("tipoVersion", "")) for v in raiz if etiqueta(v) == "Version"]


def ids_62(cuerpo: bytes) -> set[int]:
    """/servicio/62/: <Ids><Id>n</Id>…</Ids>."""
    raiz = xml_raiz(cuerpo, "Ids")
    return {int(e.text) for e in raiz if etiqueta(e) == "Id" and e.text and e.text.strip().isdigit()}


# --- Verificaciones ----------------------------------------------------------------------------------------------


def verificar_versiones(fetch: Fetch, refs: Referencias) -> Resultado:
    nombre = f"versiones Ley 19.628 (idNorma {refs.ley_19628}, /servicio/80/)"
    versiones = versiones_80(consultar(fetch, "/servicio/80/", {"idNorma": str(refs.ley_19628)}))
    if not versiones:
        raise ApiError("la respuesta no trae versiones")
    desde, tipo = max(versiones)
    citadas = sorted(refs.versiones_citadas)
    if citadas == [desde]:
        return Resultado("OK", nombre, f"la más reciente es {desde} ({tipo}), la que citan las fichas")
    return Resultado("ALERTA", nombre, f"la más reciente en BCN es {desde} ({tipo}); las fichas citan {', '.join(citadas) or 'ninguna'}")


def verificar_cambios(fetch: Fetch, refs: Referencias, desde: date) -> list[Resultado]:
    ids = ids_62(consultar(fetch, "/servicio/62/", {"desde": desde.isoformat()}))
    out = []
    for nombre, id_ in (("Ley 19.628", refs.ley_19628), ("Decreto 662", refs.decreto_662), ("Ley 21.719", refs.ley_21719)):
        titulo = f"cambios {nombre} (idNorma {id_}, /servicio/62/ desde {desde.isoformat()})"
        out.append(Resultado("ALERTA", titulo, "figura como nueva o modificada: revisar su texto y sus versiones")
                   if id_ in ids else Resultado("OK", titulo, "sin cambios registrados en el período"))
    return out


SIN_LEY = re.compile(r"no se (encontr|hall)|no existe|sin resultados", re.IGNORECASE)


def verificar_boletin_91(fetch: Fetch, boletin: str) -> Resultado:
    nombre = f"boletín {boletin} → ley publicada (/servicio/91/)"
    raiz = xml_raiz(consultar(fetch, "/servicio/91/", {"boletin": boletin}), "UrlsNorma")
    hijos = {etiqueta(e): (e.text or "").strip() for e in raiz}
    if hijos.get("status") == "ok" and raiz.get("norma"):
        return Resultado("ALERTA", nombre, f"publicada: {raiz.get('norma')}, publicada el {raiz.get('fecha_publicacion')} "
                                           f"(idNorma {raiz.get('id_norma')}); actualizar la madre y la tarjeta")
    if hijos.get("status") == "error" and SIN_LEY.search(hijos.get("mensaje", "")):
        return Resultado("OK", nombre, f"sin ley asociada todavía ({hijos.get('mensaje')})")
    raise ApiError(f"respuesta sin ley y sin motivo reconocible: status={hijos.get('status')!r}, mensaje={hijos.get('mensaje')!r}")


def verificar_boletin_93(fetch: Fetch, refs: Referencias, boletin: str) -> Resultado:
    nombre = f"boletín {boletin} → normas que modifica (/servicio/93/)"
    datos = json_objeto(consultar(fetch, "/servicio/93/", {"boletin": boletin}))
    normas = [n for n in datos.get("normas") or [] if isinstance(n, dict)]
    if not normas:
        return Resultado("ALERTA", nombre, "BCN ya no lista normas que modifique: puede haberse publicado como ley "
                                           "(revisar /servicio/91/, el Senado y el Diario Oficial)")
    ids = {n.get("id_norma") for n in normas}
    lista = ", ".join(str(n.get("identificacion") or n.get("id_norma")) for n in normas)
    if refs.ley_21719 in ids:
        return Resultado("OK", nombre, f"en curso; modifica: {lista}")
    return Resultado("ALERTA", nombre, f"en curso, pero la Ley 21.719 (idNorma {refs.ley_21719}) no figura entre las normas que modifica: {lista}")


def verificar_cve_94(fetch: Fetch, refs: Referencias) -> Resultado:
    nombre = f"CVE {refs.cve_21719} del Diario Oficial → Ley 21.719 (/servicio/94/)"
    datos = json_objeto(consultar(fetch, "/servicio/94/", {"cve": str(refs.cve_21719)}))
    if datos.get("id_norma") == refs.ley_21719:
        return Resultado("OK", nombre, f"{datos.get('identificacion')}, publicada el {datos.get('fechaPublicacion')}")
    return Resultado("ALERTA", nombre, f"el CVE apunta a idNorma {datos.get('id_norma')} ({datos.get('identificacion')}), "
                                       f"no a {refs.ley_21719}")


def ejecutar(fetch: Fetch, refs: Referencias, desde: date, boletin: str) -> list[Resultado]:
    """Corre todas las verificaciones. Un error de una no detiene las demás; un 401 sí (AuthError)."""
    pasos: list[tuple[str, Callable[[], list[Resultado]]]] = [
        ("versiones Ley 19.628 (/servicio/80/)", lambda: [verificar_versiones(fetch, refs)]),
        ("cambios recientes (/servicio/62/)", lambda: verificar_cambios(fetch, refs, desde)),
        (f"boletín {boletin} (/servicio/91/)", lambda: [verificar_boletin_91(fetch, boletin)]),
        (f"boletín {boletin} (/servicio/93/)", lambda: [verificar_boletin_93(fetch, refs, boletin)]),
    ]
    if refs.cve_21719 is not None:
        pasos.append(("CVE Ley 21.719 (/servicio/94/)", lambda: [verificar_cve_94(fetch, refs)]))
    out: list[Resultado] = []
    for nombre, paso in pasos:
        try:
            out += paso()
        except AuthError:
            raise
        except ApiError as e:
            out.append(Resultado("ERROR", nombre, str(e)))
    return out


def codigo(resultados: Sequence[Resultado]) -> int:
    estados = {r.estado for r in resultados}
    return 2 if "ERROR" in estados else 1 if "ALERTA" in estados else 0


def main(argv: Sequence[str] | None = None, *, fetch: Fetch | None = None, env: Mapping[str, str] | None = None,
         content_dir: Path = CONTENT, salida: TextIO | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verifica contra la API de Ley Chile (solo lectura).")
    parser.add_argument("--desde", required=True, type=date.fromisoformat, help="fecha YYYY-MM-DD para /servicio/62/")
    parser.add_argument("--boletin", default=BOLETIN, help=f"número de boletín (por defecto {BOLETIN})")
    parser.add_argument("--timeout", type=float, default=30.0, help="segundos por consulta")
    args = parser.parse_args(argv)
    out = salida or sys.stdout
    secret = (env if env is not None else os.environ).get(SECRET_ENV, "")

    def emitir(linea: str) -> None:
        print(redactar(linea, secret), file=out)

    if not secret and fetch is None:
        emitir(f"ERROR configuración: falta la variable de entorno {SECRET_ENV} (clave de la API de Ley Chile)")
        return 2
    try:
        refs = referencias(content_dir)
    except (OSError, ValueError) as e:
        emitir(f"ERROR referencias del repo: {e}")
        return 2
    emitir(f"verificación BCN (solo lectura) · desde {args.desde.isoformat()} · consultado {date.today().isoformat()}")
    try:
        resultados = ejecutar(fetch or http_fetcher(secret, args.timeout), refs, args.desde, args.boletin)
    except AuthError as e:
        emitir(f"ERROR autenticación: {e}")
        return 2
    for r in resultados:
        emitir(f"{r.estado} {r.verificacion}: {r.detalle}")
    total = codigo(resultados)
    emitir(f"resultado: {['OK', 'ALERTA', 'ERROR'][total]} ({total})")
    return total


if __name__ == "__main__":
    sys.exit(main())

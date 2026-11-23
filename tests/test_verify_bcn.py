"""scripts/verify_bcn.py, sin red.

Todas las respuestas de la API de este archivo son SINTÉTICAS: mínimas y armadas a mano a partir de los esquemas de la
documentación oficial (https://www.bcn.cl/leychile/api/docs: /servicio/62/ XML <Ids><Id>, /servicio/93/ y /94/ JSON;
/servicio/80/ según EsquemaIntercambioServicio80-v-1-0.xsd y /servicio/91/ según EsquemaServicioSenado_Opt_91.xsd).
No son respuestas reales de la API: la clave todavía no está activa.
"""

from __future__ import annotations

import io
import json
import urllib.error
from collections.abc import Mapping
from datetime import date
from pathlib import Path
from typing import Any

import pytest

from scripts import verify_bcn as v

SECRET = "clave-de-prueba-NO-REAL-9f3c"
REFS = v.Referencias(ley_19628=141599, versiones_citadas=frozenset({"2026-12-01"}), decreto_662=1227971,
                     ley_21719=1209272, cve_21719=2583630)

# --- Respuestas SINTÉTICAS ---------------------------------------------------------------------------------------
SINT_80_OK = b"""<?xml version="1.0" encoding="UTF-8"?>
<Versiones id_norma="141599">
  <Version tipoVersion="Texto Original" vigenteDesde="1999-08-28" vigenteHasta="2002-06-12"><UrlVersion>https://example.invalid/v0</UrlVersion></Version>
  <Version tipoVersion="Ultima Version" vigenteDesde="2023-05-09" vigenteHasta="2026-11-30"><UrlVersion>https://example.invalid/v1</UrlVersion></Version>
  <Version tipoVersion="Con Vigencia Diferida por Fecha" vigenteDesde="2026-12-01"><UrlVersion>https://example.invalid/v2</UrlVersion></Version>
</Versiones>"""
SINT_80_NUEVA = SINT_80_OK.replace(b"</Versiones>", b'<Version tipoVersion="Con Vigencia Diferida por Fecha" '
                                   b'vigenteDesde="2027-10-15"><UrlVersion>https://example.invalid/v3</UrlVersion></Version></Versiones>')
SINT_62_SIN = b"<Ids><Id>1000001</Id><Id>1000002</Id></Ids>"
SINT_62_CON = b"<Ids><Id>1000001</Id><Id>141599</Id></Ids>"
SINT_91_SIN_LEY = (b'<UrlsNorma id_norma="0" norma="" fecha_publicacion="1900-01-01" nro_boletin="18623-07">'
                   b"<status>error</status><VersionOriginal/><VersionActualizada/>"
                   b"<mensaje>No se encontr\xc3\xb3 el n\xc3\xbamero de bolet\xc3\xadn</mensaje></UrlsNorma>")
SINT_91_PUBLICADA = (b'<UrlsNorma id_norma="1300000" norma="Ley 21999" fecha_publicacion="2026-12-20" nro_boletin="18623-07">'
                     b"<status>ok</status><VersionOriginal>https://example.invalid/o</VersionOriginal>"
                     b"<VersionActualizada/><mensaje/></UrlsNorma>")
SINT_91_RARO = (b'<UrlsNorma id_norma="0" norma="" fecha_publicacion="1900-01-01" nro_boletin="18623-07">'
                b"<status>error</status><VersionOriginal/><VersionActualizada/><mensaje>Error interno</mensaje></UrlsNorma>")
SINT_93_EN_CURSO = json.dumps({"normas": [{"title": "REGULA LA PROTECCIÓN…", "url": "https://example.invalid/n",
                                           "fechaPromulgacion": "2024-11-25T00:00:00", "id_norma": 1209272,
                                           "identificacion": "Ley 21719", "organismo": ["MINISTERIO"],
                                           "fechaPublicacion": "2024-12-13T00:00:00"}], "total": 1}).encode()
SINT_93_VACIO = json.dumps({"normas": [], "total": 0}).encode()
SINT_94_OK = json.dumps({"title": "REGULA LA PROTECCIÓN…", "url": "https://example.invalid/n", "url_original": "https://example.invalid/o",
                         "fechaPromulgacion": "2024-11-25", "id_norma": 1209272, "actualizada": False, "numero_cve": 2583630,
                         "identificacion": "Ley 21719", "organismo": ["MINISTERIO"], "fechaPublicacion": "2024-12-13"}).encode()
SINT_94_OTRA = json.dumps({"id_norma": 1, "identificacion": "Decreto 1", "numero_cve": 2583630}).encode()

TODO_OK = {"/servicio/80/": SINT_80_OK, "/servicio/62/": SINT_62_SIN, "/servicio/91/": SINT_91_SIN_LEY,
           "/servicio/93/": SINT_93_EN_CURSO, "/servicio/94/": SINT_94_OK}


class FakeApi:
    """Responde por ruta con las respuestas sintéticas y anota cada consulta."""

    def __init__(self, cuerpos: Mapping[str, bytes], status: int = 200) -> None:
        self.cuerpos = dict(cuerpos)
        self.status = status
        self.llamadas: list[tuple[str, dict[str, str]]] = []

    def __call__(self, ruta: str, params: Mapping[str, str]) -> v.Respuesta:
        self.llamadas.append((ruta, dict(params)))
        return v.Respuesta(self.status, self.cuerpos.get(ruta, b""))


def correr(api: Any, *, env: Mapping[str, str] | None = None, desde: str = "2026-11-01") -> tuple[int, str]:
    salida = io.StringIO()
    code = v.main(["--desde", desde], fetch=api, env=env if env is not None else {v.SECRET_ENV: SECRET}, salida=salida)
    return code, salida.getvalue()


@pytest.fixture(autouse=True)
def refs_fijas(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(v, "referencias", lambda content_dir=v.CONTENT: REFS)


def test_todo_ok_sale_0_y_consulta_lo_esperado() -> None:
    api = FakeApi(TODO_OK)
    code, out = correr(api)
    assert code == 0, out
    assert out.count("\nOK ") == 7 and "ALERTA" not in out and "ERROR" not in out
    assert ("/servicio/80/", {"idNorma": "141599"}) in api.llamadas
    assert ("/servicio/62/", {"desde": "2026-11-01"}) in api.llamadas
    assert ("/servicio/91/", {"boletin": "18623-07"}) in api.llamadas and ("/servicio/94/", {"cve": "2583630"}) in api.llamadas
    assert out.rstrip().endswith("resultado: OK (0)")


def test_version_mas_nueva_que_la_citada_es_alerta() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/80/": SINT_80_NUEVA}))
    assert code == 1
    assert "ALERTA versiones Ley 19.628" in out and "2027-10-15" in out and "las fichas citan 2026-12-01" in out


def test_cambio_reciente_de_una_norma_es_alerta() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/62/": SINT_62_CON}))
    assert code == 1
    assert "ALERTA cambios Ley 19.628 (idNorma 141599" in out
    assert "OK cambios Decreto 662" in out and "OK cambios Ley 21.719" in out


def test_boletin_publicado_como_ley_es_alerta_con_numero_y_fecha() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/91/": SINT_91_PUBLICADA}))
    assert code == 1
    assert "ALERTA boletín 18623-07 → ley publicada" in out and "publicada: Ley 21999, publicada el 2026-12-20" in out


def test_respuesta_91_sin_motivo_reconocible_es_error_y_sigue_con_las_demas() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/91/": SINT_91_RARO}))
    assert code == 2
    assert "ERROR boletín 18623-07 (/servicio/91/)" in out and "OK boletín 18623-07 → normas que modifica" in out


def test_boletin_93_sin_normas_es_alerta() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/93/": SINT_93_VACIO}))
    assert code == 1 and "puede haberse publicado como ley" in out


def test_cve_que_apunta_a_otra_norma_es_alerta() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/94/": SINT_94_OTRA}))
    assert code == 1 and "el CVE apunta a idNorma 1" in out


def test_xml_ilegible_es_error() -> None:
    code, out = correr(FakeApi({**TODO_OK, "/servicio/62/": b"<Ids><Id>1"}))
    assert code == 2 and "ERROR cambios recientes (/servicio/62/): respuesta XML ilegible" in out


def test_401_corta_con_mensaje_claro_y_codigo_2() -> None:
    api = FakeApi(TODO_OK, status=401)
    code, out = correr(api)
    assert code == 2
    assert "ERROR autenticación: la API respondió 401" in out and "falta la clave o no está activa" in out
    assert "secret=***" in out and SECRET not in out
    assert len(api.llamadas) == 1   # no sigue consultando con una clave que no sirve


def test_sin_clave_sale_2_sin_consultar(monkeypatch: pytest.MonkeyPatch) -> None:
    salida = io.StringIO()
    assert v.main(["--desde", "2026-11-01"], env={}, salida=salida) == 2
    assert "falta la variable de entorno BCN_API_SECRET" in salida.getvalue()


def test_urls_visibles_ocultan_la_clave() -> None:
    assert v.url_visible("/servicio/80/", {"idNorma": "141599"}).endswith("/servicio/80/?idNorma=141599&secret=***")
    interna = v.armar_url("/servicio/80/", {"idNorma": "141599"}, "a b&c")
    assert "secret=a+b%26c" in interna and v.redactar(interna, "a b&c").endswith("secret=***")


def test_el_cliente_http_no_filtra_la_clave_en_errores(monkeypatch: pytest.MonkeyPatch) -> None:
    def falla_http(pedido: Any, timeout: float) -> Any:
        raise urllib.error.HTTPError(pedido.full_url, 401, f"Unauthorized {pedido.full_url}", {}, None)  # type: ignore[arg-type]

    monkeypatch.setattr("urllib.request.urlopen", falla_http)
    salida = io.StringIO()
    code = v.main(["--desde", "2026-11-01"], env={v.SECRET_ENV: SECRET}, salida=salida)
    assert code == 2 and SECRET not in salida.getvalue() and "401" in salida.getvalue()

    def sin_red(pedido: Any, timeout: float) -> Any:
        raise urllib.error.URLError(f"falló {pedido.full_url}")

    monkeypatch.setattr("urllib.request.urlopen", sin_red)
    salida = io.StringIO()
    code = v.main(["--desde", "2026-11-01"], env={v.SECRET_ENV: SECRET}, salida=salida)
    assert code == 2 and SECRET not in salida.getvalue() and "sin conexión con la API (URLError)" in salida.getvalue()


def test_referencias_salen_del_repo(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.undo()   # la función real, contra el contenido del repo (sin red)
    refs = v.referencias()
    assert (refs.ley_19628, refs.decreto_662, refs.ley_21719) == (141599, 1227971, 1209272)
    assert refs.versiones_citadas == frozenset({"2026-12-01"}) and refs.cve_21719 == 2583630


def test_referencias_ambiguas_son_error(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.undo()
    (tmp_path / "concepts").mkdir()
    ficha = ("---\nsources:\n  - source: bcn-leychile\n    url: https://www.bcn.cl/leychile/navegar?idNorma={n}\n"
             "    page_title: \"Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES\"\n---\n\ncuerpo\n")
    (tmp_path / "concepts" / "a.md").write_text(ficha.format(n=1), encoding="utf-8")
    (tmp_path / "concepts" / "b.md").write_text(ficha.format(n=2), encoding="utf-8")
    with pytest.raises(ValueError, match="único idNorma para la Ley 19.628"):
        v.referencias(tmp_path)
    salida = io.StringIO()
    assert v.main(["--desde", "2026-11-01"], fetch=FakeApi(TODO_OK), env={v.SECRET_ENV: SECRET},
                  content_dir=tmp_path, salida=salida) == 2
    assert "ERROR referencias del repo" in salida.getvalue()


def test_desde_invalido_lo_rechaza_argparse() -> None:
    with pytest.raises(SystemExit):
        v.main(["--desde", "22-11-2026"], fetch=FakeApi(TODO_OK), env={v.SECRET_ENV: SECRET})
    assert date.fromisoformat("2026-11-01")

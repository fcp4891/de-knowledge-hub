---
id: code_snippet:python-api-ingestion-retries
slug: python-api-ingestion-retries
type: code_snippet
title: Ingesta de una API con reintentos en Python
description: "Script de Python (solo biblioteca estándar) que pagina una API por cursor, respeta 429 y Retry-After, reintenta solo errores transitorios y guarda cada página con un nombre determinista."
language: python
dialect: python3.12
requirements:
  - "Python 3.12, solo biblioteca estándar."
  - "Una API HTTP con parámetros updated_since/updated_until y respuesta JSON {\"data\": [...], \"next\": \"<cursor>\"}; adaptar nombres si difieren."
  - "Si la API requiere autenticación: el token se lee de una variable de entorno o del gestor de secretos, nunca del código."
  - "Escritura en un directorio local o montado (raw/), por día lógico."
classification: core
level: intermediate
cloud: [agnostic]
technologies: [python]
tags: [python, ingestion, http, retries]
related_topics: [retries, idempotency, api-ingestion, python-error-handling-and-retries]
sources:
  - source: python-docs
    url: https://docs.python.org/3/library/urllib.request.html
    accessed: 2026-10-01
    note: "urlopen(url, data=None, [timeout, ]*, context=None): timeout en segundos para operaciones bloqueantes; acepta una URL o un objeto Request; para HTTP y HTTPS devuelve un HTTPResponse usable como context manager; lanza URLError ante errores de protocolo."
  - source: python-docs
    url: https://docs.python.org/3/library/urllib.error.html
    accessed: 2026-10-01
    note: "HTTPError es subclase de URLError; expone code (código de estado HTTP), reason y headers de la respuesta."
  - source: python-docs
    url: https://docs.python.org/3/tutorial/errors.html
    accessed: 2026-10-01
    note: "Capturar las excepciones más específicas posibles y dejar propagar las inesperadas; la cláusula except de una subclase debe ir antes que la de su clase base para que se use."
  - source: ietf-rfc
    url: https://www.rfc-editor.org/rfc/rfc6585.html
    accessed: 2026-10-01
    note: "RFC 6585: 429 Too Many Requests indica limitación de tasa; la respuesta puede incluir Retry-After con cuánto esperar."
  - source: ietf-rfc
    url: https://www.rfc-editor.org/rfc/rfc9110.html
    accessed: 2026-10-01
    note: "RFC 9110: GET es un método seguro y, por lo tanto, idempotente; Retry-After indica cuánto esperar antes de la siguiente petición."
relations:
  - type: IMPLEMENTS
    target: retries
    note: Reintento de errores transitorios con backoff, jitter, límite y respeto de Retry-After.
  - type: DEPENDS_ON
    target: idempotency
    note: Páginas con nombre determinista por día; repetir la ingesta sobrescribe en vez de duplicar.
  - type: IMPLEMENTS
    target: api-ingestion
    note: Paginación por cursor, límite de tasa (429 y Retry-After), credenciales fuera del código y escritura determinista.
  - type: IMPLEMENTS
    target: python-error-handling-and-retries
    note: Excepciones específicas (HTTPError antes que URLError), transitorias frente a permanentes y reintento acotado.
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: review_required
---

## 1. Qué resuelve

Extrae de una API HTTP los registros modificados en un día lógico, sin perder páginas, sin saturar la API y sin duplicar si se repite. Implementa el patrón `retries`: reintenta solo lo transitorio (429, 5xx, red), respeta `Retry-After` y tiene límite. Reutiliza el código de la sección 10 de la ficha `api-ingestion` (en revisión) y le agrega la escritura determinista de páginas. También implementa `api-ingestion` y `python-error-handling-and-retries`.

## 2. Código

```python
# Python 3.12, solo biblioteca estándar: paginación por cursor, 429/Retry-After, reintentos acotados
# y escritura idempotente de cada página en raw/<recurso>/fecha=<día>/pagina=<n>.json.
import json
import os
import random
import time
from collections.abc import Iterator
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

RETRYABLE = {429, 500, 502, 503, 504}


def get_page(url: str, params: dict[str, str], token: str | None = None, attempts: int = 5) -> dict:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    request = Request(f"{url}?{urlencode(params)}", headers=headers)
    for attempt in range(1, attempts + 1):
        try:
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except HTTPError as exc:                            # subclase de URLError: va primero
            if exc.code not in RETRYABLE or attempt == attempts:
                raise                                       # 4xx permanentes y reintentos agotados
            retry_after = exc.headers.get("Retry-After", "")
            wait = float(retry_after) if retry_after.isdigit() else random.uniform(0, 2 ** attempt)
        except (URLError, TimeoutError):                    # red o timeout: transitorio
            if attempt == attempts:
                raise
            wait = random.uniform(0, 2 ** attempt)
        time.sleep(wait)
    raise AssertionError("inalcanzable")


def iter_pages(url: str, since: str, until: str, token: str | None = None, max_pages: int = 10_000) -> Iterator[dict]:
    params = {"updated_since": since, "updated_until": until}
    for _ in range(max_pages):                              # protección ante un cursor que no termina
        page = get_page(url, params, token)
        yield page
        if not page.get("next"):
            return
        params = {**params, "cursor": page["next"]}
    raise RuntimeError(f"se superó el máximo de {max_pages} páginas")


def ingest_day(url: str, resource: str, day: str, next_day: str, raw_dir: Path) -> int:
    """Guarda las páginas del día lógico; repetirla sobrescribe los mismos archivos. Devuelve los registros."""
    out = raw_dir / resource / f"fecha={day}"
    out.mkdir(parents=True, exist_ok=True)
    for stale in out.glob("pagina=*.json"):                 # una ejecución previa pudo dejar más páginas
        stale.unlink()
    total = 0
    for number, page in enumerate(iter_pages(url, day, next_day, os.environ.get("API_TOKEN")), start=1):
        (out / f"pagina={number:05d}.json").write_text(json.dumps(page["data"]), encoding="utf-8")
        total += len(page["data"])
    return total


if __name__ == "__main__":
    count = ingest_day("https://api.ejemplo.com/v1/pedidos", "pedidos", "2026-09-30", "2026-10-01", Path("raw"))
    print(f"{count} registros")
```

## 3. Cómo funciona

1. `get_page` construye la petición `GET` con los parámetros y, si hay token, la cabecera de autorización.
2. Si la respuesta es 429 o 5xx, espera lo que diga `Retry-After` (en segundos) o un backoff exponencial con jitter, y reintenta hasta `attempts` veces. Los 4xx permanentes (400, 401, 403, 404) se propagan de inmediato.
3. `HTTPError` se captura **antes** que `URLError` porque es su subclase; si no, el primer `except` se quedaría con todos los errores HTTP.
4. `iter_pages` sigue el cursor `next` hasta que no venga, con un tope de páginas.
5. `ingest_day` borra las páginas de una ejecución anterior del mismo día y escribe cada página con un nombre determinista (`pagina=00001.json`...). Repetir el día deja exactamente los mismos archivos: es **idempotente**.

`GET` es un método seguro según la RFC 9110: reintentarlo no cambia nada en la API.

## 4. Cuándo usarlo

- Extracción diaria o por intervalo de una API paginada por cursor.
- Primera etapa de un pipeline que luego carga la capa raw con `MERGE` por clave.
- Entornos donde no se quieren dependencias externas para la extracción.

## 5. Cuándo no usarlo

- Si la API ofrece exportaciones masivas, webhooks o CDC: suelen ser más completos y baratos.
- Si la API pagina por offset sobre datos que cambian durante la lectura: hay riesgo de saltar o repetir registros.
- Para peticiones que crean recursos (`POST`): reintentarlas sin clave de idempotencia puede duplicar efectos.

## 6. Riesgos

- **`Retry-After` como fecha HTTP:** el código solo interpreta segundos; con una fecha, usa backoff.
- **Borrado previo y fallo a mitad:** si la ejecución falla después de borrar, el día queda incompleto hasta reintentar; la carga posterior debe tomar el día solo cuando la extracción terminó con éxito (por ejemplo, con un archivo de control o la dependencia del orquestador).
- **Seguridad:** el token se lee de `API_TOKEN`; no registrarlo en logs ni escribirlo en los archivos raw.
- **Costo y límites:** muchas APIs limitan o cobran por petición; usar el tamaño de página máximo permitido.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Ajustar la URL, el recurso y los nombres de parámetros, definir `API_TOKEN` si hace falta y ejecutar `python ingest.py`. En un orquestador, llamar a `ingest_day` con el día lógico del intervalo (por ejemplo, `ds` en Airflow) en lugar de fechas fijas.

## 8. Conceptos relacionados

- `retries`: el patrón que implementa.
- `idempotency`: por qué repetir el día es seguro.
- `api-ingestion`: contrato, paginación, límite de tasa y credenciales.
- `python-error-handling-and-retries`: manejo de excepciones en Python.

## 9. Fuentes

- Python: *urllib.request*, *urllib.error* y *Errors and Exceptions*.
- IETF: *RFC 6585* y *RFC 9110*. Referencia canónica (Nivel 4).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `api-ingestion` (lote 3, en revisión). Si la revisión B-F3.1 del lote 3 cambia ese código, este snippet se actualiza en el mismo commit.
- 2026-10-01: enlazado (IMPLEMENTS) a `api-ingestion` y `python-error-handling-and-retries`, verificadas con el lote 3; la revisión no cambió su código.

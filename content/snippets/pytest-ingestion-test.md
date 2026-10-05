---
id: code_snippet:pytest-ingestion-test
slug: pytest-ingestion-test
type: code_snippet
title: Tests de pytest para la validación y la carga de una ingesta
description: "Tests de pytest, sin red ni credenciales, que comprueban la validación en el borde con Pydantic (válidos y rechazados por tipo de error) y que la carga de BigQuery reemplaza solo la partición del día, también al repetirla."
language: python
dialect: python3.12
requirements:
  - "Python 3.12 con pytest, pydantic 2 y google-cloud-bigquery instalados en el entorno del proyecto (no hacen falta credenciales: los tests no llaman a la API)."
  - "Un módulo ingest.py importable con validate_page (sección 10 de data-validation-with-pydantic) y load_day (sección 10 de batch-ingestion), tal como están en esas fichas."
  - "Guardar el código como tests/test_ingest.py y ejecutar python -m pytest desde la raíz del proyecto."
classification: core
level: intermediate
cloud: [gcp]
technologies: [pytest, pydantic, gcp-bigquery, python]
tags: [python, testing, ingestion, data-quality]
related_topics: [testing-with-pytest, data-validation-with-pydantic, batch-ingestion, idempotency]
sources:
  - source: pytest-docs
    url: https://docs.pytest.org/en/stable/how-to/assert.html
    accessed: 2026-10-04
    note: "pytest permite usar el assert estándar de Python y muestra la introspección de la expresión cuando falla."
  - source: pytest-docs
    url: https://docs.pytest.org/en/stable/how-to/parametrize.html
    accessed: 2026-10-04
    note: "@pytest.mark.parametrize ejecuta la misma función de test con varios juegos de argumentos, uno por caso."
  - source: pytest-docs
    url: https://docs.pytest.org/en/stable/explanation/goodpractices.html
    accessed: 2026-10-04
    note: "pytest busca archivos test_*.py o *_test.py y recoge las funciones con prefijo test."
  - source: pytest-docs
    url: https://docs.pytest.org/en/stable/how-to/monkeypatch.html
    accessed: 2026-10-05
    note: "monkeypatch.setattr reemplaza una función o atributo durante el test (por ejemplo, una llamada a una API que no se quiere hacer); los cambios se deshacen al terminar el test o el fixture."
  - source: python-docs
    url: https://docs.python.org/3/library/typing.html
    accessed: 2026-10-05
    note: "typing.Protocol: subtipado estructural; una clase con los métodos del protocolo lo cumple sin heredar de él."
  - source: pydantic-docs
    url: https://pydantic.dev/docs/validation/latest/errors/errors/
    accessed: 2026-10-04
    note: "Cada error de ValidationError tiene loc, msg, type (identificador para máquinas), input, ctx y url."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/loading-data-cloud-storage-parquet
    accessed: 2026-10-04
    note: "LoadJobConfig(source_format=bigquery.SourceFormat.PARQUET, write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE) y client.load_table_from_uri(uri, table_id, job_config=job_config)."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/load-data-partitioned-tables
    accessed: 2026-10-04
    note: "Un decorador de partición (tabla$AAAAMMDD) dirige la carga a esa partición; para sobrescribirla en lugar de agregar, la carga debe reemplazar (bq load --replace=true)."
relations:
  - type: IMPLEMENTS
    target: testing-with-pytest
    note: Assert simple, parametrize y un cliente falso inyectado (Protocol), sin red ni credenciales.
  - type: IMPLEMENTS
    target: data-validation-with-pydantic
    note: Comprueba que los válidos pasan y que cada inválido se rechaza con su tipo de error, sin copiar el dato recibido.
  - type: IMPLEMENTS
    target: batch-ingestion
    note: Comprueba que la carga apunta a la partición del día con WRITE_TRUNCATE y que repetirla emite el mismo job.
  - type: DEPENDS_ON
    target: idempotency
    note: El test de repetición fija la propiedad que hace seguros los reintentos y los backfills.
created_at: 2026-10-04
updated_at: 2026-10-05
last_verified: 2026-10-05
verification_status: verified
---

## 1. Qué resuelve

Fija con tests las dos propiedades que más importan en una ingesta batch:

- **la validación en el borde:** un registro válido pasa y cada inválido se rechaza con su tipo de error, sin que un registro malo tumbe la página ni se copie el dato recibido;
- **la carga idempotente:** el load job apunta a la partición del día con `WRITE_TRUNCATE`, y repetirlo emite exactamente el mismo job.

Corren en segundos, sin red ni credenciales, porque la carga recibe el cliente como parámetro y el test le pasa uno falso.

## 2. Código

```python
# tests/test_ingest.py · pytest: validación en el borde y carga por partición, sin red ni credenciales.
# ingest.py contiene validate_page (ficha data-validation-with-pydantic) y load_day (ficha batch-ingestion).
from datetime import date

import pytest
from google.cloud import bigquery

import ingest

VALID = b'{"order_id": "A1", "amount": "10.50", "currency": "CLP", "created_at": "2026-10-01T10:00:00Z"}'


def test_valid_record_is_accepted() -> None:
    ok, rejected = ingest.validate_page([VALID])
    assert [o.order_id for o in ok] == ["A1"]
    assert rejected == []


@pytest.mark.parametrize(
    ("raw", "error_type"),
    [
        (b'{"order_id": "A2", "amount": -5, "currency": "CLP", "created_at": "2026-10-01T10:00:00Z"}', "greater_than_equal"),
        (b'{"order_id": "A3", "amount": 1, "currency": "clp", "created_at": "2026-10-01T10:00:00Z"}', "string_pattern_mismatch"),
        (b'{"order_id": "A4", "amount": 1, "currency": "CLP", "created_at": "2026-10-01T10:00:00Z", "x": 1}', "extra_forbidden"),
        (b"no es json", "json_invalid"),
    ],
)
def test_invalid_record_is_rejected_with_its_error(raw: bytes, error_type: str) -> None:
    ok, rejected = ingest.validate_page([VALID, raw])
    assert len(ok) == 1                                   # un registro malo no tumba la página
    assert [e["type"] for e in rejected[0]["errors"]] == [error_type]
    assert all("input" not in e for e in rejected[0]["errors"])  # no se copia el dato recibido


class FakeJob:
    output_rows = 3

    def result(self) -> "FakeJob":
        return self


class FakeClient:
    """Sustituye a bigquery.Client: registra cada load job en lugar de llamar a la API."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, bigquery.LoadJobConfig]] = []

    def load_table_from_uri(self, uri: str, destination: str, job_config: bigquery.LoadJobConfig) -> FakeJob:
        self.calls.append((uri, destination, job_config))
        return FakeJob()


def test_load_day_replaces_only_that_partition() -> None:
    client = FakeClient()
    assert ingest.load_day(client, date(2026, 10, 1)) == 3
    uri, destination, config = client.calls[0]
    assert uri == "gs://empresa-lake/raw/pedidos/dt=2026-10-01/*.parquet"
    assert destination == "proyecto.staging.pedidos$20261001"
    assert config.write_disposition == bigquery.WriteDisposition.WRITE_TRUNCATE
    assert config.source_format == bigquery.SourceFormat.PARQUET


def test_repeating_a_day_issues_the_same_job() -> None:
    client = FakeClient()
    ingest.load_day(client, date(2026, 10, 1))
    ingest.load_day(client, date(2026, 10, 1))
    first, second = client.calls
    assert first[:2] == second[:2]
    assert first[2].write_disposition == second[2].write_disposition == bigquery.WriteDisposition.WRITE_TRUNCATE
```

## 3. Cómo funciona

1. **Validación:** el test parametrizado (`@pytest.mark.parametrize`) cubre un caso por regla del modelo: monto negativo, moneda en minúsculas, campo extra y JSON inválido. Cada caso comprueba que el válido sigue pasando, que el inválido trae exactamente su `type` de error y que el error no incluye el `input`.
2. **Cliente falso:** `load_day(client, day)` recibe el cliente tipado con el `Protocol` `LoadClient` (sección 10 de `batch-ingestion`), que solo exige `load_table_from_uri`. `FakeClient` lo cumple por estructura, sin heredar de `bigquery.Client`, así que el test pasa un chequeo de tipos estricto; registra la llamada en lugar de crear un job real. El `LoadJobConfig` sí es el de la biblioteca, de modo que el test comprueba la configuración real.
3. **Partición e idempotencia:** el test verifica el URI del día, el decorador `$20261001` y `WRITE_TRUNCATE`. El último test llama dos veces con la misma fecha y exige el mismo job: la propiedad que hace seguros los reintentos y los backfills.

Si alguien cambia `WRITE_TRUNCATE` por `WRITE_APPEND` en `load_day`, fallan los dos tests de carga.

## 4. Cuándo usarlo

- Como red de seguridad de un pipeline batch en Python antes de cada cambio (en la CI).
- Para fijar el contrato de validación: qué se acepta, qué se rechaza y con qué error.
- Como plantilla para probar otras cargas que reciben el cliente como parámetro.

## 5. Cuándo no usarlo

- Para comprobar que BigQuery acepta los datos reales (schema de la tabla, permisos, decorador que coincide con los datos): eso exige un test de integración contra un proyecto de prueba.
- Para validar calidad sobre datos ya cargados: mejor aserciones SQL (Dataform, dbt) o controles de reconciliación.
- Si la función crea su propio cliente dentro: primero refactorizarla para recibirlo, o usar `monkeypatch.setattr` de pytest para reemplazarlo durante el test (el cambio se deshace al terminar).

## 6. Riesgos

- **Falsa confianza:** el cliente falso acepta cualquier destino; un error de permisos o de schema solo aparece contra BigQuery real. Complementar con un test de integración periódico.
- **Copias desincronizadas:** si `ingest.py` se aparta de las fichas, los tests deben seguir al código real, no a la ficha.
- **Seguridad:** los tests no necesitan credenciales; no agregar a la CI cuentas con permisos de escritura para "probar de verdad" en el mismo job que corre los tests unitarios.
- **Costo:** nulo en la nube; los tests de integración, en cambio, crean jobs y tablas: usar un dataset de prueba con expiración.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Con `ingest.py` en la raíz y el test en `tests/test_ingest.py`, ejecutar `python -m pytest -q`: 7 tests (el parametrizado cuenta 4).

## 8. Conceptos relacionados

- `data-validation-with-pydantic` y `batch-ingestion`: lo que prueba.
- `idempotency`: la propiedad que fija el test de repetición.
- `testing-with-pytest`: el concepto que aplica.

## 9. Fuentes

- pytest: *How to write and report assertions in tests*, *How to parametrize fixtures and test functions*, *How to monkeypatch/mock modules and environments* y *Good Integration Practices*.
- Python: *typing — Support for type hints* (`Protocol`).
- Pydantic: *Error Handling*.
- Google Cloud: *Load Parquet data from Cloud Storage* y *Load data into partitioned tables* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-04: creación (propuesta aprobada tras el lote 5), sobre el código de las secciones 10 de `data-validation-with-pydantic` y `batch-ingestion`.
- 2026-10-05: revisión B-F3.2 (`docs/reviews/snippets-3.md`) aplicada: fuente de `monkeypatch` y cliente tipado con `Protocol`. `verification_status: verified` (sin VERIFY pendientes).
- 2026-10-05: implementa también `testing-with-pytest`, verificada en el lote 6.

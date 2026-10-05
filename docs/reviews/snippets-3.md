# Revisión B-F3.2 · Snippets 3

Snippets en `content/snippets/` y el cambio de §14 del commit `98bc285` en siete fichas ya `verified`. Carril B no edita `content/`. Todas las filas quedan en **pendiente**. Los tres snippets están en `review_required`.

Los 3: `python-structured-logging`, `pytest-ingestion-test` y `pubsub-subscription-terraform`.

El criterio de los snippets es el de la plantilla: el código se puede ejecutar, o `requirements` dice exactamente qué hace falta.

## `python-structured-logging`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Python 3.12 y biblioteca estándar. Pide guardarlo como `logging_setup.py` y llamar a `configure_logging(run_id)` una sola vez. El `__main__` imprime las dos líneas de ejemplo. | pendiente |
| Idempotencia | `force=True` quita los handlers del root antes de configurar de nuevo, así que repetir la configuración no duplica handlers. | pendiente |
| Errores técnicos | No marco un error. El filtro va en el handler (cubre a los loggers descendientes) y redacta solo claves exactas de `extra`. El texto dice que un secreto en el mensaje, en una URL o en el traceback no se redacta. | pendiente |

## `pytest-ingestion-test`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Pide pytest, pydantic 2 y `google-cloud-bigquery`, sin credenciales. `ingest.py` tiene que traer `validate_page` y `load_day` como en las fichas. El comando es `python -m pytest` desde la raíz; el parametrizado más los otros tres suman 7 tests. | pendiente |
| Idempotencia | El test de repetición exige el mismo URI, el mismo decorador `$20261001` y `WRITE_TRUNCATE` en las dos llamadas. El texto dice que cambiar a `WRITE_APPEND` hace fallar los dos tests de carga. | pendiente |
| Errores técnicos | No marco un error. Cada caso inválido coincide con un solo `type` de Pydantic (`greater_than_equal`, `string_pattern_mismatch`, `extra_forbidden`, `json_invalid`) y comprueba que `include_input=False` no copia `input`. El cliente falso no llama a la API. | pendiente |

## `pubsub-subscription-terraform`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Terraform 1.x, provider `hashicorp/google` 8.x, `project_id`, API de Pub/Sub y la diferencia entre `terraform validate` y `apply`. El número de proyecto sale de `data.google_project`. | pendiente |
| Mínimo privilegio y recursos aditivos | Los dos permisos son `google_pubsub_topic_iam_member` (`roles/pubsub.publisher` en el topic de dead letter) y `google_pubsub_subscription_iam_member` (`roles/pubsub.subscriber` en la suscripción de origen). El texto dice que son aditivos y que no van al proyecto. No llama idempotente a `add-iam-policy-binding`. Un segundo `apply` sin cambios se dice de Terraform. | pendiente |
| Errores técnicos | No marco un error. La dead letter tiene su suscripción. Retención, backoff, `max_delivery_attempts = 10` y `ttl = ""` caen en los rangos de la nota del provider. El filtro se presenta como inmutable. | pendiente |

## §14 del lote 1 (`98bc285`)

Las siete fichas siguen `verified`. El cambio agrega o rotula las viñetas `- **Seguridad:**`, `- **Observabilidad:**` y `- **Costo:**` que exige `validate`. `last_verified` sigue en 2026-09-30. No hay cifras de producto nuevas.

| Ficha | Hallazgo | Estado |
|---|---|---|
| `bigquery-partitioning` | La viñeta de pruning pasa a **Observabilidad** y suma vigilar consultas que leen más particiones de las esperadas. **Costo** y **Seguridad** ya estaban. | pendiente |
| `dead-letter-queue` | La alerta de tamaño y tasa de la DLQ pasa a **Observabilidad**. **Costo** (incluida la expiración de SQS desde el encolado original) y **Seguridad** ya estaban. | pendiente |
| `etl-vs-elt` | «Hacer incrementales las transformaciones pesadas» pasa a **Costo**, con el cómputo del warehouse y la retención de raw. **Observabilidad** y **Seguridad** ya estaban. | pendiente |
| `incremental-load` | **Observabilidad** conserva la reconciliación y agrega watermark y filas leídas. **Costo** es nuevo: la ventana, el solape y un origen sin índice ni partición en la columna del watermark. **Seguridad** ya estaba. | pendiente |
| `partitioning` | **Costo** es nuevo: el pruning baja lo leído y los segmentos diminutos agregan metadatos y archivos. **Seguridad** y **Observabilidad** ya estaban. | pendiente |
| `scd-type-2` | El control de una sola versión vigente, sin huecos ni solapes, pasa a **Observabilidad** y suma contar versiones nuevas por lote. **Seguridad** y **Costo** ya estaban. | pendiente |
| `sql-merge` | El conteo de filas insertadas, actualizadas y borradas pasa a **Observabilidad**. **Costo** es el filtro de la ventana, con la razón de no leer el destino entero. **Seguridad** ya estaba. | pendiente |

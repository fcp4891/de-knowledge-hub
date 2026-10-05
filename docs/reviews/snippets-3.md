# Revisión B-F3.2 · Snippets 3

Snippets en `content/snippets/` y el cambio de §14 del commit `98bc285` en siete fichas ya `verified`. Carril B no edita `content/`. **Estado: aprobado por Felipe** el 2026-10-05: todas las filas en `aprobada`, incluidos los 6 hallazgos de la revisión paralela de Carril A (sección final; el 6, con `Protocol`). Los tres snippets están en `review_required` hasta aplicar esta revisión.

Los 3: `python-structured-logging`, `pytest-ingestion-test` y `pubsub-subscription-terraform`.

El criterio de los snippets es el de la plantilla: el código se puede ejecutar, o `requirements` dice exactamente qué hace falta.

## `python-structured-logging`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Python 3.12 y biblioteca estándar. Pide guardarlo como `logging_setup.py` y llamar a `configure_logging(run_id)` una sola vez. El `__main__` imprime las dos líneas de ejemplo. | aprobada |
| Idempotencia | `force=True` quita los handlers del root antes de configurar de nuevo, así que repetir la configuración no duplica handlers. | aprobada |
| Errores técnicos | No marco un error. El filtro va en el handler (cubre a los loggers descendientes) y redacta solo claves exactas de `extra`. El texto dice que un secreto en el mensaje, en una URL o en el traceback no se redacta. | aprobada |

## `pytest-ingestion-test`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Pide pytest, pydantic 2 y `google-cloud-bigquery`, sin credenciales. `ingest.py` tiene que traer `validate_page` y `load_day` como en las fichas. El comando es `python -m pytest` desde la raíz; el parametrizado más los otros tres suman 7 tests. | aprobada |
| Idempotencia | El test de repetición exige el mismo URI, el mismo decorador `$20261001` y `WRITE_TRUNCATE` en las dos llamadas. El texto dice que cambiar a `WRITE_APPEND` hace fallar los dos tests de carga. | aprobada |
| Errores técnicos | No marco un error. Cada caso inválido coincide con un solo `type` de Pydantic (`greater_than_equal`, `string_pattern_mismatch`, `extra_forbidden`, `json_invalid`) y comprueba que `include_input=False` no copia `input`. El cliente falso no llama a la API. | aprobada |

## `pubsub-subscription-terraform`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Terraform 1.x, provider `hashicorp/google` 8.x, `project_id`, API de Pub/Sub y la diferencia entre `terraform validate` y `apply`. El número de proyecto sale de `data.google_project`. | aprobada |
| Mínimo privilegio y recursos aditivos | Los dos permisos son `google_pubsub_topic_iam_member` (`roles/pubsub.publisher` en el topic de dead letter) y `google_pubsub_subscription_iam_member` (`roles/pubsub.subscriber` en la suscripción de origen). El texto dice que son aditivos y que no van al proyecto. No llama idempotente a `add-iam-policy-binding`. Un segundo `apply` sin cambios se dice de Terraform. | aprobada |
| Errores técnicos | No marco un error. La dead letter tiene su suscripción. Retención, backoff, `max_delivery_attempts = 10` y `ttl = ""` caen en los rangos de la nota del provider. El filtro se presenta como inmutable. | aprobada |

## §14 del lote 1 (`98bc285`)

Las siete fichas siguen `verified`. El cambio agrega o rotula las viñetas `- **Seguridad:**`, `- **Observabilidad:**` y `- **Costo:**` que exige `validate`. `last_verified` sigue en 2026-09-30. No hay cifras de producto nuevas.

| Ficha | Hallazgo | Estado |
|---|---|---|
| `bigquery-partitioning` | La viñeta de pruning pasa a **Observabilidad** y suma vigilar consultas que leen más particiones de las esperadas. **Costo** y **Seguridad** ya estaban. | aprobada |
| `dead-letter-queue` | La alerta de tamaño y tasa de la DLQ pasa a **Observabilidad**. **Costo** (incluida la expiración de SQS desde el encolado original) y **Seguridad** ya estaban. | aprobada |
| `etl-vs-elt` | «Hacer incrementales las transformaciones pesadas» pasa a **Costo**, con el cómputo del warehouse y la retención de raw. **Observabilidad** y **Seguridad** ya estaban. | aprobada |
| `incremental-load` | **Observabilidad** conserva la reconciliación y agrega watermark y filas leídas. **Costo** es nuevo: la ventana, el solape y un origen sin índice ni partición en la columna del watermark. **Seguridad** ya estaba. | aprobada |
| `partitioning` | **Costo** es nuevo: el pruning baja lo leído y los segmentos diminutos agregan metadatos y archivos. **Seguridad** y **Observabilidad** ya estaban. | aprobada |
| `scd-type-2` | El control de una sola versión vigente, sin huecos ni solapes, pasa a **Observabilidad** y suma contar versiones nuevas por lote. **Seguridad** y **Costo** ya estaban. | aprobada |
| `sql-merge` | El conteo de filas insertadas, actualizadas y borradas pasa a **Observabilidad**. **Costo** es el filtro de la ventana, con la razón de no leer el destino entero. **Seguridad** ya estaba. | aprobada |

## Hallazgos de la revisión paralela de Carril A

| # | Dónde | Hallazgo | Propuesta | Estado |
|---|---|---|---|---|
| 1 | `sql-merge` §14 Costo | «Sin ese filtro, el `MERGE` lee el destino completo en cada ejecución» generaliza de más. La fuente de BigQuery (DML, ya citada en la ficha) dice que, con on-demand, un `MERGE` solo con `INSERT` cobra `q` (bytes que lee la sentencia), y con `UPDATE` o `DELETE` cobra `q + t` (tamaño de la tabla, o de las particiones afectadas si está particionada). Además, la frase se presenta como regla de todos los motores. | Reescribir: «En BigQuery (on-demand), un `MERGE` con `UPDATE` o `DELETE` cobra también el tamaño de la tabla destino, o solo el de las particiones afectadas si está particionada: limitar el destino a la ventana afectada reduce ese costo.» | aprobada |
| 2 | `partitioning` §14 Costo | La primera mitad tiene respaldo (Athena: particionar reduce lo escaneado y el costo). La segunda, «segmentos diminutos y numerosos agregan sobrecarga de metadatos y archivos», no está en las fuentes de la ficha: la de Synapse dice que demasiadas particiones perjudican el **rendimiento**, no habla de metadatos ni de costo. | Reemplazar la segunda mitad por lo que dice la fuente: «demasiadas particiones perjudican el rendimiento (Synapse lo documenta para dedicated SQL pool)», o quitarla. | aprobada |
| 3 | `pytest-ingestion-test` §5 | Recomienda `monkeypatch` de pytest sin citarlo. | Agregar la fuente `pytest-docs` con `https://docs.pytest.org/en/stable/how-to/monkeypatch.html` (HTTP 200 el 2026-10-04). | aprobada |
| 4 | `pubsub-subscription-terraform` §6 | «Las cuentas de los consumidores necesitan aparte `roles/pubsub.subscriber` en su suscripción» no tiene fuente en el snippet. | Agregar `https://docs.cloud.google.com/pubsub/docs/access-control` (ya citada en `pubsub-topics-and-subscriptions`). | aprobada |
| 5 | `python-structured-logging` §2 | `record.run_id = self.run_id` funciona, pero un chequeo de tipos estricto (mypy) lo marca porque `LogRecord` no declara `run_id`. El proyecto pide tipado estricto en su código; el snippet es código de ejemplo. | Opcional: `setattr(record, "run_id", self.run_id)`, como ya hace con los campos redactados. | aprobada |
| 6 | `pytest-ingestion-test` §2 | `load_day` anota `client: bigquery.Client` y el test le pasa `FakeClient`: correcto en ejecución, pero un chequeo de tipos estricto lo marca. | En `load_day`, tipar el cliente con un `Protocol` que solo exige `load_table_from_uri`, también en la §10 de `batch-ingestion` (aceptado así). | aprobada |

Redactados por Carril A, el mismo carril que escribió el contenido; Cursor revisó en paralelo sin hallazgos. Ningún hallazgo es un error que produzca datos incorrectos. El #1 y el #2 son afirmaciones más amplias que su fuente.

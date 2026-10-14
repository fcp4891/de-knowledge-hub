# Lote F3b-rel · Regla del §17 en las fichas de 01 a 09

Corrección de los avisos del chequeo del §17 (`check_related_section` en `backend/content/validate.py`), pedida por Felipe el 2026-10-14 después de la revisión de 10a. Solo cambian `relations`, el §17 y una línea del historial de cada ficha; el estado de verificación no cambia. Después de corregir, el chequeo pasa a **error** de `make validate`, que corre en la CI.

Casos:

- **A:** slug con ficha nombrado en el §17 y fuera de `relations` → se agrega a `relations` (RELATED_TO), con la descripción del renglón del §17 como nota o, si el renglón es solo una lista («Con ficha: …»), el título de la ficha.
- **B:** «pendiente de ficha» con un slug que ya tiene ficha → renglón propio en el §17 y relación.
- **C:** relación que el §17 no nombra → se nombra en el §17 con la nota de la relación. Las tres eran correctas: no se quitó ninguna.
- **D:** slug con ficha nombrado en otra sección y fuera de `relations` → relación y renglón en el §17 que dice en qué sección aparece.

## Avisos corregidos por dominio y caso

| Dominio | Fichas | A | B | C | D | Total |
|---|---|---|---|---|---|---|
| 01-fundamentals | 13 | 21 | 0 | 0 | 4 | 25 |
| 02-sql | 20 | 32 | 0 | 0 | 7 | 39 |
| 03-python | 13 | 23 | 0 | 1 | 7 | 31 |
| 04-data-modeling | 12 | 20 | 0 | 0 | 7 | 27 |
| 05-pipelines | 14 | 22 | 3 | 1 | 0 | 26 |
| 06-orchestration | 11 | 19 | 0 | 1 | 9 | 29 |
| 08-gcp | 9 | 8 | 0 | 0 | 5 | 13 |
| 09-aws | 3 | 0 | 0 | 0 | 3 | 3 |
| **Total** | **95** | **145** | **3** | **3** | **42** | **193** |

El informe del 2026-10-14 daba 201 avisos en 97 fichas. La diferencia (8 avisos, 2 fichas) no son relaciones agregadas: se explica en la sección siguiente.

## Relaciones que no se agregaron ni se quitaron

| Ficha | Slug | Caso original | Decisión | Motivo |
|---|---|---|---|---|
| `dag` | `catchup` | B | Ya estaba en relations | Falso positivo del detector: el renglón dice «ejecuciones pendientes», no «pendiente de ficha». El detector ahora busca «pendiente(s) de ficha». |
| `scheduler` | `catchup` | B | Ya estaba en relations | Falso positivo: «intervalos pendientes». |
| `data-mart` | `data-warehouse` | B | Ya estaba en relations | Falso positivo: «un mart dependiente». |
| `pipeline-dependencies` | `retries` | D | No se agrega | Mención incidental: `retries` es el parámetro de Airflow (§4), no la ficha. Queda en `INCIDENTAL_MENTIONS` del validador. |
| `dag` | `api-ingestion` | D | No se agrega | Mención incidental: el §12 remite a un ejemplo de reintentos de Step Functions; la relación entre las dos fichas no aporta. Queda en `INCIDENTAL_MENTIONS`. |
| `surrogate-keys` | `change-detection` | D | No se agrega | La mención está solo en el §22 (historial de un cambio), no en el contenido. El chequeo ya no mira el §22. |
| `surrogate-keys` | `sql-quality-checks` | D | No se agrega | Ídem: solo en el §22. |
| `testing-with-pytest` | `data-transformation` | D | No se agrega | Ídem: solo en el §22. |

Relaciones quitadas: ninguna.

## Detalle por ficha

| Ficha | Dominio | A | B | C | D |
|---|---|---|---|---|---|
| `batch-vs-streaming` | 01-fundamentals | `late-arriving-data` | — | — | — |
| `data-ingestion` | 01-fundamentals | — | — | — | `data-lake`, `oltp-vs-olap` |
| `data-lake` | 01-fundamentals | `data-warehouse`, `lakehouse` | — | — | — |
| `data-lifecycle` | 01-fundamentals | — | — | — | `data-warehouse` |
| `data-pipeline` | 01-fundamentals | `dag`, `data-contracts` | — | — | — |
| `data-warehouse` | 01-fundamentals | `data-mart`, `lakehouse` | — | — | — |
| `etl-vs-elt` | 01-fundamentals | `data-transformation`, `pipeline-layers` | — | — | — |
| `idempotency` | 01-fundamentals | `backfill`, `replay`, `retries` | — | — | — |
| `json-format` | 01-fundamentals | — | — | — | `python-logging` |
| `parquet-format` | 01-fundamentals | `avro-format`, `compression`, `row-vs-columnar-formats` | — | — | — |
| `partitioning` | 01-fundamentals | `clustering`, `parquet-format`, `partition-pruning` | — | — | — |
| `row-vs-columnar-formats` | 01-fundamentals | `avro-format` | — | — | — |
| `schema-evolution` | 01-fundamentals | `avro-format`, `data-contracts` | — | — | — |
| `cloud-warehouse-optimization` | 02-sql | `predicate-pushdown` | — | — | `bigquery-cost-model` |
| `clustering` | 02-sql | `query-plans` | — | — | — |
| `data-reconciliation` | 02-sql | `change-detection`, `sql-quality-checks` | — | — | — |
| `incremental-load` | 02-sql | `change-detection`, `data-reconciliation`, `dataform-incremental-tables`, `incremental-pipelines` | — | — | — |
| `partition-pruning` | 02-sql | `predicate-pushdown`, `query-plans` | — | — | — |
| `query-plans` | 02-sql | `join-optimization`, `predicate-pushdown`, `scan-reduction` | — | — | — |
| `scan-reduction` | 02-sql | `query-plans` | — | — | `bigquery-clustering`, `bigquery-cost-model`, `bigquery-partitioning`, `materialization-strategies` |
| `scd-type-1` | 02-sql | `sql-nulls` | — | — | — |
| `scd-type-2` | 02-sql | `dimension-tables`, `scd-type-1`, `slowly-changing-dimensions`, `surrogate-keys` | — | — | — |
| `sql-advanced-select` | 02-sql | `sql-qualify` | — | — | — |
| `sql-cte` | 02-sql | `sql-recursive-cte` | — | — | — |
| `sql-date-functions` | 02-sql | `partition-pruning` | — | — | — |
| `sql-joins` | 02-sql | `join-optimization` | — | — | `sql-structs` |
| `sql-json-functions` | 02-sql | — | — | — | `sql-arrays` |
| `sql-merge` | 02-sql | `deduplication`, `sql-qualify`, `sql-window-functions`, `upsert` | — | — | — |
| `sql-nulls` | 02-sql | `change-detection` | — | — | — |
| `sql-subqueries` | 02-sql | `sql-window-functions` | — | — | — |
| `sql-window-functions` | 02-sql | `sql-qualify` | — | — | — |
| `surrogate-key-generation` | 02-sql | `change-detection` | — | — | — |
| `upsert` | 02-sql | `deduplication` | — | — | — |
| `data-validation-with-pydantic` | 03-python | `data-contracts`, `python-typing` | — | — | — |
| `pyspark-dataframes` | 03-python | `parquet-format`, `partitioning` | — | — | — |
| `python-api-consumption` | 03-python | `data-validation-with-pydantic`, `http-clients`, `python-logging` | — | — | — |
| `python-comprehensions` | 03-python | `python-iterators` | — | — | — |
| `python-data-structures` | 03-python | `python-dataframes`, `python-generators` | — | — | — |
| `python-database-io` | 03-python | `database-ingestion` | — | — | `change-data-capture` |
| `python-dataframes` | 03-python | `python-file-processing`, `row-vs-columnar-formats` | — | — | `python-file-handling` |
| `python-error-handling-and-retries` | 03-python | `python-api-consumption`, `python-exceptions`, `python-logging` | — | — | — |
| `python-file-handling` | 03-python | `gcs-buckets-and-objects`, `python-file-processing` | — | — | `parquet-format` |
| `python-file-processing` | 03-python | — | — | — | `beam-programming-model`, `pyspark-dataframes` |
| `python-functions` | 03-python | `python-decorators` | — | — | `python-classes` |
| `python-generators` | 03-python | `python-concurrency`, `python-context-managers`, `python-file-processing` | — | `python-comprehensions` | — |
| `python-pipeline-structure` | 03-python | `python-database-io` | — | — | `data-apis-with-fastapi` |
| `conceptual-data-model` | 04-data-modeling | `normalization` | — | — | — |
| `denormalization` | 04-data-modeling | — | — | — | `physical-data-model` |
| `dimension-tables` | 04-data-modeling | `fact-tables`, `grain`, `star-schema` | — | — | — |
| `fact-tables` | 04-data-modeling | `grain` | — | — | — |
| `kimball-methodology` | 04-data-modeling | `data-mesh`, `one-big-table`, `slowly-changing-dimensions`, `surrogate-keys` | — | — | `denormalization`, `normalization`, `physical-data-model`, `semantic-models` |
| `logical-data-model` | 04-data-modeling | — | — | — | `kimball-methodology` |
| `normalization` | 04-data-modeling | `denormalization` | — | — | — |
| `physical-data-model` | 04-data-modeling | `bigquery-clustering`, `bigquery-partitioning` | — | — | — |
| `slowly-changing-dimensions` | 04-data-modeling | `dimension-tables`, `fact-tables`, `scd-type-1` | — | — | — |
| `snowflake-schema` | 04-data-modeling | `kimball-methodology` | — | — | `physical-data-model` |
| `star-schema` | 04-data-modeling | `grain`, `snowflake-schema` | — | — | — |
| `surrogate-keys` | 04-data-modeling | `dimension-tables`, `surrogate-key-generation` | — | — | — |
| `api-ingestion` | 05-pipelines | `batch-ingestion`, `data-contracts`, `python-api-consumption` | — | — | — |
| `backfill` | 05-pipelines | `catchup`, `data-reconciliation`, `failure-recovery` | — | — | — |
| `batch-ingestion` | 05-pipelines | `data-ingestion` | — | — | — |
| `change-data-capture` | 05-pipelines | `database-ingestion`, `schema-evolution` | — | — | — |
| `checkpoints` | 05-pipelines | — | — | `python-file-handling` | — |
| `dead-letter-queue` | 05-pipelines | `pubsub-delivery-semantics`, `replay`, `retries` | — | — | — |
| `event-driven-pipelines` | 05-pipelines | `event-driven-orchestration`, `pipeline-dependencies` | — | — | — |
| `failure-recovery` | 05-pipelines | `pipeline-dependencies` | — | — | — |
| `file-ingestion` | 05-pipelines | `batch-ingestion`, `csv-format`, `data-lake` | — | — | — |
| `incremental-pipelines` | 05-pipelines | — | `checkpoints` | — | — |
| `pipeline-dependencies` | 05-pipelines | `airflow-architecture` | — | — | — |
| `pipeline-layers` | 05-pipelines | `idempotency` | — | — | — |
| `replay` | 05-pipelines | — | `checkpoints`, `failure-recovery` | — | — |
| `retries` | 05-pipelines | `failure-recovery`, `python-error-handling-and-retries` | — | — | — |
| `airflow-architecture` | 06-orchestration | `airflow-operators-and-hooks`, `open-source-vs-managed-orchestration` | — | — | — |
| `airflow-operators-and-hooks` | 06-orchestration | `open-source-vs-managed-orchestration` | — | `idempotency` | — |
| `catchup` | 06-orchestration | `data-orchestration`, `pipeline-dependencies`, `scheduler` | — | — | — |
| `dag` | 06-orchestration | `data-orchestration`, `pipeline-dependencies`, `scheduler` | — | — | — |
| `dynamic-workflows` | 06-orchestration | `idempotency`, `retries` | — | — | `open-source-vs-managed-orchestration`, `pyspark-dataframes` |
| `event-driven-orchestration` | 06-orchestration | `catchup`, `dag` | — | — | `orchestration-landscape` |
| `orchestration-landscape` | 06-orchestration | — | — | — | `catchup`, `pipeline-dependencies` |
| `orchestration-observability` | 06-orchestration | `scheduler` | — | — | — |
| `orchestration-task` | 06-orchestration | `airflow-operators-and-hooks`, `dynamic-workflows` | — | — | `airflow-architecture`, `open-source-vs-managed-orchestration`, `orchestration-observability` |
| `scheduler` | 06-orchestration | `airflow-architecture`, `data-orchestration`, `pipeline-dependencies` | — | — | — |
| `sensors` | 06-orchestration | — | — | — | `open-source-vs-managed-orchestration` |
| `bigquery-architecture` | 08-gcp | — | — | — | `bigquery-query-optimization`, `cloud-warehouse-optimization` |
| `bigquery-clustering` | 08-gcp | `clustering` | — | — | — |
| `bigquery-cost-model` | 08-gcp | `scan-reduction` | — | — | — |
| `bigquery-incremental-models` | 08-gcp | — | — | — | `change-data-capture` |
| `bigquery-partitioning` | 08-gcp | `bigquery-clustering`, `bigquery-cost-model`, `partition-pruning` | — | — | — |
| `bigquery-sql-dialect` | 08-gcp | — | — | — | `bigquery-security` |
| `cloud-run-for-data` | 08-gcp | — | — | — | `event-driven-pipelines` |
| `gcs-buckets-and-objects` | 08-gcp | `data-lake`, `pubsub-topics-and-subscriptions` | — | — | — |
| `pubsub-topics-and-subscriptions` | 08-gcp | `streaming-ingestion` | — | — | — |
| `athena-serverless-queries` | 09-aws | — | — | — | `lake-formation-permissions` |
| `emr-spark-clusters` | 09-aws | — | — | — | `lake-formation-permissions` |
| `lake-formation-permissions` | 09-aws | — | — | — | `bigquery-security` |

## Validación

- `make validate`: OK con el chequeo como error; los tests del validador cubren los cuatro casos, el historial, los falsos positivos de «pendiente» y las menciones incidentales.
- Ninguna ficha cambió de `verification_status`.

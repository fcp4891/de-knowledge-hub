# Revisión B-F3.1 · Lote 2

Fichas en `content/concepts/`. Carril B no las edita. Cada fila queda **pendiente**. No hay comentarios `VERIFY`. Las fuentes citadas son documentación oficial (nivel 1); el problema, cuando lo hay, es una afirmación que no queda en la nota de esa fuente.

Las 10: `backfill`, `replay`, `retries` (pattern), `pubsub-delivery-semantics`, `data-pipeline`, `incremental-pipelines` (pattern), `late-arriving-data`, `partition-pruning`, `upsert` (pattern) y `bigquery-clustering`.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | Los que escriben datos van en una transacción o en una sola sentencia con condición de versión (`backfill`, `late-arriving-data`, `incremental-pipelines`, `upsert`). `replay`, `retries` y `pubsub-delivery-semantics` describen la escritura idempotente y no usan `DELETE` + `INSERT` sueltos. `data-pipeline` delega el reemplazo a `replace_partition` sin mostrar la transacción. `partition-pruning` y `bigquery-clustering` no escriben un lote. | pendiente |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | pendiente |

## `backfill`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, cómo funciona, errores, costo, seguridad y observabilidad están. La escala queda en limitar la concurrencia. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | CLI de Airflow, transacciones de BigQuery, bookmarks de Glue y tumbling window de Data Factory están en notas de nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El `DELETE` + `INSERT` del día va dentro de `BEGIN` / `COMMIT`. No marco un error. | pendiente |
| Ejemplos poco realistas | Backfill de un mes con concurrencia limitada y reemplazo de la partición del día es realista. La ficha pide confirmar las opciones de la CLI si la versión no es la 3.3.2 del ejemplo. | pendiente |
| Relaciones faltantes | `idempotency`, `partitioning`, `replay` e `incremental-load` están en `relations`. | pendiente |

## `replay`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas en el cuerpo y en §14. El costo de retención y de reproceso está en la viñeta de costo. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Seek y snapshots de Pub/Sub, retención de Kinesis (24 h a 365 días) y retención por tier de Event Hubs están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El seek reentrega al menos una vez y la ficha lo dice. No marco un error. | pendiente |
| Ejemplos poco realistas | Snapshot antes de un despliegue y seek tras el rollback es un procedimiento real. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `retries`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. La seguridad (no reintentar fallos de credenciales) y el costo de repetir llamadas de pago están en §14. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Backoff de Pub/Sub (0 a 600 s), visibility timeout de SQS (30 s por defecto) y max delivery count de Service Bus están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo deja claro que la operación tiene que ser idempotente. El jitter es completo (`uniform` entre 0 y el tope). No marco un error. | pendiente |
| Ejemplos poco realistas | Suscripción con backoff, dead-letter a los 10 intentos y `MERGE` por `message_id` es realista. | pendiente |
| Relaciones faltantes | Las tres de `related_topics` están en `relations`. | pendiente |

## `pubsub-delivery-semantics`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas, incluida la diferencia entre la garantía de entrega y la escritura en el destino. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | At-least-once, exactly-once solo en pull y en una región, ordering key, reentrega en cascada, backoff y dead-letter (5 a 100) están en las fuentes de Pub/Sub. SQS y Event Hubs diferencian el mecanismo. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El esquema confirma después de escribir. No marco un error. | pendiente |
| Ejemplos poco realistas | Ordering key por `customer_id`, backoff, dead-letter y `MERGE` por clave y versión es realista. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `data-pipeline`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas en §14 y en el trade-off de tareas pequeñas frente a tareas grandes. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Airflow, Dataflow, Glue y Data Factory están en notas de nivel 1. «Managed Service for Apache Airflow (ex Cloud Composer)» no tiene fuente; `backfill` sigue diciendo Cloud Composer. Propuesta: citar la página del nombre o usar el que esté en la fuente. | pendiente |
| Errores técnicos o simplificaciones peligrosas | `replace_partition` se declara idempotente y no se muestra la transacción. Propuesta: enseñar el `BEGIN` / `COMMIT` o remitir al ejemplo de `backfill`. | pendiente |
| Ejemplos poco realistas | Dag diario con fecha lógica, validación y reemplazo de la partición es realista. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `incremental-pipelines`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. El costo por bytes de etapa y la tabla de control están en §14. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dataform, transacciones y DML de BigQuery, bookmarks de Glue y la carga incremental de Data Factory están en las notas. El mismo nombre «ex Cloud Composer» queda sin fuente (ver `data-pipeline`). | pendiente |
| Errores técnicos o simplificaciones peligrosas | El `MERGE` y el avance del watermark van en la misma transacción, y el lote se deduplica. El watermark nuevo es `MAX(updated_at)` de **toda** la tabla destino, no del lote leído: una fila ya presente con un timestamp futuro adelanta la marca y la siguiente ejecución se salta filas de staging. Si no existe la fila de `etl_control`, el `UPDATE` no inserta nada y el `COMMIT` igual tiene éxito. Propuesta: tomar el máximo del lote y no avanzar si la fila de control no se actualizó. | pendiente |
| Ejemplos poco realistas | CDC a raw, control de offset y recálculo solo de las fechas afectadas es realista. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `late-arriving-data`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. El costo de una ventana de relectura amplia está en §14. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Watermark y late data de Dataflow, event time de Managed Flink y `TIMESTAMP BY` más out-of-order de Stream Analytics están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El recálculo de tres días es un reemplazo completo dentro de una transacción. No marco un error. | pendiente |
| Ejemplos poco realistas | Ventanas de 5 minutos con margen, tabla de tardíos y batch diario que reincorpora es realista. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `partition-pruning`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. §14 dice que el pruning no sustituye a un control de acceso. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Pruning y dry run de BigQuery, particiones de Athena (incluido el catálogo) y el criterio de Synapse (60 distribuciones, 1 millón de filas) están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo separa un filtro constante, que poda, de una subconsulta sobre la misma tabla, que no. No marco un error. | pendiente |
| Ejemplos poco realistas | El tablero que escanea años por un `MAX(fecha)` en subconsulta es un caso habitual. | pendiente |
| Relaciones faltantes | Las tres de `related_topics` están en `relations`. | pendiente |

## `upsert`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. Privilegios, conteos por lote y bytes del `MERGE` están en §14. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `ON CONFLICT` de PostgreSQL, el error de cardinalidad de BigQuery, el `MERGE` de Redshift y el de T-SQL están en las notas. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo de PostgreSQL es una sentencia con condición de versión. El de BigQuery deduplica antes del `MERGE`. La sección de Redshift coincide con la corrección de `cb77a2f`: falla si hay varias filas de origen por fila destino, y `REMOVE DUPLICATES` no admite `WHEN`. No marco un error. | pendiente |
| Ejemplos poco realistas | Micro-lote de CDC deduplicado por versión es realista. | pendiente |
| Relaciones faltantes | Las cuatro de `related_topics` están en `relations`. | pendiente |

## `bigquery-clustering`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas. El costo (sin estimación exacta previa) y el hecho de que el clustering no restringe el acceso están en §14. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Cuatro columnas, 1.024 caracteres en `STRING`, reclustering automático y la recomendación de 10 GB por partición están en la nota de BigQuery. Sort keys de Redshift (bloques de 1 MB, `COMPOUND` e `INTERLEAVED` hasta ocho) y el columnstore ordenado de Synapse están en sus notas. Las diferencias entre nubes se enuncian. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El `WHERE` filtra por la expresión de partición y por la primera columna de clustering. No marco un error. | pendiente |
| Ejemplos poco realistas | Eventos de varios TB, partición por día y clustering por `tenant_id` es realista. | pendiente |
| Relaciones faltantes | Las tres de `related_topics` están en `relations`. | pendiente |

## Corrección de MERGE en Redshift (`cb77a2f`)

Afecta a `sql-merge`, `scd-type-2` e `idempotency`, fichas ya aprobadas en el lote 1. La contrasté el 2026-09-30 con [MERGE - Amazon Redshift](https://docs.aws.amazon.com/redshift/latest/dg/r_MERGE.html).

La página dice:

- En el `MERGE` con `WHEN`, una fila del destino no puede coincidir con varias del origen. El ejemplo oficial falla con `ERROR: Found multiple matches to update the same tuple` cuando el origen tiene dos filas con el mismo `id`.
- `REMOVE DUPLICATES` es otro modo: sin cláusulas `WHEN`, con el mismo número de columnas, tipos compatibles y el mismo orden. Si varias filas **del destino** coinciden con la misma fila de origen, elimina esas duplicadas, conserva una y la actualiza. Las duplicadas del destino que no coinciden con ninguna fila de origen se quedan.

El commit corrige el texto anterior, que atribuía ese borrado silencioso al `MERGE` normal. `sql-merge` (§12 y errores frecuentes), `scd-type-2` (§12) e `idempotency` (§12 y la nota de fuente) quedan alineados con los dos primeros puntos, y `upsert` del lote 2 también.

| Criterio | Hallazgo | Estado |
|---|---|---|
| ¿Coincide con la documentación oficial? | Sí en el fallo del modo normal y en que el borrado de duplicados del destino es solo de `REMOVE DUPLICATES`, con las condiciones de columnas que cita `sql-merge`. | pendiente |
| Qué falta | Ninguna de las tres fichas dice que, en `REMOVE DUPLICATES`, las filas duplicadas del destino que **no** coinciden con el origen no se tocan. Propuesta: añadirlo a la nota de `aws-redshift-docs` y a §12 de `sql-merge`. | pendiente |

# Revisión B-F3.1 · Lote 6

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-05, incluidas las tres precisiones de `bigquery-cost-model`: compromisos solo de Enterprise y Enterprise Plus, time travel y fail-safe en almacenamiento físico, y BigQuery ML dentro de los slots de esas ediciones. No hay comentarios `VERIFY`. Las diez están en `review_required`.

Las 10: `row-vs-columnar-formats`, `testing-with-pytest`, `sql-window-functions`, `grain`, `data-warehouse`, `streaming-ingestion`, `oltp-vs-olap`, `bigquery-cost-model`, `acid` y `normalization`.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | aprobada |
| Ejemplos atómicos e idempotentes | `acid` mete el `DELETE` y el `INSERT` del día en una transacción y revierte si falla. `sql-window-functions` y `normalization` son consultas o DDL de lectura del modelo. `streaming-ingestion` deduplica la vista con `QUALIFY` porque la entrega es al menos una vez. `testing-with-pytest` no escribe en la nube. `bigquery-cost-model` estima con `--dry_run` y corta con `--maximum_bytes_billed`. | aprobada |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | aprobada |
| Nivel 4 solo conceptual | Kimball en `grain` y `normalization` respalda el grano y la forma dimensional. `NOT ENFORCED`, Dataform y los tests de dbt están en notas Nivel 1. No encontré una afirmación de producto que se apoye solo en Kimball. | aprobada |

## `bigquery-cost-model`

Consulté la página de precios de BigQuery y *Estimate and control costs* el 2026-10-05.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Sin montos | No hay precios en dólares ni tarifas. Hay tamaños y reglas del modelo: una tabla de ejemplo de 2 TB, un límite de 10 GB en el comando, el mínimo de 10 MB y los 90 días del almacenamiento long-term. | aprobada |
| On-demand | Coincide con la página de precios: se cobran los bytes procesados; no se cobra una consulta con error ni una servida desde caché; el redondeo es al MB, con mínimo de 10 MB por tabla referenciada y por consulta; cancelar puede cobrar hasta el costo completo. `LIMIT` no reduce el costo en tablas no clusterizadas. El máximo de bytes facturados hace fallar sin cargo, y en tablas clusterizadas la estimación es una cota superior. | aprobada |
| Capacidad | Ediciones Standard, Enterprise y Enterprise Plus; slots en el tiempo, con reservas; no cubre almacenamiento, BI Engine, inserciones streaming ni la Storage API. Los compromisos de 1 y 3 años, según la misma página, son de Enterprise y Enterprise Plus, no de Standard. La ficha los presenta junto a las tres ediciones. Propuesta: decir que Standard es pago por uso y que el compromiso es de las otras dos. | aprobada |
| Almacenamiento | Activo si hubo modificación en 90 días y long-term si no; lógico (por defecto) o físico por dataset. La página dice que time travel y fail-safe no se cobran en el modelo lógico y sí en el físico. La ficha dice que ocupan almacenamiento, sin esa distinción. Propuesta: precisarlo. | aprobada |
| BigQuery ML | La introducción de la página de precios lo lista entre lo que se cobra aparte. Más abajo dice que, en Enterprise y Enterprise Plus, el uso de BigQuery ML entra en los slots. La tabla de la ficha lo deja siempre en «aparte». Propuesta: distinguir el caso de esas ediciones. | aprobada |

## `row-vs-columnar-formats`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es cada formato, cuándo sí y cuándo no, Parquet y Avro, BigQuery, Athena y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Columnar en Redshift y BigQuery, Parquet, Avro y Fabric están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | Distingue el acceso por fila del acceso por columna y no los presenta como lo mismo. No marco un error. | aprobada |
| Ejemplos poco realistas | Una consulta analítica que lee pocas columnas de un hecho grande es el caso habitual. | aprobada |
| Relaciones faltantes | `parquet-format`, `data-warehouse`, `data-lake`, `partition-pruning` y `oltp-vs-olap` están en `relations`. | aprobada |

## `testing-with-pytest`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué prueba, cuándo sí y cuándo no, el emulador y los tests de datos, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | pytest, el emulador de Pub/Sub, aserciones de Dataform y tests de dbt están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El ejemplo no llama a la red. El parametrizado más los otros dos suman 5 tests, como dice el texto. No marco un error. | aprobada |
| Ejemplos poco realistas | Normalizar un monto de un CSV y rechazar un negativo es una prueba de ingesta real. | aprobada |
| Relaciones faltantes | `python-api-consumption`, `python-error-handling-and-retries`, `data-validation-with-pydantic`, `batch-ingestion` e `idempotency` están en `relations`. | aprobada |

## `sql-window-functions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es una ventana, cuándo sí y cuándo no, `ROWS` frente a `RANGE`, BigQuery, Redshift y T-SQL, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Ventanas, `QUALIFY` y el marco por defecto están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El ejemplo de CL da acumulado 100, 220 y 310, variación nula, 20 y −30, y medias 100, 110 y 103,33. `RANGE` sobre `UNIX_DATE` está explicado. No marco un error. | aprobada |
| Ejemplos poco realistas | Acumulado, variación y media móvil de ventas diarias es habitual. | aprobada |
| Relaciones faltantes | `deduplication`, `scd-type-2` y `late-arriving-data` están en `relations`. | aprobada |

## `grain`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es el grano, cuándo sí y cuándo no, atómico frente a agregado, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La declaración del grano es de Kimball (Nivel 4, conceptual). `NOT ENFORCED`, `uniqueKeys` de Dataform y los tests de dbt están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La aserción cubre la clave del grano y el texto dice que BigQuery no impide duplicados. No marco un error. | aprobada |
| Ejemplos poco realistas | Una línea de ticket como grano, con unicidad de `ticket_id` y `linea`, es habitual. | aprobada |
| Relaciones faltantes | `fact-tables`, `star-schema`, `dimension-tables` y `deduplication` están en `relations`. | aprobada |

## `data-warehouse`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, capas, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | BigQuery, Redshift y Fabric Warehouse están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | Distingue el warehouse del lake y no los presenta como lo mismo. No marco un error. | aprobada |
| Ejemplos poco realistas | Staging, un modelo en estrella y consumo de BI es un warehouse habitual. | aprobada |
| Relaciones faltantes | `data-lake`, `star-schema`, `etl-vs-elt` y `partitioning` están en `relations`. | aprobada |

## `streaming-ingestion`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, al menos una vez, Pub/Sub, Kinesis, Firehose y Event Hubs, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Pub/Sub, Dataflow, Storage Write API, Spark, Kinesis, Firehose y Event Hubs están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La suscripción de export no se presenta como exactamente una vez. La vista deduplica por `event_id`. No marco un error. | aprobada |
| Ejemplos poco realistas | Export de Pub/Sub a una tabla raw y una vista que se queda con el evento más nuevo es habitual. | aprobada |
| Relaciones faltantes | `batch-vs-streaming`, `batch-ingestion`, `pubsub-topics-and-subscriptions`, `pubsub-delivery-semantics`, `late-arriving-data` y `deduplication` están en `relations`. | aprobada |

## `oltp-vs-olap`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es cada uno, cuándo sí y cuándo no, fila frente a columna, replicación, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | OLTP y OLAP, BigQuery, Redshift y Fabric están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | No los presenta como intercambiables. No marco un error. | aprobada |
| Ejemplos poco realistas | Transacciones en el operacional y reportes sobre una réplica analítica es el corte habitual. | aprobada |
| Relaciones faltantes | `row-vs-columnar-formats`, `data-warehouse`, `change-data-capture`, `normalization` y `acid` están en `relations`. | aprobada |

## `acid`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Las cuatro propiedades, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Transacciones de PostgreSQL, BigQuery, Redshift y Fabric están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El reemplazo del día va en `BEGIN` / `COMMIT` y el error hace `ROLLBACK`. El ejemplo de PostgreSQL aborta el par de `UPDATE` si el saldo queda negativo. No marco un error. | aprobada |
| Ejemplos poco realistas | Reemplazar la partición del día dentro de una transacción es una carga real. | aprobada |
| Relaciones faltantes | `oltp-vs-olap`, `idempotency`, `sql-merge` y `scd-type-2` están en `relations`. | aprobada |

## `normalization`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, formas y desnormalización, BigQuery, Redshift y Fabric, seguridad y costo están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La normalización operativa es de Microsoft Learn (Nivel 1). La desnormalización dimensional de Kimball es Nivel 4 y conceptual. Anidados en BigQuery y distribución en Redshift están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La vista refleja el estado actual y el texto dice que, en el warehouse, la historia va en dimensiones SCD. No marco un error. | aprobada |
| Ejemplos poco realistas | Pedido, línea, cliente y producto, con una vista plana para leer, es un modelo habitual. | aprobada |
| Relaciones faltantes | `oltp-vs-olap`, `star-schema`, `dimension-tables` y `surrogate-keys` están en `relations`. | aprobada |

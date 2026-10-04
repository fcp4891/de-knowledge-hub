# Revisión B-F3.1 · Lote 5

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-04, incluidas `dbt-fabric` y `dbt-fabricspark`, la fuente de Preview de `onSchemaChange` y la viñeta de Observabilidad en §14. No hay comentarios `VERIFY`. Las diez están en `review_required`.

Las 10: `data-lake`, `python-logging`, `airflow-architecture`, `data-validation-with-pydantic`, `batch-ingestion`, `star-schema`, `dataform-incremental-tables`, `pubsub-topics-and-subscriptions`, `deduplication` y `fact-tables`.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Seguridad y costo están como viñetas en las 10. Ninguna tiene viñeta **Observabilidad**. `python-logging` trata de logs, y `pubsub-topics-and-subscriptions` nombra el backlog en §11, pero no como esa viñeta. Propuesta: agregarla en §14, como en los lotes anteriores. | aprobada |
| Ejemplos atómicos e idempotentes | `batch-ingestion` reemplaza la partición del día con `WRITE_TRUNCATE`. `deduplication` es una consulta de lectura y remite el `MERGE` al snippet. `dataform-incremental-tables` fusiona con `uniqueKey`. `data-lake` y `fact-tables` crean con `IF NOT EXISTS`. `star-schema` es un `SELECT`. `pubsub-topics-and-subscriptions` declara recursos. `data-validation-with-pydantic` y `python-logging` no escriben en un almacén. El bash de `airflow-architecture` arranca procesos y no carga datos. | aprobada |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | aprobada |
| Nivel 4 solo conceptual | Kimball en `star-schema` y `fact-tables` respalda la forma del modelo. `NOT ENFORCED`, la distribución de Redshift y los tipos de hecho en Fabric están en notas Nivel 1. No encontré una afirmación de producto que se apoye solo en Kimball. | aprobada |

## Comprobaciones pedidas

| Criterio | Hallazgo | Estado |
|---|---|---|
| Airflow en Fabric | Microsoft Learn (*What is an Apache Airflow job?*) lista solo la versión **2.10.5** y Python 3.12. No lista Airflow 3. `airflow-architecture` §13 dice eso y distingue esa arquitectura de la de Airflow 3. El bash de §10 es de Airflow 3 autogestionado, no de Fabric. | aprobada |
| Adaptador `dbt-fabric` | Existe en Microsoft Learn: *Set up dbt for Fabric Data Warehouse* (`pip install dbt-fabric`, `type: fabric`) para Fabric Data Warehouse. `dataform-incremental-tables` §13 solo dice que la tabla de *Supported data platforms* de dbt no incluye Fabric. Propuesta: agregar que Learn documenta `dbt-fabric`, con fuente `microsoft-learn` y URL `https://learn.microsoft.com/en-us/fabric/data-warehouse/tutorial-setup-dbt`, y dejar dicha la diferencia con la tabla de dbt. Para Lakehouse, Learn documenta otro paquete, `dbt-fabricspark` (`https://learn.microsoft.com/en-us/fabric/data-factory/dbt-job-overview`); no mezclarlos. | aprobada |
| `onSchemaChange` en Preview | Sigue en Preview: la referencia de Dataform core dice «This feature is in Preview» y las release notes del 2025-09-08 no tienen una nota posterior de disponibilidad general. La página *Create tables* consultada el 2026-10-04 describe la opción y exige Dataform core 3.0.11, pero no repite «Preview» ni que falte en la CLI. Propuesta: citar la referencia de core (`https://docs.cloud.google.com/dataform/docs/reference/dataform-core-reference`) para Preview. La frase «no está disponible en la CLI» no está en la página que cita la nota; un mantenedor lo confirmó en el issue 2039 de `dataform-co/dataform` (2025-11-09), que no es documentación de producto. | aprobada |

## `data-lake`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, zonas, cuándo sí y cuándo no, GCP, AWS y Azure con diferencias, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | BigLake, Lake Formation y el espacio de nombres jerárquico están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La tabla externa exige filtro de partición y distingue BigLake de una externa común. No marco un error. | aprobada |
| Ejemplos poco realistas | Parquet particionado `dt=` en un bucket curated, consultado con BigLake, es un lake habitual. | aprobada |
| Relaciones faltantes | `parquet-format`, `gcs-buckets-and-objects`, `partitioning`, `schema-evolution` y `etl-vs-elt` están en `relations`. | aprobada |

## `python-logging`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, JSON a stdout, Cloud Logging, CloudWatch y Azure Monitor con diferencias, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `logging`, Cloud Logging, el primer JSON de Logs Insights y Log Analytics están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El formatter usa la biblioteca estándar y deja fuera los atributos de `LogRecord`. No marco un error. | aprobada |
| Ejemplos poco realistas | Una línea JSON por lote, con `batch_id`, es un log de pipeline real. | aprobada |
| Relaciones faltantes | `python-error-handling-and-retries`, `python-api-consumption` y `data-pipeline` están en `relations`. | aprobada |

## `airflow-architecture`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Componentes, cuándo sí y cuándo no, Composer, MWAA y Fabric, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La arquitectura de Airflow 3, Composer, MWAA y los jobs de Fabric (2.10.5, Python 3.12) están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | No marco un error. La versión de Fabric coincide con Microsoft Learn (ver comprobaciones). | aprobada |
| Ejemplos poco realistas | Arrancar scheduler, Dag processor y API server contra PostgreSQL es una instalación de una máquina. | aprobada |
| Relaciones faltantes | `scheduler`, `dag`, `catchup` y `backfill` están en `relations`. | aprobada |

## `data-validation-with-pydantic`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué valida, cuándo sí y cuándo no, rechazados, schemas de Pub/Sub y de Glue, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Pydantic 2, schemas de Pub/Sub, Glue Schema Registry y Event Hubs están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | `extra="forbid"`, `Decimal` y `errors(include_input=False)` coinciden con el uso de Pydantic 2. No marco un error. | aprobada |
| Ejemplos poco realistas | Validar páginas JSON de pedidos en el borde, y apartar los inválidos, es habitual. | aprobada |
| Relaciones faltantes | `python-api-consumption`, `schema-evolution`, `dead-letter-queue` y `python-error-handling-and-retries` están en `relations`. | aprobada |

## `batch-ingestion`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, el período, BigQuery, Redshift y Data Factory, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Load jobs, `WRITE_TRUNCATE`, `COPY`, manifest y Copy activity están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El ejemplo reemplaza la partición del día y dice que `COPY` agrega. No marco un error. | aprobada |
| Ejemplos poco realistas | Parquet de un día en `dt=` y un load job que trunca esa partición es una carga batch habitual. | aprobada |
| Relaciones faltantes | `batch-vs-streaming`, `file-ingestion`, `api-ingestion`, `idempotency`, `backfill` e `incremental-load` están en `relations`. | aprobada |

## `star-schema`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, grano, dimensiones conformadas, cuándo sí y cuándo no, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | La forma de la estrella es de Kimball (Nivel 4, conceptual). BigQuery, Redshift y Fabric están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La consulta filtra la fecha del hecho y agrega medidas. No marco un error. | aprobada |
| Ejemplos poco realistas | Ventas por categoría y región en un mes es una consulta analítica habitual. | aprobada |
| Relaciones faltantes | `fact-tables`, `dimension-tables`, `surrogate-keys` y `slowly-changing-dimensions` están en `relations`. | aprobada |

## `dataform-incremental-tables`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, `uniqueKey`, poda, full refresh, cuándo sí y cuándo no, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dataform y dbt están en notas Nivel 1. `onSchemaChange` y `dbt-fabric` están en las comprobaciones pedidas. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El margen de relectura y `updatePartitionFilter` se explican juntos. No marco un error de SQL. Preview y la CLI están en las comprobaciones. | aprobada |
| Ejemplos poco realistas | Una incremental de eventos con `uniqueKey` y un margen de 2 horas es habitual. | aprobada |
| Relaciones faltantes | `incremental-load`, `idempotency`, `partition-pruning`, `bigquery-partitioning` y `schema-evolution` están en `relations`. | aprobada |

## `pubsub-topics-and-subscriptions`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Topic, suscripción, filtro, dead letter, cuándo sí y cuándo no, SNS/SQS y Service Bus, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Pub/Sub, el provider de Google, SNS y Service Bus están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El HCL no incluye los bindings del agente de servicio y el comentario lo dice. El filtro se presenta como inmutable. No marco un error. | aprobada |
| Ejemplos poco realistas | Un topic de pedidos, una suscripción filtrada por región y una dead letter con su suscripción es un diseño real. | aprobada |
| Relaciones faltantes | `pubsub-delivery-semantics`, `dead-letter-queue`, `replay` e `infrastructure-as-code` están en `relations`. | aprobada |

## `deduplication`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, el desempate, BigQuery y T-SQL, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `QUALIFY`, `ROW_NUMBER` y el `MERGE` que falla con duplicados en el origen están en notas Nivel 1. No hay fuente Nivel 4. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El `ORDER BY` incluye `version` e `ingested_at`. No marco un error. | aprobada |
| Ejemplos poco realistas | Quedarse con la versión más nueva de cada cliente en staging es habitual. | aprobada |
| Relaciones faltantes | `upsert`, `sql-merge`, `idempotency` y `pubsub-delivery-semantics` están en `relations`. | aprobada |

## `fact-tables`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Grano, tipos de hecho, aditividad, cuándo sí y cuándo no, BigQuery, Redshift y Fabric, seguridad y costo están. Falta la viñeta de observabilidad (ver criterios heredados). | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Los tipos de hecho y la aditividad son de Kimball (Nivel 4, conceptual). `NOT ENFORCED`, la distribución de Redshift y los tres tipos en Fabric están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | Las claves se declaran `NOT ENFORCED` y el texto dice que BigQuery no las valida. El ratio se calcula con `SAFE_DIVIDE` sobre sumas. No marco un error. | aprobada |
| Ejemplos poco realistas | Una línea de ticket con claves sustitutas, partición por fecha y un porcentaje calculado al consultar es habitual. | aprobada |
| Relaciones faltantes | `dimension-tables`, `surrogate-keys` y `star-schema` están en `relations`. | aprobada |

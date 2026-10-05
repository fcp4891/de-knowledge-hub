# Revisión B-F3.1 · Lote F3b-01a

Fichas en `content/concepts/`. Carril B no las edita. Todas las filas quedan en **pendiente**. No hay comentarios `VERIFY`. Las diez están en `review_required`.

Las 10: `what-is-data-engineering`, `data-lifecycle`, `data-ingestion`, `data-transformation`, `data-orchestration`, `lakehouse`, `data-mart`, `schema-on-read-vs-schema-on-write`, `data-consistency` y `cap-theorem`.

También el cambio de tipos en la §10 de `data-validation-with-pydantic` (sigue `verified`).

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | Las cargas usan `--replace` o `CREATE OR REPLACE`. El HCL de `data-lifecycle` y `data-mart` es declarativo; el IAM de la vista es `google_bigquery_table_iam_member` y el comentario advierte que `core` no debe gestionar accesos con bloques `access`. `data-ingestion` dice que el streaming puede duplicar. `cap-theorem` y `data-consistency` son simulaciones. | pendiente |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | pendiente |
| Nivel 4 solo conceptual | Gilbert y Lynch en `cap-theorem` respaldan el teorema. Kimball en `data-mart` respalda el bus y las dimensiones conformadas. Las afirmaciones de producto están en notas Nivel 1. | pendiente |

## `cap-theorem`

Consulté el PDF de Gilbert y Lynch (2002) en el MIT CSAIL y la página de niveles de consistencia de Cosmos DB el 2026-10-05.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Enunciado | El teorema de la §2 coincide con el Teorema 1: en el modelo asíncrono, con mensajes que pueden perderse, no se puede implementar una memoria atómica de lectura y escritura que responda a toda solicitud. La C se define como consistencia atómica (cada operación en un instante único), no como la C de ACID. PACELC aparece como marco aparte, citado desde Cosmos DB, para el caso sin partición. No lo presenta como el teorema. | pendiente |
| Disponibilidad | Gilbert y Lynch exigen respuesta a toda solicitud recibida por un nodo que no ha fallado. La ficha dice «toda solicitud recibe una respuesta en algún momento», sin el nodo que no ha fallado. Propuesta: precisarlo. | pendiente |

## `lakehouse`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Complemento, no reemplazo | La descripción, el resumen, el «cuándo no», el ejemplo de producción y la relación con `data-warehouse` lo dicen así. El error frecuente es presentarlo como reemplazo inmediato. No marco un error. | pendiente |
| Lake Formation | La viñeta de Seguridad nombra Lake Formation junto a BigLake y Fabric. BigLake y Fabric tienen fuente en la ficha; Lake Formation no. Propuesta: citarlo o quitar el nombre. | pendiente |

## `what-is-data-engineering`

Consulté las páginas de certificación de Google Cloud y AWS, y las de Fabric Data Engineering y Fabric Data Engineer Associate, el 2026-10-05.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Qué respalda cada fuente | Google Cloud: recolectar, transformar, almacenar y entregar; infraestructura con rendimiento y seguridad; necesidades de negocio y regulatorias. AWS: ingerir y transformar, orquestar pipelines, diseñar modelos, gestionar ciclos de vida y asegurar calidad. Microsoft: recolectar, almacenar, procesar y analizar, con calidad; la certificación pide patrones de carga, arquitecturas, orquestación, y también asegurar y monitorear. Las §11–§13 siguen esas distinciones. | pendiente |
| Lista común del resumen | El resumen dice que las tres fuentes describen el rol con las mismas piezas: ingesta, transformación, orquestación, modelado, ciclo de vida, calidad y seguridad. Esa lista es la unión, no lo que dice cada página. Propuesta: no atribuir la lista entera a las tres. | pendiente |
| Productos de la §11 | Cloud Storage, BigQuery, Pub/Sub, Dataflow, Dataform y Managed Airflow no aparecen en la página de la certificación. Propuesta: separarlos de lo que esa página afirma. | pendiente |

## `data-validation-with-pydantic` · cambio de tipos

| Criterio | Hallazgo | Estado |
|---|---|---|
| `list[dict[str, Any]]` | En §10, el retorno de `validate_page` y la variable `rejected` pasan de `list[dict]` a `list[dict[str, Any]]`, con `from typing import Any`. El valor sigue siendo `{"raw": ..., "errors": ...}`, así que `rejected[0]["errors"]` no cambia de comportamiento. El historial lo registra. No marco un error. | pendiente |

## `data-lifecycle`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es el ciclo, cuándo sí y cuándo no, retención en las tres nubes, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Lifecycle de Cloud Storage, S3 y Blob, y la expiración por defecto de tablas en BigQuery, están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | Si varias reglas aplican, gana `Delete`, como dice la documentación. El HCL usa `SetStorageClass` a `COLDLINE` y `Delete`. No marco un error. | pendiente |
| Ejemplos poco realistas | Raw a clase fría y staging que expira es un diseño habitual. | pendiente |
| Relaciones faltantes | `what-is-data-engineering`, `data-ingestion`, `data-transformation`, `data-lake` y `gcs-buckets-and-objects` están en `relations`. | pendiente |

## `data-ingestion`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, los modos, cuándo sí y cuándo no, las tres nubes, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Load jobs, Data Transfer Service, Pub/Sub, Datastream, `EXTERNAL_QUERY`, DMS, Kinesis y Copy activity están en notas Nivel 1. La tabla y las §12–§13 nombran también `COPY` de Redshift, Glue, Event Hubs, el mirroring de Fabric y Debezium, sin fuente en la ficha. Propuesta: citarlos o dejarlos fuera. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El batch reemplaza la tabla del día y el texto dice que el streaming puede duplicar. No marco un error. | pendiente |
| Ejemplos poco realistas | Archivo nocturno, CDC, eventos y una consulta federada puntual es una mezcla habitual. | pendiente |
| Relaciones faltantes | `batch-ingestion`, `streaming-ingestion`, `change-data-capture`, `file-ingestion`, `api-ingestion` y `data-pipeline` están en `relations`. | pendiente |

## `data-transformation`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, ETL y ELT, cuándo sí y cuándo no, Dataform, Glue y Data Factory, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dataform, `SAFE_CAST`, `QUALIFY`, tests de dbt, Glue y mapping data flows están en notas Nivel 1. Las consultas continuas se marcan Preview en la nota. «ELT en Redshift, a menudo con dbt» no tiene fuente de Redshift en la ficha. Propuesta: citarlo o no afirmar el hábito. | pendiente |
| Errores técnicos o simplificaciones peligrosas | `REPLACE` del punto convierte `'1.250'` en 1250, que es el ejemplo de separador de miles. El mismo código convierte `'10.50'` en 1050 sin error. Propuesta: decir en el comentario que el punto se trata como separador de miles. | pendiente |
| Ejemplos poco realistas | Capas staging, intermedias y marts con tests es un repositorio habitual. | pendiente |
| Relaciones faltantes | `etl-vs-elt`, `data-pipeline`, `deduplication`, `star-schema` y `dataform-incremental-tables` están en `relations`. | pendiente |

## `data-orchestration`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, Airflow, Step Functions y Data Factory, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dags, TaskFlow, Managed Airflow, Data Transfer Service, MWAA, Step Functions y pipelines de Data Factory están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo importa `dag` y `task` desde `airflow.sdk` y lo rotula Airflow 3, como el tutorial estable (3.3.2). No lo presenta como el import de Airflow 2. No marco un error. | pendiente |
| Ejemplos poco realistas | Extracciones en paralelo y transformación que espera a ambas es un Dag habitual. | pendiente |
| Relaciones faltantes | `dag`, `scheduler`, `airflow-architecture`, `retries`, `backfill` y `data-pipeline` están en `relations`. | pendiente |

## `data-mart`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, tipos, cuándo sí y cuándo no, vistas autorizadas, data sharing y Fabric, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Los tres tipos son de la página de AWS (Nivel 1). Kimball (Nivel 4) respalda dimensiones conformadas, no un servicio. Vistas autorizadas, data sharing y el IAM aditivo están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El dependiente, el independiente y el híbrido no se presentan como lo mismo. El HCL autoriza la vista y no es autoritativo sobre los miembros. No marco un error. | pendiente |
| Ejemplos poco realistas | Un mart de marketing con columnas acotadas sobre el warehouse es habitual. | pendiente |
| Relaciones faltantes | `data-warehouse`, `star-schema`, `dimension-tables` y `data-lake` están en `relations`. | pendiente |

## `schema-on-read-vs-schema-on-write`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es cada uno, cuándo sí y cuándo no, BigQuery, Athena y Fabric, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Athena, Glue, tablas externas, `bq load` y el lakehouse de Fabric están en notas Nivel 1. «Redshift aplica el esquema al cargar con `COPY`» no tiene fuente en la ficha. Propuesta: citar la documentación de `COPY` o no afirmar el mecanismo. | pendiente |
| Errores técnicos o simplificaciones peligrosas | No los presenta como lo mismo. Borrar la tabla de Athena no borra los datos de S3, como dice la fuente. No marco un error. | pendiente |
| Ejemplos poco realistas | Raw en archivos y curated con esquema en la carga es el corte habitual. | pendiente |
| Relaciones faltantes | `data-lake`, `data-warehouse`, `lakehouse`, `schema-evolution` y `oltp-vs-olap` están en `relations`. | pendiente |

## `data-consistency`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Fuerte frente a eventual, aislamiento, cuándo sí y cuándo no, Cloud Storage, S3 y Cosmos DB, seguridad y costo están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | PostgreSQL, Cloud Storage, S3, BigQuery, Spanner y Cosmos DB están en notas Nivel 1. PACELC se atribuye a la documentación de Cosmos DB, no al teorema CAP. | pendiente |
| Errores técnicos o simplificaciones peligrosas | Read Committed ve `(10, 7)` y Repeatable Read ve `(10, 10)`, como dice el texto y la documentación de PostgreSQL. No confunde el aislamiento con la C de ACID ni con CAP. No marco un error. | pendiente |
| Ejemplos poco realistas | Listar objetos recién escritos y tratar la revocación de acceso como eventual es un caso real de pipeline. | pendiente |
| Relaciones faltantes | `acid`, `cap-theorem`, `idempotency` y `gcs-buckets-and-objects` están en `relations`. | pendiente |

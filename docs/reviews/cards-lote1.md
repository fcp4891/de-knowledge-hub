# Revisión B-F3.1 · Lote 1

Fichas en `content/concepts/`. Carril B no las edita. Cada fila queda **pendiente** para que Felipe decida. Las fuentes del frontmatter que revisé son de nivel 1; el problema, cuando lo hay, es una afirmación que no queda en la nota de esa fuente.

Las 10: `change-data-capture`, `idempotency`, `etl-vs-elt`, `batch-vs-streaming`, `partitioning`, `sql-merge`, `scd-type-2`, `incremental-load`, `dead-letter-queue`, `bigquery-partitioning`.

En varias fichas `related_topics` y la prosa nombran slugs que no están en `relations`. El grafo solo ve `relations`.

## Los 4 puntos VERIFY

Ninguno inventa el dato que falta. Hay que resolverlos antes de bajar `review_required`.

| # | Ficha | Dónde | Qué falta | Estado |
|---|---|---|---|---|
| 1 | `etl-vs-elt` | §12 AWS | Posicionamiento actual de Glue y de las transformaciones dentro de Redshift. La sección describe el rol y no cita producto. | pendiente |
| 2 | `etl-vs-elt` | §13 Azure | Rol actual de Data Factory frente a Fabric. La sección lo enuncia y remite a `azure-analytics-landscape`. | pendiente |
| 3 | `bigquery-partitioning` | §6 | Valor numérico del máximo de particiones por tabla, en la página de cuotas. No se cita el número. | pendiente |
| 4 | `batch-vs-streaming` | §12 AWS | Modelo de capacidad (shards / on-demand) y retención de Kinesis Data Streams. La intro citada no lo cubre. | pendiente |

## `change-data-capture`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No dice cómo se asegura (permisos de replicación, red, datos en tránsito) ni cómo afecta el costo (disco del WAL, Datastream, instancia de DMS). La observabilidad queda en "alertar retraso y WAL", sin métrica ni sistema. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las fuentes citadas son nivel 1. "No hay recursos que aprovisionar y escala solo" va más allá de la nota de Datastream. `debezium-docs` se consultó el 2026-09-28 y el cuerpo solo lo nombra como alternativa autogestionada. | pendiente |
| Errores técnicos o simplificaciones peligrosas | No vi un error. El reenvío tras un crash y el fallo de `MERGE` si el lote no está deduplicado coinciden con las notas. | pendiente |
| Ejemplos poco realistas | El de producción (PostgreSQL, staging, `MERGE` por LSN, alerta de WAL y backfill) es realista. | pendiente |
| Relaciones faltantes | Las tres `RELATED_TO` coinciden con `related_topics`. No falta ninguna hacia fichas de este lote. | pendiente |

## `idempotency`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No dice cómo se observa un duplicado. El costo está solo como trade-off cualitativo. Los efectos externos (correo, cobro) se nombran como límite, no como diseño. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Fuentes de nivel 1. "En Redshift, `MERGE` tiene otras reglas ante duplicados" no tiene fuente en esta ficha; queda delegado a `sql-merge`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo sencillo hace `DELETE` del día y luego `INSERT`. Si falla en medio, el día queda vacío. Propuesta: exigir transacción o reemplazo de partición, o marcar el ejemplo como esquema y no como implementación segura. | pendiente |
| Ejemplos poco realistas | El de producción (Pub/Sub at-least-once, staging con `message_id`, `MERGE` por `order_id` y `updated_at`) es realista. | pendiente |
| Relaciones faltantes | `relations` solo tiene `sql-merge`. Faltan `change-data-capture` y `dead-letter-queue`, ya citados en `related_topics` y en la prosa. | pendiente |

## `etl-vs-elt`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No hay observabilidad. Costo y privacidad sí están. "ELT domina" es un juicio sin fuente. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | GCP está en fuentes de nivel 1. AWS y Azure son los VERIFY 1 y 2: no dar por verificadas las frases sobre Glue, EMR, Data Factory o Fabric. | pendiente |
| Errores técnicos o simplificaciones peligrosas | En GCP no vi un error. El riesgo es leer §12 y §13 como producto ya contrastado. | pendiente |
| Ejemplos poco realistas | Datastream más Dataform, y Dataflow solo para anonimizar, es un caso creíble. | pendiente |
| Relaciones faltantes | Falta `change-data-capture` en `relations`. Sí está en `related_topics` y en el ejemplo de producción. | pendiente |

## `batch-vs-streaming`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No hay seguridad ni observabilidad (retraso, eventos tardíos, lag). El costo es cualitativo. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | El VERIFY 4 sigue abierto. "Pub/Sub no expone particiones al usuario" no está en la nota de Pub/Sub. "La compatibilidad con Kafka cubre el protocolo, no todo el ecosistema" no está en la nota de Event Hubs: citar esa página o dejarlo como cautela, sin sonar a límite verificado. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El código asigna event time y una ventana fija, en línea con la nota de Beam en Dataflow. No lo marco como error. | pendiente |
| Ejemplos poco realistas | Tablero provisional en streaming y cifra oficial en el batch nocturno es realista. Los timestamps del código no dicen a qué fecha corresponden; es un ejemplo mínimo. | pendiente |
| Relaciones faltantes | `relations` solo tiene `change-data-capture`. Faltan `dead-letter-queue` e `idempotency`. | pendiente |

## `partitioning`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No hay seguridad. Costo, pruning y ciclo de vida sí están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Fuentes de nivel 1. "60 distribuciones" de Synapse está en el cuerpo y no en la nota de esta ficha (sí en la de `bigquery-partitioning`). Propuesta: copiar la frase a la nota. | pendiente |
| Errores técnicos o simplificaciones peligrosas | "Sin partición, cualquier filtro por fecha recorre toda la tabla" es absoluto: un formato columnar o el clustering también pueden saltar datos. El `DELETE` + `INSERT` del código no es atómico. | pendiente |
| Ejemplos poco realistas | Lake `dt=`, reescritura del día, Athena y archivado a los 400 días es realista. | pendiente |
| Relaciones faltantes | No hay arreglo `relations`. Faltan `bigquery-partitioning` e `incremental-load`. | pendiente |

## `sql-merge`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No hay seguridad. El costo (bytes de origen y destino) y la reconciliación por conteos sí están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las diferencias entre BigQuery, Redshift y T-SQL están en notas de nivel 1. El cuerpo nombra Azure SQL Managed Instance y la nota dice "Azure SQL" sin esa edición: alinear la nota. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo sencillo hace `cantidad = t.cantidad + s.cantidad`. Reejecutarlo infla el inventario. Propuesta: marcarlo como no idempotente o asignar el valor de origen. "Una sola lectura de las tablas" simplifica de más. | pendiente |
| Ejemplos poco realistas | El de producción (deduplicar, condición de versión, filtrar particiones, contar filas) es el que conviene seguir. | pendiente |
| Relaciones faltantes | `relations` solo tiene `idempotency`. Faltan `scd-type-2` e `incremental-load`. | pendiente |

## `scd-type-2`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | El costo queda en el tamaño de la dimensión. El control diario de una sola versión vigente cubre la observabilidad. No hay seguridad. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | El `MERGE` citado es nivel 1. "Tipos de Kimball" no tiene fuente bibliográfica. Propuesta: registrar el libro o tratarlo como concepto consolidado, sin afirmación de producto. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo y el código usan el mismo instante en `valid_to` de la fila vieja y `valid_from` de la nueva. Si el extremo es inclusivo, las vigencias se solapan. Propuesta: definir el extremo y reflejarlo en la tabla y en el SQL. | pendiente |
| Ejemplos poco realistas | El cliente 42 y el lote de CDC comparado por hash son realistas. | pendiente |
| Relaciones faltantes | `relations` solo tiene `USES sql-merge`. Faltan `change-data-capture` e `incremental-load`. | pendiente |

## `incremental-load`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No dice cómo se asegura el acceso al origen. La reconciliación semanal cubre la observabilidad. El costo está en el trade-off. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Dataform, particiones de BigQuery, Athena y partition switching son nivel 1. "En Redshift se usa `MERGE`" y "no hay un equivalente a las tablas incrementales de Dataform" no citan Redshift. | pendiente |
| Errores técnicos o simplificaciones peligrosas | Guardar el watermark después del éxito y solapar la ventana está bien planteado. No marco un error. | pendiente |
| Ejemplos poco realistas | Carga cada 15 minutos, solape de 30 y reconciliación semanal es realista. | pendiente |
| Relaciones faltantes | Faltan `partitioning` y `bigquery-partitioning` en `relations`. Sí están en `related_topics`. | pendiente |

## `dead-letter-queue`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | No está el costo de retener la DLQ. Alertas, diagnóstico y redrive cubren la operación. El IAM de Pub/Sub está en el comentario del código. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Nivel 1. Los intentos 5–100, el conteo aproximado, el timestamp original de SQS y la subcola de Service Bus están en las notas. "Sin permisos, Pub/Sub no cuenta los intentos" no está en la nota: añadir la frase si la página de dead-letter topics lo dice. | pendiente |
| Errores técnicos o simplificaciones peligrosas | 10 intentos cae dentro de 5–100. El ejemplo de 5 fallos coincide con el mínimo documentado. No marco un error. | pendiente |
| Ejemplos poco realistas | Clasificar la DLQ, alertar por tasa y reinyectar con escritura idempotente es realista. | pendiente |
| Relaciones faltantes | Falta `batch-vs-streaming` en `relations`. | pendiente |

## `bigquery-partitioning`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Costo, pruning, expiración y revisión del plan están. No hay un apartado de seguridad. El VERIFY 3 deja sin número el límite de escala. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las de BigQuery, Athena y Synapse citadas en las notas son nivel 1. "Redshift no tiene particiones de tabla como las de BigQuery" no tiene fuente de Redshift. 1960-01-01 y 2159-12-31 no están en la nota: confirmarlos en la página citada y copiarlos, o marcarlos VERIFY. | pendiente |
| Errores técnicos o simplificaciones peligrosas | `WHERE DATE(ocurrido_en)` coincide con `PARTITION BY DATE(ocurrido_en)`; no contradice el aviso de pruning. No marco un error. | pendiente |
| Ejemplos poco realistas | Tabla de varios TB, día del evento, clustering por `customer_id`, expiración y sobrescritura del día es realista. | pendiente |
| Relaciones faltantes | Está `EXTENDS partitioning`. Falta `incremental-load` en `relations`. | pendiente |

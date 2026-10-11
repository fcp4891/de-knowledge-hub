# Revisión B-F3.1 · Lote F3b-05a

Fichas en `content/concepts/`. Carril B no las edita. Filas en `pendiente` hasta que Felipe las apruebe. Las seis siguen en `review_required`. No hay comentarios `VERIFY`.

Las 6: `pipeline-layers`, `database-ingestion`, `event-driven-pipelines` (pattern, `modern`), `pipeline-dependencies`, `checkpoints` y `failure-recovery`.

El 2026-10-11 contrasté las páginas de medallion de Azure Databricks y de Fabric, la de capas de AWS Prescriptive Guidance, la de Assets de Airflow 3.3.2 y el script `make check-airflow-dag`. No reejecuté el SQL, el Python ni el Dag.

Propuestas:

1. En `pipeline-layers`, AWS: la guía dice al menos tres capas, y con datos sensibles un bucket de landing antes de raw. La ficha dice tres capas.
2. En `pipeline-layers`, Fabric: la página ofrece dos patrones (lakehouse por capa, o gold como warehouse) y recomienda un workspace por lakehouse. La ficha dice que sugiere un lakehouse por capa.
3. En `event-driven-pipelines`, distinguir Eventarc de las notificaciones de Cloud Storage a Pub/Sub, con los destinos de su página (servicios de Google Cloud, aplicaciones propias, SaaS y terceros; ediciones Advanced y Standard).

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 6 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | `pipeline-layers` y `database-ingestion` dicen que su SQL se ejecutó en PostgreSQL 17.11 local. `checkpoints`, `failure-recovery`, `event-driven-pipelines` y el segundo bloque de `pipeline-dependencies` dicen Python 3.12.3 y `mypy --strict` sin errores. El Dag de Airflow no se ejecuta: la CI lo carga con `DagBag`. No reejecuté el código. | pendiente |
| Relaciones completas | En las 6, cada slug de `related_topics` está en `relations`. | pendiente |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4. Las afirmaciones de producto están en notas Nivel 1. | pendiente |
| Enlaces a fichas verified | `failure-recovery` remite a `retries`, `checkpoints`, `replay`, `backfill` y `dead-letter-queue` en lugar de redefinirlos. `database-ingestion` remite a `incremental-load`, `incremental-pipelines` y `change-data-capture`. El watermark que no ve borrados físicos coincide con `incremental-load` y con `change-data-capture`. El `seek` de Pub/Sub remite a `replay`, que añade la retención. DMS no se presenta como replicación en tiempo real. | pendiente |

## `pipeline-layers`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué garantiza cada capa, cuándo sí y cuándo no, y §14 están. §11 dice que no cita una fuente de Google Cloud con nombres propios. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Bronze, silver y gold, y la frase «a recommended best practice but not a requirement», están en la página de Azure Databricks y el cuerpo se las atribuye solo a Databricks. Fabric los usa como enfoque de diseño recomendado, en su página. Raw, stage y analytics están en AWS Prescriptive Guidance, cada una en su bucket. La ficha usa nombres neutros y dice que no presenta ninguno como estándar. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La página de AWS dice al menos tres capas, y con datos sensibles un bucket de landing antes de raw. La ficha dice tres capas. Propuesta: decir «al menos tres» y mencionar ese landing. La página de Fabric ofrece dos patrones (un lakehouse por capa, o bronze y silver como lakehouse y gold como warehouse) y recomienda un workspace distinto por lakehouse. §13 dice que Fabric sugiere un lakehouse por capa, cada uno en su workspace. Propuesta: dejar los dos patrones y la recomendación del workspace. | pendiente |
| Ejemplos poco realistas | Crudo solo de agregar, inválidos a rechazos y consumo sobre lo validado es un uso habitual. | pendiente |
| Relaciones faltantes | `data-pipeline`, `data-lake` y `lakehouse` están en `relations`. | pendiente |

## `database-ingestion`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Carga completa, watermark y CDC, qué ve cada una, y §14 están. El detalle de cada técnica queda en su ficha. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Full load y full-load-and-cdc de DMS, CDC y backfill de Datastream, y el watermark y el Change Tracking de Azure Data Factory están en notas Nivel 1, cada servicio en su página. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo muestra el borrado que el watermark no ve, igual que `incremental-load`. §13 dice que la copia por watermark de Data Factory no lee el log, a diferencia de DMS y Datastream. No dice que el CDC de DMS sea en tiempo real. No marco otro error. | pendiente |
| Ejemplos poco realistas | Catálogos en carga completa, clientes por watermark y pedidos por CDC es un corte habitual. | pendiente |
| Relaciones faltantes | `change-data-capture`, `incremental-load` y `batch-ingestion` están en `relations`. | pendiente |

## `event-driven-pipelines`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué dispara el pipeline, duplicados y desorden, cuándo sí y cuándo no, y §14 están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las notificaciones de Cloud Storage a Pub/Sub (al menos una vez en los dos tramos, sin orden, `generation` y `metageneration`), S3 Event Notifications (SNS, SQS, Lambda o EventBridge; al menos una vez; a veces más de un minuto) y Event Grid más los eventos de Blob Storage (al menos una vez, duplicados) están en notas Nivel 1, cada una en su página. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §11–13 no los tratan como el mismo servicio. §11 deja Eventarc en una frase («enrutamiento hacia servicios como Cloud Run»). La página de Eventarc habla de ediciones Advanced y Standard y de destinos que incluyen servicios de Google Cloud, aplicaciones propias, SaaS y terceros, y no es el mecanismo de las notificaciones del bucket a Pub/Sub. Propuesta: decir esos destinos y que es otro mecanismo. | pendiente |
| Ejemplos poco realistas | Omitir una reentrega y una versión vieja que llega tarde es el caso habitual de entrega al menos una vez. | pendiente |
| Relaciones faltantes | `streaming-ingestion`, `idempotency` y `file-ingestion` están en `relations`. | pendiente |

## `pipeline-dependencies`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Dependencias entre tareas y entre Dags, cuándo sí y cuándo no, y §14 están. §11–12 remiten a `airflow-architecture`. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Las URLs de Airflow son de la documentación 3.3.2. La página de Assets de esa versión dice que el Asset se marca actualizado solo si la tarea termina con éxito, y que si falla o se salta no hay actualización. `dependsOn` de Azure Data Factory está en su nota. `>>`, `trigger_rule` y `DagBag` están en las notas de 3.3.2. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El bloque `# Airflow` declara `ventas_diarias` y `reporte_ventas`, `validar` aguas abajo de `extraer_pos` y `extraer_web`, y `limpiar_temporales` con `TriggerRule.ALL_DONE`. `scripts/snippets/check_airflow_dag.py` comprueba esos tres puntos, más que `import_errors` esté vacío. `make check-airflow-dag` fija `apache-airflow==3.3.2`. No lo ejecuté en local. No marco otro error. | pendiente |
| Ejemplos poco realistas | Dos extracciones en paralelo, una carga que publica un Asset y una limpieza con `all_done` es un uso habitual. | pendiente |
| Relaciones faltantes | `data-orchestration`, `dag` y `scheduler` están en `relations`. | pendiente |

## `checkpoints`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué se guarda, cuándo sí y cuándo no, y §14 están. §11 dice que no cita una fuente de Google Cloud sobre checkpoints. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Offsets y agregados de Spark 4.2.0, checkpoints automáticos y snapshots manuales de Managed Flink, y la posición por partición de Event Hubs están en notas Nivel 1, cada motor en su página. `os.replace` usa la frase de Python 3.12. | pendiente |
| Errores técnicos o simplificaciones peligrosas | §1 y §12–13 los describen por separado. El exactly-once de Flink queda en actualizaciones, escalado o mantenimiento, con checkpoints y snapshots configurados. §13 dice que el checkpoint de Event Hubs es una posición por partición, no un respaldo del estado como en Spark o Flink. §15 advierte de suponer que un motor funciona igual que otro. No marco otro error. | pendiente |
| Ejemplos poco realistas | Retomar un log desde el último offset y absorber el reproceso por id es un uso habitual. | pendiente |
| Relaciones faltantes | `failure-recovery`, `streaming-ingestion` e `idempotency` están en `relations`. | pendiente |

## `failure-recovery`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Transitorio o permanente, qué ya terminó, qué se aparta y qué se reprocesa, y §14 están. §13 dice que no cita una fuente de Azure y remite a `checkpoints`. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `Retry` y `Catch` de Step Functions, el `seek` de Pub/Sub y los estados `up_for_retry` y `upstream_failed` de Airflow 3.3.2 están en notas Nivel 1. La espera del ejemplo remite a `retries`. El reproceso remite a `replay` y `backfill`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | No redefine el backoff con jitter de `retries` ni el `seek` con retención de `replay`. El ejemplo separa el error permanente (sin reintento) del transitorio, igual que `retries`. No marco otro error. | pendiente |
| Ejemplos poco realistas | Relanzar solo las particiones que no terminaron es un uso habitual. | pendiente |
| Relaciones faltantes | `retries`, `checkpoints` y `replay` están en `relations`. | pendiente |

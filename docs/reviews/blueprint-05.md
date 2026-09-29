# Revisión B-F1.2 · Dominio 05 Pipelines

Archivo de origen: `content/blueprint/05-pipelines.yaml`. Carril B no lo edita. La idempotencia sigue en el dominio 01. El tope de 80 fichas MVP no se mueve.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `pipeline-layers` | Agregar `medallion-architecture` en `related_concepts`. `mvp` sigue en `false`. | pendiente |
| 2 | `streaming-ingestion` | Agregar `delivery-semantics` y `event-time-vs-processing-time` en `related_concepts`. Nota: el micro-batch se explica aquí; no crear ficha. | pendiente |
| 3 | `database-ingestion` | Subir `importance` a `high`. `mvp` sigue en `false`. Nota: la ficha es la decisión full / incremental / CDC, no una cuarta técnica. | pendiente |
| 4 | `incremental-pipelines` | Agregar `watermarks` en `related_concepts`. Nota: el full refresh se contrasta en esta ficha. El patrón SQL sigue en `incremental-load`. | pendiente |
| 5 | `event-driven-pipelines` | Subir `importance` a `high`. `mvp` sigue en `false` y `classification` en `modern`. Agregar `event-driven-orchestration` y `event-driven-architecture` en `related_concepts`. | pendiente |
| 6 | `pipeline-dependencies` | Agregar `dag` en `related_concepts`. Nota: task y scheduler están en el dominio 06. | pendiente |
| 7 | `api-ingestion` | Agregar nota: paginación, rate limit y el contrato HTTP van en esta ficha. | pendiente |
| 8 | `file-ingestion` | Agregar `csv-format` en `related_concepts` (fila 5 del dominio 01, aprobada). | pendiente |
| 9 | `change-data-capture` | Agregar `schema-evolution` en `related_concepts`. | pendiente |
| 10 | `retries` | Agregar `exactly-once-semantics` en `related_concepts`. Un reintento no es entrega exactly-once. | pendiente |
| 11 | `checkpoints` | Subir `importance` a `high`. `mvp` sigue en `false`. Agregar `streaming-ingestion` y `watermarks` en `related_concepts`. | pendiente |
| 12 | `dead-letter-queue` | Agregar nota: el mensaje venenoso se trata aquí. No crear concepto aparte. | pendiente |
| 13 | `replay` | Agregar nota: reprocesar eventos ya capturados. Distinto de backfill. | pendiente |
| 14 | `backfill` | Agregar nota: completar un rango histórico. `catchup` (06) es la política del scheduler, no esta ficha. | pendiente |
| 15 | `failure-recovery` | Agregar `backfill` en `related_concepts`. `mvp` sigue en `false`. | pendiente |
| 16 | Resto del dominio | La clasificación `core` se queda. `event-driven-pipelines` sigue en `modern`. No se agregan fichas MVP. | pendiente |

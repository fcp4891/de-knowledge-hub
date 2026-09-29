# Revisión B-F1.2 · Dominio 08 GCP

Archivo de origen: `content/blueprint/08-gcp.yaml`. Carril B no lo edita. El intercambio de la fila 1 no cambia el número de fichas MVP del dominio. No se agregan fichas MVP nuevas.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `gcs-buckets-and-objects` | Subir `importance` a `high` y pasar `mvp` a `true`. Agregar `pubsub-topics-and-subscriptions` en `related_concepts`. Nota: las notificaciones de objetos hacia Pub/Sub van aquí. | pendiente |
| 2 | `gcs-storage-classes-and-lifecycle` | Pasar `mvp` a `false` (compensa la fila 1). `importance` sigue en `high`. Nota: nombres de clases y precios cambian; ficha con fuente y `last_verified`. | pendiente |
| 3 | `dataform-workflows` | Subir `importance` a `high`. `mvp` sigue en `false`: la ficha MVP es `dataform-incremental-tables`. Nota: el workflow es el prerrequisito. | pendiente |
| 4 | `dataflow-streaming-pipelines` | Subir `importance` a `high`. `mvp` sigue en `false`. Agregar `watermarks`, `checkpoints` y `pubsub-delivery-semantics` en `related_concepts`. | pendiente |
| 5 | `pubsub-delivery-semantics` | Agregar `delivery-semantics` y `exactly-once-semantics` en `related_concepts`. Nota: Pub/Sub es at-least-once; una suscripción exactly-once no equivale al exactly-once de Dataflow. | pendiente |
| 6 | `bigquery-slots` | Subir `importance` a `high`. `mvp` sigue en `false`: la ficha MVP de costo es `bigquery-cost-model`. Agregar `finops-for-data` en `related_concepts`. Nota: editions y reservas cambian; ficha con fuente. | pendiente |
| 7 | `bigquery-security` | Subir `importance` a `high`. `mvp` sigue en `false`: la ficha MVP es `gcp-iam-for-data`. Nota: authorized views, row-level security y ACL de dataset van aquí; `bigquery-policy-tags` sigue aparte. | pendiente |
| 8 | `bigquery-monitoring` | Subir `importance` a `high`. `mvp` sigue en `false`. Agregar `bigquery-cost-model`, `bigquery-slots` y `bigquery-information-schema` en `related_concepts`. | pendiente |
| 9 | `bigquery-incremental-models` | Agregar nota: es el patrón SQL en BigQuery. La implementación de producto es `dataform-incremental-tables`. No fusionar las fichas. Los flags se quedan. | pendiente |
| 10 | `bigquery-biglake-tables` | Agregar `open-table-formats` en `related_concepts`. Nota: no es una tabla externa. Los flags se quedan. | pendiente |
| 11 | `bigquery-query-optimization` | Agregar `cloud-warehouse-optimization` en `related_concepts`. Cierra la fila 12 del dominio 02, ya aprobada. | pendiente |
| 12 | `bigquery-sql-dialect` | Agregar `sql-arrays` en `related_concepts`. `mvp` sigue en `false`: QUALIFY y UNNEST ya son MVP en el dominio 02. | pendiente |
| 13 | `cloud-sql-as-source` | Subir `importance` a `high`. `mvp` sigue en `false`. Agregar `cdc-architecture` en `related_concepts`. Nota: Datastream se explica aquí y en la arquitectura CDC; no crear ficha de producto. | pendiente |
| 14 | `dataplex-governance` | Agregar `data-catalog` y `data-lineage` en `related_concepts`. Nota: catálogo y linaje siguen en el dominio 17; aquí solo el servicio. | pendiente |
| 15 | `vertex-ai-for-data-engineers` | Agregar nota: RAG y agentes están en el dominio 21; aquí solo el servicio. Sigue `modern` y `mvp: false`. | pendiente |
| 16 | `composer-environments` | Agregar nota: la generación del entorno cambia; verificar al redactar. Los flags se quedan. | pendiente |
| 17 | Resto del dominio | Todo sigue en `modern`. Nada pasa a `core` ni a `emerging`. | pendiente |

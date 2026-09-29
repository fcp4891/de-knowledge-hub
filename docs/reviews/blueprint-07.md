# Revisión B-F1.2 · Dominio 07 Arquitectura

Archivo de origen: `content/blueprint/07-architecture.yaml`. Carril B no lo edita. El gate F1 ya cambió el MVP: entra `event-driven-architecture` y sale `medallion-architecture`. El tope de 80 fichas MVP no se mueve. Medallion sigue en las 5 arquitecturas de F4.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `batch-pipeline-architecture`, `streaming-pipeline-architecture` | Mantener (`added_by: blueprint`). Son dos de las cinco de F4. Los flags se quedan. En batch, agregar `pipeline-layers`. En streaming, agregar `watermarks` y `checkpoints`. | pendiente |
| 2 | `medallion-architecture` | Mantener `mvp: false`. Ampliar la nota: sigue en las 5 arquitecturas de F4 aunque no sea MVP del blueprint. | pendiente |
| 3 | `lambda-architecture` | Pasar `classification` a `modern`. Se estudia para reconocer el doble camino batch más speed; no es el diseño por defecto. Kappa ya es `modern`. Siguen `advanced`, `medium` y `mvp: false`. | pendiente |
| 4 | `event-driven-architecture` | Mantener `modern`, `high` y `mvp: true`. Agregar `streaming-pipeline-architecture` en `related_concepts`. Nota: reaccionar a eventos de negocio no es el pipeline de ingesta continua. | pendiente |
| 5 | `real-time-analytics-architecture` | Agregar nota: es la consulta de baja latencia, no el pipeline de streaming. Los flags se quedan. | pendiente |
| 6 | `cdc-architecture` | Agregar nota: el escenario de F4 es PostgreSQL → BigQuery; la ficha debe decir qué cambia con otro origen o destino. Agregar `idempotency` y `schema-evolution` en `related_concepts`. | pendiente |
| 7 | `lakehouse-architecture` | Subir `importance` a `high`. `mvp` sigue en `false`. Agregar `open-table-formats` en `related_concepts`. La ficha MVP del concepto sigue siendo `lakehouse` (01). | pendiente |
| 8 | `kappa-architecture` | Agregar `lambda-architecture` y `streaming-pipeline-architecture` en `related_concepts`. | pendiente |
| 9 | `rag-data-pipeline-architecture` | Pasar `classification` a `emerging`. Agregar `rag` en `related_concepts`. Nota: el patrón de retrieval está en el dominio 21; aquí va el pipeline de datos. No reemplaza al warehouse. `mvp` sigue en `false`. | pendiente |
| 10 | `data-mesh` | Agregar `data-platform-engineering` en `related_concepts`. `importance` sigue en `medium`. | pendiente |
| 11 | `data-products` | Agregar `data-mesh` en `related_concepts`. | pendiente |
| 12 | `modern-data-warehouse-architecture` | Agregar `bigquery-architecture` en `related_concepts`. | pendiente |
| 13 | `iot-pipeline-architecture` | Mantener `importance: low`. Agregar `streaming-pipeline-architecture` en `related_concepts`. Nota: es una variante de streaming, no una arquitectura de estudio prioritario. | pendiente |
| 14 | Plataforma corporativa (no crear) | No agregar slug. La cubren `modern-data-warehouse-architecture`, `lakehouse-architecture` y `data-mesh`. | pendiente |
| 15 | Resto del dominio | Siguen en `core`: batch, streaming, data lake, CDC y API → warehouse. `ml-feature-pipeline-architecture` sigue en `modern`. No se agregan fichas MVP. | pendiente |

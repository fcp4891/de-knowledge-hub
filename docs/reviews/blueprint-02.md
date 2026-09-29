# Revisión B-F1.2 · Dominio 02 SQL

Archivo de origen: `content/blueprint/02-sql.yaml`. Carril B no lo edita. El tope de 80 fichas MVP no se mueve.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `sql-qualify` | Pasar `classification` a `modern`. No es SQL estándar; filtrar una window ya está en `sql-window-functions` y `deduplication`. Siguen `intermediate`, `medium` y `mvp: true` (BigQuery es el warehouse del MVP). | aprobada |
| 2 | `sql-arrays`, `sql-structs` | Mantener `core`. Agregar nota: el modelo ARRAY/STRUCT de BigQuery no es el de Redshift ni el de Fabric. El dialecto está en `bigquery-sql-dialect`. | aprobada |
| 3 | `sql-joins` | Agregar nota: semi-join y anti-join van en esta ficha. No crear concepto nuevo. | aprobada |
| 4 | `sql-date-functions` | Agregar nota: zonas horarias y DATE vs TIMESTAMP van aquí. No crear ficha aparte. | aprobada |
| 5 | `sql-nulls` (nuevo) | En lenguaje. `concept`, `core`, `intermediate`, `importance: high`, `mvp: false`. Lógica de tres valores y el efecto de NULL en filtros y agregaciones. | aprobada |
| 6 | `incremental-load` | Agregar nota: es el patrón SQL. El estado y los watermarks del pipeline están en `incremental-pipelines` (05). Los flags se quedan. | aprobada |
| 7 | `upsert` | Agregar `sql-merge` en `related_concepts`. MERGE es el enunciado; upsert es el patrón. | aprobada |
| 8 | `data-reconciliation` | Agregar `sql-quality-checks`, `incremental-load` y `change-detection` en `related_concepts`. | aprobada |
| 9 | `clustering` | Agregar nota: no es el sort key de Redshift ni el clustering de Fabric. El detalle de BigQuery está en `bigquery-clustering`. | aprobada |
| 10 | `scan-reduction` | Subir `importance` a `high`. `mvp` sigue en `false`: `partition-pruning` y `clustering` ya son MVP. | aprobada |
| 11 | `join-optimization` | Subir `importance` a `high`. Siguen `advanced` y `mvp: false`. | aprobada |
| 12 | `cloud-warehouse-optimization` | Agregar `bigquery-query-optimization` en `related_concepts`. Sigue `modern` y `mvp: false`. El detalle de BigQuery queda en el dominio 08. | aprobada |
| 13 | Resto del dominio | La clasificación `core` se queda, salvo la fila 1 y `cloud-warehouse-optimization`. Nada pasa a `emerging`. No se agregan fichas MVP. | aprobada |

# Revisión B-F3.2 · Snippets 1

Snippets en `content/snippets/`. Carril B no los edita. Todas las filas quedan en **pendiente**. Los ocho están en `review_required`.

Los 8: `bigquery-incremental-merge-watermark`, `bigquery-scd-type-2`, `bigquery-deduplicate-latest`, `dataform-incremental-model`, `airflow-daily-partition-dag`, `python-api-ingestion-retries`, `terraform-bigquery-partitioned-table` y `bigquery-reconciliation`.

El criterio es el de la plantilla: el código se puede ejecutar, o `requirements` dice exactamente qué hace falta (tablas, permisos, versión, comando).

## `bigquery-incremental-merge-watermark`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | El script nombra `etl_control`, `staging.pedidos` y `dwh.pedidos`, los permisos (`jobUser`, `dataEditor`) y que corre como un solo script. | pendiente |
| Idempotencia | El `MERGE` y el avance del watermark van en la misma transacción. La marca nueva sale del lote, no del destino, y no avanza si la fila de control cambió. | pendiente |
| Errores técnicos | `CREATE TEMP TABLE lote` no usa `OR REPLACE`. Un job nuevo funciona; repetir el script en la misma sesión de la consola falla porque la tabla temporal ya existe, antes de llegar a la transacción. Propuesta: `CREATE OR REPLACE TEMP TABLE`. | pendiente |

## `bigquery-scd-type-2`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Declara columnas de `dim_cliente` y de `cambios`, pide un cambio por cliente y permisos de job y de edición. Es un script de varias sentencias. | pendiente |
| Idempotencia | Cierre e inserción van en una transacción. Repetir los mismos cambios no cierra ni inserta, porque la región vigente ya coincide. | pendiente |
| Errores técnicos | No marco un error. La clave es `GENERATE_UUID()` y la idempotencia no depende de que el UUID se repita. | pendiente |

## `bigquery-deduplicate-latest`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Declara `staging.clientes(cliente_id, email, version)`, el destino y los permisos. Es una sola sentencia `MERGE`. | pendiente |
| Idempotencia | Deduplica con `QUALIFY` antes del `MERGE` y solo actualiza si `s.version > t.version`. | pendiente |
| Errores técnicos | No marco un error. El `WHERE TRUE` está explicado: no filtra, deja el `QUALIFY` como en la ficha `upsert`. | pendiente |

## `dataform-incremental-model`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | No es SQL de la consola de BigQuery. `requirements` pide un repositorio Dataform, `definitions/orders.sqlx`, la declaración `raw_orders` y permisos de la cuenta de servicio. §7 dice compilar y ejecutar el workflow. | pendiente |
| Idempotencia | `uniqueKey` fusiona por `order_id`. El margen de 30 minutos está en el código. | pendiente |
| Errores técnicos | El filtro usa `MAX(updated_at)` del propio destino. §6 ya dice que un timestamp futuro adelanta la marca y que lo tardío fuera del margen espera una reconstrucción. No marco un error aparte. | pendiente |

## `airflow-daily-partition-dag`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Pide Airflow 3.x, `google-cloud-bigquery`, credenciales, las dos tablas con la misma estructura y la carpeta de Dags. El `DELETE` + `INSERT` del día está dentro de `BEGIN` / `COMMIT`. | pendiente |
| Idempotencia | Reemplaza la partición del día lógico. Si el staging del día está vacío, no borra la partición. | pendiente |
| Errores técnicos | No marco un error. El parámetro `@dia` es `STRING` y el SQL lo castea a `DATE`. | pendiente |

## `python-api-ingestion-retries`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Python 3.12 y biblioteca estándar. La forma de la respuesta (`data`, `next`), el token en `API_TOKEN` y el directorio `raw/` están en `requirements`. El `__main__` llama a una URL de ejemplo. | pendiente |
| Idempotencia | Borra las páginas previas del día y vuelve a escribir `pagina=NNNNN.json`. Reintentar un `GET` no crea recursos. | pendiente |
| Errores técnicos | `Retry-After` en fecha HTTP cae al backoff; el texto lo dice. No marco un error. | pendiente |

## `terraform-bigquery-partitioned-table`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Terraform 1.x, provider `hashicorp/google` 8.x, `project_id`, y la diferencia entre `terraform validate` (sin credenciales) y `apply` (proyecto y permisos). | pendiente |
| Idempotencia | Un segundo apply no cambia lo que ya coincide con el estado. `deletion_protection` y `delete_contents_on_destroy = false` evitan un borrado silencioso. | pendiente |
| Errores técnicos | No marco un error. | pendiente |

## `bigquery-reconciliation`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Declara las dos tablas, el parámetro `@dia DATE` y permisos de lectura y de job. §7 incluye el comando `bq query` con el parámetro. Son dos consultas. | pendiente |
| Idempotencia | Son de solo lectura. | pendiente |
| Errores técnicos | §6 dice que dos filas idénticas se anulan en el XOR y que el conteo sigue haciendo falta. No marco un error. | pendiente |

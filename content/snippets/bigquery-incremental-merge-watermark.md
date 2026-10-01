---
id: code_snippet:bigquery-incremental-merge-watermark
slug: bigquery-incremental-merge-watermark
type: code_snippet
title: MERGE incremental por watermark en BigQuery
description: "Script de BigQuery que carga solo el delta desde la última marca, con MERGE por clave y versión y avance del watermark en la misma transacción."
language: sql
dialect: bigquery
requirements:
  - "Tabla de control proyecto.dwh.etl_control(fuente STRING, watermark TIMESTAMP) con una fila para fuente = 'pedidos'."
  - "Tabla staging proyecto.staging.pedidos(pedido_id, estado, monto, updated_at TIMESTAMP)."
  - "Tabla destino proyecto.dwh.pedidos(pedido_id, estado, monto, updated_at TIMESTAMP)."
  - "Permisos para ejecutar consultas (roles/bigquery.jobUser en el proyecto) y editar las tablas (roles/bigquery.dataEditor en los datasets)."
  - "Se ejecuta como un único script (consola de BigQuery, bq query o una tarea del orquestador)."
classification: core
level: intermediate
cloud: [gcp]
technologies: [gcp-bigquery]
tags: [sql, bigquery, incremental, idempotency]
related_topics: [incremental-pipelines, incremental-load, sql-merge, idempotency]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/transactions
    accessed: 2026-10-01
    note: "Transacciones de varias sentencias con commit o rollback atómico; admiten CREATE TEMP TABLE; sin session mode, un error sin manejador hace fallar la consulta y BigQuery revierte la transacción; dentro de una transacción CURRENT_TIMESTAMP devuelve el inicio de la transacción."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/procedural-language
    accessed: 2026-10-01
    note: "DECLARE ... DEFAULT (subconsulta), SET, IF ... END IF, RAISE USING MESSAGE y BEGIN TRANSACTION en scripts de BigQuery."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
    accessed: 2026-10-01
    note: "Sintaxis de MERGE; error UPDATE/MERGE must match at most one source row for each target row si una fila destino coincide con más de una de origen."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    note: "roles/bigquery.jobUser permite ejecutar jobs, incluidas consultas, en el proyecto; roles/bigquery.dataEditor sobre un dataset permite crear, actualizar, leer y borrar sus tablas."
relations:
  - type: IMPLEMENTS
    target: incremental-pipelines
    note: Etapa incremental con watermark tomado del lote, corte y rollback si la fila de control falta o cambió.
  - type: IMPLEMENTS
    target: incremental-load
    note: Escritura del delta con MERGE por clave y versión.
  - type: USES
    target: sql-merge
    note: El MERGE con condición de versión aplica el lote.
  - type: DEPENDS_ON
    target: idempotency
    note: Repetir el script con el mismo staging no duplica ni retrocede datos.
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: review_required
---

## 1. Qué resuelve

Carga en BigQuery solo lo que cambió desde la última ejecución, sin perder ni duplicar filas aunque el script se repita o falle a la mitad. Implementa el patrón `incremental-pipelines` (estado por watermark) con la escritura de `incremental-load` (MERGE por clave). Es el código de la sección 10 de `incremental-pipelines`, ya corregido en su revisión.

## 2. Código

```sql
-- Etapa incremental por watermark, idempotente y atómica (script de BigQuery).
-- Requiere: etl_control(fuente, watermark) con una fila por fuente y destino con clave pedido_id.
DECLARE wm_anterior TIMESTAMP DEFAULT (
  SELECT watermark FROM `proyecto.dwh.etl_control` WHERE fuente = 'pedidos');
DECLARE corte TIMESTAMP DEFAULT CURRENT_TIMESTAMP();  -- lo posterior a "ahora" espera a otra ejecución
DECLARE wm_nuevo TIMESTAMP;

IF wm_anterior IS NULL THEN
  RAISE USING MESSAGE = 'Falta la fila de etl_control para pedidos: no se procesa nada';
END IF;

-- Lote: una fila por clave, solo entre la marca anterior y el corte (sin timestamps futuros).
CREATE TEMP TABLE lote AS
SELECT * FROM `proyecto.staging.pedidos`
WHERE updated_at > wm_anterior AND updated_at <= corte
QUALIFY ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY updated_at DESC) = 1;

-- La marca nueva sale del lote leído, no del destino; con lote vacío no se mueve.
SET wm_nuevo = COALESCE((SELECT MAX(updated_at) FROM lote), wm_anterior);

BEGIN TRANSACTION;

-- Si otra ejecución movió la marca, el error revierte la transacción.
IF (SELECT watermark FROM `proyecto.dwh.etl_control` WHERE fuente = 'pedidos') IS DISTINCT FROM wm_anterior THEN
  RAISE USING MESSAGE = 'etl_control cambió durante la ejecución: se revierte';
END IF;

MERGE `proyecto.dwh.pedidos` AS t
USING lote AS s
ON t.pedido_id = s.pedido_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET estado = s.estado, monto = s.monto, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (pedido_id, estado, monto, updated_at) VALUES (s.pedido_id, s.estado, s.monto, s.updated_at);

UPDATE `proyecto.dwh.etl_control`
SET watermark = wm_nuevo
WHERE fuente = 'pedidos' AND watermark = wm_anterior;

COMMIT TRANSACTION;
```

## 3. Cómo funciona

1. Lee la marca anterior de `etl_control` y fija un **corte** en el instante actual. Si no existe la fila de control, se detiene antes de escribir nada.
2. Arma el **lote** en una tabla temporal: filas con `updated_at` entre la marca y el corte, **una por clave** (la más reciente), así el `MERGE` no falla por varias filas de origen por fila destino.
3. Calcula la **marca nueva desde el lote**, no desde el destino: una fila del destino con un timestamp futuro no puede adelantarla.
4. En una **transacción**: comprueba que nadie movió la marca (si la movió, `RAISE` y BigQuery revierte), aplica el `MERGE` con condición de versión y avanza la marca.

Es **atómico** porque el `MERGE` y el avance de la marca se confirman juntos, e **idempotente** porque repetirlo con el mismo staging no inserta duplicados (`MERGE` por clave) ni pisa versiones más nuevas (`s.updated_at > t.updated_at`).

## 4. Cuándo usarlo

- Tablas de estado actual (pedidos, clientes) alimentadas desde un staging con `updated_at` confiable.
- Cargas frecuentes donde recalcular la tabla completa es caro.
- Cuando el estado del pipeline debe vivir en el warehouse y no en el orquestador.

## 5. Cuándo no usarlo

- Si el origen no tiene una columna de modificación confiable o los borrados importan: hace falta CDC (`change-data-capture`).
- Si el pipeline procesa períodos fijos (días): reemplazar la partición del período es más simple (ver `backfill`).
- Para conservar historia de cambios: corresponde SCD2 (`bigquery-scd-type-2`).

## 6. Riesgos

- **Empates de timestamp:** filas que llegan después con el mismo `updated_at` que la marca quedan fuera por el `>`. Si el origen puede producirlas, usar una marca compuesta (timestamp e id) o un margen de relectura con `MERGE`.
- **Timestamps futuros:** quedan esperando hasta que el corte los alcance; conviene contarlos y alertar.
- **Seguridad:** quien puede escribir en `etl_control` puede saltarse o repetir datos; restringir ese permiso a la cuenta del pipeline.
- **Costo:** el `MERGE` lee el destino para comparar; si la tabla es grande, particionarla y filtrar el destino por partición reduce los bytes procesados.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Primera vez: crear `etl_control` e insertar la fila inicial, por ejemplo `INSERT INTO proyecto.dwh.etl_control VALUES ('pedidos', TIMESTAMP '1970-01-01')`. Luego ejecutar el script completo como una sola consulta (la consola de BigQuery o `bq query --use_legacy_sql=false < script.sql`). Reemplazar `proyecto`, los datasets y las columnas por los reales.

## 8. Conceptos relacionados

- `incremental-pipelines` e `incremental-load`: los patrones que implementa.
- `sql-merge`: la sentencia que aplica el lote.
- `idempotency`: por qué repetirlo es seguro.

## 9. Fuentes

- Google Cloud: *Multi-statement transactions*, *Procedural language*, *DML syntax* y *BigQuery IAM roles and permissions* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `incremental-pipelines` tras la revisión B-F3.1 del lote 2.

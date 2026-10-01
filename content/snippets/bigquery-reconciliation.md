---
id: code_snippet:bigquery-reconciliation
slug: bigquery-reconciliation
type: code_snippet
title: Reconciliación de un día entre origen y destino en BigQuery
description: "Consultas de solo lectura que comparan conteo, suma y una huella agregada (BIT_XOR de FARM_FINGERPRINT) de un día entre el snapshot del origen y el destino, y listan las claves que difieren."
language: sql
dialect: bigquery
requirements:
  - "Tabla proyecto.staging.stg_ventas_origen con la copia del origen para el día (venta_id, monto, fecha), tomada en el momento de la extracción."
  - "Tabla destino proyecto.dwh.ventas(venta_id, monto, fecha)."
  - "Parámetro @dia (DATE) con el día lógico, enlazado como parámetro de consulta."
  - "Permisos de lectura sobre ambas tablas (por ejemplo roles/bigquery.dataViewer en los datasets) y para ejecutar consultas (roles/bigquery.jobUser)."
classification: core
level: intermediate
cloud: [gcp]
technologies: [gcp-bigquery]
tags: [sql, bigquery, data-quality, reconciliation]
related_topics: [data-reconciliation, incremental-load, backfill]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/hash_functions
    accessed: 2026-10-01
    note: "FARM_FINGERPRINT calcula un INT64 con Fingerprint64 de FarmHash sobre un STRING o BYTES; su salida para una entrada dada no cambia nunca."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions
    accessed: 2026-10-01
    note: "BIT_XOR([DISTINCT] expression): agregado que aplica un XOR bit a bit sobre la expresión."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/parameterized-queries
    accessed: 2026-10-01
    note: "Parámetros con nombre usando @nombre; un parámetro no puede ser NULL ni reemplazar identificadores o nombres de tabla."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    note: "roles/bigquery.jobUser permite ejecutar consultas en el proyecto; roles/bigquery.dataViewer sobre un dataset permite listar sus tablas y consultarlas."
relations:
  - type: IMPLEMENTS
    target: data-reconciliation
    note: Conteo, suma de control y huella agregada por día, con bajada al detalle por clave.
  - type: RELATED_TO
    target: incremental-load
    note: Cierre de cada carga incremental del período.
  - type: RELATED_TO
    target: backfill
    note: Reconciliación de cada período reprocesado.
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: verified
---

## 1. Qué resuelve

Demuestra que la carga de un día no perdió, duplicó ni alteró filas: compara en una consulta el conteo, la suma de montos y una huella agregada del día entre el snapshot del origen y el destino, y, si algo difiere, lista las claves que faltan, sobran o cambiaron. Implementa el patrón `data-reconciliation` y es el código de su sección 10.

## 2. Código

```sql
-- BigQuery: reconciliación de un día entre el snapshot del origen y el destino.
-- Requiere: stg_ventas_origen (copia del origen para el día) y dwh.ventas; @dia es el día lógico.
WITH origen AS (
  SELECT COUNT(*) AS filas, SUM(monto) AS monto,
         BIT_XOR(FARM_FINGERPRINT(CONCAT(CAST(venta_id AS STRING), '|', CAST(monto AS STRING)))) AS huella
  FROM `proyecto.staging.stg_ventas_origen`
  WHERE fecha = @dia
),
destino AS (
  SELECT COUNT(*) AS filas, SUM(monto) AS monto,
         BIT_XOR(FARM_FINGERPRINT(CONCAT(CAST(venta_id AS STRING), '|', CAST(monto AS STRING)))) AS huella
  FROM `proyecto.dwh.ventas`
  WHERE fecha = @dia
)
SELECT
  o.filas AS filas_origen, d.filas AS filas_destino,
  o.monto AS monto_origen, d.monto AS monto_destino,
  o.huella = d.huella AS huella_coincide
FROM origen AS o CROSS JOIN destino AS d;

-- Si no coincide: detalle por clave (faltantes, sobrantes y distintos).
SELECT COALESCE(o.venta_id, d.venta_id) AS venta_id,
       CASE WHEN d.venta_id IS NULL THEN 'falta en destino'
            WHEN o.venta_id IS NULL THEN 'sobra en destino'
            ELSE 'monto distinto' END AS diferencia
FROM (SELECT venta_id, monto FROM `proyecto.staging.stg_ventas_origen` WHERE fecha = @dia) AS o
FULL OUTER JOIN (SELECT venta_id, monto FROM `proyecto.dwh.ventas` WHERE fecha = @dia) AS d
  ON o.venta_id = d.venta_id
WHERE o.venta_id IS NULL OR d.venta_id IS NULL OR o.monto != d.monto;
```

## 3. Cómo funciona

1. **Resumen por lado:** `COUNT(*)`, `SUM(monto)` y `BIT_XOR(FARM_FINGERPRINT(...))` sobre el mismo día en origen y destino. La huella es el XOR de un hash de 64 bits por fila: con un número por lado se compara todo el día.
2. **Comparación:** la primera consulta devuelve una fila con las métricas de ambos lados y si la huella coincide.
3. **Detalle:** si algo no coincide, la segunda consulta compara por clave con un `FULL OUTER JOIN` y clasifica cada diferencia: falta en destino, sobra en destino o monto distinto.

Son consultas de **solo lectura**: repetirlas no cambia nada.

## 4. Cuándo usarlo

- Al cerrar cada carga diaria o cada día de un backfill.
- En migraciones y replicaciones, para demostrar completitud con evidencia.

## 5. Cuándo no usarlo

- Si no hay un snapshot del origen tomado al extraer: comparar contra un origen que siguió cambiando da falsos positivos.
- Para comparar fila a fila tablas enormes en cada carga: basta con conteos y sumas, y el detalle solo cuando difieren.
- Como sustituto de la idempotencia: detecta duplicados, no los evita.

## 6. Riesgos

- **Duplicados idénticos:** dos filas iguales duplicadas se anulan en el XOR; por eso el conteo es imprescindible junto a la huella.
- **Normalización:** la huella depende de cómo se convierte cada valor a texto; ambos lados deben usar la misma expresión (tipos, redondeo, zona horaria).
- **Seguridad:** el detalle por clave puede exponer datos si se registra completo; registrar claves y tipo de diferencia, no el contenido.
- **Costo:** las consultas leen las columnas incluidas en la huella; filtrar por la partición del día limita los bytes procesados.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Ejecutar las dos consultas con el parámetro `@dia` (por ejemplo, `bq query --use_legacy_sql=false --parameter=dia:DATE:2026-09-30 < reconciliacion.sql`, o desde el orquestador como en `airflow-daily-partition-dag`). Registrar el resultado en una tabla de reconciliación y fallar o alertar si no coincide.

## 8. Conceptos relacionados

- `data-reconciliation`: el patrón que implementa.
- `incremental-load` y `backfill`: los momentos en que se reconcilia.

## 9. Fuentes

- Google Cloud: *Hash functions*, *Aggregate functions*, *Run parameterized queries* y *BigQuery IAM roles and permissions* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `data-reconciliation` tras la revisión B-F3.1 del lote 3.
- 2026-10-01: `verification_status: verified` (revisión B-F3.2 de snippets aprobada y aplicada; sin VERIFY pendientes).

---
id: code_snippet:bigquery-deduplicate-latest
slug: bigquery-deduplicate-latest
type: code_snippet
title: Deduplicar por clave y aplicar la última versión en BigQuery
description: "Deduplica un lote por clave quedándose con la versión más reciente (QUALIFY ROW_NUMBER) y lo aplica con MERGE condicionado a la versión."
language: sql
dialect: bigquery
requirements:
  - "Tabla staging proyecto.staging.clientes(cliente_id, email, version) que puede traer varias filas por cliente_id."
  - "Tabla destino proyecto.dwh.clientes(cliente_id, email, version)."
  - "Permisos para ejecutar consultas (roles/bigquery.jobUser) y editar la tabla destino (roles/bigquery.dataEditor)."
classification: core
level: intermediate
cloud: [gcp]
technologies: [gcp-bigquery]
tags: [sql, bigquery, deduplication, upsert]
related_topics: [deduplication, sql-window-functions, upsert, sql-merge, idempotency]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
    accessed: 2026-10-01
    note: "Sintaxis de MERGE; si una fila destino coincide con más de una fila de origen, error UPDATE/MERGE must match at most one source row for each target row."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    note: "roles/bigquery.jobUser permite ejecutar consultas en el proyecto; roles/bigquery.dataEditor sobre un dataset permite modificar sus tablas."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
    accessed: 2026-10-01
    note: "QUALIFY filtra los resultados de funciones de ventana; solo se incluyen las filas cuya expresión es TRUE; se evalúa después de WHERE, GROUP BY, HAVING y WINDOW."
relations:
  - type: IMPLEMENTS
    target: deduplication
    note: Deduplica el lote por clave con QUALIFY ROW_NUMBER y se queda con la versión más reciente.
  - type: IMPLEMENTS
    target: sql-window-functions
    note: ROW_NUMBER() OVER (PARTITION BY clave ORDER BY version DESC) filtrado con QUALIFY.
  - type: IMPLEMENTS
    target: upsert
    note: Upsert por clave con deduplicación previa y condición de versión.
  - type: USES
    target: sql-merge
    note: El MERGE aplica la última versión de cada clave.
  - type: DEPENDS_ON
    target: idempotency
    note: Aplicar el mismo lote dos veces deja la tabla igual.
created_at: 2026-10-01
updated_at: 2026-10-05
last_verified: 2026-10-01
verification_status: verified
---

## 1. Qué resuelve

Un lote trae varias filas por clave (reintentos, reenvíos, cambios sucesivos) y hay que quedarse con la más reciente y aplicarla al destino sin duplicar ni pisar datos más nuevos. Deduplicar antes es obligatorio en BigQuery: un `MERGE` en el que una fila destino coincide con varias de origen falla. Implementa el patrón `upsert` y es el bloque de BigQuery de su sección 10. Cuando exista la ficha `deduplication`, este snippet se enlazará también a ella.

## 2. Código

```sql
-- BigQuery: el mismo patrón con MERGE; el lote se deduplica antes para no fallar
-- con "UPDATE/MERGE must match at most one source row for each target row".
MERGE `proyecto.dwh.clientes` AS t
USING (
  SELECT * FROM `proyecto.staging.clientes`
  WHERE TRUE
  QUALIFY ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY version DESC) = 1
) AS s
ON t.cliente_id = s.cliente_id
WHEN MATCHED AND s.version > t.version THEN
  UPDATE SET email = s.email, version = s.version
WHEN NOT MATCHED THEN
  INSERT (cliente_id, email, version) VALUES (s.cliente_id, s.email, s.version);
```

## 3. Cómo funciona

1. **Deduplicación:** `ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY version DESC)` numera las filas de cada cliente de la más nueva a la más vieja, y `QUALIFY ... = 1` deja solo la primera: `QUALIFY` filtra por el resultado de funciones de ventana y conserva las filas donde la condición es verdadera. El `WHERE TRUE` no filtra nada; se mantiene igual que en la ficha `upsert`.
2. **Upsert:** el `MERGE` actualiza si la versión que llega es más nueva y, si la clave no existe, inserta.

Es **atómico** porque es una sola sentencia, e **idempotente** porque repetirla con el mismo lote no inserta duplicados (`MERGE` por clave) ni sobrescribe con versiones viejas (`s.version > t.version`).

## 4. Cuándo usarlo

- Lotes con posibles duplicados por clave: reintentos, mensajes at-least-once, extracciones solapadas.
- Tablas de estado actual con una columna de versión o de última modificación confiable.

## 5. Cuándo no usarlo

- Cuando hay que conservar todas las versiones: corresponde SCD2 (`bigquery-scd-type-2`) o una tabla de eventos.
- Si no hay una columna que ordene las versiones sin empates: la elección de la "última" sería arbitraria.
- Para reemplazar períodos completos: reemplazar la partición es más simple y barato.

## 6. Riesgos

- **Empates en `version`:** con dos filas de igual versión, `ROW_NUMBER` elige una de forma no determinista. Agregar un desempate en el `ORDER BY` (por ejemplo, el timestamp de ingesta).
- **Borrados:** este patrón no los propaga; si el origen borra, hace falta una marca de borrado o CDC.
- **Seguridad:** la cuenta que ejecuta necesita permiso de edición sobre el destino; no reutilizar credenciales de usuarios.
- **Costo:** el `MERGE` lee el destino completo salvo que la condición filtre por partición.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Ejecutar como una consulta de BigQuery después de cargar el staging. Reemplazar `proyecto`, datasets y columnas; si la versión es un timestamp, el patrón es el mismo.

## 8. Conceptos relacionados

- `upsert`: el otro patrón que implementa.
- `sql-merge`: la sentencia que lo aplica.
- `idempotency`: por qué repetirlo es seguro.
- `deduplication`: el patrón de deduplicación por clave que aplica antes del `MERGE`.
- `sql-window-functions`: `ROW_NUMBER` con `QUALIFY`.

## 9. Fuentes

- Google Cloud: *DML syntax*, *Query syntax* y *BigQuery IAM roles and permissions* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde el bloque de BigQuery de la sección 10 de `upsert` tras la revisión B-F3.1 del lote 2.
- 2026-10-01: `verification_status: verified` (revisión B-F3.2 de snippets aprobada y aplicada; sin VERIFY pendientes).
- 2026-10-04: implementa también `deduplication`, verificada en el lote 5.
- 2026-10-05: implementa también `sql-window-functions`, verificada en el lote 6.

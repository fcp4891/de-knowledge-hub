---
id: code_snippet:bigquery-scd-type-2
slug: bigquery-scd-type-2
type: code_snippet
title: SCD tipo 2 en BigQuery
description: "Transacción de BigQuery que cierra la versión vigente de los miembros que cambiaron e inserta la nueva versión, sin duplicar si se repite."
language: sql
dialect: bigquery
requirements:
  - "Dimensión proyecto.dataset.dim_cliente(sk STRING, cliente_id STRING, region STRING, valid_from TIMESTAMP, valid_to TIMESTAMP, is_current BOOL)."
  - "Tabla proyecto.dataset.cambios(cliente_id STRING, region STRING, cambiado_en TIMESTAMP) con un cambio por cliente (deduplicada antes, por ejemplo con bigquery-deduplicate-latest)."
  - "Permisos para ejecutar consultas (roles/bigquery.jobUser) y editar las tablas (roles/bigquery.dataEditor)."
  - "Se ejecuta como un único script de varias sentencias."
classification: core
level: intermediate
cloud: [gcp]
technologies: [gcp-bigquery]
tags: [sql, bigquery, data-modeling, scd]
related_topics: [scd-type-2, sql-merge, idempotency]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/transactions
    accessed: 2026-10-01
    page_title: "Multi-statement transactions"
    note: "Transacciones de varias sentencias con commit o rollback atómico."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
    accessed: 2026-10-01
    page_title: "Data manipulation language (DML) statements in GoogleSQL"
    note: "UPDATE ... FROM e INSERT ... SELECT; una fila destino que coincide con más de una de origen produce un error."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/utility-functions
    accessed: 2026-10-01
    page_title: "Utility functions"
    note: "GENERATE_UUID() devuelve un UUID aleatorio como STRING."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    page_title: "BigQuery IAM roles and permissions"
    note: "roles/bigquery.jobUser permite ejecutar consultas en el proyecto; roles/bigquery.dataEditor sobre un dataset permite modificar sus tablas."
relations:
  - type: IMPLEMENTS
    target: scd-type-2
    note: Cierre de la versión vigente e inserción de la nueva, en una transacción.
  - type: RELATED_TO
    target: sql-merge
    note: El mismo patrón puede escribirse con MERGE sobre un origen preparado.
  - type: DEPENDS_ON
    target: idempotency
    note: Repetir la transacción con los mismos cambios no crea versiones nuevas.
created_at: 2026-10-01
updated_at: 2026-10-13
last_verified: 2026-10-01
verification_status: verified
---

## 1. Qué resuelve

Mantiene una dimensión SCD tipo 2 en BigQuery: cuando cambia un atributo con historia (aquí, `region`), cierra la fila vigente e inserta una nueva con su propia clave sustituta. Los hechos anteriores siguen apuntando a la versión que estaba vigente cuando ocurrieron. Es el código de la sección 10 de `scd-type-2`.

## 2. Código

```sql
-- BigQuery (ejecutable adaptando nombres), en una transacción de varias sentencias.
-- Requiere: dim_cliente(sk STRING, cliente_id STRING, region STRING, valid_from TIMESTAMP,
--           valid_to TIMESTAMP, is_current BOOL) y cambios(cliente_id, region, cambiado_en TIMESTAMP),
--           con un cambio por cliente (deduplicado antes).
BEGIN TRANSACTION;

-- 1. Cerrar la versión vigente de los clientes con cambio real.
UPDATE `proyecto.dataset.dim_cliente` d
SET valid_to = c.cambiado_en, is_current = FALSE
FROM `proyecto.dataset.cambios` c
WHERE d.cliente_id = c.cliente_id AND d.is_current AND d.region != c.region;

-- 2. Insertar la nueva versión para clientes nuevos o recién cerrados.
INSERT INTO `proyecto.dataset.dim_cliente` (sk, cliente_id, region, valid_from, valid_to, is_current)
SELECT GENERATE_UUID(), c.cliente_id, c.region, c.cambiado_en, NULL, TRUE
FROM `proyecto.dataset.cambios` c
LEFT JOIN `proyecto.dataset.dim_cliente` d
  ON d.cliente_id = c.cliente_id AND d.is_current
WHERE d.cliente_id IS NULL;

COMMIT TRANSACTION;
```

## 3. Cómo funciona

1. **Cierre:** a los clientes cuya región vigente difiere de la que llega, se les pone `valid_to` y `is_current = FALSE`.
2. **Inserción:** se inserta una versión nueva para todo cliente que, después del paso 1, no tiene fila vigente: los nuevos y los recién cerrados. La clave sustituta sale de `GENERATE_UUID()`.
3. Ambos pasos van en una **transacción**: si el `INSERT` falla, el cierre se revierte y la dimensión no queda sin versión vigente.

Es **idempotente**: repetirla con los mismos cambios no cierra nada (la región vigente ya coincide) y no inserta nada (ya hay fila vigente). El intervalo de validez es semiabierto `[valid_from, valid_to)`, como en la ficha.

## 4. Cuándo usarlo

- Dimensiones cuyos atributos se analizan históricamente (región, segmento, categoría).
- Cargas por lotes con un cambio por miembro.

## 5. Cuándo no usarlo

- Atributos sin valor histórico: sobrescribir (tipo 1) es más simple; ver `slowly-changing-dimensions` cuando se verifique.
- Lotes con varios cambios por miembro dentro del mismo período: hay que deduplicar antes o generar una versión por cambio en orden.
- Atributos que cambian muy seguido en dimensiones enormes: el tipo 2 multiplica filas.

## 6. Riesgos

- **Varios cambios por cliente en el lote:** se insertarían dos versiones vigentes. Deduplicar antes es obligatorio.
- **`!=` con NULL:** si `region` puede ser nula, `d.region != c.region` no detecta el paso de NULL a valor; usar `IS DISTINCT FROM` si aplica.
- **UUID no reproducible:** reconstruir la dimensión desde cero genera claves nuevas; si los hechos ya guardaron claves, hay que reconstruirlos también.
- **Seguridad:** la historia conserva valores antiguos (direcciones, regiones); aplicar las mismas políticas de acceso que a los datos vigentes.
- **Costo:** cada cambio agrega una fila; vigilar el crecimiento de la dimensión.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Ejecutar el script completo como una consulta (consola de BigQuery, `bq query --use_legacy_sql=false` o una tarea del orquestador) después de cargar y deduplicar `cambios`. Reemplazar `proyecto` y `dataset`.

## 8. Conceptos relacionados

- `scd-type-2`: el patrón que implementa.
- `sql-merge`: alternativa con `MERGE` sobre un origen preparado.
- `idempotency`: por qué repetirlo es seguro.

## 9. Fuentes

- Google Cloud: *Multi-statement transactions*, *DML syntax*, *Utility functions* y *BigQuery IAM roles and permissions* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `scd-type-2` tras la revisión B-F3.1 del lote 1.
- 2026-10-01: `verification_status: verified` (revisión B-F3.2 de snippets aprobada y aplicada; sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.

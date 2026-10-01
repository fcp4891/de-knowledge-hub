---
id: code_snippet:dataform-incremental-model
slug: dataform-incremental-model
type: code_snippet
title: Modelo incremental en Dataform con uniqueKey
description: "Tabla incremental de Dataform (SQLX) que se construye completa la primera vez y después fusiona solo lo nuevo por clave, con un margen de relectura."
language: sql
dialect: dataform-sqlx
requirements:
  - "Repositorio de Dataform conectado a BigQuery, con el archivo en definitions/orders.sqlx."
  - "Fuente raw_orders(order_id, status, updated_at TIMESTAMP) declarada en definitions/ con type declaration (database, schema, name)."
  - "Cuenta de servicio de Dataform con permisos para ejecutar consultas y crear y modificar tablas en el dataset de destino."
classification: modern
level: intermediate
cloud: [gcp]
technologies: [gcp-dataform, gcp-bigquery]
tags: [sql, dataform, incremental, bigquery]
related_topics: [incremental-load, idempotency]
sources:
  - source: gcp-dataform-docs
    url: https://docs.cloud.google.com/dataform/docs/create-tables
    accessed: 2026-10-01
    note: "Los archivos SQLX de tablas van en definitions/. Una tabla incremental (type incremental) se construye desde cero la primera vez y luego inserta o fusiona filas nuevas; when(incremental(), ...) agrega la condición solo en las ejecuciones incrementales y ${self()} referencia la propia tabla; uniqueKey fusiona filas con la misma clave. Al compilar, Dataform agrega sentencias como CREATE, REPLACE, INSERT o MERGE."
  - source: gcp-dataform-docs
    url: https://docs.cloud.google.com/dataform/docs/declare-source
    accessed: 2026-10-01
    note: "Una fuente se declara con config { type: declaration, database, schema, name }: proyecto, dataset y nombre de la tabla o vista."
relations:
  - type: IMPLEMENTS
    target: incremental-load
    note: Carga incremental con fusión por clave (modo upsert) y relectura de un margen.
  - type: DEPENDS_ON
    target: idempotency
    note: Con uniqueKey, releer el margen o repetir la ejecución no duplica filas.
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: verified
---

## 1. Qué resuelve

Mantiene en BigQuery una tabla que se actualiza de forma incremental sin escribir el `MERGE` a mano: Dataform compila el SQLX a las sentencias necesarias. La primera ejecución construye la tabla completa; las siguientes procesan solo lo nuevo y lo fusionan por `order_id`. Es el código de la sección 10 de `incremental-load`.

## 2. Código

```sql
-- Dataform (SQLX), tabla incremental con uniqueKey: la primera vez se construye completa;
-- después solo procesa lo nuevo y fusiona por order_id en lugar de agregar duplicados.
config {
  type: "incremental",
  uniqueKey: ["order_id"]
}

SELECT order_id, status, updated_at
FROM ${ref("raw_orders")}
${when(incremental(),
  `WHERE updated_at > (SELECT MAX(updated_at) FROM ${self()}) - INTERVAL 30 MINUTE`)}
```

```sql
-- definitions/raw_orders.sqlx: declaración de la fuente.
config {
  type: "declaration",
  database: "proyecto",
  schema: "raw",
  name: "raw_orders",
}
```

## 3. Cómo funciona

1. **Primera ejecución:** la tabla no existe; `when(incremental(), ...)` no agrega el filtro y se construye con todo `raw_orders`.
2. **Ejecuciones siguientes:** se agrega el `WHERE` que lee solo lo posterior al máximo `updated_at` ya cargado (`${self()}` es la propia tabla), menos un **margen de 30 minutos** para no perder filas que llegaron con retraso.
3. **Fusión por clave:** con `uniqueKey`, las filas releídas en el margen o repetidas se fusionan por `order_id` en lugar de duplicarse.

Es **idempotente**: repetir la ejecución vuelve a leer el mismo margen y fusiona las mismas claves, sin duplicar.

## 4. Cuándo usarlo

- Modelos de transformación en BigQuery orquestados con Dataform.
- Tablas de estado actual con una columna de modificación confiable.
- Cuando se prefiere declarar la lógica y dejar que Dataform genere el `MERGE`.

## 5. Cuándo no usarlo

- Si hay que conservar historia de cambios: SCD2 (`bigquery-scd-type-2`).
- Si los datos llegan con retrasos mayores al margen: ampliarlo o reprocesar períodos completos.
- Si se necesita el estado del pipeline explícito (watermark con control de concurrencia): ver `bigquery-incremental-merge-watermark`.

## 6. Riesgos

- **Datos tardíos más allá del margen:** se pierden para el modelo incremental hasta una reconstrucción completa.
- **Marca desde la propia tabla:** el filtro usa `MAX(updated_at)` del destino; una fila con timestamp futuro adelanta la marca. Conviene filtrar los timestamps futuros en la fuente o en el modelo.
- **Seguridad:** la cuenta de servicio de Dataform necesita permisos de escritura en el dataset de destino; limitarlos a ese dataset.
- **Costo:** el margen relee datos en cada ejecución; ajustarlo a los retrasos observados.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Guardar el modelo en `definitions/orders.sqlx` y la declaración en `definitions/raw_orders.sqlx`, ajustar `database` (proyecto) y `schema` (dataset), compilar en el espacio de trabajo de Dataform y ejecutar el workflow.

## 8. Conceptos relacionados

- `incremental-load`: el patrón que implementa.
- `idempotency`: por qué releer el margen no duplica.
- Pendiente de ficha: `dataform-incremental-tables`.

## 9. Fuentes

- Google Cloud: *Create tables* y *Declare a data source* (Dataform).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `incremental-load` tras la revisión B-F3.1 del lote 1.
- 2026-10-01: `verification_status: verified` (revisión B-F3.2 de snippets aprobada y aplicada; sin VERIFY pendientes).

---
id: pattern:incremental-pipelines
slug: incremental-pipelines
type: pattern
title: Pipelines incrementales
description: Diseño de pipelines en el que cada etapa procesa solo el delta desde la última ejecución y guarda un estado (watermark, bookmark, intervalo) para saber dónde retomar.
domain: pipelines
subdomain: pipeline-patterns
classification: core
level: intermediate
importance: high
cloud: [gcp, aws, azure, agnostic]
technologies: [apache-airflow, gcp-dataform, gcp-bigquery, aws-glue, azure-data-factory]
tags: [pipelines, performance, reliability]
related_topics: [incremental-load, idempotency, change-data-capture, backfill]
sources:
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dag-run.html
    accessed: 2026-09-30
    note: Cada ejecución de un Dag tiene un data interval que delimita el período que procesa.
  - source: gcp-dataform-docs
    url: https://docs.cloud.google.com/dataform/docs/create-tables
    accessed: 2026-09-30
    note: Tablas incrementales en Dataform; se construyen desde cero la primera vez y luego insertan o fusionan filas nuevas; uniqueKey fusiona filas con la misma clave.
  - source: aws-glue-docs
    url: https://docs.aws.amazon.com/glue/latest/dg/monitor-continuations.html
    accessed: 2026-09-30
    note: Los job bookmarks guardan qué datos ya procesó un job ETL para evitar reprocesarlos; en S3 se basan en la fecha de modificación de los objetos.
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/data-factory/tutorial-incremental-copy-overview
    accessed: 2026-09-30
    note: Carga incremental en Data Factory por watermark (columna de timestamp de actualización o clave incremental; se carga lo cambiado entre el watermark anterior y el nuevo), por Change Tracking, por LastModifiedDate de archivos (ADF escanea todos los archivos y filtra) o por carpetas particionadas por tiempo (el enfoque más eficiente para archivos nuevos).
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/transactions
    accessed: 2026-09-30
    note: Transacciones de varias sentencias con commit o rollback atómico.
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
    accessed: 2026-09-30
    note: Sintaxis de MERGE; error si una fila destino coincide con más de una fila de origen.
relations:
  - type: USES
    target: incremental-load
    note: Cada etapa aplica una carga incremental sobre su destino.
  - type: DEPENDS_ON
    target: idempotency
    note: Reejecutar una etapa con el mismo intervalo no debe duplicar.
  - type: RELATED_TO
    target: change-data-capture
    note: CDC es una forma de obtener el delta en la primera etapa.
  - type: RELATED_TO
    target: backfill
    note: Un pipeline incremental bien diseñado hace backfill reejecutando intervalos.
created_at: 2026-09-30
updated_at: 2026-09-30
last_verified: 2026-09-30
verification_status: review_required
---

## 1. Resumen

Un pipeline incremental procesa en cada ejecución solo lo nuevo desde la vez anterior, en todas sus etapas y no solo en la carga final. Para eso cada etapa necesita un **estado** que diga dónde retomar (un watermark, un bookmark o el intervalo de la ejecución) y una escritura idempotente, de modo que reejecutar un intervalo no duplique nada.

## 2. Qué es

Es un patrón de diseño de pipeline completo. `incremental-load` resuelve cómo escribir un delta en una tabla. Este patrón resuelve algo más amplio:

- cómo se **detecta** el delta en el origen (watermark, CDC, archivos nuevos);
- dónde se **guarda** el estado (en el orquestador, en el job, en una tabla de control);
- cómo se **propaga** el delta entre etapas (raw → staging → modelo);
- cómo se **repite** un intervalo (reintento, backfill) sin romper nada.

## 3. Problema que resuelve

Reprocesar todo en cada ejecución se vuelve lento y caro a medida que crecen los datos. Pero hacer incremental solo la extracción no basta: si una etapa intermedia recalcula todo, el costo vuelve. Y si el estado vive en un lugar frágil (un archivo local, una variable), un fallo deja al pipeline sin saber desde dónde seguir.

## 4. Cómo funciona

Hay dos formas principales de definir el delta.

- **Por intervalo:** cada ejecución procesa un período fijo (por ejemplo, el día D), que le da el orquestador. En **Airflow**, cada ejecución tiene un *data interval*. El estado es implícito: el intervalo *es* el estado. Reejecutar el día D es repetir exactamente el mismo trabajo.
- **Por marca de progreso:** el pipeline guarda hasta dónde llegó, como un watermark (último `updated_at` o id procesado) o un bookmark. Esa marca solo se actualiza **después** de escribir con éxito.

Después, cada etapa lee solo el delta de la anterior (la partición del período o las filas con marca posterior) y escribe de forma idempotente (reemplazo de partición o `MERGE` por clave).

## 5. Cuándo utilizarlo

- Volúmenes que hacen caro o lento el reproceso completo.
- Orígenes que exponen una marca fiable de cambio (timestamp, id creciente, CDC, archivos por fecha).
- Pipelines de varias etapas en los que cada una puede trabajar por período.

## 6. Cuándo no utilizarlo

- Tablas pequeñas: una recarga completa es más simple y evita errores de estado.
- Orígenes sin una marca fiable de cambio y sin CDC: el delta será incompleto (por ejemplo, borrados invisibles).
- Transformaciones que dependen de toda la historia en cada ejecución (algunas métricas acumuladas): hay que rediseñarlas o aceptar el recálculo completo.

## 7. Ejemplo sencillo

Un pipeline diario procesa solo el día anterior: extrae los pedidos de ese día, los deja en la partición de ese día de la capa raw, y la transformación reemplaza solo esa partición en el modelo. Reejecutar el día repite el mismo trabajo y deja el mismo resultado.

## 8. Ejemplo de producción

La primera etapa lee cambios con CDC y los escribe en raw particionada por fecha de llegada. Una tabla de control guarda, por fuente, el último offset confirmado; se actualiza en la misma transacción que la escritura. La etapa de staging procesa las particiones nuevas y aplica `MERGE` por clave primaria y versión. El modelo final se recalcula solo para las fechas de negocio afectadas. Un backfill no requiere código especial: es reejecutar intervalos.

## 9. Arquitectura

```mermaid
flowchart LR
  SRC[(Origen)] -->|delta: watermark o CDC| RAW[(Raw por partición)]
  RAW -->|solo particiones nuevas| STG[Staging: MERGE por clave y versión]
  STG -->|fechas afectadas| MOD[(Modelo)]
  CTRL[(Estado: intervalo, watermark, bookmark)] -.-> SRC
  STG -.->|actualizar estado tras éxito| CTRL
```

## 10. Código

```sql
-- Etapa incremental por watermark, idempotente y atómica (BigQuery).
-- Requiere: tabla de control etl_control(fuente, watermark) y destino con clave pedido_id.
BEGIN TRANSACTION;

MERGE `proyecto.dwh.pedidos` AS t
USING (
  SELECT * FROM `proyecto.staging.pedidos`
  WHERE updated_at > (SELECT watermark FROM `proyecto.dwh.etl_control` WHERE fuente = 'pedidos')
  QUALIFY ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY updated_at DESC) = 1  -- una fila por clave
) AS s
ON t.pedido_id = s.pedido_id
WHEN MATCHED AND s.updated_at > t.updated_at THEN
  UPDATE SET estado = s.estado, monto = s.monto, updated_at = s.updated_at
WHEN NOT MATCHED THEN
  INSERT (pedido_id, estado, monto, updated_at) VALUES (s.pedido_id, s.estado, s.monto, s.updated_at);

UPDATE `proyecto.dwh.etl_control`
SET watermark = (SELECT MAX(updated_at) FROM `proyecto.dwh.pedidos`)
WHERE fuente = 'pedidos';

COMMIT TRANSACTION;
```

El watermark se actualiza en la misma transacción que la escritura: si algo falla, no avanza, y la siguiente ejecución repite el mismo delta sin duplicar.

## 11. GCP

En **Dataform**, una tabla `incremental` se construye desde cero la primera vez y luego inserta o fusiona solo las filas nuevas; con `uniqueKey` fusiona las filas que tienen la misma clave. La orquestación por intervalos se hace con **Managed Service for Apache Airflow (ex Cloud Composer)**, que ejecuta Dags de Airflow con su *data interval*.

## 12. AWS

En **AWS Glue**, los *job bookmarks* guardan qué datos ya procesó un job para no reprocesarlos (en S3, según la fecha de modificación de los objetos). El estado vive en el servicio y no en el intervalo de la ejecución: es cómodo, pero un reproceso obliga a decidir explícitamente qué hacer con el bookmark.

## 13. Azure

**Data Factory** documenta varios enfoques de carga incremental:

- **watermark** en la base de origen: se carga lo cambiado entre el watermark anterior y el nuevo;
- **Change Tracking** de SQL;
- **LastModifiedDate** de archivos: ADF escanea todos los archivos y filtra;
- **carpetas o nombres particionados por tiempo**: el enfoque más eficiente para archivos nuevos.

El estado del watermark lo guarda el propio pipeline (por ejemplo, en una tabla), no el servicio.

## 14. Buenas prácticas

- Preferir el intervalo de la ejecución como estado cuando el origen lo permite: hace triviales los reintentos y los backfills.
- Si se usa watermark, avanzarlo solo después de escribir y, cuando sea posible, en la misma transacción.
- Hacer incrementales todas las etapas costosas, no solo la extracción.
- Mantener una forma documentada de hacer una recarga completa.
- **Seguridad:** proteger la tabla de control del estado: quien la modifica puede saltarse o repetir datos.
- **Observabilidad:** registrar por ejecución el intervalo o el rango de watermark procesado y las filas leídas y escritas; alertar si el watermark deja de avanzar.
- **Costo:** medir los bytes procesados por etapa; una etapa que recalcula todo anula el ahorro del resto.

## 15. Errores frecuentes

- Avanzar el watermark antes de escribir y perder datos si la escritura falla.
- Usar `>=` o `>` sin pensar en empates de timestamp y perder o duplicar filas.
- Suponer que un watermark por `updated_at` captura los borrados.
- Hacer incremental solo la extracción y recalcular completo en las etapas siguientes.

## 16. Trade-offs

El estado por intervalo es simple y repetible, pero requiere que el origen se pueda consultar por período. El estado por watermark o bookmark se adapta a orígenes sin períodos claros, a cambio de más cuidado al avanzarlo y más complejidad al reprocesar.

## 17. Conceptos relacionados

- `incremental-load`: la escritura del delta en una tabla.
- `idempotency`: requisito para repetir intervalos.
- `change-data-capture`: fuente de deltas completos, incluidos borrados.
- `backfill`: reejecutar intervalos históricos.
- Del blueprint, pendientes de ficha: `watermarks`, `checkpoints`, `full-refresh`.

## 18. Preguntas técnicas abiertas

1. ¿Qué estado usarías para un origen que no tiene `updated_at` pero sí un id autoincremental?
2. ¿Cómo detectarías que un pipeline incremental está perdiendo filas silenciosamente?
3. ¿Cómo harías una recarga completa de un pipeline incremental sin detener las ejecuciones diarias?

## 19. Laboratorio relacionado

Pendiente (F4): pipeline incremental con watermark y backfill (lab de tipo A).

## 20. Fuentes

- Apache Airflow: *Dag Runs*.
- Google Cloud: *Create tables* (Dataform), *Multi-statement transactions* y *DML syntax* (BigQuery).
- AWS: *Tracking processed data using job bookmarks* (Glue).
- Microsoft Learn: *Incrementally copy data from a source data store to a destination data store* (Data Factory).

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-09-30. La ficha queda en `review_required` hasta la revisión humana (B-F3.2).

## 22. Historial de cambios importantes

- 2026-09-30: creación (lote 2 de F3).

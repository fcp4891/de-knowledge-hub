---
id: concept:bigquery-cost-model
slug: bigquery-cost-model
type: concept
title: Modelo de costos de BigQuery
description: "Cómo cobra BigQuery (sin montos): cómputo on-demand por bytes procesados o por capacidad en slots (editions y reservas), almacenamiento activo y long-term con facturación lógica o física, y los controles para estimar y limitar el gasto."
domain: gcp
subdomain: bigquery
category: gcp
classification: modern
level: intermediate
importance: high
cloud: [gcp, aws, azure]
technologies: [gcp-bigquery, aws-redshift, aws-athena, azure-synapse, microsoft-fabric]
tags: [bigquery, cost, finops]
related_topics: [bigquery-partitioning, bigquery-clustering, partition-pruning, row-vs-columnar-formats]
sources:
  - source: gcp-bigquery-docs
    url: https://cloud.google.com/bigquery/pricing
    accessed: 2026-10-05
    page_title: "BigQuery pricing"
    note: "Dos componentes: cómputo (consultas, UDF, scripts y ciertos DML y DDL) y almacenamiento; otras operaciones se cobran aparte (Omni, BigQuery ML, BI Engine, lecturas y escrituras streaming). Cómputo on-demand: se cobran los bytes procesados por cada consulta, con un primer tramo mensual gratuito; no se cobran consultas con error ni las servidas desde caché; redondeo al MB con mínimo de 10 MB por tabla referenciada y por consulta; cancelar una consulta puede cobrar hasta su costo completo. Cómputo por capacidad: slots (CPU virtuales) en el tiempo, mediante reservas, con pago por uso con autoscaling; ediciones Standard, Enterprise y Enterprise Plus; los compromisos opcionales de uno y tres años con descuento existen solo en Enterprise y Enterprise Plus; con reservas de Enterprise o Enterprise Plus, el uso de BigQuery ML queda incluido en el uso de las ediciones; no aplica a almacenamiento, BI Engine, inserciones streaming ni Storage API. Almacenamiento activo y long-term: pasa a long-term la tabla o partición sin modificar durante 90 días consecutivos. Time travel y fail-safe no se cobran con facturación lógica y sí con facturación física. Los precios cambian y dependen de la región."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/slots
    accessed: 2026-10-05
    page_title: "Understand slots"
    note: "Un slot es una unidad de cómputo virtual que BigQuery usa para ejecutar consultas y otros jobs; BigQuery determina automáticamente cuántos slots usa cada consulta."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reservations-intro
    accessed: 2026-10-05
    page_title: "Introduction to workload management"
    note: "La gestión de cargas con reservas asigna capacidad en slots a proyectos o carpetas."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/datasets-intro
    accessed: 2026-10-05
    page_title: "Introduction to datasets"
    note: "Dos modelos de facturación de almacenamiento por dataset: lógico (sin comprimir) y físico (comprimido); cambiarlo solo cambia la medición, sin migrar datos. Time travel y fail-safe retienen datos borrados o modificados por un tiempo."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
    accessed: 2026-10-05
    page_title: "Data definition language (DDL) statements in GoogleSQL"
    note: "La opción de dataset storage_billing_model admite PHYSICAL o LOGICAL; LOGICAL es el valor por defecto."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/best-practices-costs
    accessed: 2026-10-05
    page_title: "Estimate and control costs"
    note: "En on-demand, las consultas se facturan por bytes leídos: previsualizar con el validador o un dry run. El ajuste de máximo de bytes facturados hace fallar sin cargo la consulta cuya estimación lo supere (en tablas clusterizadas la estimación es una cota superior y puede fallar aunque el costo real fuera menor). En tablas no clusterizadas, LIMIT no reduce el costo de cómputo."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/custom-quotas
    accessed: 2026-10-05
    page_title: "Create custom query quotas"
    note: "Las cuotas personalizadas limitan los datos procesados por día a nivel de proyecto o de usuario; se reinician a medianoche hora del Pacífico y son proactivas: no se puede correr una consulta de 11 TB con una cuota de 10 TB."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/bq-cli-reference
    accessed: 2026-10-05
    page_title: "bq command-line tool reference"
    note: "bq query --dry_run valida sin ejecutar; --maximum_bytes_billed fija el límite de bytes facturados de la consulta."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/information-schema-jobs
    accessed: 2026-10-05
    page_title: "JOBS view"
    note: "INFORMATION_SCHEMA.JOBS (sinónimo de JOBS_BY_PROJECT) tiene metadatos casi en tiempo real de los jobs del proyecto; requiere calificador de región (por ejemplo region-us); está particionada por creation_time y clusterizada por project_id y user_email. total_bytes_billed: bytes facturados con on-demand (informativo con capacidad); cache_hit; job_type."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/mgmt/serverless-billing.html
    accessed: 2026-10-05
    page_title: "Billing for Amazon Redshift Serverless"
    note: "Redshift Serverless: capacidad on-demand (pago por uso) o reservas con descuento por una cantidad fija durante un período; el almacenamiento se cobra aparte por GB-mes; cargo mínimo de 60 segundos de uso, medido por segundo."
  - source: aws-athena-docs
    url: https://docs.aws.amazon.com/athena/latest/ug/what-is.html
    accessed: 2026-10-05
    page_title: "What is Amazon Athena?"
    note: "Athena es serverless: no hay infraestructura que administrar y se paga solo por las consultas que se ejecutan."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/sql/on-demand-workspace-overview
    accessed: 2026-10-05
    page_title: "Serverless SQL pool in Azure Synapse Analytics"
    note: "El serverless SQL pool de Synapse no cobra por recursos reservados: solo por los datos procesados por las consultas (pago por uso)."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/fabric/enterprise/licenses
    accessed: 2026-10-05
    page_title: "Understand Microsoft Fabric licenses and capacity"
    note: "Fabric se compra por capacidad (SKU); las capacity units (CU) miden la potencia de cómputo de cada SKU; la capacidad permite usar todas las funciones de Fabric licenciadas por capacidad."
relations:
  - type: RELATED_TO
    target: bigquery-partitioning
    note: Particionar y filtrar por la partición reduce los bytes procesados en on-demand.
  - type: RELATED_TO
    target: bigquery-clustering
    note: El clustering reduce bytes leídos y hace que LIMIT pueda reducir costo.
  - type: RELATED_TO
    target: partition-pruning
    note: El pruning es la palanca principal del modelo on-demand.
  - type: RELATED_TO
    target: row-vs-columnar-formats
    note: El almacenamiento columnar hace que elegir columnas reduzca lo facturado.
  - type: RELATED_TO
    target: bigquery-query-optimization
    note: El plan, las insights y las prácticas de optimización de BigQuery.
  - type: RELATED_TO
    target: scan-reduction
    note: "Reducción de datos escaneados."
created_at: 2026-10-05
updated_at: 2026-10-13
last_verified: 2026-10-05
verification_status: verified
---

<!-- Precios y modalidades cambian: esta ficha describe el modelo, sin montos. Los precios vigentes están en la página de precios de BigQuery, por región. -->

## 1. Resumen

BigQuery cobra por separado el **cómputo** y el **almacenamiento**. Para el cómputo hay dos modelos:

- **on-demand**, por bytes procesados en cada consulta;
- **capacidad**, por slots (CPU virtuales) en el tiempo, con reservas y ediciones; los compromisos opcionales son solo de Enterprise y Enterprise Plus.

El almacenamiento distingue datos **activos** y **long-term** (sin modificar durante 90 días), y cada dataset elige facturar en bytes **lógicos** o **físicos**. Esta ficha explica el modelo y sus palancas, sin montos: los precios cambian y dependen de la región.

## 2. Qué es

Es el esquema de facturación de BigQuery, un servicio administrado de Google Cloud (clasificación *modern*). Saber cómo cobra es parte del diseño: en on-demand, la misma pregunta puede costar cien veces más según cómo se escriba la consulta y cómo esté organizada la tabla.

| Componente | Modelo | Qué se mide |
|---|---|---|
| Cómputo | On-demand | Bytes procesados por consulta |
| Cómputo | Capacidad (editions) | Slots en el tiempo, vía reservas; Standard, pago por uso con autoscaling; Enterprise y Enterprise Plus, además, compromisos de 1 o 3 años |
| Almacenamiento | Activo / long-term | Datos modificados en los últimos 90 días o no |
| Almacenamiento | Lógico / físico | Bytes sin comprimir o comprimidos (por dataset) |
| Otros | Aparte | Inserciones y lecturas streaming, BI Engine, Omni; BigQuery ML aparte, salvo con reservas de Enterprise o Enterprise Plus, donde entra en el uso de las ediciones |

## 3. Problema que resuelve

Sin entender el modelo aparecen sorpresas: un tablero que escanea toda la tabla cada cinco minutos, un analista que corre `SELECT *` sobre años de eventos, o un equipo con capacidad comprada que igual paga on-demand en otro proyecto. Conocer qué se mide permite diseñar tablas y consultas baratas y elegir el modelo de cómputo según la carga.

## 4. Cómo funciona

1. **On-demand:** cada consulta paga los bytes que procesa. Rige lo siguiente:
   - no se cobran las consultas con error ni las servidas desde caché;
   - hay redondeo al MB, con mínimo de 10 MB por tabla referenciada y por consulta;
   - cancelar una consulta puede costar hasta su costo completo.

   Como el almacenamiento es columnar, se pagan las columnas leídas de las particiones leídas. `LIMIT` no reduce el costo en tablas no clusterizadas.
2. **Capacidad:** se compran slots mediante **reservas**, en tres ediciones (Standard, Enterprise, Enterprise Plus), con pago por uso y autoscaling. Los compromisos de 1 o 3 años con descuento existen solo en Enterprise y Enterprise Plus; Standard es solo pago por uso. Con reservas de esas dos ediciones, BigQuery ML queda incluido en el uso de las ediciones. Cubre consultas, DML y DDL, pero no el almacenamiento, las inserciones streaming ni la Storage API.
3. **Almacenamiento:**
   - **activo** si la tabla o partición se modificó en los últimos 90 días, **long-term** si no; el cambio es automático;
   - por dataset, **lógico** (sin comprimir, el valor por defecto) o **físico** (comprimido);
   - time travel y fail-safe retienen datos borrados por un tiempo: con facturación lógica no se cobran; con facturación física, sí. Conviene considerarlo al elegir el modelo.
4. **Controles:**
   - dry run para estimar antes de ejecutar;
   - máximo de bytes facturados por consulta: falla sin cargo si la estimación lo supera;
   - cuotas personalizadas por día, por proyecto o por usuario;
   - `INFORMATION_SCHEMA.JOBS` para ver quién consume cuánto.

## 5. Cuándo utilizarlo

Este conocimiento aplica al:

- diseñar tablas (partición, clustering, columnas) y consultas recurrentes;
- elegir entre on-demand y capacidad para un proyecto o carga;
- poner límites a la exploración ad hoc;
- investigar un aumento de costo.

## 6. Cuándo no utilizarlo

- Para presupuestar con montos de esta ficha: no los tiene. Usar la página de precios vigente, por región.
- Para comparar proveedores solo por el precio unitario: cada modelo mide algo distinto (bytes, slots, RPU, CU).

## 7. Ejemplo sencillo

La misma pregunta, "ventas de ayer por país", sobre una tabla de 2 TB particionada por fecha:

- `SELECT * ...` sin filtro de fecha: procesa toda la tabla.
- `SELECT pais, monto ... WHERE fecha = ayer`: procesa dos columnas de una partición.

En on-demand, la diferencia de costo es proporcional a esos bytes. En capacidad, la diferencia está en los slots que ocupa y en lo que deja disponible para otras consultas.

## 8. Ejemplo de producción

Una empresa tiene tres cargas:

- **ETL nocturno**, predecible: corre en una reserva con capacidad.
- **Tableros de BI** que consultan agregados: on-demand, con tablas particionadas y clusterizadas.
- **Exploración de analistas**: on-demand, con máximo de bytes facturados por consulta y una cuota diaria por usuario.

Cada semana, una consulta a `INFORMATION_SCHEMA.JOBS` lista los usuarios y consultas con más bytes facturados. Así se encontró un tablero sin filtro de fecha que explicaba la mitad del gasto. Además, los datasets históricos, muy comprimibles, se pasaron a facturación física tras comparar ambos modelos.

## 9. Arquitectura

```mermaid
flowchart LR
  Q[Consulta] --> DR{Dry run / estimación}
  DR -->|supera máximo de bytes| X[Falla sin cargo]
  DR -->|ok| M{Modelo del proyecto}
  M -->|on-demand| B[Cobro por bytes procesados]
  M -->|capacidad| S[Slots de la reserva]
```

```mermaid
flowchart LR
  T[(Tablas)] --> ST["Almacenamiento: activo / long-term,<br/>lógico / físico"]
  J[INFORMATION_SCHEMA.JOBS] --> R["Revisión de costo<br/>por usuario y consulta"]
```

## 10. Código

```bash
# Estimar y limitar antes de ejecutar (bq, Google Cloud CLI).
# 1. Dry run: informa los bytes que procesaría, sin ejecutar ni cobrar.
bq query --dry_run --use_legacy_sql=false \
  'SELECT pais, SUM(monto) FROM `proyecto.dwh.ventas` WHERE fecha = "2026-10-04" GROUP BY pais'

# 2. Límite de bytes facturados (10 GB): si la estimación lo supera, la consulta falla sin cargo.
bq query --use_legacy_sql=false --maximum_bytes_billed=10000000000 \
  'SELECT pais, SUM(monto) FROM `proyecto.dwh.ventas` WHERE fecha = "2026-10-04" GROUP BY pais'
```

```sql
-- Quién consume cuánto en los últimos 7 días (on-demand: total_bytes_billed).
-- Requiere permiso para ver los jobs del proyecto; ajustar la región de la vista.
SELECT
  user_email,
  COUNT(*) AS consultas,
  ROUND(SUM(total_bytes_billed) / POW(1024, 4), 3) AS tib_facturados,
  COUNTIF(cache_hit) AS desde_cache
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)  -- columna de partición
  AND job_type = 'QUERY'
GROUP BY user_email
ORDER BY tib_facturados DESC;
```

Para pasar a TiB se divide por 1024⁴. El costo se obtiene multiplicando por el precio vigente de la región, que esta ficha no incluye a propósito.

## 11. GCP

En **BigQuery**, la decisión principal es on-demand frente a capacidad, y puede ser distinta por proyecto o carga:

- **On-demand:** no requiere planificar y se paga por bytes, así que el diseño (columnas, particiones, clustering) es directamente costo.
- **Capacidad:** da costo predecible por slots, con editions y reservas (y compromisos en Enterprise y Enterprise Plus); el diseño afecta el tiempo y la concurrencia más que la factura.

El almacenamiento se cobra aparte en ambos casos, con su propio modelo (activo o long-term, lógico o físico).

## 12. AWS

AWS tiene modelos distintos según el servicio:

- **Athena** es serverless y cobra por las consultas que se ejecutan, con la misma lógica que BigQuery on-demand: particiones y formatos columnares bajan el costo.
- **Redshift Serverless** cobra por la capacidad usada, on-demand o con reservas con descuento, y el almacenamiento aparte por GB-mes. Tiene un mínimo de 60 segundos, medido por segundo.
La unidad de medida cambia (bytes procesados frente a capacidad) y no se compara uno a uno.

## 13. Azure

El **serverless SQL pool** de Synapse cobra solo por los datos procesados, sin recursos reservados, como BigQuery on-demand. **Microsoft Fabric** se compra por **capacidad** (SKU medidos en capacity units), y esa capacidad habilita todas las funciones de Fabric licenciadas por capacidad: el modelo se parece más a la capacidad de BigQuery que a on-demand, pero abarca la plataforma y no solo el warehouse.

## 14. Buenas prácticas

- Particionar por fecha, clusterizar por los filtros frecuentes y exigir filtro de partición en tablas grandes.
- Seleccionar solo las columnas necesarias; nunca `SELECT *` en consultas programadas.
- Hacer un dry run de las consultas nuevas y fijar máximo de bytes facturados en exploración.
- Cuotas diarias por usuario en proyectos de análisis ad hoc.
- Separar cargas por proyecto o reserva según su patrón (ETL predecible frente a exploración).
- Evaluar facturación física en datasets muy comprimibles, comparando ambos modelos antes.
- **Seguridad:** las cuotas y límites también acotan el impacto de credenciales mal usadas; dar permisos de ejecución de jobs solo a quien los necesita.
- **Observabilidad:** revisar `INFORMATION_SCHEMA.JOBS` por usuario y por consulta (bytes facturados, aciertos de caché) y alertar ante aumentos respecto de la semana anterior.
- **Costo:** volver a revisar la elección on-demand frente a capacidad cuando cambia el patrón de carga.

## 15. Errores frecuentes

- Creer que `LIMIT` abarata una consulta en una tabla no clusterizada.
- Tableros que refrescan consultas sin filtro de partición.
- Cancelar una consulta cara creyendo que no se cobrará.
- Comprar capacidad sin medir y seguir pagando on-demand en otros proyectos.
- Copiar montos de un documento viejo en lugar de la página de precios vigente.

## 16. Trade-offs

On-demand no requiere planificar y es barato para cargas pequeñas o esporádicas, pero el costo varía con cada consulta. La capacidad da costo predecible y control de concurrencia, a cambio de dimensionar y de pagar capacidad aunque no se use (salvo con autoscaling). La facturación física puede ahorrar en datos comprimibles, pero no conviene en todos los datasets: hay que medir.

## 17. Conceptos relacionados

- `bigquery-partitioning` y `bigquery-clustering`: las palancas de diseño.
- `partition-pruning`: leer menos particiones.
- `row-vs-columnar-formats`: por qué elegir columnas reduce lo facturado.
- Con ficha: `scan-reduction`.
- `bigquery-query-optimization`: el plan, las insights y las prácticas de optimización de BigQuery.

## 18. Preguntas técnicas abiertas

1. ¿Qué datos necesitarías para decidir entre on-demand y capacidad en un proyecto?
2. ¿Cómo encontrarías la consulta que más gasta en el último mes?
3. ¿Por qué un máximo de bytes facturados puede hacer fallar una consulta sobre una tabla clusterizada que en realidad era barata?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Google Cloud: *BigQuery pricing*, *Understand slots*, *Introduction to workload management*, *Introduction to datasets*, *Data definition language statements*, *Estimate and control costs*, *Create custom query quotas*, *bq command-line tool reference* y *JOBS view*.
- AWS: *Billing for Amazon Redshift Serverless* y *What is Amazon Athena?*
- Microsoft Learn: *Serverless SQL pool in Azure Synapse Analytics* y *Microsoft Fabric licenses and capacity*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-05. Pasa a `verified`: revisión B-F3.1 del lote 6 aplicada, sin VERIFY pendientes. Precios y modalidades cambian: revisar con la frecuencia del registro de fuentes.

## 22. Historial de cambios importantes

- 2026-10-05: creación (lote 6 de F3).
- 2026-10-05: revisión B-F3.1 del lote 6 aplicada (docs/reviews/cards-lote6.md): compromisos solo en Enterprise y Enterprise Plus, time travel y fail-safe solo cobrados con facturación física, y BigQuery ML incluido en las reservas de esas ediciones. `verification_status: verified` (sin VERIFY pendientes).
- 2026-10-07: la sección de conceptos relacionados ya no lista como pendiente de ficha a `scan-reduction`, que ya tiene ficha.
- 2026-10-11: «pendiente de ficha» actualizado: la ficha ya existe (lote F3b-08a); el §17 la enlaza y relations la incluye: relations incluye `bigquery-query-optimization`, que el §17 nombra; §17 enlaza las fichas que ya existen.
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
- 2026-10-14: lote F3b-rel (regla del §17): relations incluye `scan-reduction`.
- 2026-10-25: §9 con el estándar de diagramas (máximo 8 nodos, CLAUDE.md): dos diagramas: costo de consulta, y almacenamiento y revisión.

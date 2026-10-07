---
id: concept:query-plans
slug: query-plans
type: concept
title: Planes de ejecución
description: "Leer el plan con que el motor ejecuta una consulta: EXPLAIN y EXPLAIN ANALYZE (PostgreSQL), EXPLAIN y etiquetas de redistribución (Redshift), el plan y la línea de tiempo de cada job (BigQuery) y SHOWPLAN_XML y query insights (Fabric Warehouse); costos estimados frente a filas reales y las señales de un plan malo."
domain: sql
subdomain: sql-performance
category: sql
classification: core
level: intermediate
importance: high
cloud: [gcp, aws, azure, agnostic]
technologies: [gcp-bigquery, aws-redshift, microsoft-fabric, azure-synapse, postgresql]
tags: [sql, performance, query-plans, observability]
related_topics: [partition-pruning, sql-joins, clustering]
sources:
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/current/using-explain.html
    accessed: 2026-10-07
    note: "EXPLAIN muestra el plan con costos estimados: costo de inicio y costo total, en unidades arbitrarias, y filas estimadas por nodo. Con ANALYZE, EXPLAIN ejecuta realmente la consulta y muestra filas y tiempos reales junto a las estimaciones; lo más importante es si las filas estimadas se acercan a las reales. Los tiempos de EXPLAIN ANALYZE no incluyen la transmisión por red y la medición agrega sobrecarga. BUFFERS agrega detalle de E/S."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/r_EXPLAIN.html
    accessed: 2026-10-07
    note: "EXPLAIN muestra el plan de ejecución de una sentencia sin ejecutarla; VERBOSE muestra el plan completo. Admite SELECT, INSERT, CREATE TABLE AS, UPDATE y DELETE."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/c-the-query-plan.html
    accessed: 2026-10-07
    note: "El costo de EXPLAIN es un valor relativo, útil para comparar operaciones dentro de un plan: costo de la primera fila y costo total, acumulado con los nodos hijos. Las filas estimadas se basan en las estadísticas que genera ANALYZE."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/c_data_redistribution.html
    accessed: 2026-10-07
    note: "Etiquetas de movimiento de datos en joins: DS_DIST_NONE y DS_DIST_ALL_NONE son buenas (joins colocalizados, sin redistribución); DS_DIST_INNER redistribuye la tabla interna; DS_BCAST_INNER copia la tabla interna completa a todos los nodos; DS_DIST_BOTH redistribuye ambas tablas."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/query-plan-explanation
    accessed: 2026-10-07
    note: "Cada job de consulta incluye un plan de diagnóstico y su línea de tiempo, similar a EXPLAIN de otros sistemas, disponible por la API (jobs.get) y en la pestaña Execution graph de la consola. El plan es un grafo de etapas (stages) compuestas por pasos (steps) que se ejecutan en paralelo y se comunican mediante shuffle; muestra el slot-time por etapa. En consultas largas, las estadísticas se actualizan periódicamente; los dry runs y los resultados en caché no incluyen este diagnóstico."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/query-insights
    accessed: 2026-10-07
    note: "Las query insights de BigQuery señalan problemas como contención de slots, uso excesivo de shuffle y sesgo de particiones (partition skew), marcados en la etapa correspondiente del grafo de ejecución. JOIN y GROUP BY tienden a usar más shuffle; reducir los datos procesados reduce ese uso."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/best-practices-costs
    accessed: 2026-10-07
    note: "En on-demand, las consultas se facturan por bytes leídos, y un dry run permite estimarlos antes de ejecutar."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-showplan-xml-transact-sql?view=sql-server-ver17
    accessed: 2026-10-07
    note: "Aplica a Azure Synapse Analytics (solo pool SQL dedicado) y Warehouse en Microsoft Fabric, entre otros. Con SET SHOWPLAN_XML ON, las sentencias no se ejecutan: se devuelve un documento XML con el plan, costos estimados, número de filas, operadores, orden de los joins y otros detalles."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/fabric/data-warehouse/query-insights
    accessed: 2026-10-07
    note: "Fabric Data Warehouse ofrece vistas de query insights: queryinsights.exec_requests_history (cada consulta completada), exec_sessions_history, long_running_queries, frequently_run_queries y sql_pool_insights."
relations:
  - type: RELATED_TO
    target: partition-pruning
    note: El plan muestra si la consulta leyó solo las particiones necesarias.
  - type: RELATED_TO
    target: sql-joins
    note: El plan muestra la estrategia y el movimiento de datos de cada join.
  - type: RELATED_TO
    target: clustering
    note: El efecto del clustering se ve en los datos leídos por la etapa de lectura.
created_at: 2026-10-05
updated_at: 2026-10-07
last_verified: 2026-10-07
verification_status: review_required
---

## 1. Resumen

El plan de ejecución es la secuencia de operaciones con que el motor resuelve una consulta: qué lee, en qué orden une, dónde filtra y cuántas filas espera en cada paso. Es la herramienta para responder "¿por qué esta consulta es lenta o cara?" con datos en lugar de intuición.

Cada motor lo expone distinto:

- **antes de ejecutar**, como `EXPLAIN` en PostgreSQL y Redshift o `SHOWPLAN_XML` en T-SQL, con estimaciones;
- **después o durante la ejecución**, como `EXPLAIN ANALYZE` en PostgreSQL o el plan de cada job en BigQuery, con valores reales.

## 2. Qué es

| Motor | Plan estimado (sin ejecutar) | Plan real |
|---|---|---|
| PostgreSQL | `EXPLAIN` | `EXPLAIN ANALYZE` (ejecuta la consulta) |
| Redshift | `EXPLAIN [VERBOSE]` | No detallado en esta ficha |
| BigQuery | — (el *dry run* estima bytes, no da plan) | Plan y línea de tiempo del job: etapas, pasos y slot-time |
| Fabric Warehouse | `SET SHOWPLAN_XML ON` | Vistas `queryinsights.*` |

## 3. Problema que resuelve

Dos consultas que devuelven lo mismo pueden costar órdenes de magnitud distintos. El plan muestra dónde se va el tiempo o los bytes:

- un escaneo completo donde se esperaba poda de particiones;
- un join que redistribuye una tabla grande;
- una estimación de filas muy lejos de la realidad, que lleva al motor a una mala estrategia.

## 4. Cómo funciona

1. **El optimizador elige un plan** según el SQL, las estadísticas de las tablas y la distribución de los datos.
2. **Lectura del plan:** es un árbol (o un grafo de etapas, en BigQuery) que se lee de las hojas, las lecturas, hacia la raíz, el resultado.
3. **Costos:** PostgreSQL y Redshift dan costos relativos, útiles para comparar operaciones dentro de un mismo plan, no entre consultas ni como tiempo real.
4. **Estimado frente a real:** PostgreSQL señala que lo más importante es comparar filas estimadas y reales. Una diferencia grande suele venir de estadísticas desactualizadas; Redshift basa sus estimaciones en `ANALYZE`.
5. **Señales típicas:**
   - lecturas de particiones que deberían haberse podado;
   - `DS_BCAST_INNER` o `DS_DIST_BOTH` en Redshift;
   - etapas con mucho shuffle o sesgo de particiones en BigQuery.

## 5. Cuándo utilizarlo

- Antes de poner en producción una consulta recurrente sobre tablas grandes.
- Cuando una consulta se vuelve lenta o cara sin cambios en el SQL: el volumen o la distribución cambiaron.
- Para confirmar que la poda de particiones, el clustering o una clave de distribución funcionan como se espera.

## 6. Cuándo no utilizarlo

- `EXPLAIN ANALYZE` sobre sentencias que modifican datos en producción: ejecuta la sentencia. En PostgreSQL se puede envolver en una transacción que se revierte.
- Para comparar costos entre motores o entre consultas distintas: los costos son relativos a cada plan.
- Para optimizar consultas que corren una vez y son baratas.

## 7. Ejemplo sencillo

```sql
-- PostgreSQL (ejecutado).
EXPLAIN SELECT count(*) FROM eventos WHERE ocurrido >= '2026-10-05' AND ocurrido < '2026-10-06';
```

El plan muestra que solo se lee la partición de octubre.

## 8. Ejemplo de producción

Un modelo diario en Redshift pasó de 5 a 40 minutos. `EXPLAIN` mostró `DS_BCAST_INNER` en el join con una dimensión que había crecido de miles a millones de filas: el motor copiaba la tabla completa a todos los nodos. Al distribuir la dimensión por la clave del join (ver `join-optimization`), el plan cambió a `DS_DIST_NONE`.

En BigQuery, otro modelo marcó *partition skew* en una etapa del grafo de ejecución: unas pocas claves concentraban la mayoría de las filas del join.

## 9. Arquitectura

```mermaid
flowchart LR
  Q[Consulta SQL] --> O[Optimizador<br/>estadísticas]
  O --> P[Plan estimado<br/>EXPLAIN / SHOWPLAN]
  P --> X[Ejecución]
  X --> R[Plan real<br/>EXPLAIN ANALYZE / plan del job / query insights]
  R -->|estimado ≠ real| S[Actualizar estadísticas,<br/>reescribir, cambiar diseño físico]
```

## 10. Código

```sql
-- PostgreSQL (ejecutado) sobre una tabla particionada por mes.
-- 1) Plan estimado: se lee solo la partición de octubre (poda).
EXPLAIN (COSTS OFF)
SELECT count(*) FROM eventos WHERE ocurrido >= '2026-10-05' AND ocurrido < '2026-10-06';
--  Aggregate
--    ->  Seq Scan on eventos_2026_10 eventos
--          Filter: ((ocurrido >= '2026-10-05'::date) AND (ocurrido < '2026-10-06'::date))

-- 2) Una función sobre la columna de partición impide la poda: se leen ambas particiones.
EXPLAIN (COSTS OFF)
SELECT count(*) FROM eventos WHERE to_char(ocurrido, 'YYYY-MM') = '2026-10';
--  Aggregate
--    ->  Append
--          ->  Seq Scan on eventos_2026_09 eventos_1  (Filter: to_char(...) = '2026-10')
--          ->  Seq Scan on eventos_2026_10 eventos_2  (Filter: to_char(...) = '2026-10')

-- 3) Estimado frente a real: EXPLAIN ANALYZE ejecuta la consulta.
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF)
SELECT count(*) FROM eventos WHERE usuario = 7;
```

La consulta 3 muestra, por cada partición, `rows=` estimado y `actual rows=` reales, además de *Rows Removed by Filter*. En la prueba, las estimaciones fueron del mismo orden que las reales (8 frente a 8 y 4 frente a 4); los números exactos varían con los datos aleatorios de la prueba.

## 11. GCP

**BigQuery** no tiene `EXPLAIN` previo. Cada job de consulta incluye un plan de diagnóstico y su línea de tiempo, comparables a `EXPLAIN` según la documentación, en la pestaña *Execution graph* y por la API (`jobs.get`). Es un grafo de etapas con pasos (`READ`, `COMPUTE`, `FILTER`, `JOIN`, …) unidas por shuffle, con el slot-time de cada etapa. Se actualiza periódicamente en consultas largas.

Los *dry runs* y los resultados en caché no incluyen ese diagnóstico. Las *query insights* marcan contención de slots, exceso de shuffle y sesgo de particiones en la etapa afectada.

## 12. AWS

En **Redshift**, `EXPLAIN` muestra el plan sin ejecutar la consulta. El costo es relativo y las filas estimadas dependen de las estadísticas de `ANALYZE`. En los joins, las etiquetas de redistribución indican el movimiento de datos:

- `DS_DIST_NONE` y `DS_DIST_ALL_NONE` son buenas, porque el join está colocalizado;
- `DS_BCAST_INNER` copia la tabla interna a todos los nodos;
- `DS_DIST_BOTH` redistribuye ambas tablas.

## 13. Azure

En **Fabric Warehouse** y en el pool SQL dedicado de Synapse, `SET SHOWPLAN_XML ON` devuelve el plan estimado en XML sin ejecutar las sentencias: costos, filas, operadores y orden de los joins. Fabric agrega vistas `queryinsights.*` con el historial de consultas, las de larga duración y las frecuentes, para encontrar qué consultas revisar.

## 14. Buenas prácticas

- Mirar primero las hojas del plan: qué se lee y cuánto.
- Comparar filas estimadas y reales; si difieren mucho, actualizar estadísticas antes de reescribir.
- Guardar el plan de las consultas críticas para comparar cuando se vuelvan lentas.
- No usar `EXPLAIN ANALYZE` con sentencias de modificación fuera de una transacción revertida.
- **Seguridad:** los planes y el historial de consultas pueden incluir literales del SQL (por ejemplo, un RUT en un filtro); restringir el acceso a esas vistas.
- **Observabilidad:** revisar periódicamente las consultas más largas y más frecuentes (`queryinsights` en Fabric, historial de jobs en BigQuery) y no solo cuando alguien reclama.
- **Costo:** el plan muestra los bytes o filas leídos por etapa; es el lugar para confirmar que una optimización redujo lo que se paga.

## 15. Errores frecuentes

- Comparar costos de `EXPLAIN` entre consultas distintas como si fueran tiempos.
- Optimizar el SQL cuando el problema son estadísticas desactualizadas.
- Ejecutar `EXPLAIN ANALYZE` de un `DELETE` en producción.
- Buscar un `EXPLAIN` previo en BigQuery: el plan viene con el job; el *dry run* solo estima bytes.

## 16. Trade-offs

El plan estimado es gratis y seguro, pero puede equivocarse si las estadísticas están mal. El plan real es exacto, a cambio de ejecutar la consulta. Ajustar consultas una a una mejora casos puntuales; cambiar el diseño físico (particiones, distribución, clustering) mejora muchas consultas a la vez, a cambio de una migración.

## 17. Conceptos relacionados

- `partition-pruning`: lo primero que hay que confirmar en el plan.
- `sql-joins`: estrategias y movimiento de datos.
- `clustering`: menos datos leídos.
- Del blueprint, en este lote: `scan-reduction`, `predicate-pushdown` y `join-optimization`.

## 18. Preguntas técnicas abiertas

1. ¿Qué consultas de tu pipeline revisarías primero con el plan y por qué?
2. ¿Cómo detectarías que las estadísticas de una tabla quedaron desactualizadas?
3. ¿Qué señal del plan te haría cambiar el diseño físico de una tabla en lugar de la consulta?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- PostgreSQL: *Using EXPLAIN*.
- AWS: *EXPLAIN*, *Query plan* y *Evaluating the query plan* (Amazon Redshift).
- Google Cloud: *Query plan and timeline* y *Query insights* (BigQuery).
- Microsoft Learn: *SET SHOWPLAN_XML (Transact-SQL)* y *Query insights in Fabric Data Warehouse*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-07. En `review_required` hasta la revisión B-F3.1 del lote F3b-02b.

## 22. Historial de cambios importantes

- 2026-10-05: esqueleto creado desde el blueprint (rama `f/sql`).
- 2026-10-07: ficha completa (lote F3b-02b, dominio 02-sql).

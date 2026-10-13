---
id: concept:oltp-vs-olap
slug: oltp-vs-olap
type: concept
title: OLTP vs OLAP
description: "Diferencia entre los sistemas transaccionales (OLTP: muchas escrituras pequeñas, normalizados, ACID) y los analíticos (OLAP: muchas lecturas sobre grandes volúmenes, modelados para análisis, con historia), y cómo se conectan en cada nube."
domain: fundamentals
subdomain: processing-paradigms
category: fundamentals
classification: core
level: basic
importance: high
cloud: [gcp, aws, azure, agnostic]
technologies: [postgresql, gcp-cloud-sql, gcp-bigquery, gcp-datastream, aws-rds, aws-redshift, microsoft-fabric, azure-sql]
tags: [fundamentals, oltp, olap, architecture]
related_topics: [row-vs-columnar-formats, data-warehouse, change-data-capture, normalization, acid]
sources:
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-transaction-processing
    accessed: 2026-10-05
    page_title: "Online transaction processing (OLTP)"
    note: "OLTP registra las interacciones de negocio a medida que ocurren (pagos, pedidos, inventario); las transacciones deben ser atómicas y consistentes. Rasgos típicos: muy normalizado, esquema en escritura, consistencia fuerte con garantías ACID, alta integridad, actualizable, carga de muchas escrituras y lecturas moderadas, índices primarios y secundarios, de MB a pocos TB. La mayoría de las cargas no son puramente OLTP: la mezcla con un componente analítico se llama HTAP."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing
    accessed: 2026-10-05
    page_title: "Online analytical processing"
    note: "OLAP organiza grandes bases de datos de negocio para cálculos complejos y análisis de tendencias sin afectar a los sistemas transaccionales. Las bases OLTP están optimizadas para entradas de registros individuales y no para análisis; las OLAP, para muchas lecturas y pocas escrituras, modeladas y limpias para el análisis, y suelen conservar historia para series de tiempo."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html
    accessed: 2026-10-05
    page_title: "Columnar storage"
    note: "En OLTP la mayoría de las transacciones leen y escriben registros completos, de a uno o pocos, por lo que el almacenamiento por filas es óptimo para OLTP; el columnar reduce la E/S de las consultas analíticas."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/cloud-sql-federated-queries
    accessed: 2026-10-05
    page_title: "Cloud SQL federated queries"
    note: "La federación con Cloud SQL permite que BigQuery consulte en tiempo real datos de Cloud SQL (MySQL y PostgreSQL) sin copiarlos ni moverlos; para replicar datos a BigQuery se puede usar Datastream o Cloud Data Fusion."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/federated_query_functions
    accessed: 2026-10-05
    page_title: "Federated query functions"
    note: "EXTERNAL_QUERY('connection_id', '''consulta''') ejecuta la consulta en la base externa, en su dialecto, y devuelve el resultado como tabla temporal; no respeta el ORDER BY de la consulta externa."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html
    accessed: 2026-10-05
    page_title: "Zero-ETL integrations"
    note: "Zero-ETL integration es una solución administrada que pone datos transaccionales y operacionales a disposición de Redshift desde varias fuentes (entre ellas Aurora, RDS y DynamoDB), sin mantener un pipeline ETL: AWS automatiza la replicación."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/fabric/mirroring/overview
    accessed: 2026-10-05
    page_title: "What is Mirroring in Fabric?"
    note: "Mirroring en Fabric replica en casi tiempo real datos y metadatos de bases operacionales hacia OneLake, con analítica integrada; entre las fuentes están Azure SQL Database, Azure SQL Managed Instance y Azure Database for PostgreSQL."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17
    accessed: 2026-10-05
    page_title: "Columnstore indexes: overview"
    note: "Un índice columnstore no agrupado sobre una tabla rowstore permite analítica operacional en tiempo real: la carga OLTP usa el índice agrupado y la analítica corre a la vez sobre el columnstore."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/current/tutorial-transactions.html
    accessed: 2026-10-05
    page_title: "3.4. Transactions"
    note: "Una transacción agrupa varios pasos en una operación de todo o nada; en PostgreSQL se delimita con BEGIN y COMMIT."
relations:
  - type: RELATED_TO
    target: row-vs-columnar-formats
    note: OLTP guarda por filas; OLAP, por columnas.
  - type: RELATED_TO
    target: data-warehouse
    note: El warehouse es el sistema OLAP de la organización.
  - type: RELATED_TO
    target: change-data-capture
    note: CDC lleva los cambios del OLTP al OLAP sin consultas pesadas sobre el origen.
  - type: RELATED_TO
    target: normalization
    note: OLTP se normaliza para escribir sin anomalías; OLAP se desnormaliza para leer.
  - type: RELATED_TO
    target: acid
    note: OLTP exige transacciones ACID en cada operación de negocio.
created_at: 2026-10-05
updated_at: 2026-10-13
last_verified: 2026-10-05
verification_status: verified
---

## 1. Resumen

**OLTP** (procesamiento de transacciones en línea) son los sistemas que registran el negocio mientras ocurre: un pago, un pedido, un movimiento de inventario. Hacen muchas escrituras pequeñas por clave, en transacciones ACID, sobre modelos normalizados. **OLAP** (procesamiento analítico) son los sistemas donde se analiza: pocas escrituras por lotes, muchas lecturas que agregan millones de filas, modelos desnormalizados y con historia. Ingeniería de datos es, en buena parte, llevar datos del primero al segundo sin dañar ninguno.

## 2. Qué es

Son dos perfiles de carga consolidados en la literatura y en la documentación de los proveedores:

| | OLTP | OLAP |
|---|---|---|
| Operación típica | Insertar o actualizar un registro por clave | Agregar muchas filas por varias dimensiones |
| Carga | Muchas escrituras, lecturas moderadas | Muchas lecturas, pocas escrituras (por lotes) |
| Modelo | Muy normalizado | Desnormalizado (estrella), con historia |
| Consistencia | ACID en cada transacción | Consistencia por carga |
| Almacenamiento | Por filas, índices por clave | Por columnas |
| Ejemplos | PostgreSQL, Cloud SQL, RDS, Azure SQL | BigQuery, Redshift, Fabric Warehouse |

Microsoft llama **HTAP** a las cargas que mezclan ambos perfiles, por ejemplo reportes en tiempo real sobre el sistema operacional.

## 3. Problema que resuelve

Distinguirlos evita dos errores caros. El primero es correr reportes pesados sobre la base operacional, que se degrada y frena las ventas. El segundo es usar un warehouse como base de una aplicación, con escrituras sueltas lentas y sin las garantías transaccionales por operación que la aplicación necesita. Cada perfil optimiza cosas opuestas: el formato en disco, los índices, el modelo y la consistencia.

## 4. Cómo funciona

1. **OLTP:** cada operación de negocio es una transacción corta que toca pocas filas por clave primaria; el modelo normalizado evita duplicar datos y las anomalías al actualizar. El almacenamiento por filas hace eficiente leer y escribir registros completos.
2. **Paso de OLTP a OLAP:** se extraen los datos sin cargar el origen. Las opciones son extracciones incrementales desde una réplica, CDC desde el log de la base, o integraciones administradas que replican (Datastream, zero-ETL de Redshift, mirroring de Fabric).
3. **OLAP:** los datos se integran y modelan para el análisis, en estrella y con historia, y se guardan por columnas. Las consultas leen pocas columnas de muchas filas.
4. **Consulta federada** (opción intermedia): el motor analítico consulta la base operacional en el momento, sin copiar. Es útil para datos pequeños o puntuales, pero la carga recae sobre el origen.

## 5. Cuándo utilizarlo

Este criterio sirve al:

- diseñar dónde vive cada carga (aplicación frente a análisis);
- decidir cómo llevar los datos operacionales al análisis (réplica, CDC, federación);
- revisar un sistema lento: ¿es un reporte OLAP corriendo sobre OLTP?

## 6. Cuándo no utilizarlo

- Como regla absoluta: muchas cargas son mixtas (HTAP), y algunos motores las atienden, como el columnstore no agrupado sobre tablas rowstore en SQL Server.
- Para elegir producto por la etiqueta: lo que importa es el perfil real de lecturas y escrituras.

## 7. Ejemplo sencillo

- **OLTP:** "descontar 2 unidades del SKU A1 y registrar el pedido", una transacción que toca dos filas.
- **OLAP:** "unidades vendidas por categoría y semana en el último año", una consulta que lee millones de filas y dos columnas.

## 8. Ejemplo de producción

Un e-commerce corre su tienda sobre Cloud SQL para PostgreSQL. Los reportes del área comercial empezaron a ralentizar el checkout, porque se consultaban directamente sobre la base de la tienda. Se separaron las cargas:

- Datastream replica los cambios a BigQuery;
- Dataform modela una estrella de ventas;
- los reportes consultan solo BigQuery.

Para una consulta puntual del soporte, que necesita el estado actual de un pedido, se usa una consulta federada a una réplica de lectura, no a la primaria.

## 9. Arquitectura

```mermaid
flowchart LR
  APP[Aplicación] -->|transacciones ACID| OLTP[(OLTP<br/>por filas, normalizado)]
  OLTP -->|CDC / réplica / zero-ETL / mirroring| ING[Ingesta]
  ING --> OLAP[(OLAP<br/>por columnas, estrella, historia)]
  OLAP --> BI[BI y análisis]
  OLAP -. consulta federada puntual .-> OLTP
```

## 10. Código

```sql
-- OLTP (PostgreSQL): una operación de negocio es una transacción corta, por clave.
BEGIN;
UPDATE inventario SET stock = stock - 2 WHERE sku = 'A1';      -- CHECK (stock >= 0) la protege
INSERT INTO pedidos (sku, cantidad) VALUES ('A1', 2);
COMMIT;
```

```sql
-- OLAP (BigQuery): agrega muchas filas por dimensiones, sobre el modelo analítico.
SELECT p.categoria, DATE_TRUNC(f.fecha, WEEK) AS semana, SUM(f.cantidad) AS unidades
FROM `proyecto.mart_comercial.fact_venta_linea` AS f
JOIN `proyecto.mart_comercial.dim_producto` AS p USING (producto_sk)
WHERE f.fecha >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
GROUP BY categoria, semana;

-- Puente puntual (BigQuery → Cloud SQL): consulta federada, sin copiar datos.
-- Requiere una conexión de BigQuery a Cloud SQL (aquí, proyecto.us.tienda); la consulta interna
-- usa el dialecto de PostgreSQL y corre en la base operacional (mejor una réplica de lectura).
SELECT *
FROM EXTERNAL_QUERY('proyecto.us.tienda',
  '''SELECT pedido_id, estado FROM pedidos WHERE creado_en >= now() - interval '1 hour';''');
```

## 11. GCP

En Google Cloud, el OLTP típico es **Cloud SQL** y el OLAP, **BigQuery**. Para conectarlos hay dos caminos:

- **Federación con Cloud SQL** (`EXTERNAL_QUERY`): BigQuery consulta Cloud SQL en el momento, sin copiar. La consulta interna corre en la base operacional, en su dialecto.
- **Replicación:** Datastream o Cloud Data Fusion llevan los datos a BigQuery.

La federación es útil para lo puntual; la replicación, para el análisis recurrente.

## 12. AWS

En AWS, el OLTP típico es **RDS o Aurora** y el OLAP, **Redshift**. Las **zero-ETL integrations** ponen los datos transaccionales a disposición de Redshift sin mantener un pipeline: AWS automatiza la replicación. A diferencia de la federación de BigQuery, aquí los datos sí se copian a Redshift, con la ventaja de no cargar el origen en cada consulta.

## 13. Azure

En Azure, el OLTP típico es **Azure SQL** (o SQL Server). Para analítica, **Fabric mirroring** replica en casi tiempo real datos y metadatos de bases operacionales a OneLake, donde los consultan los motores de Fabric. Además, SQL Server y Azure SQL permiten analítica operacional sobre la propia base con un índice columnstore no agrupado, el caso HTAP.

## 14. Buenas prácticas

- No correr reportes pesados sobre la base primaria de una aplicación: usar réplica, CDC o una integración administrada.
- Modelar el OLAP para leer (estrella, columnar) y el OLTP para escribir (normalizado, índices por clave).
- Federar solo consultas pequeñas y puntuales, y contra réplicas de lectura.
- **Seguridad:** el OLAP concentra datos de muchos sistemas; aplicar en él controles por fila y columna, y no dar a los analistas acceso directo a las bases operacionales.
- **Observabilidad:** medir el retraso de la replicación (OLTP → OLAP) y la carga que la extracción impone al origen.
- **Costo:** replicar evita que cada reporte cargue al OLTP, pero duplica almacenamiento; las consultas federadas no copian, pero se pagan en la base operacional.

## 15. Errores frecuentes

- Un tablero conectado directo a la base de producción "porque es en tiempo real".
- Usar un warehouse como backend de una aplicación con escrituras por registro.
- Copiar el modelo normalizado del OLTP tal cual al OLAP y exigir a los analistas diez joins por consulta.
- Extraer con consultas completas sobre la primaria en horario de negocio.

## 16. Trade-offs

Separar OLTP y OLAP protege a la aplicación y acelera el análisis, a cambio de un pipeline o replicación que hay que operar y de un retraso entre lo que pasa y lo que se ve. La federación evita copiar, pero carga el origen y no escala para análisis recurrentes. HTAP reduce la latencia del análisis, a costa de compartir recursos con la operación.

## 17. Conceptos relacionados

- `row-vs-columnar-formats`: el formato que favorece cada perfil.
- `data-warehouse`: el sistema OLAP.
- `change-data-capture`: el puente de OLTP a OLAP.
- `normalization`: el modelo del OLTP.
- `acid`: las garantías del OLTP.

## 18. Preguntas técnicas abiertas

1. Un reporte "en tiempo real" está frenando la base de la tienda. ¿Qué opciones tienes y qué retraso acepta cada una?
2. ¿Cuándo usarías una consulta federada en vez de replicar?
3. ¿Qué parte de un sistema de pagos es OLTP y cuál OLAP?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn: *Online transaction processing (OLTP)*, *Online analytical processing*, *Mirroring in Microsoft Fabric* y *Columnstore indexes: Overview*.
- AWS: *Columnar storage* y *Zero-ETL integrations* (Amazon Redshift).
- Google Cloud: *Cloud SQL federated queries* y *Federated query functions* (BigQuery).
- PostgreSQL: *Transactions* (tutorial).

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-05. Pasa a `verified`: revisión B-F3.1 del lote 6 aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-05: creación (lote 6 de F3).
- 2026-10-05: revisión B-F3.1 del lote 6 aplicada (docs/reviews/cards-lote6.md), sin cambios pedidos. `verification_status: verified` (sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.

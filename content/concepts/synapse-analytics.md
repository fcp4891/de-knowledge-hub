---
id: concept:synapse-analytics
slug: synapse-analytics
type: concept
title: Azure Synapse Analytics
description: "Qué es Azure Synapse Analytics según su documentación: un servicio de analítica que reúne SQL (pool dedicado y pool serverless), Spark, Data Explorer y pipelines. En el pool dedicado, las filas se reparten en 60 distribuciones por hash o round-robin, y las tablas chicas se replican; el pool serverless consulta el lake con OPENROWSET y cobra por uso. Sus páginas recomiendan empezar con Fabric Data Warehouse a quien es nuevo y ofrecen migración a Fabric; no dicen que Synapse esté deprecado."
domain: azure
subdomain: analytics-platform
category: azure
classification: modern
level: intermediate
importance: medium
cloud: [azure]
technologies: [azure-synapse, azure-adls]
tags: [synapse, data-warehouse, mpp, distribution, serverless-sql]
related_topics: [azure-analytics-landscape]
sources:
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/overview-what-is
    accessed: 2026-10-13
    page_title: "What is Azure Synapse Analytics?"
    note: "What is Azure Synapse Analytics?: servicio de analítica empresarial que reúne SQL para data warehousing, Spark para big data, Data Explorer para logs y series de tiempo, y Pipelines para integración y ETL/ELT. Synapse SQL es un sistema de consulta distribuido para T-SQL, con modelos de recursos serverless y dedicado."
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/sql-data-warehouse-tables-distribute
    accessed: 2026-10-13
    page_title: "Guidance for designing distributed tables using dedicated SQL pool in Azure Synapse Analytics"
    note: "Guidance for designing distributed tables using dedicated SQL pool in Azure Synapse Analytics: una tabla distribuida se ve como una sola, pero sus filas están en 60 distribuciones, repartidas por hash o round-robin; hash mejora las consultas sobre tablas de hechos grandes y round-robin la velocidad de carga. Tip de la página: «Microsoft Fabric Data Warehouse is an enterprise scale relational warehouse on a data lake foundation… If you're new to data warehousing, start with Fabric Data Warehouse. Existing dedicated SQL pool workloads can upgrade to Fabric»."
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/sql-data-warehouse/design-guidance-for-replicated-tables
    accessed: 2026-10-13
    page_title: "Design guidance for using replicated tables in Synapse SQL pool"
    note: "Design guidance for using replicated tables in Synapse SQL pool: una tabla replicada tiene una copia completa accesible en cada nodo de cómputo, lo que evita mover datos antes de un join; funcionan mejor con menos de 2 GB comprimidos (no es un límite estricto)."
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/sql/on-demand-workspace-overview
    accessed: 2026-10-13
    page_title: "Serverless SQL pool in Azure Synapse Analytics"
    note: "Serverless SQL pool in Azure Synapse Analytics: cada workspace trae un endpoint serverless para consultar datos del lake (Parquet, Delta Lake, texto delimitado), Cosmos DB o Dataverse, con un modelo de pago por uso. Trae el mismo Tip que recomienda Fabric Data Warehouse a quien es nuevo."
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/sql/develop-openrowset
    accessed: 2026-10-13
    page_title: "How to use OPENROWSET using serverless SQL pool in Azure Synapse Analytics"
    note: "How to use OPENROWSET using serverless SQL pool in Azure Synapse Analytics: OPENROWSET(BULK...) lee archivos de Azure Storage y devuelve filas; se usa en el FROM como si fuera una tabla."
  - source: azure-synapse-docs
    url: https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview
    accessed: 2026-10-13
    page_title: "What is Apache Spark in Azure Synapse Analytics?"
    note: "What is Apache Spark in Azure Synapse Analytics?: implementación de Spark de Microsoft dentro de Synapse."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/data-warehouse/migration-synapse-dedicated-sql-pool-planning
    accessed: 2026-10-13
    page_title: "Migration planning: Azure Synapse Analytics dedicated SQL pools to Fabric Data Warehouse"
    note: "Migration planning: Azure Synapse Analytics dedicated SQL pools to Fabric Data Warehouse: estrategias y consideraciones para migrar de los pools dedicados de Synapse a Fabric Data Warehouse, con un asistente de migración automatizado."
  - source: azure-synapse-docs
    url: https://azure.microsoft.com/en-us/pricing/details/synapse-analytics/
    accessed: 2026-10-13
    page_title: "Azure Synapse Analytics pricing"
    note: "Azure Synapse Analytics pricing: precios del pool dedicado por capacidad, del serverless por datos procesados, de Spark y de pipelines. Los montos no se copian."
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html
    accessed: 2026-10-10
    page_title: "Distribution styles"
    note: "Estilos de distribución de Redshift: AUTO, EVEN, KEY o ALL; si no se especifica, usa AUTO, que asigna el estilo según el tamaño de la tabla (por ejemplo, ALL para tablas pequeñas y, al crecer, KEY u otro). Puede convenir definir dimensiones pequeñas como DISTSTYLE ALL."
  - source: aws-athena-docs
    url: https://docs.aws.amazon.com/athena/latest/ug/what-is.html
    accessed: 2026-10-12
    page_title: "What is Amazon Athena?"
    note: "What is Amazon Athena?: servicio de consultas interactivas para analizar datos directamente en Amazon S3 con SQL estándar, sin infraestructura; también ejecuta aplicaciones de Apache Spark sin planificar ni administrar recursos."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/storage_overview
    accessed: 2026-10-11
    page_title: "Overview of BigQuery storage"
    note: "Overview of BigQuery storage: la separación de almacenamiento y cómputo permite escalarlos de forma independiente. Al ejecutar una consulta, el motor reparte el trabajo en paralelo entre workers, que leen las tablas, procesan la consulta y reúnen los resultados; ejecuta en memoria y usa una red petabit. Almacenamiento administrado (sin aprovisionar; se paga lo usado; cómputo y almacenamiento se facturan por separado), durable (diseñado para 99.999999999 % de durabilidad anual, réplicas en varias zonas), cifrado antes de escribir a disco (con clave de Google o propia) y con codificación eficiente (Capacitor, formato columnar). Tipos: tablas estándar, clones (solo guardan el delta), snapshots (copias de solo lectura a un punto del tiempo), vistas materializadas, resultados en caché (tablas temporales sin costo) y tablas externas (solo los metadatos en BigQuery). Los datasets son contenedores lógicos que afectan permisos, cuotas y facturación. BigQuery guarda los datos en formato columnar, cada columna por separado: lee solo las columnas que usa la consulta y comprime mejor (por ejemplo, run-length encoding). Facturación lógica (sin comprimir, por defecto) o física (comprimida), configurada por dataset; el cambio de modelo no mueve datos. Time travel y fail-safe."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/external-tables
    accessed: 2026-10-11
    page_title: "Introduction to external tables"
    note: "Introduction to external tables: BigQuery no garantiza consistencia si los datos cambian mientras corre la consulta; el rendimiento puede ser menor que con una tabla estándar y depende del almacenamiento (Cloud Storage es más rápido que Google Drive); si la velocidad importa, cargar los datos en BigQuery. Son de solo lectura (sin DML); no se exportan, no se copian, no se usan en consultas con comodines; sin clustering y con particionado limitado (datos particionados externamente). Las consultas a fuentes externas que no son Cloud Storage no se cachean; se cobra cada consulta aunque se repita: para consultas repetidas sobre datos que cambian poco, escribir el resultado en una tabla permanente. Hasta 16 consultas concurrentes contra una tabla externa de Bigtable."
relations:
  - type: RELATED_TO
    target: data-warehouse
    note: El pool dedicado es un warehouse MPP.
  - type: RELATED_TO
    target: redshift-architecture
    note: Redshift también distribuye filas por clave, con otro modelo.
  - type: RELATED_TO
    target: bigquery-architecture
    note: BigQuery no tiene distribuciones que elegir.
  - type: RELATED_TO
    target: athena-serverless-queries
    note: Consultar el lake sin cargarlo, como el pool serverless.
  - type: RELATED_TO
    target: azure-analytics-landscape
    note: Synapse frente a Fabric, Data Factory y Databricks.
  - type: RELATED_TO
    target: adls-gen2-storage
    note: El pool serverless lee el lake en ADLS.
created_at: 2026-10-13
updated_at: 2026-10-13
last_verified: 2026-10-13
verification_status: review_required
---

## 1. Resumen

**Azure Synapse Analytics** reúne en un workspace, según su documentación:

- **Synapse SQL**, con un **pool dedicado** (warehouse MPP con capacidad reservada) y un **pool serverless** (consultas sobre el lake, pago por uso);
- **Spark**, **Data Explorer** y **pipelines**.

En el pool dedicado, cada tabla se reparte en **60 distribuciones**: por **hash** de una columna (para hechos grandes), **round-robin** (carga rápida) o **replicada** (tablas chicas, una copia en cada nodo).

Sobre Synapse y Fabric, las páginas de Synapse traen un aviso: «If you're new to data warehousing, start with Fabric Data Warehouse. Existing dedicated SQL pool workloads can upgrade to Fabric». Microsoft publica además una guía de migración a Fabric Data Warehouse. Ninguna de las páginas citadas dice que Synapse esté deprecado.

## 2. Qué es

- **Workspace de Synapse:** agrupa SQL, Spark, Data Explorer y pipelines.
- **Pool SQL dedicado:**
  - 60 distribuciones por tabla;
  - **hash**: filas con el mismo valor en la misma distribución; mejora consultas sobre hechos grandes;
  - **round-robin**: reparto parejo; mejora la carga;
  - **replicada**: copia completa en cada nodo de cómputo; evita mover datos en los joins; mejor con menos de 2 GB comprimidos.
- **Pool SQL serverless:** un endpoint por workspace que consulta Parquet, Delta Lake y texto delimitado del lake con `OPENROWSET(BULK ...)`, con pago por uso.
- **Spark en Synapse:** Spark administrado dentro del workspace.

## 3. Problema que resuelve

Tener un warehouse MPP y consultas sobre el lake en un mismo lugar, con T-SQL, junto a Spark y pipelines. El pool serverless explora el lake sin cargar datos; el dedicado da rendimiento estable para tableros y modelos.

## 4. Cómo funciona

1. El lake vive en ADLS Gen2.
2. El pool serverless consulta los archivos con `OPENROWSET`; filtrar por carpeta (por ejemplo, el mes) limita lo que se lee.
3. Las tablas de hechos se cargan al pool dedicado con distribución por hash en la clave del join más frecuente.
4. Las dimensiones chicas se replican en cada nodo.
5. Un join entre el hecho y una dimensión replicada no mueve datos entre nodos.

## 5. Cuándo utilizarlo

- Cargas existentes en pools dedicados de Synapse.
- Consultas ad hoc con T-SQL sobre el lake (pool serverless).
- Equipos que necesitan SQL, Spark y pipelines en un mismo workspace.

## 6. Cuándo no utilizarlo

- Un warehouse nuevo: las páginas de Synapse recomiendan empezar con Fabric Data Warehouse.
- Tablas de cientos de GB replicadas: la guía sugiere replicar por debajo de 2 GB comprimidos.
- Distribuir por hash con una columna de pocos valores, que concentra filas en pocas distribuciones.

## 7. Ejemplo sencillo

`fact_ventas` se distribuye por hash en `id_tienda` y `dim_tienda` se replica. La suma de ventas por región hace el join en cada nodo sin mover filas, porque cada nodo tiene la dimensión completa.

## 8. Ejemplo de producción

Un warehouse en un pool dedicado:

- hechos de ventas por hash en `id_tienda`, con columnstore;
- dimensiones de menos de 2 GB replicadas;
- un pool serverless para que los analistas exploren `curated/` antes de pedir una tabla nueva.

El equipo evalúa la migración a Fabric Data Warehouse con la guía y el asistente de Microsoft.

## 9. Arquitectura

```mermaid
flowchart LR
  L["ADLS lake/curated/"] -- "OPENROWSET" --> SL["Pool SQL serverless"]
  L -- "carga" --> D["Pool SQL dedicado<br/>60 distribuciones"]
  D --> H["fact_ventas<br/>HASH(id_tienda)"]
  D --> R["dim_tienda<br/>REPLICATE"]
  D --> BI["Tableros"]
```

## 10. Código

```sql
-- T-SQL de Azure Synapse (no ejecutado: no hay Synapse en local ni en la CI).
-- Pool SQL dedicado: hecho distribuido por hash en la clave del join más frecuente, dimensión chica replicada.
CREATE TABLE dbo.fact_ventas
(
    id_venta   bigint        NOT NULL,
    id_tienda  int           NOT NULL,
    fecha      date          NOT NULL,
    monto      decimal(12,2) NOT NULL
)
WITH
(
    DISTRIBUTION = HASH(id_tienda),
    CLUSTERED COLUMNSTORE INDEX
);

CREATE TABLE dbo.dim_tienda
(
    id_tienda int         NOT NULL,
    region    varchar(32) NOT NULL
)
WITH
(
    DISTRIBUTION = REPLICATE,
    CLUSTERED INDEX (id_tienda)
);

-- Pool SQL serverless: leer Parquet del lake sin cargarlo; el filtro por carpeta limita lo que se lee.
SELECT id_tienda, SUM(monto) AS total
FROM OPENROWSET(
    BULK 'https://dekhlakeprod.dfs.core.windows.net/lake/curated/ventas/dt=2026-10-*/*.parquet',
    FORMAT = 'PARQUET'
) AS ventas
GROUP BY id_tienda;
```

**No ejecutado:** el T-SQL de Synapse no se corrió (no hay Synapse en local ni en la CI; ADR-013). La sintaxis de distribución sigue las guías de tablas distribuidas y replicadas, y la de `OPENROWSET`, la página del pool serverless. Los nombres y la ruta son ilustrativos.

## 11. GCP

No aplica de forma específica: esta ficha describe Synapse. El warehouse de GCP es BigQuery (ver `bigquery-architecture`). Las diferencias, según sus páginas:

| | Synapse | BigQuery |
|---|---|---|
| Distribución física | Se elige por tabla: hash, round-robin o replicada, sobre 60 distribuciones | No hay distribución que elegir: el motor reparte el trabajo entre workers |
| Consultar el lake sin cargar | Pool serverless con `OPENROWSET` | Tablas externas |
| Capacidad | Pool dedicado reservado o serverless por uso | Ver `bigquery-slots` |

## 12. AWS

No aplica de forma específica. Lo más cercano es Redshift para el warehouse (ver `redshift-architecture`) y Athena para el lake (ver `athena-serverless-queries`). Las diferencias, según sus páginas:

| | Synapse | Redshift / Athena |
|---|---|---|
| Distribución | Hash, round-robin o replicada sobre 60 distribuciones | Redshift: AUTO, EVEN, KEY o ALL |
| Tablas chicas copiadas a todos los nodos | `REPLICATE` | Redshift: `DISTSTYLE ALL` |
| Consultar el lake | Pool serverless con `OPENROWSET` | Athena, con SQL directamente sobre S3 |

## 13. Azure

**Azure Synapse Analytics.** Los pools dedicado y serverless, las distribuciones, las tablas replicadas, `OPENROWSET` y Spark son los de sus páginas. La relación con Fabric es la que dicen sus propias páginas (el aviso que recomienda Fabric Data Warehouse para empezar) y la guía de migración. Los precios se consultan en la página de precios.

## 14. Buenas prácticas

- Hash por la columna del join más frecuente, con muchos valores distintos.
- Replicar solo dimensiones chicas.
- Pool serverless para explorar; dedicado para cargas estables.
- Para proyectos nuevos, evaluar Fabric Data Warehouse, como recomiendan las páginas de Synapse.
- **Seguridad:** identidades administradas para leer el lake y permisos por esquema en el pool.
- **Observabilidad:** seguir el movimiento de datos en los planes y la distribución de filas por distribución (sesgo).
- **Costo:** el pool dedicado se paga por capacidad mientras está encendido; el serverless, por datos procesados. Los montos se consultan en la página de precios.

## 15. Errores frecuentes

- Distribuir un hecho por una columna con sesgo y concentrar filas.
- Replicar tablas grandes.
- Dejar el pool dedicado encendido sin uso.
- Afirmar que Synapse está deprecado sin que Microsoft lo diga.

## 16. Trade-offs

El pool dedicado da control sobre la distribución y rendimiento estable, a cambio de diseñar tablas y pagar capacidad reservada. El serverless no tiene nada que administrar y cobra por uso, con menos rendimiento para cargas repetidas. Fabric Data Warehouse es lo que Microsoft recomienda para empezar, con su propio modelo.

## 17. Conceptos relacionados

- `data-warehouse`: el tipo de sistema.
- `redshift-architecture` y `bigquery-architecture`: los warehouses de AWS y GCP.
- `athena-serverless-queries`: consultar el lake sin cargarlo, en AWS.
- `azure-analytics-landscape`: Synapse frente a Fabric, Data Factory y Databricks.
- `adls-gen2-storage`: el lake que lee el pool serverless.

## 18. Preguntas técnicas abiertas

1. ¿Por qué columna distribuirías tu hecho más grande?
2. ¿Qué tablas replicarías, y cuánto pesan comprimidas?
3. ¿Qué te haría migrar de un pool dedicado a Fabric Data Warehouse?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn, Azure Synapse Analytics: *What is Azure Synapse Analytics?*, *Guidance for designing distributed tables using dedicated SQL pool in Azure Synapse Analytics*, *Design guidance for using replicated tables in Synapse SQL pool*, *Serverless SQL pool in Azure Synapse Analytics*, *How to use OPENROWSET using serverless SQL pool in Azure Synapse Analytics* y *What is Apache Spark in Azure Synapse Analytics?*; *Azure Synapse Analytics pricing*.
- Microsoft Learn, Microsoft Fabric: *Migration planning: Azure Synapse Analytics dedicated SQL pools to Fabric Data Warehouse*.
- AWS: *Distribution styles* (Redshift) y *What is Amazon Athena?*. Google Cloud, BigQuery: *Overview of BigQuery storage* e *Introduction to external tables*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-13. `review_required`: pendiente de revisión B-F3.1 del lote F3b-10a.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10a).

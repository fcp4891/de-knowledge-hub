---
id: concept:fabric-onelake-and-workloads
slug: fabric-onelake-and-workloads
type: concept
title: OneLake y cargas de trabajo en Microsoft Fabric
description: "Qué es Microsoft Fabric según su documentación: plataforma de analítica SaaS con experiencias (Data Engineering, Data Factory, Data Warehouse, Real-Time Intelligence y otras) sobre cómputo y almacenamiento compartidos. OneLake es el lake único del tenant, sobre ADLS, con tablas Delta Parquet o Iceberg; los shortcuts leen datos de Azure, AWS y otros sin copiarlos; se accede con las API de ADLS y Blob. La capacidad se compra en SKU F."
domain: azure
subdomain: analytics-platform
category: azure
classification: modern
level: intermediate
importance: high
cloud: [azure]
technologies: [microsoft-fabric, azure-adls, python]
tags: [fabric, onelake, lakehouse, shortcuts, delta-lake]
related_topics: [lakehouse, azure-analytics-landscape]
sources:
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview
    accessed: 2026-10-13
    page_title: "What is Microsoft Fabric?"
    note: "What is Microsoft Fabric?: plataforma de analítica de punta a punta (ingesta, transformación, stream en tiempo real, analítica y reportes), con experiencias integradas como Data Engineering, Data Factory, Data Science, Real-Time Intelligence, Data Warehouse y Databases que operan sobre un modelo compartido de cómputo y almacenamiento; se entrega como SaaS y usa OneLake como lake lógico centralizado. OneLake Catalog centraliza el descubrimiento y el gobierno; Microsoft Purview aporta protección de información, DLP y auditoría para datos de Fabric admitidos."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview
    accessed: 2026-10-13
    page_title: "What is OneLake?"
    note: "What is OneLake?: lake unificado para toda la organización; cada tenant de Fabric incluye OneLake; construido sobre Azure Data Lake Storage; guarda las tablas en Delta Parquet o Iceberg, formatos abiertos; una copia de los datos para varios motores; API de ADLS Gen2."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts
    accessed: 2026-10-13
    page_title: "OneLake shortcuts"
    note: "OneLake shortcuts: unifican datos entre dominios, nubes y cuentas haciendo de OneLake un lake virtual único; las experiencias y motores de Fabric se conectan a fuentes existentes, incluidas Azure, Amazon Web Services y OneLake, por un namespace unificado; OneLake administra permisos y credenciales."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/onelake/onelake-access-api
    accessed: 2026-10-13
    page_title: "Connecting to Microsoft OneLake"
    note: "Connecting to Microsoft OneLake: acceso a los ítems de Fabric con las API y SDK existentes de ADLS y Blob, usando una URI de OneLake (https://onelake.dfs.fabric.microsoft.com/<workspace>/<item>.<itemtype>/<path>/<fileName>); por ser SaaS, algunas operaciones (permisos, actualizar ítems) se hacen solo desde Fabric."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/fundamentals/delta-lake-interoperability
    accessed: 2026-10-13
    page_title: "Delta Lake table format interoperability"
    note: "Delta Lake table format interoperability: Delta Lake es el formato estándar para analítica, con transacciones ACID; todas las experiencias de Fabric generan y consumen tablas Delta, y una tabla producida por un motor (por ejemplo, Fabric Data Warehouse o Spark) la consume otro (por ejemplo, Power BI)."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview
    accessed: 2026-10-13
    page_title: "What is a lakehouse in Microsoft Fabric?"
    note: "What is a lakehouse in Microsoft Fabric?: ítem de Fabric que combina archivos y tablas en OneLake, con un endpoint SQL de solo lectura sobre sus tablas Delta."
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/enterprise/licenses
    accessed: 2026-10-13
    page_title: "Understand Microsoft Fabric licenses and capacity"
    note: "Understand Microsoft Fabric licenses and capacity: un despliegue tiene tenants, capacidades, workspaces y licencias por usuario; las capacidades se compran por SKU F (de F2 a F2048 y más), medidas en Capacity Units (CU)."
  - source: microsoft-fabric-docs
    url: https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/
    accessed: 2026-10-13
    page_title: "Microsoft Fabric pricing"
    note: "Microsoft Fabric pricing: precios de capacidad por SKU (pago por uso o reserva) y del almacenamiento de OneLake. Los montos no se copian."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/biglake-iceberg-tables-in-bigquery
    accessed: 2026-10-11
    page_title: "Apache Iceberg managed tables"
    note: "Apache Iceberg managed tables: «Apache Iceberg managed tables (formerly BigLake tables for Apache Iceberg in BigQuery)». Base para lakehouses de formato abierto en Google Cloud: la misma experiencia administrada que las tablas estándar, pero con los datos en buckets del cliente, en formato Iceberg, para interoperar con motores open source y de terceros sobre una sola copia. Admiten DML, streaming con la Storage Write API, exportación de snapshots Iceberg V2 para otros motores, evolución de esquema, optimización automática del almacenamiento, time travel, seguridad por columna y enmascaramiento, transacciones de varias sentencias y particionado."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/biglake-intro
    accessed: 2026-10-11
    page_title: "Introduction to BigLake tables"
    note: "Introduction to BigLake tables: consultan datos estructurados en almacenes externos con delegación de acceso, que separa el acceso a la tabla del acceso al almacén: una conexión externa asociada a una cuenta de servicio se conecta al almacén, y a los usuarios solo se les da acceso a la tabla. Permite seguridad fina a nivel de tabla, incluida por fila y por columna, y enmascaramiento dinámico en tablas sobre Cloud Storage. Almacenes: Cloud Storage, y Amazon S3 y Blob Storage vía BigQuery Omni (estas dos, solo permanentes). Se puede crear una tabla sobre varias fuentes con el mismo esquema y actualizar una tabla externa a BigLake. Caché de metadatos (nombres de archivo, particiones, metadatos físicos como cantidad de filas) opcional por tabla, mantenida por trabajos de refresco; con caché, los cambios en los archivos no se ven hasta el siguiente refresco. No se usa caché de metadatos con tablas externas de Iceberg: BigQuery ya usa los metadatos de los manifiestos de Iceberg."
  - source: aws-s3-docs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables.html
    accessed: 2026-10-12
    page_title: "Working with Amazon S3 Tables and table buckets"
    note: "Working with Amazon S3 Tables and table buckets: almacenamiento optimizado para analítica, con tablas en formato Apache Iceberg y mantenimiento automático (compactación, gestión de snapshots y borrado de archivos sin referencia)."
  - source: aws-athena-docs
    url: https://docs.aws.amazon.com/athena/latest/ug/what-is.html
    accessed: 2026-10-12
    page_title: "What is Amazon Athena?"
    note: "What is Amazon Athena?: servicio de consultas interactivas para analizar datos directamente en Amazon S3 con SQL estándar, sin infraestructura; también ejecuta aplicaciones de Apache Spark sin planificar ni administrar recursos."
relations:
  - type: RELATED_TO
    target: lakehouse
    note: OneLake con tablas Delta o Iceberg es un lakehouse.
  - type: RELATED_TO
    target: adls-gen2-storage
    note: OneLake está construido sobre ADLS y acepta sus API.
  - type: RELATED_TO
    target: bigquery-biglake-tables
    note: Iceberg y tablas sobre almacenamiento externo en GCP.
  - type: RELATED_TO
    target: s3-data-lake
    note: S3 Tables guarda tablas Iceberg en AWS.
  - type: RELATED_TO
    target: azure-analytics-landscape
    note: Fabric frente a Data Factory, Synapse y Databricks.
  - type: RELATED_TO
    target: data-factory-pipelines
    note: Data Factory en Fabric es la siguiente generación de ADF, según Microsoft.
  - type: RELATED_TO
    target: synapse-analytics
    note: Las páginas de Synapse recomiendan empezar con Fabric Data Warehouse.
created_at: 2026-10-13
updated_at: 2026-10-13
last_verified: 2026-10-13
verification_status: review_required
---

## 1. Resumen

**Microsoft Fabric** es una plataforma de analítica SaaS. Según su documentación, reúne experiencias (**Data Engineering**, **Data Factory**, **Data Science**, **Real-Time Intelligence**, **Data Warehouse** y **Databases**) que operan sobre un modelo compartido de cómputo y almacenamiento.

El almacenamiento es **OneLake**:

- un lake **único por tenant**, construido sobre ADLS;
- con las tablas en **Delta Parquet o Iceberg**, formatos abiertos que todas las experiencias leen y escriben;
- con **shortcuts**, que muestran datos de Azure, AWS u otros orígenes dentro de OneLake sin copiarlos.

Se accede con las **API y SDK de ADLS y Blob**, usando una URI de OneLake. El cómputo se compra como **capacidad** (SKU F, en Capacity Units) y la comparten todas las experiencias.

## 2. Qué es

- **Tenant, capacidad, workspace e ítem:** el tenant tiene uno o más capacidades; los workspaces usan una capacidad; los ítems (lakehouse, warehouse, pipeline, notebook) viven en un workspace.
- **OneLake:** un solo lake lógico por tenant. URI: `https://onelake.dfs.fabric.microsoft.com/<workspace>/<item>.<itemtype>/<path>`.
- **Formato de tablas:** Delta Lake es el estándar de Fabric; una tabla escrita por un motor la lee otro (por ejemplo, Spark escribe y Power BI lee). OneLake también guarda tablas Iceberg.
- **Shortcuts:** referencias a datos en Azure, AWS u otros orígenes, con permisos y credenciales administrados por OneLake.
- **Lakehouse:** archivos y tablas en OneLake, con un endpoint SQL de solo lectura sobre las tablas Delta.
- **Capacidad:** SKU F, de F2 en adelante, medidas en Capacity Units.
- **Gobierno:** OneLake Catalog para descubrir y gobernar; Microsoft Purview para protección de información, DLP y auditoría de datos de Fabric admitidos.

## 3. Problema que resuelve

Evitar un lake por equipo y copias de los mismos datos para cada motor. En OneLake, una tabla Delta escrita por Spark la leen el warehouse y Power BI sin copiarla, y los datos que viven en otra nube se ven por shortcuts.

## 4. Cómo funciona

1. La organización compra una capacidad F y crea workspaces por dominio.
2. Un pipeline de Data Factory en Fabric carga los archivos al lakehouse (`Files/`).
3. Un notebook de Spark los transforma y escribe tablas Delta (`Tables/`).
4. El warehouse, el endpoint SQL y Power BI leen esas tablas sin copiarlas.
5. Un shortcut muestra un bucket de S3 dentro del lakehouse, para leerlo sin moverlo.

## 5. Cuándo utilizarlo

- Plataformas nuevas en Azure que quieren un lake, un warehouse y reportes sobre el mismo almacenamiento.
- Equipos de Power BI que quieren datos en Delta sin copias.
- Leer datos de otras nubes sin moverlos (shortcuts).

## 6. Cuándo no utilizarlo

- Equipos que necesitan administrar el almacenamiento a nivel de cuenta (redundancia, red, claves) como en ADLS: Fabric es SaaS y algunas operaciones solo se hacen desde Fabric.
- Cargas que no comparten bien una capacidad con otras experiencias.
- Pensar que OneLake reemplaza el gobierno: los permisos se definen en Fabric.

## 7. Ejemplo sencillo

Un notebook escribe la tabla Delta `ventas` en el lakehouse `Lakehouse_ventas`. El warehouse del mismo workspace la consulta por SQL y un reporte de Power BI la lee, sin ninguna copia.

## 8. Ejemplo de producción

Una empresa tiene una capacidad F64 y workspaces `Ventas`, `Finanzas` y `Compartido`:

- cada dominio escribe sus tablas Delta en su lakehouse;
- `Compartido` tiene shortcuts a las tablas curadas de cada dominio, sin copias;
- un shortcut a S3 trae los datos de un sistema que vive en AWS;
- Purview aplica etiquetas de sensibilidad a los datos admitidos.

## 9. Arquitectura

```mermaid
flowchart LR
  DF["Data Factory en Fabric"] --> F["Lakehouse Files/"]
  F --> NB["Notebook Spark"]
  NB --> T["Lakehouse Tables/<br/>Delta"]
  T --> WH["Warehouse / endpoint SQL"]
  T --> PBI["Power BI"]
  S3["Bucket de S3"] -. "shortcut" .-> T
  subgraph OL["OneLake (un lake por tenant)"]
    F
    T
  end
```

## 10. Código

```python
# Python 3.12 y azure-storage-file-datalake (no ejecutado: requiere un tenant de Fabric; Azurite no emula OneLake).
# OneLake acepta las API y SDK de ADLS y Blob con una URI de OneLake: workspace / item.tipo / ruta.
from azure.identity import DefaultAzureCredential
from azure.storage.filedatalake import DataLakeServiceClient

onelake = DataLakeServiceClient("https://onelake.dfs.fabric.microsoft.com", credential=DefaultAzureCredential())
workspace = onelake.get_file_system_client("Ventas")  # el workspace hace de sistema de archivos
archivo = workspace.get_file_client("Lakehouse_ventas.lakehouse/Files/raw/ventas/dt=2026-10-01/part-0000.jsonl")
archivo.upload_data(b'{"id": 1, "monto": 120}\n', overwrite=True)
```

El script en Python 3.12 con `azure-storage-file-datalake` **no se ejecutó**: necesita un tenant de Fabric, y Azurite no emula OneLake (ADR-013). Usa el SDK de ADLS con la URI de OneLake, como describe *Connecting to Microsoft OneLake*: el workspace es el sistema de archivos y la ruta incluye el ítem con su tipo (`.lakehouse`).

## 11. GCP

No aplica de forma específica: esta ficha describe Fabric. Lo más cercano en GCP es BigQuery con tablas Iceberg administradas y tablas BigLake (ver `bigquery-biglake-tables`). Las diferencias, según sus páginas:

| | Fabric / OneLake | BigQuery / BigLake |
|---|---|---|
| Unidad de almacenamiento | Un OneLake por tenant, sobre ADLS | Datasets de BigQuery y buckets de Cloud Storage |
| Tablas abiertas | Delta Parquet (estándar de Fabric) o Iceberg | Apache Iceberg managed tables (antes BigLake tables for Apache Iceberg in BigQuery) |
| Datos externos sin copiar | Shortcuts a Azure, AWS y otros orígenes | Tablas BigLake sobre almacenes externos, con delegación de acceso |

## 12. AWS

No aplica de forma específica. Lo más cercano es S3 con S3 Tables y Athena (ver `s3-data-lake` y `athena-serverless-queries`). Las diferencias, según sus páginas:

| | Fabric / OneLake | S3 / S3 Tables / Athena |
|---|---|---|
| Modelo | SaaS: capacidad compartida por todas las experiencias | Servicios separados: almacenamiento, catálogo y motores |
| Tablas abiertas | Delta Parquet o Iceberg | S3 Tables guarda tablas Iceberg con mantenimiento automático |
| Leer otra nube | Shortcuts, por ejemplo a S3 | Las páginas citadas no lo tratan |

## 13. Azure

**Microsoft Fabric y OneLake.** Las experiencias, OneLake, los shortcuts, el acceso con las API de ADLS, Delta Lake, el lakehouse y las capacidades son los de sus páginas. Los precios de capacidad y almacenamiento se consultan en la página de precios.

## 14. Buenas prácticas

- Un workspace por dominio, con su capacidad elegida según la carga.
- Tablas en Delta y escritas por un solo dueño; los demás leen.
- Shortcuts en lugar de copias para compartir entre dominios o traer otras nubes.
- Revisar qué operaciones solo se hacen desde Fabric antes de automatizar con las API de ADLS.
- **Seguridad:** permisos por workspace e ítem en Fabric; Purview para etiquetas y DLP en los datos admitidos.
- **Observabilidad:** seguir el uso de la capacidad por experiencia; una carga que la satura afecta a las demás.
- **Costo:** se paga la capacidad (SKU F, en CU) y el almacenamiento de OneLake. Los montos se consultan en la página de precios.

## 15. Errores frecuentes

- Copiar las mismas tablas a varios workspaces en lugar de usar shortcuts.
- Una capacidad para todo, sin separar cargas pesadas.
- Intentar dar permisos con las API de ADLS: se hace desde Fabric.
- Tratar a OneLake como una cuenta de ADLS más.

## 16. Trade-offs

Fabric da un lake único con formatos abiertos y experiencias integradas sin administrar infraestructura, a cambio de un modelo SaaS con capacidad compartida y operaciones que solo se hacen desde Fabric. ADLS más servicios separados da más control y más que integrar.

## 17. Conceptos relacionados

- `lakehouse`: el patrón.
- `adls-gen2-storage`: el almacenamiento debajo de OneLake.
- `bigquery-biglake-tables` y `s3-data-lake`: lo más cercano en GCP y AWS.
- `azure-analytics-landscape`, `data-factory-pipelines` y `synapse-analytics`: Fabric en el mapa de Azure.

## 18. Preguntas técnicas abiertas

1. ¿Qué tablas copias hoy entre equipos que podrían ser shortcuts?
2. ¿Cómo separarías capacidades entre cargas de ingesta, warehouse y reportes?
3. ¿Qué datos de otra nube leerías por shortcut?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Microsoft Learn, Microsoft Fabric: *What is Microsoft Fabric?*, *What is OneLake?*, *OneLake shortcuts*, *Connecting to Microsoft OneLake*, *Delta Lake table format interoperability*, *What is a lakehouse in Microsoft Fabric?* y *Understand Microsoft Fabric licenses and capacity*; *Microsoft Fabric pricing*.
- Google Cloud, BigQuery: *Apache Iceberg managed tables* e *Introduction to BigLake tables*. AWS: *Working with Amazon S3 Tables and table buckets* y *What is Amazon Athena?*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-13. `review_required`: pendiente de revisión B-F3.1 del lote F3b-10a.

## 22. Historial de cambios importantes

- 2026-10-13: creación (lote F3b-10a).

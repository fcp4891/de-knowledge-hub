# Revisión · lote 07a

Rama `b/review-07a`, creada desde `cd76503`. Cinco arquitecturas: `batch-pipeline-architecture`, `modern-data-warehouse-architecture`, `data-lake-architecture`, `lakehouse-architecture` y `medallion-architecture`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

Páginas reabiertas el 2026-11-02: BigQuery overview, Introduction to BigLake tables (el H1 sigue siendo ese título y el cuerpo dice «BigLake tables»), el banner de Lakehouse, What is the medallion lakehouse architecture?, Implement Medallion Lakehouse Architecture in Fabric y Azure Data Lake Storage hierarchical namespace. El resto de las filas de §11–§13 no se volvió a abrir en esta pasada.

## Común

`scripts/validate.py` terminó así:

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 686 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

Los tres avisos son los de Spark ya conocidos. El validador no avisó de diagramas. Las 15 vistas miden 6 nodos o menos contando subgraph (`view_nodes`). Cada vista tiene un solo diagrama. La cadena más larga en `LR` es de 5 cajas.

Nodos por vista (nodos del flujo, aristas, `view_nodes`):

```
batch        §3 6/5/6   §5 6/5/6   §6 5/2/6
mdw          §3 6/5/6   §5 5/4/5   §6 5/3/6
data-lake    §3 6/5/6   §5 6/5/6   §6 5/3/6
lakehouse    §3 6/5/6   §5 6/5/6   §6 4/3/5
medallion    §3 6/5/6   §5 6/5/6   §6 3/2/5
```

En los cinco §9 el barrido de montos (`$`, USD, €) devolvió vacío. El «más del 85 %» de data lake está en la página de ADLS y lleva cita.

`tests/test_architecture_snippets.py` terminó con código 0 y la línea de avance `...ss`: los tres de biblioteca estándar exigen igualdad exacta del bloque `text` y pasaron. Los otros dos se saltan en esta máquina:

```
SKIPPED [1] tests\test_architecture_snippets.py:39: falta dbt-core (make snippets-deps)
SKIPPED [1] tests\test_open_stack_snippets.py:62: falta pyiceberg (make snippets-deps)
2 skipped in 1.86s
```

MDW y lakehouse dicen «ejecutado en la CI» y el test compara la salida entera; aquí no se reejecutaron. Las filas de nube que dicen «No ejecutado» lo dicen.

Relaciones y §17:

```
archivos ['batch-pipeline-architecture.md', 'data-lake-architecture.md', 'lakehouse-architecture.md', 'medallion-architecture.md', 'modern-data-warehouse-architecture.md']
streaming en blueprint True
streaming tiene md False
== batch-pipeline-architecture
relations ['batch-ingestion', 'idempotency', 'backfill', 'incremental-load', 'pipeline-layers', 'medallion-architecture', 'modern-data-warehouse-architecture']
related_topics ['batch-ingestion', 'incremental-load', 'backfill', 'pipeline-layers', 'idempotency']
topics fuera []
rel sin 17 []
17 sin rel []
== data-lake-architecture
relations ['data-lake', 'file-ingestion', 'pipeline-layers', 'lakehouse-architecture', 'medallion-architecture', 'modern-data-warehouse-architecture']
related_topics ['data-lake', 'file-ingestion', 'pipeline-layers']
topics fuera []
rel sin 17 []
17 sin rel []
== lakehouse-architecture
relations ['lakehouse', 'open-table-formats', 'table-format-comparison', 'data-lake-architecture', 'modern-data-warehouse-architecture', 'medallion-architecture', 'retention-and-erasure']
related_topics ['lakehouse', 'open-table-formats', 'table-format-comparison']
topics fuera []
rel sin 17 []
17 sin rel []
== medallion-architecture
relations ['pipeline-layers', 'lakehouse', 'lakehouse-architecture', 'data-lake-architecture', 'batch-pipeline-architecture', 'idempotency', 'data-mesh']
related_topics ['pipeline-layers', 'lakehouse', 'lakehouse-architecture']
topics fuera []
rel sin 17 []
17 sin rel []
== modern-data-warehouse-architecture
relations ['data-warehouse', 'etl-vs-elt', 'dbt-core-concepts', 'bigquery-architecture', 'batch-pipeline-architecture', 'lakehouse-architecture', 'data-lake-architecture']
related_topics ['data-warehouse', 'etl-vs-elt', 'bigquery-architecture', 'dbt-core-concepts']
topics fuera []
rel sin 17 []
17 sin rel []
```

`streaming-pipeline-architecture` no tiene ficha. Batch lo nombra en el §2 y en el §18 como «pendiente de ficha» y no lo pone en `relations`.

El §18 de las cinco se encadena sin contradecirse: batch puede pasar a medallion o a streaming; el warehouse y el data lake pasan a lakehouse; lakehouse se organiza por dentro con medallion; medallion puede llegar desde batch o desde un data lake y seguir hacia data mesh. Ninguna se presenta como la única opción. Medallion lo dice en el §15: «Presentar medallion como estándar».

Agent Platform no aparece en las cinco fichas. Knowledge Catalog aparece en el warehouse y en el data lake. Lakehouse, en la ficha lakehouse, cita el banner.

## batch-pipeline-architecture

**Hallazgo:** la vista de datos y la de despliegue usan otros nombres que la tabla del §4. El §9 afirma que reemplazar una partición cuesta lo mismo que cargarla, sin página. La etiqueta «Proyecto o cuenta de datos» tiene cinco palabras.

**Severidad:** media (nombres). Baja (costo y etiqueta).

**Evidencia:** el §4 nombra Zona de aterrizaje, Orquestador, Staging, Carga de partición, Warehouse y Auditoría. El §5 dice «Reemplazo de la partición del día», «Tabla particionada» y «Registro de auditoría». El §6 dice «Bucket de aterrizaje» y «Job de carga». El §3 mete «Pipeline batch diario» en el lugar de Staging y Carga de partición. El §9: «Reemplazar una partición cuesta lo mismo que cargarla: no hay costo extra por la idempotencia.» La frase anterior sí cita *Introduction to partitioned tables*.

**Corrección:** usar en las tres vistas los nombres de la primera columna del §4. Quitar la frase del costo, o citar la página que diga que el reemplazo de una partición se factura como la carga. Partir «Proyecto o cuenta de datos» en dos líneas de cuatro palabras o menos.

El bloque `text` del §10 pasó la igualdad exacta del test de biblioteca estándar. El orquestador de AWS dice «No ejecutado».

## modern-data-warehouse-architecture

**Hallazgo:** la nota de *BigQuery overview* atribuye el linaje a Knowledge Catalog. Esa página habla de gobierno y búsqueda semántica. La vista de datos llama «dim y fct (tables)» al componente «Modelo dimensional».

**Severidad:** media (linaje). Baja (nombre de la vista).

**Evidencia:** [BigQuery overview](https://docs.cloud.google.com/bigquery/docs/introduction), leída el 2026-11-02:

> Data governance and semantic search: discover, curate, and validate data and AI assets using built-in features powered by Knowledge Catalog.

La nota de la ficha dice: «Las funciones de gobierno (búsqueda semántica, linaje) las provee Knowledge Catalog.» El §4 dice «Modelo dimensional». El §5 dice «dim y fct (tables)». Staging, Marts y Tests sí usan el nombre de la tabla. El §9 cita *Estimate and control costs*, *Overview of BigQuery storage* y *Amazon Redshift Serverless*, sin montos.

**Corrección:** dejar en la nota lo que dice el párrafo: gobierno y búsqueda semántica, con Knowledge Catalog. En el §5, titular el nodo «Modelo dimensional».

El §10 dice ejecutado en la CI con dbt Core 1.12, dbt-postgres 1.11 y postgres:17. En esta máquina el test se saltó por falta de dbt-core; no reejecuté la salida. Redshift y Fabric dicen «No ejecutado».

## data-lake-architecture

**Hallazgo:** la fila de catálogo nombra Knowledge Catalog y no cita página. La vista de datos rotula la zona de cuarentena como «quarantine».

**Severidad:** media (catálogo). Baja (nombre).

**Evidencia:** el §11 dice «Catálogo | Knowledge Catalog | No ejecutado» y el frontmatter no trae una URL de Knowledge Catalog. El §4 dice «Zona de cuarentena». El nodo del §5 dice «quarantine». El §9, «ADLS estima que en muchos casos el cómputo es más del 85 % del costo total», coincide con [Azure Data Lake Storage hierarchical namespace](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace): «In many workloads, the compute resource represents more than 85% of the total cost». El H1 de [Introduction to BigLake tables](https://docs.cloud.google.com/bigquery/docs/biglake-intro) sigue siendo ese título; el cuerpo habla de BigLake tables.

**Corrección:** citar la página que nombre Knowledge Catalog como catálogo de esa fila, o no poner el producto. En el §5, usar «Zona de cuarentena».

El bloque `text` del §10 pasó la igualdad exacta. La fila de motores sobre ABFS dice «No ejecutado».

## lakehouse-architecture

**Hallazgo:** ninguna en el foco de esta pasada.

**Severidad:** ninguna.

Las vistas quedan en 6, 6 y 5 nodos. El §3 y el §6 conservan «Catálogo de tablas» y «Almacenamiento de objetos». El §5 es la secuencia de commit y nombra el catálogo en «Commit atómico en el catálogo». El §11 cita el banner. El HTML de [Set up the Apache Iceberg REST catalog endpoint](https://docs.cloud.google.com/lakehouse/docs/set-up-lakehouse-iceberg-rest-catalog), leído el 2026-11-02:

> As of April 20th, 2026, BigLake is now called Lakehouse. BigLake metastore is now called the Lakehouse runtime catalog. Lakehouse APIs, client libraries, CLI commands, and IAM names remain unchanged and still reference BigLake.

La ficha reproduce esas dos frases y la glosa de APIs, bibliotecas, CLI e IAM. El §9 cita *Working with Amazon S3 Tables and table buckets* y no pone montos. El §18 llega desde el data lake o desde un warehouse y organiza por dentro con medallion; la señal para no adoptarlo es un solo motor y nadie para el catálogo. El §10 dice ejecutado en Linux con PyIceberg 0.12. Aquí el test se saltó por falta de pyiceberg.

## medallion-architecture

**Hallazgo:** la vista de despliegue mete el lakehouse silver y el warehouse gold en un solo workspace. La página recomienda un workspace por lakehouse. El `page_title` de Fabric ya no es el H1. El §9 manda bronze a una clase de almacenamiento más barata sin página. El §5 llama «silver_rejected» a la fila «Rechazos».

**Severidad:** media (workspace). Baja (título, costo y nombre).

**Evidencia:** [Implement Medallion Lakehouse Architecture in Fabric](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture), leída el 2026-11-02. El H1 es «Implement Medallion Lakehouse Architecture in Fabric». El `page_title` guardado es «Understand medallion architecture for Fabric with OneLake» (consultado el 2026-10-11). La página: «While you can create all lakehouses in a single Fabric workspace, we recommend that you create each lakehouse in its own, separate workspace.» El patrón 2 es bronze y silver como lakehouses y gold como data warehouse. El diagrama agrupa «Lakehouse silver» y «Warehouse gold» en el subgraph «Workspace silver y gold». El párrafo de la ficha sí dice la recomendación. El §4 nombra Rechazos; el nodo del §5 dice «silver_rejected». El §9: «Bronze puede ir a una clase de almacenamiento más barata pasado un tiempo, según su política de retención.» La frase anterior cita *Introduction to partitioned tables*, que habla de bytes leídos.

[What is the medallion lakehouse architecture?](https://learn.microsoft.com/en-us/azure/databricks/lakehouse/medallion) sigue con ese H1 y con «bronze (raw), silver (validated), and gold (enriched)», como la nota.

**Corrección:** un workspace por lakehouse en el §6 (bronze y silver separados; gold como warehouse en el suyo). Actualizar el `page_title` al H1 de hoy. Citar la página de la clase de almacenamiento, o quitar la frase. En el §5, usar «Rechazos».

El bloque `text` del §10 pasó la igualdad exacta. La orquestación en GCP dice «No ejecutado». El §16 deja la alternativa de dos capas y la de ir directo al warehouse.

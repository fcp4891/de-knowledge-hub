---
id: concept:spark-execution-model
slug: spark-execution-model
type: concept
title: Modelo de ejecución de Spark
description: "Cómo ejecuta Spark una consulta según la documentación de Spark 4.2.0: el driver arma el plan y reparte tareas a los executors; cada acción lanza un job, que se divide en stages separados por shuffles, con una tarea por partición. El shuffle redistribuye datos y es caro; AQE reoptimiza con estadísticas de ejecución. Ejemplo ejecutado con PySpark en la CI: una agregación con su Exchange y su plan adaptativo. Managed Service for Apache Spark, EMR y Azure Databricks, con sus diferencias."
domain: open-data-stack
subdomain: processing-and-messaging
category: open-data-stack
classification: modern
level: advanced
importance: high
cloud: [agnostic]
technologies: [apache-spark, aws-emr, azure-databricks]
tags: [spark, driver, executors, jobs, stages, tasks, shuffle, aqe]
related_topics: [pyspark-dataframes]
sources:
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/cluster-overview.html
    accessed: 2026-10-20
    page_title: "Cluster Mode Overview"
    note: "Cluster Mode Overview (Spark 4.2.0), glosario: el driver es el proceso que corre main() y crea el SparkContext; un executor es un proceso por aplicación en un nodo worker, que corre tareas y guarda datos en memoria o disco; una task es «A unit of work that will be sent to one executor»; un job es una computación paralela de varias tareas que se lanza ante una acción (save, collect); cada job se divide en stages, conjuntos de tareas que dependen entre sí, como las etapas map y reduce de MapReduce. Cada driver tiene una interfaz web, por lo general en el puerto 4040, con las tareas en curso, los executors y el uso de almacenamiento."
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/rdd-programming-guide.html
    accessed: 2026-10-20
    page_title: "RDD Programming Guide"
    note: "RDD Programming Guide (Spark 4.2.0), Shuffle operations: «The shuffle is Spark’s mechanism for re-distributing data so that it’s grouped differently across partitions»; suele copiar datos entre executors y máquinas; es caro porque implica E/S de disco, serialización y red; lo disparan operaciones como groupByKey, reduceByKey y los joins; Spark genera tareas map para organizar los datos y tareas reduce para agregarlos."
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/sql-performance-tuning.html
    accessed: 2026-10-20
    page_title: "Performance Tuning"
    note: "Performance Tuning (Spark 4.2.0): «Adaptive Query Execution (AQE) is an optimization technique in Spark SQL that makes use of the runtime statistics to choose the most efficient query execution plan», activado por defecto desde Spark 3.2.0 (spark.sql.adaptive.enabled); entre sus funciones, juntar las particiones posteriores al shuffle según las estadísticas de salida del map, dividir particiones con skew y convertir joins sort-merge en broadcast."
  - source: gcp-managed-spark-docs
    url: https://docs.cloud.google.com/managed-spark/docs/concepts/serverless-spark-compare
    accessed: 2026-10-09
    page_title: "Compare Managed Service for Apache Spark serverless and cluster deployments"
    note: "Compare Managed Service for Apache Spark serverless and cluster deployments: Managed Service for Apache Spark incluye las opciones antes llamadas Dataproc on Compute Engine (despliegue en clúster) y Google Cloud Serverless for Apache Spark (despliegue serverless); la página compara ambos despliegues."
  - source: aws-emr-docs
    url: https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-master-core-task-nodes.html
    accessed: 2026-10-12
    page_title: "Understand node types in Amazon EMR: primary, core, and task nodes"
    note: "Understand node types: el nodo primario administra el clúster (YARN ResourceManager, HDFS NameNode); desde EMR 5.23.0 puede haber tres primarios para alta disponibilidad. Los nodos core guardan datos en HDFS y ejecutan tareas (por ejemplo, ejecutores de Spark); hay un solo grupo o flota core. Los nodos task agregan cómputo sin guardar datos en HDFS (hasta 48 grupos task con instance groups) y permiten mezclar On-Demand y Spot."
  - source: aws-emr-docs
    url: https://docs.aws.amazon.com/emr/latest/ReleaseGuide/emr-7140-release.html
    accessed: 2026-10-12
    page_title: "Amazon EMR release 7.14.0"
    note: "Amazon EMR release 7.14.0: incluye Spark 3.5.8-amzn-0, Hadoop 3.4.2, Iceberg 1.10.1, Delta 3.3.2 y Hudi 1.0.2, entre otras aplicaciones."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/introduction/
    accessed: 2026-10-13
    page_title: "What is Azure Databricks?"
    note: "What is Azure Databricks?: plataforma de analítica unificada y abierta para construir, desplegar, compartir y mantener soluciones de datos, analítica e IA; se integra con el almacenamiento y la seguridad de la cuenta en la nube y administra y despliega la infraestructura."
relations:
  - type: DEPENDS_ON
    target: pyspark-dataframes
    note: La API sobre la que corre el modelo de ejecución.
  - type: RELATED_TO
    target: spark-structured-streaming
    note: Cada micro-batch es un job con sus stages.
  - type: RELATED_TO
    target: query-plans
    note: Leer el plan físico, igual que en SQL.
  - type: RELATED_TO
    target: partitioning
    note: Las particiones definen el paralelismo.
  - type: RELATED_TO
    target: emr-spark-clusters
    note: Dónde corren driver y executors en AWS.
  - type: RELATED_TO
    target: azure-databricks-lakehouse
    note: Spark en Azure Databricks.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

Spark separa **qué** se calcula (el plan) de **cómo** se reparte el trabajo. El **driver** corre el programa, arma el plan y manda **tareas** a los **executors**, procesos que corren en los nodos del clúster.

La jerarquía de trabajo, según el glosario de Spark:

- **job:** se lanza con cada acción (`collect`, `save`);
- **stage:** cada job se divide en stages que dependen entre sí; el corte entre stages es un **shuffle**;
- **task:** una por partición; «A unit of work that will be sent to one executor».

El shuffle redistribuye datos entre executors y es caro: disco, serialización y red. **AQE** (activado por defecto desde Spark 3.2.0) reoptimiza el plan con estadísticas reales de ejecución, por ejemplo juntando particiones chicas después de un shuffle.

## 2. Qué es

- **Driver:** el proceso que corre `main()` y crea el `SparkContext`.
- **Executor:** un proceso por aplicación en un nodo worker; corre tareas y guarda datos en memoria o disco.
- **Operación con shuffle:** agrupar por clave o unir (`groupByKey`, `reduceByKey`, joins) redistribuye datos entre particiones; el plan la muestra como un stage nuevo.
- **Operación sin shuffle:** filtrar o proyectar trabaja dentro de cada partición.
- **Exchange:** el operador del plan físico que representa el shuffle.
- **AQE:** reoptimización durante la ejecución con estadísticas reales.

## 3. Problema que resuelve

Un job de agregación tarda una hora y nadie sabe por qué. Mirando el plan y los stages se ve que un `groupBy` provoca un shuffle de todo el dataset y que uno de los stages tiene una tarea mucho más lenta que las demás (una partición con skew). Entender el modelo de ejecución convierte «Spark es lento» en una causa concreta: demasiados shuffles, particiones mal dimensionadas, una clave caliente.

## 4. Cómo funciona

1. El programa define transformaciones; nada corre hasta una acción.
2. Con la acción, el driver arma el plan físico y lanza un job.
3. El job se corta en stages en cada shuffle (cada `Exchange`).
4. Cada stage corre una tarea por partición en los executors.
5. Entre stages, los datos se escriben y se leen por clave (shuffle).
6. Con AQE, después de cada shuffle Spark mira las estadísticas reales y ajusta el resto del plan.

## 5. Cuándo utilizarlo

- Para diagnosticar jobs lentos: contar shuffles, mirar tareas por stage y buscar skew.
- Para dimensionar particiones y executors.
- Antes de reescribir un job: muchas veces alcanza con evitar un shuffle.

## 6. Cuándo no utilizarlo

- Para micro-optimizar consultas chicas: el costo fijo de Spark domina.
- Desactivar AQE por costumbre: es el valor por defecto y suele mejorar el plan.
- Fijar `spark.sql.shuffle.partitions` a mano sin mirar los datos.

## 7. Ejemplo sencillo

Cien mil ventas en 4 particiones, agrupadas por tienda. La agregación necesita un shuffle: el plan tiene un `Exchange hashpartitioning`, el job tiene al menos dos stages y el primero corre 4 tareas, una por partición de entrada. Después de ejecutar, el plan adaptativo final muestra que AQE juntó las particiones chicas del shuffle.

## 8. Ejemplo de producción

Un job diario que une ventas con un catálogo de productos:

- el catálogo es chico: un broadcast join evita el shuffle de las ventas (AQE puede elegirlo solo);
- las ventas se escriben particionadas por fecha;
- la interfaz web del driver muestra las tareas y los executors; una tarea mucho más lenta que las demás del mismo stage suele ser skew;
- AQE divide las particiones con skew en vez de reescribir el job.

## 9. Arquitectura

```mermaid
flowchart LR
  D["Driver<br/>plan físico"] -- "tareas" --> E1["Executor 1"]
  D -- "tareas" --> E2["Executor 2"]
  subgraph J["Job (acción collect)"]
    S1["Stage 1<br/>4 tareas: leer y agregar parcial"] -- "shuffle (Exchange)" --> S2["Stage 2<br/>tareas: agregar por tienda"]
  end
```

## 10. Código

```python
# Python 3.12 y PySpark 4.2.0 en modo local (ejecutado en la CI con Java 17): una agregación por clave produce un job
# con al menos dos stages, separados por un shuffle. El plan físico muestra el Exchange; el status tracker, los stages y sus tareas
# (una por partición); con AQE, el plan final junta las particiones chicas del shuffle.
import contextlib
import io

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = (SparkSession.builder.master("local[2]").config("spark.sql.shuffle.partitions", "8")
         .config("spark.sql.adaptive.enabled", "true").config("spark.ui.showConsoleProgress", "false").getOrCreate())
spark.sparkContext.setLogLevel("ERROR")
sc = spark.sparkContext

ventas = spark.range(0, 100_000, numPartitions=4).withColumn("tienda", F.col("id") % 3)
por_tienda = ventas.groupBy("tienda").agg(F.count("*").alias("ventas"))   # wide: necesita un shuffle

sc.setJobGroup("agregacion", "ventas por tienda")
rows = sorted((r.tienda, r.ventas) for r in por_tienda.collect())
print(f"resultado: {rows}")

stages = sorted({s for job in sc.statusTracker().getJobIdsForGroup("agregacion")
                 for s in sc.statusTracker().getJobInfo(job).stageIds})
tasks = [sc.statusTracker().getStageInfo(s).numTasks for s in stages if sc.statusTracker().getStageInfo(s)]
print(f"stages: {'2 o más' if len(tasks) >= 2 else len(tasks)}; tareas del primer stage: {tasks[0]} (una por partición de entrada)")

buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    por_tienda.explain()   # plan físico; tras ejecutar, el plan adaptativo final
plan = buffer.getvalue()
print("Exchange en el plan:", "Exchange hashpartitioning" in plan)
print("plan adaptativo final:", "AdaptiveSparkPlan isFinalPlan=true" in plan)
print("AQE juntó particiones del shuffle:", "coalesced" in plan)
spark.stop()
```

El script se **ejecuta en la CI con PySpark 4.2.0 en modo local y Java 17**. Imprime el resultado, que el job tiene al menos dos stages y que el primero corre 4 tareas, y que el plan físico tiene un `Exchange hashpartitioning` y un plan adaptativo final. El número exacto de stages puede cambiar con AQE y el test no lo fija. La última línea dice si AQE juntó particiones del shuffle; el test no la exige, porque depende de las estadísticas de ejecución.

## 11. GCP

En GCP, Spark corre en **Managed Service for Apache Spark**. Según *Compare Managed Service for Apache Spark serverless and cluster deployments* (no ejecutado):

| | Spark propio | Managed Service for Apache Spark |
|---|---|---|
| Dónde corren driver y executors | En el clúster que opera el equipo | En un clúster administrado (antes Dataproc on Compute Engine) o en un despliegue serverless (antes Google Cloud Serverless for Apache Spark) |

## 12. AWS

En AWS, Spark corre en **Amazon EMR**. Según *Understand node types* y *Amazon EMR release 7.14.0* (no ejecutado):

| | Spark propio | Amazon EMR |
|---|---|---|
| Nodos | Los define el equipo | Primario (administra el clúster), core (guardan datos en HDFS y corren tareas, como executors de Spark) y task (solo cómputo, también Spot) |
| Versión | Spark 4.2.0 en esta ficha | La release 7.14.0 trae Spark 3.5.8-amzn-0 (consultado el 2026-10-12) |

## 13. Azure

En Azure, Spark corre en **Azure Databricks**. Según *What is Azure Databricks?* (no ejecutado):

| | Spark propio | Azure Databricks |
|---|---|---|
| Infraestructura | La opera el equipo | Databricks administra y despliega la infraestructura en la cuenta de nube |

## 14. Buenas prácticas

- Leer el plan (`explain`) antes de optimizar.
- Evitar shuffles innecesarios: filtrar y proyectar antes de agrupar o unir; broadcast para tablas chicas.
- Mantener AQE activado.
- **Seguridad:** el driver ve las credenciales del job; los executors, solo lo que necesitan.
- **Observabilidad:** la interfaz web del driver (puerto 4040) con tareas, executors y almacenamiento; tareas lentas dentro de un stage.
- **Costo:** el shuffle es disco y red; menos shuffles es menos tiempo de clúster.

## 15. Errores frecuentes

- `collect()` de un DataFrame grande al driver.
- Un `groupBy` por una clave con un valor muy frecuente (skew).
- Particiones de entrada demasiado chicas o demasiado grandes.
- Copiar código de Spark 4.2 a un clúster con Spark 3.5 sin revisar la versión.

## 16. Trade-offs

Más particiones dan más paralelismo y más tareas que coordinar. El shuffle permite agregar y unir datos distribuidos, a cambio de disco y red. AQE mejora el plan sin cambiar el código, con decisiones que se toman en ejecución y que hay que mirar en el plan final.

## 17. Conceptos relacionados

- `pyspark-dataframes`: la API.
- `spark-structured-streaming`: el mismo modelo en micro-batches.
- `query-plans`: leer un plan físico.
- `partitioning`: particiones y paralelismo.
- `emr-spark-clusters`: Spark en AWS.
- `azure-databricks-lakehouse`: Spark en Azure.

## 18. Preguntas técnicas abiertas

1. ¿Cuántos shuffles tiene tu job más caro y cuáles se pueden evitar?
2. ¿Qué stage tarda más y por qué?
3. ¿Qué versión de Spark corre en tu plataforma?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Spark 4.2.0: *Cluster Mode Overview*, *RDD Programming Guide* y *Performance Tuning*.
- Google Cloud: *Compare Managed Service for Apache Spark serverless and cluster deployments*.
- AWS: *Understand node types* y *Amazon EMR release 7.14.0*.
- Microsoft Learn: *What is Azure Databricks?*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-20a.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-20a).

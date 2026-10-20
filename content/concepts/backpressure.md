---
id: concept:backpressure
slug: backpressure
type: concept
title: Backpressure
description: "Qué es la backpressure según Flink 2.3: un operador produce más rápido de lo que el siguiente consume y la presión se propaga hacia la fuente; Flink la mide por subtarea (OK, LOW, HIGH). En Spark Structured Streaming el ritmo se limita en la fuente por micro-batch. Ejemplo ejecutado con PySpark en la CI: un atraso de 6 archivos en lotes de 2. Dataflow, Managed Service for Apache Flink y Azure Databricks, con sus diferencias."
domain: streaming
subdomain: time-and-state
category: streaming
classification: core
level: advanced
importance: low
cloud: [agnostic]
technologies: [apache-flink, apache-spark, gcp-dataflow, azure-databricks]
tags: [backpressure, rate-limiting, admission-control, flink, consumer-lag]
related_topics: [stateful-stream-processing]
sources:
  - source: apache-flink-docs
    url: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/ops/monitoring/back_pressure/
    accessed: 2026-10-19
    page_title: "Monitoring Back Pressure"
    note: "Monitoring Back Pressure (Flink 2.3): una advertencia de back pressure en una tarea indica que produce datos más rápido de lo que los operadores siguientes consumen; los registros fluyen hacia abajo y la back pressure se propaga en sentido contrario, hacia arriba; en Source -> Sink, una advertencia en Source significa que Sink consume más lento. Cada subtarea expone backPressuredTimeMsPerSecond, idleTimeMsPerSecond y busyTimeMsPerSecond, que suman cerca de 1000 ms; el estado es OK (0 a 10 % del tiempo con back pressure), LOW (más de 10 % y hasta 50 %) o HIGH (más de 50 %)."
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/streaming/apis-on-dataframes-and-datasets.html
    accessed: 2026-10-19
    page_title: "Structured Streaming Programming Guide"
    note: "Structured Streaming Programming Guide, APIs on DataFrames and Datasets (Spark 4.2.0): la fuente de archivos admite maxFilesPerTrigger, el máximo de archivos nuevos por trigger (por defecto sin máximo), y maxBytesPerTrigger, que no se pueden usar juntos."
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/horizontal-autoscaling
    accessed: 2026-10-11
    page_title: "Horizontal Autoscaling"
    note: "Horizontal Autoscaling: Dataflow elige la cantidad de workers y agrega o quita según la utilización promedio de CPU y el paralelismo del pipeline (estimación de hilos necesarios). Habilitado por defecto en batch: estima el trabajo total de cada etapa según el tamaño de entrada y el throughput, y lo reevalúa cada 30 segundos. También en streaming."
  - source: aws-managed-flink-docs
    url: https://docs.aws.amazon.com/managed-flink/latest/java/what-is.html
    accessed: 2026-10-12
    page_title: "What is Amazon Managed Service for Apache Flink?"
    note: "What is Amazon Managed Service for Apache Flink?: procesa y analiza datos de streaming con Java, Scala, Python o SQL sobre Apache Flink; el servicio administra la infraestructura, el escalado y los checkpoints y snapshots."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/batch-size
    accessed: 2026-10-19
    page_title: "Configure Structured Streaming batch size on Azure Databricks"
    note: "Configure Structured Streaming batch size on Azure Databricks: «Admission controls limit the input rate for Structured Streaming queries», para mantener batches de tamaño estable y evitar que uno grande cause spill y atrasos en cascada; maxFilesPerTrigger fija el máximo de archivos por micro-batch y maxBytesPerTrigger un máximo blando de bytes; fuentes como Kafka tienen sus propios límites, como maxOffsetsPerTrigger; se pueden cambiar sin reiniciar el checkpoint."
relations:
  - type: RELATED_TO
    target: stateful-stream-processing
    note: Un operador con estado lento es un origen típico de backpressure.
  - type: RELATED_TO
    target: offsets
    note: Si el consumidor no da abasto, el lag crece.
  - type: RELATED_TO
    target: producers-and-consumers
    note: El consumidor pide datos a su ritmo.
  - type: RELATED_TO
    target: spark-structured-streaming
    note: En Spark, el ritmo se limita en la fuente.
created_at: 2026-10-19
updated_at: 2026-10-19
last_verified: 2026-10-19
verification_status: review_required
---

## 1. Resumen

Hay **backpressure** cuando una parte del pipeline produce más rápido de lo que la siguiente puede consumir. Según Flink, los registros fluyen hacia adelante y la backpressure se propaga hacia atrás, hasta la fuente: el operador lento frena a los anteriores en vez de perder datos.

Dos formas de manejarla:

- **Flink:** la presión se propaga sola entre operadores, y el motor la mide por subtarea (`backPressuredTimeMsPerSecond`) con estados OK, LOW y HIGH;
- **Spark Structured Streaming:** el tamaño de cada micro-batch se limita en la fuente (`maxFilesPerTrigger`, `maxOffsetsPerTrigger`), lo que Databricks llama *admission control*.

En los dos casos, si la presión dura, el lag del consumidor crece: hay que escalar o hacer más rápido el operador lento.

## 2. Qué es

- **Backpressure:** un operador que espera porque el siguiente no acepta más datos.
- **Subtarea backpressured, idle o busy:** las tres métricas de Flink, que suman cerca de 1000 ms por segundo.
- **OK / LOW / HIGH:** hasta 10 %, hasta 50 % y más de 50 % del tiempo con backpressure.
- **Admission control:** límites de entrada por micro-batch en Structured Streaming.
- **Lag:** lo pendiente en la fuente, que crece si la presión no se resuelve (ver `offsets`).

## 3. Problema que resuelve

Un job lee eventos y los escribe en una base que se vuelve lenta. Sin backpressure, el job acumularía eventos en memoria hasta caerse. Con backpressure, la lectura se frena: los eventos esperan en el broker, el lag crece y hay una señal clara de dónde está el cuello de botella. En Spark, tras una parada larga, un primer micro-batch con todo el atraso puede ser tan grande que derrame a disco; limitar la entrada lo divide en batches manejables.

## 4. Cómo funciona

1. El operador lento (por ejemplo, el sink) deja de aceptar datos al ritmo que llegan.
2. En Flink, el operador anterior queda esperando, y así hasta la fuente, que lee más lento.
3. La métrica `backPressuredTimeMsPerSecond` de los operadores anteriores sube.
4. En Spark, cada micro-batch toma como máximo lo que permite el límite de la fuente.
5. Lo que no se lee sigue en el broker o en el almacenamiento; el lag lo muestra.

## 5. Cuándo utilizarlo

- Siempre que la velocidad de los operadores no sea constante, como sinks externos.
- Para recuperarse de un atraso sin batches gigantes: límites de entrada en Spark.
- Para encontrar el cuello de botella: la subtarea que no está backpressured pero sí ocupada, detrás de las que sí lo están.

## 6. Cuándo no utilizarlo

- Como solución permanente: si la presión es constante, falta capacidad.
- Límites de entrada tan bajos que el pipeline nunca alcanza la entrada.
- Leer la métrica del operador equivocado: el que muestra backpressure no es el lento, es el de antes.

## 7. Ejemplo sencillo

Seis archivos de 100 eventos pendientes. Sin límite, un solo micro-batch toma los 600. Con `maxFilesPerTrigger=2`, el atraso se procesa en tres micro-batches de 200.

## 8. Ejemplo de producción

Un job de Kafka a una base de datos:

- en Flink, una alerta si el sink queda en HIGH por más de 10 minutos;
- en Spark, `maxOffsetsPerTrigger` para que un atraso no genere un batch enorme;
- el lag del grupo como señal principal, con un umbral según la retención del topic;
- escalado del sink (más conexiones, escritura por lotes) antes que más workers en la lectura.

## 9. Arquitectura

```mermaid
flowchart LR
  S["Fuente"] --> M["Map"]
  M --> K["Sink lento"]
  K -. "backpressure" .-> M
  M -. "backpressure" .-> S
  B["Broker: el lag crece"] --- S
```

## 10. Código

```python
# Python 3.12 y PySpark 4.2.0 en modo local (ejecutado en la CI con Java 17): en Structured Streaming el tamaño de
# cada micro-batch se limita en la fuente (admission control). Con 6 archivos pendientes, sin límite un solo
# micro-batch los toma todos; con maxFilesPerTrigger=2, el atraso se procesa en lotes de 2 archivos.
import json
import sys
import tempfile
from pathlib import Path

from pyspark.sql import DataFrame, SparkSession

base = Path(sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp())
src = base / "eventos"
src.mkdir(parents=True, exist_ok=True)
for i in range(6):   # un atraso acumulado: 6 archivos de 100 eventos cada uno
    (src / f"{i}.json").write_text("\n".join(json.dumps({"n": n}) for n in range(100)), encoding="utf-8")

spark = (SparkSession.builder.master("local[2]").config("spark.sql.shuffle.partitions", "2")
         .config("spark.ui.showConsoleProgress", "false").getOrCreate())
spark.sparkContext.setLogLevel("ERROR")


def batches(max_files: int | None) -> list[int]:
    """Filas por micro-batch al procesar el atraso, con o sin límite por trigger."""
    sizes: list[int] = []
    reader = spark.readStream.schema("n INT")
    if max_files is not None:
        reader = reader.option("maxFilesPerTrigger", max_files)

    def record(batch: DataFrame, _batch_id: int) -> None:
        sizes.append(batch.count())

    name = "sin-limite" if max_files is None else f"max-{max_files}"
    query = (reader.json(str(src)).writeStream.foreachBatch(record)
             .option("checkpointLocation", str(base / f"checkpoint-{name}")).trigger(availableNow=True).start())
    query.awaitTermination()
    return [s for s in sizes if s]


print(f"sin límite: micro-batches de {batches(None)} filas")
print(f"maxFilesPerTrigger=2: micro-batches de {batches(2)} filas")
spark.stop()
```

El script se **ejecuta en la CI con PySpark 4.2.0 en modo local y Java 17**. Imprime `sin límite: micro-batches de [600] filas` y `maxFilesPerTrigger=2: micro-batches de [200, 200, 200] filas`. La backpressure de Flink no tiene código propio: se lee en la interfaz web y en las métricas de cada subtarea (*Monitoring Back Pressure*), y no se ejecutó.

## 11. GCP

En GCP, **Dataflow** ajusta los workers. Según *Horizontal Autoscaling* (no ejecutado):

| | Spark Structured Streaming | Dataflow |
|---|---|---|
| Ante más trabajo | Límites de entrada por micro-batch; los recursos los fija el clúster | Agrega o quita workers según la CPU y el paralelismo; el autoescalado también funciona en streaming |

## 12. AWS

En AWS, **Managed Service for Apache Flink** corre Flink. Según *What is Amazon Managed Service for Apache Flink?* y *Monitoring Back Pressure* de Flink 2.3 (no ejecutado):

| | Flink propio | Managed Service for Apache Flink |
|---|---|---|
| Backpressure | Se propaga entre operadores y se mide por subtarea | La misma de Flink |
| Escalado | Lo decide el equipo | El servicio administra la infraestructura y el escalado |

## 13. Azure

En Azure, **Azure Databricks** corre Structured Streaming. Según *Configure Structured Streaming batch size on Azure Databricks* (no ejecutado):

| | Spark Structured Streaming | Azure Databricks |
|---|---|---|
| Control de entrada | `maxFilesPerTrigger` y `maxBytesPerTrigger` en la fuente de archivos | Admission controls: `maxFilesPerTrigger`, `maxBytesPerTrigger` y límites propios de cada fuente, como `maxOffsetsPerTrigger` en Kafka |
| Cambiarlos | — | Se pueden cambiar sin reiniciar el checkpoint |

## 14. Buenas prácticas

- Medir el lag y, en Flink, el estado de backpressure de cada subtarea.
- Buscar el cuello de botella después del último operador con backpressure.
- Límites de entrada en Spark para que un atraso no genere un batch enorme.
- **Seguridad:** sin aspectos propios.
- **Observabilidad:** lag, tiempo por micro-batch y métricas busy, idle y backpressured.
- **Costo:** escalar todo el pipeline por un sink lento cuesta más que arreglar el sink.

## 15. Errores frecuentes

- Escalar la fuente cuando el lento es el sink.
- Ignorar la backpressure hasta que el lag pasa la retención y se pierden eventos.
- Un primer micro-batch sin límites tras una parada larga.
- Confundir backpressure con falla: el pipeline sigue, más lento.

## 16. Trade-offs

La backpressure protege al pipeline de quedarse sin memoria, a cambio de latencia y lag. Limitar la entrada da batches estables y tarda más en recuperar un atraso. Escalar resuelve la presión con más costo; optimizar el operador lento, con más trabajo.

## 17. Conceptos relacionados

- `stateful-stream-processing`: operadores con estado que suelen ser lentos.
- `offsets`: el lag que crece.
- `producers-and-consumers`: el consumidor que lee a su ritmo.
- `spark-structured-streaming`: el control de entrada en Spark.

## 18. Preguntas técnicas abiertas

1. ¿Qué operador de tu pipeline es el más lento y cómo lo sabes?
2. ¿Qué pasa con tu job tras una parada de una hora?
3. ¿Cuánto lag puede acumular tu consumidor antes de perder datos?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Flink 2.3: *Monitoring Back Pressure*.
- Apache Spark 4.2.0: *Structured Streaming Programming Guide* (APIs on DataFrames and Datasets).
- Google Cloud: *Horizontal Autoscaling*.
- AWS: *What is Amazon Managed Service for Apache Flink?*.
- Microsoft Learn: *Configure Structured Streaming batch size on Azure Databricks*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-19. `review_required`: pendiente de revisión B-F3.1 del lote F3b-14b.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-14b).

---
id: architecture:streaming-pipeline-architecture
slug: streaming-pipeline-architecture
type: architecture
title: Arquitectura de pipeline streaming
description: "Ingesta continua desde un broker, validación con DLQ, ventanas por tiempo de evento con watermark, checkpoints y escritura idempotente en el destino. Tres vistas, operación (lag, drain y reemplazo de jobs) y costos; Pub/Sub con Dataflow, Kinesis con Managed Service for Apache Flink y Event Hubs con Databricks, con sus diferencias. Ejemplo ejecutado en la CI con PySpark 4.2.0."
domain: architecture
subdomain: reference-architectures
classification: core
level: intermediate
importance: high
cloud: [gcp, aws, azure]
technologies: [gcp-pubsub, gcp-dataflow, gcp-bigquery, aws-kinesis, apache-flink, azure-event-hubs, azure-databricks, apache-spark, apache-kafka]
tags: [streaming, watermarks, dead-letter-queue, checkpoints, exactly-once, idempotency]
related_topics: [streaming-ingestion, watermarks, dead-letter-queue, checkpoints]
sources:
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/concepts/streaming-pipelines
    accessed: '2026-10-11'
    page_title: Streaming pipelines
    note: 'Streaming pipelines: las funciones de ventana dividen colecciones no acotadas por el timestamp de cada elemento; ventanas tumbling (fixed en Beam), hopping (sliding en Beam, pueden solaparse) y de sesión. El watermark es el umbral que indica cuándo Dataflow espera que hayan llegado todos los datos de una ventana; si pasó el final de la ventana y llegan datos con timestamp dentro de ella, son datos tardíos. Los datos no llegan garantizados en orden ni a intervalos predecibles; la fuente determina el watermark; Beam permite aceptar datos tardíos. Los triggers deciden cuándo emitir resultados; por defecto, cuando el watermark pasa el final de la ventana.'
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/guides/streaming-modes
    accessed: '2026-10-11'
    page_title: Set the pipeline streaming mode
    note: 'Set the pipeline streaming mode: at-least-once puede bajar mucho el costo y la latencia. Exactly-once para resultados exactos y semántica predecible: agregaciones (count, sum, mean) y casos críticos (fraude, amenazas de red, inventario). At-least-once si la carga tolera duplicados: deduplicación aguas abajo (por ejemplo, al escribir en BigQuery o una base SQL) o pipelines solo de map sin agregaciones (logs, CDC, ETL).'
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/concepts/exactly-once
    accessed: '2026-10-11'
    page_title: Exactly-once in Dataflow
    note: 'Exactly-once in Dataflow: los pipelines batch siempre usan exactly-once; los streaming por defecto, con at-least-once opcional. Para cada registro, Dataflow garantiza que se procesa y no se pierde, y que los resultados que quedan dentro del pipeline se reflejan como mucho una vez: los registros se procesan al menos una vez y los resultados se confirman exactamente una vez. La deduplicación tiene costo. Los efectos secundarios fuera del pipeline (por ejemplo, llamadas a un servicio remoto) pueden ocurrir varias veces, e incluso causar pérdida de datos si una transform borra su entrada antes de confirmar el resultado.'
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/guides/updating-a-pipeline
    accessed: '2026-10-11'
    page_title: Update an existing pipeline
    note: 'Update an existing pipeline: motivos (mejorar el código, corregir errores, cambios de formato, parches de seguridad, cambiar la cantidad de workers). Actualización en vuelo: en jobs con Streaming Engine, cambiar min-num-workers y max-num-workers sin detener el job ni cambiar su ID. Job de reemplazo: para código nuevo u opciones no soportadas en vuelo, un job nuevo que reemplaza al anterior; antes conviene validar su grafo. Dataflow hace un chequeo de compatibilidad para transferir el estado intermedio y los datos en buffer.'
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/guides/stopping-a-pipeline
    accessed: '2026-10-11'
    page_title: Stop a running Dataflow pipeline
    note: 'Stop a running Dataflow pipeline: cancel detiene el procesamiento, incluidos los datos en buffer (batch y streaming); drain, solo en streaming, termina de procesar lo que está en buffer y deja de ingerir datos nuevos; force cancel, solo si el cancel normal quedó trabado. Un job cancelado no se puede reiniciar. Antes de detener un pipeline streaming, conviene crear un snapshot del job.'
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/dead-letter-topics
    accessed: '2026-09-30'
    page_title: Dead-letter topics
    note: Dead-letter topics; intentos de entrega entre 5 (mínimo y por defecto) y 100 (máximo); conteo aproximado y best-effort; el mensaje se reenvía envuelto con atributos de la suscripción de origen; Pub/Sub solo cuenta intentos si el dead-letter topic está bien configurado y con los permisos IAM correctos.
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/write-api-grpc
    accessed: '2026-10-05'
    page_title: Introduction to the Storage Write API (gRPC)
    note: 'Storage Write API (gRPC): el default stream está pensado para datos que llegan continuamente, los datos quedan disponibles de inmediato para consulta y la semántica es at-least-once; los streams creados por la aplicación dan escritura exactly-once mediante offsets y propiedades ACID adicionales.'
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/streaming/apis-on-dataframes-and-datasets.html
    accessed: '2026-10-19'
    page_title: Structured Streaming Programming Guide
    note: 'Structured Streaming Programming Guide, APIs on DataFrames and Datasets (Spark 4.2.0): con withWatermark, para una ventana que termina en T el motor mantiene estado y acepta datos tardíos hasta que (max event time seen by the engine - late threshold > T); en modo append, el resultado final de una ventana se agrega solo después de que la watermark la pasa. La watermark limpia estado solo en modo append o update, con la agregación sobre la columna de tiempo de evento o una ventana sobre ella. «A watermark delay ... of “2 hours” guarantees that the engine will never drop any data that is less than 2 hours delayed»; la garantía es estricta en una sola dirección: lo que llega con más atraso no tiene garantizado ser descartado.'
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/streaming/getting-started.html
    accessed: '2026-10-19'
    page_title: Structured Streaming Programming Guide
    note: 'Structured Streaming Programming Guide, Getting Started (Spark 4.2.0): cada fuente tiene offsets para seguir su posición; el motor registra con checkpointing y write-ahead logs el rango de offsets de cada trigger; los sinks están diseñados para ser idempotentes ante reprocesos; «Together, using replayable sources and idempotent sinks, Structured Streaming can ensure end-to-end exactly-once semantics under any failure».'
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html
    accessed: '2026-10-12'
    page_title: Amazon Kinesis Data Streams Terminology and concepts
    note: 'Terminology and concepts: un stream es un conjunto de shards; cada shard admite hasta 5 transacciones de lectura por segundo, hasta 2 MB/s de lectura, y hasta 1.000 registros y 1 MB/s de escritura (incluidas las partition keys). Un registro tiene número de secuencia, partition key y un blob inmutable de hasta 1 MB. La partition key (hasta 256 caracteres Unicode) se pasa por MD5 a un entero de 128 bits que elige el shard. La retención por defecto es de 24 horas, ampliable hasta 8.760 horas (365 días). La Kinesis Client Library asigna un procesador por shard y guarda metadatos en tablas de DynamoDB.'
  - source: aws-managed-flink-docs
    url: https://docs.aws.amazon.com/managed-flink/latest/java/what-is.html
    accessed: '2026-10-12'
    page_title: What is Amazon Managed Service for Apache Flink?
    note: 'What is Amazon Managed Service for Apache Flink?: procesa y analiza datos de streaming con Java, Scala, Python o SQL sobre Apache Flink; el servicio administra la infraestructura, el escalado y los checkpoints y snapshots.'
  - source: aws-firehose-docs
    url: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
    accessed: '2026-10-12'
    page_title: What is Amazon Data Firehose?
    note: 'What is Amazon Data Firehose?: servicio administrado que entrega datos de streaming a destinos como Amazon S3, Amazon Redshift, OpenSearch, tablas Apache Iceberg y endpoints HTTP, sin escribir aplicaciones; puede transformar antes de entregar, leer de un Kinesis data stream existente y acumula datos por tamaño (MB) o intervalo (segundos) antes de entregar. Hacia Redshift, entrega primero a S3 y luego ejecuta COPY.'
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-features
    accessed: '2026-10-13'
    page_title: Event Hubs features and terminology
    note: 'Event Hubs features and terminology: la partition key la da el emisor y pasa por una función de hash estática que asigna la partición; sin partition key, la asignación es round-robin; cambiar el mapeo de claves a particiones cambia la distribución, algo a evitar si importa el orden relativo. Un grupo de consumidores es una vista independiente del stream; hasta 5 receptores sin epoch pueden leer la misma partición dentro de un grupo. El checkpoint es responsabilidad del consumidor: el servicio da offsets y el consumidor los guarda (por ejemplo, en Blob Storage, un contenedor por grupo). Retención por tiempo: Standard 1 hora por defecto y 7 días como máximo; Premium y Dedicated, hasta 90 días; los eventos no se pueden borrar a mano.'
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-capture-overview
    accessed: '2026-10-13'
    page_title: Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage
    note: 'Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage: Capture guarda automáticamente el stream en Azure Blob Storage o ADLS, por intervalo de tiempo o de tamaño, en formato Avro, y escala con la capacidad del event hub.'
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/foreach
    accessed: '2026-10-19'
    page_title: Use foreachBatch to write to arbitrary data sinks
    note: 'Use foreachBatch to write to arbitrary data sinks (Azure Databricks): «foreachBatch() provides only at-least-once write guarantees»; el batchId sirve para deduplicar la salida y lograr exactly-once, y «In either case, you will have to reason about the end-to-end semantics yourself». Para escribir en varias tablas Delta, usar txnAppId y txnVersion ligado al batchId; no capturar y reintentar errores localmente.'
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/checkpoints
    accessed: '2026-10-19'
    page_title: Structured Streaming checkpoints
    note: 'Structured Streaming checkpoints (Azure Databricks): el checkpoint guarda el estado y los registros procesados; borrar sus archivos o cambiar de ubicación hace que la próxima corrida empiece de cero; contiene los offsets de cada micro-batch, para retomar sin reprocesar, y el registro de micro-batches confirmados.'
  - source: gcp-pubsub-docs
    url: https://cloud.google.com/pubsub/pricing
    accessed: '2026-10-20'
    page_title: Pub/Sub pricing
    note: 'Pub/Sub pricing (consultada el 2026-10-20): se cobran el throughput de publicación y entrega, la transferencia de datos entre regiones y el almacenamiento de mensajes retenidos, por uso (bytes publicados, entregados o guardados); «There are no zone data transfer fees for Pub/Sub usage». Los montos no se copian.'
  - source: aws-kinesis-docs
    url: https://aws.amazon.com/kinesis/data-streams/pricing/
    accessed: '2026-10-12'
    page_title: Amazon Kinesis Data Streams pricing
    note: 'Amazon Kinesis Data Streams pricing: precios por modo de capacidad, por datos escritos y leídos, retención extendida y enhanced fan-out. Los montos no se copian.'
relations:
  - {type: USES, target: streaming-ingestion, note: "La entrada continua desde el broker."}
  - {type: USES, target: watermarks, note: "Cuándo se cierra una ventana."}
  - {type: USES, target: windowing, note: "Agregados por tiempo de evento."}
  - {type: USES, target: dead-letter-queue, note: "Lo ilegible sale del camino principal."}
  - {type: DEPENDS_ON, target: checkpoints, note: "Retomar sin perder ni duplicar."}
  - {type: RELATED_TO, target: exactly-once-semantics, note: "Depende de la fuente y del sink."}
  - {type: RELATED_TO, target: idempotency, note: "El upsert del destino absorbe los reintentos."}
  - {type: RELATED_TO, target: spark-structured-streaming, note: "El motor del ejemplo."}
  - {type: RELATED_TO, target: dataflow-streaming-pipelines, note: "El mismo pipeline en GCP."}
  - {type: RELATED_TO, target: batch-pipeline-architecture, note: "La versión por lotes."}
  - {type: RELATED_TO, target: real-time-analytics-architecture, note: "Lo que consume la salida con baja latencia."}
  - {type: RELATED_TO, target: data-contracts, note: "El esquema del evento acordado con los productores."}
  - {type: RELATED_TO, target: event-driven-architecture, note: "Reaccionar a eventos de negocio con el mismo broker."}
  - {type: RELATED_TO, target: kappa-architecture, note: "Un solo camino streaming, también para reprocesar."}
created_at: 2026-11-02
updated_at: 2026-11-02
last_verified: 2026-11-02
verification_status: review_required
---

## 1. Resumen

Un pipeline streaming lee eventos de un broker en forma continua, separa lo inválido en una DLQ, agrega por **tiempo de evento** en ventanas que se cierran con una **watermark** y escribe cada resultado en el destino de forma **idempotente**. Un **checkpoint** guarda hasta dónde se leyó y el estado de las ventanas abiertas, así un reinicio retoma sin perder ni duplicar.

Conviene cuando el negocio necesita resultados en segundos o minutos y los eventos llegan sin parar. No conviene si un resultado por hora alcanza: un `batch-pipeline-architecture` es más simple de operar. Tampoco reemplaza a la consulta de baja latencia, que es otra pieza (`real-time-analytics-architecture`).

## 2. Escenario y requerimientos

Escenario: las cajas de una cadena publican cada pago al momento. Operaciones quiere ventas por tienda cada 5 minutos; algunos pagos llegan tarde o mal formados.

| Requerimiento | Valor del escenario |
|---|---|
| Latencia | Ventana de 5 minutos visible pocos minutos después de cerrar |
| Tiempo | Por hora del pago (tiempo de evento), no por hora de llegada |
| Tardíos | Se aceptan hasta 5 minutos de atraso; después se descartan |
| Inválidos | No detienen el pipeline; quedan en una DLQ para revisar |
| Fallas | Un reinicio no pierde ni duplica ventanas |

## 3. Vista de contexto

```mermaid
flowchart TB
  C["Cajas"] --> B["Broker"]
  B --> V["Validación"]
  V --> W["Ventanas y watermark"]
  V --> D["DLQ"]
  W --> S["Sink idempotente"]
  S --> O["Tablero de operaciones"]
```

## 4. Componentes

| Componente | Responsabilidad | Por qué está |
|---|---|---|
| Broker | Guarda los eventos con retención y los entrega a los consumidores | Desacopla cajas y pipeline; permite releer |
| Validación | Parsea y separa lo ilegible o incompleto | Un evento malo no detiene el resto |
| DLQ | Guarda los rechazados con el mensaje original | Se revisan y se pueden reinyectar |
| Ventanas y watermark | Agregan por tiempo de evento y deciden cuándo cerrar | Resultados correctos aunque lleguen desordenados |
| Checkpoint | Offsets leídos y estado de las ventanas abiertas | Reinicio sin pérdida ni duplicados |
| Sink idempotente | Upsert por (ventana, tienda) | Un micro-batch repetido no duplica |

## 5. Vista de datos

```mermaid
flowchart TB
  E["Evento: tienda,<br/>event_time, monto"] --> V{"Validación: ¿parsea<br/>y tiene monto?"}
  V -- "no" --> D["DLQ: mensaje original"]
  V -- "sí" --> W["Ventanas y watermark:<br/>5 min por event_time"]
  W --> M{"¿Watermark pasó<br/>el fin?"}
  M -- "sí" --> U["Sink idempotente:<br/>upsert (ventana, tienda)"]
  M -- "no" --> K["Checkpoint: estado<br/>de la ventana"]
```

Los datos no llegan garantizados en orden; la watermark es el umbral en el que se espera que hayan llegado todos los datos de una ventana, y lo que llega después con un timestamp dentro de ella es dato tardío (*Streaming pipelines*). En Spark, con `withWatermark` el motor acepta tardíos mientras el máximo tiempo de evento visto menos el umbral no supere el fin de la ventana, y en modo append emite cada ventana una vez, cuando la watermark la pasa (*Structured Streaming Programming Guide*).

## 6. Vista de despliegue

```mermaid
flowchart TB
  subgraph ING["Ingesta administrada"]
    B["Broker: topic<br/>con retención"]
  end
  subgraph PROC["Job streaming con autoescalado"]
    J["Validación y ventanas"]
    C["Checkpoint"]
  end
  B --> J
  J --> C
  J --> S["Sink idempotente<br/>(destino analítico)"]
  J --> D["DLQ"]
```

El job corre siempre; los checkpoints viven en almacenamiento durable fuera del job. Borrar los archivos del checkpoint o cambiar su ubicación hace que la siguiente corrida empiece de cero (*Structured Streaming checkpoints*).

## 7. Seguridad y gobierno

- Una identidad por pipeline, con permiso de lectura sobre su suscripción o grupo y de escritura solo sobre su destino y su DLQ.
- La DLQ guarda el mensaje original: tiene los mismos datos personales que la fuente y la misma retención y control de acceso.
- El esquema del evento es un contrato con los productores (`data-contracts`): un cambio incompatible llena la DLQ en vez de romper el destino.

## 8. Escalabilidad, observabilidad y operación

- **Escala:** el paralelismo lo limitan las particiones o shards del broker; en Kinesis, cada shard admite hasta 1 MB/s y 1.000 registros por segundo de escritura (*Amazon Kinesis Data Streams Terminology and concepts*).
- **Qué se mide:** lag del consumidor (offsets pendientes), antigüedad de la watermark frente al reloj, mensajes por minuto en la DLQ y ventanas emitidas por minuto.
- **Cambios de código:** en Dataflow, un job de reemplazo transfiere el estado intermedio si pasa el chequeo de compatibilidad (*Update an existing pipeline*). Para detenerlo, drain termina lo que está en buffer y deja de ingerir; cancel descarta lo que está en buffer (*Stop a running Dataflow pipeline*).
- **Runbook:** DLQ que crece → revisar el último cambio del productor, corregir y reinyectar; lag que crece → más workers o más particiones; watermark detenida → una partición sin datos o un productor con reloj atrasado.

## 9. Costos

El job corre las 24 horas, así que el costo base es el cómputo encendido aunque haya poco tráfico; el autoescalado lo ajusta. El broker se paga por throughput y por retención: Pub/Sub cobra throughput de publicación y entrega y el almacenamiento de mensajes retenidos (*Pub/Sub pricing*), y Kinesis Data Streams cobra por modo de capacidad, datos escritos y leídos, retención extendida y enhanced fan-out (*Amazon Kinesis Data Streams pricing*). En Dataflow, el modo at-least-once puede bajar mucho el costo y la latencia si la carga tolera duplicados (*Set the pipeline streaming mode*). Los montos no se copian: se calculan con la calculadora de cada nube.

## 10. Código y configuración

```python
# Python 3.12 y PySpark 4.2.0 en modo local (ejecutado en la CI con Java 17): pipeline streaming de punta a punta.
# Los archivos JSON hacen de broker. Una consulta valida y manda lo ilegible o sin monto a una DLQ; otra suma por
# tienda en ventanas de 5 minutos por tiempo de evento, con watermark de 5 minutos, y escribe cada ventana cerrada con
# un upsert en la tabla de servicio (SQLite), así un micro-batch repetido tras una caída no duplica. La segunda corrida
# retoma desde los checkpoints; el pago de las 10:03 llega después de cerrada su ventana y se descarta.
import json
import os
import sqlite3
import sys
import tempfile
from pathlib import Path

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

base = Path(sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp())
src, dlq, serving = base / "pagos", base / "dlq", base / "serving.db"
src.mkdir(parents=True, exist_ok=True)
with sqlite3.connect(serving) as db:
    db.execute("CREATE TABLE IF NOT EXISTS ventas (ventana TEXT, tienda TEXT, total REAL, PRIMARY KEY (ventana, tienda))")


def land(name: str, lines: list[str]) -> None:
    (src / name).write_text("\n".join(lines), encoding="utf-8")
    stamp = 1_800_000_000 + len(list(src.iterdir()))   # la fuente procesa por fecha de modificación
    os.utime(src / name, (stamp, stamp))


def pay(store: str, hhmm: str, amount: float | None) -> str:
    return json.dumps({"tienda": store, "event_time": f"2026-11-02 {hhmm}:00", "monto": amount})


def upsert(batch: DataFrame, batch_id: int) -> None:   # foreachBatch: idempotente por (ventana, tienda)
    rows = [(f"{r.ventana:%H:%M}", r.tienda, r.total) for r in batch.collect()]
    with sqlite3.connect(serving) as db:
        db.executemany("INSERT INTO ventas VALUES (?, ?, ?) ON CONFLICT (ventana, tienda) DO UPDATE SET "
                       "total = excluded.total", rows)


spark = (SparkSession.builder.master("local[2]").config("spark.sql.shuffle.partitions", "2")
         .config("spark.ui.showConsoleProgress", "false").getOrCreate())
spark.sparkContext.setLogLevel("ERROR")


def run() -> None:
    raw = spark.readStream.option("maxFilesPerTrigger", 1).text(str(src))
    parsed = raw.withColumn("p", F.from_json("value", "tienda STRING, event_time TIMESTAMP, monto DOUBLE"))
    valid = F.col("p.monto").isNotNull() & F.col("p.event_time").isNotNull()
    to_dlq = (parsed.where(~valid | F.col("p").isNull()).select("value").writeStream.format("text")
              .option("path", str(dlq)).option("checkpointLocation", str(base / "chk-dlq"))
              .trigger(availableNow=True).start())
    windows = (parsed.where(valid).select("p.*").withWatermark("event_time", "5 minutes")
               .groupBy("tienda", F.window("event_time", "5 minutes")).agg(F.sum("monto").alias("total"))
               .select(F.col("window.start").alias("ventana"), "tienda", "total"))
    to_serving = (windows.writeStream.outputMode("append").foreachBatch(upsert)
                  .option("checkpointLocation", str(base / "chk-ventas")).trigger(availableNow=True).start())
    to_dlq.awaitTermination()
    to_serving.awaitTermination()
    with sqlite3.connect(serving) as db:
        closed = db.execute("SELECT COUNT(*) FROM ventas").fetchone()[0]
    print(f"ventanas cerradas en servicio: {closed}; mensajes en la DLQ: {spark.read.text(str(dlq)).count()}")


land("1.json", [pay("norte", "10:01", 30.0), pay("sur", "10:02", 12.5), "{malformado", pay("norte", "10:04", None)])
land("2.json", [pay("norte", "10:06", 20.0), pay("sur", "10:12", 5.0)])
run()
land("3.json", [pay("norte", "10:03", 99.0), pay("norte", "10:22", 7.0)])   # 10:03 llega tarde; 10:22 avanza la watermark
run()
with sqlite3.connect(serving) as db:
    for ventana, tienda, total in db.execute("SELECT * FROM ventas ORDER BY ventana, tienda"):
        print(f"{ventana} {tienda}: {total}")
spark.stop()
```

El script se **ejecuta en la CI con PySpark 4.2.0 en modo local y Java 17**. Los mensajes de arranque de Spark van a stderr; la salida es:

```text
ventanas cerradas en servicio: 2; mensajes en la DLQ: 2
ventanas cerradas en servicio: 4; mensajes en la DLQ: 2
10:00 norte: 30.0
10:00 sur: 12.5
10:05 norte: 20.0
10:10 sur: 5.0
```

La primera corrida cierra la ventana de las 10:00 (la watermark llega a 10:07) y manda a la DLQ la línea ilegible y el pago sin monto. La segunda retoma desde los checkpoints: el pago de las 10:03 llega cuando su ventana ya se emitió y no cambia `10:00 norte: 30.0`; la ventana de las 10:15 sigue abierta. El sink es `foreachBatch`, que solo garantiza at-least-once (*Use foreachBatch to write to arbitrary data sinks*): el upsert por (ventana, tienda) es lo que hace que reprocesar un micro-batch no duplique. Lo que no ejecuta: un broker real (los archivos hacen de broker; Kafka real está en `kappa-architecture` y `event-driven-architecture`) ni un job administrado en la nube.

## 11. GCP

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Broker | Pub/Sub | Entrega al menos una vez; la DLQ es un dead-letter topic, con 5 a 100 intentos de entrega y conteo aproximado (*Dead-letter topics*) |
| Procesamiento | Dataflow (Apache Beam) | Exactly-once por defecto en streaming: los registros se procesan al menos una vez y los resultados se confirman una vez; los efectos fuera del pipeline pueden repetirse (*Exactly-once in Dataflow*). No ejecutado |
| Destino | BigQuery con la Storage Write API | El default stream es at-least-once; los streams de la aplicación dan exactly-once con offsets (*Introduction to the Storage Write API (gRPC)*) |

## 12. AWS

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Broker | Kinesis Data Streams | Shards con límites por shard; retención por defecto de 24 horas, ampliable (*Amazon Kinesis Data Streams Terminology and concepts*) |
| Procesamiento | Managed Service for Apache Flink | Flink administrado, con escalado, checkpoints y snapshots a cargo del servicio (*What is Amazon Managed Service for Apache Flink?*). No ejecutado |
| Entrega sin código | Amazon Data Firehose | Entrega a S3, Redshift, OpenSearch o Iceberg acumulando por tamaño o intervalo; no hace ventanas por tiempo de evento (*What is Amazon Data Firehose?*) |

## 13. Azure

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Broker | Event Hubs | Particiones con offsets; el checkpoint lo guarda el consumidor (*Event Hubs features and terminology*); Capture copia el stream a Blob Storage o ADLS en Avro (*Capture events through Azure Event Hubs…*) |
| Procesamiento | Structured Streaming en Azure Databricks | El mismo motor del §10; `foreachBatch` da at-least-once y el `batchId` sirve para deduplicar (*Use foreachBatch to write to arbitrary data sinks*). No ejecutado |

## 14. Riesgos y modos de falla

| Riesgo | Cómo se detecta | Cómo se recupera |
|---|---|---|
| Checkpoint borrado o movido | El job reprocesa desde el inicio o desde el final | Checkpoint en almacenamiento durable y versionado con el código |
| Watermark que no avanza | Ventanas que no se emiten | Revisar particiones vacías y relojes de productores |
| DLQ que nadie mira | Crece sin alertas | Alerta por mensajes por minuto en la DLQ |
| Sink no idempotente | Ventanas duplicadas tras un reinicio | Upsert por clave o escritura transaccional |
| Umbral de tardíos muy corto | Totales que no cuadran con el batch del día | Medir el atraso real y ajustar la watermark |

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Agrupar por hora de llegada | Un pago tardío cae en la ventana equivocada |
| Fallar el job ante un evento malo | Todo el pipeline se detiene por un mensaje |
| Asumir exactly-once de punta a punta | Duplicados en un sink que no participa del checkpoint |
| Cambiar la consulta sin revisar el checkpoint | El reinicio falla o pierde el estado |

## 16. Trade-offs y alternativas

| Opción | Gana | Cuesta |
|---|---|---|
| Pipeline streaming | Resultados en minutos | Job siempre encendido, estado y watermarks que operar |
| Micro-batch frecuente (`batch-pipeline-architecture`) | Operación simple | Latencia del intervalo |
| Entrega sin código (Firehose, export de Pub/Sub) | Sin job propio | Sin ventanas por tiempo de evento ni lógica |

## 17. Conceptos relacionados

- `streaming-ingestion`: la entrada continua.
- `watermarks` y `windowing`: cuándo cerrar y cómo agrupar.
- `dead-letter-queue`: lo inválido aparte.
- `checkpoints`: retomar sin pérdida.
- `exactly-once-semantics` e `idempotency`: qué garantiza cada pieza.
- `spark-structured-streaming` y `dataflow-streaming-pipelines`: los motores.
- `batch-pipeline-architecture`: la versión por lotes.
- `real-time-analytics-architecture`: la consulta de baja latencia.
- `kappa-architecture`: un solo camino streaming, también para reprocesar.
- `data-contracts`: el esquema acordado con los productores.
- `event-driven-architecture`: reaccionar a eventos de negocio.

## 18. Evolución

Se llega desde un `batch-pipeline-architecture` cuando el intervalo del lote ya no alcanza. Si además hay que recalcular historia con la misma lógica, evoluciona a `kappa-architecture`; si la salida se consulta con baja latencia, se le suma `real-time-analytics-architecture`. La señal para no adoptarlo: nadie mira el resultado antes del día siguiente.

## 19. Laboratorio relacionado

F4: laboratorio en la nube con un topic, un job streaming con ventanas y DLQ, una caída provocada y un reinicio desde el checkpoint, con `terraform apply` en sandbox, costo estimado con fuente, teardown verificado y evidencia de la corrida.

## 20. Fuentes

- Google Cloud: *Streaming pipelines*; *Set the pipeline streaming mode*; *Exactly-once in Dataflow*; *Update an existing pipeline*; *Stop a running Dataflow pipeline*; *Dead-letter topics*; *Introduction to the Storage Write API (gRPC)*; *Pub/Sub pricing*.
- Apache Spark 4.2.0: *Structured Streaming Programming Guide* (Getting Started; APIs on DataFrames and Datasets).
- AWS: *Amazon Kinesis Data Streams Terminology and concepts*; *What is Amazon Managed Service for Apache Flink?*; *What is Amazon Data Firehose?*; *Amazon Kinesis Data Streams pricing*.
- Microsoft Learn: *Event Hubs features and terminology*; *Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage*; *Use foreachBatch to write to arbitrary data sinks*; *Structured Streaming checkpoints*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-11-02: fichas de origen de cada cita revisadas; las páginas se consultaron en las fechas de `sources`. `review_required` hasta la revisión.

## 22. Historial de cambios importantes

- 2026-11-02: creación (lote 07b, ADR-028).
- 2026-11-02: las tres vistas usan los nombres del §4 (criterio de la revisión de 07a).

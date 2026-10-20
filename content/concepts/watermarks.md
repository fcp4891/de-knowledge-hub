---
id: concept:watermarks
slug: watermarks
type: concept
title: Watermarks
description: "Qué es una watermark en streaming según Spark 4.2.0 y Flink 2.3: la marca de cuánto avanzó el tiempo de evento, que en Spark es el máximo tiempo visto menos un umbral. Hasta ella se aceptan datos tardíos; después, el motor puede descartarlos y liberar estado. Spark garantiza no descartar lo que llega dentro del umbral, no lo contrario. Ejemplo ejecutado con PySpark en la CI. Watermarks en Dataflow, Managed Service for Apache Flink y Azure Databricks, con sus diferencias."
domain: streaming
subdomain: time-and-state
category: streaming
classification: core
level: advanced
importance: high
cloud: [agnostic]
technologies: [apache-spark, apache-flink, gcp-dataflow, azure-databricks]
tags: [watermarks, late-data, event-time, state-cleanup, streaming]
related_topics: [event-time-vs-processing-time]
sources:
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/streaming/apis-on-dataframes-and-datasets.html
    accessed: 2026-10-19
    page_title: "Structured Streaming Programming Guide"
    note: "Structured Streaming Programming Guide, APIs on DataFrames and Datasets (Spark 4.2.0): con withWatermark, para una ventana que termina en T el motor mantiene estado y acepta datos tardíos hasta que (max event time seen by the engine - late threshold > T); en modo append, el resultado final de una ventana se agrega solo después de que la watermark la pasa. La watermark limpia estado solo en modo append o update, con la agregación sobre la columna de tiempo de evento o una ventana sobre ella. «A watermark delay ... of “2 hours” guarantees that the engine will never drop any data that is less than 2 hours delayed»; la garantía es estricta en una sola dirección: lo que llega con más atraso no tiene garantizado ser descartado."
  - source: apache-flink-docs
    url: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/concepts/time/
    accessed: 2026-10-19
    page_title: "Timely Stream Processing"
    note: "Timely Stream Processing (Flink 2.3): los programas en tiempo de evento definen cómo generar watermarks, «the mechanism that signals progress in event time»."
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/concepts/streaming-pipelines
    accessed: 2026-10-11
    page_title: "Streaming pipelines"
    note: "Streaming pipelines: las funciones de ventana dividen colecciones no acotadas por el timestamp de cada elemento; ventanas tumbling (fixed en Beam), hopping (sliding en Beam, pueden solaparse) y de sesión. El watermark es el umbral que indica cuándo Dataflow espera que hayan llegado todos los datos de una ventana; si pasó el final de la ventana y llegan datos con timestamp dentro de ella, son datos tardíos. Los datos no llegan garantizados en orden ni a intervalos predecibles; la fuente determina el watermark; Beam permite aceptar datos tardíos. Los triggers deciden cuándo emitir resultados; por defecto, cuando el watermark pasa el final de la ventana."
  - source: aws-managed-flink-docs
    url: https://docs.aws.amazon.com/managed-flink/latest/java/how-time.html
    accessed: 2026-09-30
    page_title: "Track events in Managed Service for Apache Flink using the DataStream API"
    note: "Managed Service for Apache Flink rastrea processing time, event time (cuándo ocurrió el evento en el dispositivo productor) e ingestion time; la generación de watermarks remite a la documentación de Apache Flink."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/watermarks
    accessed: 2026-10-19
    page_title: "Apply watermarks to control data processing thresholds"
    note: "Apply watermarks to control data processing thresholds (Azure Databricks): con una watermark de 10 minutos y ventanas de 5, el estado de cada conteo se mantiene hasta que el fin de la ventana queda 10 minutos más viejo que el último event_time observado."
relations:
  - type: DEPENDS_ON
    target: event-time-vs-processing-time
    note: La watermark mide el avance del tiempo de evento.
  - type: RELATED_TO
    target: windowing
    note: Decide cuándo se cierra una ventana.
  - type: RELATED_TO
    target: late-arriving-data
    note: Lo que llega después de la watermark.
  - type: RELATED_TO
    target: stateful-stream-processing
    note: La watermark libera el estado de lo ya cerrado.
  - type: RELATED_TO
    target: dataflow-streaming-pipelines
    note: Watermarks en Dataflow.
  - type: RELATED_TO
    target: incremental-pipelines
    note: Otra idea con el mismo nombre; allí es la marca de progreso de una carga incremental.
  - type: RELATED_TO
    target: batch-vs-streaming
    note: En streaming hay que decidir cuándo cerrar un período.
created_at: 2026-10-19
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: verified
---

## 1. Resumen

En streaming los eventos llegan tarde y desordenados, así que el motor necesita decidir cuándo una ventana está completa. La **watermark** es esa marca: según Flink, «the mechanism that signals progress in event time». En Spark se define con un umbral: la watermark es el máximo tiempo de evento visto menos ese umbral.

Con la watermark:

- **se aceptan los tardíos** que quedan dentro del umbral;
- **se cierran las ventanas** que la watermark ya pasó, y se emite su resultado final;
- **se libera el estado** de esas ventanas.

La garantía de Spark es de un solo lado: un umbral de 2 horas «guarantees that the engine will never drop any data that is less than 2 hours delayed»; lo que llega con más atraso puede descartarse o no.

En una carga incremental se llama «watermark» a otra cosa: la marca de hasta dónde se cargó (ver `incremental-pipelines`).

## 2. Qué es

- **Umbral (delay):** cuánto atraso se tolera, por ejemplo `withWatermark("event_time", "10 minutes")`.
- **Watermark:** máximo tiempo de evento visto menos el umbral.
- **Ventana cerrada:** una cuyo fin quedó detrás de la watermark.
- **Dato tardío descartable:** uno cuyo tiempo de evento cae en una ventana ya cerrada.
- **Modo de salida:** en `append`, una ventana se emite una vez, al cerrarse; en `update`, se emite cada vez que cambia.

## 3. Problema que resuelve

Un conteo por ventanas de 10 minutos sin watermark tiene que guardar todas las ventanas para siempre, porque podría llegar un evento viejo. El estado crece sin límite y nunca hay un resultado final. Con una watermark de 10 minutos, el motor sabe cuándo dar una ventana por terminada, emite su resultado y borra su estado.

## 4. Cómo funciona

1. En cada micro-batch, el motor mira el máximo tiempo de evento.
2. Calcula la watermark: ese máximo menos el umbral.
3. Los eventos de ventanas que siguen abiertas se agregan, aunque lleguen tarde.
4. Las ventanas cuyo fin quedó detrás de la watermark se cierran: en `append` se emiten y su estado se borra.
5. Un evento que llega para una ventana ya cerrada puede descartarse.

## 5. Cuándo utilizarlo

- Toda agregación por tiempo de evento en streaming.
- Joins entre streams y deduplicación, para limitar el estado.
- Con un umbral que cubra el desfase que se mide en los orígenes.

## 6. Cuándo no utilizarlo

- Un umbral de cero con datos que llegan desordenados: se pierden eventos.
- Un umbral enorme «por las dudas»: el estado y la latencia crecen.
- Contar con que todo lo que llega tarde se descarta: Spark no lo garantiza.

## 7. Ejemplo sencillo

Ventanas de 10 minutos y watermark de 10 minutos, en cuatro micro-batches. El primero trae eventos de 10:01, 10:04 y 10:12: la watermark queda en 10:02. El segundo trae uno de 10:07, que entra en la ventana de las 10:00 porque llega dentro del umbral, y uno de 10:26, que lleva la watermark a 10:16. La ventana de las 10:00 se emite con 3 eventos. El cuarto micro-batch trae un evento de 10:02 cuando esa ventana ya se emitió: no aparece en ningún resultado.

## 8. Ejemplo de producción

Ventas por hora con datos de tiendas:

- el desfase medido de las tiendas llega a 40 minutos; la watermark es de 1 hora;
- modo `append` hacia la tabla de agregados, que recibe cada hora una sola vez;
- los eventos más tardíos se guardan aparte con su tiempo de ingesta, para corregir en batch;
- una métrica de eventos descartados por tienda.

## 9. Arquitectura

```mermaid
flowchart LR
  B1["batch 1: máx 10:12<br/>watermark 10:02"] --> B2["batch 2: 10:07 entra<br/>máx 10:26 → watermark 10:16"]
  B2 --> C["ventana 10:00 emitida<br/>con 3 eventos"]
  C --> B4["batch 4: 10:02 llega<br/>después de emitida la ventana"]
```

## 10. Código

```python
# Python 3.12 y PySpark 4.2.0 en modo local (ejecutado en la CI con Java 17): conteo por ventanas de 10 minutos por
# tiempo de evento, con watermark de 10 minutos y modo append. Cada archivo es un micro-batch (maxFilesPerTrigger=1),
# en el orden de su fecha de modificación. Un evento tardío dentro del umbral se cuenta; una ventana se emite una sola
# vez, cuando la watermark la pasa; un evento que llega después de emitida su ventana no cambia ese resultado.
import json
import os
import sys
import tempfile
from pathlib import Path

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F

BATCHES = [   # eventos de cada archivo, por su tiempo de evento
    ["10:01", "10:04", "10:12"],
    ["10:07", "10:26"],            # 10:07 llega tarde, pero dentro del umbral
    ["10:31"],
    ["10:02", "10:45"],            # 10:02 llega cuando la ventana de las 10:00 ya se emitió
]

base = Path(sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp())
src = base / "eventos"
src.mkdir(parents=True, exist_ok=True)
for i, times in enumerate(BATCHES):
    path = src / f"{i}.json"
    path.write_text("\n".join(json.dumps({"event_time": f"2026-10-19 {t}:00"}) for t in times), encoding="utf-8")
    os.utime(path, (1_800_000_000 + i, 1_800_000_000 + i))   # la fuente procesa por fecha de modificación

spark = (SparkSession.builder.master("local[2]").config("spark.sql.shuffle.partitions", "2")
         .config("spark.ui.showConsoleProgress", "false").getOrCreate())
spark.sparkContext.setLogLevel("ERROR")
events = (spark.readStream.schema("event_time TIMESTAMP").option("maxFilesPerTrigger", 1).json(str(src))
          .withWatermark("event_time", "10 minutes"))
counts = events.groupBy(F.window("event_time", "10 minutes")).count()

emitted: list[tuple[str, int]] = []


def collect(batch: DataFrame, _batch_id: int) -> None:
    for row in batch.orderBy("window").collect():
        emitted.append((row["window"]["start"].strftime("%H:%M"), row["count"]))


query = (counts.writeStream.outputMode("append").foreachBatch(collect)
         .option("checkpointLocation", str(base / "checkpoint")).trigger(availableNow=True).start())
query.awaitTermination()
for start, n in emitted:
    print(f"ventana {start} emitida con {n} eventos")
spark.stop()
```

El script se **ejecuta en la CI con PySpark 4.2.0 en modo local y Java 17**; cada archivo es un micro-batch (`maxFilesPerTrigger=1`), en el orden de su fecha de modificación, que el script fija porque la fuente de archivos procesa en ese orden. Imprime `ventana 10:00 emitida con 3 eventos` (entra el de 10:07), `ventana 10:10 emitida con 1 eventos` y `ventana 10:20 emitida con 1 eventos`; cada ventana se emite una sola vez. El evento de 10:02 del último archivo no cambia la ventana ya emitida. Spark solo garantiza no descartar lo que está dentro del umbral: un evento más atrasado que llega antes de que su ventana se emita todavía puede contarse, así que el ejemplo no lo usa como prueba de descarte.

## 11. GCP

En GCP, **Dataflow** usa watermarks del modelo de Beam. Según *Streaming pipelines* (no ejecutado):

| | Spark Structured Streaming | Dataflow |
|---|---|---|
| Quién define la watermark | El umbral de `withWatermark` sobre el máximo tiempo visto | La fuente determina la watermark |
| Datos tardíos | Se aceptan dentro del umbral; después pueden descartarse | Beam permite aceptar datos tardíos |
| Cuándo se emite | En `append`, cuando la watermark pasa la ventana | Por defecto, cuando la watermark pasa el final de la ventana; los triggers lo cambian |

## 12. AWS

En AWS, **Managed Service for Apache Flink** corre Flink. Según *Track events in Managed Service for Apache Flink using the DataStream API* y *Timely Stream Processing* (no ejecutado):

| | Spark Structured Streaming | Managed Service for Apache Flink |
|---|---|---|
| Watermarks | Umbral sobre el máximo tiempo visto | Las genera el programa; el servicio remite a la documentación de Flink |

## 13. Azure

En Azure, **Azure Databricks** corre Structured Streaming. Según *Apply watermarks to control data processing thresholds* (no ejecutado):

| | Spark Structured Streaming | Azure Databricks |
|---|---|---|
| Qué guarda | Estado de las ventanas abiertas | El estado de cada ventana, hasta que su fin queda más viejo que el último `event_time` menos el umbral |

## 14. Buenas prácticas

- Umbral a partir del desfase medido, con margen.
- `append` cuando el destino debe recibir cada ventana una sola vez.
- Guardar aparte lo que llega después de la watermark si importa.
- **Seguridad:** un origen con el reloj adelantado mueve la watermark para todos; validar timestamps futuros.
- **Observabilidad:** watermark actual, filas descartadas por tardías y tamaño del estado.
- **Costo:** un umbral más largo es más estado guardado y más memoria o disco del motor.

## 15. Errores frecuentes

- Un timestamp futuro que adelanta la watermark y hace descartar datos buenos.
- `withWatermark` sobre una columna distinta de la de la agregación: no limpia estado.
- Modo `complete` con watermark esperando que libere estado: no lo hace.
- Confundir la watermark de streaming con la marca de una carga incremental.

## 16. Trade-offs

Un umbral corto da resultados antes y menos estado, y pierde más tardíos. Uno largo es más completo y más lento. La watermark convierte un stream sin fin en resultados finales, a costa de decidir qué es «demasiado tarde».

## 17. Conceptos relacionados

- `event-time-vs-processing-time`: el tiempo que mide la watermark.
- `windowing`: lo que la watermark cierra.
- `late-arriving-data`: lo que llega tarde.
- `stateful-stream-processing`: el estado que la watermark libera.
- `dataflow-streaming-pipelines`: watermarks en Dataflow.
- `incremental-pipelines`: la otra «watermark», la marca de progreso de una carga.
- `batch-vs-streaming`: cuándo cerrar un período.

## 18. Preguntas técnicas abiertas

1. ¿Qué desfase máximo tienen tus orígenes y qué umbral usarías?
2. ¿Qué haces hoy con los eventos que llegan después de cerrar un período?
3. ¿Puede un origen con el reloj mal mover tu watermark?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Spark 4.2.0: *Structured Streaming Programming Guide* (APIs on DataFrames and Datasets).
- Apache Flink 2.3: *Timely Stream Processing*.
- Google Cloud: *Streaming pipelines*.
- AWS: *Track events in Managed Service for Apache Flink using the DataStream API*.
- Microsoft Learn: *Apply watermarks to control data processing thresholds*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. Pasa a `verified`: revisión B-F3.1 del lote F3b-14b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-19: creación (lote F3b-14b).
- 2026-10-19: §7, §9 y §10: el ejemplo fija el orden de los archivos (la fuente procesa por fecha de modificación) y el evento tardío llega después de emitida su ventana; con el orden de la CI, un evento más atrasado que el umbral se había contado, como permite Spark.
- 2026-10-20: revisión B-F3.1 del lote F3b-14b aplicada (docs/reviews/cards-f3b-14b.md): sin hallazgos en esta ficha; sin cambios.
- 2026-10-20: `verification_status: verified` (sin VERIFY pendientes).

# Revisión B-F3.1 · lote F3b-14b

Rama `b/f3b-review-14b`, creada desde `origin/main` (`5004855`). El pedido es `73f040f`. Fichas: `event-time-vs-processing-time`, `windowing`, `watermarks`, `stateful-stream-processing`, `exactly-once-semantics`, `backpressure` y `spark-structured-streaming`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Exactly-once queda por componente, con la cita de cada uno, y no se ofrece como garantía de extremo a extremo. La watermark de Spark solo promete no descartar lo que llega dentro del umbral. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 492 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. El aviso es el mismo `h1` de la guía de Spark en varias URLs de 4.2.0: el primer `h1` de esas páginas es «Structured Streaming Programming Guide».

## PySpark en la CI y PyFlink

`tests/test_streaming_snippets.py` ejecuta el bloque PySpark de las siete fichas. Las frases que dicen impresas están en el test:

```
assert "por event_time: 2026-10-18 2, 2026-10-19 1" in out
assert "por arrival_time: 2026-10-18 1, 2026-10-19 2" in out
assert "tumbling: [10:00, 10:10) 3, [10:10, 10:20) 2" in out
assert out.splitlines() == ["ventana 10:00 emitida con 3 eventos", "ventana 10:10 emitida con 1 eventos", "ventana 10:20 emitida con 1 eventos"]
assert "tras 1.json: norte 100, sur 40" in out
assert "tras 2.json: norte 125, sur 50" in out
assert "sink que agrega, tras una caída y un reinicio: 6 filas para 3 pagos" in out
assert "sink idempotente por batch_id, tras una caída y un reinicio: 3 filas para 3 pagos" in out
assert "sin límite: micro-batches de [600] filas" in out
assert "maxFilesPerTrigger=2: micro-batches de [200, 200, 200] filas" in out
assert out.splitlines()[-3:] == ["09:00 norte: 50.0", "09:00 sur: 12.5", "10:00 norte: 5.0"]
```

`stateful-stream-processing` marca el bloque de PyFlink como «no ejecutado». Dataflow, Managed Flink y Databricks dicen «no ejecutado».

## Exactly-once, watermarks y backpressure

`exactly-once-semantics` abre con «no es una propiedad de un pipeline entero» y separa broker, procesador y sink. El §6 dice que no se use como promesa de extremo a extremo sin revisar el sink. Frases en las páginas, el 2026-10-20:

```
Kafka: read the fine print
Kafka: when reading, processing and writing data on Kafka topics
Spark: using replayable sources and idempotent sinks, Structured Streaming can ensure end-to-end exactly-once semantics under any failure
Flink 2.3: Flink can guarantee exactly-once state updates to user-defined state only when the source participates in the snapshotting mechanism
Flink 2.3: To guarantee end-to-end exactly-once record delivery ... the data sink needs to take part in the checkpointing mechanism
```

La frase de Spark nombra el extremo a extremo y lo condiciona a la fuente releíble y al sink idempotente. La ficha la cita así.

Watermarks, en la guía de Spark 4.2.0:

```
A watermark delay (set with withWatermark) of "2 hours" guarantees that the engine will never drop any data that is less than 2 hours delayed.
However, the guarantee is strict only in one direction. Data delayed by more than 2 hours is not guaranteed to be dropped; it may or may not get aggregated.
```

La ficha dice lo mismo y distingue esa watermark de la marca de una carga incremental. El ejemplo de la CI no usa un evento tardío como prueba de descarte.

Backpressure, en *Monitoring Back Pressure* de Flink 2.3:

```
OK : 0% <= back pressured <= 10%
LOW : 10% < back pressured <= 50%
HIGH : 50% < back pressured <= 100%
```

Las URLs de la documentación de Flink son `flink-docs-release-2.3`. Spark está en `/docs/4.2.0/`. EMR 7.14.0 incluye Spark `3.5.8-amzn-0`; la ficha lo dice y pide revisar la versión antes de copiar código.

29 URLs: los `page_title` coinciden con un `h1`. §11, §12 y §13 son tablas y nombran la página de cada lado. §14 trae Seguridad, Observabilidad y Costo. Cada `relations` está en el §17. Los precios de EMR y Databricks no copian montos.

## Diff de las fichas verified

`git diff 47ef90c..5004855` sobre las 11 fichas que recibieron enlace. Son 13 líneas de historial: cinco del lote 14a y ocho del 14b. `pubsub-delivery-semantics` y `streaming-ingestion` están en los dos. El diff solo toca `relations`, el §17 y una línea de historial por enlace.

```diff
diff --git a/content/concepts/batch-vs-streaming.md b/content/concepts/batch-vs-streaming.md
index 3b570a7..96d8a80 100644
--- a/content/concepts/batch-vs-streaming.md
+++ b/content/concepts/batch-vs-streaming.md
@@ -58,6 +58,15 @@ relations:
   - type: RELATED_TO
     target: late-arriving-data
     note: "Datos que llegan tarde."
+  - type: RELATED_TO
+    target: event-time-vs-processing-time
+    note: "Tiempo de evento frente a tiempo de procesamiento."
+  - type: RELATED_TO
+    target: windowing
+    note: "Ventanas tumbling, sliding y de sesión."
+  - type: RELATED_TO
+    target: watermarks
+    note: "Cuándo se cierra una ventana en tiempo de evento."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -170,7 +179,10 @@ El batch es más barato, más simple de operar y de reprocesar, pero tiene más
 - `change-data-capture`: convierte una base en un flujo.
 - `dead-letter-queue`, `idempotency`: requisitos del streaming confiable.
 - Con ficha: `late-arriving-data`.
-- Del blueprint, pendientes de ficha: `event-time-vs-processing-time`, `windowing`, `watermarks`, `lambda-architecture`, `kappa-architecture`.
+- `event-time-vs-processing-time`: tiempo de evento y tiempo de procesamiento.
+- `windowing`: ventanas tumbling, sliding y de sesión.
+- `watermarks`: cuándo se da por cerrada una ventana en tiempo de evento.
+- Del blueprint, pendientes de ficha: `lambda-architecture`, `kappa-architecture`.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -203,3 +215,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-06: la sección de conceptos relacionados ya no lista como pendiente de ficha a `late-arriving-data`, que ya tiene ficha.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `late-arriving-data`.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `event-time-vs-processing-time`, `windowing`, `watermarks`, que ya tienen ficha; antes figuraban como pendientes de ficha.
diff --git a/content/concepts/dataflow-streaming-pipelines.md b/content/concepts/dataflow-streaming-pipelines.md
index 40cf0ea..157f76f 100644
--- a/content/concepts/dataflow-streaming-pipelines.md
+++ b/content/concepts/dataflow-streaming-pipelines.md
@@ -61,6 +61,9 @@ relations:
   - type: RELATED_TO
     target: streaming-ingestion
     note: La ingesta continua que estos pipelines procesan.
+  - type: RELATED_TO
+    target: watermarks
+    note: "Cuándo se cierra una ventana en tiempo de evento."
 created_at: 2026-10-11
 updated_at: 2026-10-13
 last_verified: 2026-10-12
@@ -232,7 +235,8 @@ Las ventanas por tiempo de evento dan resultados correctos aunque los datos lleg
 - `pubsub-delivery-semantics`: la entrega de Pub/Sub.
 - `checkpoints`: el estado y la recuperación en streaming.
 - `late-arriving-data` y `streaming-ingestion`: datos tardíos e ingesta continua.
-- Del blueprint, pendientes de ficha: `watermarks` y `streaming-pipeline-architecture` (arquitectura de F4).
+- `watermarks`: cuándo se da por cerrada una ventana en tiempo de evento.
+- Del blueprint, pendiente de ficha: `streaming-pipeline-architecture` (arquitectura de F4).
 
 ## 18. Preguntas técnicas abiertas
 
@@ -261,3 +265,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-12: revisión B-F3.1 del lote F3b-08c aplicada (docs/reviews/cards-f3b-08c.md): filas aprobadas sin cambios en esta ficha.
 - 2026-10-12: `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `watermarks`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/dead-letter-queue.md b/content/concepts/dead-letter-queue.md
index e3633e7..130e65e 100644
--- a/content/concepts/dead-letter-queue.md
+++ b/content/concepts/dead-letter-queue.md
@@ -45,6 +45,9 @@ relations:
   - type: RELATED_TO
     target: retries
     note: "Retries."
+  - type: RELATED_TO
+    target: delivery-semantics
+    note: "At-least-once: lo que no se puede procesar va aparte."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -159,7 +162,7 @@ Resiliencia y trazabilidad del flujo, a cambio de un proceso operativo más (mon
 - `idempotency`: requisito de los reintentos y del redrive.
 - `batch-vs-streaming`: la DLQ es típica del streaming.
 - Con ficha: `retries`, `replay`, `pubsub-delivery-semantics`.
-- Del blueprint, pendiente de ficha: `delivery-semantics`.
+- `delivery-semantics`: at-least-once y qué hacer con lo que no se puede procesar.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -192,3 +195,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-06: la sección de conceptos relacionados ya no lista como pendientes de ficha a `retries`, `replay`, `pubsub-delivery-semantics`, que ya tienen ficha.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `pubsub-delivery-semantics`, `replay`, `retries`.
+- 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `delivery-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/idempotency.md b/content/concepts/idempotency.md
index 95d04d0..b454182 100644
--- a/content/concepts/idempotency.md
+++ b/content/concepts/idempotency.md
@@ -74,6 +74,9 @@ relations:
   - type: RELATED_TO
     target: retries
     note: "Retries."
+  - type: RELATED_TO
+    target: delivery-semantics
+    note: "At-least-once necesita un destino idempotente."
 created_at: 2026-09-28
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -194,7 +197,7 @@ La idempotencia cuesta: más almacenamiento (staging, identificadores), `MERGE`
 - `change-data-capture`: el CDC reenvía cambios; el destino debe tolerarlo.
 - `dead-letter-queue`: complemento de los reintentos para mensajes que nunca se procesan.
 - Con ficha: `retries`, `backfill`, `replay`.
-- Del blueprint, pendiente de ficha: `delivery-semantics`.
+- `delivery-semantics`: at-least-once, que obliga a un destino idempotente.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -229,3 +232,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-06: la sección de conceptos relacionados ya no lista como pendientes de ficha a `retries`, `backfill`, `replay`, que ya tienen ficha.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `backfill`, `replay`, `retries`.
+- 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `delivery-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/incremental-pipelines.md b/content/concepts/incremental-pipelines.md
index ce2f713..41aecb8 100644
--- a/content/concepts/incremental-pipelines.md
+++ b/content/concepts/incremental-pipelines.md
@@ -75,6 +75,9 @@ relations:
   - type: RELATED_TO
     target: checkpoints
     note: "Guardar hasta dónde se procesó para reanudar sin repetir."
+  - type: RELATED_TO
+    target: watermarks
+    note: "Otra idea con el mismo nombre: la watermark de streaming, no la marca de progreso de esta ficha."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -241,7 +244,8 @@ El estado por intervalo es simple y repetible, pero requiere que el origen se pu
 - `change-data-capture`: fuente de deltas completos, incluidos borrados.
 - `backfill`: reejecutar intervalos históricos.
 - `checkpoints`: guardar hasta dónde se procesó para reanudar sin repetir.
-- Del blueprint, pendientes de ficha: `watermarks` y `full-refresh`.
+- `watermarks`: la watermark de streaming, distinta de la marca de progreso de una carga incremental.
+- Del blueprint, pendiente de ficha: `full-refresh`.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -274,3 +278,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-01: §10 alineada con el snippet `bigquery-incremental-merge-watermark`: `CREATE OR REPLACE TEMP TABLE` (revisión B-F3.2 de snippets).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `checkpoints`; el §17 enlaza `checkpoints`, que ya tienen ficha.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `watermarks`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/late-arriving-data.md b/content/concepts/late-arriving-data.md
index 1a85da4..1bc4721 100644
--- a/content/concepts/late-arriving-data.md
+++ b/content/concepts/late-arriving-data.md
@@ -48,6 +48,15 @@ relations:
   - type: DEPENDS_ON
     target: idempotency
     note: Reprocesar un período para incluir datos tardíos debe ser idempotente.
+  - type: RELATED_TO
+    target: event-time-vs-processing-time
+    note: "Tiempo de evento frente a tiempo de procesamiento."
+  - type: RELATED_TO
+    target: watermarks
+    note: "Cuándo se cierra una ventana en tiempo de evento."
+  - type: RELATED_TO
+    target: windowing
+    note: "Ventanas tumbling, sliding y de sesión."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -174,7 +183,9 @@ Esperar más aumenta la completitud y retrasa los resultados. Aceptar correccion
 - `backfill`: reproceso de períodos afectados.
 - `partitioning`: la partición por fecha de evento define dónde cae el dato tardío.
 - `idempotency`: requisito para reprocesar sin duplicar.
-- Del blueprint, pendientes de ficha: `event-time-vs-processing-time`, `watermarks`, `windowing`.
+- `event-time-vs-processing-time`: tiempo de evento y tiempo de procesamiento.
+- `watermarks`: cuándo se da por cerrada una ventana en tiempo de evento.
+- `windowing`: ventanas tumbling, sliding y de sesión.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -203,3 +214,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-09-30: creación (lote 2 de F3).
 - 2026-09-30: `verification_status: verified` (revisión B-F3.1 del lote 2 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `event-time-vs-processing-time`, `watermarks`, `windowing`, que ya tienen ficha; antes figuraban como pendientes de ficha.
diff --git a/content/concepts/pubsub-delivery-semantics.md b/content/concepts/pubsub-delivery-semantics.md
index 2c7f254..a0dd425 100644
--- a/content/concepts/pubsub-delivery-semantics.md
+++ b/content/concepts/pubsub-delivery-semantics.md
@@ -108,6 +108,15 @@ relations:
   - type: RELATED_TO
     target: replay
     note: Seek permite reentregar mensajes desde un snapshot o un timestamp.
+  - type: RELATED_TO
+    target: delivery-semantics
+    note: "At-most-once y at-least-once en general."
+  - type: RELATED_TO
+    target: event-ordering
+    note: "El orden por clave en otros brokers."
+  - type: RELATED_TO
+    target: exactly-once-semantics
+    note: "Exactly-once por componente: broker, procesador y sink."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-10-01
@@ -275,7 +284,9 @@ At-least-once es simple y de menor latencia, pero exige idempotencia. Exactly-on
 - `dead-letter-queue`: el límite de intentos.
 - `retries`: la política de reentrega.
 - `replay`: seek a un snapshot o a un timestamp.
-- Del blueprint, pendientes de ficha: `delivery-semantics`, `exactly-once-semantics`, `event-ordering`.
+- `delivery-semantics`: at-most-once y at-least-once, más allá de Pub/Sub.
+- `event-ordering`: el orden por clave en Kafka, Kinesis y Event Hubs.
+- `exactly-once-semantics`: exactly-once por componente, con su alcance.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -307,3 +318,5 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-09-30: `verification_status: verified` (revisión B-F3.1 del lote 2 aplicada; sin VERIFY pendientes).
 - 2026-10-01: §10 reemplazada por un consumidor real de Pub/Sub (google-cloud-pubsub, streaming pull) con upsert idempotente en PostgreSQL (psycopg 3) y requisitos exactos; antes era un esquema que llamaba a `parse` y `upsert_customer` sin definirlas.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `delivery-semantics`, `event-ordering`, que ya tienen ficha; antes figuraban como pendientes de ficha.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `exactly-once-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/replay.md b/content/concepts/replay.md
index a885a8c..f21911a 100644
--- a/content/concepts/replay.md
+++ b/content/concepts/replay.md
@@ -54,6 +54,9 @@ relations:
   - type: RELATED_TO
     target: failure-recovery
     note: "Cómo se combinan reintentos, checkpoints, DLQ, replay y backfill para volver a un estado correcto."
+  - type: RELATED_TO
+    target: offsets
+    note: "En Kafka, el replay se hace reiniciando el offset del grupo."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -170,7 +173,7 @@ Más retención da más margen de recuperación, a cambio de costo de almacenami
 - `pubsub-delivery-semantics`: seek, retención y reentrega en Pub/Sub.
 - `checkpoints`: la posición desde la que se reanuda o se vuelve atrás.
 - `failure-recovery`: cómo se combinan reintentos, checkpoints, DLQ, replay y backfill para volver a un estado correcto.
-- Del blueprint, pendiente de ficha: `offsets`.
+- `offsets`: reiniciar el offset del grupo para volver a leer.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -200,3 +203,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-09-30: `verification_status: verified` (revisión B-F3.1 del lote 2 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `checkpoints`, `failure-recovery`; el §17 enlaza `checkpoints`, `failure-recovery`, que ya tienen ficha.
+- 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `offsets`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/retries.md b/content/concepts/retries.md
index eb88756..6f040dc 100644
--- a/content/concepts/retries.md
+++ b/content/concepts/retries.md
@@ -50,6 +50,9 @@ relations:
   - type: RELATED_TO
     target: python-error-handling-and-retries
     note: "Manejo de errores y reintentos en Python."
+  - type: RELATED_TO
+    target: exactly-once-semantics
+    note: "Exactly-once por componente: broker, procesador y sink."
 created_at: 2026-09-30
 updated_at: 2026-10-13
 last_verified: 2026-09-30
@@ -181,7 +184,7 @@ Más intentos y esperas más largas aumentan la probabilidad de éxito, a cambio
 - `pubsub-delivery-semantics`: reentrega y política de reintento en Pub/Sub.
 - Con ficha: `python-error-handling-and-retries`.
 - `failure-recovery`: cómo se combinan reintentos, checkpoints, DLQ, replay y backfill para volver a un estado correcto.
-- Del blueprint, pendiente de ficha: `exactly-once-semantics`.
+- `exactly-once-semantics`: exactly-once por componente, con su alcance.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -213,3 +216,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-11: §17 enlaza `failure-recovery`, que ya tiene ficha (lote F3b-05a); antes figuraba como pendiente de ficha.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `failure-recovery`, `python-error-handling-and-retries`.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `exactly-once-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/sql-date-functions.md b/content/concepts/sql-date-functions.md
index b1d8c29..2c6385a 100644
--- a/content/concepts/sql-date-functions.md
+++ b/content/concepts/sql-date-functions.md
@@ -73,6 +73,9 @@ relations:
   - type: RELATED_TO
     target: partition-pruning
     note: "Particionar por fecha."
+  - type: RELATED_TO
+    target: event-time-vs-processing-time
+    note: "Tiempo de evento frente a tiempo de procesamiento."
 created_at: 2026-10-05
 updated_at: 2026-10-13
 last_verified: 2026-10-07
@@ -209,7 +212,7 @@ Guardar solo UTC simplifica la integración entre sistemas, a cambio de converti
 - `late-arriving-data`: eventos que llegan después del día al que pertenecen.
 - `partitioning` y `partition-pruning`: particionar por fecha.
 - `sql-advanced-select`: agregaciones por día.
-- Del blueprint, pendiente de ficha: `event-time-vs-processing-time`.
+- `event-time-vs-processing-time`: tiempo de evento y tiempo de procesamiento.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -242,3 +245,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-07: `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `partition-pruning`.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `event-time-vs-processing-time`, que ya tiene ficha; antes figuraba como pendiente de ficha.
diff --git a/content/concepts/streaming-ingestion.md b/content/concepts/streaming-ingestion.md
index 20906fa..748e2dd 100644
--- a/content/concepts/streaming-ingestion.md
+++ b/content/concepts/streaming-ingestion.md
@@ -84,6 +84,12 @@ relations:
   - type: RELATED_TO
     target: deduplication
     note: Los duplicados de la entrega at-least-once se eliminan aguas abajo.
+  - type: RELATED_TO
+    target: delivery-semantics
+    note: "La semántica de entrega de la ingesta."
+  - type: RELATED_TO
+    target: event-time-vs-processing-time
+    note: "Tiempo de evento frente a tiempo de procesamiento."
 created_at: 2026-10-05
 updated_at: 2026-10-13
 last_verified: 2026-10-05
@@ -222,7 +228,8 @@ Frescura de segundos y carga repartida, a cambio de operar componentes siempre e
 - `pubsub-topics-and-subscriptions` y `pubsub-delivery-semantics`: el broker de GCP y sus garantías.
 - `late-arriving-data`: qué hacer con lo tardío.
 - `deduplication`: cómo eliminar los duplicados de la entrega at-least-once.
-- Del blueprint, pendientes de ficha: `delivery-semantics`, `event-time-vs-processing-time`.
+- `delivery-semantics`: at-most-once y at-least-once en la ingesta.
+- `event-time-vs-processing-time`: tiempo de evento y tiempo de procesamiento.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -252,3 +259,5 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-05: creación (lote 6 de F3).
 - 2026-10-05: revisión B-F3.1 del lote 6 aplicada (docs/reviews/cards-lote6.md), sin cambios pedidos. `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `delivery-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
+- 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `event-time-vs-processing-time`, que ya tiene ficha; antes figuraba como pendiente de ficha.
```

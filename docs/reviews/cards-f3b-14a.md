# Revisión B-F3.1 · lote F3b-14a

Rama `b/f3b-review-14a`, creada desde `origin/main` (`5004855`). El pedido es `16e78f5`. Fichas: `events`, `producers-and-consumers`, `message-brokers`, `topics-and-partitions`, `offsets`, `event-ordering` y `delivery-semantics`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| La URL de *Class Message* es `/latest/` y el `h1` dice «Class Message (2.43.0)». `events`, `offsets` y `delivery-semantics` ponen `page_title` «Class Message (2.42.0)». | media | Actualizar el título a 2.43.0, o fijar la URL a la versión 2.42.0. |
| *Pub/Sub pricing* cobra la transferencia entre regiones y dice «There are no zone data transfer fees for Pub/Sub usage». `message-brokers` junta «transferencia entre zonas o regiones». | media | Dejar la transferencia entre regiones y decir que no hay cargo entre zonas. |

## Validación

```
OK: 492 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos de `page_title` repetido son de `exactly-once-semantics` y `spark-structured-streaming`, del lote 14b.

## Kafka en la CI y la simulación

`tests/test_kafka_snippets.py` corre seis bloques bash contra `apache/kafka:4.3.1` en KRaft. Las frases que las fichas dicen impresas están en el test:

```
assert re.search(r"^CreateTime:\d+\torigen:web\tcliente-42\t{\"evento\": \"pago\", \"monto\": 200\}$", out, re.M)
assert "otro lector, mismos eventos: 2" in out
assert "carga-dwh lee: 3" / "carga-dwh vuelve a leer: 0" / "alertas lee: 3"
assert out.count("Leader: 1, Replicas: 1") == 2
assert "retention.ms=86400000" in out
assert "The target replication factor of 3 cannot be reached because only 1 broker(s) are registered" in out
assert "primera lectura: 2" / "offset confirmado 2, fin del log 4, lag 2"
assert "tras reiniciar al primer offset, el grupo vuelve a leer: 4"
assert f"{order}: creado pagado enviado entregado"
```

`delivery-semantics` no usa el broker. El test ejecuta el bloque Python y `mypy --strict`. La ficha dice «simulación en Python de biblioteca estándar, sin broker». Imprime las tres líneas que el test comprueba. Exactly-once aparece una vez, para decir que no es parte de esta ficha:

```
content/concepts/delivery-semantics.md
  87:- **exactly-once:** cada mensaje se procesa una sola vez, con un alcance que hay que leer con cuidado (no es parte de esta ficha).
```

Pub/Sub, Kinesis, MSK y Event Hubs dicen «no ejecutado».

## Citas de Kafka 4.3

En las páginas versionadas (`kafka.apache.org/43/...`), consultadas el 2026-10-20:

```
producers never need to wait for consumers
just a single integer, the offset of the next message to consume
in exactly the same order as they were written
At most once–Messages may be lost but are never redelivered
At least once–Messages are never lost but may be redelivered
Topics are partitioned, meaning a topic is spread over a number of “buckets”
A common production setting is a replication factor of 3
```

La retención de Pub/Sub en *Subscription properties*: «Default value = 7 days Minimum value = 10 minutes Maximum value = 31 days».

*Class Message*:

```
MSG h1-ish Class Message (2.43.0)
```

## Estructura

```
events page_title 6/6 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
producers-and-consumers page_title 7/7 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
message-brokers page_title 13/13 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
topics-and-partitions page_title 6/6 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
offsets page_title 7/7 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
event-ordering page_title 7/7 rels17 ok topics ok dollars bash s11 True s12 True s13 True seg True obs True costo True not_rel ok
delivery-semantics page_title 7/7 rels17 ok topics ok dollars none s11 True s12 True s13 True seg True obs True costo True not_rel ok
```

Los `$1` y siguientes están en funciones bash, no en precios. 27 URLs: 26 `page_title` coinciden con un `h1`. §11, §12 y §13 son tablas y nombran la página de cada lado. Cada `relations` está en el §17.

## Diff de las fichas verified

`git diff 47ef90c..5004855` sobre las 11 fichas que recibieron enlace. Son 13 l?neas de historial: cinco del lote 14a y ocho del 14b. `pubsub-delivery-semantics` y `streaming-ingestion` est?n en los dos. El diff solo toca `relations`, el ?17 y una l?nea de historial por enlace. No cambia `verification_status`.

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

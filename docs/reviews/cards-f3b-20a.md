# Revisión B-F3.1 · lote F3b-20a

Rama `b/f3b-review-20a`, creada desde `origin/main` (`49a2a45`). El pedido está en `docs/status/lane-a.md`. Fichas: `open-data-stack-overview`, `spark-execution-model`, `kafka-architecture` y `postgresql-for-data-engineers`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `spark-execution-model`, la nota de *Amazon EMR release 7.14.0* dice Hadoop 3.4.2, Iceberg 1.10.1, Delta 3.3.2 y Hudi 1.0.2. La tabla de la página, el 2026-10-20, dice Hadoop 3.4.2-amzn-2, Iceberg 1.10.1-amzn-1, Delta 3.3.2-amzn-3 y Hudi 1.0.2-amzn-3. Spark está citado tal cual: 3.5.8-amzn-0. | media | Citar las cuatro versiones con el sufijo de la tabla. |
| `open-data-stack-overview` nombra dbt como pieza del stack y `dbt-core-concepts` ya existe. No está en `relations` ni en el §17, y no dice «pendiente de ficha». Las otras nueve fichas del stack están una vez. | media | Enlazar `dbt-core-concepts` en `relations` y en el §17, con historial. |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 500 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son fichas de 14b: varias URLs de Spark 4.2.0 comparten el `h1` «Structured Streaming Programming Guide».

## Comprobaciones del pedido

```
relations ['airflow-architecture', 'spark-execution-model', 'kafka-architecture', 'postgresql-for-data-engineers', 'beam-programming-model', 'infrastructure-as-code', 'kubernetes-fundamentals', 'docker-compose-environments', 'stateful-stream-processing']
dups []
dbt-core-concepts exists True in relations False
dbt mentions 6
min.insync in bash block False
cleanup.policy=compact in bash True
explains not reproduced True
logical in python block False
says not executed True
says replica True
spark version string True
aqe True
stages phrase True
pubsub line True
- **Servicio propio de la nube:** algo distinto que resuelve un problema parecido (Pub/Sub frente a Kafka, BigQuery frente a Spark); no es la misma tecnología.
| Kafka | — | Pub/Sub es el servicio propio de mensajería, no Kafka (ver `kafka-architecture`) |
- Llamar «Kafka» a Pub/Sub o a Event Hubs, o «Spark» a BigQuery.
```

Pub/Sub queda como servicio propio, distinto de Kafka. El bloque bash de `kafka-architecture` compacta y no configura `min.insync.replicas`. El texto dice que con un solo broker no se reproduce, y lo cita de *Topic Configs* y *Eligible Leader Replicas*. En esas páginas, el 2026-10-20: «strict min ISR» y «the high watermark for the data partition can't advance if the size of the ISR is smaller than the min ISR (min.insync.replicas)»; ELR desde 4.0 y activado por defecto en clústeres nuevos desde 4.1. El test exige `antes de compactar: 5 eventos` y `después de compactar: cuenta-1=75 cuenta-2=60`.

La decodificación lógica no está en el bloque Python. La ficha dice que no se ejecutó porque hace falta `wal_level=logical`, y la CI corre con `replica`. El servicio de `.github/workflows/ci.yml` es `postgres:17` sin `wal_level`. En *19.5. Write Ahead Log*: «The default value is replica».

`spark-execution-model` imprime `stages: 2 o más` y dice que el número exacto puede cambiar con AQE. El test no fija un número. En la tabla de EMR 7.14.0: `| Spark | 3.5.8-amzn-0 |`. La ficha usa esa cadena en la nota y en el §12.

§11, §12 y §13 son tablas y nombran la página de cada lado. §14 trae Seguridad, Observabilidad y Costo. Cada `relations` está en el §17 y no hay duplicados. `related_topics` es subconjunto. 42 `page_title`: coinciden con el `h1` (en Google, después de quitar el aviso de collections; en Flink, sin el ` #`). En PostgreSQL el capítulo coincide con el `h2`; COPY y MERGE usan el `<title>`, igual que las fichas ya verified.

## Diff de los seis page_title

`git diff 44750a4^..44750a4 -- content/concepts/`. En `batch-ingestion`, `pubsub-delivery-semantics` y `python-file-processing` solo cambian el `page_title` (se quita el parche del SDK) y una línea de historial.

```diff
diff --git a/content/concepts/batch-ingestion.md b/content/concepts/batch-ingestion.md
index a97cbbf..e5fa180 100644
--- a/content/concepts/batch-ingestion.md
+++ b/content/concepts/batch-ingestion.md
@@ -38,7 +38,7 @@ sources:
   - source: gcp-bigquery-docs
     url: https://docs.cloud.google.com/python/docs/reference/bigquery/latest/google.cloud.bigquery.client.Client
     accessed: 2026-10-02
-    page_title: "Class Client (3.46.1)"
+    page_title: "Class Client"
     note: "Client.load_table_from_uri(source_uris, destination, job_config=...) inicia un load job desde Cloud Storage y devuelve un LoadJob."
   - source: gcp-bigquery-docs
     url: https://docs.cloud.google.com/bigquery/docs/loading-data-cloud-storage-parquet
@@ -48,7 +48,7 @@ sources:
   - source: gcp-bigquery-docs
     url: https://docs.cloud.google.com/python/docs/reference/bigquery/latest/google.cloud.bigquery.job.LoadJob
     accessed: 2026-10-02
-    page_title: "Class LoadJob (3.46.1)"
+    page_title: "Class LoadJob"
     note: "LoadJob.output_rows: cantidad de filas guardadas en la tabla destino (None hasta que lo informa el servidor). La biblioteca incluye anotaciones de tipos (py.typed)."
   - source: python-docs
     url: https://docs.python.org/3/library/typing.html
@@ -283,3 +283,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-06: la sección de conceptos relacionados ya no lista como pendiente de ficha a `data-ingestion`, que ya tiene ficha.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `data-ingestion`.
+- 2026-10-20: `page_title` sin la versión de parche del SDK (*Class Client*, *Class LoadJob*), según la regla de CLAUDE.md de no citar versiones de parche de SDKs ni CLIs; sin cambios de contenido.
diff --git a/content/concepts/pubsub-delivery-semantics.md b/content/concepts/pubsub-delivery-semantics.md
index a0dd425..f3fe528 100644
--- a/content/concepts/pubsub-delivery-semantics.md
+++ b/content/concepts/pubsub-delivery-semantics.md
@@ -48,17 +48,17 @@ sources:
   - source: gcp-pubsub-docs
     url: https://docs.cloud.google.com/python/docs/reference/pubsub/latest/google.cloud.pubsub_v1.subscriber.message.Message
     accessed: 2026-10-01
-    page_title: "Class Message (2.42.0)"
+    page_title: "Class Message"
     note: "Message: message_id, data (bytes), attributes y publish_time. ack() confirma; conviene no confirmar hasta terminar de procesar y, como los acks son best effort, el procesamiento debe ser idempotente. nack() rechaza el mensaje para que se reentregue, de inmediato o con demora, a este u otro suscriptor."
   - source: gcp-pubsub-docs
     url: https://docs.cloud.google.com/python/docs/reference/pubsub/latest/google.cloud.pubsub_v1.types.FlowControl
     accessed: 2026-10-01
-    page_title: "Class FlowControl (2.42.0)"
+    page_title: "Class FlowControl"
     note: "FlowControl(max_bytes=104857600, max_messages=1000, max_lease_duration=3600, ...): controla el ritmo con el que se obtienen mensajes en una suscripción asíncrona."
   - source: gcp-pubsub-docs
     url: https://docs.cloud.google.com/python/docs/reference/pubsub/latest/google.cloud.pubsub_v1.subscriber.client.Client
     accessed: 2026-10-01
-    page_title: "Class Client (2.42.0)"
+    page_title: "Class Client"
     note: "Client.subscribe(subscription, callback, flow_control=..., scheduler=..., ...)."
   - source: psycopg-docs
     url: https://www.psycopg.org/psycopg3/docs/api/connections.html
@@ -320,3 +320,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-19: lote F3b-14a (regla del §17): relations y el §17 enlazan `delivery-semantics`, `event-ordering`, que ya tienen ficha; antes figuraban como pendientes de ficha.
 - 2026-10-19: lote F3b-14b (regla del §17): relations y el §17 enlazan `exactly-once-semantics`, que ya tiene ficha; antes figuraba como pendiente de ficha.
+- 2026-10-20: `page_title` sin la versión de parche del SDK (*Class Message*, *Class FlowControl*, *Class Client*), según la regla de CLAUDE.md de no citar versiones de parche de SDKs ni CLIs; sin cambios de contenido.
diff --git a/content/concepts/python-file-processing.md b/content/concepts/python-file-processing.md
index 759a329..6fb61a0 100644
--- a/content/concepts/python-file-processing.md
+++ b/content/concepts/python-file-processing.md
@@ -38,7 +38,7 @@ sources:
   - source: gcp-cloud-storage-docs
     url: https://docs.cloud.google.com/python/docs/reference/storage/latest/google.cloud.storage.blob.Blob
     accessed: 2026-10-08
-    page_title: "Class Blob (3.16.0)"
+    page_title: "Class Blob"
     note: "Biblioteca cliente de Python de Cloud Storage: Blob.open() crea un manejador para E/S tipo archivo sobre el blob y se puede usar como administrador de contexto, como open(); al leer sin generation fijada se usa la generación más reciente."
   - source: aws-boto3-docs
     url: https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/get_object.html
@@ -339,3 +339,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-09: `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
 - 2026-10-14: lote F3b-rel (regla del §17): relations incluye `beam-programming-model`, `pyspark-dataframes`; el §17 nombra `beam-programming-model`, `pyspark-dataframes`, que el cuerpo ya citaba.
+- 2026-10-20: `page_title` sin la versión de parche del SDK (*Class Blob*), según la regla de CLAUDE.md de no citar versiones de parche de SDKs ni CLIs; sin cambios de contenido.
```

El mismo commit mueve los tests de búsqueda de `kafka-architecture` a `lambda-architecture` frente a `aws-lambda` (`tests/test_api.py`). `bigquery-biglake-tables` no entra en este diff: el enlace a `open-table-formats` está en el lote 20b.

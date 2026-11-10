---
id: architecture:lambda-architecture
slug: lambda-architecture
type: architecture
title: Lambda Architecture
description: "Dos caminos sobre el mismo dato: una capa batch que recalcula desde un master dataset inmutable y una capa speed de baja latencia, unidas en una capa de servicio. Se estudia para reconocer el doble camino y su costo, la lógica duplicada; no es el diseño por defecto. Tres vistas, operación y costos; cómo se arma en GCP, AWS y Azure. Ejemplo ejecutado en la CI con la biblioteca estándar."
domain: architecture
subdomain: streaming-architectures
classification: modern
level: advanced
importance: medium
cloud: [gcp, aws, azure]
technologies: [apache-kafka, apache-spark, gcp-pubsub, gcp-dataflow, gcp-bigquery, aws-kinesis, aws-s3, azure-event-hubs, azure-databricks, python]
tags: [lambda-architecture, batch-layer, speed-layer, serving-layer, hot-path, cold-path]
related_topics: [batch-vs-streaming, kappa-architecture]
sources:
  - source: azure-architecture-center
    url: https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures
    accessed: '2026-11-02'
    page_title: Big data architectures
    note: 'Big data architectures (Azure Architecture Center): la arquitectura Lambda crea dos caminos; la batch layer (cold path) guarda todo lo que llega en crudo y lo procesa en batch en una batch view; la speed layer (hot path) analiza en tiempo real, con baja latencia «at the expense of accuracy»; la batch layer alimenta una serving layer que indexa la batch view, y la speed layer la actualiza con incrementos de lo más reciente. El dato crudo de la batch layer es inmutable (se agrega, no se sobrescribe) y permite recalcular la batch view desde el origen. Desventaja: la complejidad, porque la lógica de procesamiento aparece en dos lugares, con frameworks distintos, lo que duplica la lógica de cómputo. La arquitectura Kappa tiene los mismos objetivos, pero todo fluye por un solo camino, un sistema de stream processing sobre un log unificado, distribuido y tolerante a fallos, con eventos inmutables y ordenados; para recalcular todo el dataset se hace replay del stream, normalmente con paralelismo.'
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/concepts/beam-programming-model
    accessed: '2026-09-30'
    page_title: Programming model for Apache Beam
    note: Apache Beam es un modelo unificado para pipelines batch y streaming; windowing sobre colecciones no acotadas según el timestamp de cada elemento (event time).
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/concepts/streaming-pipelines
    accessed: '2026-10-11'
    page_title: Streaming pipelines
    note: 'Streaming pipelines: las funciones de ventana dividen colecciones no acotadas por el timestamp de cada elemento; ventanas tumbling (fixed en Beam), hopping (sliding en Beam, pueden solaparse) y de sesión. El watermark es el umbral que indica cuándo Dataflow espera que hayan llegado todos los datos de una ventana; si pasó el final de la ventana y llegan datos con timestamp dentro de ella, son datos tardíos. Los datos no llegan garantizados en orden ni a intervalos predecibles; la fuente determina el watermark; Beam permite aceptar datos tardíos. Los triggers deciden cuándo emitir resultados; por defecto, cuando el watermark pasa el final de la ventana.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/materialized-views-intro
    accessed: '2026-10-11'
    page_title: Introduction to materialized views
    note: 'Introduction to materialized views: tablas precalculadas que mejoran el rendimiento y bajan el costo de consultas frecuentes y predecibles; combinan los datos precalculados con los cambios recientes de las tablas base para dar resultados frescos sin pipelines manuales. Sin mantenimiento (BigQuery agrega los cambios incrementales en segundo plano), frescas (si un cambio invalida la vista, lee de las tablas base) y con smart tuning (si una parte de una consulta contra la tabla base se resuelve con la vista, BigQuery la reescribe para usarla). Dos tipos: incrementales (sintaxis limitada; reducen el costo de consultas frecuentes; smart tuning; siempre frescas) y no incrementales (la mayoría de las consultas; cada refresco ejecuta la consulta completa; sin smart tuning ni frescura garantizada), con allow_non_incremental_definition = true. Vistas materializadas autorizadas para compartir un subconjunto. Limitaciones: solo GoogleSQL; SQL restringido; no se puede cambiar la consulta después de crearla; no admiten DML, COPY, EXPORT ni LOAD directos; no se anidan; no consultan tablas externas; operadores intensivos en CPU (UNPIVOT, UNNEST pesados) pueden fallar el refresco en on-demand. Sobre tablas BigLake con caché de metadatos sí se pueden crear.'
  - source: aws-kinesis-docs
    url: https://docs.aws.amazon.com/streams/latest/dev/kinesis-extended-retention.html
    accessed: '2026-09-30'
    page_title: Change the data retention period
    note: Kinesis Data Streams retiene registros 24 horas por defecto, ampliable hasta 8760 horas (365 días).
  - source: aws-firehose-docs
    url: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
    accessed: '2026-10-12'
    page_title: What is Amazon Data Firehose?
    note: 'What is Amazon Data Firehose?: servicio administrado que entrega datos de streaming a destinos como Amazon S3, Amazon Redshift, OpenSearch, tablas Apache Iceberg y endpoints HTTP, sin escribir aplicaciones; puede transformar antes de entregar, leer de un Kinesis data stream existente y acumula datos por tamaño (MB) o intervalo (segundos) antes de entregar. Hacia Redshift, entrega primero a S3 y luego ejecuta COPY.'
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-capture-overview
    accessed: '2026-10-13'
    page_title: Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage
    note: 'Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage: Capture guarda automáticamente el stream en Azure Blob Storage o ADLS, por intervalo de tiempo o de tamaño, en formato Avro, y escala con la capacidad del event hub.'
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/structured-streaming/concepts
    accessed: '2026-10-19'
    page_title: Structured Streaming concepts
    note: 'Structured Streaming concepts (Azure Databricks): Apache Spark Structured Streaming es un motor de procesamiento casi en tiempo real con tolerancia a fallos de punta a punta y garantías exactly-once; la computación se expresa como sobre datos estáticos y el motor la ejecuta en forma incremental; Auto Loader procesa archivos nuevos en almacenamiento de nube y las tablas Delta sirven de fuente y sink con exactly-once.'
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/streaming/index.html
    accessed: '2026-10-19'
    page_title: Structured Streaming Programming Guide
    note: 'Structured Streaming Programming Guide, Overview (Spark 4.2.0): motor de streaming sobre Spark SQL; la computación de streaming se expresa como un cálculo batch sobre datos estáticos; por defecto las consultas corren en un motor de micro-batch, «a series of small batch jobs», con latencias desde unos 100 milisegundos y garantías exactly-once; desde Spark 2.3 hay un modo de procesamiento continuo con latencias desde 1 milisegundo y garantías at-least-once, sin cambiar las operaciones de la consulta.'
relations:
  - {type: RELATED_TO, target: batch-vs-streaming, note: "Los dos modos que combina."}
  - {type: ALTERNATIVE_TO, target: kappa-architecture, note: "Un solo camino streaming en vez de dos."}
  - {type: DEPENDS_ON, target: batch-pipeline-architecture, note: "La capa batch."}
  - {type: DEPENDS_ON, target: streaming-pipeline-architecture, note: "La capa speed."}
  - {type: RELATED_TO, target: idempotency, note: "La capa batch recalcula; la speed debe tolerar duplicados."}
  - {type: RELATED_TO, target: late-arriving-data, note: "La capa batch absorbe lo que llegó tarde."}
  - {type: RELATED_TO, target: real-time-analytics-architecture, note: "La capa de servicio con baja latencia."}
created_at: 2026-11-02
updated_at: 2026-11-03
last_verified: 2026-11-02
owner_approved_at: 2026-11-03
verification_status: verified
---

## 1. Resumen

La arquitectura Lambda procesa cada dato por **dos caminos**. La **capa batch** (cold path) guarda todo en crudo, inmutable, y recalcula periódicamente una vista exacta; la **capa speed** (hot path) procesa en tiempo real, con baja latencia a costa de exactitud; la **capa de servicio** indexa la vista batch y suma los incrementos de speed (*Big data architectures*).

Se estudia para reconocer el doble camino, no como diseño por defecto. Su costo es la complejidad: la lógica aparece en dos lugares, con frameworks distintos, y hay que mantenerla igual (*Big data architectures*). Hoy, motores que unifican batch y streaming en un mismo modelo, como Beam (*Programming model for Apache Beam*) o Structured Streaming (*Structured Streaming Programming Guide*), reducen ese costo; `kappa-architecture` lo elimina con un solo camino.

## 2. Escenario y requerimientos

Escenario: un sitio quiere visitas por página. Marketing mira un tablero en vivo; finanzas factura publicidad con la cifra exacta del día anterior, sin duplicados.

| Requerimiento | Valor del escenario |
|---|---|
| En vivo | Visitas de la última hora, aunque sean aproximadas |
| Exacto | Cifra diaria deduplicada por `event_id` y con los tardíos |
| Historia | Poder recalcular cualquier día si cambia la regla |
| Restricción | El dato crudo nunca se modifica |

## 3. Vista de contexto

```mermaid
flowchart LR
  F["Eventos de visitas"] --> B["Capa batch"]
  F --> S["Capa speed"]
  B --> V["Capa de servicio"]
  S --> V
  V --> M["Tablero de marketing"]
  V --> X["Facturación"]
```

## 4. Componentes

| Componente | Responsabilidad | Por qué está |
|---|---|---|
| Master dataset | Todos los eventos en crudo, append-only | Recalcular cualquier vista desde el origen |
| Capa batch | Recalcula la vista exacta hasta un corte | Exactitud: deduplica e incluye tardíos |
| Capa speed | Incrementos desde el corte | Latencia baja mientras corre el próximo batch |
| Capa de servicio | Une vista batch y vista speed | Una sola respuesta para el consumidor |
| Corte | Hasta dónde llega la última vista batch | Define qué parte sirve cada capa |

## 5. Vista de datos

```mermaid
flowchart TB
  E["Evento"] --> M["Master dataset<br/>append-only"]
  E --> S["Capa speed:<br/>desde el corte"]
  M --> B["Capa batch:<br/>hasta el corte"]
  B --> Q["Capa de servicio:<br/>batch + speed"]
  S --> Q
  B --> C["Corte"]
  C -. "lo cubierto deja speed" .-> S
```

El dato crudo de la capa batch es inmutable: lo nuevo se agrega y un cambio se guarda como otro evento con su timestamp, lo que permite recalcular en cualquier punto de la historia (*Big data architectures*). Cuando la capa batch avanza el corte, lo que cubre deja de servirse desde speed.

## 6. Vista de despliegue

```mermaid
flowchart TB
  subgraph HOT["Hot path"]
    S["Capa speed<br/>(job streaming)"]
  end
  subgraph COLD["Cold path"]
    L["Master dataset<br/>(almacenamiento crudo)"]
    B["Capa batch<br/>(job programado)"]
  end
  I["Broker"] --> S
  I --> L
  L --> B
  S --> V["Capa de servicio<br/>(almacén)"]
  B --> V
```

Son dos despliegues, con dos ciclos de vida: el job streaming corre siempre y el batch por horario. En la nube, el cold path suele empezar con una copia del broker al almacenamiento: Event Hubs Capture escribe el stream en Blob Storage o ADLS en Avro (*Capture events through Azure Event Hubs…*) y Data Firehose entrega a S3 acumulando por tamaño o intervalo (*What is Amazon Data Firehose?*).

## 7. Seguridad y gobierno

- El master dataset guarda todo en crudo y para siempre: los datos personales necesitan una política de retención y de borrado que no rompa la inmutabilidad (por ejemplo, seudonimizar al ingerir).
- Dos caminos son dos superficies de acceso: los mismos permisos y la misma clasificación en ambos.
- El linaje tiene que mostrar de qué capa viene cada cifra servida.

## 8. Escalabilidad, observabilidad y operación

- **Escala:** la capa batch escala con el volumen histórico; la speed, con el tráfico del momento.
- **Qué se mide:** la diferencia entre speed y batch sobre el mismo período (si crece, las dos lógicas divergen), la antigüedad del corte y la duración del batch.
- **Runbook:** cambio de regla → cambiarla en **las dos** capas y recalcular batch desde el master; speed caída → la capa batch cubre el período en el siguiente corte.

## 9. Costos

Se paga dos veces el procesamiento del mismo dato (un job siempre encendido y otro que relee la historia), el almacenamiento del master dataset completo y, sobre todo, el trabajo de mantener dos implementaciones iguales. Una vista materializada que combina datos precalculados con los cambios recientes, como las de BigQuery, cubre algunos casos sin capa speed propia (*Introduction to materialized views*). Los montos dependen de los servicios elegidos y se calculan con la calculadora de cada nube.

## 10. Código y configuración

```python
# Python 3.12+, biblioteca estándar; sqlite3 hace de motor. Arquitectura Lambda de punta a punta: un master dataset
# append-only; la capa batch recalcula su vista desde todo el master hasta un corte; la capa speed suma lo que llegó
# después del corte; la capa de servicio une ambas. La regla vive dos veces, y aquí la de speed no deduplica por
# event_id: el error se ve hasta que la siguiente corrida batch cubre ese período y reemplaza a speed.
import sqlite3
from collections import Counter

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE master (event_id TEXT, ts TEXT, page TEXT)")   # append-only: nunca UPDATE ni DELETE
speed: Counter[str] = Counter()
cutoff = ""


def arrive(event_id: str, ts: str, page: str) -> None:
    db.execute("INSERT INTO master VALUES (?, ?, ?)", (event_id, ts, page))
    if ts >= cutoff:
        speed[page] += 1   # incremental y rápido, pero sin deduplicar: la segunda implementación de la regla


def batch_view() -> dict[str, int]:   # recalcula desde el master, deduplicando por event_id
    rows = db.execute("SELECT page, COUNT(DISTINCT event_id) FROM master WHERE ts < ? GROUP BY page ORDER BY page",
                      (cutoff,))
    return dict(rows.fetchall())


def run_batch(new_cutoff: str) -> dict[str, int]:
    global cutoff
    cutoff = new_cutoff
    speed.clear()   # lo que cubre el batch deja de servirse desde speed
    for _, ts, page in db.execute("SELECT * FROM master WHERE ts >= ?", (cutoff,)).fetchall():
        speed[page] += 1
    return batch_view()


def serve() -> dict[str, int]:
    merged = Counter(batch_view())
    merged.update(speed)
    return dict(sorted(merged.items()))


for event in [("e-1", "11:10", "home"), ("e-2", "11:20", "precios"), ("e-3", "11:40", "home"), ("e-4", "11:50", "home")]:
    arrive(*event)
print("batch hasta las 12:00:", run_batch("12:00"))
for event in [("e-5", "12:05", "home"), ("e-5", "12:05", "home"), ("e-6", "12:20", "precios")]:   # e-5 llega dos veces
    arrive(*event)
print("speed desde las 12:00:", dict(sorted(speed.items())))
print("servido (batch + speed):", serve())
print("batch hasta las 13:00:", run_batch("13:00"), "| speed:", dict(speed))
print("servido (batch + speed):", serve())
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`:

```text
batch hasta las 12:00: {'home': 3, 'precios': 1}
speed desde las 12:00: {'home': 2, 'precios': 1}
servido (batch + speed): {'home': 5, 'precios': 2}
batch hasta las 13:00: {'home': 4, 'precios': 2} | speed: {}
servido (batch + speed): {'home': 4, 'precios': 2}
```

La capa speed cuenta dos veces el evento `e-5`, que llegó repetido, y el servicio muestra `home: 5`. La corrida batch de las 13:00 recalcula desde el master con `COUNT(DISTINCT event_id)`, vacía speed y el servicio queda en `home: 4`. Es el costo de la arquitectura en pequeño: la misma regla implementada dos veces, y la segunda distinta. Lo que no ejecuta: motores distribuidos ni un broker; la lógica de capas y corte es la misma.

## 11. GCP

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Batch y speed | Dataflow (Apache Beam) | Beam es un modelo unificado para batch y streaming (*Programming model for Apache Beam*): con el mismo código en los dos caminos, la duplicación baja, pero siguen siendo dos jobs. No ejecutado |
| Servicio | BigQuery | Las vistas materializadas combinan lo precalculado con los cambios recientes de la tabla base (*Introduction to materialized views*) |

## 12. AWS

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Speed | Kinesis Data Streams | Retención de 24 horas por defecto, ampliable (*Change the data retention period*): no sirve de master dataset por sí solo |
| Cold path | Data Firehose hacia S3 | Copia el stream a S3 por tamaño o intervalo (*What is Amazon Data Firehose?*); el batch corre sobre S3. No ejecutado |

## 13. Azure

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Cold path | Event Hubs Capture | Escribe el stream en Blob Storage o ADLS en Avro (*Capture events through Azure Event Hubs…*) |
| Batch y speed | Azure Databricks | Structured Streaming expresa el cálculo como sobre datos estáticos y lo ejecuta en forma incremental (*Structured Streaming concepts*): el mismo motor en los dos caminos. No ejecutado |
| Guía | Azure Architecture Center | Describe Lambda, sus capas y su desventaja, la lógica duplicada (*Big data architectures*) |

## 14. Riesgos y modos de falla

| Riesgo | Cómo se detecta | Cómo se recupera |
|---|---|---|
| Lógicas que divergen | Salto en la cifra al avanzar el corte | Tests que comparan speed y batch sobre el mismo período |
| Batch que no termina antes del siguiente | El corte se atrasa y speed crece | Particionar el recálculo o ampliar el intervalo |
| Master dataset modificado | El recálculo no reproduce cifras pasadas | Append-only sin permisos de escritura humana |
| Speed que no tolera duplicados | Cifras en vivo infladas | Deduplicar también en speed, o aceptar y documentar la aproximación |

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Adoptarla por defecto | Dos sistemas que operar para un caso que resuelve uno |
| Cambiar la regla solo en una capa | Cifras distintas según la hora de la consulta |
| Mostrar speed como exacto | Decisiones sobre cifras aproximadas |
| Presentarla como lo moderno frente a batch | Es un compromiso de latencia y exactitud, no un reemplazo |

## 16. Trade-offs y alternativas

| Opción | Gana | Cuesta |
|---|---|---|
| Lambda | Exactitud del batch y latencia del streaming | Dos caminos y lógica duplicada |
| `kappa-architecture` | Un solo camino y una sola lógica | Recalcular es releer el log entero |
| Solo batch (`batch-pipeline-architecture`) | Lo más simple | Sin cifras en vivo |
| Solo streaming con tardíos (`streaming-pipeline-architecture`) | Una lógica, cifras en minutos | Exactitud limitada por la watermark |

## 17. Conceptos relacionados

- `batch-vs-streaming`: los dos modos que combina.
- `kappa-architecture`: la alternativa de un solo camino.
- `batch-pipeline-architecture` y `streaming-pipeline-architecture`: sus dos capas.
- `idempotency` y `late-arriving-data`: lo que la capa batch corrige.
- `real-time-analytics-architecture`: la capa de servicio con baja latencia.

## 18. Evolución

Aparece cuando un `batch-pipeline-architecture` necesita cifras en vivo y el streaming disponible no da exactitud. Hoy suele evolucionar a `kappa-architecture`, o a un solo motor que unifica batch y streaming. La señal para no adoptarla: un streaming con watermark y deduplicación ya da la exactitud que se pide.

## 19. Laboratorio relacionado

Sin laboratorio en F4: no está entre las 6 arquitecturas de F4. El §10 corre en la CI.

## 20. Fuentes

- Microsoft Learn: *Big data architectures*; *Capture events through Azure Event Hubs in Azure Blob Storage or Azure Data Lake Storage*; *Structured Streaming concepts*.
- Google Cloud: *Programming model for Apache Beam*; *Streaming pipelines*; *Introduction to materialized views*.
- AWS: *Change the data retention period*; *What is Amazon Data Firehose?*.
- Apache Spark 4.2.0: *Structured Streaming Programming Guide* (Overview).

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-11-02: fichas de origen de cada cita revisadas y *Big data architectures* leída hoy (H1 y contenido). `verified`: aprobada el 2026-11-03 (`owner_approved_at`).

## 22. Historial de cambios importantes

- 2026-11-02: creación (lote 07b, ADR-028).
- 2026-11-02: las tres vistas usan los nombres del §4 (criterio de la revisión de 07a).
- 2026-11-03: el §19 ya no promete un laboratorio en F4: el ROADMAP lo deja para las 6 arquitecturas de F4, y esta no está entre ellas.
- 2026-11-03: revisión de 07b aplicada (docs/reviews/lote-07b.md): las citas nuevas del lote llevan su `url` (faltaba); el §5 tiene el nodo «Corte» del §4.
- 2026-11-03: `verification_status: verified`, aprobada con lista explícita (`owner_approved_at: 2026-11-03`).

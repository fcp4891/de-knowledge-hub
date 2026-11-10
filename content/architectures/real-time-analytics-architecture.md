---
id: architecture:real-time-analytics-architecture
slug: real-time-analytics-architecture
type: architecture
title: Real-time analytics
description: "La consulta de baja latencia sobre datos frescos, no el pipeline que los trae: un almacén de servicio con pre-agregados que se actualizan al escribir, frescura medida y resultados recientes que pueden cambiar con los tardíos. Tres vistas, operación y costos; BigQuery con Storage Write API y vistas materializadas, Redshift con Firehose o zero-ETL, Fabric con mirroring, con sus diferencias. Ejemplo ejecutado en la CI con la biblioteca estándar."
domain: architecture
subdomain: streaming-architectures
classification: modern
level: advanced
importance: medium
cloud: [gcp, aws, azure]
technologies: [gcp-bigquery, gcp-pubsub, aws-redshift, aws-kinesis, microsoft-fabric, azure-event-hubs, python]
tags: [real-time-analytics, low-latency, pre-aggregation, freshness, olap, materialized-views]
related_topics: [streaming-pipeline-architecture, oltp-vs-olap, data-freshness]
sources:
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing
    accessed: '2026-10-05'
    page_title: Online analytical processing
    note: OLAP organiza grandes bases de datos de negocio para cálculos complejos y análisis de tendencias sin afectar a los sistemas transaccionales. Las bases OLTP están optimizadas para entradas de registros individuales y no para análisis; las OLAP, para muchas lecturas y pocas escrituras, modeladas y limpias para el análisis, y suelen conservar historia para series de tiempo.
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html
    accessed: '2026-10-05'
    page_title: Columnar storage
    note: 'En el almacenamiento por filas, cada bloque guarda los valores consecutivos de las columnas de un registro completo; en OLTP la mayoría de las transacciones leen y escriben registros completos, de a uno o pocos, así que el almacenamiento por filas es óptimo para OLTP. En el columnar, cada bloque guarda valores de una sola columna de muchas filas: una consulta que usa 5 de 100 columnas lee cerca del 5 % de los datos, y como cada bloque tiene un solo tipo de dato se puede comprimir con un esquema elegido para ese tipo.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/storage_overview
    accessed: '2026-10-11'
    page_title: Overview of BigQuery storage
    note: 'Overview of BigQuery storage: la separación de almacenamiento y cómputo permite escalarlos de forma independiente. Al ejecutar una consulta, el motor reparte el trabajo en paralelo entre workers, que leen las tablas, procesan la consulta y reúnen los resultados; ejecuta en memoria y usa una red petabit. Almacenamiento administrado (sin aprovisionar; se paga lo usado; cómputo y almacenamiento se facturan por separado), durable (diseñado para 99.999999999 % de durabilidad anual, réplicas en varias zonas), cifrado antes de escribir a disco (con clave de Google o propia) y con codificación eficiente (Capacitor, formato columnar). Tipos: tablas estándar, clones (solo guardan el delta), snapshots (copias de solo lectura a un punto del tiempo), vistas materializadas, resultados en caché (tablas temporales sin costo) y tablas externas (solo los metadatos en BigQuery). Los datasets son contenedores lógicos que afectan permisos, cuotas y facturación. BigQuery guarda los datos en formato columnar, cada columna por separado: lee solo las columnas que usa la consulta y comprime mejor (por ejemplo, run-length encoding). Facturación lógica (sin comprimir, por defecto) o física (comprimida), configurada por dataset; el cambio de modelo no mueve datos. Time travel y fail-safe.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/write-api-grpc
    accessed: '2026-10-05'
    page_title: Introduction to the Storage Write API (gRPC)
    note: 'Storage Write API (gRPC): el default stream está pensado para datos que llegan continuamente, los datos quedan disponibles de inmediato para consulta y la semántica es at-least-once; los streams creados por la aplicación dan escritura exactly-once mediante offsets y propiedades ACID adicionales.'
  - source: gcp-pubsub-docs
    url: https://docs.cloud.google.com/pubsub/docs/create-bigquery-subscription
    accessed: '2026-10-05'
    page_title: Create BigQuery subscriptions
    note: gcloud pubsub subscriptions create SUBSCRIPTION_ID --topic=TOPIC_ID --bigquery-table=PROJECT_ID.DATASET_ID.TABLE_ID crea una suscripción de BigQuery; --bigquery-service-account-email usa una cuenta de servicio propia. El dataset y la tabla deben existir; si el topic no tiene schema, la tabla necesita una columna data. Crearla requiere roles/pubsub.editor en el proyecto.
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/materialized-views-intro
    accessed: '2026-10-11'
    page_title: Introduction to materialized views
    note: 'Introduction to materialized views: tablas precalculadas que mejoran el rendimiento y bajan el costo de consultas frecuentes y predecibles; combinan los datos precalculados con los cambios recientes de las tablas base para dar resultados frescos sin pipelines manuales. Sin mantenimiento (BigQuery agrega los cambios incrementales en segundo plano), frescas (si un cambio invalida la vista, lee de las tablas base) y con smart tuning (si una parte de una consulta contra la tabla base se resuelve con la vista, BigQuery la reescribe para usarla). Dos tipos: incrementales (sintaxis limitada; reducen el costo de consultas frecuentes; smart tuning; siempre frescas) y no incrementales (la mayoría de las consultas; cada refresco ejecuta la consulta completa; sin smart tuning ni frescura garantizada), con allow_non_incremental_definition = true. Vistas materializadas autorizadas para compartir un subconjunto. Limitaciones: solo GoogleSQL; SQL restringido; no se puede cambiar la consulta después de crearla; no admiten DML, COPY, EXPORT ni LOAD directos; no se anidan; no consultan tablas externas; operadores intensivos en CPU (UNPIVOT, UNNEST pesados) pueden fallar el refresco en on-demand. Sobre tablas BigLake con caché de metadatos sí se pueden crear.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/materialized-views-manage
    accessed: '2026-10-11'
    page_title: Manage materialized views
    note: 'Manage materialized views: el refresco automático lo ejecuta la cuenta bigquery-adminbot@system.gserviceaccount.com y aparece en el historial de jobs. Por defecto, los datos se refrescan entre 5 y 30 minutos después de un cambio en la tabla base. enable_refresh activa o desactiva el refresco; refresh_interval_minutes (refresh_interval_ms en la API y en bq) fija un tope de frecuencia: por defecto, no más de una vez cada 30 minutos; el mínimo es de 1 minuto.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/best-practices-costs
    accessed: '2026-10-05'
    page_title: Estimate and control costs
    note: 'En on-demand, las consultas se facturan por bytes leídos: previsualizar con el validador o un dry run. El ajuste de máximo de bytes facturados hace fallar sin cargo la consulta cuya estimación lo supere (en tablas clusterizadas la estimación es una cota superior y puede fallar aunque el costo real fuera menor). En tablas no clusterizadas, LIMIT no reduce el costo de cómputo.'
  - source: aws-firehose-docs
    url: https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html
    accessed: '2026-10-12'
    page_title: What is Amazon Data Firehose?
    note: 'What is Amazon Data Firehose?: servicio administrado que entrega datos de streaming a destinos como Amazon S3, Amazon Redshift, OpenSearch, tablas Apache Iceberg y endpoints HTTP, sin escribir aplicaciones; puede transformar antes de entregar, leer de un Kinesis data stream existente y acumula datos por tamaño (MB) o intervalo (segundos) antes de entregar. Hacia Redshift, entrega primero a S3 y luego ejecuta COPY.'
  - source: aws-redshift-docs
    url: https://docs.aws.amazon.com/redshift/latest/mgmt/zero-etl-using.html
    accessed: '2026-10-05'
    page_title: Zero-ETL integrations
    note: 'Zero-ETL integration es una solución administrada que pone datos transaccionales y operacionales a disposición de Redshift desde varias fuentes (entre ellas Aurora, RDS y DynamoDB), sin mantener un pipeline ETL: AWS automatiza la replicación.'
  - source: microsoft-fabric-docs
    url: https://learn.microsoft.com/en-us/fabric/mirroring/overview
    accessed: '2026-10-26'
    page_title: Mirroring
    note: 'Mirroring (Microsoft Fabric): crea en OneLake una réplica en tablas Delta de una base operacional, completa o por tablas, y la mantiene sincronizada; los cambios pueden publicarse cada 15 segundos; el metadata mirroring referencia los datos de origen con shortcuts de OneLake.'
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/stream-analytics/stream-analytics-time-handling
    accessed: '2026-09-30'
    page_title: Understand time handling in Azure Stream Analytics
    note: Stream Analytics distingue arrival time (por defecto) y application time (TIMESTAMP BY). El watermark es el mayor event time visto menos la tolerancia out-of-order; los eventos fuera de la tolerancia o por debajo del watermark se pueden descartar (drop) o ajustar (adjust); hay que balancear oportunidad y tolerancia.
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview?view=sql-server-ver17
    accessed: '2026-10-05'
    page_title: 'Columnstore indexes: overview'
    note: Por defecto, una tabla de SQL Server usa rowstore; un índice columnstore agrupado guarda la tabla entera por columnas (rowgroups comprimidos columna a columna). Los índices columnstore son el formato preferido para data warehousing y analítica; un columnstore no agrupado sobre una tabla rowstore permite analítica operacional en tiempo real.
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/unified-catalog-data-quality-rules
    accessed: '2026-10-20'
    page_title: Create data quality rules
    note: 'Create data quality rules (Purview Unified Catalog): reglas incorporadas como Freshness, Unique values, String format match, Data type match, Duplicate rows, Empty/blank fields y Table lookup; la regla Custom valida filas con una expresión por fila (true pasa, false falla) y una expresión de filtro opcional que limita qué filas se evalúan; se escribe con expresiones regulares, expresiones de Azure Data Factory o SQL.'
relations:
  - {type: DEPENDS_ON, target: streaming-pipeline-architecture, note: "El pipeline que trae los datos frescos."}
  - {type: RELATED_TO, target: oltp-vs-olap, note: "Un almacén analítico, no el transaccional."}
  - {type: RELATED_TO, target: row-vs-columnar-formats, note: "Lectura columnar de pocas columnas."}
  - {type: RELATED_TO, target: bigquery-materialized-views, note: "Pre-agregados mantenidos por el motor."}
  - {type: RELATED_TO, target: data-freshness, note: "Lo que se promete y se mide."}
  - {type: RELATED_TO, target: late-arriving-data, note: "Los resultados recientes pueden cambiar."}
  - {type: RELATED_TO, target: idempotency, note: "Un reintento no cuenta dos veces."}
  - {type: RELATED_TO, target: lambda-architecture, note: "Su capa de servicio cumple este papel."}
created_at: 2026-11-02
updated_at: 2026-11-03
last_verified: 2026-11-02
owner_approved_at: 2026-11-03
verification_status: verified
---

## 1. Resumen

Real-time analytics es la **consulta de baja latencia sobre datos frescos**: un tablero o una API que responde en segundos sobre lo que pasó hace segundos o minutos. No es el pipeline de streaming que trae esos datos (`streaming-pipeline-architecture`), sino el almacén y el modelo que los sirven.

Lo que la hace funcionar es **pre-agregar al escribir** (rollups por minuto, vistas materializadas) para que cada consulta lea pocas filas, guardar en un formato columnar, y medir y publicar la **frescura**. Conviene cuando alguien decide con el dato del último minuto. No conviene para reportes diarios: un warehouse con cargas por lote es más barato y más simple.

## 2. Escenario y requerimientos

Escenario: el tablero de operaciones de una cadena muestra los ingresos de los últimos 5 minutos por tienda y se refresca cada pocos segundos.

| Requerimiento | Valor del escenario |
|---|---|
| Latencia de consulta | Segundos, con muchos refrescos concurrentes |
| Frescura | El último evento visible en menos de un minuto |
| Tardíos | Corrigen el minuto al que pertenecen |
| Duplicados | Un reintento del productor no cuenta dos veces |
| Restricción | El tablero no consulta la base transaccional |

## 3. Vista de contexto

```mermaid
flowchart LR
  T["Cajas"] --> P["Pipeline streaming"]
  P --> A["Almacén columnar"]
  A --> Q["Capa de consulta"]
  Q --> D["Tablero en vivo"]
  Q --> I["API de métricas"]
  A --> W["Warehouse histórico"]
  A -.-> F["Medición de frescura"]
```

## 4. Componentes

| Componente | Responsabilidad | Por qué está |
|---|---|---|
| Ingesta con deduplicación | Escribe cada evento una vez por `event_id` | El canal entrega al menos una vez |
| Crudo reciente | Eventos de las últimas horas | Recalcular un rollup y auditar |
| Rollups por minuto | Pre-agregados que se actualizan al escribir | La consulta lee pocas filas |
| Almacén columnar | Lee pocas columnas de muchas filas | Consultas analíticas rápidas |
| Medición de frescura | Distancia entre ahora y el último evento | Se promete y se alerta |
| Capa de consulta | Tablero y API con caché corta | Muchos lectores sin saturar el almacén |

## 5. Vista de datos

```mermaid
flowchart TB
  E["Evento: event_id,<br/>ts, tienda, monto"] --> R{"Ingesta con deduplicación:<br/>¿event_id ya está?"}
  R -- "sí" --> X["Se ignora"]
  R -- "no" --> C["Crudo reciente"]
  C --> U["Rollups por minuto:<br/>upsert (minuto, tienda)"]
  U --> Q["Capa de consulta:<br/>últimos 5 minutos"]
```

El rollup es un agregado por minuto y tienda que se suma al escribir; un evento tardío actualiza el minuto al que pertenece, así que **los minutos recientes son provisionales**. Azure Stream Analytics hace explícita esa decisión: los eventos fuera de la tolerancia de desorden se descartan o se ajustan, y hay que balancear oportunidad y tolerancia (*Understand time handling in Azure Stream Analytics*).

## 6. Vista de despliegue

```mermaid
flowchart TB
  subgraph ING["Ingesta"]
    B["Broker"]
    P["Ingesta con<br/>deduplicación"]
  end
  subgraph SRV["Servicio"]
    A["Almacén columnar"]
    M["Rollups por minuto"]
  end
  B --> P
  P --> A
  A --> M
  M --> D["Capa de consulta"]
```

## 7. Seguridad y gobierno

- El tablero lee pre-agregados, no el crudo: menos datos personales expuestos y menos permisos.
- Una identidad de solo lectura por consumidor (tablero, API), con cuotas para que uno no deje sin capacidad a los demás.
- La frescura es parte del contrato del dato: una regla de calidad de frescura comprueba que el activo se actualizó dentro del tiempo esperado (*Create data quality rules*).

## 8. Escalabilidad, observabilidad y operación

- **Escala:** las consultas leen pocas filas pre-agregadas; el almacenamiento columnar lee solo las columnas de la consulta (*Columnar storage*; *Overview of BigQuery storage*).
- **Qué se mide:** frescura (ahora menos el último evento), latencia p95 de la consulta, filas leídas por consulta y diferencia entre el rollup y el crudo para un minuto cerrado.
- **Runbook:** frescura que crece → revisar el lag del pipeline antes que el almacén; rollup que no cuadra con el crudo → recalcular ese minuto desde el crudo.

## 9. Costos

El costo crece con la cantidad de consultas: un tablero que se refresca cada pocos segundos multiplica las lecturas. En BigQuery on-demand, cada consulta se paga por bytes leídos y en tablas sin clustering `LIMIT` no baja ese costo (*Estimate and control costs*); por eso conviene que el tablero lea pre-agregados y no el crudo. Las vistas materializadas bajan el costo de consultas frecuentes y predecibles (*Introduction to materialized views*), y su refresco también se paga. Los montos no se copian.

## 10. Código y configuración

```python
# Python 3.12+, biblioteca estándar; sqlite3 hace de almacén de servicio. Analítica en tiempo real de punta a punta:
# cada evento actualiza al escribir un rollup por minuto y tienda (pre-agregación), así el tablero de los últimos 5
# minutos lee pocas filas en vez de todo el crudo. Un evento tardío corrige su minuto y un reintento con el mismo
# event_id no cuenta dos veces. La frescura es la distancia entre ahora y el último evento recibido.
import sqlite3
from datetime import datetime, timedelta

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE raw (event_id TEXT PRIMARY KEY, ts TEXT, store TEXT, amount INTEGER);
CREATE TABLE rollup (minute TEXT, store TEXT, orders INTEGER, revenue INTEGER, PRIMARY KEY (minute, store));
""")
START = datetime(2026, 11, 2, 10, 0)


def ingest(event_id: str, ts: datetime, store: str, amount: int) -> None:
    with db:
        if db.execute("INSERT OR IGNORE INTO raw VALUES (?, ?, ?, ?)", (event_id, f"{ts:%H:%M:%S}", store, amount)).rowcount:
            db.execute("INSERT INTO rollup VALUES (?, ?, 1, ?) ON CONFLICT (minute, store) DO UPDATE SET "
                       "orders = orders + 1, revenue = revenue + excluded.revenue", (f"{ts:%H:%M}", store, amount))


def dashboard(now: datetime) -> tuple[int, int]:   # ingresos de los últimos 5 minutos y filas leídas
    since = f"{now - timedelta(minutes=5):%H:%M}"
    rows = db.execute("SELECT revenue FROM rollup WHERE minute >= ?", (since,)).fetchall()
    return sum(r for (r,) in rows), len(rows)


for i in range(600):   # 10 minutos, un evento por segundo, alternando dos tiendas
    ingest(f"e-{i}", START + timedelta(seconds=i), "norte" if i % 2 else "sur", i % 7 + 1)
now = START + timedelta(minutes=10, seconds=20)
revenue, read = dashboard(now)
raw_rows = db.execute("SELECT COUNT(*) FROM raw").fetchone()[0]
raw_revenue = db.execute("SELECT SUM(amount) FROM raw WHERE ts >= '10:05:00'").fetchone()[0]
print(f"crudo: {raw_rows} eventos; rollup: {db.execute('SELECT COUNT(*) FROM rollup').fetchone()[0]} filas")
print(f"tablero, últimos 5 minutos: {revenue} leyendo {read} filas del rollup; sobre el crudo, {raw_revenue} leyendo {raw_rows}")
last = db.execute("SELECT MAX(ts) FROM raw").fetchone()[0]
print("frescura:", now - datetime.combine(now.date(), datetime.strptime(last, "%H:%M:%S").time()))
before = db.execute("SELECT revenue FROM rollup WHERE minute = '10:07' AND store = 'sur'").fetchone()[0]
ingest("e-tardio", START + timedelta(minutes=7, seconds=30), "sur", 50)   # llega tarde: corrige su minuto
ingest("e-tardio", START + timedelta(minutes=7, seconds=30), "sur", 50)   # reintento del productor: se ignora
after = db.execute("SELECT revenue FROM rollup WHERE minute = '10:07' AND store = 'sur'").fetchone()[0]
print(f"evento tardío de las 10:07 (y su reintento): sur 10:07 pasa de {before} a {after}; tablero: {dashboard(now)[0]}")
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`:

```text
crudo: 600 eventos; rollup: 20 filas
tablero, últimos 5 minutos: 1198 leyendo 10 filas del rollup; sobre el crudo, 1198 leyendo 600
frescura: 0:00:21
evento tardío de las 10:07 (y su reintento): sur 10:07 pasa de 116 a 166; tablero: 1248
```

El tablero obtiene el mismo total leyendo 10 filas del rollup que leyendo los 600 eventos crudos (la tabla cruda no tiene índice por hora). El evento tardío de las 10:07 corrige su minuto y el tablero sube; su reintento, con el mismo `event_id`, no cambia nada. Lo que no ejecuta: un almacén columnar distribuido, concurrencia de lectores ni caché.

## 11. GCP

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Escritura | BigQuery Storage Write API | El default stream deja los datos disponibles de inmediato con semántica at-least-once; los streams de la aplicación dan exactly-once con offsets (*Introduction to the Storage Write API (gRPC)*) |
| Ingesta sin código | Suscripción de BigQuery en Pub/Sub | Escribe los mensajes del topic en una tabla; el dataset y la tabla deben existir (*Create BigQuery subscriptions*) |
| Pre-agregados | Vistas materializadas | Combinan lo precalculado con los cambios recientes para dar resultados frescos (*Introduction to materialized views*); el refresco automático ocurre por defecto entre 5 y 30 minutos después del cambio (*Manage materialized views*) |

## 12. AWS

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Ingesta | Data Firehose hacia Redshift | Entrega primero a S3 y luego ejecuta COPY, acumulando por tamaño o intervalo (*What is Amazon Data Firehose?*): la frescura queda limitada por ese buffer |
| Desde bases operacionales | Zero-ETL integrations | Replicación administrada desde Aurora, RDS o DynamoDB hacia Redshift, sin pipeline propio (*Zero-ETL integrations*) |
| Almacén | Redshift | Almacenamiento columnar para consultas analíticas (*Columnar storage*). No ejecutado |

## 13. Azure

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Desde bases operacionales | Mirroring en Fabric | Replica en casi tiempo real datos y metadatos hacia OneLake, con analítica integrada (*What is Mirroring in Fabric?*) |
| Ventanas y tardíos | Azure Stream Analytics | Política explícita para eventos fuera de orden: descartar o ajustar (*Understand time handling in Azure Stream Analytics*) |
| Analítica operacional | Columnstore en SQL Server y Azure SQL | Un columnstore no agrupado sobre una tabla rowstore permite analítica en tiempo real sobre la base operacional (*Columnstore indexes: overview*) |

## 14. Riesgos y modos de falla

| Riesgo | Cómo se detecta | Cómo se recupera |
|---|---|---|
| Tablero sobre la base transaccional | Latencia de la aplicación que sube con los refrescos | Réplica, mirroring o almacén de servicio aparte |
| Doble conteo por reintentos | Rollup mayor que el crudo deduplicado | Deduplicar por `event_id` antes de sumar |
| Frescura sin medir | Nadie nota un pipeline detenido | Alerta por frescura frente al objetivo |
| Consultas sobre el crudo | Costo y latencia que crecen con el volumen | Pre-agregados y particiones por tiempo |

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Llamar real-time al pipeline de streaming | Se optimiza la ingesta y la consulta sigue lenta |
| Presentar el último minuto como definitivo | Cifras que cambian sin aviso con los tardíos |
| Refresco del tablero más rápido que la frescura | Costo de consultas sin dato nuevo |
| Prometer segundos sin medir | Un objetivo que nadie verifica |

## 16. Trade-offs y alternativas

| Opción | Gana | Cuesta |
|---|---|---|
| Pre-agregar al escribir | Consultas baratas y rápidas | Solo responde las preguntas previstas |
| Consultar el crudo columnar | Cualquier pregunta | Costo y latencia por consulta |
| Vistas materializadas del motor | Sin código de rollup | Frescura según el refresco del motor |
| Warehouse con cargas por lote | Lo más simple | Frescura de horas |

## 17. Conceptos relacionados

- `streaming-pipeline-architecture`: lo que trae los datos frescos.
- `oltp-vs-olap` y `row-vs-columnar-formats`: dónde y cómo se guarda.
- `bigquery-materialized-views`: pre-agregados del motor.
- `data-freshness`: lo que se promete y se mide.
- `late-arriving-data` e `idempotency`: por qué los minutos recientes cambian y no se duplican.
- `lambda-architecture`: su capa de servicio cumple este papel.

## 18. Evolución

Se llega desde un warehouse con cargas por lote cuando el negocio pide el dato del último minuto, o desde un tablero sobre la base transaccional que empezó a afectarla. La señal para no adoptarla: nadie actúa sobre el dato antes de la reunión del día siguiente.

## 19. Laboratorio relacionado

Sin laboratorio en F4: no está entre las 6 arquitecturas de F4. El §10 corre en la CI.

## 20. Fuentes

- Microsoft Learn: *Online analytical processing*; *What is Mirroring in Fabric?*; *Understand time handling in Azure Stream Analytics*; *Columnstore indexes: overview*; *Create data quality rules*.
- Google Cloud: *Overview of BigQuery storage*; *Introduction to the Storage Write API (gRPC)*; *Create BigQuery subscriptions*; *Introduction to materialized views*; *Manage materialized views*; *Estimate and control costs*.
- AWS: *Columnar storage*; *What is Amazon Data Firehose?*; *Zero-ETL integrations*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-11-02: fichas de origen de cada cita revisadas; las páginas se consultaron en las fechas de `sources`. `verified`: aprobada el 2026-11-03 (`owner_approved_at`).

## 22. Historial de cambios importantes

- 2026-11-02: creación (lote 07b, ADR-028).
- 2026-11-02: las tres vistas usan los nombres del §4 (criterio de la revisión de 07a).
- 2026-11-03: el §19 ya no promete un laboratorio en F4: el ROADMAP lo deja para las 6 arquitecturas de F4, y esta no está entre ellas.
- 2026-11-03: revisión de 07b aplicada (docs/reviews/lote-07b.md): el §3 tiene el nodo «Medición de frescura» del §4.
- 2026-11-03: `verification_status: verified`, aprobada con lista explícita (`owner_approved_at: 2026-11-03`).

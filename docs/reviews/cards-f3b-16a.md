# Revisión B-F3.1 · lote F3b-16a

Rama `b/f3b-review-16a`, creada desde `origin/main` (`37b88d0`). El pedido está en `docs/status/lane-a.md`. Fichas: `data-observability`, `observability-logs`, `observability-metrics`, `observability-traces`, `data-freshness`, `volume-anomalies` y `schema-change-detection`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| *Managed Airflow overview* dice «Cloud Composer is evolving to become Managed Service for Apache Airflow». Siete fichas lo dan por hecho: `incremental-pipelines` («el nuevo nombre»), `data-pipeline` («Google renombró»), y `dag`, `catchup`, `backfill`, `api-ingestion` y `scheduler` («ex Cloud Composer»). `composer-environments` y `gcp-cloud-composer` dicen «antes», aunque sus notas citan la frase de la página. | media | Dejar el cambio en curso, con la frase de la página. Las notas que dicen «evoluciona» ya van en ese sentido. |
| Sin hallazgos en las siete fichas del lote. Lo ejecutado está en el test, con exporters en memoria. `volume-anomalies` no se presenta como ML. `data-observability` separa la práctica de data quality. `python-logging` solo enlaza. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 533 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== data-observability dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== observability-logs dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== observability-metrics dups [] missing17 [] sec14 True titles 7 sources 7 empty 0
== observability-traces dups [] missing17 [] sec14 True titles 6 sources 6 empty 0
== data-freshness dups [] missing17 [] sec14 True titles 5 sources 5 empty 0
== volume-anomalies dups [] missing17 [] sec14 True titles 5 sources 5 empty 0
== schema-change-detection dups [] missing17 [] sec14 True titles 5 sources 5 empty 0
```

`tests/test_observability_snippets.py` exige las frases de las fichas:

```
"frescura: última carga hace 2:57:00 -> ok"
"volumen: 410 filas vs media 1007 (-59%) -> ANÓMALO"
"schema: agregadas ['canal'], quitadas []"
"calidad (monto >= 0): 2/3 filas cumplen"
"'message': 'inicio', 'logger': 'pipeline.ventas', 'run_id': '2026-10-20'} sin trace_id"
"'table': 'pedidos', 'rows': 1200} con trace_id"
"mismo trace_id en los logs del span: True"
"pipeline.rows{table=pedidos}: suma 2000"
"pipeline.rows{table=clientes}: suma 50"
"pipeline.duration{table=pedidos}: 2 cargas, total 7.3 s"
"pipeline.duration{table=clientes}: 1 cargas, total 0.4 s"
"spans: 4; una sola traza: True"
"extract: padre=corrida, estado=UNSET"
"load: padre=corrida, estado=ERROR, eventos=['exception']"
"corrida: padre=raíz"
"pedidos: dato más reciente 2026-10-20 06:40 UTC, retraso 2.3 h, acuerdo 1 h -> ATRASADA"
"clientes: dato más reciente 2026-10-20 01:30 UTC, retraso 7.5 h, acuerdo 24 h -> ok"
"2026-10-14 (mié): 640 filas, mediana 1015, -37 % -> ANOMALÍA"
"2026-10-19 (lun): 405 filas, mediana 400, +1 % -> ok"
"sin cambios contra sí misma: True"
"agregada canal text"
"cambió monto: ('numeric', 'YES') -> ('bigint', 'YES')"
"cambió tienda: ('text', 'YES') -> ('text', 'NO')"
"quitada cupon"
```

Los logs van a un `StringIO`. Las métricas se leen con `InMemoryMetricReader`. Las trazas usan una clase propia sobre `SpanExporter`; la ficha dice que `InMemorySpanExporter` no está en la documentación publicada (ADR-020). No hay collector.

`data-observability` abre con «No es lo mismo que data quality» y la tabla del §2 separa reglas definidas de antemano de señales en el tiempo. Enlaza `data-quality-dimensions` y `quality-gate`.

`volume-anomalies` dice «No es machine learning». La mediana y la tolerancia fija quedan de un lado; CloudWatch, Glue Data Quality y los umbrales dinámicos de Azure Monitor, del otro, cada uno con su página.

El marco de GOV.UK (Nivel 4) está en `data-observability` y `data-freshness` para las dimensiones. `last_modified_time`, `DataFreshness` y el puntaje 100 o 0 de Purview están en las notas de BigQuery, Glue y Purview. `google-sre-book` no aparece en estas siete fichas.

Los bullets de costo no nombran un cobro. Dicen que medir metadatos es barato, que el volumen crece con la granularidad, y que Azure Monitor Logs permite retención por tipo de dato (está en la nota de *Azure Monitor Logs overview*).

Los 32 `page_title` distintos coinciden con el encabezado de la página. En PostgreSQL, `35.17. columns` es un `h2` (el `#` del enlace no entra). En el SDK de Python, el título incluye el icono de enlace que trae el `h1`.

## Composer

La página *Managed Airflow overview*, consultada el 2026-10-20, dice: «Cloud Composer is evolving to become Managed Service for Apache Airflow». El mismo texto está en las release notes.

`rg` sobre `content/` de las frases que lo dan por terminado:

```
content/concepts/incremental-pipelines.md:199: ... (ex Cloud Composer), el nuevo nombre de Cloud Composer
content/concepts/data-pipeline.md:210: ... (ex Cloud Composer): Google renombró Cloud Composer
content/concepts/dag.md:220: (ex Cloud Composer)
content/concepts/catchup.md:196: (ex Cloud Composer)
content/concepts/backfill.md:153: (ex Cloud Composer)
content/concepts/api-ingestion.md:203: (ex Cloud Composer)
content/concepts/scheduler.md:184: (ex Cloud Composer)
content/concepts/composer-environments.md:6: (antes Cloud Composer)
content/concepts/composer-environments.md:83: el servicio que antes se llamaba Cloud Composer
content/technologies/gcp-cloud-composer.yaml:6: (antes Cloud Composer)
```

Las notas de `dag`, `incremental-pipelines`, `data-pipeline`, `backfill` y `api-ingestion` dicen «evoluciona». `composer-environments` cita la frase en la nota de *Managed Airflow overview* y en el cuerpo, más adelante. `pipeline-health` (lote 16b) también la cita.

## Diff de python-logging

`git diff 3131818^..3131818 -- content/concepts/python-logging.md`. En ese commit, la única ficha que ya existía es esta. Solo la relación, el §17 y una línea de historial.

```diff
diff --git a/content/concepts/python-logging.md b/content/concepts/python-logging.md
index 2684441..4bc9cc0 100644
--- a/content/concepts/python-logging.md
+++ b/content/concepts/python-logging.md
@@ -55,6 +55,9 @@ relations:
   - type: RELATED_TO
     target: data-pipeline
     note: Los logs con identificador de ejecución y de lote permiten seguir un pipeline de punta a punta.
+  - type: RELATED_TO
+    target: observability-logs
+    note: Los logs como señal de observabilidad.
 created_at: 2026-10-02
 updated_at: 2026-10-13
 last_verified: 2026-10-04
@@ -230,7 +233,7 @@ Los logs estructurados cuestan un poco más de código y de bytes, a cambio de c
 - `python-error-handling-and-retries`: qué registrar en cada reintento y error.
 - `python-api-consumption`: logging de la ingesta desde APIs.
 - `data-pipeline`: correlación de eventos de una ejecución.
-- Del blueprint, pendiente de ficha: `observability-logs`.
+- `observability-logs`: los logs como señal de observabilidad, con trace_id.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -261,3 +264,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-04: revisión B-F3.1 del lote 5 aplicada (docs/reviews/cards-lote5.md): viñeta de Observabilidad en §14.
 - 2026-10-04: `verification_status: verified` (revisión B-F3.1 del lote 5 aplicada; sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-20: lote F3b-16a (regla del §17): relations y el §17 enlazan `observability-logs`, que ya tiene ficha; antes figuraba como pendiente de ficha.
```

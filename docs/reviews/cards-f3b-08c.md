# Revisión B-F3.1 · Lote F3b-08c

Fichas en `content/concepts/`, commit `9b02fc4`. Carril B no las edita. Las siete siguen en `review_required`. No hay comentarios `VERIFY`.

Las 7: `dataflow-execution-model`, `dataflow-streaming-pipelines`, `composer-environments`, `dataform-workflows`, `cloud-run-for-data`, `cloud-sql-as-source` y `vertex-ai-for-data-engineers`.

El 2026-10-12 contrasté el HTML de *Gemini Enterprise Agent Platform name changes*, *Managed Airflow overview*, las release notes de Composer, *Use the Dataflow Portable Runner* y *Configure a Cloud SQL for PostgreSQL database for CDC*. No reejecuté Beam, SQL, SQLX, Python ni Terraform.

`make` no está en el PATH. Con `.venv` recién instalado, `.\.venv\Scripts\python.exe scripts\validate.py` (lo que corre `make validate`) terminó así:

```text
OK: 369 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

Fuentes del registro: `gcp-dataflow-docs`, `apache-beam-docs`, `gcp-cloud-composer-docs`, `gcp-dataform-docs`, `gcp-cloud-run-docs`, `gcp-datastream-docs`, `gcp-bigquery-docs`, `gcp-cloud-sql-docs` y `gcp-agent-platform-docs` son `official_docs`, nivel 1. `gcp-cloud-composer-release-notes` es `release_notes`, nivel 2.

```text
Las 7 tienen fuentes de nivel 1, accessed 2026-10-11.
s14 Seguridad, Observabilidad y Costo: True en las 7.
related_topics ausentes en relations: ninguno.
Montos con $: ninguno.

dataflow-execution-model
  relations = §17. Sin slugs sin ficha.
dataflow-streaming-pipelines
  en el §17 y fuera de relations: watermarks, streaming-pipeline-architecture
  sin ficha: esas dos. El §17 dice «pendientes de ficha».
composer-environments
  title: Entornos de Managed Service for Apache Airflow
  aliases: [Entornos de Cloud Composer, Cloud Composer environments]
  relations = §17. Sin slugs sin ficha.
dataform-workflows
  relations = §17. Sin slugs sin ficha.
cloud-run-for-data
  relations = §17. Sin slugs sin ficha.
cloud-sql-as-source
  en el §17 y fuera de relations: cdc-architecture
  sin ficha: esa. El §17 dice «pendiente de ficha».
vertex-ai-for-data-engineers
  title: Gemini Enterprise Agent Platform para Data Engineers
  aliases: [Vertex AI para Data Engineers, Vertex AI]
  en el §17 y fuera de relations: ml-feature-pipeline-architecture, rag
  sin ficha: esas dos. El §17 dice «pendientes de ficha».

gcp-vertex-ai title: Gemini Enterprise Agent Platform
  aliases: [Vertex AI, Vertex AI Platform]
  fuente: .../vertex-ai-name-changes accessed 2026-10-11
gcp-cloud-composer title: Managed Service for Apache Airflow
  aliases: [Cloud Composer, Composer]
  release notes accessed 2026-09-29
  overview accessed 2026-10-11
```

Código (comentario del bloque y el párrafo que lo sigue):

```text
dataflow-execution-model: DirectRunner en local; no se corrió en Dataflow.
dataflow-streaming-pipelines: DirectRunner y TestStream en local; no se corrió en Dataflow.
composer-environments: Terraform validado en la CI con terraform validate; no se aplicó.
dataform-workflows: dataform compile con @dataform/cli 3.0.71, sin errores de grafo; no se ejecutó en BigQuery.
cloud-run-for-data: Python 3.12 en local, mypy --strict; no se desplegó en Cloud Run.
cloud-sql-as-source: PostgreSQL 17 local salvo el slot; EXTERNAL_QUERY «no ejecutado».
vertex-ai-for-data-engineers: BigQuery ML, GoogleSQL «no ejecutado».
```

Páginas (HTML, 2026-10-12):

```text
name changes, Last updated 2026-10-09 UTC.
  Vertex AI Platform → Gemini Enterprise Agent Platform
  Vertex AI → Agent Platform
overview: contiene «Cloud Composer is evolving to become Managed Service for Apache Airflow». No contiene «April 15, 2026».
release notes: «April 15, 2026 Announcement» y la misma frase.
portable runner: «The Dataflow Portable Runner was previously called Runner v2».
Datastream configure-cloudsql-psql: logical_decoding, publication, pgoutput y REPLICATION sí; wal_level no.
```

## `dataflow-execution-model`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes de nivel 1, consultadas el 2026-10-11. §14 completo, sin montos. El Beam dice ejecutado en local con DirectRunner y no corrido en Dataflow. `relations` coincide con el §17. *Use the Dataflow Portable Runner* dice «Portable Runner was previously called Runner v2» (página con *Last updated* 2026-10-09 UTC). La nota de la fuente y el §11 citan esa frase. | ninguna | — |

## `dataflow-streaming-pipelines`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes de nivel 1. §14 completo, sin montos. El Beam dice ejecutado en local con DirectRunner y TestStream, y no corrido en Dataflow. `watermarks` y `streaming-pipeline-architecture` no tienen ficha; el §17 las deja como pendientes de ficha y fuera de `relations`. El resto del §17 está en `relations`. | ninguna | — |

## `composer-environments`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Siete fuentes de nivel 1, consultadas el 2026-10-11. §14 completo: el costo remite a la página de precios y no copia montos. El Terraform dice validado en la CI y no aplicado. `relations` coincide con el §17. | ninguna | — |
| El §11 cita *Managed Airflow overview* («Cloud Composer is evolving to become Managed Service for Apache Airflow»), consultada el 2026-10-11. Ese HTML tiene la frase y no tiene la fecha del anuncio. La fecha está en las release notes: «April 15, 2026 Announcement», junto a la misma frase. `gcp-cloud-composer.yaml` sí cita esas notas (consulta 2026-09-29, «Anuncio del 15 de abril de 2026»). La ficha no. | media | Agregar la fuente de release notes y, en el §11, la fecha 15 de abril de 2026 junto a la cita. |

## `dataform-workflows`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cinco fuentes de nivel 1. §14 completo, sin montos. Los cuatro SQLX dicen compilados en local con `@dataform/cli` 3.0.71 y no ejecutados en BigQuery. `relations` coincide con el §17. Nombra Managed Service for Apache Airflow y enlaza `composer-environments`. | ninguna | — |

## `cloud-run-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cuatro fuentes de nivel 1. §14 completo, sin montos. El Python dice ejecutado en local simulando `CLOUD_RUN_TASK_INDEX` y `CLOUD_RUN_TASK_COUNT`, con `mypy --strict`, y no desplegado. `relations` coincide con el §17. | ninguna | — |

## `cloud-sql-as-source`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes de nivel 1. §14 completo, sin montos. El primer SQL dice ejecutado en PostgreSQL 17 local salvo el slot. `EXTERNAL_QUERY` dice «no ejecutado». `cdc-architecture` no tiene ficha; el §17 la deja como pendiente de ficha y fuera de `relations`. | ninguna | — |
| *Configure a Cloud SQL for PostgreSQL database for CDC* pide `cloudsql.logical_decoding` en on (y reiniciar), una publicación, un slot con `pgoutput` y un usuario con `REPLICATION`. Esa página no usa la palabra `wal_level`. La ficha atribuye esos pasos a esa guía y explica `wal_level` con el aviso de PostgreSQL 17 local («"wal_level" is insufficient to publish logical changes»), mapeado a la marca de Cloud SQL. El slot va comentado como no ejecutado. | ninguna | — |

## `vertex-ai-for-data-engineers`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Seis fuentes de nivel 1, consultadas el 2026-10-11. §14 completo, sin montos. El BigQuery ML dice «no ejecutado». `ml-feature-pipeline-architecture` y `rag` no tienen ficha; el §17 las deja como pendientes de ficha y fuera de `relations`. El resto del §17 está en `relations`. | ninguna | — |
| La primera fila de *Gemini Enterprise Agent Platform name changes* (consulta 2026-10-12; la página dice *Last updated* 2026-10-09 UTC; la fuente de la ficha, `accessed: 2026-10-11`) es Vertex AI Platform → Gemini Enterprise Agent Platform. El título de la ficha y el de `gcp-vertex-ai` citan esa fila. La misma tabla, al final, dice Vertex AI → Agent Platform. `gcp-vertex-ai` pone «Vertex AI» y «Vertex AI Platform» como alias del título Gemini Enterprise Agent Platform. La ficha también usa «Vertex AI» como alias y el §1 dice que los nombres nuevos van «con «Vertex AI» como alias». | media | Dejar «Vertex AI Platform» como alias de Gemini Enterprise Agent Platform. No listar «Vertex AI» a secas como alias de ese producto: la página lo mapea a «Agent Platform». Decirlo en la nota de `gcp-vertex-ai` y en el §1 y el §11 de la ficha. |

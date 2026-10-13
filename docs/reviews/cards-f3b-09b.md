# Revisión B-F3.1 · Lote F3b-09b

Fichas en `content/concepts/`, commit `6a13b5b`. Carril B no las edita. Las ocho siguen en `review_required`. No hay comentarios `VERIFY`. No revisé `page_title`.

Las 8: `lambda-for-data`, `step-functions-workflows`, `mwaa-managed-airflow`, `rds-as-source`, `aws-iam-for-data`, `cloudwatch-for-data-pipelines`, `bedrock-for-data-engineers` y `sagemaker-for-data-engineers`.

El 2026-10-13 contrasté el HTML de *What is Amazon SageMaker AI?*, su *Document history*, *Apache Airflow versions on Amazon MWAA*, *What is Amazon MWAA Serverless?*, la página de precios de MWAA y *Publish custom metrics*. No reejecuté moto, DagBag ni Terraform.

`make` no está en el PATH. Con el `.venv` del proyecto, `.\.venv\Scripts\python.exe scripts\validate.py` (lo que corre `make validate`) terminó así:

```text
OK: 389 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

`aws-lambda-docs`, `aws-step-functions-docs`, `aws-mwaa-docs`, `aws-iam-docs`, `aws-cloudwatch-docs`, `aws-bedrock-docs` y `aws-sagemaker-docs` son `official_docs`, nivel 1. Las fuentes de las 8 fichas tienen `accessed: 2026-10-12`.

```text
s14 Seguridad, Observabilidad y Costo: True en las 8.
Montos con $ o USD: ninguno.
related_topics ausentes en relations: ninguno.
relations no nombradas en el §17: ninguno.

lambda-for-data, step-functions-workflows, mwaa-managed-airflow,
aws-iam-for-data, cloudwatch-for-data-pipelines:
  §17 = relations. Sin slugs sin ficha.

rds-as-source: cdc-architecture sin ficha; el §17 dice «pendiente de ficha».
bedrock-for-data-engineers: rag sin ficha; el §17 dice «pendiente de ficha».
sagemaker-for-data-engineers: ml-feature-pipeline-architecture sin ficha; el §17 dice «pendiente de ficha».

sagemaker-for-data-engineers title: SageMaker AI para Data Engineers
  aliases: [SageMaker para Data Engineers]
aws-sagemaker title: Amazon SageMaker AI
  aliases: [Amazon SageMaker]
```

En este commit, `content/concepts/aws-iam-for-data.md` existe y `lake-formation-permissions` (lote 09a) sigue con «pendiente de ficha: `aws-iam-for-data`». Carril A ya lo dejó para cuando 09a pase a `verified`.

Código y CI. `.github/workflows/ci.yml` pone `REQUIRE_AWS_SNIPPETS=1` en `make test`, corre `make validate-terraform` y `make check-airflow-dag`. El `Makefile` fija `AIRFLOW_VERSION := 3.3.2`. `tests/test_snippet_code.py`:

```text
test_lambda_snippet_writes_curated_once_and_reports_sqs_failures  (S3 contra moto; SQS con evento)
test_cloudwatch_snippet_publishes_metric_and_alarm_on_missing_data
test_sagemaker_snippet_creates_feature_group_and_transform_job
test_bedrock_snippet_builds_jsonl_and_joins_unordered_output  (sin llamada a AWS)
test_dms_cdc_snippet_applies_changes_in_file_order_idempotently  (sin llamada a AWS)
test_step_functions_definition_is_valid_json_with_reachable_states  (JSON, no ejecución)
test_aws_snippets_pass_mypy_strict  (incluye bedrock y rds)
scripts/snippets/airflow_dag_checks.py: mwaa-managed-airflow
```

Bloques `hcl` con «no se aplicó»: `mwaa-managed-airflow`, `rds-as-source`, `aws-iam-for-data`. IAM dice que no hay Python ejecutado porque moto no evalúa políticas.

Páginas (HTML, 2026-10-13):

```text
What is Amazon SageMaker AI:
  «On December 03, 2024, Amazon SageMaker was renamed to Amazon SageMaker AI.»
  «On December 03, 2024, Amazon released the next generation of Amazon SageMaker.
   Amazon SageMaker is a unified platform for data, analytics, and AI»
  e incluye SageMaker AI, SageMaker Lakehouse y Data and AI Governance.
Document history, fila:
  «Amazon SageMaker renamed to Amazon SageMaker AI» — December 3, 2024.
MWAA versions: v3.3.1, disponible en MWAA el September 1, 2026, Python 3.12.
  «3.3.2» no está en esa tabla.
MWAA Serverless: sin entorno, workflows en YAML, Airflow v3 con Python 3.12,
  cobro por el tiempo de cómputo de las tareas.
MWAA pricing: «You pay per task for its duration, for a minimum of 1 minute.»
CloudWatch publishingMetrics:
  «For new implementations, we recommend using OpenTelemetry to publish custom metrics.»
```

## `lambda-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El Python dice ejecutado en la CI: S3 contra moto y SQS con un evento de ejemplo; no desplegado. El test es `test_lambda_snippet_writes_curated_once_and_reports_sqs_failures` y entra en `mypy --strict`. `relations` coincide con el §17. El §11 dice que Cloud Run tiene otros límites y otro modelo de ejecución. | ninguna | — |

## `step-functions-workflows`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El ASL dice validado en la CI como JSON y por estructura, y no ejecutado en Step Functions ni en moto. El test es `test_step_functions_definition_is_valid_json_with_reachable_states`. `relations` coincide con el §17. | ninguna | — |
| El §11 dice que Composer y el panorama de orquestación tienen «otros modelos» y no son equivalentes, y no dice en qué difieren. | media | Decir la diferencia: Step Functions es una máquina de estados en Amazon States Language; esas fichas describen Dags de Airflow y el panorama de orquestadores. |

## `mwaa-managed-airflow`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. La tabla de versiones de MWAA, al 2026-10-13, lista v3.3.1 (1 de septiembre de 2026, Python 3.12) y no lista 3.3.2. La ficha dice eso, y el Dag de la CI es Airflow 3.3.2 (`AIRFLOW_VERSION` y `make check-airflow-dag`), con tareas no ejecutadas y sin subirlo a MWAA. *What is Amazon MWAA Serverless?* describe la opción sin entorno, workflows en YAML y cobro por el tiempo de las tareas. La página de precios dice el mínimo de 1 minuto por tarea; la ficha no copia montos. El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 dice que el servicio de `composer-environments` tiene otra arquitectura, otras versiones y otra forma de cargar los Dags. | ninguna | — |

## `rds-as-source`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. El Python de CDC se ejecuta en la CI sobre textos de ejemplo y dice que no leyó archivos reales de DMS. El Terraform de la replicación dice validado y no aplicado, y que moto no simula DMS. `cdc-architecture` no tiene ficha; el §17 la deja como pendiente de ficha. El §11 dice que Cloud SQL con Datastream tiene otros pasos y otro destino por defecto. | ninguna | — |

## `aws-iam-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. No hay política evaluada: la ficha dice que no hay Python ejecutado porque moto no simula la evaluación de IAM, y el Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 dice que el IAM de GCP tiene otro modelo de roles, de jerarquía de recursos y de cuentas de servicio. | ninguna | — |

## `cloudwatch-for-data-pipelines`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. *Publish custom metrics* recomienda OpenTelemetry para implementaciones nuevas. El snippet usa `PutMetricData`, corre en la CI contra moto y lo dice. `relations` coincide con el §17. | ninguna | — |
| El §11 dice que el monitoreo en GCP usa «otras herramientas» y no son equivalentes, y no dice en qué difieren. | media | Decir la diferencia: CloudWatch publica métricas, alarmas y logs; `bigquery-monitoring` y `orchestration-observability` cubren otras superficies. |

## `bedrock-for-data-engineers`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. `build_jsonl` y `join_outputs` corren en la CI sin llamada a AWS. `submit_job` dice no ejecutado porque moto no simula `CreateModelInvocationJob`. Entra en `mypy --strict`. `rag` no tiene ficha; el §17 la deja como pendiente de ficha. | ninguna | — |
| El §11 remite a `vertex-ai-for-data-engineers` «con otro modelo» y no dice en qué difieren. La frase es la misma que en `sagemaker-for-data-engineers`. | media | Decir que Bedrock es modelos fundacionales administrados e inferencia por lotes, y que esa ficha de GCP describe otra plataforma. |

## `sagemaker-for-data-engineers`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Fuentes de nivel 1, consultadas el 2026-10-12. §14 completo, sin montos. *What is Amazon SageMaker AI?* dice, el 3 de diciembre de 2024, que Amazon SageMaker pasó a llamarse Amazon SageMaker AI, y que ese día salió Amazon SageMaker como plataforma unificada que incluye a SageMaker AI. La fila del *Document history* de esa fecha titula «Amazon SageMaker renamed to Amazon SageMaker AI». La ficha dice las dos cosas. `aws-sagemaker` se titula «Amazon SageMaker AI» y deja «Amazon SageMaker» como alias, con una nota de que ese nombre también es el de la plataforma. El Python corre en la CI contra moto y no contra AWS. `ml-feature-pipeline-architecture` no tiene ficha; el §17 la deja como pendiente de ficha. | ninguna | — |
| El §11 remite a `vertex-ai-for-data-engineers` «con otro modelo» y no dice en qué difieren. | media | Decir que SageMaker AI entrena y despliega modelos propios (Feature Store y batch transform) y que la ficha de GCP describe otra plataforma. |

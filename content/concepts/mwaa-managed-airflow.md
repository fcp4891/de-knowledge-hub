---
id: concept:mwaa-managed-airflow
slug: mwaa-managed-airflow
type: concept
title: Airflow administrado con MWAA
description: "Qué administra Amazon MWAA según su documentación: en el entorno provisionado, scheduler y workers en Fargate dentro de la VPC del cliente, metabase administrada, Dags y requirements.txt en S3 (con --constraint), clases mw1 por cantidad de Dags y tareas, y versiones soportadas (la última listada, Airflow 3.3.1 con Python 3.12); y MWAA Serverless, sin entorno, con workflows en YAML y cobro por tarea. Los precios se consultan en su página."
domain: aws
subdomain: orchestration-and-compute
category: aws
classification: modern
level: intermediate
importance: medium
cloud: [aws]
technologies: [aws-mwaa, apache-airflow, aws-s3, terraform, python]
tags: [mwaa, airflow, orchestration, managed]
related_topics: [open-source-vs-managed-orchestration, composer-environments]
sources:
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/what-is-mwaa.html
    accessed: 2026-10-12
    note: "What Is Amazon Managed Workflows for Apache Airflow?: servicio administrado de Apache Airflow para crear workflows con Airflow y Python sin administrar la infraestructura; escala solo. Arquitectura: el scheduler y los workers son contenedores de AWS Fargate conectados a subredes privadas de la VPC del entorno; cada entorno tiene su metabase de Airflow administrada por AWS, accesible por un endpoint privado; CloudWatch, S3, SQS y KMS son servicios aparte que deben ser accesibles desde schedulers y workers."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/airflow-versions.html
    accessed: 2026-10-12
    note: "Apache Airflow versions on Amazon MWAA: MWAA arma imágenes con cada versión de Airflow; el entorno usa la versión indicada hasta que se actualiza, y sin indicar versión se crea con la última soportada. Tabla consultada el 2026-10-12: v3.3.1 (disponible en MWAA el 1 de septiembre de 2026, Python 3.12), v3.2.1, v2.11.2 y anteriores. Desde Airflow 2.7.2, requirements.txt debe incluir --constraint; si falta, MWAA agrega uno. MWAA no admite el modo multi-team."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/configuring-dag-folder.html
    accessed: 2026-10-12
    note: "Adding or updating DAGs: los Dags se suben a la carpeta dags/ del bucket de S3 del entorno; MWAA sincroniza los archivos a los componentes cada 30 segundos, conservando la jerarquía; el tiempo hasta que aparece un Dag nuevo depende de scheduler.dag_dir_list_interval."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/working-dags-dependencies.html
    accessed: 2026-10-12
    note: "Installing Python dependencies: requirements.txt con --constraint apuntando al archivo de constraints de la versión de Airflow y de Python; si un paquete no es compatible, la instalación falla para no dejar librerías incompatibles."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/environment-class.html
    accessed: 2026-10-12
    note: "Configuring the Amazon MWAA environment class: mw1.small (hasta 50 Dags, 5 tareas concurrentes por defecto), mw1.medium (hasta 250 Dags, 10 tareas), mw1.large (hasta 1.000 Dags, 20 tareas), mw1.xlarge (hasta 2.000 Dags, 40 tareas), con vCPU y memoria por componente."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/mwaa-serverless-userguide/what-is-mwaa-serverless.html
    accessed: 2026-10-12
    note: "What is Amazon MWAA Serverless?: opción de despliegue de MWAA sin entornos que administrar; aprovisiona recursos para ejecuciones programadas y a pedido, y cobra por el tiempo de cómputo de las tareas. Cada workflow corre con su propio rol de ejecución y worker, opcionalmente en la VPC del cliente; los workflows se definen en archivos YAML; tiene versionado de workflows. Usa Apache Airflow v3 con Python 3.12."
  - source: aws-mwaa-docs
    url: https://aws.amazon.com/managed-workflows-for-apache-airflow/pricing/
    accessed: 2026-10-12
    note: "Amazon MWAA pricing: en MWAA Serverless se paga por tarea según su duración, con un mínimo de 1 minuto; en un entorno provisionado se paga por hora de entorno según su tamaño (facturado por segundo), más los workers adicionales del autoescalado. Los montos no se copian."
relations:
  - type: RELATED_TO
    target: open-source-vs-managed-orchestration
    note: MWAA es la opción administrada de Airflow en AWS.
  - type: RELATED_TO
    target: composer-environments
    note: El Airflow administrado de GCP, con otra arquitectura y otras versiones; no son lo mismo.
  - type: RELATED_TO
    target: airflow-architecture
    note: Los mismos componentes de Airflow, administrados por AWS.
  - type: RELATED_TO
    target: dag
    note: Los Dags se suben a S3.
  - type: RELATED_TO
    target: catchup
    note: El Dag del ejemplo desactiva catchup.
  - type: RELATED_TO
    target: step-functions-workflows
    note: La otra opción de orquestación administrada en AWS.
  - type: RELATED_TO
    target: s3-data-lake
    note: El bucket del entorno guarda Dags y requirements.txt.
  - type: RELATED_TO
    target: aws-iam-for-data
    note: El rol de ejecución del entorno o de cada workflow.
  - type: RELATED_TO
    target: cloudwatch-for-data-pipelines
    note: Logs y métricas del entorno.
created_at: 2026-10-12
updated_at: 2026-10-12
last_verified: 2026-10-12
verification_status: review_required
---

## 1. Resumen

**Amazon MWAA** ejecuta Apache Airflow administrado. Según su documentación:

- el **scheduler** y los **workers** corren en contenedores de **Fargate** dentro de subredes privadas de la VPC del cliente, con una **metabase** propia que administra AWS;
- los **Dags** y el **`requirements.txt`** viven en un **bucket de S3** y MWAA los sincroniza cada 30 segundos;
- la **clase de entorno** (`mw1.small` a `mw1.xlarge` y más) fija cuántos Dags y tareas concurrentes soporta;
- la última versión listada es **Airflow 3.3.1**, con Python 3.12.

Además del entorno provisionado, **MWAA Serverless** es otra opción de despliegue: no hay entorno, cada workflow corre con su propio rol, los workflows se definen en YAML y se paga por el tiempo de las tareas.

El código de los Dags es Airflow estándar: lo que cambia frente a un Airflow propio es dónde se suben los archivos, cómo se instalan las dependencias y qué no se administra.

## 2. Qué es

- **Entorno:** una instalación de Airflow con su versión, su clase y su red.
- **Componentes:** schedulers y workers en Fargate, webserver, metabase administrada. CloudWatch, S3, SQS y KMS son servicios aparte que deben ser accesibles desde el entorno.
- **Bucket del entorno:** `dags/`, `requirements.txt` y plugins.
- **Versiones:** imágenes de MWAA con cada versión de Airflow. Tabla al 2026-10-12: 3.3.1 (Python 3.12), 3.2.1, 2.11.2 y anteriores. El entorno sigue en su versión hasta que se actualiza.
- **Dependencias:** desde Airflow 2.7.2, `requirements.txt` lleva `--constraint` con el archivo de constraints de la versión; si falta, MWAA agrega uno.
- **MWAA Serverless:** opción sin entorno, con Airflow v3 y Python 3.12; cada workflow con su rol de ejecución y su worker; workflows en YAML y con versionado; cobro por duración de las tareas.
- **Clases (entorno provisionado):**

| Clase | Dags (hasta) | Tareas concurrentes (por defecto) |
|---|---|---|
| `mw1.small` | 50 | 5 |
| `mw1.medium` | 250 | 10 |
| `mw1.large` | 1.000 | 20 |
| `mw1.xlarge` | 2.000 | 40 |

## 3. Problema que resuelve

Operar Airflow exige mantener scheduler, workers, metabase, actualizaciones y escalado. MWAA lo administra y deja al equipo los Dags y sus dependencias, con Airflow estándar.

## 4. Cómo funciona

1. Se crea el entorno con versión, clase, bucket, rol de ejecución y red privada.
2. Se suben los Dags a `dags/` y el `requirements.txt` al bucket.
3. MWAA sincroniza los archivos a los componentes cada 30 segundos; un Dag nuevo aparece según `scheduler.dag_dir_list_interval`.
4. El scheduler programa las tareas y los workers las ejecutan con el rol del entorno.
5. CloudWatch, S3, SQS y KMS son servicios aparte que el entorno usa desde su red privada.

## 5. Cuándo utilizarlo

- Equipos que ya usan Airflow y quieren dejar de operarlo.
- Pipelines con muchos Dags, dependencias entre tareas y backfills.
- Orquestar servicios de AWS y externos desde un solo lugar.

## 6. Cuándo no utilizarlo

- Pocos pasos serverless dentro de AWS con integraciones `.sync`: Step Functions (ver `step-functions-workflows`) puede bastar. Si se quiere Airflow sin entorno siempre encendido, MWAA Serverless.
- Necesitar el modo multi-team de Airflow: MWAA no lo admite.
- Una versión de Airflow que MWAA todavía no ofrece.

## 7. Ejemplo sencillo

El Dag `ventas_diarias_mwaa` corre a las 3:00 UTC con tres tareas (`extraer`, `transformar`, `publicar`), dos reintentos por tarea y sin catchup. Se sube como un archivo a `dags/` y aparece en el entorno tras la sincronización.

## 8. Ejemplo de producción

Un entorno `mw1.small` con Airflow 3.3.1 en subredes privadas:

- `dags/` y `requirements.txt` versionados en Git y copiados al bucket por la CI;
- `requirements.txt` con `--constraint` de la versión de Airflow y Python del entorno;
- logs de tareas en CloudWatch;
- el rol de ejecución solo puede leer y escribir los prefijos del lake que usan los Dags.

Cuando los Dags pasan de 50, se cambia la clase a `mw1.medium`.

## 9. Arquitectura

```mermaid
flowchart LR
  GIT["Git: dags/ y requirements.txt"] -- "CI copia" --> B["Bucket del entorno<br/>dags/, requirements.txt"]
  B -- "sincroniza cada 30 s" --> ENV
  subgraph ENV["Entorno MWAA (VPC privada)"]
    SCH["Scheduler (Fargate)"] --> W["Workers (Fargate)"]
    SCH --> DB["Metabase administrada"]
  end
  W --> LAKE["s3://lake/"]
  W --> CW["CloudWatch Logs"]
```

## 10. Código

```python
# Airflow 3.3.2 (cargado en la CI con DagBag, sin errores de import; las tareas no se ejecutan). En MWAA la última
# versión listada es la 3.3.1: el Dag usa solo la API del SDK de tareas, presente en ambas. Se sube a la carpeta
# dags/ del bucket del entorno; sin proveedores extra, así no depende de requirements.txt.
import datetime

from airflow.sdk import dag, task


@dag(
    dag_id="ventas_diarias_mwaa",
    schedule="0 3 * * *",
    start_date=datetime.datetime(2026, 10, 1, tzinfo=datetime.timezone.utc),
    catchup=False,
    max_active_runs=1,
    default_args={"retries": 2, "retry_delay": datetime.timedelta(minutes=5)},
    tags=["mwaa", "ventas"],
)
def ventas_diarias_mwaa() -> None:
    @task
    def extraer(ds: str | None = None) -> str:
        # En el entorno: leer del origen y escribir en s3://lake/raw/ventas/dt=<ds>/ (idempotente por día).
        return f"raw/ventas/dt={ds}/"

    @task(execution_timeout=datetime.timedelta(minutes=30))
    def transformar(prefijo: str) -> str:
        return prefijo.replace("raw/", "curated/")

    @task
    def publicar(prefijo: str) -> None:
        print(f"listo: {prefijo}")

    publicar(transformar(extraer()))


ventas_diarias_mwaa()
```

```text
--constraint "https://raw.githubusercontent.com/apache/airflow/constraints-3.3.1/constraints-3.12.txt"
```

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): entorno de MWAA con la
# versión de Airflow fijada, la carpeta de Dags y el requirements.txt en S3, y logs de tareas en CloudWatch.
# Requiere: provider hashicorp/aws ~> 6.0; bucket, rol de ejecución, subredes privadas y security group existentes.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "dags_bucket_arn" {
  type = string
}

variable "execution_role_arn" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

resource "aws_mwaa_environment" "datos" {
  name                 = "plataforma-datos"
  airflow_version      = "3.3.1"
  environment_class    = "mw1.small"
  source_bucket_arn    = var.dags_bucket_arn
  dag_s3_path          = "dags/"
  requirements_s3_path = "requirements.txt"
  execution_role_arn   = var.execution_role_arn

  network_configuration {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.security_group_id]
  }

  logging_configuration {
    task_logs {
      enabled   = true
      log_level = "INFO"
    }
  }
}
```

El Dag se **carga en la CI con DagBag** (Airflow 3.3.2, sin errores de import; `make check-airflow-dag`) y sus aserciones comprueban las dependencias y los reintentos; **las tareas no se ejecutan**. MWAA lista 3.3.1 como su última versión: el Dag usa solo el SDK de tareas (`airflow.sdk`), presente en ambas. **No se subió a MWAA.**

El `requirements.txt` muestra solo la línea de constraints, con el formato de *Installing Python dependencies*; **no se instaló**. El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**.

## 11. GCP

No aplica de forma específica: esta ficha describe MWAA. En GCP, Airflow administrado es el servicio de `composer-environments`, con otra arquitectura, otras versiones y otra forma de cargar los Dags; no son lo mismo.

## 12. AWS

**Amazon MWAA.** La arquitectura, el bucket del entorno, la sincronización, las versiones (tabla consultada el 2026-10-12), `--constraint` y las clases de entorno son los de sus páginas. Los precios por clase y componentes adicionales se consultan en la página de precios.

## 13. Azure

No aplica de forma específica.

## 14. Buenas prácticas

- Fijar la versión de Airflow del entorno y probar los Dags con esa versión.
- `requirements.txt` siempre con `--constraint` de la versión.
- Dags y dependencias versionados en Git y copiados por la CI, nunca a mano.
- Clase según la cantidad de Dags y tareas concurrentes.
- **Seguridad:** entorno en subredes privadas; el rol de ejecución con acceso solo a lo que usan los Dags (ver `aws-iam-for-data`); secretos fuera del código.
- **Observabilidad:** logs de tareas en CloudWatch; seguir duración, reintentos y tareas en cola (ver `cloudwatch-for-data-pipelines`).
- **Costo:** el entorno provisionado se cobra por hora mientras existe, más los workers adicionales; MWAA Serverless cobra por duración de las tareas, con un mínimo de 1 minuto por tarea. Los montos se consultan en la página de precios.

## 15. Errores frecuentes

- Un `requirements.txt` sin constraints que rompe la instalación del entorno.
- Probar los Dags con una versión de Airflow distinta de la del entorno.
- Subir Dags al bucket a mano, sin revisión.
- Un entorno provisionado siempre encendido para pocos workflows que cabrían en MWAA Serverless o en Step Functions.

## 16. Trade-offs

MWAA provisionado da Airflow estándar sin operar sus componentes, a cambio de pagar el entorno mientras existe y de esperar a que AWS ofrezca cada versión. MWAA Serverless cobra por uso y aísla cada workflow, con workflows en YAML. Step Functions es serverless y se paga por uso, con un lenguaje propio y menos herramientas para backfills. Un Airflow propio da control total, con toda la operación.

## 17. Conceptos relacionados

- `open-source-vs-managed-orchestration` y `airflow-architecture`: qué se administra y qué no.
- `composer-environments`: el Airflow administrado de GCP.
- `dag` y `catchup`: el Dag del ejemplo.
- `step-functions-workflows`: la alternativa serverless.
- `s3-data-lake`: el bucket del entorno y los datos.
- `aws-iam-for-data` y `cloudwatch-for-data-pipelines`: rol y monitoreo.

## 18. Preguntas técnicas abiertas

1. ¿Cuántos Dags y tareas concurrentes tienes, y qué clase de entorno te toca?
2. ¿Cómo pruebas tus Dags con la misma versión que el entorno?
3. ¿Qué pipelines pasarías a Step Functions?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- AWS, Amazon MWAA User Guide: *What Is Amazon Managed Workflows for Apache Airflow?*, *Apache Airflow versions on Amazon MWAA*, *Adding or updating DAGs*, *Installing Python dependencies* y *Configuring the Amazon MWAA environment class*; *What is Amazon MWAA Serverless?*; *Amazon MWAA pricing*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-12. `review_required`: pendiente de revisión B-F3.1 del lote F3b-09b.

## 22. Historial de cambios importantes

- 2026-10-12: creación (lote F3b-09b).

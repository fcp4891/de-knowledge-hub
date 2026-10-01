---
id: code_snippet:airflow-daily-partition-dag
slug: airflow-daily-partition-dag
type: code_snippet
title: DAG diario de Airflow que reemplaza una partición de BigQuery
description: "Dag de Airflow 3 (TaskFlow) que valida el staging del día lógico y reemplaza la partición del día en BigQuery dentro de una transacción; reejecutarlo no duplica."
language: python
dialect: airflow3
requirements:
  - "Apache Airflow 3.x (Managed Service for Apache Airflow, Amazon MWAA o autoalojado) con google-cloud-bigquery instalado en el entorno."
  - "Credenciales de Google Cloud disponibles para el entorno (Application Default Credentials o la cuenta de servicio del entorno) con roles/bigquery.jobUser en el proyecto y roles/bigquery.dataEditor en los datasets."
  - "Tablas proyecto.staging.ventas y proyecto.dwh.ventas con la misma estructura y una columna fecha DATE; dwh.ventas particionada por fecha."
  - "El archivo va en la carpeta de Dags del entorno."
classification: core
level: intermediate
cloud: [gcp]
technologies: [apache-airflow, gcp-cloud-composer, gcp-bigquery, python]
tags: [airflow, orchestration, bigquery, idempotency]
related_topics: [data-pipeline, backfill, idempotency, bigquery-partitioning, dag, catchup]
sources:
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/stable/tutorial/taskflow.html
    accessed: 2026-10-01
    note: "TaskFlow en Airflow 3.3.2 importa dag y task desde airflow.sdk; @task(retries=3) configura reintentos; las claves de contexto se reciben como argumentos keyword-only; pasar el resultado de una tarea a otra crea la dependencia."
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html
    accessed: 2026-10-01
    note: "ds es la logical date del Dag run como YYYY-MM-DD; solo está disponible cuando el DagRun tiene logical_date."
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/task-sdk/stable/api.html
    accessed: 2026-10-01
    note: "catchup: hacer catchup del scheduler o solo correr el último intervalo; False por defecto."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/parameterized-queries
    accessed: 2026-10-01
    note: "Con la biblioteca cliente de Python: bigquery.Client(), QueryJobConfig(query_parameters=[ScalarQueryParameter(nombre, tipo, valor)]) y client.query_and_wait(query, job_config=...); parámetros con nombre usando @nombre; un parámetro no puede ser NULL ni reemplazar identificadores o nombres de tabla."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/multi-statement-queries
    accessed: 2026-10-01
    note: "Consultas de varias sentencias; su propio ejemplo usa un parámetro de consulta (@id) dentro de la consulta; cada sentencia corre como un job hijo."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/transactions
    accessed: 2026-10-01
    note: "Transacciones de varias sentencias con commit o rollback atómico."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    note: "roles/bigquery.jobUser permite ejecutar consultas en el proyecto; roles/bigquery.dataEditor sobre un dataset permite modificar sus tablas."
relations:
  - type: IMPLEMENTS
    target: data-pipeline
    note: Pipeline diario con dependencias, reintentos y fecha lógica.
  - type: RELATED_TO
    target: backfill
    note: Como cada ejecución reemplaza su día, un backfill es reejecutar intervalos.
  - type: DEPENDS_ON
    target: idempotency
    note: El reemplazo transaccional de la partición hace seguro reintentar y reejecutar.
  - type: RELATED_TO
    target: bigquery-partitioning
    note: La unidad de reemplazo es la partición diaria.
  - type: IMPLEMENTS
    target: dag
    note: Tareas TaskFlow con dependencias, reintentos y la fecha lógica del intervalo.
  - type: RELATED_TO
    target: catchup
    note: Con catchup activado, cada intervalo recuperado reemplaza su partición sin duplicar.
created_at: 2026-10-01
updated_at: 2026-10-01
last_verified: 2026-10-01
verification_status: review_required
---

## 1. Qué resuelve

Orquesta la carga diaria de una tabla particionada: comprueba que el staging del día lógico tenga datos y reemplaza la partición de ese día en BigQuery dentro de una transacción. Reintentar una tarea, reejecutar el día o hacer un backfill da siempre el mismo resultado. Implementa `data-pipeline` y reutiliza su ejemplo de la sección 10 (TaskFlow y transacción de `replace_partition`), ahora completo y ejecutable.

## 2. Código

```python
# Airflow 3 (TaskFlow) + google-cloud-bigquery: validar el staging y reemplazar la partición del día lógico.
from datetime import datetime

from airflow.sdk import dag, task
from google.cloud import bigquery

COUNT_STAGING = """
SELECT COUNT(*) AS filas FROM `proyecto.staging.ventas` WHERE fecha = CAST(@dia AS DATE)
"""

REPLACE_PARTITION = """
BEGIN TRANSACTION;
DELETE FROM `proyecto.dwh.ventas` WHERE fecha = CAST(@dia AS DATE);
INSERT INTO `proyecto.dwh.ventas`
SELECT * FROM `proyecto.staging.ventas` WHERE fecha = CAST(@dia AS DATE);
COMMIT TRANSACTION;
"""


def day_config(ds: str) -> bigquery.QueryJobConfig:
    return bigquery.QueryJobConfig(query_parameters=[bigquery.ScalarQueryParameter("dia", "STRING", ds)])


@dag(schedule="@daily", start_date=datetime(2026, 9, 1), catchup=False)
def ventas_diarias():
    @task(retries=3)
    def validar_staging(*, ds: str) -> int:
        rows = list(bigquery.Client().query_and_wait(COUNT_STAGING, job_config=day_config(ds)))
        filas = rows[0].filas
        if filas == 0:
            raise ValueError(f"staging vacío para {ds}: no se reemplaza la partición")
        return filas

    @task(retries=3)
    def reemplazar_particion(filas: int, *, ds: str) -> None:
        bigquery.Client().query_and_wait(REPLACE_PARTITION, job_config=day_config(ds))

    reemplazar_particion(validar_staging())


ventas_diarias()
```

## 3. Cómo funciona

1. El Dag corre una vez por día; `ds` es la **fecha lógica** del intervalo (`YYYY-MM-DD`), no la fecha actual.
2. `validar_staging` cuenta las filas del día en staging y falla si no hay ninguna: así una extracción vacía no borra la partición buena.
3. `reemplazar_particion` depende de la anterior (recibe su resultado) y ejecuta el `DELETE` + `INSERT` del día en una **transacción**: si algo falla antes del `COMMIT`, la partición queda como estaba.
4. El día se pasa como **parámetro de consulta** (`@dia`), no concatenado en el SQL.

Es **idempotente**: reintentar la tarea o reejecutar el día vuelve a reemplazar la misma partición con los mismos datos.

## 4. Cuándo usarlo

- Cargas diarias por partición de un staging ya poblado (por ejemplo, con `python-api-ingestion-retries`).
- Cuando se quiere que reintentos, reejecuciones y backfills no requieran lógica especial.

## 5. Cuándo no usarlo

- Para cambios por clave dispersos en muchos días: corresponde un `MERGE` (`bigquery-incremental-merge-watermark`).
- Si el staging no se puede filtrar por la fecha lógica del intervalo.
- Para flujos de eventos de baja latencia: corresponde streaming, no un Dag diario.

## 6. Riesgos

- **Staging parcial:** la validación solo detecta "vacío"; si la extracción puede quedar a medias, agregar una comparación de conteos con el origen.
- **Columnas distintas:** `SELECT *` exige que staging y destino tengan las mismas columnas en el mismo orden; con esquemas que evolucionan, listar las columnas.
- **Seguridad:** la cuenta del entorno de Airflow necesita escribir en el dataset de destino; limitar sus permisos a esos datasets.
- **Costo:** cada reejecución reescribe la partición completa del día; con `catchup` activado, un `start_date` antiguo puede lanzar muchas ejecuciones.

## 7. Requisitos y cómo ejecutarlo

Ver `requirements` en el encabezado. Reemplazar `proyecto` y las tablas, copiar el archivo a la carpeta de Dags y activar el Dag. Para reprocesar días pasados, usar un backfill de Airflow sobre el rango (ver `backfill`).

## 8. Conceptos relacionados

- `data-pipeline`: el patrón que implementa.
- `backfill`: reprocesar rangos reejecutando intervalos.
- `idempotency`: por qué reintentar es seguro.
- `bigquery-partitioning`: la partición como unidad de reemplazo.
- `dag`: tareas y dependencias del Dag.
- `catchup`: recuperación de intervalos pendientes.

## 9. Fuentes

- Apache Airflow: *Pythonic Dags with the TaskFlow API*, *Templates reference* y *airflow.sdk API Reference*.
- Google Cloud: *Run parameterized queries*, *Work with multi-statement queries*, *Multi-statement transactions* y *BigQuery IAM roles and permissions* (BigQuery).

El detalle está en `sources` del encabezado.

## 10. Historial de cambios

- 2026-10-01: creación (A-F3.2), desde la sección 10 de `data-pipeline` tras la revisión B-F3.1 del lote 2.
- 2026-10-01: enlazado a `dag` (IMPLEMENTS) y `catchup`, verificadas con el lote 3.

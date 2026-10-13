---
id: concept:rds-as-source
slug: rds-as-source
type: concept
title: RDS como fuente de datos
description: "Cómo sacar datos de Amazon RDS sin castigar la base según su documentación: réplicas de lectura asíncronas, exportación de snapshots a S3 en Parquet, integraciones zero-ETL y CDC con AWS DMS (carga completa más cambios continuos, replicación lógica de PostgreSQL con rds.logical_replication, archivos en S3 con la operación I, U o D en el primer campo, y DMS Serverless con capacidad en DCU)."
domain: aws
subdomain: orchestration-and-compute
category: aws
classification: modern
level: intermediate
importance: low
cloud: [aws]
technologies: [aws-rds, aws-dms, aws-s3, postgresql, python, terraform]
tags: [rds, dms, cdc, replication, database-ingestion]
related_topics: [database-ingestion, change-data-capture]
sources:
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html
    accessed: 2026-10-12
    page_title: "What is Amazon Relational Database Service (Amazon RDS)?"
    note: "What is Amazon RDS?: servicio para configurar, operar y escalar bases relacionales en AWS, que administra las tareas comunes de administración; esta guía cubre los motores de RDS distintos de Aurora."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html
    accessed: 2026-10-12
    page_title: "Working with DB instance read replicas"
    note: "Working with DB instance read replicas: una réplica de lectura es una copia de solo lectura que recibe los cambios del primario de forma asíncrona; descarga de lecturas al primario; se cobra como una instancia estándar."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.FeatureSupport.LogicalReplication.html
    accessed: 2026-10-12
    page_title: "Performing logical replication for Amazon RDS for PostgreSQL"
    note: "Performing logical replication for RDS for PostgreSQL: se activa con el parámetro estático rds.logical_replication = 1, que también ajusta wal_level, max_wal_senders, max_replication_slots y max_connections; aumenta la generación de WAL, así que se activa solo si se usan slots lógicos; requiere reiniciar la instancia."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ExportSnapshot.html
    accessed: 2026-10-12
    page_title: "Exporting DB snapshot data to Amazon S3 for Amazon RDS"
    note: "Exporting DB snapshot data to Amazon S3: exporta snapshots (manuales, automáticos o de AWS Backup) a S3 en Parquet comprimido y consistente; todo el snapshot o bases, esquemas o tablas elegidos."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/zero-etl.html
    accessed: 2026-10-12
    page_title: "Amazon RDS zero-ETL integrations"
    note: "Amazon RDS zero-ETL integrations: integración administrada de RDS con Amazon Redshift y Amazon SageMaker AI para analítica y ML casi en tiempo real con datos de RDS."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html
    accessed: 2026-10-12
    page_title: "What is AWS Database Migration Service?"
    note: "What is AWS Database Migration Service?: servicio para migrar bases relacionales, warehouses, NoSQL y otros almacenes, hacia AWS o entre nube y on-premises."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Task.CDC.html
    accessed: 2026-10-12
    page_title: "Creating tasks for ongoing replication using AWS DMS"
    note: "Creating tasks for ongoing replication: una tarea de DMS captura los cambios continuos (CDC) durante o después de la carga completa, leyendo los logs de la base con su API nativa; DMS CDC no es replicación en tiempo real."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html
    accessed: 2026-10-12
    page_title: "Using a PostgreSQL database as an AWS DMS source"
    note: "Using a PostgreSQL database as an AWS DMS source: en RDS, rds.logical_replication = 1 en el grupo de parámetros (estático, requiere reinicio). Para carga completa más CDC y solo CDC, DMS usa slots de replicación lógica que retienen WAL hasta decodificarlo, con los plugins test_decoding o pglogical; al reiniciar (no reanudar) la tarea, el slot se recrea."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Target.S3.html
    accessed: 2026-10-12
    page_title: "Using Amazon S3 as a target for AWS Database Migration Service"
    note: "Using Amazon S3 as a target for AWS DMS: carga completa y CDC se escriben en CSV por defecto, o en Parquet; los archivos de carga completa se nombran con un contador (LOAD00001.csv) y los de CDC con una marca de tiempo (20141029-1134010000.csv), en una carpeta por tabla. Por defecto, el primer campo de cada registro de CDC es I (INSERT), U (UPDATE) o D (DELETE), y el resto es la fila como quedó."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Tasks.CustomizingTasks.TableMapping.SelectionTransformation.Selections.html
    accessed: 2026-10-12
    page_title: "Selection rules and actions"
    note: "Selection rules and actions: las reglas de selección eligen esquemas y tablas con object-locator (schema-name, table-name) y rule-action include o exclude."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Serverless.html
    accessed: 2026-10-12
    page_title: "Working with AWS DMS Serverless"
    note: "Working with AWS DMS Serverless: aprovisionamiento y escalado automáticos, alta disponibilidad y cobro por uso, sin administrar instancias de replicación; DMS calcula la capacidad necesaria a partir de los metadatos."
  - source: aws-dms-docs
    url: https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Serverless.Components.html
    accessed: 2026-10-12
    page_title: "AWS DMS Serverless components"
    note: "AWS DMS Serverless components: se indican las DMS capacity units (DCU) mínimas y máximas; una DCU son 2 GB de RAM; se cobra cada DCU en uso."
relations:
  - type: RELATED_TO
    target: database-ingestion
    note: Las formas de sacar datos de una base relacional.
  - type: RELATED_TO
    target: change-data-capture
    note: DMS captura cambios por replicación lógica.
  - type: RELATED_TO
    target: cloud-sql-as-source
    note: El caso equivalente en GCP, con Datastream; no son lo mismo.
  - type: RELATED_TO
    target: s3-data-lake
    note: DMS y la exportación de snapshots escriben en S3.
  - type: RELATED_TO
    target: idempotency
    note: Aplicar el mismo archivo de CDC dos veces deja el mismo estado.
  - type: RELATED_TO
    target: incremental-load
    note: Carga completa una vez y después solo los cambios.
created_at: 2026-10-12
updated_at: 2026-10-12
last_verified: 2026-10-13
verification_status: verified
---

## 1. Resumen

Una base de **Amazon RDS** que atiende una aplicación no debería cargar con las consultas del pipeline. Según la documentación de AWS, hay varias salidas:

- **Réplica de lectura:** copia de solo lectura, actualizada de forma asíncrona; las extracciones leen de ahí.
- **Exportación de snapshots a S3:** Parquet consistente de un snapshot, sin tocar la instancia.
- **Integraciones zero-ETL:** RDS hacia Redshift o SageMaker AI, administradas.
- **AWS DMS:** carga completa más **CDC** continuo hacia S3 u otros destinos, con replicación lógica en PostgreSQL. En S3, cada registro de CDC empieza con **I**, **U** o **D**.

Con DMS, el consumidor aplica los cambios en orden. Un archivo aplicado dos veces deja el mismo estado.

## 2. Qué es

- **Réplica de lectura:** recibe los cambios del primario de forma asíncrona; se cobra como una instancia.
- **Exportación de snapshot:** de un snapshot manual, automático o de AWS Backup, a Parquet en S3; completo o por bases, esquemas o tablas.
- **Zero-ETL:** integración administrada con Redshift y SageMaker AI, casi en tiempo real.
- **DMS:**
  - *tarea:* carga completa, carga completa más CDC, o solo CDC;
  - *origen PostgreSQL en RDS:* `rds.logical_replication = 1` (estático, requiere reinicio), slots lógicos con `test_decoding` o `pglogical`;
  - *destino S3:* CSV por defecto o Parquet; archivos de carga completa `LOAD00001...` y de CDC con marca de tiempo; el primer campo de cada registro de CDC es `I`, `U` o `D`;
  - *reglas de selección:* esquemas y tablas con `object-locator`;
  - *Serverless:* sin instancias de replicación, con capacidad en DCU (una DCU son 2 GB de RAM).
- **No es tiempo real:** su página dice que DMS CDC no es replicación en tiempo real.

## 3. Problema que resuelve

Llevar los datos de una base operacional al lake o al warehouse sin afectar a la aplicación, y mantenerlos al día sin recargar todo cada vez.

## 4. Cómo funciona

1. Se activa `rds.logical_replication` en el grupo de parámetros y se reinicia la instancia.
2. Una replicación de DMS (por ejemplo, Serverless) hace la carga completa de las tablas elegidas y deja archivos `LOAD...` en S3.
3. Después, DMS lee los cambios del WAL con un slot lógico y escribe archivos de CDC con marca de tiempo.
4. El consumidor aplica los archivos de CDC en el orden de sus nombres: `I` y `U` reemplazan la fila por id, `D` la borra.
5. Si una tarea se reinicia (no se reanuda), el slot se recrea.

## 5. Cuándo utilizarlo

- **Réplica:** extracciones por lotes con SQL, sin cargar al primario.
- **Exportación de snapshot:** copias completas periódicas en Parquet.
- **DMS con CDC:** mantener el lake al día con inserciones, actualizaciones y borrados.
- **Zero-ETL:** cuando el destino es Redshift o SageMaker AI y basta la integración administrada.

## 6. Cuándo no utilizarlo

- CDC con latencia de segundos garantizada: DMS no es tiempo real.
- Activar replicación lógica sin consumidores: aumenta el WAL.
- Consultas pesadas del pipeline sobre el primario.

## 7. Ejemplo sencillo

La carga completa trae a Bob en New York. Los archivos de CDC traen `U` (Bob a Los Angeles), `I` (Ana) y luego `U` (Bob a Dallas) y `D` (Ana). Aplicados en orden, queda Bob en Dallas. Aplicados dos veces, el resultado es el mismo.

## 8. Ejemplo de producción

Una base RDS for PostgreSQL 17 alimenta el lake:

- grupo de parámetros con `rds.logical_replication = 1`, aplicado en una ventana de mantenimiento con reinicio;
- DMS Serverless, de 2 a 16 DCU, con carga completa más CDC del esquema `ventas` hacia S3 en Parquet;
- un job por hora aplica los archivos de CDC nuevos sobre la tabla curada, en orden de nombre;
- una alarma vigila el retraso de la replicación.

## 9. Arquitectura

```mermaid
flowchart LR
  APP["Aplicación"] --> RDS["RDS for PostgreSQL<br/>rds.logical_replication = 1"]
  RDS -- "slot lógico (WAL)" --> DMS["DMS Serverless<br/>carga completa + CDC"]
  DMS --> S3["s3://lake/raw/ventas/<br/>LOAD... y CDC con I/U/D"]
  S3 --> J["Job: aplica CDC en orden"]
  J --> CUR["s3://lake/curated/ventas/"]
  RDS -. "réplica de lectura" .-> REP["Réplica para extracciones"]
```

## 10. Código

```python
# Python 3.12, solo biblioteca estándar (ejecutado en la CI; mypy --strict sin errores): aplica los archivos CSV de
# CDC que AWS DMS deja en S3 sobre el estado actual de una tabla. Cada fila empieza con I, U o D (la operación en el
# origen) y trae la fila como quedó; los archivos de CDC se nombran con una marca de tiempo, así que se aplican en el
# orden de sus nombres. Aplicar dos veces el mismo archivo deja el mismo estado.
from __future__ import annotations

import csv
import io

Row = dict[str, str]


def apply_cdc(state: dict[str, Row], files: dict[str, str], columns: list[str]) -> dict[str, Row]:
    """state: filas actuales por id. files: nombre del archivo de CDC -> contenido CSV sin encabezado."""
    result = dict(state)
    for name in sorted(files):
        for record in csv.reader(io.StringIO(files[name])):
            op, values = record[0], record[1:]
            row = dict(zip(columns, values, strict=True))
            if op in ("I", "U"):
                result[row["id"]] = row
            elif op == "D":
                result.pop(row["id"], None)
            else:
                raise ValueError(f"{name}: operación desconocida {op!r}")
    return result


if __name__ == "__main__":
    cols = ["id", "nombre", "oficina"]
    full_load = {"1": {"id": "1", "nombre": "Bob", "oficina": "New York"}}
    cdc = {
        "20261001-0900000000.csv": "U,1,Bob,Los Angeles\nI,2,Ana,Santiago\n",
        "20261001-1000000000.csv": "U,1,Bob,Dallas\nD,2,Ana,Santiago\n",
    }
    once = apply_cdc(full_load, cdc, cols)
    twice = apply_cdc(once, cdc, cols)
    print(once)
    print("idempotente:", once == twice)
```

```hcl
# Terraform (validado en la CI con terraform validate, sin credenciales; no se aplicó): grupo de parámetros de RDS
# for PostgreSQL con replicación lógica activada (requiere reiniciar la instancia) y una replicación de DMS Serverless
# de carga completa más CDC hacia S3. Requiere: provider hashicorp/aws ~> 6.0; endpoints de origen y destino,
# grupo de subredes de replicación y security group existentes.
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

variable "source_endpoint_arn" {
  type = string
}

variable "s3_target_endpoint_arn" {
  type = string
}

variable "replication_subnet_group_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

resource "aws_db_parameter_group" "pg_cdc" {
  name   = "pg17-cdc"
  family = "postgres17"

  parameter {
    name         = "rds.logical_replication"
    value        = "1"
    apply_method = "pending-reboot" # parámetro estático
  }
}

resource "aws_dms_replication_config" "ventas" {
  replication_config_identifier = "ventas-a-s3"
  replication_type              = "full-load-and-cdc"
  source_endpoint_arn           = var.source_endpoint_arn
  target_endpoint_arn           = var.s3_target_endpoint_arn

  table_mappings = jsonencode({
    rules = [{
      "rule-type"      = "selection"
      "rule-id"        = "1"
      "rule-name"      = "ventas"
      "object-locator" = { "schema-name" = "ventas", "table-name" = "%" }
      "rule-action"    = "include"
    }]
  })

  compute_config {
    replication_subnet_group_id = var.replication_subnet_group_id
    vpc_security_group_ids      = [var.security_group_id]
    max_capacity_units          = 16
    min_capacity_units          = 2
  }
}
```

El script en Python 3.12, solo con biblioteca estándar, se **ejecuta en la CI** y pasa `mypy --strict`. Aplica el ejemplo de §7 y comprueba que aplicarlo dos veces da el mismo estado. **No leyó archivos reales de DMS:** el formato (`I`, `U`, `D` en el primer campo; archivos con marca de tiempo) es el de *Using Amazon S3 as a target*.

El bloque de Terraform se valida en la CI con `terraform validate`, sin credenciales (`make validate-terraform`), y **no se aplicó**. moto no simula una replicación de DMS (ADR-011).

## 11. GCP

No aplica de forma específica: esta ficha describe RDS y DMS. En GCP, el caso equivalente es Cloud SQL con Datastream (ver `cloud-sql-as-source`), con otros pasos y otro destino por defecto; no son lo mismo.

## 12. AWS

**Amazon RDS y AWS DMS.** Las réplicas, la exportación de snapshots, zero-ETL, la replicación lógica, las tareas de CDC, el formato en S3, las reglas de selección y DMS Serverless son los de sus páginas.

## 13. Azure

No aplica de forma específica.

## 14. Buenas prácticas

- Nunca extraer del primario; réplica, snapshot o CDC.
- Activar `rds.logical_replication` solo si hay un consumidor de slots, y vigilar el WAL retenido.
- Aplicar el CDC en orden de archivo y de forma idempotente.
- Elegir tablas con reglas de selección explícitas.
- **Seguridad:** el usuario de DMS solo con los permisos de replicación que pide su página; el destino en S3 con su rol y cifrado.
- **Observabilidad:** seguir el retraso de la replicación, el WAL retenido por el slot y los archivos de CDC sin aplicar.
- **Costo:** una réplica se cobra como una instancia; DMS Serverless cobra las DCU en uso; la exportación y el almacenamiento en S3 aparte.

## 15. Errores frecuentes

- Un slot lógico abandonado que retiene WAL y llena el disco.
- Aplicar archivos de CDC en otro orden que el de sus nombres.
- Tratar `U` como inserción y duplicar filas.
- Reiniciar una tarea de DMS y no saber que el slot se recrea.

## 16. Trade-offs

La réplica es simple y da SQL completo, pero cada extracción lee todo lo que pide. La exportación de snapshots es consistente y en Parquet, con la frescura del snapshot. DMS con CDC mantiene el lake al día con borrados incluidos, a cambio de operar slots y aplicar cambios en orden. Zero-ETL quita el pipeline, para los destinos que admite.

## 17. Conceptos relacionados

- `database-ingestion` y `change-data-capture`: el patrón.
- `incremental-load` e `idempotency`: aplicar solo cambios, sin duplicar.
- `cloud-sql-as-source`: el caso en GCP.
- `s3-data-lake`: el destino.
- Del blueprint, pendiente de ficha: `cdc-architecture` (arquitectura de F4).

## 18. Preguntas técnicas abiertas

1. ¿Qué tablas de tu base necesitan borrados en el lake, y cuáles solo inserciones?
2. ¿Cómo vigilas el WAL retenido por un slot?
3. ¿Cuándo te bastaría una exportación de snapshot diaria?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- AWS, Amazon RDS User Guide: *What is Amazon RDS?*, *Working with DB instance read replicas*, *Performing logical replication for RDS for PostgreSQL*, *Exporting DB snapshot data to Amazon S3* y *Amazon RDS zero-ETL integrations*.
- AWS, AWS DMS User Guide: *What is AWS DMS?*, *Creating tasks for ongoing replication*, *Using a PostgreSQL database as an AWS DMS source*, *Using Amazon S3 as a target*, *Selection rules and actions*, *Working with AWS DMS Serverless* y *AWS DMS Serverless components*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-13. Pasa a `verified`: revisión B-F3.1 del lote F3b-09b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-12: creación (lote F3b-09b).
- 2026-10-13: revisión B-F3.1 del lote F3b-09b aplicada (docs/reviews/cards-f3b-09b.md): filas aprobadas sin cambios en esta ficha.
- 2026-10-13: `verification_status: verified` (sin VERIFY pendientes).

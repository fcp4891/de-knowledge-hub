"""Generador de arranque del Source Registry (A-F1.3).

Escribe las 6 fuentes de F0 y las fuentes Nivel 1–2 de las 9 tecnologías MVP. Las URLs se
verificaron el 2026-09-28 con una petición real (HTTP 200 + <title> del producto) y se guarda
la URL final. content/ es la fuente de verdad: el registro puede haberse editado después
(fechas, fuentes nuevas), así que el script no sobrescribe un archivo existente sin --force.

Uso: python -m scripts.generators.sources [--out FILE] [--force]
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
PATH = ROOT / "content" / "sources" / "registry.yaml"
TODAY = "2026-09-28"
HEADER = """# Source Registry (§30, §52.D). Un documento YAML por fuente, separados por ---.
# url_verified: true = la URL respondió HTTP 200 y su <title> corresponde al producto en la fecha last_verified.
# Se guarda la URL final tras redirecciones. Alcance A-F1.3: fuentes de F0 + Nivel 1–2 de las 9 tecnologías MVP.
# Frecuencias de revisión (gate F1): docs trimestral, release notes mensual, Python trimestral.
# Regla de niveles en fichas (F3, lote 3): las afirmaciones de producto (servicios, APIs, límites, defaults)
# exigen fuente Nivel 1–2. Las afirmaciones conceptuales pueden apoyarse en una referencia canónica Nivel 4
# (source_type spec_paper, p. ej. Kimball Group o una RFC). validate rechaza en fichas las fuentes Nivel 3 y 5
# y exige al menos una fuente Nivel 1–2 por ficha.
"""

GCP_DOCS = "https://docs.cloud.google.com"

# (slug, título, descripción, url, source_type, nivel, proveedor, verificada, frecuencia, [tecnologías])
F0 = [
    ("postgresql-docs", "PostgreSQL Documentation", "Documentación oficial de PostgreSQL.",
     "https://www.postgresql.org/docs/current/", "official_docs", 1, "postgresql", True, "quarterly", ["postgresql"]),
    ("debezium-docs", "Debezium Documentation", "Documentación oficial del proyecto Debezium.",
     "https://debezium.io/documentation/", "official_docs", 1, "debezium", True, "quarterly", ["debezium"]),
    ("apache-kafka-docs", "Apache Kafka Documentation",
     "Documentación oficial de Apache Kafka (la página redirige por JavaScript a la versión vigente).",
     "https://kafka.apache.org/documentation/", "official_docs", 1, "apache", True, "quarterly", ["apache-kafka"]),
    ("gcp-datastream-docs", "Datastream documentation", "Documentación oficial de Datastream en Google Cloud.",
     f"{GCP_DOCS}/datastream/docs", "official_docs", 1, "gcp", True, "monthly", ["gcp-datastream"]),
    ("aws-dms-docs", "AWS Database Migration Service User Guide", "Guía oficial de AWS Database Migration Service.",
     "https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html", "official_docs", 1, "aws", True, "monthly", ["aws-dms"]),
    ("microsoft-learn", "Microsoft Learn",
     "Portal de documentación oficial de Microsoft (SQL Server, Azure). Fuente general; las fuentes por servicio se agregan en F7.",
     "https://learn.microsoft.com/en-us/", "official_docs", 1, "azure", True, "monthly", []),
]


def gcp_pair(path: str, tech: str, title: str, doc_title: str | None = None) -> list[tuple[Any, ...]]:
    shown = doc_title or title
    return [
        (f"{tech}-docs", f"{shown} documentation", f"Documentación oficial de {title} en Google Cloud.",
         f"{GCP_DOCS}/{path}/docs", "official_docs", 1, "gcp", True, "monthly", [tech]),
        (f"{tech}-release-notes", f"{shown} release notes", f"Release notes oficiales de {title} en Google Cloud.",
         f"{GCP_DOCS}/{path}/docs/release-notes", "release_notes", 2, "gcp", True, "weekly", [tech]),
    ]


MVP = [
    *gcp_pair("bigquery", "gcp-bigquery", "BigQuery"),
    *gcp_pair("storage", "gcp-cloud-storage", "Cloud Storage"),
    *gcp_pair("pubsub", "gcp-pubsub", "Pub/Sub"),
    *gcp_pair("dataflow", "gcp-dataflow", "Dataflow"),
    *gcp_pair("composer", "gcp-cloud-composer",
              "Cloud Composer (título actual en la documentación: «Managed Service for Apache Airflow»)",
              doc_title="Managed Service for Apache Airflow"),
    *gcp_pair("dataform", "gcp-dataform", "Dataform"),
    ("apache-airflow-docs", "Apache Airflow Documentation", "Documentación oficial del proyecto Apache Airflow.",
     "https://airflow.apache.org/docs/", "official_docs", 1, "apache", True, "monthly", ["apache-airflow"]),
    ("apache-airflow-release-notes", "Apache Airflow Release Notes", "Release notes oficiales de la versión estable de Apache Airflow.",
     "https://airflow.apache.org/docs/apache-airflow/stable/release_notes.html", "release_notes", 2, "apache", True, "weekly", ["apache-airflow"]),
    ("python-docs", "Python Documentation", "Documentación oficial de Python 3.",
     "https://docs.python.org/3/", "official_docs", 1, "python", True, "quarterly", ["python"]),
    ("python-whatsnew", "What's New in Python", "Cambios oficiales por versión de Python (What's New).",
     "https://docs.python.org/3/whatsnew/", "release_notes", 2, "python", True, "monthly", ["python"]),
    ("terraform-docs", "Terraform documentation", "Documentación oficial de Terraform (HashiCorp Developer).",
     "https://developer.hashicorp.com/terraform/docs", "official_docs", 1, "hashicorp", True, "monthly", ["terraform"]),
    ("terraform-releases", "Terraform releases", "Releases oficiales de Terraform en el repositorio de HashiCorp.",
     "https://github.com/hashicorp/terraform/releases", "release_notes", 2, "hashicorp", True, "weekly", ["terraform"]),
    ("terraform-provider-google-docs", "Terraform Google provider documentation",
     "Documentación del provider hashicorp/google en el Terraform Registry. Página SPA con título genérico: contenido no confirmado automáticamente.",
     "https://registry.terraform.io/providers/hashicorp/google/latest/docs", "official_docs", 1, "hashicorp", False, "monthly", ["terraform"]),
    ("terraform-provider-google-releases", "Terraform Google provider releases",
     "Releases oficiales del provider hashicorp/google en su repositorio.",
     "https://github.com/hashicorp/terraform-provider-google/releases", "release_notes", 2, "hashicorp", True, "weekly", ["terraform", "gcp-bigquery", "gcp-cloud-storage"]),
]


# Lote 1 de F3 (2026-09-30): guías de AWS usadas por las fichas; verificadas con HTTP 200 + <title>.
BATCH1 = [
    ('aws-redshift-docs', 'Amazon Redshift Database Developer Guide', 'Guía oficial para desarrolladores de bases de datos de Amazon Redshift.',
     'https://docs.aws.amazon.com/redshift/latest/dg/welcome.html', "official_docs", 1, "aws", True, "quarterly", ['aws-redshift']),
    ('aws-sqs-docs', 'Amazon SQS Developer Guide', 'Guía oficial para desarrolladores de Amazon Simple Queue Service.',
     'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html', "official_docs", 1, "aws", True, "quarterly", []),
    ('aws-athena-docs', 'Amazon Athena User Guide', 'Guía oficial de usuario de Amazon Athena.',
     'https://docs.aws.amazon.com/athena/latest/ug/what-is.html', "official_docs", 1, "aws", True, "quarterly", ['aws-athena']),
    ('aws-kinesis-docs', 'Amazon Kinesis Data Streams Developer Guide', 'Guía oficial para desarrolladores de Amazon Kinesis Data Streams.',
     'https://docs.aws.amazon.com/streams/latest/dev/introduction.html', "official_docs", 1, "aws", True, "quarterly", ['aws-kinesis']),
    ("aws-glue-docs", "AWS Glue Developer Guide", "Guía oficial para desarrolladores de AWS Glue.",
     "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html", "official_docs", 1, "aws", True, "quarterly", ["aws-glue"]),
    # Lote 2: event time y watermarks en AWS (late-arriving-data).
    ("aws-managed-flink-docs", "Amazon Managed Service for Apache Flink Developer Guide",
     "Guía oficial para desarrolladores de Amazon Managed Service for Apache Flink.",
     "https://docs.aws.amazon.com/managed-flink/latest/java/what-is.html", "official_docs", 1, "aws", True, "quarterly", []),
    # Lote 3: modelado (Kimball, Nivel 4 canónico), HTTP (RFC, Nivel 4), formatos y SDKs (Nivel 1).
    ('kimball-group-techniques', 'Kimball Dimensional Modeling Techniques',
     'Técnicas de modelado dimensional de Kimball Group: referencia conceptual canónica (Nivel 4) para modelado dimensional; no respalda afirmaciones de producto.',
     'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/', 'spec_paper', 4, 'kimball-group', True, "quarterly", []),
    ('ietf-rfc', 'IETF RFC Editor',
     'Especificaciones RFC de la IETF (p. ej. semántica HTTP): referencia conceptual canónica (Nivel 4).',
     'https://www.rfc-editor.org/', 'spec_paper', 4, 'ietf', True, "quarterly", []),
    ('apache-parquet-docs', 'Apache Parquet documentation',
     'Documentación oficial y especificación del formato Apache Parquet.',
     'https://parquet.apache.org/docs/', 'official_docs', 1, 'apache', True, "quarterly", ['pyarrow']),
    ('apache-avro-docs', 'Apache Avro documentation',
     'Documentación oficial y especificación de Apache Avro.',
     'https://avro.apache.org/docs/', 'official_docs', 1, 'apache', True, "quarterly", []),
    ('aws-boto3-docs', 'Boto3 Developer Guide',
     'Guía oficial del SDK de AWS para Python (Boto3).',
     'https://docs.aws.amazon.com/boto3/latest/guide/', 'official_docs', 1, 'aws', True, "quarterly", ['python']),
    ('gcp-python-api-core-docs', 'google-api-core documentation',
     'Referencia oficial de google-api-core, base de las bibliotecas cliente de Google Cloud para Python.',
     'https://googleapis.dev/python/google-api-core/latest/', 'official_docs', 1, 'gcp', True, "quarterly", ['python']),
    ('aws-step-functions-docs', 'AWS Step Functions Developer Guide',
     'Guía oficial para desarrolladores de AWS Step Functions.',
     'https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-step-functions']),
    ('aws-mwaa-docs', 'Amazon MWAA User Guide',
     'Guía oficial de Amazon Managed Workflows for Apache Airflow.',
     'https://docs.aws.amazon.com/mwaa/latest/userguide/what-is-mwaa.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-mwaa']),
    # 2026-10-01: consumidor de Pub/Sub de pubsub-delivery-semantics (psycopg 3).
    ('psycopg-docs', 'Psycopg 3 documentation', 'Documentación oficial de psycopg 3, el adaptador de PostgreSQL para Python.',
     'https://www.psycopg.org/psycopg3/docs/', 'official_docs', 1, 'psycopg', True, "quarterly", ['postgresql', 'python']),
    # Lote 4 de F3 (2026-10-01): IaC, almacenamiento, IAM y schedulers.
    ('gcp-iam-docs', 'Identity and Access Management documentation', 'Documentación oficial de IAM de Google Cloud.',
     'https://docs.cloud.google.com/iam/docs', 'official_docs', 1, 'gcp', True, "quarterly", ['gcp-iam']),
    ('gcp-terraform-docs', 'Terraform on Google Cloud documentation', 'Documentación oficial de Google Cloud sobre Terraform y su provider.',
     'https://docs.cloud.google.com/docs/terraform', 'official_docs', 1, 'gcp', True, "quarterly", ['terraform']),
    ('gcp-infrastructure-manager-docs', 'Infrastructure Manager documentation', 'Documentación oficial de Infrastructure Manager (Terraform administrado en Google Cloud).',
     'https://docs.cloud.google.com/infrastructure-manager/docs', 'official_docs', 1, 'gcp', True, "quarterly", ['terraform']),
    ('aws-s3-docs', 'Amazon S3 User Guide', 'Guía oficial de usuario de Amazon S3.',
     'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-s3']),
    ('aws-iam-docs', 'AWS IAM User Guide', 'Guía oficial de usuario de AWS Identity and Access Management.',
     'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-iam']),
    ('aws-cloudformation-docs', 'AWS CloudFormation User Guide', 'Guía oficial de usuario de AWS CloudFormation.',
     'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-cloudformation']),
    ('aws-eventbridge-scheduler-docs', 'Amazon EventBridge Scheduler User Guide', 'Guía oficial de usuario de Amazon EventBridge Scheduler.',
     'https://docs.aws.amazon.com/scheduler/latest/UserGuide/what-is-scheduler.html', 'official_docs', 1, 'aws', True, "quarterly", []),    ('pydantic-docs', 'Pydantic Validation documentation', 'Documentación oficial de Pydantic (validación de datos con modelos tipados).',
     'https://pydantic.dev/docs/validation/latest/get-started/', 'official_docs', 1, 'pydantic', True, "quarterly", ['pydantic']),
    ('dbt-docs', 'dbt Developer Hub', 'Documentación oficial de dbt.',
     'https://docs.getdbt.com/docs/introduction', 'official_docs', 1, 'dbt-labs', True, "quarterly", ['dbt']),
    ('gcp-cloud-logging-docs', 'Cloud Logging documentation', 'Documentación oficial de Google Cloud Logging.',
     'https://docs.cloud.google.com/logging/docs', 'official_docs', 1, 'gcp', True, "quarterly", []),
    ('aws-cloudwatch-logs-docs', 'Amazon CloudWatch Logs User Guide', 'Guía oficial de usuario de Amazon CloudWatch Logs.',
     'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-cloudwatch']),
    ('aws-lake-formation-docs', 'AWS Lake Formation Developer Guide', 'Guía oficial para desarrolladores de AWS Lake Formation.',
     'https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-lake-formation']),
    ('aws-sns-docs', 'Amazon SNS Developer Guide', 'Guía oficial para desarrolladores de Amazon Simple Notification Service.',
     'https://docs.aws.amazon.com/sns/latest/dg/welcome.html', 'official_docs', 1, 'aws', True, "quarterly", []),    ('pytest-docs', 'pytest documentation', 'Documentación oficial de pytest.',
     'https://docs.pytest.org/en/stable/', 'official_docs', 1, 'pytest-dev', True, "quarterly", ['pytest']),    ('apache-spark-docs', 'Apache Spark documentation', 'Documentación oficial de Apache Spark.',
     'https://spark.apache.org/docs/latest/', 'official_docs', 1, 'apache', True, "quarterly", ['apache-spark']),    ('aws-firehose-docs', 'Amazon Data Firehose Developer Guide', 'Guía oficial para desarrolladores de Amazon Data Firehose.',
     'https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html', 'official_docs', 1, 'aws', True, "quarterly", []),    ('gilbert-lynch-cap-2002', "Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services (Gilbert y Lynch, 2002)",
     'Prueba formal del teorema CAP (SIGACT News 33(2):48-51, 2002), copia publicada por el autor (Seth Gilbert, NUS): referencia conceptual canónica (Nivel 4); no respalda afirmaciones de producto.',
     'https://www.comp.nus.edu.sg/~gilbert/pubs/BrewersConjecture-SigAct.pdf', 'spec_paper', 4, 'gilbert-lynch', True, "quarterly", []),
    ('apache-iceberg-docs', 'Apache Iceberg documentation', 'Documentación oficial de Apache Iceberg.',
     'https://iceberg.apache.org/docs/latest/', 'official_docs', 1, 'apache', True, "quarterly", ['apache-iceberg']),
    ('delta-lake-docs', 'Delta Lake documentation', 'Documentación oficial de Delta Lake.',
     'https://docs.delta.io/index.html', 'official_docs', 1, 'delta-lake', True, "quarterly", ['delta-lake']),
    ('apache-hudi-docs', 'Apache Hudi documentation', 'Documentación oficial de Apache Hudi.',
     'https://hudi.apache.org/docs/overview/', 'official_docs', 1, 'apache', True, "quarterly", ['apache-hudi']),
    ('gcp-spanner-docs', 'Spanner documentation', 'Documentación oficial de Spanner (Google Cloud).',
     'https://docs.cloud.google.com/spanner/docs/true-time-external-consistency', 'official_docs', 1, 'gcp', True, "quarterly", []),
    ('gcp-data-engineer-certification', 'Google Cloud Professional Data Engineer', 'Página oficial de Google Cloud que describe el rol y la certificación Professional Data Engineer.',
     'https://cloud.google.com/learn/certification/data-engineer', 'official_docs', 1, 'gcp', True, "quarterly", []),
    ('aws-data-engineer-certification', 'AWS Certified Data Engineer - Associate', 'Página oficial de AWS que describe las competencias de la certificación Data Engineer - Associate.',
     'https://aws.amazon.com/certification/certified-data-engineer-associate/', 'official_docs', 1, 'aws', True, "quarterly", []),    ('aws-what-is-data-mart', 'What is a Data Mart? (AWS)', 'Página oficial de AWS que explica qué es un data mart, sus tipos y su relación con el data warehouse y el data lake.',
     'https://aws.amazon.com/what-is/data-mart/', 'official_docs', 1, 'aws', True, "quarterly", []),
    ('aws-lambda-docs', 'AWS Lambda Developer Guide', 'Guía oficial para desarrolladores de AWS Lambda (runtimes, configuración y almacenamiento efímero).',
     'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-lambda']),
    ('gcp-cloud-run-docs', 'Cloud Run documentation', 'Documentación oficial de Cloud Run (contrato del contenedor, runtimes y funciones).',
     'https://docs.cloud.google.com/run/docs', 'official_docs', 1, 'gcp', True, "quarterly", ['gcp-cloud-run']),
    ('pandas-docs', 'pandas documentation', 'Documentación oficial de pandas (guía de usuario y referencia de la API).',
     'https://pandas.pydata.org/docs/', 'official_docs', 1, 'pandas', True, "quarterly", ['pandas']),
    ('polars-docs', 'Polars user guide', 'Documentación oficial de Polars (guía de usuario y referencia de la API de Python).',
     'https://docs.pola.rs/', 'official_docs', 1, 'polars', True, "quarterly", ['polars']),
    ('apache-arrow-docs', 'Apache Arrow documentation', 'Documentación oficial de Apache Arrow (especificación del formato columnar y PyArrow).',
     'https://arrow.apache.org/docs/', 'official_docs', 1, 'apache', True, "quarterly", ['pyarrow']),
    ('apache-beam-docs', 'Apache Beam documentation', 'Documentación oficial de Apache Beam (guía de programación, runners y SDK de Python).',
     'https://beam.apache.org/documentation/', 'official_docs', 1, 'apache', True, "quarterly", ['apache-beam']),
    ('fastapi-docs', 'FastAPI documentation', 'Documentación oficial de FastAPI.',
     'https://fastapi.tiangolo.com/', 'official_docs', 1, 'fastapi', True, "quarterly", ['fastapi']),
    ('httpx-docs', 'HTTPX documentation', 'Documentación oficial de HTTPX.',
     'https://www.python-httpx.org/', 'official_docs', 1, 'encode', True, "quarterly", ['httpx']),
    ('requests-docs', 'Requests documentation', 'Documentación oficial de Requests.',
     'https://requests.readthedocs.io/en/latest/', 'official_docs', 1, 'psf', True, "quarterly", ['requests']),
    ('gcp-managed-spark-docs', 'Managed Service for Apache Spark documentation', 'Documentación oficial de Managed Service for Apache Spark (antes Dataproc en Compute Engine y Google Cloud Serverless for Apache Spark).',
     'https://docs.cloud.google.com/managed-spark/docs', 'official_docs', 1, 'gcp', True, "quarterly", ['gcp-dataproc']),
    ('aws-emr-docs', 'Amazon EMR documentation', 'Documentación oficial de Amazon EMR (guía de administración y EMR Serverless).',
     'https://docs.aws.amazon.com/emr/', 'official_docs', 1, 'aws', True, "quarterly", ['aws-emr']),
    ('gcp-cloud-sql-docs', 'Cloud SQL documentation', 'Documentación oficial de Cloud SQL.',
     'https://docs.cloud.google.com/sql/docs', 'official_docs', 1, 'gcp', True, "quarterly", ['gcp-cloud-sql']),
    ('aws-rds-docs', 'Amazon RDS User Guide', 'Guía oficial de usuario de Amazon Relational Database Service.',
     'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html', 'official_docs', 1, 'aws', True, "quarterly", ['aws-rds']),
    ('aws-what-is-data-modeling', 'What is Data Modeling? (AWS)', 'Página oficial de AWS que explica qué es el modelado de datos y sus niveles conceptual, lógico y físico.',
     'https://aws.amazon.com/what-is/data-modeling/', 'official_docs', 1, 'aws', True, "quarterly", []),
    ('snowflake-developer-guides', 'Snowflake Developer Guides', 'Guías para desarrolladores publicadas por Snowflake (quickstarts y tutoriales). Nivel 3 (revisión B-F3.1 de F3b-04a): no es documentación de producto; no sostiene afirmaciones en las fichas.',
     'https://www.snowflake.com/en/developers/guides/', 'engineering_blog', 3, 'snowflake', True, "quarterly", []),
    ('gcp-looker-docs', 'Looker documentation', 'Documentación oficial de Looker (Google Cloud), incluido LookML.',
     'https://docs.cloud.google.com/looker/docs', 'official_docs', 1, 'gcp', True, "quarterly", []),
    ('aws-quick-docs', 'Amazon Quick User Guide', 'Guía oficial de usuario de Amazon Quick, que incluye Amazon Quick Sight (antes Amazon QuickSight).',
     'https://docs.aws.amazon.com/quick/latest/userguide/what-is.html', 'official_docs', 1, 'aws', True, "quarterly", []),
    ('chen-er-model-1976', 'The Entity-Relationship Model: Toward a Unified View of Data (Chen, 1976)', 'Artículo que propone el modelo entidad-relación (ACM Transactions on Database Systems 1(1):9-36, 1976), extracto de 5 páginas publicado por el autor (Peter Chen, LSU): referencia conceptual canónica (Nivel 4); no respalda afirmaciones de producto.',
     'https://bit.csc.lsu.edu/~chen/pdf/erd-5-pages.pdf', 'spec_paper', 4, 'chen', True, "quarterly", []),
    ('data-vault-alliance', 'Data Vault Alliance', 'Organización del autor del método Data Vault (Dan Linstedt); artículos de ingeniería sobre Data Vault 2.0 firmados por él: referencia conceptual canónica (Nivel 4) para hubs, links, satélites y claves hash; no respalda afirmaciones de producto.',
     'https://datavaultalliance.com/', 'spec_paper', 4, 'data-vault-alliance', True, "quarterly", []),
]


def review_frequency(slug: str, source_type: str) -> str:
    """Política del gate F1: documentación trimestral, release notes mensual, Python trimestral.
    Las referencias canónicas (spec_paper, lote 3 de F3) cambian poco: trimestral."""
    if source_type in ("official_docs", "spec_paper") or slug.startswith("python-"):
        return "quarterly"
    return "monthly"


BATCH1_DATE = "2026-09-30"
LATER_DATES = {slug: "2026-10-01" for slug in ("psycopg-docs", "gcp-iam-docs", "gcp-terraform-docs", "gcp-infrastructure-manager-docs", "aws-s3-docs", "aws-iam-docs", "aws-cloudformation-docs", "aws-eventbridge-scheduler-docs", "pydantic-docs", "dbt-docs", "gcp-cloud-logging-docs", "aws-cloudwatch-logs-docs", "aws-lake-formation-docs", "aws-sns-docs")} | {"pytest-docs": "2026-10-04", "apache-spark-docs": "2026-10-05", "aws-firehose-docs": "2026-10-05", "gilbert-lynch-cap-2002": "2026-10-05", "apache-iceberg-docs": "2026-10-05", "delta-lake-docs": "2026-10-05", "apache-hudi-docs": "2026-10-05", "gcp-spanner-docs": "2026-10-05", "gcp-data-engineer-certification": "2026-10-05", "aws-data-engineer-certification": "2026-10-05", "aws-what-is-data-mart": "2026-10-05", "aws-lambda-docs": "2026-10-08", "gcp-cloud-run-docs": "2026-10-08", "pandas-docs": "2026-10-08", "polars-docs": "2026-10-08", "apache-arrow-docs": "2026-10-08", "apache-beam-docs": "2026-10-08", "fastapi-docs": "2026-10-08", "httpx-docs": "2026-10-08", "requests-docs": "2026-10-08", "gcp-managed-spark-docs": "2026-10-08", "aws-emr-docs": "2026-10-08", "gcp-cloud-sql-docs": "2026-10-08", "aws-rds-docs": "2026-10-08", "aws-what-is-data-modeling": "2026-10-10", "snowflake-developer-guides": "2026-10-10", "gcp-looker-docs": "2026-10-10", "aws-quick-docs": "2026-10-10", "chen-er-model-1976": "2026-10-10", "data-vault-alliance": "2026-10-11"}  # fuentes de BATCH1 agregadas después del 2026-09-30


def entry(row: tuple[Any, ...], created: str = TODAY) -> dict[str, Any]:
    slug, title, description, url, source_type, level, provider, verified, _, techs = row
    return {
        "id": f"source:{slug}", "slug": slug, "type": "source", "title": title, "description": description,
        "url": url, "source_type": source_type, "authority_level": level, "provider": provider,
        "url_verified": verified, "review_frequency": review_frequency(slug, source_type), "trust": "high", "technologies": techs,
        "created_at": created, "updated_at": created, "last_verified": created, "verification_status": "verified" if verified else "review_required",
    }


def build() -> str:
    docs = [entry(row) for row in [*F0, *MVP]] + [entry(row, created=LATER_DATES.get(row[0], BATCH1_DATE)) for row in BATCH1]
    return HEADER + yaml.safe_dump_all(docs, allow_unicode=True, sort_keys=False, width=140)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Genera el Source Registry de arranque (A-F1.3).")
    parser.add_argument("--out", type=Path, default=PATH)
    parser.add_argument("--force", action="store_true", help="sobrescribir un registro existente")
    args = parser.parse_args(argv)
    if args.out.exists() and not args.force:
        raise SystemExit(f"{args.out} ya existe; usa --force para sobrescribirlo (revisa el diff antes).")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(build(), encoding="utf-8", newline="\n")
    print(f"escrito {args.out}")


if __name__ == "__main__":
    main()

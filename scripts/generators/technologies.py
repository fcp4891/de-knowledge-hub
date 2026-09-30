"""Generador de arranque del inventario de tecnologías (A-F1.2, ADR-004).

Crea content/technologies/<slug>.yaml como stubs `review_required`. Es idempotente: nunca
sobrescribe un archivo existente. content/ es la fuente de verdad; los archivos pudieron
editarse después de generarse, así que este script solo sirve para crear tecnologías nuevas.
No incluye los stubs de F0 (debezium, apache-kafka, gcp-datastream), escritos a mano.

Uso: python -m scripts.generators.technologies [--out DIR]
"""

from __future__ import annotations

import argparse
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "content" / "technologies"
TODAY = "2026-09-28"
MVP = {
    "gcp-bigquery", "gcp-cloud-storage", "gcp-pubsub", "gcp-dataflow", "apache-airflow",
    "gcp-cloud-composer", "gcp-dataform", "python", "terraform",
}
FABRIC_NOTE = "Producto SaaS de Microsoft, no un servicio de Azure en sentido estricto; se modela con provider azure (ADR-004)."
MS_NOTE = "Producto de Microsoft que trasciende Azure; se modela con provider azure (ADR-004)."

# (slug, título, categoría, descripción, [relaciones], nota)
CLOUD = {
    "gcp": [
        ("gcp-bigquery", "BigQuery", "data-warehouse", "Data warehouse serverless de Google Cloud con almacenamiento columnar y cómputo separado.", [], None),
        ("gcp-cloud-storage", "Cloud Storage", "object-storage", "Almacenamiento de objetos de Google Cloud.", [], None),
        ("gcp-pubsub", "Pub/Sub", "stream-messaging", "Servicio de mensajería asíncrona publish/subscribe de Google Cloud.", [], None),
        ("gcp-dataflow", "Dataflow", "data-processing", "Servicio administrado de Google Cloud para ejecutar pipelines de Apache Beam en batch y streaming.", [], None),
        ("gcp-dataproc", "Dataproc", "data-processing", "Servicio administrado de Google Cloud para ejecutar Spark y otros frameworks del ecosistema Hadoop.", [], "Agregado para la Cloud Capability Matrix; no referenciado aún en el blueprint."),
        ("gcp-dataform", "Dataform", "sql-transformation", "Servicio de Google Cloud para desarrollar, probar y orquestar transformaciones SQL en BigQuery.", [], None),
        ("gcp-cloud-composer", "Managed Service for Apache Airflow (ex Cloud Composer)", "orchestration",
         "Servicio administrado de Apache Airflow en Google Cloud.", [],
         "Cambio de nombre anunciado el 2026-04-15 en las release notes oficiales; el slug se mantiene."),
        ("gcp-cloud-run", "Cloud Run", "serverless-containers", "Plataforma serverless de Google Cloud para ejecutar contenedores como servicios o jobs.", [], None),
        ("gcp-cloud-sql", "Cloud SQL", "relational-database", "Bases de datos relacionales administradas en Google Cloud (PostgreSQL, MySQL, SQL Server).", [], None),
        ("gcp-dataplex", "Dataplex", "governance-catalog", "Servicio de Google Cloud para gobierno, catálogo y gestión de metadata de datos.", [], None),
        ("gcp-iam", "IAM de Google Cloud", "identity-access", "Gestión de identidades y permisos en Google Cloud.", [], None),
        ("gcp-secret-manager", "Secret Manager", "secrets", "Almacenamiento y gestión de secretos en Google Cloud.", [], None),
        ("gcp-cloud-kms", "Cloud KMS", "key-management", "Gestión de claves criptográficas en Google Cloud.", [], None),
        ("gcp-vertex-ai", "Vertex AI", "ai-platform", "Plataforma de Google Cloud para desarrollar y operar modelos de ML e IA generativa.", [], None),
        ("gcp-biglake", "BigLake", "lakehouse-platform", "Motor de almacenamiento de Google Cloud para gobernar y consultar datos de lake con formatos abiertos.", [], None),
        ("gcp-gke", "Google Kubernetes Engine (GKE)", "container-orchestration", "Kubernetes administrado en Google Cloud.", [], None),
        ("gcp-artifact-registry", "Artifact Registry", "container-registry", "Registro de imágenes de contenedores y paquetes en Google Cloud.", [], None),
        ("gcp-cloud-monitoring", "Cloud Monitoring", "monitoring", "Métricas, dashboards y alertas en Google Cloud.", [], "Agregado para la Cloud Capability Matrix; no referenciado aún en el blueprint."),
    ],
    "aws": [
        ("aws-s3", "Amazon S3", "object-storage", "Almacenamiento de objetos de AWS.", [], None),
        ("aws-redshift", "Amazon Redshift", "data-warehouse", "Data warehouse de AWS.", [], None),
        ("aws-athena", "Amazon Athena", "query-engine", "Motor de consultas SQL serverless de AWS sobre datos en S3.", [], None),
        ("aws-glue", "AWS Glue", "data-integration", "Servicio de AWS de integración de datos: catálogo, crawlers y jobs ETL.", [], None),
        ("aws-emr", "Amazon EMR", "data-processing", "Plataforma de AWS para ejecutar Spark y otros frameworks de big data.", [], None),
        ("aws-kinesis", "Amazon Kinesis Data Streams", "stream-messaging", "Servicio de AWS para ingesta y procesamiento de streams de datos.", [], None),
        ("aws-msk", "Amazon MSK", "stream-messaging", "Apache Kafka administrado en AWS.", [], None),
        ("aws-lambda", "AWS Lambda", "serverless-compute", "Cómputo serverless por eventos de AWS.", [], None),
        ("aws-step-functions", "AWS Step Functions", "orchestration", "Servicio de AWS para orquestar workflows como máquinas de estado.", [], None),
        ("aws-mwaa", "Amazon MWAA", "orchestration", "Servicio administrado de Apache Airflow en AWS.", [], None),
        ("aws-rds", "Amazon RDS", "relational-database", "Bases de datos relacionales administradas en AWS.", [], None),
        ("aws-dms", "AWS Database Migration Service", "cdc-replication", "Servicio de AWS para migración y replicación continua de bases de datos.", [("IMPLEMENTS", "change-data-capture", None)], None),
        ("aws-lake-formation", "AWS Lake Formation", "governance-catalog", "Servicio de AWS para gobernar permisos y acceso a data lakes.", [], None),
        ("aws-iam", "AWS IAM", "identity-access", "Gestión de identidades y permisos en AWS.", [], None),
        ("aws-cloudwatch", "Amazon CloudWatch", "monitoring", "Métricas, logs y alertas en AWS.", [], None),
        ("aws-bedrock", "Amazon Bedrock", "ai-platform", "Servicio de AWS para usar modelos fundacionales mediante API.", [], None),
        ("aws-sagemaker", "Amazon SageMaker", "ai-platform", "Plataforma de AWS para desarrollar y operar modelos de ML.", [], "El nombre y empaquetado de SageMaker han cambiado; verificar al redactar la ficha."),
        ("aws-cloudformation", "AWS CloudFormation", "iac", "Infraestructura como código nativa de AWS.", [], None),
        ("aws-ecs", "Amazon ECS", "serverless-containers", "Orquestación de contenedores de AWS.", [], "Puede ejecutarse sobre Fargate (serverless) o sobre instancias propias."),
        ("aws-fargate", "AWS Fargate", "serverless-containers", "Motor serverless de AWS para ejecutar contenedores en ECS o EKS.", [], None),
        ("aws-eks", "Amazon EKS", "container-orchestration", "Kubernetes administrado en AWS.", [], None),
        ("aws-ecr", "Amazon ECR", "container-registry", "Registro de imágenes de contenedores de AWS.", [], None),
        ("aws-secrets-manager", "AWS Secrets Manager", "secrets", "Almacenamiento y rotación de secretos en AWS.", [], "Agregado para la Cloud Capability Matrix; no referenciado aún en el blueprint."),
        ("aws-kms", "AWS KMS", "key-management", "Gestión de claves criptográficas en AWS.", [], "Agregado para la Cloud Capability Matrix; no referenciado aún en el blueprint."),
    ],
    "azure": [
        ("azure-adls", "Azure Data Lake Storage", "object-storage", "Almacenamiento de Azure para data lakes, construido sobre Blob Storage con espacio de nombres jerárquico.", [], None),
        ("azure-data-factory", "Azure Data Factory", "data-integration", "Servicio de Azure para integración de datos y orquestación de pipelines.", [], None),
        ("microsoft-fabric", "Microsoft Fabric", "lakehouse-platform", "Plataforma analítica SaaS de Microsoft que integra lakehouse, warehouse, integración y BI sobre OneLake.", [], FABRIC_NOTE),
        ("azure-synapse", "Azure Synapse Analytics", "data-warehouse", "Servicio analítico de Azure que combina data warehouse, SQL y Spark.", [], "Relación con Microsoft Fabric en evolución; verificar posicionamiento vigente."),
        ("azure-databricks", "Azure Databricks", "lakehouse-platform", "Plataforma Databricks ofrecida como servicio de Azure.", [], "Servicio de primera parte de Azure operado junto con Databricks."),
        ("azure-event-hubs", "Azure Event Hubs", "stream-messaging", "Servicio de Azure para ingesta de eventos a gran escala.", [], None),
        ("azure-functions", "Azure Functions", "serverless-compute", "Cómputo serverless por eventos de Azure.", [], None),
        ("azure-container-apps", "Azure Container Apps", "serverless-containers", "Plataforma serverless de Azure para ejecutar contenedores.", [], None),
        ("azure-sql", "Azure SQL", "relational-database", "Familia de bases de datos SQL Server administradas en Azure.", [], None),
        ("microsoft-purview", "Microsoft Purview", "governance-catalog", "Soluciones de Microsoft para gobierno de datos, catálogo y cumplimiento.", [], MS_NOTE),
        ("microsoft-entra-id", "Microsoft Entra ID", "identity-access", "Servicio de identidad y acceso de Microsoft (antes Azure Active Directory).", [], MS_NOTE),
        ("azure-key-vault", "Azure Key Vault", "secrets", "Almacenamiento de secretos, claves y certificados en Azure.", [], "Cubre secretos y claves; en la matriz aparece en ambas capacidades."),
        ("azure-ai", "Servicios de IA de Azure", "ai-platform", "Servicios de IA de Microsoft en Azure (modelos, APIs cognitivas y herramientas de desarrollo).", [], "Nombres y empaquetado cambian con frecuencia; verificar al redactar la ficha."),
        ("azure-aks", "Azure Kubernetes Service (AKS)", "container-orchestration", "Kubernetes administrado en Azure.", [], None),
        ("azure-container-registry", "Azure Container Registry", "container-registry", "Registro de imágenes de contenedores de Azure.", [], None),
        ("azure-bicep", "Bicep", "iac", "Lenguaje declarativo de infraestructura como código para Azure.", [], None),
        ("azure-devops", "Azure DevOps", "ci-cd", "Servicios de Microsoft para repositorios, pipelines de CI/CD y gestión de trabajo.", [], MS_NOTE),
        ("azure-monitor", "Azure Monitor", "monitoring", "Métricas, logs y alertas en Azure.", [], "Agregado para la Cloud Capability Matrix; no referenciado aún en el blueprint."),
    ],
}

# (slug, título, vendor, categoría, clasificación, descripción, [relaciones], nota)
OTHER = [
    ("python", "Python", "open-source", "programming-language", "core", "Lenguaje de programación de propósito general, dominante en ingeniería de datos.", [], None),
    ("apache-airflow", "Apache Airflow", "open-source", "orchestration", "modern", "Plataforma open source para definir, programar y monitorear workflows como DAG en Python.",
     [("RUNS_ON", "gcp-cloud-composer", None), ("RUNS_ON", "aws-mwaa", None)], None),
    ("apache-spark", "Apache Spark", "open-source", "data-processing", "modern", "Motor open source de procesamiento distribuido para batch, SQL y streaming.",
     [("RUNS_ON", "gcp-dataproc", None), ("RUNS_ON", "aws-emr", None), ("RUNS_ON", "azure-databricks", "Databricks ofrece un runtime propio basado en Spark.")], None),
    ("apache-beam", "Apache Beam", "open-source", "data-processing", "modern", "Modelo de programación unificado open source para pipelines batch y streaming, ejecutable en varios runners.",
     [("RUNS_ON", "gcp-dataflow", None)], None),
    ("apache-iceberg", "Apache Iceberg", "open-source", "table-format", "modern", "Formato de tabla abierto para grandes datasets analíticos sobre almacenamiento de objetos.", [], None),
    ("apache-hudi", "Apache Hudi", "open-source", "table-format", "modern", "Formato de tabla abierto orientado a upserts e ingesta incremental sobre data lakes.", [], None),
    ("delta-lake", "Delta Lake", "open-source", "table-format", "modern", "Formato de tabla abierto con transacciones ACID sobre data lakes.", [], None),
    ("dbt", "dbt", "other", "sql-transformation", "modern", "Herramienta de transformación SQL con modelos versionados, tests y documentación.", [],
     "dbt Core es open source; dbt Cloud es un producto comercial de dbt Labs."),
    ("terraform", "Terraform", "other", "iac", "modern", "Herramienta de infraestructura como código declarativa y multicloud de HashiCorp.", [],
     "Verificar licencia vigente y la relación con OpenTofu al redactar la ficha."),
    ("postgresql", "PostgreSQL", "open-source", "relational-database", "core", "Base de datos relacional open source.",
     [("RUNS_ON", "gcp-cloud-sql", None), ("RUNS_ON", "aws-rds", None)], None),
    ("kubernetes", "Kubernetes", "open-source", "container-orchestration", "modern", "Plataforma open source de orquestación de contenedores.",
     [("RUNS_ON", "gcp-gke", None), ("RUNS_ON", "aws-eks", None), ("RUNS_ON", "azure-aks", None)], None),
    ("docker", "Docker", "other", "container-tooling", "modern", "Herramientas para construir, distribuir y ejecutar contenedores.", [], None),
    ("docker-compose", "Docker Compose", "other", "container-tooling", "modern", "Herramienta para definir y ejecutar aplicaciones multicontenedor en local.", [("DEPENDS_ON", "docker", None)], None),
    ("git", "Git", "open-source", "version-control", "core", "Sistema de control de versiones distribuido.", [], None),
    ("github-actions", "GitHub Actions", "other", "ci-cd", "modern", "Plataforma de CI/CD integrada en GitHub.", [], None),
    ("gitlab-ci", "GitLab CI/CD", "other", "ci-cd", "modern", "Plataforma de CI/CD integrada en GitLab.", [], None),
    ("dagster", "Dagster", "open-source", "orchestration", "modern", "Orquestador open source centrado en assets de datos.",
     [("ALTERNATIVE_TO", "apache-airflow", "Tecnología a seguir (§8); no reemplaza a Airflow.")], None),
    ("prefect", "Prefect", "open-source", "orchestration", "modern", "Orquestador open source de workflows en Python.",
     [("ALTERNATIVE_TO", "apache-airflow", "Tecnología a seguir (§8); no reemplaza a Airflow.")], None),
    ("great-expectations", "Great Expectations", "open-source", "data-quality", "modern", "Framework open source para definir y ejecutar validaciones de calidad de datos.", [], None),
    ("openlineage", "OpenLineage", "open-source", "lineage", "modern", "Estándar abierto para recolectar metadata de linaje de datos.", [], None),
    ("pgvector", "pgvector", "open-source", "vector-search", "modern", "Extensión de PostgreSQL para almacenar y buscar vectores.", [("DEPENDS_ON", "postgresql", None)], None),
    ("pandas", "pandas", "open-source", "python-library", "core", "Librería de Python para análisis y manipulación de datos tabulares.", [("DEPENDS_ON", "python", None)], None),
    ("polars", "Polars", "open-source", "python-library", "modern", "Librería de DataFrames columnar y paralela.", [("ALTERNATIVE_TO", "pandas", None)], None),
    ("pyarrow", "PyArrow", "open-source", "python-library", "modern", "Bindings de Python para Apache Arrow.", [("DEPENDS_ON", "python", None)], None),
    ("pydantic", "Pydantic", "open-source", "python-library", "modern", "Validación de datos en Python basada en type hints.", [("DEPENDS_ON", "python", None)], None),
    ("requests", "Requests", "open-source", "python-library", "core", "Cliente HTTP síncrono para Python.", [("DEPENDS_ON", "python", None)], None),
    ("httpx", "HTTPX", "open-source", "python-library", "modern", "Cliente HTTP para Python con soporte síncrono y asíncrono.", [("ALTERNATIVE_TO", "requests", None)], None),
    ("fastapi", "FastAPI", "open-source", "python-library", "modern", "Framework web de Python para construir APIs con tipado.", [("DEPENDS_ON", "pydantic", None)], None),
    ("pytest", "pytest", "open-source", "python-library", "core", "Framework de testing para Python.", [("DEPENDS_ON", "python", None)], None),
]


def relations(items: list[tuple[str, str, str | None]]) -> list[dict[str, str]]:
    result = []
    for rel_type, target, note in items:
        relation = {"type": rel_type, "target": target}
        if note:
            relation["note"] = note
        result.append(relation)
    return result


def base(entity_type: str, slug: str, title: str, description: str) -> dict[str, Any]:
    return {"id": f"{entity_type}:{slug}", "slug": slug, "type": entity_type, "stub": True, "title": title, "description": description}


def closing(doc: dict[str, Any], rels: list[tuple[str, str, str | None]], note: str | None) -> dict[str, Any]:
    if note:
        doc["note"] = note
    if rels:
        doc["relations"] = relations(rels)
    doc.update(created_at=TODAY, updated_at=TODAY, verification_status="review_required")
    return doc


def cloud_docs() -> Iterator[tuple[str, dict[str, Any]]]:
    for provider, rows in CLOUD.items():
        for slug, title, category, description, rels, note in rows:
            doc = base("cloud_service", slug, title, description)
            doc.update(provider=provider, category=category, classification="modern", mvp=slug in MVP, cloud=[provider])
            yield slug, closing(doc, rels, note)


def other_docs() -> Iterator[tuple[str, dict[str, Any]]]:
    for slug, title, vendor, category, classification, description, rels, note in OTHER:
        doc = base("technology", slug, title, description)
        doc.update(vendor=vendor, category=category, classification=classification, mvp=slug in MVP, cloud=["agnostic"])
        yield slug, closing(doc, rels, note)


def generate(out_dir: Path) -> tuple[int, int]:
    """Escribe los stubs que falten en out_dir. Devuelve (creados, omitidos)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    created = skipped = 0
    for slug, doc in [*cloud_docs(), *other_docs()]:
        path = out_dir / f"{slug}.yaml"
        if path.exists():
            skipped += 1
            continue
        path.write_text(yaml.safe_dump(doc, allow_unicode=True, sort_keys=False, width=120), encoding="utf-8", newline="\n")
        created += 1
    return created, skipped


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Genera stubs de tecnologías (A-F1.2).")
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args(argv)
    created, skipped = generate(args.out)
    print(f"creados={created} omitidos={skipped}")


if __name__ == "__main__":
    main()

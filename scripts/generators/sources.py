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
]


def review_frequency(slug: str, source_type: str) -> str:
    """Política del gate F1: documentación trimestral, release notes mensual, Python trimestral."""
    if source_type == "official_docs" or slug.startswith("python-"):
        return "quarterly"
    return "monthly"


BATCH1_DATE = "2026-09-30"


def entry(row: tuple[Any, ...], created: str = TODAY) -> dict[str, Any]:
    slug, title, description, url, source_type, level, provider, verified, _, techs = row
    return {
        "id": f"source:{slug}", "slug": slug, "type": "source", "title": title, "description": description,
        "url": url, "source_type": source_type, "authority_level": level, "provider": provider,
        "url_verified": verified, "review_frequency": review_frequency(slug, source_type), "trust": "high", "technologies": techs,
        "created_at": created, "updated_at": created, "last_verified": created, "verification_status": "verified" if verified else "review_required",
    }


def build() -> str:
    docs = [entry(row) for row in [*F0, *MVP]] + [entry(row, created=BATCH1_DATE) for row in BATCH1]
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

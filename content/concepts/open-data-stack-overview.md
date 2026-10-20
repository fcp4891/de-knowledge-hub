---
id: concept:open-data-stack-overview
slug: open-data-stack-overview
type: concept
title: Qué es el open data stack
description: "El conjunto de tecnologías abiertas con las que se arma una plataforma de datos sin depender de un cloud: orquestación (Airflow), procesamiento (Spark, Flink, Beam), mensajería (Kafka), transformación (dbt), bases (PostgreSQL), infraestructura (Terraform) y ejecución (Kubernetes). Cada pieza tiene una versión administrada en cada nube, que no es idéntica. Ejemplo ejecutado en la CI: PostgreSQL y Kafka en un docker compose up. Composer, MWAA, EMR, MSK, Databricks y otras, con sus diferencias."
domain: open-data-stack
subdomain: open-stack-overview
category: open-data-stack
classification: modern
level: basic
importance: medium
cloud: [agnostic]
technologies: [apache-airflow, apache-spark, apache-kafka, apache-flink, apache-beam, dbt, terraform, postgresql, kubernetes]
tags: [open-source, open-data-stack, portability, managed-services]
related_topics: [airflow-architecture]
sources:
  - source: apache-airflow-docs
    url: https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
    accessed: 2026-10-02
    page_title: "Architecture Overview"
    note: "Componentes requeridos: scheduler (dispara workflows y envía tareas al executor, que es una propiedad de configuración del scheduler y corre en su proceso), Dag processor (parsea los Dag files de un Dag bundle y los serializa en la base de metadatos), Dag bundle (por defecto una carpeta local), API server (REST API y UI; las tareas que usan el task SDK le reportan su estado sin acceso directo a la base) y base de metadatos (normalmente PostgreSQL o MySQL). Opcionales: workers, triggerer (tareas diferidas en un event loop asyncio) y plugins. Separar el Dag processor del scheduler evita que el scheduler acceda a los Dag bundles y ejecute código de los autores."
  - source: apache-spark-docs
    url: https://spark.apache.org/docs/4.2.0/cluster-overview.html
    accessed: 2026-10-20
    page_title: "Cluster Mode Overview"
    note: "Cluster Mode Overview (Spark 4.2.0): una aplicación de Spark corre como procesos independientes en un clúster, coordinados por el SparkContext del driver; puede usar distintos administradores de clúster."
  - source: apache-kafka-docs
    url: https://kafka.apache.org/43/getting-started/introduction/
    accessed: 2026-10-20
    page_title: "Introduction"
    note: "Introduction (Kafka 4.3): Kafka es un sistema distribuido de servidores y clientes que se puede desplegar en hardware propio, máquinas virtuales y contenedores, en entornos propios o en la nube, y también como servicio administrado de distintos proveedores."
  - source: apache-flink-docs
    url: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/concepts/overview/
    accessed: 2026-10-20
    page_title: "Concepts"
    note: "Concepts Overview (Flink 2.3): Flink ofrece distintos niveles de abstracción para aplicaciones de streaming y batch; el más bajo es el procesamiento de streams con estado y tiempo, dentro de la DataStream API, con estado consistente y tolerante a fallos."
  - source: apache-beam-docs
    url: https://beam.apache.org/documentation/programming-guide/
    accessed: 2026-10-08
    page_title: "Apache Beam Programming Guide"
    note: "Beam Programming Guide (sin URL por versión; SDK 2.77.0 instalado): Pipeline encapsula toda la tarea de procesamiento; PCollection representa un conjunto de datos distribuido, acotado (fuente fija) o no acotado (fuente que se actualiza continuamente); PTransform es una operación que toma PCollections y produce otras. Una PCollection es inmutable: una transformación produce una nueva y no modifica la original; no es seguro modificar los valores que recibe un DoFn. ParDo es la transformación de procesamiento paralelo genérico (como la fase Map); GroupByKey es una reducción paralela sobre pares clave/valor (como el Shuffle); Combine combina elementos o valores por clave. Salidas adicionales con tags desde un DoFn. Windowing subdivide una PCollection según la marca de tiempo de cada elemento; GroupByKey y Combine trabajan implícitamente por ventana; ventanas fijas, deslizantes, de sesión y la ventana global."
  - source: dbt-docs
    url: https://docs.getdbt.com/docs/introduction
    accessed: 2026-10-20
    page_title: "What is dbt?"
    note: "What is dbt?: «dbt transforms raw warehouse data into trusted data products»; se escriben sentencias SQL select y dbt arma modelos de datos modulares. La generación actual del motor está escrita en Rust y es la experiencia por defecto al instalar dbt (v2); la generación original en Python sigue mantenida como dbt v1."
  - source: terraform-docs
    url: https://developer.hashicorp.com/terraform/intro
    accessed: 2026-10-01
    page_title: "What is Terraform?"
    note: "Terraform define y gestiona infraestructura de forma consistente y repetible con archivos de configuración legibles que se versionan, reutilizan y comparten. Los archivos son declarativos: describen el estado final, no los pasos. Flujo: escribir, plan (plan de ejecución con lo que creará, actualizará o destruirá) y apply (tras aprobación). Registra la infraestructura real en un archivo de state, fuente de verdad del entorno."
  - source: kubernetes-docs
    url: https://kubernetes.io/docs/concepts/overview/
    accessed: 2026-10-19
    page_title: "Overview"
    note: "Overview (documentación de Kubernetes 1.37): «Kubernetes is a portable, extensible, open source platform for managing containerized workloads and services that facilitate both declarative configuration and automation»."
  - source: gcp-cloud-composer-docs
    url: https://docs.cloud.google.com/composer/docs/composer-3/environment-architecture
    accessed: 2026-10-02
    page_title: "Environment architecture"
    note: "Gen 3: los recursos se reparten entre el proyecto del cliente y un tenant project administrado por Google. El bucket del entorno (DAGs, plugins, dependencias y logs) está en el proyecto del cliente. La base de Airflow es una instancia de Cloud SQL en el tenant project, accesible solo para la cuenta de servicio del entorno. Los DAG processors corren como componentes separados y la cantidad de workers cambia según las tareas en cola. Todos los recursos de Airflow corren en el tenant project."
  - source: gcp-dataflow-docs
    url: https://docs.cloud.google.com/dataflow/docs/overview
    accessed: 2026-10-11
    page_title: "Dataflow overview"
    note: "Dataflow overview: servicio de Google Cloud de procesamiento unificado batch y streaming a escala; el mismo modelo de programación para ambos. Por defecto, procesamiento exactly-once de cada registro; para pipelines streaming que toleran duplicados, el modo at-least-once reduce costo y latencia. Casos: movimiento de datos, ETL hacia BigQuery, soporte de dashboards, ML en tiempo real, procesamiento de logs o sensores."
  - source: aws-mwaa-docs
    url: https://docs.aws.amazon.com/mwaa/latest/userguide/what-is-mwaa.html
    accessed: 2026-10-02
    page_title: "What Is Amazon Managed Workflows for Apache Airflow?"
    note: "En MWAA, scheduler y workers corren en contenedores de Fargate; la base de metadatos la administra AWS y se accede por un VPC endpoint privado. CloudWatch, S3, SQS y KMS son externos al servicio y deben ser accesibles desde schedulers y workers. Varios schedulers solo con Airflow v2 o posterior."
  - source: aws-msk-docs
    url: https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html
    accessed: 2026-10-12
    page_title: "Welcome to the Amazon MSK Developer Guide"
    note: "Welcome to the Amazon MSK Developer Guide: servicio administrado para construir y ejecutar aplicaciones que usan Apache Kafka; MSK da las operaciones del plano de control (crear, actualizar, borrar clústeres) y deja usar las operaciones del plano de datos de Kafka (producir y consumir). Ejecuta versiones de código abierto de Kafka, así que las aplicaciones, herramientas y plugins existentes funcionan sin cambiar el código."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html
    accessed: 2026-10-12
    page_title: "What is Amazon Relational Database Service (Amazon RDS)?"
    note: "What is Amazon RDS?: servicio para configurar, operar y escalar bases relacionales en AWS, que administra las tareas comunes de administración; esta guía cubre los motores de RDS distintos de Aurora."
  - source: azure-databricks-docs
    url: https://learn.microsoft.com/en-us/azure/databricks/introduction/
    accessed: 2026-10-13
    page_title: "What is Azure Databricks?"
    note: "What is Azure Databricks?: plataforma de analítica unificada y abierta para construir, desplegar, compartir y mantener soluciones de datos, analítica e IA; se integra con el almacenamiento y la seguridad de la cuenta en la nube y administra y despliega la infraestructura."
  - source: azure-event-hubs-docs
    url: https://learn.microsoft.com/en-us/azure/event-hubs/azure-event-hubs-apache-kafka-overview
    accessed: 2026-10-13
    page_title: "What is Azure Event Hubs for Apache Kafka?"
    note: "What is Azure Event Hubs for Apache Kafka?: cada event hub expone un endpoint de Kafka; muchas aplicaciones de Kafka se conectan sin cambiar el código, solo la configuración (la cadena de conexión)."
relations:
  - type: RELATED_TO
    target: airflow-architecture
    note: Orquestación abierta.
  - type: RELATED_TO
    target: spark-execution-model
    note: Procesamiento distribuido.
  - type: RELATED_TO
    target: kafka-architecture
    note: Mensajería abierta.
  - type: RELATED_TO
    target: postgresql-for-data-engineers
    note: La base de datos abierta más común en pipelines.
  - type: RELATED_TO
    target: beam-programming-model
    note: Un modelo de pipeline con varios runners.
  - type: RELATED_TO
    target: infrastructure-as-code
    note: Terraform para la infraestructura.
  - type: RELATED_TO
    target: kubernetes-fundamentals
    note: Ejecución en contenedores.
  - type: RELATED_TO
    target: docker-compose-environments
    note: El stack abierto en una máquina.
  - type: RELATED_TO
    target: stateful-stream-processing
    note: Flink, el motor de streams con estado.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

Buena parte de lo que hace un equipo de datos se puede armar con tecnologías abiertas, que corren en cualquier lugar: en una laptop, en servidores propios o en cualquier nube. Ese conjunto es el **open data stack**:

- **orquestación:** Airflow;
- **procesamiento:** Spark, Flink y Beam;
- **mensajería:** Kafka;
- **transformación:** dbt;
- **bases de datos:** PostgreSQL;
- **infraestructura y ejecución:** Terraform y Kubernetes.

Cada nube ofrece versiones administradas de varias de estas piezas (Composer y MWAA para Airflow, EMR y Databricks para Spark, MSK para Kafka, RDS y Cloud SQL para PostgreSQL). Son la misma tecnología con otra forma de operarla: versiones, límites y cobro propios. Conocer la pieza abierta ayuda a no ver Data Engineering solo a través de los productos de una nube.

## 2. Qué es

- **Tecnología abierta:** un proyecto de código abierto con documentación y releases propios (Apache Spark, Apache Kafka, PostgreSQL).
- **Servicio administrado:** la nube opera la tecnología (MSK opera Kafka, MWAA opera Airflow) y el equipo la usa.
- **Servicio propio de la nube:** algo distinto que resuelve un problema parecido (Pub/Sub frente a Kafka, BigQuery frente a Spark); no es la misma tecnología.
- **Portabilidad:** cuánto cuesta mover un pipeline a otro entorno; es mayor cuanto más dependa de la tecnología abierta y menos de las extensiones del proveedor.

## 3. Problema que resuelve

Un equipo aprende Data Engineering solo con los servicios de una nube y no sabe qué parte de lo que hace es la tecnología y qué parte es el producto. Al cambiar de nube o al leer documentación de Spark o Kafka, nada coincide. Separar la pieza abierta de su versión administrada deja claro qué conocimiento sirve en cualquier lado y qué es propio de un proveedor.

## 4. Cómo funciona

1. Cada función de la plataforma tiene una pieza abierta: Airflow orquesta, Spark procesa, Kafka mueve eventos, dbt transforma, PostgreSQL guarda.
2. Se pueden correr todas en una máquina para desarrollo (Docker Compose) o en un clúster (Kubernetes).
3. En producción, cada pieza se opera en forma propia o se usa su versión administrada en la nube.
4. Terraform describe esa infraestructura en código, para cualquiera de las opciones.

## 5. Cuándo utilizarlo

- Para aprender los conceptos que no cambian de proveedor.
- Plataformas que deben poder correr en más de una nube o en servidores propios.
- Entornos locales de desarrollo y pruebas con las mismas piezas que producción.

## 6. Cuándo no utilizarlo

- Operar todo en forma propia cuando el equipo es chico y un servicio administrado cubre el caso.
- Elegir una pieza abierta solo por ser abierta, si un servicio propio de la nube resuelve mejor el problema.
- Suponer que la versión administrada es idéntica a la abierta: cambian versiones, configuración y límites.

## 7. Ejemplo sencillo

Un `compose.yaml` levanta PostgreSQL 17 y Kafka 4.3.1 en una máquina, sin servicios de nube. Cada pieza se comprueba con su propia herramienta: `psql` responde con la versión de la base y `kafka-topics.sh` crea y lista un topic.

## 8. Ejemplo de producción

Una plataforma de datos de una empresa con dos nubes:

- Airflow administrado en cada nube (Composer y MWAA), con los mismos Dags;
- Spark en EMR y en Databricks, con el mismo código PySpark y la versión de Spark revisada en cada uno;
- Kafka en MSK como bus de eventos;
- dbt para los modelos del warehouse;
- Terraform para toda la infraestructura y PostgreSQL administrado como base de metadatos.

## 9. Arquitectura

```mermaid
flowchart LR
  K["Kafka<br/>eventos"] --> F["Flink / Spark<br/>procesamiento"]
  P["PostgreSQL<br/>origen"] --> S["Spark<br/>batch"]
  F --> L["Lake / warehouse"]
  S --> L
  L --> D["dbt<br/>modelos"]
  A["Airflow"] -. "orquesta" .-> S
  A -. "orquesta" .-> D
  T["Terraform + Kubernetes"] -. "infraestructura" .-> K
```

## 10. Código

```yaml
# Docker Compose (ejecutado en la CI con docker compose up; ADR-016 y ADR-017): un stack abierto mínimo en una máquina,
# sin servicios de nube: PostgreSQL 17 como base y Apache Kafka 4.3.1 en KRaft como broker, fijados por digest.
name: dekh-open-stack
services:
  db:
    image: postgres:17@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3
    environment:
      POSTGRES_PASSWORD: solo-local   # entorno descartable; en producción, un secreto
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 2s
      retries: 30
  broker:
    image: apache/kafka:4.3.1@sha256:77e3df9054047a88b520d0cc46e16696d3b22022e1d580aeccd2632df6532837
    healthcheck:
      test: ["CMD", "/opt/kafka/bin/kafka-topics.sh", "--bootstrap-server", "localhost:9092", "--list"]
      interval: 3s
      retries: 40
```

```bash
# Bash y Docker Compose (ejecutado en la CI; ADR-016 y ADR-017): levanta el stack, espera los healthchecks y comprueba
# cada pieza con su propia herramienta. Corre en la carpeta del compose.yaml y lo borra todo al salir.
set -euo pipefail
trap 'docker compose down --volumes > /dev/null 2>&1' EXIT

docker compose up --wait --quiet-pull > /dev/null 2>&1
echo "servicios sanos: $(docker compose ps --format '{{.Service}}' --status running | sort | tr '\n' ' ')"
echo "base: $(docker compose exec -T db psql -U postgres -tAc 'SHOW server_version' | cut -d' ' -f1)"
docker compose exec -T broker /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic pedidos --partitions 3 > /dev/null
echo "broker: $(docker compose exec -T broker /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list)"
```

El `compose.yaml` y el script se **ejecutan en la CI con `docker compose up --wait`** (ADR-016 y ADR-017), con PostgreSQL 17 y Kafka 4.3.1 fijados por digest. Imprimen `servicios sanos: broker db`, la versión de la base (`17.x`) y `broker: pedidos`, y borran todo al salir.

## 11. GCP

En GCP, las piezas abiertas y su versión administrada. Según *Environment architecture*, *Compare Managed Service for Apache Spark serverless and cluster deployments* y *Dataflow overview* (no ejecutado):

| Pieza abierta | En GCP | Diferencia |
|---|---|---|
| Airflow | Cloud Composer | En Composer 3, los recursos se reparten entre el proyecto del cliente (el bucket con Dags y logs) y un tenant project de Google (la base de Airflow en Cloud SQL) |
| Beam | Dataflow | El runner administrado de los pipelines de Beam |
| PostgreSQL | Cloud SQL para PostgreSQL | La decodificación lógica se activa con una marca propia (ver `postgresql-for-data-engineers`) |
| Kafka | — | Pub/Sub es el servicio propio de mensajería, no Kafka (ver `kafka-architecture`) |

## 12. AWS

En AWS, según *What Is Amazon Managed Workflows for Apache Airflow?*, *Welcome to the Amazon MSK Developer Guide* y *What is Amazon Relational Database Service (Amazon RDS)?* (no ejecutado):

| Pieza abierta | En AWS | Diferencia |
|---|---|---|
| Airflow | Amazon MWAA | Scheduler y workers en contenedores de Fargate; AWS administra la base de metadatos |
| Kafka | Amazon MSK | AWS opera el plano de control; se usa el plano de datos de Kafka |
| PostgreSQL | Amazon RDS para PostgreSQL | Base administrada; los parámetros propios, como `rds.logical_replication`, reemplazan a la configuración directa |

## 13. Azure

En Azure, según *What is Azure Databricks?* y *What is Azure Event Hubs for Apache Kafka?* (no ejecutado):

| Pieza abierta | En Azure | Diferencia |
|---|---|---|
| Spark | Azure Databricks | Plataforma propia sobre Spark que administra la infraestructura |
| Kafka | Event Hubs | Un servicio propio con endpoint compatible con Kafka, no un clúster de Kafka |

## 14. Buenas prácticas

- Aprender cada pieza en su documentación abierta y después su versión administrada.
- Fijar versiones y revisar la del servicio administrado antes de copiar código o configuración.
- Un entorno local con las mismas piezas que producción (Docker Compose).
- **Seguridad:** las credenciales del entorno local son descartables; en producción, un gestor de secretos.
- **Observabilidad:** cada pieza tiene sus propias métricas; un servicio administrado suele exponerlas en el monitoreo de la nube.
- **Costo:** operar en forma propia ahorra el sobreprecio del servicio administrado y cuesta horas de operación.

## 15. Errores frecuentes

- Llamar «Kafka» a Pub/Sub o a Event Hubs, o «Spark» a BigQuery.
- Suponer que la versión del servicio administrado es la última de la tecnología abierta.
- Operar en forma propia todas las piezas con un equipo chico.
- Un entorno local que no se parece a producción.

## 16. Trade-offs

Las piezas abiertas dan portabilidad y conocimiento que sirve en cualquier lado, a cambio de operarlas o de elegir con cuidado la versión administrada. Los servicios propios de cada nube suelen ser más simples de usar y atan más al proveedor. La mayoría de las plataformas mezclan: piezas abiertas administradas donde conviene y servicios propios donde resuelven mejor.

## 17. Conceptos relacionados

- `airflow-architecture`: orquestación.
- `spark-execution-model`: procesamiento con Spark.
- `kafka-architecture`: mensajería con Kafka.
- `postgresql-for-data-engineers`: PostgreSQL.
- `beam-programming-model`: Beam y sus runners.
- `infrastructure-as-code`: Terraform.
- `kubernetes-fundamentals`: ejecución en Kubernetes.
- `docker-compose-environments`: el stack en una máquina.
- `stateful-stream-processing`: Flink y el estado.

## 18. Preguntas técnicas abiertas

1. ¿Qué piezas de tu plataforma son tecnología abierta y cuáles son servicios propios de la nube?
2. ¿Qué versión de Spark, Airflow o Kafka corre tu servicio administrado?
3. ¿Qué parte de tu plataforma podrías levantar en una laptop?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- Apache Airflow: *Architecture Overview*. Apache Spark 4.2.0: *Cluster Mode Overview*. Apache Kafka 4.3: *Introduction*. Apache Flink 2.3: *Concepts*. Apache Beam: *Apache Beam Programming Guide*. dbt: *What is dbt?*. HashiCorp: *What is Terraform?*. Kubernetes: *Overview*.
- Google Cloud: *Environment architecture* (Cloud Composer) y *Dataflow overview*.
- AWS: *What Is Amazon Managed Workflows for Apache Airflow?*, *Welcome to the Amazon MSK Developer Guide* y *What is Amazon Relational Database Service (Amazon RDS)?*.
- Microsoft Learn: *What is Azure Databricks?* y *What is Azure Event Hubs for Apache Kafka?*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-20a.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-20a).

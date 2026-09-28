# Data Engineering Knowledge Hub

## Plan Maestro de Contenido, Conocimiento y Desarrollo

**Versión:** 1.0  
**Fecha:** 28-09-2026  
**Objetivo:** Definir, antes del desarrollo técnico, todo lo necesario para construir una plataforma personal de estudio y actualización continua enfocada en el rol de **Data Engineer**, con conocimiento transversal, profundo, práctico, actualizado y verificable.

---

# 1. Visión del producto

## 1.1 Problema que queremos resolver

El conocimiento requerido para un Data Engineer moderno es cada vez más amplio. Ya no basta con conocer SQL, Python y una herramienta ETL. Un perfil Senior debe comprender arquitectura, modelado, procesamiento batch y streaming, calidad, observabilidad, gobierno, seguridad, DevOps, infraestructura como código, múltiples proveedores cloud y, progresivamente, integración de IA.

Además, los servicios cloud, SDK, frameworks y buenas prácticas evolucionan constantemente. Esto genera dos necesidades diferentes:

1. **Mantener conocimiento profundo y estable** sobre los fundamentos de ingeniería de datos.
2. **Mantener conocimiento actualizado** sobre herramientas, servicios, cambios, nuevas prácticas y tecnologías emergentes.

La plataforma debe resolver ambas necesidades sin convertirse en una simple biblioteca de enlaces, cursos o noticias.

---

## 1.2 Objetivo general

Construir una plataforma denominada provisionalmente **Data Engineering Knowledge Hub**, orientada a:

- estudiar conceptos fundamentales de Data Engineering;
- profundizar conceptos ya conocidos;
- estudiar herramientas mediante casos reales;
- comparar implementaciones en GCP, AWS y Azure;
- mantener snippets y ejemplos de código importantes;
- estudiar arquitecturas completas;
- practicar mediante laboratorios y problemas reales;
- relacionar conceptos entre sí;
- detectar conocimientos que requieren actualización;
- consumir noticias relevantes sin ruido informativo;
- identificar tecnologías modernas y emergentes;
- analizar requerimientos de ofertas laborales;
- detectar brechas entre una oferta y el conocimiento disponible;
- preparar entrevistas técnicas mediante conceptos, escenarios y preguntas abiertas;
- conservar trazabilidad de las fuentes utilizadas.

La plataforma debe priorizar **comprensión y criterio técnico**, no memorización.

---

# 2. Principios fundamentales

## 2.1 Concepto antes que producto

La plataforma no debe enseñar solamente que "Pub/Sub sirve para mensajería" o que "BigQuery es un Data Warehouse".

Debe comenzar por el problema y el concepto.

Ejemplo:

```text
Streaming / Event-driven architecture
             |
             +-- GCP   -> Pub/Sub
             +-- AWS   -> Kinesis / MSK
             +-- Azure -> Event Hubs
```

Esto permite que el conocimiento sobreviva aunque cambien las herramientas.

---

## 2.2 Profundidad progresiva

Cada tema debe poder consultarse rápidamente, pero también profundizarse.

Niveles sugeridos:

```text
Resumen
  -> Concepto
     -> Funcionamiento
        -> Implementación
           -> Código
              -> Arquitectura
                 -> Buenas prácticas
                    -> Problemas reales
                       -> Fuentes
```

La interfaz debe permitir detenerse en el nivel necesario.

---

## 2.3 Cloud transversal

GCP será especialmente relevante, pero la plataforma no debe quedar ligada exclusivamente a un proveedor.

Debe mantener equivalencias y diferencias entre:

- Google Cloud Platform;
- Amazon Web Services;
- Microsoft Azure.

Cuando corresponda, también se incorporarán tecnologías independientes del proveedor, como:

- Apache Airflow;
- Apache Spark;
- Apache Kafka;
- Apache Beam;
- Apache Iceberg;
- dbt;
- Terraform;
- Kubernetes;
- PostgreSQL;
- Python.

---

## 2.4 Conocimiento verificable

Toda afirmación susceptible de quedar obsoleta debe mantener su fuente y fecha de verificación.

La plataforma debe diferenciar claramente entre:

- fundamentos relativamente estables;
- documentación de producto;
- buenas prácticas actuales;
- novedades;
- tecnologías emergentes;
- opiniones o recomendaciones arquitectónicas.

Nunca se debe presentar una noticia, publicación de terceros o inferencia de IA como un hecho oficial sin validación.

---

## 2.5 Aprender mediante problemas reales

La plataforma debe responder preguntas como:

- ¿qué problema resuelve esta tecnología?;
- ¿cuándo debería utilizarla?;
- ¿cuándo no debería utilizarla?;
- ¿qué alternativas existen?;
- ¿cómo se integra con otros componentes?;
- ¿qué problemas aparecen en producción?;
- ¿cómo se implementa?;
- ¿cómo cambia entre GCP, AWS y Azure?;

---

# 3. Tipos de conocimiento

Todo contenido debe clasificarse como mínimo en una de estas categorías.

## 3.1 Core

Conocimiento fundamental y relativamente estable que un Data Engineer debe dominar.

Ejemplos:

- SQL;
- Python;
- ETL / ELT;
- OLTP / OLAP;
- modelado dimensional;
- Data Warehouse;
- Data Lake;
- particionamiento;
- idempotencia;
- CDC;
- SCD;
- Git;
- testing;
- IAM;
- batch;
- streaming;
- consistencia;
- formatos de datos.

---

## 3.2 Modern

Herramientas, arquitecturas y prácticas ampliamente utilizadas actualmente.

Ejemplos:

- Airflow;
- dbt;
- Dataform;
- Terraform;
- Spark;
- Kafka;
- Medallion Architecture;
- Data Contracts;
- Data Observability;
- Open Table Formats;
- CI/CD para datos;
- GitOps;
- Lakehouse.

---

## 3.3 Emerging

Tecnologías y patrones que todavía evolucionan rápidamente pero que pueden adquirir relevancia profesional.

Ejemplos:

- MCP;
- agentes aplicados a datos;
- Agentic Data Engineering;
- automatización mediante LLM;
- AI-assisted development;
- nuevas semantic layers;
- nuevos estándares de interoperabilidad;
- evolución de open table formats.

Una tecnología emergente no debe mostrarse como reemplazo automático de una tecnología consolidada.

---

# 4. Dominios maestros de conocimiento

Este será el primer mapa general de contenido.

## 4.1 Fundamentos de Data Engineering

Debe incluir:

- qué es Data Engineering;
- ciclo de vida del dato;
- ETL vs ELT;
- batch vs streaming;
- OLTP vs OLAP;
- Data Lake;
- Data Warehouse;
- Lakehouse;
- Data Mart;
- data pipeline;
- ingestion;
- transformation;
- orchestration;
- idempotencia;
- CDC;
- schema evolution;
- late-arriving data;
- backfills;
- replay;
- data contracts;
- consistencia;
- ACID;
- CAP;
- formatos row-oriented y columnar;
- Parquet;
- Avro;
- JSON;
- compresión;
- particionamiento.

---

## 4.2 SQL avanzado

### Lenguaje

- SELECT avanzado;
- JOIN;
- subqueries;
- CTE;
- recursive CTE;
- window functions;
- QUALIFY;
- CASE;
- ARRAY;
- STRUCT;
- UNNEST;
- PIVOT;
- MERGE;
- funciones analíticas;
- funciones de fecha;
- funciones JSON.

### Patrones Data Engineering

- incremental loads;
- deduplicación;
- SCD Type 1;
- SCD Type 2;
- upserts;
- detección de cambios;
- reconciliación;
- controles de calidad;
- generación de surrogate keys.

### Performance

- query plans;
- partition pruning;
- clustering;
- predicate pushdown;
- reducción de scans;
- materialización;
- optimización de joins;
- optimización específica de warehouses cloud.

---

# 5. Python para Data Engineering

No debe transformarse en un curso genérico de Python.

Debe concentrarse en Python aplicado al trabajo de datos.

## 5.1 Python Core

- estructuras de datos;
- comprehensions;
- funciones;
- typing;
- clases;
- exceptions;
- context managers;
- iterators;
- generators;
- decorators;
- manejo de archivos;
- concurrencia y asincronía cuando corresponda.

## 5.2 Librerías

- Pandas;
- Polars;
- PyArrow;
- Pydantic;
- Requests / httpx;
- FastAPI;
- pytest;
- logging;
- Apache Beam;
- PySpark.

## 5.3 Casos reales

- consumir APIs;
- procesar archivos;
- validar schemas;
- transformar datasets;
- escribir en databases;
- crear APIs de datos;
- construir pipelines;
- testing;
- logging;
- retries;
- manejo de errores;
- procesamiento paralelo.

---

# 6. Modelado de datos

Debe cubrir:

- conceptual model;
- logical model;
- physical model;
- normalización;
- desnormalización;
- Star Schema;
- Snowflake Schema;
- fact tables;
- dimensions;
- grain;
- surrogate keys;
- SCD;
- Kimball;
- Data Vault;
- One Big Table;
- semantic models;
- Medallion;
- Data Mesh;
- Data Products.

Cada patrón debe explicar:

1. qué problema resuelve;
2. estructura;
3. ventajas;
4. desventajas;
5. cuándo utilizarlo;
6. cuándo evitarlo;
7. ejemplo real.

---

# 7. Pipelines de datos

Debe incluir patrones completos de pipelines.

```text
Source
  -> Ingestion
     -> Raw
        -> Transformation
           -> Curated
              -> Serving
```

Temas:

- batch ingestion;
- streaming ingestion;
- incremental pipelines;
- CDC pipelines;
- API ingestion;
- file ingestion;
- database ingestion;
- event-driven pipelines;
- retries;
- checkpoints;
- dead-letter queues;
- replay;
- backfill;
- idempotencia;
- dependencia entre procesos;
- recuperación ante fallas.

---

# 8. Orquestación

Conceptos independientes de proveedor:

- DAG;
- task;
- dependency;
- scheduler;
- retries;
- sensors;
- backfill;
- catchup;
- dynamic workflows;
- event-driven orchestration;
- observabilidad.

Tecnologías principales:

- Apache Airflow;
- Cloud Composer;
- AWS MWAA;
- Azure Data Factory / Fabric según el escenario;
- Step Functions cuando corresponda;
- Dagster y Prefect como tecnologías a seguir.

Debe explicar claramente la diferencia entre el proyecto open source y los servicios administrados que lo ejecutan.

---

# 9. Arquitecturas de datos

La plataforma debe poseer una sección específica de arquitecturas.

Arquitecturas iniciales:

- Modern Data Warehouse;
- Data Lake;
- Lakehouse;
- Medallion;
- Lambda Architecture;
- Kappa Architecture;
- Event-driven architecture;
- CDC architecture;
- real-time analytics;
- Data Mesh;
- Data Products;
- API-to-Warehouse;
- IoT pipeline;
- ML feature pipeline;
- RAG data pipeline.

Cada arquitectura debe contener:

```text
Problema
Contexto
Diagrama
Componentes
Flujo de datos
Decisiones
Trade-offs
Seguridad
Escalabilidad
Observabilidad
Costo
Alternativas
GCP
AWS
Azure
Código relacionado
Fuentes
```

---

# 10. Google Cloud Platform

## 10.1 Servicios prioritarios

- BigQuery;
- Cloud Storage;
- Pub/Sub;
- Dataflow;
- Dataform;
- Cloud Composer;
- Cloud Run;
- Cloud SQL;
- Dataplex;
- IAM;
- Secret Manager;
- KMS;
- Vertex AI.

## 10.2 BigQuery

Profundizar especialmente en:

- arquitectura;
- storage vs compute;
- SQL;
- partitioning;
- clustering;
- slots;
- query optimization;
- costos;
- materialized views;
- external tables;
- BigLake;
- security;
- policy tags;
- INFORMATION_SCHEMA;
- monitoring;
- incremental models.

---

# 11. Amazon Web Services

Servicios relevantes:

- S3;
- Redshift;
- Glue;
- Athena;
- EMR;
- Kinesis;
- MSK;
- Lambda;
- Step Functions;
- MWAA;
- RDS;
- Lake Formation;
- IAM;
- CloudWatch;
- Bedrock;
- SageMaker cuando corresponda.

El objetivo no es memorizar AWS, sino comprender cómo los conceptos conocidos se implementan en este ecosistema.

---

# 12. Microsoft Azure

Servicios y plataformas relevantes:

- ADLS;
- Azure Data Factory;
- Fabric;
- Synapse;
- Databricks;
- Event Hubs;
- Azure Functions;
- Container Apps;
- Azure SQL;
- Purview;
- Entra ID / IAM relacionado;
- Key Vault;
- Azure AI.

La plataforma deberá mantener especialmente actualizadas las relaciones entre ADF, Synapse, Fabric y Databricks porque el ecosistema está evolucionando.

---

# 13. Matriz multicloud

Debe existir una vista transversal por capacidad.

| Capacidad | GCP | AWS | Azure |
|---|---|---|---|
| Object Storage | Cloud Storage | S3 | ADLS |
| Warehouse | BigQuery | Redshift | Fabric Warehouse / Synapse |
| Streaming | Pub/Sub | Kinesis / MSK | Event Hubs |
| Processing | Dataflow | Glue / EMR | Fabric / Databricks |
| Orchestration | Composer | MWAA / Step Functions | ADF / Fabric |
| Governance | Dataplex | Lake Formation | Purview |
| AI | Vertex AI | Bedrock | Azure AI |

La equivalencia nunca debe implicar que los productos sean idénticos.

Cada comparación debe incluir diferencias arquitectónicas y casos de uso.

---

# 14. DevOps e Infrastructure as Code

Debe incluir:

## Git

- branching;
- pull requests;
- code review;
- tags;
- releases.

## CI/CD

- pipelines;
- testing;
- build;
- deployment;
- environments;
- secrets;
- rollback.

Tecnologías:

- GitHub Actions;
- GitLab CI/CD;
- Azure DevOps cuando corresponda.

## Infrastructure as Code

Principalmente:

- Terraform;
- modules;
- state;
- remote state;
- providers;
- variables;
- outputs;
- environments;
- plan/apply;
- drift;
- seguridad.

También registrar:

- CloudFormation;
- Bicep.

---

# 15. Containers y plataforma

Conceptos:

- Docker;
- images;
- containers;
- volumes;
- networking;
- Dockerfile;
- Docker Compose;
- registries;
- Kubernetes fundamentals.

Relación cloud:

```text
Container
   |
   +-- GCP   -> Cloud Run / GKE
   +-- AWS   -> ECS / Fargate / EKS
   +-- Azure -> Container Apps / AKS
```

---

# 16. Streaming y Event-Driven

Temas:

- events;
- producers;
- consumers;
- brokers;
- topics;
- partitions;
- offsets;
- ordering;
- delivery semantics;
- at-most-once;
- at-least-once;
- exactly-once y sus matices;
- watermarking;
- windows;
- event time;
- processing time;
- dead-letter queues;
- replay.

Tecnologías:

- Kafka;
- Pub/Sub;
- Kinesis;
- MSK;
- Event Hubs;
- Dataflow / Beam;
- Spark Structured Streaming.

---

# 17. Data Quality

Dimensiones:

- completeness;
- accuracy;
- consistency;
- validity;
- uniqueness;
- timeliness.

Implementaciones:

- SQL validation;
- dbt tests;
- Dataform assertions;
- Great Expectations u opciones equivalentes;
- custom validators;
- schema validation;
- reconciliation.

Patrones:

```text
Source
  -> Validation
     -> Transformation
        -> Quality Gate
           -> Publish
```

---

# 18. Observabilidad

Debe diferenciarse de Data Quality.

Contenido:

- logs;
- metrics;
- traces;
- lineage;
- freshness;
- volume anomalies;
- schema changes;
- pipeline health;
- SLA;
- SLO;
- alerting;
- incident response;
- root cause analysis.

---

# 19. Gobierno, seguridad y compliance

## Gobierno

- data catalog;
- metadata;
- lineage;
- ownership;
- stewardship;
- classification;
- data domains;
- retention;
- lifecycle.

## Seguridad

- IAM;
- RBAC;
- ABAC;
- least privilege;
- encryption at rest;
- encryption in transit;
- KMS;
- secrets;
- service accounts;
- row-level security;
- column-level security;
- policy tags.

## Compliance

Registrar marcos relevantes para los contextos laborales donde sean necesarios, por ejemplo:

- GDPR;
- LGPD;
- legislación chilena aplicable;
- políticas corporativas.

La plataforma debe distinguir entre explicación técnica y asesoría legal.

---

# 20. IA aplicada a Data Engineering

Debe ser un dominio propio, pero relacionado directamente con ingeniería de datos.

## Fundamentos

- LLM;
- tokens;
- context windows;
- embeddings;
- structured outputs;
- function/tool calling;
- prompt engineering.

## Retrieval

- vector databases;
- chunking;
- embeddings;
- RAG;
- Hybrid RAG;
- reranking;
- metadata filtering.

## Sistemas modernos

- tool calling;
- agents;
- multi-agent systems cuando tenga sentido;
- MCP;
- agentic workflows;
- evaluation;
- observability;
- guardrails.

## Data Engineering + AI

Casos de estudio:

- generación asistida de SQL;
- documentación automática;
- clasificación de datos;
- detección de anomalías;
- enriquecimiento de metadata;
- generación de pipelines;
- análisis de errores;
- interfaces naturales sobre catálogos;
- agentes de datos;
- RAG sobre documentación técnica.

La plataforma debe distinguir claramente una capacidad experimental de una práctica consolidada de producción.

---

# 21. Open Data Stack

Crear una sección transversal para tecnologías independientes del cloud.

Debe incluir inicialmente:

- Apache Airflow;
- Apache Spark;
- Apache Kafka;
- Apache Beam;
- Apache Iceberg;
- Delta Lake;
- Apache Hudi;
- dbt;
- Terraform;
- PostgreSQL;
- Kubernetes.

Esto evita interpretar Data Engineering exclusivamente a través de productos cloud.

---

# 22. Formato estándar de una ficha de conocimiento

Cada concepto debe utilizar una estructura consistente.

Ejemplo:

```yaml
title: Change Data Capture
slug: change-data-capture
category: pipelines
classification: core
level: intermediate
importance: high
last_verified: 2026-09-28
```

Contenido:

```text
1. Resumen
2. Qué es
3. Problema que resuelve
4. Cómo funciona
5. Cuándo utilizarlo
6. Cuándo no utilizarlo
7. Ejemplo sencillo
8. Ejemplo de producción
9. Arquitectura
10. Código
11. GCP
12. AWS
13. Azure
14. Buenas prácticas
15. Errores frecuentes
16. Trade-offs
17. Conceptos relacionados
18. Preguntas técnicas abiertas
19. Laboratorio relacionado
20. Fuentes
21. Fecha de última verificación
22. Historial de cambios importantes
```

---

# 23. Snippets y biblioteca de código

La plataforma debe tener una biblioteca de código reutilizable.

Categorías:

## SQL

- MERGE;
- SCD2;
- deduplication;
- incremental load;
- window functions;
- reconciliation;
- data quality;
- BigQuery optimization.

## Python

- API ingestion;
- retry;
- logging;
- validation;
- Pandas;
- PySpark;
- Beam;
- FastAPI.

## Terraform

- BigQuery;
- Cloud Storage;
- IAM;
- Cloud Run;
- AWS resources;
- Azure resources.

## Configuración

- Dockerfile;
- docker-compose;
- GitHub Actions;
- GitLab CI;
- Airflow DAG;
- dbt;
- Dataform.

Cada snippet debe explicar el patrón; no basta con almacenar código.

---

# 24. Architecture Lab

Será una biblioteca de arquitecturas completas.

Cada entrada debe incluir:

```text
Escenario
Requerimientos
Restricciones
Arquitectura propuesta
Diagrama
Flujo
Componentes
Razón de cada componente
Alternativas
Trade-offs
Escalabilidad
Seguridad
Observabilidad
Costo
Código relacionado
Implementación GCP
Implementación AWS
Implementación Azure
```

Ejemplos iniciales:

1. Batch pipeline.
2. Streaming pipeline.
3. CDC PostgreSQL -> Warehouse.
4. API -> Data Warehouse.
5. Lakehouse.
6. Medallion.
7. Real-time analytics.
8. IoT ingestion.
9. Data platform corporativa.
10. RAG ingestion pipeline.

---

# 25. Laboratorios prácticos

No utilizaremos quizzes.

La práctica se realizará mediante **problemas, código y diseño**.

## Tipo A - Implementación

Ejemplo:

> Implementar una carga incremental desde una tabla staging hacia una tabla final.

## Tipo B - Debugging

Ejemplo:

> Un pipeline comenzó a insertar duplicados después de un retry. Identificar el problema y proponer una solución idempotente.

## Tipo C - Optimización

Ejemplo:

> Una consulta BigQuery procesa 4 TB diariamente. Analizar cómo reducir el volumen procesado.

## Tipo D - Arquitectura

Ejemplo:

> Diseñar una plataforma que procese cientos de millones de eventos diarios y entregue analytics casi en tiempo real.

## Tipo E - Comparación

Ejemplo:

> Resolver el mismo escenario utilizando GCP, AWS y Azure y explicar las diferencias.

---

# 26. Preguntas técnicas abiertas

Aunque no existirán quizzes, cada concepto puede mantener preguntas para razonamiento y entrevistas.

Ejemplo:

> ¿Cómo diseñarías un pipeline CDC capaz de tolerar duplicados y eventos fuera de orden?

No habrá alternativas A/B/C/D.

El objetivo es desarrollar explicación, criterio y capacidad de diseño.

---

# 27. Career / Job Description Engine

Una funcionalidad importante será analizar ofertas laborales.

Entrada:

```text
Descripción completa de una vacante
```

Proceso:

```text
Job Description
      |
      v
Extracción de requisitos
      |
      v
Normalización
      |
      v
Mapeo contra Knowledge Graph
      |
      +--> conocimientos existentes
      +--> herramientas existentes
      +--> gaps
      +--> temas modernos
      +--> temas desconocidos
```

Salida esperada:

- tecnologías requeridas;
- conceptos requeridos;
- experiencia esperada;
- arquitectura involucrada;
- conocimientos relacionados;
- contenido recomendado;
- gaps de contenido de la plataforma;
- preguntas técnicas relacionadas;
- laboratorios relevantes.

---

# 28. Interview Mode

No debe ser un quiz.

Debe utilizar preguntas abiertas y escenarios.

Ejemplo:

```text
BigQuery

Pregunta:
¿Cómo optimizarías una tabla de eventos de varios TB que es consultada principalmente por fecha y customer_id?

Conceptos relacionados:
- partitioning
- clustering
- query pruning
- INFORMATION_SCHEMA
- costos
```

La plataforma puede mostrar posteriormente:

- elementos que una respuesta sólida debería mencionar;
- conceptos relacionados;
- documentación;
- ejemplo técnico.

No necesita asignar una nota.

---

# 29. Motor de actualidad

Esta es una de las partes más importantes del producto.

No debe ser un simple RSS/news feed.

Debe existir un pipeline:

```text
Fuentes
  -> Ingesta
     -> Clasificación
        -> Detección de relevancia
           -> Verificación
              -> Resumen
                 -> Impacto Data Engineer
                    -> Relación con Knowledge Graph
                       -> Publicación
```

---

# 30. Fuentes de información

## Nivel 1 - Documentación oficial

Máxima prioridad.

Ejemplos:

- Google Cloud Documentation;
- AWS Documentation;
- Microsoft Learn;
- Apache Foundation;
- Terraform / HashiCorp;
- dbt;
- Databricks;
- PostgreSQL;
- Python;
- OpenAI cuando el contenido corresponda a sus productos.

## Nivel 2 - Release notes oficiales

Fundamentales para detectar:

- nuevas funcionalidades;
- deprecaciones;
- breaking changes;
- nuevas versiones;
- cambios de APIs;
- cambios de SDK.

## Nivel 3 - Engineering blogs oficiales

Útiles para arquitecturas, patrones y casos reales.

## Nivel 4 - Papers y organizaciones técnicas

Por ejemplo:

- Apache;
- CNCF;
- papers académicos relevantes;
- especificaciones técnicas.

## Nivel 5 - Fuentes secundarias

Sólo cuando aporten contexto adicional y siempre identificadas como tales.

---

# 31. Formato de una noticia técnica

Cada noticia debe convertirse en conocimiento útil.

```text
Título
Producto / tecnología
Fecha
Fuente
Tipo de fuente
Categoría

¿Qué ocurrió?

¿Qué existía antes?

¿Qué cambió?

¿Por qué importa para Data Engineering?

¿A quién afecta?

¿Requiere cambiar alguna práctica existente?

¿Debemos actualizar contenido existente?

Conceptos relacionados

Documentación oficial
```

---

# 32. Clasificación de relevancia de novedades

Para evitar ruido:

## Critical

Cambios que afectan producción, seguridad, APIs o servicios existentes.

## Important

Funcionalidades relevantes para arquitecturas actuales.

## Useful

Mejoras interesantes que vale la pena conocer.

## Watch

Tecnologías emergentes que todavía no requieren estudio profundo.

La clasificación debe basarse en criterios definidos y no únicamente en popularidad en redes sociales.

---

# 33. Control de vigencia

Cada contenido dinámico debe almacenar:

```json
{
  "last_verified": "2026-09-28",
  "source_type": "official_documentation",
  "verification_status": "verified",
  "review_required": false
}
```

Estados sugeridos:

```text
Verified
Review required
Potentially outdated
Deprecated
Archived
```

---

# 34. Knowledge Graph

El conocimiento no debe almacenarse como páginas aisladas.

Ejemplo:

```text
CDC
 |
 +-- Debezium
 +-- Kafka
 +-- Pub/Sub
 +-- Kinesis
 +-- Event Hubs
 +-- WAL
 +-- MERGE
 +-- SCD2
 +-- Idempotency
 +-- Streaming
```

Tipos de relaciones:

```text
USES
IMPLEMENTS
DEPENDS_ON
ALTERNATIVE_TO
RELATED_TO
REPLACES
EXTENDS
RUNS_ON
PRODUCES
CONSUMES
```

Esto permitirá navegar por conocimiento, no solamente buscar páginas.

---

# 35. Búsqueda

Debe permitir buscar:

```text
concepto
herramienta
servicio
problema
arquitectura
código
error
patrón
noticia
```

Ejemplo:

```text
"duplicados streaming"
```

Puede devolver:

```text
Idempotency
Delivery semantics
Pub/Sub
Kafka offsets
MERGE
Deduplication
CDC
Laboratorio relacionado
```

---

# 36. Navegación por problema

Además de navegar por tecnología, debe existir:

```text
¿Qué necesito resolver?
```

Ejemplos:

- ingerir archivos;
- procesar eventos;
- migrar una base;
- cargar incrementalmente;
- evitar duplicados;
- reducir costos;
- manejar schema evolution;
- implementar CDC;
- implementar streaming;
- gobernar datos sensibles;
- exponer datos mediante API;
- construir RAG.

Esto es especialmente importante para desarrollar pensamiento arquitectónico.

---

# 37. Seguimiento personal del conocimiento

Sin quizzes ni notas.

Cada tema puede mantener estados manuales:

```text
No revisado
Revisando
Comprendido
Aplicado
Necesita repaso
```

También:

- fecha de último estudio;
- notas personales;
- ejemplos propios;
- experiencia real asociada;
- proyectos donde fue utilizado;
- marcado como favorito;
- pendiente de profundización.

---

# 38. Dashboard principal

Debe priorizar utilidad, no gamificación.

Secciones sugeridas:

```text
DATA ENGINEERING KNOWLEDGE HUB

Continuar estudiando

Necesita repaso

Conceptos recientemente consultados

Novedades importantes

Cambios en herramientas que utilizo

Tecnologías emergentes

Arquitecturas destacadas

Laboratorios pendientes

Ofertas laborales analizadas recientemente
```

No es necesario utilizar porcentajes artificiales de dominio.

---

# 39. Perfil profesional

La plataforma debería mantener un perfil técnico configurable.

Ejemplo:

```yaml
role: Senior Data Engineer
primary_cloud:
  - GCP
secondary_cloud:
  - Azure
learning_cloud:
  - AWS
skills:
  - SQL
  - BigQuery
  - Airflow
  - Dataform
  - Python
  - Terraform
```

Esto permitirá priorizar contenido sin ocultar el resto del conocimiento.

---

# 40. Metadata mínima

Cada elemento debería tener al menos:

```text
id
title
slug
description
type
domain
subdomain
classification
level
cloud
technologies
tags
related_topics
sources
created_at
updated_at
last_verified
verification_status
```

---

# 41. Tipos de entidad

Modelo conceptual inicial:

```text
Concept
Technology
CloudService
Pattern
Architecture
CodeSnippet
Lab
News
Release
Source
JobDescription
InterviewQuestion
PersonalNote
```

---

# 42. Relaciones entre entidades

Ejemplo:

```text
Concept -> implemented_by -> Technology
Technology -> available_on -> Cloud
Architecture -> uses -> Technology
Lab -> practices -> Concept
News -> affects -> Technology
Release -> updates -> Technology
JobDescription -> requires -> Concept
JobDescription -> requires -> Technology
CodeSnippet -> implements -> Pattern
```

---

# 43. Módulos funcionales del producto

La plataforma puede dividirse conceptualmente en cinco motores.

## Knowledge Engine

Responsable de:

- conceptos;
- tecnologías;
- relaciones;
- código;
- arquitectura;
- fuentes.

## Learning Engine

Responsable de:

- rutas de estudio;
- contenido progresivo;
- laboratorios;
- seguimiento manual;
- repaso;
- notas.

No incluirá quizzes.

## Update Engine

Responsable de:

- documentación;
- release notes;
- noticias;
- cambios;
- detección de obsolescencia;
- verificación.

## Career Engine

Responsable de:

- ofertas laborales;
- extracción de requisitos;
- gaps;
- preparación de entrevistas;
- rutas recomendadas.

## Architecture / Lab Engine

Responsable de:

- escenarios;
- arquitecturas;
- implementación;
- código;
- debugging;
- optimización;
- comparación multicloud.

---

# 44. Orden recomendado para construir el contenido

No conviene intentar cargar todo desde el comienzo.

## Fase de contenido 1 - Core

Crear primero:

1. Fundamentos.
2. SQL.
3. Python Data Engineering.
4. Modelado.
5. Pipelines.
6. Data Quality.
7. Orquestación.
8. Arquitectura.

## Fase de contenido 2 - GCP

Priorizar:

1. BigQuery.
2. Cloud Storage.
3. Pub/Sub.
4. Dataflow.
5. Composer/Airflow.
6. Dataform.
7. Cloud Run.
8. IAM.
9. Dataplex.

## Fase de contenido 3 - Multicloud

Mapear cada capacidad anterior a:

- AWS;
- Azure.

## Fase de contenido 4 - Plataforma

Agregar:

- Terraform;
- CI/CD;
- Docker;
- Kubernetes;
- observabilidad;
- seguridad;
- gobierno.

## Fase de contenido 5 - Modern / Emerging

Agregar:

- Iceberg;
- Delta;
- Hudi;
- Data Contracts;
- Data Products;
- semantic layers;
- AI;
- RAG;
- Agents;
- MCP.

---

# 45. Orden recomendado para construir el producto

## Etapa 0 - Discovery

Antes de escribir código:

- cerrar alcance;
- crear taxonomía;
- definir entidades;
- definir metadata;
- definir fuentes permitidas;
- definir reglas de verificación;
- definir formato de fichas;
- crear mapa maestro de contenidos.

**Entregable:** Knowledge Blueprint v1.

---

## Etapa 1 - Knowledge Base MVP

Construir:

- navegación por dominios;
- conceptos;
- tecnologías;
- búsqueda;
- relaciones;
- snippets;
- fuentes;
- favoritos/notas;
- estado personal.

Todavía sin automatización compleja de noticias.

---

## Etapa 2 - Multicloud

Agregar:

- GCP;
- AWS;
- Azure;
- matriz comparativa;
- navegación por capacidad;
- navegación por problema.

---

## Etapa 3 - Architecture Lab

Agregar:

- escenarios;
- diagramas;
- laboratorios;
- código;
- debugging;
- optimización;
- implementaciones multicloud.

---

## Etapa 4 - Update Engine

Implementar:

- fuentes oficiales;
- ingesta de release notes;
- clasificación;
- deduplicación;
- relevancia;
- resumen;
- vinculación con Knowledge Graph;
- detección de contenido posiblemente obsoleto.

---

## Etapa 5 - Career Engine

Implementar:

- carga de Job Description;
- extracción de requisitos;
- normalización;
- mapeo contra conceptos;
- gaps;
- rutas de estudio;
- Interview Mode.

---

## Etapa 6 - IA

Utilizar IA donde realmente aporte valor:

- clasificación de noticias;
- extracción de conceptos;
- generación de resúmenes;
- relaciones sugeridas;
- búsqueda semántica;
- explicación contextual;
- análisis de ofertas;
- generación asistida de laboratorios;
- comparación de una respuesta técnica con conceptos esperados.

La IA no debe ser la fuente de verdad.

---

# 46. Arquitectura lógica preliminar

Sin definir todavía tecnologías definitivas:

```text
                    FRONTEND
                       |
                       v
                  APPLICATION
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
 Knowledge         Search          Personal
 Service           Service          Profile
       |
       v
 Knowledge Store
       |
       +--------> Relations / Graph
       |
       +--------> Code / Labs
       |
       +--------> Sources

External Sources
       |
       v
 Ingestion Pipeline
       |
       v
 Classification
       |
       v
 Verification
       |
       v
 Update Engine
       |
       v
 Knowledge Store
```

La elección de PostgreSQL, vector search, graph database, almacenamiento documental, backend y frontend debe realizarse después de cerrar el modelo funcional.

---

# 47. Uso correcto de IA

La IA puede:

- explicar;
- resumir;
- relacionar;
- clasificar;
- generar ejemplos;
- transformar documentación compleja en contenido didáctico;
- sugerir cambios;
- detectar posibles contradicciones.

Pero no debe decidir unilateralmente qué es verdad.

Flujo recomendado:

```text
Fuente verificable
      |
      v
Contenido recuperado
      |
      v
LLM procesa
      |
      v
Resultado estructurado
      |
      v
Referencia a fuente
      |
      v
Publicación
```

---

# 48. Requisitos de calidad de contenido

Una ficha no debería considerarse completa si no responde, cuando aplique, a:

- ¿qué es?;
- ¿por qué existe?;
- ¿qué problema resuelve?;
- ¿cómo funciona?;
- ¿cuándo usarlo?;
- ¿cuándo no usarlo?;
- ¿qué alternativas tiene?;
- ¿cómo se implementa?;
- ¿qué errores son frecuentes?;
- ¿cómo escala?;
- ¿cómo se asegura?;
- ¿cómo se observa?;
- ¿cómo afecta costos?;
- ¿cómo se implementa en GCP?;
- ¿cuál es su equivalente conceptual en AWS?;
- ¿cuál es su equivalente conceptual en Azure?;
- ¿con qué otros conceptos se relaciona?;
- ¿qué fuentes respaldan la información?;
- ¿cuándo fue verificada por última vez?

---

# 49. Requisitos no funcionales de la futura plataforma

Desde el diseño se deben considerar:

- navegación rápida;
- búsqueda eficiente;
- responsive design;
- contenido versionado;
- trazabilidad de fuentes;
- historial de actualizaciones;
- escalabilidad del catálogo;
- contenido Markdown o formato portable;
- posibilidad de exportación;
- URLs estables por concepto;
- búsqueda semántica futura;
- bajo acoplamiento a un proveedor de IA;
- capacidad de reemplazar fuentes;
- seguridad de datos personales;
- backups;
- observabilidad de los pipelines de actualización.

---

# 50. Lo que NO queremos construir

Para mantener el foco, inicialmente quedan fuera:

- quizzes;
- preguntas de selección múltiple;
- gamificación;
- rankings personales;
- certificaciones internas;
- puntos;
- badges;
- feed indiscriminado de noticias;
- generación de contenido sin fuentes;
- cursos lineales gigantes;
- dependencia exclusiva de una nube;
- dependencia exclusiva de un modelo de IA.

---

# 51. MVP recomendado

El MVP debería demostrar el concepto completo sin intentar abarcar todo Data Engineering.

Contenido sugerido:

```text
Fundamentos
SQL
Data Modeling
Pipelines
Architecture
GCP
```

Tecnologías iniciales:

```text
BigQuery
Cloud Storage
Pub/Sub
Dataflow
Airflow / Composer
Dataform
Python
Terraform
```

Funcionalidades:

```text
Home
Knowledge Explorer
Ficha de concepto
Ficha de tecnología
Comparación relacionada
Búsqueda
Architecture Lab
Code Library
Fuentes
Notas personales
Estado de estudio
Novedades verificadas
```

Con esto podemos validar la experiencia antes de cargar AWS, Azure y todo el stack emergente.

---

# 52. Insumos que debemos producir antes del desarrollo

Esta es la lista concreta de documentos/datasets que necesitamos preparar.

## A. Knowledge Blueprint

Mapa completo:

```text
Dominio
 -> Subdominio
    -> Concepto
       -> Tecnología
          -> Relación
```

## B. Taxonomía

Definir:

- dominios;
- categorías;
- niveles;
- Core / Modern / Emerging;
- tipos de entidad;
- tags.

## C. Cloud Capability Matrix

Mapa conceptual GCP/AWS/Azure.

## D. Source Registry

Listado de fuentes autorizadas con:

```text
nombre
URL base
tipo
proveedor
prioridad
frecuencia de revisión
nivel de confianza
```

## E. Content Template

Plantilla estándar para fichas.

## F. Architecture Template

Plantilla estándar para arquitecturas.

## G. Lab Template

Plantilla estándar para ejercicios prácticos.

## H. News / Update Template

Plantilla para novedades técnicas.

## I. Metadata Schema

Modelo de metadata de cada entidad.

## J. Relationship Model

Catálogo de relaciones del Knowledge Graph.

---

# 53. Secuencia de trabajo recomendada desde este documento

A partir de aquí, el desarrollo debería seguir este orden:

```text
1. Cerrar visión
       |
2. Crear mapa maestro de dominios
       |
3. Crear inventario de conceptos
       |
4. Crear inventario de tecnologías
       |
5. Crear matriz GCP/AWS/Azure
       |
6. Crear taxonomía
       |
7. Crear modelo de metadata
       |
8. Crear modelo de relaciones
       |
9. Crear registro de fuentes
       |
10. Crear templates de contenido
       |
11. Crear primeras fichas reales
       |
12. Validar navegación conceptual
       |
13. Diseñar UX/UI
       |
14. Diseñar arquitectura técnica
       |
15. Construir MVP
       |
16. Cargar Core Knowledge
       |
17. Implementar Architecture Lab
       |
18. Implementar Update Engine
       |
19. Implementar Career Engine
       |
20. Expandir AWS/Azure/Modern/Emerging
```

---

# 54. Primer entregable siguiente

El próximo documento debería ser **Knowledge Blueprint v1**.

No será todavía código ni diseño de pantallas.

Debe contener el inventario jerárquico de conocimiento que alimentará la aplicación:

```text
DATA ENGINEERING

01 Fundamentals
02 SQL
03 Python
04 Data Modeling
05 Pipelines
06 Orchestration
07 Architecture
08 GCP
09 AWS
10 Azure
11 DevOps
12 Infrastructure as Code
13 Containers
14 Streaming
15 Data Quality
16 Observability
17 Governance
18 Security
19 Compliance
20 Open Data Stack
21 AI for Data Engineering
22 Modern Data Engineering
23 Emerging Technologies
```

Y dentro de cada dominio:

```text
Subdominio
Conceptos
Tecnologías
Patrones
Código asociado
Arquitecturas asociadas
Cloud relacionado
Nivel
Clasificación Core/Modern/Emerging
Fuentes candidatas
```

Ese Blueprint será la base tanto del **modelo de datos** como de la **navegación, buscador, contenido, actualización y Career Engine**.

---

# 55. Resultado esperado

Cuando la plataforma esté madura, debería permitir pasar naturalmente entre:

```text
APRENDER
   |
   v
ENTENDER
   |
   v
RELACIONAR
   |
   v
IMPLEMENTAR
   |
   v
DISEÑAR
   |
   v
RESOLVER
   |
   v
ACTUALIZARSE
```

El objetivo final no es memorizar productos cloud.

El objetivo es mantener un conocimiento **profundo, transversal, práctico y actualizado de Data Engineering**, de forma que nuevas tecnologías puedan incorporarse al mapa sin tener que reconstruir el sistema de aprendizaje.

---

## Conclusión

El activo central del proyecto no será inicialmente el frontend ni la IA. Será el **modelo de conocimiento**.

Si conceptos, relaciones, fuentes, metadata y criterios de actualización están correctamente diseñados, posteriormente podremos cambiar tecnologías de frontend, backend, base de datos o modelos de IA sin perder el conocimiento acumulado.

Por lo tanto, el orden correcto es:

**Knowledge Blueprint -> Taxonomía -> Fuentes -> Modelo de contenido -> Modelo de relaciones -> MVP funcional -> Automatización de actualización -> Career Engine -> expansión continua.**

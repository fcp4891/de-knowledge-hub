---
id: concept:gcp-iam-for-data
slug: gcp-iam-for-data
type: concept
title: IAM de Google Cloud para plataformas de datos
description: "Cómo dar acceso mínimo a datos en Google Cloud: principales, roles predefinidos de BigQuery y Cloud Storage, cuentas de servicio por pipeline y concesiones en el recurso más específico, con sus equivalentes en AWS IAM y Azure RBAC."
domain: gcp
subdomain: governance-and-security
category: gcp
classification: modern
level: intermediate
importance: high
cloud: [gcp, aws, azure]
technologies: [gcp-iam, gcp-bigquery, gcp-cloud-storage, aws-iam]
tags: [gcp, security, iam, governance]
related_topics: [gcs-buckets-and-objects, infrastructure-as-code]
sources:
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/overview
    accessed: 2026-10-01
    page_title: "IAM overview"
    note: "IAM controla quién puede hacer qué sobre qué recursos. Se concede un rol (colección de permisos de la forma servicio.recurso.verbo) a un principal sobre un recurso mediante una allow policy; no se conceden permisos sueltos. Tipos de rol: predefinidos (gestionados por Google), personalizados (más mantenimiento y con límite de cantidad) y básicos (muy amplios, no recomendados en producción). Los recursos se organizan en jerarquía y los hijos heredan las políticas de sus padres. Principales humanos (cuentas, grupos, identidades federadas) y de cargas de trabajo (cuentas de servicio, identidades federadas de workload)."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/roles-overview
    accessed: 2026-10-01
    page_title: "Roles overview"
    note: "Tres tipos de rol: básicos (acceso amplio), predefinidos (acceso granular por servicio, gestionados por Google Cloud) y personalizados (lista de permisos definida por el usuario)."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/iam/docs/service-account-overview
    accessed: 2026-10-01
    page_title: "Service accounts overview"
    note: "Una cuenta de servicio es una cuenta para aplicaciones o cargas de trabajo, identificada por un email; la forma más común de autenticarse como ella es adjuntarla al recurso que ejecuta la aplicación; al autenticarse, la aplicación accede a todo lo que la cuenta tiene permitido."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/access-control
    accessed: 2026-10-01
    page_title: "BigQuery IAM roles and permissions"
    note: "roles/bigquery.jobUser permite ejecutar jobs, incluidas consultas, y solo se concede en proyectos, carpetas u organizaciones; roles/bigquery.dataEditor sobre un dataset permite crear, actualizar, leer y borrar sus tablas; roles/bigquery.dataViewer sobre un dataset permite listar sus tablas y consultarlas."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/row-level-security-intro
    accessed: 2026-10-01
    page_title: "Introduction to BigQuery row-level security"
    note: "La seguridad a nivel de fila filtra datos y permite acceder a filas concretas de una tabla según condiciones del usuario; puede no estar disponible en algunas ediciones."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/column-level-security-intro
    accessed: 2026-10-01
    page_title: "Introduction to column-level access control"
    note: "El control de acceso a nivel de columna da acceso granular a columnas sensibles con policy tags o data governance tags."
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/introduction-audit-workloads
    accessed: 2026-10-01
    page_title: "Introduction to audit logs in BigQuery"
    note: "Los audit logs de BigQuery registran la actividad administrativa y de acceso a datos: quién realizó acciones como crear tablas o ejecutar jobs."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/access-control/iam-roles
    accessed: 2026-10-01
    page_title: "IAM roles for Cloud Storage"
    note: "roles/storage.objectViewer: ver y listar objetos (sin ACL); roles/storage.objectCreator: crear objetos, sin ver, borrar ni sobrescribir; roles/storage.objectAdmin: control total de objetos. El recurso más bajo donde se conceden es el bucket."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access
    accessed: 2026-10-01
    page_title: "Uniform bucket-level access"
    note: "Con acceso uniforme a nivel de bucket, las ACL se desactivan y solo IAM concede acceso al bucket y sus objetos."
  - source: gcp-iam-docs
    url: https://docs.cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding
    accessed: 2026-10-01
    page_title: "gcloud projects add-iam-policy-binding"
    note: "gcloud projects add-iam-policy-binding PROJECT_ID --member=PRINCIPAL --role=ROLE [--condition=...] agrega una concesión (miembro, rol y condición opcional) a la política IAM del proyecto."
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/add-iam-policy-binding
    accessed: 2026-10-01
    page_title: "gcloud storage buckets add-iam-policy-binding"
    note: "gcloud storage buckets add-iam-policy-binding URL --member=PRINCIPAL --role=ROLE [--condition=...] agrega una concesión a la política IAM de un bucket."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
    accessed: 2026-10-01
    page_title: "What is IAM?"
    note: "AWS IAM controla de forma segura el acceso a recursos de AWS: quién está autenticado y quién está autorizado; los cambios de usuarios, grupos, roles o políticas tardan en replicarse."
  - source: aws-iam-docs
    url: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
    accessed: 2026-10-01
    page_title: "Security best practices in IAM"
    note: "Mínimo privilegio: conceder solo los permisos necesarios, definiendo acciones sobre recursos concretos bajo condiciones concretas; personas federadas con credenciales temporales."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
    accessed: 2026-10-01
    page_title: "What is Azure role-based access control (Azure RBAC)?"
    note: "Azure RBAC: una asignación de rol une un principal de seguridad (usuario, grupo, service principal o managed identity), una definición de rol y un ámbito; existen deny assignments que bloquean el acceso aunque haya una asignación de rol."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview
    accessed: 2026-10-01
    page_title: "Understand scope for Azure RBAC"
    note: "Ámbitos en cuatro niveles con relación padre-hijo: grupo de administración, suscripción, grupo de recursos y recurso."
relations:
  - type: RELATED_TO
    target: gcs-buckets-and-objects
    note: Los permisos de Cloud Storage se conceden por bucket con acceso uniforme.
  - type: RELATED_TO
    target: infrastructure-as-code
    note: Las concesiones de IAM se declaran y revisan como código.
  - type: RELATED_TO
    target: service-accounts
    note: Cuentas de servicio fuera de Google Cloud.
  - type: RELATED_TO
    target: column-level-security
    note: Seguridad por columna en general.
created_at: 2026-10-01
updated_at: 2026-10-13
last_verified: 2026-10-01
verification_status: verified
---

## 1. Resumen

En Google Cloud, el acceso a los datos se concede dando un **rol** a un **principal** sobre un **recurso**. Para una plataforma de datos, la práctica es: una cuenta de servicio por pipeline, roles predefinidos y lo más específicos posible (por ejemplo, `bigquery.dataEditor` sobre un dataset, no sobre el proyecto), nada de roles básicos en producción, y las concesiones declaradas como código y revisadas.

## 2. Qué es

IAM decide quién puede hacer qué sobre qué recursos. Tiene tres piezas:

- **principal:** una persona (cuenta, grupo, identidad federada) o una carga de trabajo (cuenta de servicio);
- **rol:** una colección de permisos (`servicio.recurso.verbo`); los permisos no se conceden sueltos;
- **recurso:** proyecto, dataset, bucket, tópico. La concesión se guarda en la *allow policy* del recurso.

Los recursos forman una jerarquía (organización, carpetas, proyectos, recursos), y los hijos heredan las políticas de sus padres.

## 3. Problema que resuelve

Una plataforma de datos con un único usuario "admin" compartido, o con todos los pipelines en la misma cuenta de servicio con rol de Editor, no permite saber quién hizo qué, y cualquier fallo o credencial filtrada expone todos los datos. IAM bien usado limita el daño de un error al recurso que esa identidad realmente necesita.

## 4. Cómo funciona

1. Se crea una **cuenta de servicio** por pipeline o componente y se adjunta al recurso que lo ejecuta (entorno de Airflow, Cloud Run, Dataflow).
2. Se le conceden **roles predefinidos** en el recurso más específico posible:
   - `roles/bigquery.jobUser` en el proyecto (para ejecutar consultas; solo se concede a nivel de proyecto, carpeta u organización);
   - `roles/bigquery.dataEditor` o `roles/bigquery.dataViewer` en el dataset que lee o escribe;
   - `roles/storage.objectViewer`, `roles/storage.objectCreator` u `roles/storage.objectAdmin` en el bucket.
3. Las personas acceden por **grupos**, no individualmente.
4. Todo se declara como código y se revisa.

## 5. Cuándo utilizarlo

En todo proyecto con datos: al crear pipelines, al dar acceso a analistas, al integrar herramientas externas y al auditar quién puede leer datos sensibles.

## 6. Cuándo no utilizarlo

IAM no reemplaza otros controles:

- para ocultar filas o columnas de una tabla hacen falta políticas de acceso a nivel de fila o columna, no solo roles de dataset;
- los **roles básicos** (Owner, Editor, Viewer) no deberían usarse en producción: son demasiado amplios.

## 7. Ejemplo sencillo

El pipeline de ventas tiene su propia cuenta de servicio, con `bigquery.jobUser` en el proyecto, `bigquery.dataEditor` en el dataset `ventas` y `storage.objectViewer` en el bucket raw. No puede leer el dataset de RR. HH. ni borrar archivos del lake.

## 8. Ejemplo de producción

- **Cuentas de servicio:** cada dominio de datos tiene su cuenta y su dataset; los permisos se declaran en Terraform con recursos de miembro, que agregan una concesión sin reemplazar la política completa.
- **Personas:** los analistas entran por un grupo con `bigquery.dataViewer` solo en los datasets curados.
- **Ingesta:** la cuenta que sube archivos al lake tiene `storage.objectCreator`, que permite crear objetos pero no verlos, borrarlos ni sobrescribirlos.
- **Auditoría:** una revisión trimestral compara las concesiones del código con las efectivas.

## 9. Arquitectura

```mermaid
flowchart LR
  SA1[Cuenta de servicio: pipeline ventas] -->|bigquery.jobUser| P[(Proyecto)]
  SA1 -->|bigquery.dataEditor| D1[(Dataset ventas)]
  SA1 -->|storage.objectViewer| B[(Bucket raw)]
  ING[Cuenta de servicio: ingesta] -->|storage.objectCreator| B
  G[Grupo analistas] -->|bigquery.dataViewer| D2[(Dataset curado)]
```

## 10. Código

```bash
# gcloud: concesiones mínimas para la cuenta de servicio de un pipeline (aditivas: no reemplazan la política).
# Requiere: gcloud autenticado con permiso para modificar las políticas IAM del proyecto y del bucket.
PROJECT=mi-proyecto
SA=pipeline-ventas@${PROJECT}.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA}" --role="roles/bigquery.jobUser"

gcloud storage buckets add-iam-policy-binding gs://empresa-lake-raw \
  --member="serviceAccount:${SA}" --role="roles/storage.objectViewer"
```

`add-iam-policy-binding` agrega una concesión (principal, rol y condición opcional) a la política del proyecto o del bucket, sin reemplazar las demás. El rol sobre el dataset (`bigquery.dataEditor`) se concede en el dataset; el snippet de Terraform para IAM del lote 4 lo declarará como código con recursos de miembro.

## 11. GCP

Esta ficha trata de **IAM de Google Cloud**. En datos, las decisiones clave son: cuenta de servicio por pipeline adjunta al recurso que lo ejecuta, roles predefinidos de BigQuery y Cloud Storage en el recurso más específico, grupos para personas, y acceso uniforme a nivel de bucket para que solo IAM controle Cloud Storage.

## 12. AWS

En **AWS IAM** el modelo es de **políticas** que listan acciones permitidas sobre recursos, bajo condiciones; la guía de buenas prácticas pide mínimo privilegio y credenciales temporales para personas. Los cambios de IAM tardan en replicarse, por eso AWS recomienda no hacerlos en caminos críticos de la aplicación. A diferencia de Google Cloud, donde se conceden roles sobre un recurso, en AWS se escriben o adjuntan políticas a identidades o recursos.

## 13. Azure

En **Azure RBAC**, una **asignación de rol** une un principal de seguridad (usuario, grupo, service principal o managed identity), una definición de rol y un **ámbito** en cuatro niveles: grupo de administración, suscripción, grupo de recursos y recurso. Existen además **deny assignments**, que bloquean el acceso aunque haya una asignación de rol; las allow policies de Google Cloud que describe esta ficha no tienen ese elemento.

## 14. Buenas prácticas

- Una cuenta de servicio por pipeline o componente; nunca compartida entre equipos.
- Roles predefinidos en el recurso más específico; personalizados solo si ninguno encaja.
- Personas por grupos; sin roles básicos en producción.
- Concesiones declaradas como código y revisadas; usar recursos o comandos aditivos para no borrar concesiones ajenas.
- **Seguridad:** preferir adjuntar la cuenta de servicio al recurso antes que descargar claves; revisar periódicamente las concesiones efectivas.
- **Observabilidad:** usar los registros de auditoría para saber qué identidad accedió a qué datos.
- **Costo:** `bigquery.jobUser` permite ejecutar consultas que se facturan al proyecto; concederlo solo a quien debe consumir capacidad de ese proyecto.

## 15. Errores frecuentes

- Dar Editor u Owner del proyecto a una cuenta de servicio "para que funcione".
- Conceder roles de BigQuery en el proyecto cuando bastaba el dataset.
- Reemplazar la política completa de un recurso desde IaC y borrar concesiones de otros equipos.
- Compartir una cuenta de servicio entre varios pipelines.

## 16. Trade-offs

Permisos granulares por dataset y bucket reducen el impacto de un error, a cambio de más concesiones que mantener. Permisos amplios a nivel de proyecto simplifican la operación, a cambio de que cualquier fallo o credencial filtrada alcance a todos los datos.

## 17. Conceptos relacionados

- `gcs-buckets-and-objects`: permisos por bucket con acceso uniforme.
- `infrastructure-as-code`: concesiones declaradas y revisadas.
- `service-accounts`: cuentas de servicio en general.
- `column-level-security`: seguridad a nivel de columna en general.
- Del blueprint, pendiente de ficha: `data-governance`.

## 18. Preguntas técnicas abiertas

1. ¿Qué roles mínimos necesita un pipeline que lee de un bucket y escribe una tabla de BigQuery?
2. ¿Cómo darías acceso de solo lectura a analistas sin exponer datos personales?
3. ¿Cómo detectarías concesiones creadas a mano fuera del código?

## 19. Laboratorio relacionado

Pendiente (F4): snippet de Terraform para IAM (lote 4).

## 20. Fuentes

- Google Cloud: *IAM overview*, *Roles overview*, *Service accounts overview*, *BigQuery IAM roles and permissions*, *Introduction to row-level security*, *Introduction to column-level access control*, *Introduction to audit logs in BigQuery*, *IAM roles for Cloud Storage*, *Uniform bucket-level access* y la referencia de `gcloud projects add-iam-policy-binding` y `gcloud storage buckets add-iam-policy-binding`.
- AWS: *What is IAM?* y *Security best practices in IAM*.
- Microsoft Learn: *What is Azure RBAC?* y *Understand scope for Azure RBAC*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-01. Pasa a `verified`: revisión B-F3.1 del lote 4 aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-01: creación (lote 4 de F3).
- 2026-10-01: `verification_status: verified` (revisión B-F3.1 del lote 4 aplicada; sin VERIFY pendientes).
- 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
- 2026-10-21: lote F3b-18a (regla del §17): relations y el §17 enlazan `service-accounts` y `column-level-security`, que ya tienen ficha; antes figuraban como pendientes de ficha.

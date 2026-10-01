# Revisión B-F3.1 · Lote 4

Fichas en `content/concepts/`. Carril B no las edita. Todas las filas quedan en **pendiente**. No hay comentarios `VERIFY`. Las diez están en `review_required`.

Las 10: `infrastructure-as-code`, `terraform-providers`, `terraform-state`, `terraform-plan-apply`, `gcs-buckets-and-objects`, `gcp-iam-for-data`, `dimension-tables`, `python-api-consumption`, `scheduler` y `file-ingestion`.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 10 fichas los traen como viñetas explícitas de §14. | pendiente |
| Ejemplos atómicos e idempotentes | `file-ingestion` usa `LOAD DATA OVERWRITE` y advierte que `bq load` sin `--replace` agrega. `gcs-buckets-and-objects` dice que `buckets create` falla si el nombre existe y no lo llama idempotente. `gcp-iam-for-data` usa comandos aditivos y no afirma que repetirlos sea idempotente (ver la tabla de IAM). `dimension-tables` crea la tabla con `IF NOT EXISTS` y el miembro faltante con `MERGE` de una fila. `python-api-consumption` es un `GET`. `scheduler` solo imprime la fecha lógica. Los ejemplos de Terraform declaran recursos y dicen que un segundo apply no cambia lo que ya coincide. | pendiente |
| Relaciones completas | En las 10, cada slug de `related_topics` está en `relations`. | pendiente |

## IAM: mínimo privilegio y comandos aditivos

| Dónde | Hallazgo | Estado |
|---|---|---|
| `gcp-iam-for-data`, mínimo privilegio | `roles/bigquery.jobUser` va al proyecto, que es el nivel más bajo donde ese rol se concede. `roles/storage.objectViewer` va al bucket. `roles/bigquery.dataEditor` se deja al dataset y no se pone en el proyecto. La ficha descarta Owner y Editor. | pendiente |
| `gcp-iam-for-data`, recursos aditivos | El ejemplo usa `gcloud projects add-iam-policy-binding` y `gcloud storage buckets add-iam-policy-binding`. El texto y las notas dicen que agregan una concesión y no reemplazan el resto de la política. §14 pide comandos o recursos aditivos. §15 marca como error reemplazar la política completa desde IaC. El rol del dataset queda para un snippet con recursos de miembro. | pendiente |
| `add-iam-policy-binding`, idempotencia | Ninguna ficha afirma que `add-iam-policy-binding` sea idempotente. Las notas solo respaldan que agrega una concesión. | pendiente |

## `infrastructure-as-code`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué es, cuándo sí y cuándo no, plan antes de apply, diferencias con CloudFormation y Bicep, seguridad, costo y observabilidad están. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Terraform, Infrastructure Manager, CloudFormation y Bicep (archivos idempotentes, sin state, what-if) están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo fija el provider 8.x y se puede validar sin credenciales. Dice que un segundo apply no cambia lo que ya coincide con el state. No marco un error. | pendiente |
| Ejemplos poco realistas | Un dataset `dwh` con `project_id` y `location` variables es un punto de partida real. | pendiente |
| Relaciones faltantes | `terraform-state`, `terraform-plan-apply` y `terraform-providers` están en `relations`. | pendiente |

## `terraform-providers`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: plugin, `required_providers`, lock file, y qué cambia al subir de versión. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Registry, `terraform init`, el lock con checksums y el provider de Google están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El lock se presenta como la forma de que la instalación falle si el paquete no coincide. No marco un error. | pendiente |
| Ejemplos poco realistas | Fijar `hashicorp/google` en la mayor 8 y revisar el plan al cambiar de versión es habitual. | pendiente |
| Relaciones faltantes | `infrastructure-as-code` y `terraform-plan-apply` están en `relations`. | pendiente |

## `terraform-state`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: para qué sirve el state, el backend remoto, el bloqueo y el riesgo de perderlo. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | El backend `gcs` (bucket previo, bloqueo, Object Versioning, `prefix`), el backend `s3` (`use_lockfile` en false y DynamoDB deprecado) y `azurerm` están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo no crea el bucket: dice que el backend tiene que existir antes. La diferencia de bloqueo entre gcs y s3 está dicha. No marco un error. | pendiente |
| Ejemplos poco realistas | Un bucket de state por prefijo de entorno, con versionado, es el patrón habitual. | pendiente |
| Relaciones faltantes | `infrastructure-as-code`, `terraform-plan-apply` y `gcs-buckets-and-objects` están en `relations`. | pendiente |

## `terraform-plan-apply`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: plan, revisión, apply del plan guardado, y qué no hace el plan. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `terraform plan` / `apply`, el archivo de plan, CloudFormation change sets, what-if de Bicep e Infrastructure Manager están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | «Sin cambios» se dice del pipeline cuando la configuración no cambió, no de un comando de IAM. No marco un error. | pendiente |
| Ejemplos poco realistas | Plan en el pull request y apply del plan guardado en el pipeline es realista. | pendiente |
| Relaciones faltantes | `terraform-state` e `infrastructure-as-code` están en `relations`. | pendiente |

## `gcs-buckets-and-objects`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: objetos, clases, acceso uniforme, versionado, ciclo de vida, notificaciones y costo. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Clases, acceso uniforme, versionado, soft delete, ciclo de vida, consistencia y `gcloud storage buckets create` / `notifications create` están en notas de Cloud Storage. S3 y Blob Storage, con sus diferencias, están en sus notas. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo activa acceso uniforme y prevención de acceso público. Dice que crear el bucket no es idempotente si el nombre ya existe. Las notificaciones de S3 y los eventos de Blob Storage se distinguen de Cloud Storage. No marco un error. | pendiente |
| Ejemplos poco realistas | Un bucket raw en `us-central1` con notificación `OBJECT_FINALIZE` a Pub/Sub es un lago habitual. | pendiente |
| Relaciones faltantes | `partitioning`, `parquet-format`, `terraform-state` y `file-ingestion` están en `relations`. | pendiente |

## `gcp-iam-for-data`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: principal, rol, recurso, herencia, cuentas de servicio, y cuándo no basta IAM (filas y columnas). | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | Roles de BigQuery y de Cloud Storage, cuentas de servicio, auditoría, acceso uniforme, `add-iam-policy-binding`, IAM de AWS y RBAC de Azure están en notas Nivel 1. No hay fuente Nivel 4. La idempotencia del comando no se afirma: ver la tabla de IAM. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo no incluye `dataEditor`: el texto dice que ese rol se concede en el dataset. No presenta el comando como idempotente. No marco un error. | pendiente |
| Ejemplos poco realistas | Una cuenta de servicio de pipeline con `jobUser` en el proyecto y `objectViewer` en el bucket raw es un recorte real de mínimo privilegio. | pendiente |
| Relaciones faltantes | `gcs-buckets-and-objects` e `infrastructure-as-code` están en `relations`. | pendiente |

## `dimension-tables`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: grano, clave sustituta, miembros especiales y las variantes (conformada, role-playing, junk, degenerada, bridge). | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | La forma de la dimensión y las variantes son de Kimball (Nivel 4, conceptual). `CREATE TABLE IF NOT EXISTS`, las vistas, el `MERGE` de una fila, el salto de valores de `IDENTITY` y los miembros 0, -1, -2 y -3 de Fabric están en notas Nivel 1. | pendiente |
| Errores técnicos o simplificaciones peligrosas | La tabla se crea con `IF NOT EXISTS` y el miembro faltante entra con un `MERGE` que solo inserta si no existe. No marco un error. | pendiente |
| Ejemplos poco realistas | Cliente con atributos desnormalizados, fecha como role-playing y un miembro «desconocido» es el modelo habitual. | pendiente |
| Relaciones faltantes | `slowly-changing-dimensions`, `surrogate-keys` y `scd-type-2` están en `relations`. | pendiente |

## `python-api-consumption`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: cliente, timeout, validar la respuesta, y cuándo no reintentar un `POST`. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `urllib`, timeouts y `HTTPError` están en notas de Python. Los defaults de google-api-core, los modos de Boto3 y los timeouts de Data Factory y de Step Functions están en notas Nivel 1. La RFC 9110 (Nivel 4) solo respalda que `GET` es seguro e idempotente y qué significa `Retry-After`. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo es un `GET` con timeout y valida `moneda` y `valor`. Los reintentos se remiten a otra ficha y al snippet. No marco un error. | pendiente |
| Ejemplos poco realistas | Un tipo de cambio por fecha, con el token en `API_TOKEN`, es una llamada real. | pendiente |
| Relaciones faltantes | `api-ingestion`, `python-error-handling-and-retries` y `retries` están en `relations`. | pendiente |

## `scheduler`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: intervalo lógico, cron, presets, timedelta, y la diferencia con un cron del sistema. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | El scheduler de Airflow, `catchup`, cron y timedelta, Composer, MWAA, EventBridge Scheduler y los triggers de Data Factory están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | Los tres Dags usan `ds` y `catchup=False`. No escriben datos. No marco un error. | pendiente |
| Ejemplos poco realistas | Una carga diaria a las 03:00 y otra cada 6 horas, ambas con la fecha lógica, es realista. | pendiente |
| Relaciones faltantes | `dag`, `catchup` y `backfill` están en `relations`. | pendiente |

## `file-ingestion`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Están cubiertas: llegada del archivo, formato, registros inválidos, duplicados y costo de archivos pequeños. | pendiente |
| Afirmaciones sin fuente o con fuente de nivel bajo | `LOAD DATA`, `WRITE_APPEND` / `WRITE_TRUNCATE`, notificaciones de Cloud Storage, `COPY` y manifest de Redshift, y el storage event trigger de Data Factory están en notas Nivel 1. No hay fuente Nivel 4. | pendiente |
| Errores técnicos o simplificaciones peligrosas | El ejemplo reemplaza la tabla del día. Advierte que `bq load` sin `--replace` duplica. Las notificaciones at-least-once de S3 y de Blob Storage se distinguen. No marco un error. | pendiente |
| Ejemplos poco realistas | Parquet de un día en un prefijo `fecha=` y carga que reemplaza ese staging es habitual. | pendiente |
| Relaciones faltantes | `parquet-format`, `schema-evolution`, `gcs-buckets-and-objects` e `idempotency` están en `relations`. | pendiente |

## `pubsub-delivery-semantics` §10 (consumidor real)

La ficha ya estaba `verified` por el lote 2. Esta sección revisa solo el código nuevo del 2026-10-01. No se reabren las filas anteriores.

| Criterio | Hallazgo | Estado |
|---|---|---|
| Código ejecutable o requisitos exactos | Declara Python 3.12, `google-cloud-pubsub`, psycopg 3, la suscripción pull, `DATABASE_URL`, la tabla `customers(customer_id, version, payload)` y un permiso de consumidor (`roles/pubsub.subscriber` como ejemplo). | pendiente |
| Idempotencia de la escritura | El `INSERT ... ON CONFLICT DO UPDATE ... WHERE c.version < excluded.version` es una sentencia. El `ack` va después de escribir. Un mensaje inválido se confirma a propósito; un error de la base hace `nack`. | pendiente |
| Afirmaciones de producto del ejemplo | `subscribe`, `ack` / `nack`, `FlowControl` (el ejemplo usa 100; la nota dice que el default de `max_messages` es 1000) y la conexión de psycopg compartida entre hilos están en notas Nivel 1. | pendiente |
| Errores técnicos | No marco un error. El texto dice que, si hay dead-letter topic, se puede preferir `nack()` en el mensaje inválido en lugar de `ack()`. | pendiente |

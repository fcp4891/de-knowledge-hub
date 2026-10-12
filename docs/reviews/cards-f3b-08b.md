# Revisión B-F3.1 · Lote F3b-08b

Fichas en `content/concepts/`, commit `e1b8211`. Carril B no las edita. Las ocho siguen en `review_required`. No hay comentarios `VERIFY`.

Las 8: `bigquery-security`, `bigquery-policy-tags`, `bigquery-information-schema`, `bigquery-monitoring`, `dataplex-governance`, `gcp-secret-manager-usage`, `gcp-cmek-with-kms` y `gcs-storage-classes-and-lifecycle`.

El 2026-10-11 contrasté *Introduction to data masking*, *Storage classes* y la página de precios de Cloud Storage. El aviso de Knowledge Catalog del 10 de abril de 2026 está en el HTML de *About data products*, que esta ficha cita. No reejecuté el SQL, el Python ni Terraform. `make validate` no corrió: en este worktree no hay `.venv`.

## Comprobación por comando

```text
Las 8 tienen al menos una fuente Nivel 1, accessed 2026-10-11.
s14 Seguridad, Observabilidad y Costo: True en las 8.
related_topics ausentes en relations: ninguno.
missing entity (related_topics y relations): ninguno.
dataplex-governance title: Gobierno de datos con Knowledge Catalog
aliases: [Dataplex, Dataplex Universal Catalog, Gobierno de datos con Dataplex]
```

GoogleSQL:

```text
bigquery-security.md:191: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
bigquery-information-schema.md:132: -- BigQuery, GoogleSQL (no ejecutado: requiere un proyecto de GCP). ...
```

Terraform: los 7 bloques `hcl` dicen «no se aplicó» (security, policy-tags, monitoring, dataplex-governance, secret-manager, cmek, storage-classes).

Slugs del §17 fuera de `relations` que no tienen ficha:

```text
data-catalog: NO
data-lineage: NO
```

`dataplex-governance` los deja como pendientes de ficha. El resto de slugs del §17 que faltan en `relations` sí tienen ficha (salida del mismo script: `bigquery-policy-tags`, `data-mart`, `bigquery-monitoring`, `bigquery-query-optimization`, `orchestration-observability`, `infrastructure-as-code`, `terraform-state`).

`bigquery-architecture` está en `relations` de `bigquery-security` y el cuerpo no lo nombra (grep del slug: solo la línea `target:`).

## `bigquery-security`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cuatro fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». El Terraform dice validado en la CI y no aplicado. | ninguna | — |
| El §17 nombra `bigquery-policy-tags`, `data-mart` y `bigquery-monitoring`. Tienen ficha y no están en `relations`. `relations` incluye `bigquery-architecture`, que el texto no nombra. | media | Agregar las tres del §17. Quitar `bigquery-architecture` o nombrarla en el §17. |

## `bigquery-policy-tags`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Dos fuentes Nivel 1. §14 completo. No hay GoogleSQL. El Terraform dice no aplicado. *Introduction to data masking* dice: la API `datacatalog.googleapis.com` debe seguir habilitada; la búsqueda y la catalogación de Data Catalog están obsoletas y pasan a Knowledge Catalog; la funcionalidad de policy tags de esa API no está obsoleta. El §1 y el §11 dicen eso. `relations` coincide con el §17. | ninguna | — |

## `bigquery-information-schema`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Cuatro fuentes Nivel 1. §14 completo. El GoogleSQL dice «no ejecutado». | ninguna | — |
| El §17 nombra `bigquery-query-optimization`. Tiene ficha y no está en `relations`. | media | Agregar esa relación. |

## `bigquery-monitoring`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Tres fuentes Nivel 1. §14 completo. No hay GoogleSQL. El Terraform dice no aplicado. | ninguna | — |
| El §17 nombra `orchestration-observability`. Tiene ficha y no está en `relations`. | media | Agregar esa relación. |

## `dataplex-governance`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| El título es «Gobierno de datos con Knowledge Catalog». Los alias incluyen Dataplex y Dataplex Universal Catalog. Cinco fuentes Nivel 1 de Knowledge Catalog. El aviso citado dice el 10 de abril de 2026 y que no cambian la API, las bibliotecas cliente, la CLI y los nombres de IAM. §14 completo. El Terraform `google_dataplex_datascan` dice no aplicado. `data-catalog` y `data-lineage` no tienen ficha; el §17 los deja pendientes y no están en `relations`. | ninguna | — |

## `gcp-secret-manager-usage`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Dos fuentes Nivel 1 (`gcp-secret-manager-docs`). §14 completo. El Terraform dice no aplicado y que el valor del secreto no entra en el estado. | ninguna | — |
| El §17 nombra `infrastructure-as-code` y `terraform-state`. Tienen ficha y no están en `relations`. | media | Agregar esas dos relaciones. |

## `gcp-cmek-with-kms`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Dos fuentes Nivel 1 (Cloud KMS y BigQuery CMEK). §14 completo. El Terraform dice no aplicado. `relations` coincide con el §17. | ninguna | — |

## `gcs-storage-classes-and-lifecycle`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| La tabla del §1 dice fecha 2026-10-11 y no copia montos. Rapid, Standard, Nearline (30 días), Coldline (90) y Archive (365), con recuperación sí o no, coinciden con la tabla de *Storage classes*. La eliminación anticipada («charged as if the object was stored for the minimum duration», también al reescribir para cambiar de clase) está en la página de precios, que la ficha cita y no copia. El Python dice que no modela precios. §14 completo. `relations` coincide con el §17. | ninguna | — |

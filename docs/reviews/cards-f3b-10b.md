# Revisión B-F3.1 · Lote F3b-10b

Fichas en `content/concepts/`, commit `88dd488`. Carril B no las edita. Las siete siguen en `review_required`. No hay comentarios `VERIFY`.

Las 7: `azure-functions-for-data`, `container-apps-for-data`, `azure-sql-as-source`, `purview-governance`, `entra-id-for-data`, `key-vault-secrets` y `azure-ai-for-data-engineers`.

El 2026-10-14 contrasté el HTML de las páginas de cambio de nombre, de la tabla «Evolution of Foundry», de la Batch API, de hosting de Functions, de jobs de Container Apps, de IAM de GCP, de las referencias de Key Vault y de Unified Catalog.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 418 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

```text
s14 Seguridad, Observabilidad y Costo: True en las 7.
Montos con $ o USD: ninguno.
page_title vacío: ninguno.
related_topics fuera de relations: ninguno.
relations no nombradas en el §17: ninguno.
rag.md: no existe. El §17 de azure-ai-for-data-engineers dice «pendiente de ficha» y no lo pone en relations.

Slugs con ficha nombrados en el cuerpo y fuera de relations:
  azure-ai-for-data-engineers: azure-ai
```

`azure-ai` es la tecnología de esa ficha (`technologies`), no un concepto que falte en `relations`. No hay otra ficha de concepto en ese caso.

`related_topics`:

```text
azure-functions-for-data topics ['lambda-for-data'] fuera ninguno
container-apps-for-data topics ['cloud-run-for-data'] fuera ninguno
azure-sql-as-source topics ['database-ingestion', 'change-data-capture'] fuera ninguno
purview-governance topics ['dataplex-governance', 'lake-formation-permissions'] fuera ninguno
entra-id-for-data topics ['gcp-iam-for-data', 'aws-iam-for-data'] fuera ninguno
key-vault-secrets topics ['gcp-secret-manager-usage'] fuera ninguno
azure-ai-for-data-engineers topics ['vertex-ai-for-data-engineers', 'bedrock-for-data-engineers'] fuera ninguno
```

Código y CI. `tests/test_snippet_code.py` toma el primer bloque `python` del §10 y lo ejecuta, con `mypy --strict`:

```text
AZURE_STDLIB_SNIPPETS = azure-sql-as-source.md, azure-ai-for-data-engineers.md
test_azure_sql_cdc_snippet_applies_in_lsn_order_idempotently
test_foundry_batch_snippet_builds_jsonl_and_joins_unordered_output
test_azure_stdlib_snippets_pass_mypy_strict
```

El T-SQL de Azure SQL, la función de Blob, el SDK de Key Vault y subir o crear el batch dicen «no ejecutado». Cinco bloques `hcl` con `hashicorp/azurerm ~> 5.0` dicen validados y no aplicados: Functions, Container Apps, Entra, Key Vault y Purview. La CI corre `make validate-terraform`.

Alias, leídos del YAML:

```text
microsoft-entra-id  title: Microsoft Entra ID
  aliases: Azure Active Directory, Azure AD
azure-ai  title: Microsoft Foundry
  aliases: Azure AI Foundry, Azure AI Studio, Azure AI Services
```

Páginas (HTML del artículo, 2026-10-14). El `page_title` de la muestra coincide con el H1:

```text
What is Azure Functions?
Azure Container Apps overview
What is Azure SQL Database?
Learn about Microsoft Purview
New name for Azure Active Directory
  «Microsoft renamed Azure Active Directory (Azure AD) to Microsoft Entra ID»
About Azure Key Vault
What is Microsoft Foundry?
  Brand | Azure AI Studio / Azure AI Foundry | Microsoft Foundry
  Brand | Azure AI Services | Foundry Tools
What are Foundry Tools?
Getting started with Azure OpenAI batch deployments
  «50% less cost than global standard»
Learn about Microsoft Purview Unified Catalog
  «The new Unified Catalog experience is rolling out across environments»
Azure Functions hosting options
  «The Consumption plan is a legacy hosting plan»
  «Linux - Retired» en el plan Consumption
  no dice que Flex Consumption se cobre por ejecuciones, tiempo y memoria
Jobs in Azure Container Apps: index NO
IAM overview: «Deny policies prevent principals from using certain permissions, even if…»
Use Key Vault references…: «Understand rotation… such as with rotation… within 24 hours»
```

## `azure-functions-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Doce fuentes, con `page_title`. §14 completo, sin montos. El plan Consumption legacy y Linux retirado están en *Azure Functions hosting options*. La función dice no ejecutada. El Terraform (`~> 5.0`) dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan modelo, disparo y duración con páginas de Cloud Run y de Lambda en la ficha. | ninguna | — |
| El costo dice que Flex Consumption se cobra por ejecuciones, tiempo y memoria. Esa página no lo dice, y la ficha no cita la página de precios. | media | Citar la página de precios, con fecha, o quitar esas dimensiones. |

## `container-apps-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Siete fuentes, con `page_title`. §14 completo, sin montos. *Jobs in Azure Container Apps* no documenta un índice de réplica; la celda lo dice. El Terraform (`~> 5.0`) dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan disparo, índice de tarea y duración con páginas de Cloud Run y de Lambda en la ficha. | ninguna | — |
| El costo dice que un job solo usa cómputo mientras corren sus réplicas. Las páginas citadas no hablan de cobro, y no hay página de precios. | media | Citar la página de precios, con fecha, o no afirmar el modelo de cobro. |

## `azure-sql-as-source`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes, con `page_title`. §14 completo, sin montos. La réplica con el mismo cómputo que la primaria está en la página de read scale-out, consultada el 2026-10-13. El T-SQL dice no ejecutado. `apply_cdc` corre en la CI con `mypy --strict` y no lee Azure SQL. `relations` coincide con el §17. El §11 y el §12 comparan CDC, réplicas y el destino de los cambios con páginas de Cloud SQL, Datastream, RDS y DMS en la ficha. Datastream escribe en BigQuery y en Cloud Storage. | ninguna | — |

## `purview-governance`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Nueve fuentes, con `page_title`. §14 completo, sin montos. El Data Map en capacity units está en su página, consultada el 2026-10-13. Unified Catalog dice que la experiencia nueva se está desplegando por entorno. El Terraform (`~> 5.0`) dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan alcance, descubrimiento y linaje con páginas de Knowledge Catalog, Glue y Lake Formation en la ficha. | ninguna | — |

## `entra-id-for-data`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. La página dice «Microsoft renamed Azure Active Directory (Azure AD) to Microsoft Entra ID». La tecnología `microsoft-entra-id` se titula Microsoft Entra ID y tiene los alias Azure Active Directory y Azure AD. El Terraform (`~> 5.0`) dice validado y no aplicado. `relations` coincide con el §17. El §12 compara identidad, concesión y Deny con páginas de IAM de AWS en la ficha. | ninguna | — |
| El §11 dice que las páginas citadas de IAM de GCP no tratan el bloqueo explícito. *IAM overview* documenta las deny policies: impiden un permiso aunque una allow policy lo conceda. | media | Poner las deny policies en esa celda, con esa página. |

## `key-vault-secrets`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Nueve fuentes, con `page_title`. §14 completo, sin montos. El costo dice que no cita el modelo de cobro. El SDK dice no ejecutado. El Terraform (`~> 5.0`) dice validado y no aplicado. `relations` coincide con el §17. El §11 compara vault, permisos y qué se guarda con páginas de Secret Manager en la ficha. | ninguna | — |
| El §12 dice que las páginas citadas de Key Vault no tratan la rotación de secretos. *Use Key Vault references…* tiene «Understand rotation»: si no se fija la versión, la app toma la última y, tras una rotación, la usa dentro de 24 horas. | media | Decir lo que dice esa página. La rotación automática del secreto, como la de Secrets Manager, no está en las páginas citadas. |

## `azure-ai-for-data-engineers`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Ocho fuentes, con `page_title`. §14 completo, sin montos. La tabla «Evolution of Foundry» dice Azure AI Studio / Azure AI Foundry → Microsoft Foundry, y Azure AI Services → Foundry Tools. La tecnología `azure-ai` se titula Microsoft Foundry y tiene esos tres nombres anteriores como alias; la nota distingue que Azure AI Services pasa a Foundry Tools. El título de la ficha y el del blueprint son «Microsoft Foundry para Data Engineers». La Batch API dice «50% less cost than global standard», consultada el 2026-10-13, sin montos. `build_batch` y `join_responses` corren en la CI; subir el archivo y crear el batch dicen no ejecutado. `relations` coincide con el §17. `rag` queda como pendiente de ficha. El §11 y el §12 comparan el archivo, el identificador y el orden con páginas de Agent Platform y de Bedrock en la ficha. | ninguna | — |

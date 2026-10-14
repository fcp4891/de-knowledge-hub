# Revisión B-F3.1 · Lote F3b-10a

Fichas en `content/concepts/`, commit `88dd488` (el lote es `72cb822`; esas siete fichas no cambiaron después). Carril B no las edita. Las siete siguen en `review_required`. No hay comentarios `VERIFY`.

Las 7: `azure-analytics-landscape`, `adls-gen2-storage`, `data-factory-pipelines`, `fabric-onelake-and-workloads`, `synapse-analytics`, `azure-databricks-lakehouse` y `event-hubs-streaming`.

El 2026-10-14 contrasté el HTML de *What is Azure Data Factory?*, *What is Data Factory in Microsoft Fabric?*, la guía de tablas distribuidas de Synapse, *What is Azure Synapse Analytics?*, la guía de migración a Fabric Data Warehouse, *Use the Azurite emulator* y *Access tiers for blob data*. No reejecuté Azurite ni Terraform.

`.\.venv\Scripts\python.exe scripts\validate.py` terminó así:

```text
OK: 418 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

## Comprobación por comando

```text
s14 Seguridad, Observabilidad y Costo: True en las 7.
Montos con $ o USD: ninguno.
page_title vacío: ninguno.
related_topics ausentes en relations: ninguno.
relations no nombradas en el §17: ninguno.

Slugs con ficha nombrados en el cuerpo y fuera de relations:
  azure-analytics-landscape: composer-environments, dataform-workflows,
    bigquery-architecture, bigquery-biglake-tables, dataflow-execution-model,
    glue-catalog-and-etl, step-functions-workflows, mwaa-managed-airflow,
    redshift-architecture, emr-spark-clusters, lake-formation-permissions
  fabric-onelake-and-workloads: athena-serverless-queries
  synapse-analytics: bigquery-slots
  adls-gen2-storage, data-factory-pipelines, azure-databricks-lakehouse,
    event-hubs-streaming: ninguno
```

El mismo script listó backticks que no son fichas (`dfs`, `lake`, `timeout`, `retry`, `ventas`, `sources`). No cuentan.

Código y CI. `.github/workflows/ci.yml` levanta Azurite (`azurite-blob` en el puerto 10000) y pone `REQUIRE_AZURITE=1` en `make test`. También corre `make validate-terraform`. `tests/test_snippet_code.py` toma el primer bloque Python de `adls-gen2-storage` y lo ejecuta contra Azurite, con `mypy --strict`:

```text
test_adls_blob_snippet_writes_partitions_idempotently_on_azurite
```

Bloques `hcl` con `hashicorp/azurerm ~> 5.0` y «no se aplicó»: `adls-gen2-storage`, `data-factory-pipelines`, `azure-databricks-lakehouse`, `event-hubs-streaming`. T-SQL de Synapse y SQL de Databricks: «no ejecutado». OneLake, el SDK de Data Lake y el SDK de Event Hubs: «no ejecutado».

Páginas (HTML, 2026-10-14). El `page_title` de la muestra coincide con el H1:

```text
What is Azure Data Factory?  (landscape y data-factory)
  «Data Factory in Microsoft Fabric is the next generation of Azure Data Factory…»
  deprecat: NO
What is Data Factory in Microsoft Fabric?
  contiene «the next generation of Azure Data Factory». deprecat: NO
Guidance for designing distributed tables…
  «If you're new to data warehousing, start with Fabric Data Warehouse.
   Existing dedicated SQL pool workloads can upgrade to Fabric»
  deprecat: NO
What is Azure Synapse Analytics?  deprecat: NO
Migration planning: Azure Synapse Analytics dedicated SQL pools to Fabric Data Warehouse
  deprecat, retired, replaced: NO
Use the Azurite emulator…
  «Azurite supports only the Blob, Queue, and Table storage services.
   It doesn't support Azure Files or Azure Data Lake Storage Gen2.»
  hierarchical: NO. dfs: NO
Access tiers for blob data: Cool 30 días, Cold 90, Archive 180. Hot sin mínimo.
Introduction to Azure Data Lake Storage, What is Microsoft Fabric?,
What is Azure Databricks?, What is Azure Event Hubs?: el H1 coincide con page_title.
Welcome to the Amazon MSK Developer Guide: retention: NO
```

## `azure-analytics-landscape`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Diez fuentes, con `page_title`. §14 completo, sin montos. No hay código. La tabla de servicios cita la frase de la siguiente generación de Data Factory y la recomendación de Fabric Data Warehouse. Esas páginas no dicen «deprecated». La ficha tampoco. El §11 y el §12 remiten a las fichas de cada servicio, como pide el pedido. | ninguna | — |
| El §11 y el §12 nombran once fichas que existen y no están en `relations` ni en el §17: `composer-environments`, `dataform-workflows`, `bigquery-architecture`, `bigquery-biglake-tables`, `dataflow-execution-model`, `glue-catalog-and-etl`, `step-functions-workflows`, `mwaa-managed-airflow`, `redshift-architecture`, `emr-spark-clusters` y `lake-formation-permissions`. | media | Agregarlas a `relations` y nombrarlas en el §17. |

## `adls-gen2-storage`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Doce fuentes, con `page_title`. §14 completo, sin montos. La tabla de niveles (Cool 30, Cold 90, Archive 180, Hot sin mínimo) coincide con *Access tiers for blob data*, consultada el 2026-10-13. El Blob corre en la CI contra Azurite. El SDK de Data Lake y el Terraform dicen no ejecutado y no aplicado. `relations` coincide con el §17. El §11 y el §12 dan diferencias concretas (namespace, mínimos, ABFS frente a la API de Cloud Storage, directory buckets) y las páginas de los dos lados están en la ficha. | ninguna | — |
| El comentario del código dice que Azurite no soporta el namespace jerárquico ni el endpoint `dfs`. La página citada dice que no soporta Azure Data Lake Storage Gen2, y no nombra el namespace jerárquico ni `dfs`. | media | Dejar la frase citada («no soporta ADLS Gen2»). No atribuir a esa página el namespace ni el endpoint `dfs`. |

## `data-factory-pipelines`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Trece fuentes, con `page_title`. §14 completo, sin montos. La ficha cita «Data Factory in Microsoft Fabric is the next generation of Azure Data Factory» y dice que la página no llama a ADF deprecado. Esa página no contiene «deprecat». El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan la unidad, los reintentos y el cobro con Workflows y con Step Functions, y las páginas de los dos lados están en la ficha. | ninguna | — |

## `fabric-onelake-and-workloads`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Doce fuentes, con `page_title`. §14 completo, sin montos. El SDK de OneLake dice no ejecutado. `relations` coincide con el §17 salvo la fila de abajo. El §11 y el §12 dan diferencias concretas (un lake por tenant, Delta o Iceberg, shortcuts) y las páginas de los dos lados están en la ficha. | ninguna | — |
| El §12 nombra `athena-serverless-queries`. Tiene ficha y no está en `relations` ni en el §17. | media | Agregar esa relación y nombrarla en el §17. |

## `synapse-analytics`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Doce fuentes, con `page_title`. §14 completo, sin montos. La ficha cita «If you're new to data warehousing, start with Fabric Data Warehouse» y dice que las páginas citadas no llaman a Synapse deprecado. *What is Azure Synapse Analytics?*, la guía de tablas distribuidas y la guía de migración no contienen «deprecat», «retired» ni «replaced». El T-SQL dice «no ejecutado». El §11 y el §12 comparan distribución, `OPENROWSET` y capacidad, con páginas de BigQuery, Redshift y Athena en la ficha. | ninguna | — |
| El §11 nombra `bigquery-slots`. Tiene ficha y no está en `relations` ni en el §17. | media | Agregar esa relación y nombrarla en el §17. |

## `azure-databricks-lakehouse`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Doce fuentes, con `page_title`. §14 completo, sin montos. El SQL dice «no ejecutado». El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan Spark, el formato de tabla y el gobierno con páginas de Managed Spark, Knowledge Catalog, EMR y Lake Formation en la ficha. | ninguna | — |

## `event-hubs-streaming`

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Catorce fuentes, con `page_title`. §14 completo, sin montos. El SDK dice no ejecutado. El Terraform dice validado y no aplicado. `relations` coincide con el §17. El §11 y el §12 comparan particiones, retención y API con páginas de Pub/Sub, Kinesis y MSK en la ficha. *Welcome to the Amazon MSK Developer Guide* no habla de retención; la celda dice que las páginas citadas de MSK no la tratan. | ninguna | — |

# Revisión B-F3.1 · lote F3b-17a

Rama `b/f3b-review-17a`, creada desde `origin/main` (`1157f83`). El pedido está en `docs/status/lane-a.md`. Fichas: `data-catalog`, `metadata-management`, `data-lineage`, `data-retention` y `data-lifecycle-management`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| Sin hallazgos. Lo ejecutado está en el test. El linaje cubre las dos vistas y escribe eventos a un archivo. La retención se queda en mecanismos y solo nombra SEC, CFTC y FINRA donde lo hace la página. DataZone y SageMaker Catalog no se presentan como reemplazo. `data-lifecycle-management` queda aparte de `data-lifecycle` y enlaza `gcs-storage-classes-and-lifecycle`. `dataplex-governance` solo enlaza. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 547 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py`. Los avisos son de 14b.

## Comprobaciones

```
== data-catalog dups [] missing17 [] sec14 True titles 6 sources 6 empty 0 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== metadata-management dups [] missing17 [] sec14 True titles 6 sources 6 empty 0 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-lineage dups [] missing17 [] sec14 True titles 9 sources 9 empty 0 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-retention dups [] missing17 [] sec14 True titles 5 sources 5 empty 0 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
== data-lifecycle-management dups [] missing17 [] sec14 True titles 3 sources 3 empty 0 11:tabla+fuente 12:tabla+fuente 13:tabla+fuente
```

`tests/test_governance_snippets.py` exige las frases de las fichas y, en el linaje, que exista `lineage.jsonl`:

```
"finanzas.facturas: Facturas emitidas por pedido. Dueño: finanzas"
"cobertura de descripciones: 2/4; faltan ['cliente_id', 'canal']"
"eventos: 8 (4 COMPLETE)"
"de dónde viene export.finanzas_diario: ['mart.ventas_por_cliente', 'raw.clientes', 'raw.pedidos', 'stg.clientes', 'stg.pedidos']"
"qué se ve afectado si cambia raw.clientes: ['export.finanzas_diario', 'mart.ventas_por_cliente', 'stg.clientes']"
"primera corrida, borradas: ['eventos_2026_05', 'eventos_2026_06']"
"segunda corrida, borradas: []"
"raw/pedidos/2026-08-01.json (80 días): pasar a almacenamiento frío"
"tmp/sin-clase.csv (292 días): SIN CLASE: revisar"
```

El cliente se crea con `transport.type = file`. Las páginas del cliente muestran «Version: 1.54.0» y el ejemplo de *Usage Example* trae `type: file`, `log_file_path` y `append`. No hay backend.

`data-lineage` recorre el mismo grafo hacia atrás («de dónde viene») y hacia adelante («qué se ve afectado»).

`data-retention` dice que no da asesoría legal y que el plazo lo fija otra política. Las regulaciones aparecen solo en la columna de la nube, con la frase de la página:

- *Bucket Lock*: «can help with regulatory and compliance requirements, such as those associated with FINRA, SEC, and CFTC».
- *Object Lock*: «has been assessed by Cohasset Associates for use in environments that are subject to SEC 17a-4, CFTC, and FINRA regulations».
- *Immutable storage*: «helps organizations address SEC 17a-4(f), CFTC 1.31(d), FINRA, and other regulations».

*Amazon SageMaker and when to use Amazon SageMaker vs Amazon DataZone* dice: «Amazon SageMaker Catalog, built on Amazon DataZone». No dice que uno reemplace al otro. Las fichas citan las dos guías de linaje por separado y no hablan de reemplazo. *About data lineage* dice «Knowledge Catalog (formerly Dataplex Universal Catalog)»; la nota de la ficha lo cita así.

`data-lifecycle-management` abre con «No es lo mismo que `data-lifecycle`». `relations` y el §17 incluyen `data-lifecycle` y `gcs-storage-classes-and-lifecycle`.

*Object Lifecycle Management*: «The Delete action takes precedence over any SetStorageClass action» y «the storage class with the lowest at-rest storage pricing». *Managing the lifecycle of objects*: «There are costs associated with lifecycle transition requests». La ficha no pone un monto.

Los 24 `page_title` coinciden con el encabezado. En PostgreSQL el espacio es `&nbsp;` y el título es el del apartado (`COMMENT`, `9.27. …`, `5.12. …`, `35.17. columns`). En Google, el aviso de collections no entra en el título.

## Diff de dataplex-governance

`git diff c41dc96^..c41dc96 -- content/concepts/dataplex-governance.md`. Solo las dos relaciones, el §17 y una línea de historial.

```diff
diff --git a/content/concepts/dataplex-governance.md b/content/concepts/dataplex-governance.md
index b0163d2..0361ae7 100644
--- a/content/concepts/dataplex-governance.md
+++ b/content/concepts/dataplex-governance.md
@@ -54,6 +54,12 @@ relations:
   - type: RELATED_TO
     target: bigquery-policy-tags
     note: Los policy tags siguen en la API de Data Catalog.
+  - type: RELATED_TO
+    target: data-catalog
+    note: El catálogo de datos en general.
+  - type: RELATED_TO
+    target: data-lineage
+    note: El linaje fuera de Knowledge Catalog, con OpenLineage.
 created_at: 2026-10-11
 updated_at: 2026-10-13
 last_verified: 2026-10-11
@@ -244,7 +250,8 @@ Knowledge Catalog da calidad, linaje y catálogo administrados, sin infraestruct
 - `data-products`: los data products de Knowledge Catalog.
 - `data-validation-with-pydantic` y `sql-quality-checks`: validar dentro del pipeline.
 - `bigquery-policy-tags`: seguridad por columna, en la API de Data Catalog.
-- Del blueprint, pendientes de ficha: `data-catalog` y `data-lineage` (dominio 17).
+- `data-catalog`: el catálogo de datos en general.
+- `data-lineage`: el linaje, en su vista operativa y de gobierno.
 
 ## 18. Preguntas técnicas abiertas
 
@@ -272,3 +279,4 @@ El detalle de cada fuente está en `sources` del frontmatter.
 - 2026-10-11: revisión B-F3.1 del lote F3b-08b aplicada (docs/reviews/cards-f3b-08b.md): filas aprobadas sin cambios en esta ficha.
 - 2026-10-11: `verification_status: verified` (sin VERIFY pendientes).
 - 2026-10-13: `page_title` en cada cita, con el título de la página citada (ADR-012); sin cambios de contenido.
+- 2026-10-20: lote F3b-17a (regla del §17): relations y el §17 enlazan `data-catalog` y `data-lineage`, que ya tienen ficha; antes figuraban como pendientes de ficha.
```

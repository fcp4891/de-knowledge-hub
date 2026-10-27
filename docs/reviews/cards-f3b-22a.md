# Revisión B-F3.1 · lote F3b-22a

Rama `b/f3b-review-22a`, creada desde `a639de6`. Fichas: `modern-data-stack`, `analytics-engineering`, `dataops`, `finops-for-data`, `data-platform-engineering` y `data-versioning`. No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| En `data-versioning`, el `page_title` y el «Según» del §13 dicen «Query data as it existed in the past». La página de Fabric (https://learn.microsoft.com/en-us/fabric/data-warehouse/time-travel) titula «Time Travel». La primera frase marca la capacidad como preview: «query historical data as it existed in the past in warehouse and SQL analytics endpoint items (preview)». El §13 no lo dice. | baja | Poner `page_title` «Time Travel» y decir que la página la marca como preview. La sintaxis `OPTION (FOR TIMESTAMP AS OF …)` y la retención configurable sí están en la página. |
| En `modern-data-stack`, el §12 y el §13 nombran Redshift, MWAA y los dbt jobs de Fabric sin «Según». Las fuentes de la ficha son *What is dbt?* y *Dataform overview*. | baja | Dejar el enlace a `redshift-architecture`, al §12 y al §13 de `analytics-engineering` y a `azure-analytics-landscape`. |
| Sin otros hallazgos. `modern-data-stack` no dice que la etiqueta esté perdiendo uso. `finops-for-data` toma de la FinOps Foundation solo las fases y no trae montos. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 639 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py` en `a639de6`. Los avisos son de Spark.

## Comprobaciones

```
modern-data-stack sources 2 titles 2 rels 14 miss17 [] extra_topics [] s14 ok nodos 5 money []
analytics-engineering sources 4 titles 4 rels 7 miss17 [] extra_topics [] s14 ok nodos 5 money []
dataops sources 3 titles 3 rels 6 miss17 [] extra_topics [] s14 ok nodos 5 money ['33 %', '0%']
finops-for-data sources 5 titles 5 rels 5 miss17 [] extra_topics [] s14 ok nodos 4 money ['30 %', '40 %', '40 %', '40 %', '0%', '40%']
data-platform-engineering sources 3 titles 3 rels 6 miss17 [] extra_topics [] s14 ok nodos 4 money []
data-versioning sources 5 titles 5 rels 5 miss17 [] extra_topics [] s14 ok nodos 6 money []
```

`miss17 []`: cada `relations` se nombra en el §17. `extra_topics []`: `related_topics` es subconjunto de `relations`. Cada §14 tiene Seguridad, observabilidad y costo. Los diagramas tienen 5, 5, 5, 4, 4 y 6 nodos. Los destinos de `relations` tienen ficha. Los «33 %», «30 %» y «40 %» están en los ejemplos de `dataops` y `finops-for-data`, en porciones y en TiB, sin un monto.

`modern-data-stack` es un mapa: el §2 enlaza las piezas, el §10 dice que no tiene código propio y el §17 deja `medallion-architecture` como pendiente de ficha (F4), fuera de `relations`. Búsqueda de «perdiendo» y «desuso» en esa ficha: sin coincidencias. El §11 cita *Dataform overview*. El §12 y el §13 no llevan «Según» (baja de arriba).

## FinOps

`content/sources/registry.yaml`: `finops-foundation` tiene `authority_level: 4` y la descripción dice que no respalda afirmaciones de costo ni de producto. La ficha cita *FinOps Phases* para Inform, Optimize y Operate, y marca «solo conceptos».

Páginas consultadas en esta revisión:

- *FinOps Phases*: «three phases: Inform, Optimize and Operate».
- *JOBS view* y *Estimate and control costs*: «If the number of estimated bytes is beyond the limit, then the query fails without incurring a charge.» La ficha dice que la consulta falla sin cargo. No copia el ejemplo numérico de esa página.
- *Organizing and tracking costs using AWS cost allocation tags*: prefijos `aws:` y `user:`, activación por separado, y «All tags can take up to 24 hours to appear in the Billing and Cost Management console.» La ficha dice hasta 24 horas.
- *Create and manage Azure cost allocation rules*: el §13 describe la reasignación, sin cifras.

## Time travel

- *Data retention with time travel and fail-safe*: «the past seven days by default» y «from a minimum of two days to a maximum of seven days». El §11 dice siete días por defecto, entre dos y siete.
- *Introduction to table clones*: «writable copy» y «only charged for storage of data in the table clone that differs from the base table». El §11 dice copia escribible y que se cobra lo que difiere.
- *Perform time travel and version travel queries*: el H1 coincide con el `page_title`. `FOR TIMESTAMP AS OF` (UTC si no hay zona) y `FOR VERSION AS OF` con el ID del snapshot.
- *Branching and Tagging*: el H1 coincide. La página de releases dice «The latest version of Iceberg is 1.12.0», como anota la fuente.
- Fabric: el hallazgo de arriba.

## Fichas enlazadas

`git diff 056952f^..056952f` de `bigquery-slots`, `data-mesh` y `etl-vs-elt`: cada una suma una relación, cambia la línea de pendiente del §17 por el nombre de la ficha nueva y agrega una línea de historial. `etl-vs-elt` deja `medallion-architecture` como pendiente. Entre `056952f` y `a639de6` esos tres archivos no vuelven a cambiar.

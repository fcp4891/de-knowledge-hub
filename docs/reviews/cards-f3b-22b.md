# Revisión B-F3.1 · lote F3b-22b

Rama `b/f3b-review-22b`, creada desde `a639de6`. Fichas: `reverse-etl`, `data-sharing`, `semantic-layer` y `zero-etl-and-federation` (`emerging`). No se editó `content/` ni `frontend/`.

| Hallazgo | Severidad | Corrección propuesta |
|---|---|---|
| `semantic-layer` dice «Amazon Quick Sight» y «Quick Sight Topics» (descripción, §8 y §12). *How Topics work* titula «How Topics work - Amazon Quick». El cuerpo dice «A Topic in Quick Sight» y «enrich datasets directly in Quick Sight», y el chat es «Amazon Quick chat interface». La página de Aurora zero-ETL nombra el producto «Quick» en la lista de servicios. | media | Usar «Amazon Quick» donde la página lo usa en el título, y «Quick Sight» donde el cuerpo lo sigue escribiendo. Quitar «Amazon Quick Sight» y «Quick Sight Topics». |
| En `zero-etl-and-federation`, el `page_title` y el «Según» del §13 dicen «What is Mirroring in Fabric?». La página titula «Mirroring». | baja | Poner `page_title` «Mirroring». Los 15 segundos, las tablas Delta y los shortcuts del metadata mirroring sí están en la página. |
| Sin otros hallazgos. Dataverse exige Upsert, MetricFlow no se ejecuta en el test y `postgres_fdw` empuja el filtro. `zero-etl-and-federation` dice que no reemplaza ELT. | ninguna | — |

## Validación

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 639 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

`make` no está en el PATH. Se corrió `.\.venv\Scripts\python.exe scripts\validate.py` sobre el contenido de `a639de6`. Los avisos son de Spark.

## Comprobaciones

```
reverse-etl sources 3 titles 3 rels 6 miss17 [] extra_topics [] s14 ok nodos 5 money []
data-sharing sources 4 titles 4 rels 6 miss17 [] extra_topics [] s14 ok nodos 4 money []
semantic-layer sources 5 titles 5 rels 4 miss17 [] extra_topics [] s14 ok nodos 5 money []
zero-etl-and-federation sources 4 titles 4 rels 5 miss17 [] extra_topics [] s14 ok nodos 5 money []
```

`miss17 []`: cada `relations` se nombra en el §17. `extra_topics []`: `related_topics` es subconjunto de `relations`. Cada §14 tiene Seguridad, observabilidad y costo. Los diagramas tienen 5, 4, 5 y 5 nodos. `semantic-layer` deja `emerging-semantic-layers` como pendiente de ficha (dominio 23), fuera de `relations`.

## Upsert, MetricFlow y el filtro

*Configure Dataverse in a copy activity*, destino: «This property is required, and you must select Upsert.» La tabla de la página: «The value must be Upsert.» El §13 dice «Upsert obligatorio».

`tests/test_activation_snippets.py` ejecuta el bloque de `semantic-layer` con `dbt parse` y espera las métricas, el dashboard y la métrica rechazada. No llama a MetricFlow. La ficha dice: «el compilador real de dbt es MetricFlow, que no se ejecuta aquí.»

El mismo archivo, `test_federation_reads_live_and_pushes_filters`, espera `filtro enviado al remoto: True` (o se salta si la salida empieza por «no ejecutado»). *F.36. postgres_fdw*: «By default, only WHERE clauses using built-in operators and functions will be considered for execution on the remote server» y el SQL enviado se ve con `EXPLAIN VERBOSE`. El código imprime esa línea si el plan trae `Remote SQL` y `WHERE`.

## Otros nombres y cifras

- *Introduction to LookML* sigue diciendo Looker. El H1 coincide con el `page_title`.
- *Power BI semantic models*: «Microsoft renamed the Power BI dataset content type to Power BI semantic model or just semantic model.» La nota de la ficha usa ese renombre ya hecho.
- *Aurora zero-ETL integrations*: el H1 coincide. «with Amazon Redshift and Amazon SageMaker AI» y «near real-time».
- *Introduction to BigQuery sharing*: «BigQuery sharing (formerly Analytics Hub)». La ficha usa el nombre actual. Linked dataset de solo lectura, sin replicar, y la restricción de salida incluye copy, clone, export y snapshot.
- *Export data to Bigtable (reverse ETL)*: el H1 coincide. Reserva Enterprise o Enterprise Plus, y columna `rowkey` STRING o BYTES.
- *Introduction to federated queries*: solo lectura, sin DML ni DDL, y SQL pushdowns de filtrado.
- *Mirroring*: «Changes can be published as fast as every 15 seconds.» El título es el hallazgo de arriba. La ficha no copia el ejemplo de terabytes de esa página.

## Fichas enlazadas

`git diff b860dcc^..b860dcc` de `semantic-models`: suma la relación `semantic-layer`, cambia la línea de pendiente del §17 y agrega una línea de historial. La nota vieja de Quick Sight no entra en ese diff. Entre `b860dcc` y `a639de6` el archivo no vuelve a cambiar.

# Revisión · lote 23b

Rama `b/review-23b`, creada desde `b6eb31d`. Tres fichas `emerging`: `interoperability-standards`, `open-table-format-evolution` y `emerging-semantic-layers`. No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

El foco pedido: que el estado DRAFT de Ossie y «no ejecutado» en v3 estén citados textualmente.

## Común

Las tres fichas tienen `## 11.`, `## 12.` y `## 13.` separados. Los tres diagramas son `LR` con cadenas de 4, 3 y 4 nodos. Cada destino de `relations` aparece en el §17, y `related_topics` es subconjunto de `relations`. Ninguna presenta el estándar emergente como reemplazo de lo consolidado.

`scripts/validate.py` sobre este mismo `b6eb31d` terminó así (corrida de la revisión P1, sin cambios de contenido):

```
AVISO content\concepts\exactly-once-semantics.md: [sources.3.page_title] repite el de sources.2 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.1.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
AVISO content\concepts\spark-structured-streaming.md: [sources.2.page_title] repite el de sources.0 con la misma fuente 'apache-spark-docs': 'Structured Streaming Programming Guide'
OK: 662 entidades validadas en D:\Proyectos_IA\DES_conocimiento-review\content
```

La frase de versiones 1, 2, 3 y 4 de https://iceberg.apache.org/spec/ no se reabrió en esta pasada.

## Por ficha

### `interoperability-standards`

**Hallazgo.** El §11 cita entre comillas una frase de renombre que la página consultada hoy no trae. El §12 no dice que el endpoint de Glue queda en las especificaciones de tabla v1 y v2.

**Severidad.** media

**Evidencia.** *Set up the Apache Iceberg REST catalog endpoint*, https://docs.cloud.google.com/lakehouse/docs/set-up-lakehouse-iceberg-rest-catalog , título «Set up the Apache Iceberg REST catalog endpoint | Lakehouse». El cuerpo abre con «The Apache Iceberg REST catalog endpoint in the Lakehouse runtime catalog» y pide «Enable the BigLake API»; los roles siguen siendo `roles/biglake.admin`, `roles/biglake.viewer` y `roles/biglake.editor`. En el texto recuperado no está «As of April 20th, 2026, BigLake is now called Lakehouse. BigLake metastore is now called the Lakehouse runtime catalog», que el §11 (línea 171) pone entre comillas.

*Connecting to the Data Catalog using AWS Glue Iceberg REST endpoint*, https://docs.aws.amazon.com/glue/latest/dg/connect-glu-iceberg-rest.html : «The endpoint supports both Apache Iceberg table specifications - v1 and v2, defaulting to v2.» El §12 dice que soporta operaciones de la especificación REST y autenticación de AWS, sin ese límite.

*Apache Polaris Graduates to Top Level Project!*, https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/ , 19 de febrero de 2026: «Apache Polaris has officially graduated from the Apache Incubator to become a Top Level Project (TLP)». Coincide con el §1.

**Corrección.** Quitar la frase fechada del §11 si ya no está en la página, y dejar que el título es Lakehouse y que la API y los roles IAM siguen llamándose BigLake. En el §12, agregar que el endpoint de Glue soporta las especificaciones de tabla v1 y v2, con v2 por defecto.

### `open-table-format-evolution`

**Hallazgo.** La página de BigQuery que cita el §11 dice que las tablas externas Iceberg ya no se recomiendan para la mayoría de los casos, y lista capacidades de v3 que no soporta. El §11 solo cita el Preview de los deletion vectors.

**Severidad.** media

**Evidencia.** «no ejecutado» está citado tal cual. El §10 (línea 158) y `tests/test_standards_snippets.py` (línea 85) usan la misma cadena: `v3: no ejecutado (Writing V3 is not yet supported)`.

*Create Apache Iceberg external tables*, https://docs.cloud.google.com/bigquery/docs/iceberg-external-tables : «These tables are no longer recommended for most use cases.» Más abajo: «Iceberg external tables support Iceberg version 2, including merge-on-read. Support for Iceberg version 3, including binary deletion vectors, is in Preview.» Y, en limitaciones: «The following Iceberg version 3 features aren't supported: New data types: nanosecond timestamp(tz), unknown, variant, geometry, geography; Initial default values; Table encryption keys.» El tope de «100,000 total deletion vector entries» coincide con la nota de la fuente. El §11 (líneas 166–167) solo reproduce las dos frases de v2 y de Preview.

*Working with Apache Iceberg V3*, https://docs.aws.amazon.com/AmazonS3/latest/userguide/working-with-apache-iceberg-v3.html : «These capabilities include deletion vectors, row lineage, and column default values» y «S3 Tables support all of the data types that V3 introduces.» El §12 lo dice así. *Use Iceberg tables with OneLake*, https://learn.microsoft.com/en-us/fabric/onelake/onelake-iceberg-tables : «Produces Iceberg V2 metadata» y «Iceberg V3 source tables are partially supported». El §13 lo dice así.

**Corrección.** En el §11, anteponer que la página ya no recomienda esas tablas externas para la mayoría de los casos, y nombrar las capacidades de v3 que BigQuery dice que no soporta.

### `emerging-semantic-layers`

**Hallazgo.** Sin hallazgo. El estado DRAFT está citado textualmente y coincide con el commit fijado.

**Severidad.** ninguna

**Evidencia.** *Apache Ossie - Core Metadata Specification* en el commit `89e2e17`, https://github.com/apache/ossie/blob/89e2e17f8249e68f30df7b29ac8852fa9dd24501/core-spec/spec.md :

```
DRAFT version — in development, schema may change before 0.2.0 is released.
Version: 0.2.0.dev0
```

La nota de la fuente, el §1 y el §2 (líneas 66 y 70) repiten esa frase. El README del mismo commit, https://github.com/apache/ossie/blob/89e2e17f8249e68f30df7b29ac8852fa9dd24501/README.md , dice «Apache Ossie was formerly known as Open Semantic Interchange (OSI)» y titula «Apache Ossie (incubating)». El §10 dice que, si la descarga del esquema falla, el test se salta como «no ejecutado»; `tests/test_standards_snippets.py` (línea 95) usa ese texto. El §11, el §12 y el §13 dicen que Looker, Amazon Quick y Power BI no tratan Ossie.

**Corrección.** Ninguna.

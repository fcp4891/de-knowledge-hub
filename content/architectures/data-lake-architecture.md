---
id: architecture:data-lake-architecture
slug: data-lake-architecture
type: architecture
title: Arquitectura Data Lake
description: "Almacenamiento de objetos con zonas (raw, curated y cuarentena), particiones estilo Hive, esquema en lectura y un catálogo para encontrar y gobernar lo que hay. Tres vistas, operación y costos; Cloud Storage con BigQuery, S3 con Athena y Lake Formation, y ADLS con su namespace jerárquico. Ejemplo ejecutado en la CI con la biblioteca estándar."
domain: architecture
subdomain: reference-architectures
classification: core
level: intermediate
importance: medium
cloud: [gcp, aws, azure]
technologies: [gcp-cloud-storage, gcp-bigquery, gcp-biglake, aws-s3, aws-athena, aws-lake-formation, aws-glue, azure-adls, python]
tags: [data-lake, object-storage, partitioning, schema-on-read, governance]
related_topics: [data-lake, file-ingestion, pipeline-layers]
sources:
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/external-data-sources
    accessed: '2026-10-11'
    page_title: Introduction to external data sources
    note: 'Introduction to external data sources, tabla comparativa: BigLake usa delegación de acceso con una cuenta de servicio; las tablas externas, no. BigLake funciona con Cloud Storage, Amazon S3 y Azure Storage; las tablas externas, con Cloud Storage, Google Drive y Bigtable.'
  - source: gcp-bigquery-docs
    url: https://docs.cloud.google.com/bigquery/docs/biglake-intro
    accessed: '2026-10-11'
    page_title: Introduction to BigLake tables
    note: 'Introduction to BigLake tables: consultan datos estructurados en almacenes externos con delegación de acceso, que separa el acceso a la tabla del acceso al almacén: una conexión externa asociada a una cuenta de servicio se conecta al almacén, y a los usuarios solo se les da acceso a la tabla. Permite seguridad fina a nivel de tabla, incluida por fila y por columna, y enmascaramiento dinámico en tablas sobre Cloud Storage. Almacenes: Cloud Storage, y Amazon S3 y Blob Storage vía BigQuery Omni (estas dos, solo permanentes). Se puede crear una tabla sobre varias fuentes con el mismo esquema y actualizar una tabla externa a BigLake. Caché de metadatos (nombres de archivo, particiones, metadatos físicos como cantidad de filas) opcional por tabla, mantenida por trabajos de refresco; con caché, los cambios en los archivos no se ven hasta el siguiente refresco. No se usa caché de metadatos con tablas externas de Iceberg: BigQuery ya usa los metadatos de los manifiestos de Iceberg.'
  - source: gcp-cloud-storage-docs
    url: https://docs.cloud.google.com/storage/docs/lifecycle
    accessed: '2026-10-20'
    page_title: Object Lifecycle Management
    note: 'Object Lifecycle Management (Cloud Storage): se define una configuración de ciclo de vida en un bucket, con reglas que aplican a los objetos actuales y futuros; cuando un objeto cumple las condiciones de una regla, Cloud Storage hace la acción indicada. La acción Delete tiene prioridad sobre SetStorageClass, y entre varias SetStorageClass gana la de la clase con menor precio de almacenamiento.'
  - source: aws-s3-docs
    url: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
    accessed: '2026-10-12'
    page_title: What is Amazon S3?
    note: 'What is Amazon S3?: consistencia fuerte de lectura después de escritura para PUT y DELETE de objetos en todas las regiones, incluidas las sobrescrituras. Tipos de bucket: general purpose (el tipo original, recomendado para la mayoría de los casos; nombres únicos en el namespace global de la partición), directory (baja latencia; jerarquía de directorios, sin límite de prefijos), table (datos tabulares en formato Apache Iceberg, optimizado para analítica) y vector.'
  - source: aws-athena-docs
    url: https://docs.aws.amazon.com/athena/latest/ug/what-is.html
    accessed: '2026-10-12'
    page_title: What is Amazon Athena?
    note: 'What is Amazon Athena?: servicio de consultas interactivas para analizar datos directamente en Amazon S3 con SQL estándar, sin infraestructura; también ejecuta aplicaciones de Apache Spark sin planificar ni administrar recursos.'
  - source: aws-athena-docs
    url: https://docs.aws.amazon.com/athena/latest/ug/partitions.html
    accessed: '2026-10-12'
    page_title: Partition your data
    note: 'Partition your data: particionar limita los datos que escanea cada consulta, mejora el rendimiento y baja el costo; es común particionar por tiempo. MSCK REPAIR TABLE funciona solo con particiones estilo Hive; para particiones sin ese estilo (por ejemplo data/2021/01/26/) se usa ALTER TABLE ADD PARTITION.'
  - source: aws-lake-formation-docs
    url: https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html
    accessed: '2026-10-12'
    page_title: What is AWS Lake Formation?
    note: 'What is AWS Lake Formation?: gobierno, seguridad y compartición centralizados de datos para analítica y ML; control de acceso fino sobre los datos del lake en S3 y sus metadatos en el Glue Data Catalog. Tiene su propio modelo de permisos, que complementa el de IAM.'
  - source: aws-prescriptive-guidance
    url: https://docs.aws.amazon.com/prescriptive-guidance/latest/defining-bucket-names-data-lakes/data-layer-definitions.html
    accessed: '2026-10-11'
    page_title: Recommended data layers
    note: 'AWS Prescriptive Guidance: si no se trabaja con datos sensibles (PII), recomienda al menos tres capas en un data lake de AWS, y más según la complejidad y los casos de uso; con datos sensibles, un bucket de S3 adicional como landing zone, donde se enmascaran los datos antes de pasar a la capa raw. Cada capa en su propio bucket de S3. Capas recomendadas: Raw (datos crudos sin procesar, donde se ingieren; mantener el formato original y activar el versionado del bucket), Stage (datos intermedios procesados y optimizados para consumo, por ejemplo CSV convertido a Parquet por un job de AWS Glue que valida y registra la tabla en el Glue Data Catalog) y Analytics (datos agregados para casos de uso concretos, en formato listo para consumo como Parquet). Incluye ejemplos de políticas de ciclo de vida por capa, que deben evaluarse según la organización, la regulación, los patrones de consulta y el costo.'
  - source: azure-storage-docs
    url: https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction
    accessed: '2026-10-13'
    page_title: Introduction to Azure Data Lake Storage
    note: 'Introduction to Azure Data Lake Storage: conjunto de capacidades para analítica de big data construido sobre Azure Blob Storage, con semántica de sistema de archivos, seguridad a nivel de archivo y escala; se habilita con el namespace jerárquico. Acceso compatible con Hadoop: las distribuciones de Hadoop incluyen el driver ABFS, optimizado para analítica; las API REST están en el endpoint dfs.core.windows.net. Con el namespace jerárquico, renombrar o borrar un directorio son operaciones atómicas de metadatos.'
  - source: azure-storage-docs
    url: https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-namespace
    accessed: '2026-10-13'
    page_title: Azure Data Lake Storage hierarchical namespace
    note: 'Azure Data Lake Storage hierarchical namespace: los almacenes de objetos simulan directorios con barras en el nombre, lo que no ayuda a mover, renombrar o borrar directorios; el namespace jerárquico permite manipular directorios de forma atómica. La página estima que en muchos casos el cómputo es más del 85 % del costo total, así que reducir la latencia baja el costo aunque el almacenamiento cueste más.'
  - source: gcp-knowledge-catalog-docs
    url: https://docs.cloud.google.com/knowledge-catalog/docs/metadata-overview
    accessed: '2026-10-20'
    page_title: About metadata in Knowledge Catalog
    note: 'About metadata in Knowledge Catalog: las entries se crean automáticamente desde fuentes de Google Cloud (tablas, vistas, datasets y modelos de BigQuery, entre otras) o las crean los usuarios para fuentes propias, archivos o bases de terceros; los aspect types son plantillas predefinidas (Schema, Overview, Contacts, DataQuality, Lineage) o propias (por ejemplo, clasificación de PII o niveles de SLA); los aspects se llenan desde los sistemas de origen, logs de consultas o escaneos, o los agregan usuarios, pipelines o agentes; las entry links relacionan entries o columnas (synonym, definition, schema-join, related).'
relations:
  - {type: USES, target: data-lake, note: "El concepto que esta arquitectura implementa."}
  - {type: USES, target: file-ingestion, note: "Los archivos que llegan a la zona raw."}
  - {type: RELATED_TO, target: pipeline-layers, note: "Zonas raw, curated y analítica como capas."}
  - {type: RELATED_TO, target: lakehouse-architecture, note: "Lo que agrega una tabla transaccional sobre el lake."}
  - {type: RELATED_TO, target: medallion-architecture, note: "Las mismas zonas con nombres bronze, silver y gold."}
  - {type: ALTERNATIVE_TO, target: modern-data-warehouse-architecture, note: "SQL y concurrencia con el formato del motor."}
created_at: 2026-11-01
updated_at: 2026-11-03
last_verified: 2026-11-01
owner_approved_at: 2026-11-03
verification_status: verified
---

## 1. Resumen

Un data lake guarda datos de cualquier formato en **almacenamiento de objetos**, barato y durable, organizado en **zonas** (raw, curated y otras) y **particiones** por fecha o fuente. El esquema se aplica **al leer**, no al escribir: lo que llega se guarda tal cual, y cada consumidor lo interpreta. Sin catálogo ni permisos, un lake se vuelve un pantano: datos que nadie encuentra ni puede confiar.

Conviene para guardar crudo a bajo costo, datos semiestructurados y no estructurados, y para alimentar varios motores. No conviene como única capa de consumo cuando hacen falta transacciones, actualizaciones de filas o un modelo común (`lakehouse-architecture`, `modern-data-warehouse-architecture`).

## 2. Escenario y requerimientos

Escenario: una cadena de tiendas recibe eventos de sus cajas (POS) en lotes chicos durante el día y quiere conservarlos todos, consultarlos por día y descartar los que no cumplen el formato sin perderlos.

| Requerimiento | Valor del escenario |
|---|---|
| Conservación | Todo lo que llega, sin transformar |
| Consulta | Por día y por fuente, leyendo solo esa parte |
| Calidad | Lo inválido se separa, no se borra |
| Gobierno | Saber qué datasets hay y quién puede leerlos |
| Restricción | Costo de almacenamiento bajo para años de historia |

## 3. Vista de contexto

```mermaid
flowchart LR
  P["Cajas (POS)"] --> R["Zona raw"]
  R --> C["Zona curated"]
  C --> Q["Motores de consulta"]
  K["Catálogo y permisos"] -.-> C
  Q --> U["Analistas y ML"]
```

## 4. Componentes

| Componente | Responsabilidad | Por qué está |
|---|---|---|
| Zona raw | Guarda lo que llega, en su formato original | Permite reprocesar desde el origen |
| Zona de cuarentena | Guarda lo que no cumple el esquema | Lo inválido se revisa, no se pierde |
| Zona curated | Datos validados y compactados | Lectura eficiente y confiable |
| Particiones | Carpetas `clave=valor` por fuente y fecha | Las consultas leen solo lo que piden |
| Catálogo | Registra tablas, esquemas y ubicaciones | Sin catálogo, nadie encuentra los datos |
| Permisos | Control de acceso por zona y dataset | Raw puede tener datos sensibles |

## 5. Vista de datos

```mermaid
flowchart TB
  L["Lotes del POS"] --> R["Zona raw:<br/>source=pos/dt=…"]
  R --> V{"¿Cumple el<br/>esquema?"}
  V -- "sí" --> C["Zona curated: un<br/>archivo por partición"]
  V -- "no" --> Q["Zona de cuarentena"]
  C --> S["Consulta con poda<br/>de particiones"]
```

AWS Prescriptive Guidance recomienda al menos tres capas (Raw, Stage y Analytics), cada una en su propio bucket, y una landing zone adicional para enmascarar datos sensibles antes de la capa raw (*Recommended data layers*).

## 6. Vista de despliegue

```mermaid
flowchart LR
  subgraph S["Almacenamiento de objetos"]
    R["Zona raw (bucket)"]
    C["Zona curated (bucket)"]
  end
  J["Jobs de validación"] --> C
  K["Catálogo"] --> E["Motor de consulta"]
  E --> C
```

Un bucket por zona permite permisos y políticas de ciclo de vida distintos por zona.

## 7. Seguridad y gobierno

- Raw es la zona más sensible: llega todo, sin limpiar. Acceso solo para los pipelines.
- En AWS, Lake Formation agrega control de acceso fino sobre los datos en S3 y sus metadatos en el Glue Data Catalog, con un modelo de permisos que complementa a IAM (*What is AWS Lake Formation?*).
- En GCP, las tablas BigLake separan el acceso a la tabla del acceso al almacén con delegación de acceso, y permiten seguridad por fila y columna (*Introduction to BigLake tables*).

## 8. Escalabilidad, observabilidad y operación

- **Escala:** el almacenamiento de objetos escala sin aprovisionar; el límite práctico es la cantidad de archivos chicos.
- **Qué se mide:** archivos por partición, tamaño medio de archivo, registros en cuarentena y antigüedad de lo que nadie lee.
- **Runbook:** compactar las particiones con muchos archivos chicos; revisar la cuarentena y reprocesar desde raw cuando se corrige el esquema.

## 9. Costos

El almacenamiento es barato; el costo lo mueven las lecturas y el cómputo. Particionar limita lo que escanea cada consulta y baja el costo (*Partition your data*, Athena). ADLS estima que en muchos casos el cómputo es más del 85 % del costo total, así que reducir la latencia baja el costo aunque el almacenamiento cueste más (*Azure Data Lake Storage hierarchical namespace*). Las reglas de ciclo de vida mueven o borran objetos viejos sin intervención (*Object Lifecycle Management*).

## 10. Código y configuración

```python
# Python 3.12+, biblioteca estándar. Un data lake en una carpeta local: zona raw con particiones estilo Hive
# (fuente=…/dt=…), esquema en lectura con validación, zona de cuarentena para lo que no cumple, zona curated
# compactada (un archivo por partición) y una lectura que poda particiones. La carpeta hace de bucket.
import json
import sys
import tempfile
from pathlib import Path

lake = Path(sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp())
EXPECTED = {"order_id": str, "store": str, "amount": int}   # esquema que se aplica al leer, no al escribir
EVENTS: dict[str, list[list[dict[str, object]]]] = {   # lotes ficticios de un POS: cada lote llega como un archivo chico
    "2026-10-01": [[{"order_id": "o-1", "store": "norte", "amount": 120}], [{"order_id": "o-2", "store": "sur", "amount": 80}]],
    "2026-10-02": [[{"order_id": "o-3", "store": "norte", "amount": "50"}],                     # monto como texto
                   [{"order_id": "o-4", "store": "sur", "amount": 70}, {"order_id": "o-5", "amount": 30}]],   # sin tienda
}

for dt, batches in EVENTS.items():   # 1. raw: se escribe tal como llega, sin transformar
    for i, batch in enumerate(batches):
        path = lake / "raw" / "source=pos" / f"dt={dt}" / f"part-{i:04d}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(json.dumps(r) for r in batch), encoding="utf-8")


def valid(record: dict[str, object]) -> bool:
    return set(record) == set(EXPECTED) and all(isinstance(record[k], t) for k, t in EXPECTED.items())


for partition in sorted((lake / "raw" / "source=pos").iterdir()):   # 2. curated y cuarentena, por partición
    records = [json.loads(line) for f in sorted(partition.glob("*.json")) for line in f.read_text(encoding="utf-8").splitlines()]
    for zone, keep in (("curated", True), ("quarantine", False)):
        chosen = [r for r in records if valid(r) == keep]
        if chosen:
            out = lake / zone / "source=pos" / partition.name / "part-0000.json"   # compactado: un archivo
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text("\n".join(json.dumps(r) for r in chosen), encoding="utf-8")

for zone in ("raw", "curated", "quarantine"):
    files = sorted(lake.glob(f"{zone}/source=pos/dt=*/*.json"))
    print(f"{zone}: archivos={len(files)}, registros={sum(len(f.read_text(encoding='utf-8').splitlines()) for f in files)}")
read = sorted(lake.glob("curated/source=pos/dt=2026-10-02/*.json"))   # 3. poda: solo la partición pedida
print("consulta dt=2026-10-02 lee:", [f.relative_to(lake).as_posix() for f in read])
quarantined = [json.loads(line) for f in lake.glob("quarantine/source=pos/dt=*/*.json") for line in f.read_text(encoding="utf-8").splitlines()]
print("en cuarentena:", sorted(r["order_id"] for r in quarantined))
```

El script se **ejecuta en la CI** con la biblioteca estándar y pasa `mypy --strict`. Escribe cuatro lotes chicos en raw, valida al leer y separa los dos registros que no cumplen (un monto como texto y un registro sin tienda):

```text
raw: archivos=4, registros=5
curated: archivos=2, registros=3
quarantine: archivos=1, registros=2
consulta dt=2026-10-02 lee: ['curated/source=pos/dt=2026-10-02/part-0000.json']
en cuarentena: ['o-3', 'o-5']
```

Raw conserva los cinco registros; curated queda con un archivo por partición; la consulta de un día lee solo esa partición. Lo que no ejecuta: un bucket real, un catálogo y un motor de consulta.

## 11. GCP

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Almacenamiento | Cloud Storage | Reglas de ciclo de vida por bucket; Delete tiene prioridad sobre SetStorageClass (*Object Lifecycle Management*) |
| Consulta | Tablas externas o BigLake de BigQuery | BigLake usa delegación de acceso y funciona con Cloud Storage, S3 y Azure Storage; las tablas externas no delegan acceso (*Introduction to external data sources*) |
| Catálogo | Knowledge Catalog | Entries creadas automáticamente desde fuentes de Google Cloud, o por los usuarios para fuentes propias y archivos (*About metadata in Knowledge Catalog*). No ejecutado |

## 12. AWS

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Almacenamiento | Amazon S3 | Consistencia fuerte de lectura después de escritura para PUT y DELETE (*What is Amazon S3?*) |
| Consulta | Amazon Athena | SQL directo sobre S3 sin infraestructura (*What is Amazon Athena?*); `MSCK REPAIR TABLE` solo con particiones estilo Hive (*Partition your data*) |
| Gobierno | AWS Lake Formation | Permisos finos sobre S3 y el Glue Data Catalog (*What is AWS Lake Formation?*) |

## 13. Azure

| Pieza | Servicio | Detalle y diferencia |
|---|---|---|
| Almacenamiento | Azure Data Lake Storage | Sobre Blob Storage, con semántica de sistema de archivos al habilitar el namespace jerárquico (*Introduction to Azure Data Lake Storage*) |
| Directorios | Namespace jerárquico | Renombrar o borrar un directorio es atómico; en un almacén de objetos plano, no (*Azure Data Lake Storage hierarchical namespace*) |
| Consulta y catálogo | Motores sobre ABFS | No ejecutado |

## 14. Riesgos y modos de falla

| Riesgo | Cómo se detecta | Cómo se recupera |
|---|---|---|
| Archivos chicos | Archivos por partición | Compactar por partición |
| Pantano de datos | Datasets sin dueño ni catálogo | Registro obligatorio en el catálogo |
| Esquema que cambia en silencio | Crece la cuarentena | Versionar el esquema y reprocesar desde raw |
| Datos sensibles expuestos en raw | Revisión de permisos por zona | Landing zone con enmascarado antes de raw |

## 15. Errores frecuentes

| Error | Consecuencia |
|---|---|
| Borrar lo que no cumple | No se puede reprocesar cuando se corrige el esquema |
| Particiones sin el estilo `clave=valor` | Algunos motores no las descubren solos (Athena las agrega con `ALTER TABLE ADD PARTITION`) |
| Un solo bucket para todo | Permisos y ciclo de vida iguales para raw y para consumo |
| Usar el lake como base transaccional | Sin transacciones, las actualizaciones concurrentes se pisan |

## 16. Trade-offs y alternativas

| Opción | Gana | Cuesta |
|---|---|---|
| Data lake | Cualquier formato, costo bajo | Sin transacciones ni modelo común |
| `lakehouse-architecture` | Transacciones y esquema sobre el mismo almacenamiento | Catálogo de tablas y mantenimiento |
| `modern-data-warehouse-architecture` | SQL y concurrencia | Formato del motor y costo de almacenamiento |

## 17. Conceptos relacionados

- `data-lake`: el concepto que esta arquitectura implementa.
- `file-ingestion`: los archivos que llegan a raw.
- `pipeline-layers`: las zonas como capas.
- `lakehouse-architecture`: lo que agrega una tabla transaccional.
- `medallion-architecture`: las mismas zonas con nombres bronze, silver y gold.
- `modern-data-warehouse-architecture`: la alternativa con SQL y el formato del motor.

## 18. Evolución

Se llega desde carpetas compartidas o exportaciones sueltas. Se pasa a `lakehouse-architecture` cuando hacen falta actualizaciones de filas, time travel o varias escrituras concurrentes sobre los mismos datos. La señal: jobs que reescriben carpetas enteras para cambiar unas pocas filas.

## 19. Laboratorio relacionado

Sin laboratorio en F4: no está entre las 6 arquitecturas de F4. El §10 corre en la CI.

## 20. Fuentes

- Google Cloud: *Introduction to external data sources*; *Introduction to BigLake tables*; *Object Lifecycle Management*; *About metadata in Knowledge Catalog*.
- AWS: *What is Amazon S3?*; *What is Amazon Athena?*; *Partition your data*; *What is AWS Lake Formation?*; *Recommended data layers*.
- Microsoft Learn: *Introduction to Azure Data Lake Storage*; *Azure Data Lake Storage hierarchical namespace*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-11-01: fichas de origen de cada cita revisadas; las páginas se consultaron en las fechas de `sources`. `verified`: aprobada el 2026-11-03 (`owner_approved_at`).

## 22. Historial de cambios importantes

- 2026-11-01: creación (lote 07a, ADR-028).
- 2026-11-02: revisión de 07a aplicada (docs/reviews/lote-07a.md): la fila de catálogo del §11 cita *About metadata in Knowledge Catalog*; las vistas usan los nombres del §4 («Zona de cuarentena»).
- 2026-11-03: `verification_status: verified`, aprobada con lista explícita (`owner_approved_at: 2026-11-03`).

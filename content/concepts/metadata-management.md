---
id: concept:metadata-management
slug: metadata-management
type: concept
title: Gestión de metadata
description: "Gestionar la metadata es decidir qué se registra de cada dato (técnica: schema y tipos; de negocio: descripción y dueño; operativa: frescura, calidad, linaje), quién la mantiene y cómo se mide que esté completa. Ejemplo ejecutado en la CI: metadata técnica de information_schema y de negocio con COMMENT ON en PostgreSQL 17, con la cobertura de descripciones. Aspects de Knowledge Catalog, el Data Catalog de Glue y Purview, con sus diferencias."
domain: governance
subdomain: metadata-and-lineage
category: governance
classification: core
level: intermediate
importance: high
cloud: [agnostic]
technologies: [postgresql, gcp-dataplex, aws-glue, microsoft-purview]
tags: [governance, metadata, catalog, documentation]
related_topics: [data-catalog, data-lineage]
sources:
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-comment.html
    accessed: 2026-10-20
    page_title: "COMMENT"
    note: "COMMENT (PostgreSQL 17): guarda, reemplaza o quita el comentario de un objeto de la base; se guarda un solo comentario por objeto, un COMMENT nuevo reemplaza el anterior, NULL o '' lo quita, y los comentarios se borran con su objeto."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/functions-info.html
    accessed: 2026-10-20
    page_title: "9.27. System Information Functions and Operators"
    note: "9.27. System Information Functions and Operators (PostgreSQL 17): obj_description(oid, catálogo) devuelve el comentario de un objeto por su OID y el catálogo del sistema que lo contiene; col_description(oid de la tabla, número de columna) devuelve el de una columna (obj_description no sirve para columnas, que no tienen OID propio)."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/infoschema-columns.html
    accessed: 2026-10-20
    page_title: "35.17. columns"
    note: "35.17. columns (PostgreSQL 17): la vista columns del information schema tiene información de todas las columnas de tablas y vistas de la base, sin las columnas de sistema, y solo las que el usuario actual puede ver (por ser dueño o tener algún privilegio); incluye, entre otras, column_name, ordinal_position, data_type e is_nullable."
  - source: gcp-knowledge-catalog-docs
    url: https://docs.cloud.google.com/knowledge-catalog/docs/metadata-overview
    accessed: 2026-10-20
    page_title: "About metadata in Knowledge Catalog"
    note: "About metadata in Knowledge Catalog: las entries se crean automáticamente desde fuentes de Google Cloud (tablas, vistas, datasets y modelos de BigQuery, entre otras) o las crean los usuarios para fuentes propias, archivos o bases de terceros; los aspect types son plantillas predefinidas (Schema, Overview, Contacts, DataQuality, Lineage) o propias (por ejemplo, clasificación de PII o niveles de SLA); los aspects se llenan desde los sistemas de origen, logs de consultas o escaneos, o los agregan usuarios, pipelines o agentes; las entry links relacionan entries o columnas (synonym, definition, schema-join, related)."
  - source: aws-glue-docs
    url: https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html
    accessed: 2026-10-20
    page_title: "Data discovery and cataloging in AWS Glue"
    note: "Data discovery and cataloging in AWS Glue: el AWS Glue Data Catalog es un repositorio central de metadata sobre los datasets de la organización, un índice de la ubicación, el schema y las métricas de ejecución de las fuentes; la metadata se guarda en tablas, una por almacén de datos, y se llena con crawlers que escanean las fuentes y extraen metadata, dentro o fuera de AWS."
  - source: microsoft-purview-docs
    url: https://learn.microsoft.com/en-us/purview/unified-catalog
    accessed: 2026-10-20
    page_title: "Learn about Microsoft Purview Unified Catalog"
    note: "Learn about Microsoft Purview Unified Catalog: inventario de los activos de datos, su metadata y su linaje; herramientas para principios de gobierno: políticas de acceso de Unified Catalog, critical data elements, glossary terms, governance domains (organizar los datos por conceptos de negocio y distribuir el ownership) y data products (agrupar activos relacionados)."
relations:
  - type: RELATED_TO
    target: data-catalog
    note: Donde se publica y se busca la metadata.
  - type: RELATED_TO
    target: data-lineage
    note: El linaje es metadata operativa.
  - type: RELATED_TO
    target: schema-change-detection
    note: La metadata técnica cambia y hay que detectarlo.
  - type: RELATED_TO
    target: data-contracts
    note: El contrato fija parte de la metadata.
  - type: RELATED_TO
    target: dataplex-governance
    note: Aspects y entries en Knowledge Catalog.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

La **metadata** son los datos sobre los datos. Gestionarla es decidir qué se registra, quién lo mantiene y cómo se mide que esté completa. Hay tres tipos:

- **técnica:** schema, tipos, nulabilidad, ubicación; la generan los sistemas;
- **de negocio:** descripción, significado, dueño, términos; la agregan personas;
- **operativa:** frescura, calidad, linaje, uso; la generan los pipelines y las herramientas.

La técnica se obtiene sola; la de negocio es la que falta casi siempre. Por eso la gestión se mide: **cobertura** de descripciones y de dueños.

## 2. Qué es

| Tipo | Ejemplos | Quién la produce |
|---|---|---|
| Técnica | Columnas, tipos, `NOT NULL` | La base (`information_schema`) |
| De negocio | «Monto total en CLP, con impuestos»; dueño | Dueños y stewards |
| Operativa | Última carga, resultado de tests, linaje | Pipelines y herramientas |

En Knowledge Catalog, esa metadata se organiza en **aspects** sobre **entries**, con plantillas predefinidas o propias (*About metadata in Knowledge Catalog*).

## 3. Problema que resuelve

Una columna `monto` existe en cinco tablas. En unas incluye impuestos, en otras no, en una está en dólares. El schema es idéntico; lo que cambia es el significado, y no está escrito en ningún lado. Con metadata de negocio por columna, la diferencia queda registrada donde se consulta.

## 4. Cómo funciona

1. La técnica se lee de la fuente (`information_schema.columns`).
2. La de negocio se escribe junto al dato (`COMMENT ON` en PostgreSQL, *COMMENT*) o en el catálogo.
3. La operativa la publican los pipelines (frescura, tests, linaje).
4. Se juntan en una vista por activo.
5. Se mide la cobertura y se asigna a cada dueño lo que le falta.

## 5. Cuándo utilizarlo

- En toda tabla de consumo.
- Antes de exponer datos a otros equipos o a usuarios de negocio.
- Como requisito para catalogar y para clasificar.

## 6. Cuándo no utilizarlo

- Documentando tablas temporales o intermedias que nadie consume.
- Escribiendo descripciones que repiten el nombre de la columna.

## 7. Ejemplo sencillo

Tabla `pedidos` con descripción («Un pedido por fila; dueño: equipo comercial») y cuatro columnas:

| Columna | Técnica | Negocio |
|---|---|---|
| `id` | integer, no nulo | Identificador del pedido en el sistema de ventas |
| `cliente_id` | integer, no nulo | SIN DESCRIPCIÓN |
| `monto` | numeric, admite nulos | Monto total en CLP, con impuestos |
| `canal` | text, admite nulos | SIN DESCRIPCIÓN |

Cobertura: 2/4; faltan `cliente_id` y `canal`.

## 8. Ejemplo de producción

- La metadata técnica se sincroniza sola al catálogo.
- Descripciones de tabla y de columna en el repositorio (por ejemplo, en el YAML de dbt) y aplicadas en cada despliegue.
- Un aspect propio de «nivel de servicio» y otro de «clasificación» por tabla.
- Un tablero de cobertura por dueño; publicar en la capa de consumo exige cobertura completa.

## 9. Arquitectura

```mermaid
flowchart LR
  S["Fuente: information_schema"] -- "técnica" --> V["Vista por activo"]
  D["Dueños: COMMENT / YAML"] -- "negocio" --> V
  P["Pipelines: frescura, tests, linaje"] -- "operativa" --> V
  V --> C["Catálogo"]
  V --> K["Cobertura por dueño"]
```

## 10. Código

```python
# Python 3.12 y psycopg contra PostgreSQL 17 (ejecutado en la CI con el servicio postgres:17): metadata técnica desde
# information_schema y metadata de negocio con COMMENT ON, juntas en una entrada de catálogo; las columnas sin
# descripción quedan a la vista. PG_HOST, PG_PORT, PG_USER, PG_PASSWORD y PG_DB apuntan a una base vacía temporal.
import os

import psycopg

with psycopg.connect(host=os.environ["PG_HOST"], port=os.environ["PG_PORT"], user=os.environ["PG_USER"],
                     password=os.environ["PG_PASSWORD"], dbname=os.environ["PG_DB"], autocommit=True) as conn:
    conn.execute("CREATE TABLE pedidos (id int PRIMARY KEY, cliente_id int NOT NULL, monto numeric(12, 2), canal text)")
    conn.execute("COMMENT ON TABLE pedidos IS 'Un pedido por fila; dueño: equipo comercial'")
    conn.execute("COMMENT ON COLUMN pedidos.id IS 'Identificador del pedido en el sistema de ventas'")
    conn.execute("COMMENT ON COLUMN pedidos.monto IS 'Monto total en CLP, con impuestos'")
    tabla = conn.execute("SELECT obj_description('pedidos'::regclass, 'pg_class')").fetchone()
    columnas = conn.execute(
        "SELECT c.column_name, c.data_type, c.is_nullable, col_description('pedidos'::regclass, c.ordinal_position) "
        "FROM information_schema.columns c WHERE c.table_name = 'pedidos' ORDER BY c.ordinal_position").fetchall()

assert tabla is not None
print(f"pedidos: {tabla[0]}")
for nombre, tipo, nulos, descripcion in columnas:
    print(f"  {nombre} ({tipo}, nulos={nulos}): {descripcion or 'SIN DESCRIPCIÓN'}")
sin = [c[0] for c in columnas if not c[3]]
print(f"cobertura de descripciones: {len(columnas) - len(sin)}/{len(columnas)}; faltan {sin}")
```

El script se **ejecuta en la CI contra el servicio postgres:17**, en una base vacía que el test crea y borra, y pasa `mypy --strict`. Imprime la descripción de la tabla, cada columna con su tipo, nulabilidad y descripción (o `SIN DESCRIPCIÓN`) y `cobertura de descripciones: 2/4; faltan ['cliente_id', 'canal']`.

## 11. GCP

En GCP, **Knowledge Catalog**. Según *COMMENT* y *About metadata in Knowledge Catalog* (no ejecutado):

| | PostgreSQL | Knowledge Catalog |
|---|---|---|
| Técnica | `information_schema` | Entries automáticas desde fuentes de Google Cloud, con aspects como Schema |
| De negocio | Un comentario por objeto | Aspect types propios (por ejemplo, clasificación de PII o niveles de SLA) y glosarios |
| Quién la llena | Los dueños, con `COMMENT ON` | Sistemas de origen, escaneos, usuarios, pipelines o agentes |

## 12. AWS

En AWS, el **AWS Glue Data Catalog**. Según *COMMENT* y *Data discovery and cataloging in AWS Glue* (no ejecutado):

| | PostgreSQL | Glue Data Catalog |
|---|---|---|
| Técnica | `information_schema` | Ubicación, schema y métricas de ejecución, en tablas de metadata |
| Cómo se llena | La base la tiene | Crawlers que escanean las fuentes |

## 13. Azure

En Azure, **Microsoft Purview Unified Catalog**. Según *COMMENT* y *Learn about Microsoft Purview Unified Catalog* (no ejecutado):

| | PostgreSQL | Purview Unified Catalog |
|---|---|---|
| De negocio | Comentarios | Glossary terms y critical data elements |
| Organización | Esquemas | Governance domains y data products |

## 14. Buenas prácticas

- Técnica automática; de negocio con dueño y requisito de publicación.
- Descripciones que digan lo que el nombre no dice (unidad, impuestos, origen).
- La metadata de negocio, versionada con el código.
- **Seguridad:** la metadata puede revelar datos sensibles (nombres de columnas, ejemplos); se controla igual que el acceso.
- **Observabilidad:** cobertura medida y publicada; metadata operativa (frescura, tests) junto a la de negocio.
- **Costo:** escribir metadata cuesta tiempo de los dueños; empezar por las tablas más consumidas.

## 15. Errores frecuentes

- Descripciones que repiten el nombre (`monto: el monto`).
- Metadata de negocio fuera del alcance de quien consulta (en un wiki aparte).
- No medir la cobertura.

## 16. Trade-offs

Exigir metadata completa mejora el uso y frena la publicación. Guardarla junto al dato (comentarios) la mantiene cerca del cambio; en el catálogo es más rica y puede quedar desactualizada respecto de la fuente.

## 17. Conceptos relacionados

- `data-catalog`: dónde se publica.
- `data-lineage`: metadata operativa.
- `schema-change-detection`: cambios en la técnica.
- `data-contracts`: metadata acordada.
- `dataplex-governance`: aspects en Knowledge Catalog.

## 18. Preguntas técnicas abiertas

1. ¿Qué columnas de tu tabla más usada tienen un significado que su nombre no dice?
2. ¿Dónde vive hoy la metadata de negocio?
3. ¿Mides la cobertura?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- PostgreSQL 17: *COMMENT*, *9.27. System Information Functions and Operators* y *35.17. columns*.
- Google Cloud: *About metadata in Knowledge Catalog*.
- AWS: *Data discovery and cataloging in AWS Glue*.
- Microsoft Learn: *Learn about Microsoft Purview Unified Catalog*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-17a.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-17a).

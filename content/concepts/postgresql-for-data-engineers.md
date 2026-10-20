---
id: concept:postgresql-for-data-engineers
slug: postgresql-for-data-engineers
type: concept
title: PostgreSQL para Data Engineers
description: "Lo que un equipo de datos usa de PostgreSQL 17 según su documentación: particionado declarativo con poda en el plan, COPY para cargas en bloque, EXPLAIN para leer planes, índices como BRIN para tablas grandes ordenadas, MERGE para upserts y decodificación lógica del WAL para CDC. Ejemplo ejecutado en la CI contra postgres:17: carga con COPY, poda de particiones y un MERGE idempotente. Cloud SQL, RDS y Azure Database for PostgreSQL como origen de CDC, con sus diferencias."
domain: open-data-stack
subdomain: transformation-and-storage
category: open-data-stack
classification: core
level: intermediate
importance: medium
cloud: [agnostic]
technologies: [postgresql, gcp-cloud-sql, aws-rds, python]
tags: [postgresql, partitioning, copy, explain, merge, logical-decoding, cdc]
related_topics: [change-data-capture]
sources:
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/ddl-partitioning.html
    accessed: 2026-10-20
    page_title: "5.12. Table Partitioning"
    note: "Table Partitioning (PostgreSQL 17): particionar es dividir una tabla lógicamente grande en piezas físicas más chicas; mejora consultas cuando las filas más usadas están en una partición, y las cargas y borrados masivos se hacen agregando o quitando particiones (DROP TABLE o DETACH PARTITION es mucho más rápido que una operación masiva). La poda de particiones (partition pruning) hace que el planner excluya del plan las particiones que no pueden tener filas que cumplan el WHERE; se ve con EXPLAIN."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-copy.html
    accessed: 2026-10-20
    page_title: "PostgreSQL: Documentation: 17: COPY"
    note: "COPY (PostgreSQL 17): «COPY moves data between PostgreSQL tables and standard file-system files»; COPY FROM copia de un archivo a una tabla, agregando a lo que ya tiene, y COPY TO, de una tabla a un archivo."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/using-explain.html
    accessed: 2026-10-20
    page_title: "14.1. Using EXPLAIN"
    note: "Using EXPLAIN (PostgreSQL 17): EXPLAIN muestra el plan que el planner crea para una consulta; el plan es un árbol de nodos; abajo están los nodos de scan, que devuelven filas de una tabla (sequential scans, index scans, bitmap index scans), y arriba los de join, agregación u orden; para analizarlo con programas conviene un formato de salida como JSON."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/brin.html
    accessed: 2026-10-20
    page_title: "64.5. BRIN Indexes"
    note: "BRIN Indexes (PostgreSQL 17): BRIN, Block Range Index, está pensado para tablas muy grandes en las que ciertas columnas se correlacionan con su ubicación física; trabaja por rangos de bloques físicamente contiguos."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-merge.html
    accessed: 2026-10-20
    page_title: "PostgreSQL: Documentation: 17: MERGE"
    note: "MERGE (PostgreSQL 17): modifica filas de la tabla destino a partir de un origen; en una sola sentencia puede hacer INSERT, UPDATE o DELETE según condiciones, algo que de otro modo pediría varias sentencias procedurales."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/logicaldecoding-explanation.html
    accessed: 2026-10-20
    page_title: "47.2. Logical Decoding Concepts"
    note: "Logical Decoding Concepts (PostgreSQL 17): «Logical decoding is the process of extracting all persistent changes to a database's tables into a coherent, easy to understand format»; se implementa decodificando el write-ahead log."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/logical-replication-config.html
    accessed: 2026-10-20
    page_title: "29.11. Configuration Settings"
    note: "Configuration Settings (PostgreSQL 17, replicación lógica): en el publicador, «wal_level must be set to logical»; max_replication_slots debe cubrir las suscripciones esperadas y max_wal_senders al menos lo mismo."
  - source: gcp-datastream-docs
    url: https://docs.cloud.google.com/datastream/docs/configure-cloudsql-psql
    accessed: 2026-10-11
    page_title: "Configure a Cloud SQL for PostgreSQL database for CDC"
    note: "Configure a Cloud SQL for PostgreSQL database for CDC: activar la marca cloudsql.logical_decoding en on (requiere reiniciar la instancia); dar permiso REPLICATION al usuario que crea el slot; crear una publicación, recomendada solo para las tablas a replicar; crear un slot de replicación lógica con el plugin pgoutput (pg_create_logical_replication_slot), con un nombre único por stream; crear un usuario de Datastream con REPLICATION LOGIN y darle lectura sobre las tablas."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.FeatureSupport.LogicalReplication.html
    accessed: 2026-10-12
    page_title: "Performing logical replication for Amazon RDS for PostgreSQL"
    note: "Performing logical replication for RDS for PostgreSQL: se activa con el parámetro estático rds.logical_replication = 1, que también ajusta wal_level, max_wal_senders, max_replication_slots y max_connections; aumenta la generación de WAL, así que se activa solo si se usan slots lógicos; requiere reiniciar la instancia."
  - source: azure-postgresql-docs
    url: https://learn.microsoft.com/en-us/azure/postgresql/configure-maintain/concepts-logical
    accessed: 2026-10-20
    page_title: "Logical replication and logical decoding in Azure Database for PostgreSQL flexible server"
    note: "Logical replication and logical decoding (Azure Database for PostgreSQL): soporta la replicación lógica nativa, la extensión pglogical y la decodificación lógica del WAL; las dos usan el WAL como fuente de cambios y slots de replicación lógica, y no replican cambios de DDL."
relations:
  - type: RELATED_TO
    target: change-data-capture
    note: La decodificación lógica es la base del CDC en PostgreSQL.
  - type: RELATED_TO
    target: partitioning
    note: Particionado en general.
  - type: RELATED_TO
    target: partition-pruning
    note: La poda de particiones en el plan.
  - type: RELATED_TO
    target: query-plans
    note: Leer un plan con EXPLAIN.
  - type: RELATED_TO
    target: sql-merge
    note: MERGE en SQL.
  - type: RELATED_TO
    target: upsert
    note: El MERGE del ejemplo es un upsert idempotente.
  - type: RELATED_TO
    target: database-ingestion
    note: PostgreSQL como origen de una ingesta.
created_at: 2026-10-20
updated_at: 2026-10-20
last_verified: 2026-10-20
verification_status: review_required
---

## 1. Resumen

PostgreSQL aparece en casi todo pipeline: como origen de datos de una aplicación, como base de metadatos de herramientas (Airflow, por ejemplo) o como destino chico. Para un equipo de datos, seis funciones pesan más:

- **particionado declarativo**, con **poda** de particiones en el plan;
- **`COPY`** para cargar o exportar en bloque;
- **`EXPLAIN`** para leer el plan;
- **índices** adecuados, como BRIN para tablas grandes cuyos datos llegan en orden;
- **`MERGE`** para upserts en una sola sentencia;
- **decodificación lógica** del WAL, la base del CDC.

## 2. Qué es

- **Tabla particionada:** una tabla lógica repartida en particiones por rango, lista o hash.
- **Poda de particiones:** el planner excluye las particiones que no pueden tener filas del `WHERE`.
- **`COPY`:** mueve datos entre una tabla y un archivo o un stream.
- **BRIN:** índice por rangos de bloques, chico, útil cuando la columna se correlaciona con el orden físico (por ejemplo, la fecha de inserción).
- **`MERGE`:** `INSERT`, `UPDATE` o `DELETE` según condiciones, en una sentencia.
- **WAL y decodificación lógica:** el registro de cambios y su traducción a cambios por fila.

## 3. Problema que resuelve

Una tabla de ventas de una aplicación crece a cientos de millones de filas. Las consultas por mes leen toda la tabla, borrar los datos viejos bloquea horas y la carga al warehouse hace un `SELECT *` cada noche. Con particiones por mes, la consulta lee solo su mes y borrar un mes es quitar una partición. Con `COPY` la exportación es en bloque, y con decodificación lógica el warehouse recibe solo los cambios.

## 4. Cómo funciona

1. La tabla se crea `PARTITION BY RANGE (fecha)` con una partición por mes.
2. `COPY ... FROM STDIN` carga filas en bloque; cada fila va a su partición.
3. `EXPLAIN` muestra que una consulta por octubre solo recorre la partición de octubre.
4. Un `MERGE` actualiza o inserta los totales en una tabla de resumen; repetirlo deja lo mismo.
5. Para CDC, un slot de replicación lógica entrega los cambios del WAL a un consumidor (por ejemplo, Debezium o Datastream).

## 5. Cuándo utilizarlo

- Tablas grandes con un criterio claro de consulta y de borrado (fecha): particionado.
- Cargas o exportaciones masivas: `COPY` antes que `INSERT` fila por fila.
- Upserts en tablas de resumen: `MERGE` o `INSERT ... ON CONFLICT`.
- CDC desde la base de una aplicación: decodificación lógica.

## 6. Cuándo no utilizarlo

- PostgreSQL como data warehouse de grandes volúmenes analíticos: es una base transaccional.
- Particionar tablas chicas: suma complejidad sin ganancia.
- Activar la replicación lógica sin necesidad: en RDS, aumenta la generación de WAL.

## 7. Ejemplo sencillo

Cuatro ventas, una de septiembre y tres de octubre, cargadas con `COPY` en una tabla particionada por mes. La consulta de octubre solo recorre `ventas_2026_10`. Un `MERGE` arma el resumen de octubre (`norte` 40, `sur` 10); correrlo dos veces deja lo mismo.

## 8. Ejemplo de producción

La base de pedidos de una aplicación, como origen del lake:

- `pedidos` particionada por mes; las particiones de más de dos años se separan con `DETACH PARTITION` y se archivan;
- índice BRIN sobre `created_at`, que llega en orden;
- un slot de replicación lógica para que Datastream o Debezium lleven los cambios al lake;
- monitoreo del tamaño del WAL retenido por el slot.

## 9. Arquitectura

```mermaid
flowchart LR
  A["Aplicación"] --> T["ventas (particionada)<br/>2026_09 · 2026_10"]
  L["COPY FROM STDIN"] --> T
  Q["SELECT … WHERE fecha >= oct"] -. "poda: solo 2026_10" .-> T
  T -- "MERGE" --> R["resumen"]
  T -- "WAL → decodificación lógica" --> C["CDC: Datastream / Debezium"]
```

## 10. Código

```python
# Python 3.12 y psycopg 3 contra PostgreSQL 17 (ejecutado en la CI con el servicio postgres:17; mypy --strict sin
# errores): una tabla particionada por mes, carga con COPY, poda de particiones en el plan y un MERGE idempotente.
# PG_DSN apunta a una base vacía que el test crea y borra.
from __future__ import annotations

import json
import os
from datetime import date

import psycopg

SALES = [(1, "norte", date(2026, 9, 30), 40), (2, "norte", date(2026, 10, 1), 25),
         (3, "sur", date(2026, 10, 2), 10), (4, "norte", date(2026, 10, 2), 15)]

with psycopg.connect(os.environ["PG_DSN"], autocommit=True) as conn:
    conn.execute("""
        CREATE TABLE ventas (id int, tienda text, fecha date, monto int) PARTITION BY RANGE (fecha);
        CREATE TABLE ventas_2026_09 PARTITION OF ventas FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
        CREATE TABLE ventas_2026_10 PARTITION OF ventas FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
        CREATE TABLE resumen (tienda text PRIMARY KEY, total int NOT NULL);
    """)
    with conn.cursor() as cur, cur.copy("COPY ventas (id, tienda, fecha, monto) FROM STDIN") as copy:
        for row in SALES:   # COPY carga filas en bloque, sin un INSERT por fila
            copy.write_row(row)
    conn.execute("ANALYZE ventas")

    plan = conn.execute("EXPLAIN (FORMAT JSON) SELECT sum(monto) FROM ventas WHERE fecha >= '2026-10-01'").fetchone()
    scanned = sorted({n for n in json.dumps(plan).split('"') if n.startswith("ventas_")})
    print(f"particiones en el plan: {scanned}")   # poda: la de septiembre no se lee

    merge = """
        MERGE INTO resumen AS r
        USING (SELECT tienda, sum(monto)::int AS total FROM ventas WHERE fecha >= '2026-10-01' GROUP BY tienda) AS s
        ON r.tienda = s.tienda
        WHEN MATCHED THEN UPDATE SET total = s.total
        WHEN NOT MATCHED THEN INSERT (tienda, total) VALUES (s.tienda, s.total)
    """
    for _ in range(2):   # correrlo dos veces deja lo mismo: idempotente
        conn.execute(merge)
    print(f"resumen de octubre: {conn.execute('SELECT tienda, total FROM resumen ORDER BY tienda').fetchall()}")
```

El script se **ejecuta en la CI contra el servicio postgres:17**, en una base vacía que el test crea y borra, y pasa `mypy --strict`. Imprime `particiones en el plan: ['ventas_2026_10']` y `resumen de octubre: [('norte', 40), ('sur', 10)]`. La decodificación lógica **no se ejecutó**: necesita `wal_level=logical` (*29.11. Configuration Settings*), y el PostgreSQL de la CI corre con `replica`.

## 11. GCP

En GCP, **Cloud SQL para PostgreSQL** como origen de CDC. Según *Configure a Cloud SQL for PostgreSQL database for CDC* (no ejecutado):

| | PostgreSQL propio | Cloud SQL para PostgreSQL |
|---|---|---|
| Activar la decodificación lógica | `wal_level=logical` en la configuración | Marca `cloudsql.logical_decoding` en `on`, con reinicio de la instancia |
| Qué se crea | Publicación y slot lógico | Una publicación para las tablas a replicar y un slot con el plugin `pgoutput`, uno por stream |

## 12. AWS

En AWS, **Amazon RDS para PostgreSQL**. Según *Performing logical replication for Amazon RDS for PostgreSQL* (no ejecutado):

| | PostgreSQL propio | RDS para PostgreSQL |
|---|---|---|
| Activar | `wal_level=logical` | Parámetro estático `rds.logical_replication = 1`, que ajusta `wal_level` y los límites de slots y senders, con reinicio |
| Advertencia | — | Aumenta la generación de WAL: activarlo solo si se usan slots lógicos |

## 13. Azure

En Azure, **Azure Database for PostgreSQL**. Según *Logical replication and logical decoding in Azure Database for PostgreSQL flexible server* (no ejecutado):

| | PostgreSQL propio | Azure Database for PostgreSQL |
|---|---|---|
| Métodos | Replicación lógica nativa y decodificación lógica | Los dos, más la extensión pglogical |
| Qué no se replica | DDL | Igual: ni la replicación lógica ni la decodificación replican DDL |

## 14. Buenas prácticas

- Particionar por la columna por la que se consulta y se borra, y comprobar la poda con `EXPLAIN`.
- `COPY` para cargas masivas; `MERGE` o `ON CONFLICT` para upserts idempotentes.
- Índices según el patrón de acceso; BRIN para columnas que crecen en orden.
- **Seguridad:** el usuario de CDC con permiso de replicación y acceso solo a sus tablas.
- **Observabilidad:** planes de las consultas críticas y WAL retenido por los slots.
- **Costo:** un slot sin consumidor retiene WAL y llena el disco; en servicios administrados, eso es almacenamiento cobrado.

## 15. Errores frecuentes

- Un slot de replicación abandonado que retiene WAL.
- `WHERE` sobre una expresión de la columna de partición que impide la poda.
- Cargar con `INSERT` fila por fila.
- Esperar que el CDC lleve los cambios de esquema (DDL): no lo hace.

## 16. Trade-offs

Particionar acelera consultas y borrados por la clave de partición y complica las que no la usan. `COPY` es rápido y menos flexible que `INSERT` con lógica. La decodificación lógica da cambios en tiempo casi real, a cambio de WAL retenido y de una pieza más que operar.

## 17. Conceptos relacionados

- `change-data-capture`: CDC en general.
- `partitioning`: particionado.
- `partition-pruning`: poda de particiones.
- `query-plans`: leer un plan.
- `sql-merge`: `MERGE` en SQL.
- `upsert`: escrituras idempotentes.
- `database-ingestion`: PostgreSQL como origen.

## 18. Preguntas técnicas abiertas

1. ¿Qué tabla de tu base de origen se beneficiaría de particiones por fecha?
2. ¿Tienes slots de replicación y sabes cuánto WAL retienen?
3. ¿Cómo cargas hoy los datos masivos en PostgreSQL?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- PostgreSQL 17: *5.12. Table Partitioning*, *PostgreSQL: Documentation: 17: COPY*, *14.1. Using EXPLAIN*, *64.5. BRIN Indexes*, *PostgreSQL: Documentation: 17: MERGE*, *47.2. Logical Decoding Concepts* y *29.11. Configuration Settings*.
- Google Cloud: *Configure a Cloud SQL for PostgreSQL database for CDC*.
- AWS: *Performing logical replication for Amazon RDS for PostgreSQL*.
- Microsoft Learn: *Logical replication and logical decoding in Azure Database for PostgreSQL flexible server*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-20. `review_required`: pendiente de revisión B-F3.1 del lote F3b-20a.

## 22. Historial de cambios importantes

- 2026-10-20: creación (lote F3b-20a).

---
id: concept:python-database-io
slug: python-database-io
type: concept
title: Lectura y escritura en bases de datos
description: "Leer y escribir en PostgreSQL desde Python con psycopg 3: consultas parametrizadas para evitar inyección SQL, carga con COPY a una tabla de staging y upsert idempotente en una transacción, lectura en flujo con un cursor de servidor, y cómo cambia la autenticación en Cloud SQL, RDS y Azure Database for PostgreSQL."
domain: python
subdomain: python-use-cases
category: python
classification: core
level: intermediate
importance: medium
cloud: [gcp, aws, azure, agnostic]
technologies: [python, postgresql, gcp-cloud-sql, aws-rds]
tags: [python, database, postgresql, psycopg, copy]
related_topics: [upsert, idempotency, batch-ingestion]
sources:
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/basic/params.html
    accessed: 2026-10-08
    note: "psycopg 3 (documentación sin URL por versión; ejecutado con 3.3.6): pasar valores como parámetros (%s, %(name)s) y no formatear la consulta como cadena; el formateo de cadenas falla con valores como O'Reilly y, con datos de fuentes no confiables, abre la puerta a la inyección SQL. Psycopg convierte objetos de Python a valores SQL."
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/basic/copy.html
    accessed: 2026-10-08
    note: "COPY es una de las formas más eficientes de cargar datos en la base; Cursor.copy() con COPY ... FROM STDIN y write_row() dentro de un bloque with; la operación termina al salir del bloque; la conexión sigue el comportamiento transaccional normal."
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/basic/usage.html
    accessed: 2026-10-08
    note: "Al salir del bloque with de la conexión, si hay una transacción abierta se confirma; si se lanzó una excepción en el bloque, se revierte; en ambos casos la conexión se cierra."
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/basic/transactions.html
    accessed: 2026-10-08
    note: "conn.transaction() abre un bloque de transacción: al salir se confirma, o se revierte si se lanzó una excepción dentro del bloque."
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/advanced/cursors.html
    accessed: 2026-10-08
    note: "Los cursores del lado del servidor permiten recuperar por partes conjuntos de resultados grandes, aunque pueden rendir menos en el uso cotidiano; con un cursor de servidor, la consulta no se procesa necesariamente completa y el servidor produce resultados a medida que se piden."
  - source: psycopg-docs
    url: https://www.psycopg.org/psycopg3/docs/api/cursors.html
    accessed: 2026-10-08
    note: "ServerCursor.itersize: número de registros que se piden por vez al iterar el cursor (100 por defecto), para reducir los viajes al servidor. rowcount: número de registros afectados por la operación que produjo el resultado actual."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-copy.html
    accessed: 2026-10-08
    note: "PostgreSQL 17 (ejecutado contra 17.11): COPY mueve datos entre tablas y archivos; COPY FROM agrega los datos a lo que ya hay en la tabla."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-insert.html
    accessed: 2026-10-08
    note: "ON CONFLICT especifica una acción alternativa a lanzar el error por violación de una restricción única o de exclusión."
  - source: postgresql-docs
    url: https://www.postgresql.org/docs/17/sql-createtable.html
    accessed: 2026-10-08
    note: "TEMPORARY: la tabla se crea como temporal y se elimina automáticamente al final de la sesión (o de la transacción, según ON COMMIT)."
  - source: gcp-cloud-sql-docs
    url: https://docs.cloud.google.com/sql/docs/postgres/connect-connectors
    accessed: 2026-10-08
    note: "Los Cloud SQL Connectors son bibliotecas que dan cifrado y autorización basada en IAM al conectar con una instancia de Cloud SQL; no crean una ruta de red si no existe. Otras formas de conectar son un cliente de base de datos o el Cloud SQL Auth Proxy; con connector enforcement, Cloud SQL rechaza las conexiones directas y solo acepta el Auth Proxy o los Language Connectors. El Cloud SQL Python Connector admite para PostgreSQL los drivers pg8000 y asyncpg, y se autentica con Application Default Credentials."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html
    accessed: 2026-10-08
    note: "Con la autenticación IAM de RDS no se usa contraseña sino un token de autenticación que RDS genera a pedido con AWS Signature Version 4; cada token dura 15 minutos."
  - source: aws-rds-docs
    url: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.Connecting.Python.html
    accessed: 2026-10-08
    note: "Ejemplo de conexión con Python: el cliente rds de Boto3 genera el token con generate_db_auth_token(DBHostname, Port, DBUsername, Region) y el token se pasa como contraseña."
  - source: microsoft-learn
    url: https://learn.microsoft.com/en-us/azure/postgresql/connectivity/connect-python
    accessed: 2026-10-08
    note: "Azure Database for PostgreSQL con Python y psycopg: dos métodos, autenticación de Microsoft Entra (sin contraseña, con azure-identity y DefaultAzureCredential) y autenticación de PostgreSQL; el ejemplo advierte que los tokens de Microsoft Entra ID tienen vida limitada (24 horas por defecto) y que el código de ejemplo no es apto para producción tal cual."
relations:
  - type: RELATED_TO
    target: upsert
    note: INSERT ... ON CONFLICT es el upsert de PostgreSQL que usa el ejemplo.
  - type: RELATED_TO
    target: idempotency
    note: Staging más upsert que solo actualiza filas distintas hace que re-ejecutar no cambie nada.
  - type: RELATED_TO
    target: batch-ingestion
    note: COPY a staging es la forma eficiente de cargar un lote en PostgreSQL.
  - type: RELATED_TO
    target: python-context-managers
    note: Conexión, transacción, cursor y COPY se usan como bloques with.
  - type: RELATED_TO
    target: sql-merge
    note: MERGE es la alternativa estándar al upsert con ON CONFLICT.
created_at: 2026-10-08
updated_at: 2026-10-11
last_verified: 2026-10-09
verification_status: verified
---

## 1. Resumen

Leer y escribir en una base relacional desde Python es parte de casi todo pipeline. Con PostgreSQL y psycopg 3, cuatro prácticas cubren lo esencial:

- **parámetros**, nunca SQL armado con cadenas;
- **COPY** para cargar lotes a una tabla de staging;
- un **upsert en una transacción**, que deja el destino idempotente;
- un **cursor de servidor** para leer resultados grandes en partes.

En la nube cambia sobre todo la autenticación: tokens de IAM o de Microsoft Entra en lugar de contraseñas fijas.

## 2. Qué es

- **Conexión:**
  - `psycopg.connect(dsn)`;
  - usada con `with`, confirma al salir o revierte si hubo excepción, y luego cierra;
  - `conn.transaction()` delimita un bloque atómico dentro de la conexión.
- **Parámetros:** `execute("... WHERE tienda = %s", (valor,))`. El driver convierte el valor a SQL de forma segura.
- **COPY:** `cursor.copy("COPY tabla (...) FROM STDIN")` con `write_row()`. Es una de las formas más eficientes de cargar en PostgreSQL.
- **Cursor de servidor:**
  - `conn.cursor(name=...)`;
  - el resultado queda en el servidor y se pide de a `itersize` filas al iterar (100 por defecto).

## 3. Problema que resuelve

Los fallos típicos al hablar con bases de datos desde Python:

- inyección SQL o errores con comillas al armar consultas;
- cargas fila a fila que tardan horas;
- cargas a medias que dejan el destino inconsistente;
- re-ejecuciones que duplican;
- lecturas que traen millones de filas a la memoria del proceso.

Las cuatro prácticas resuelven uno a uno esos fallos.

## 4. Cómo funciona

1. **Staging:** una tabla (temporal o permanente) con la forma del destino recibe el lote completo con COPY.
2. **Upsert en una transacción:** `INSERT INTO destino SELECT * FROM staging ON CONFLICT (clave) DO UPDATE ... WHERE (columnas) IS DISTINCT FROM (EXCLUDED...)`.
   - Inserta lo nuevo y actualiza solo lo que cambió.
   - Si algo falla, la transacción se revierte entera.
3. **Idempotencia:** volver a cargar el mismo lote no inserta ni actualiza nada; `rowcount` es 0.
4. **Lectura grande:** con un cursor con nombre, el servidor no entrega todo de una vez. El cliente itera pidiendo de a `itersize` filas.
5. **Credenciales:** el DSN o el token vienen del entorno o de un gestor de secretos al iniciar. Nunca del código.

## 5. Cuándo utilizarlo

- Cargar lotes a una base operacional o a un PostgreSQL usado como warehouse pequeño.
- Leer tablas de origen en extracciones batch, cuando no hay CDC.
- Mantener tablas de control (watermarks, manifiestos, estado de ejecuciones).

## 6. Cuándo no utilizarlo

- Para cargar a un warehouse en la nube (BigQuery, Redshift, Synapse): sus mecanismos de carga desde archivos son más eficientes que pasar filas por un driver.
- Para extraer cambios continuos de una base OLTP: CDC basado en log es más completo y menos invasivo (ver `change-data-capture`).
- Para consultas analíticas pesadas sobre la base de producción: compiten con la aplicación.

## 7. Ejemplo sencillo

```python
import os

import psycopg

with psycopg.connect(os.environ.get("PG_DSN", "postgresql://dekh:dekh@localhost:54329/dekh")) as conn:
    fila = conn.execute("SELECT %s::int + %s::int AS suma", (2, 3)).fetchone()
    print(fila)   # (5,)
```

## 8. Ejemplo de producción

Cada hora, un job:

1. extrae los pedidos nuevos o modificados de un sistema de origen;
2. los carga con COPY a `stg_pedidos`;
3. hace el upsert en `pedidos` dentro de una transacción, actualizando solo las filas que cambiaron.

Si el job cae a mitad, la transacción se revierte y la próxima ejecución recarga el mismo lote sin duplicar. El DSN no tiene contraseña: el job obtiene al iniciar un token de corta duración de la identidad de la plataforma. Un reporte nocturno lee la tabla completa con un cursor de servidor y escribe el resultado en flujo a un archivo.

## 9. Arquitectura

```mermaid
flowchart LR
  L[Lote extraído] -->|COPY FROM STDIN| S[(stg_ventas)]
  subgraph TX[Transacción]
    S -->|INSERT ... ON CONFLICT DO UPDATE<br/>WHERE IS DISTINCT FROM| D[(ventas)]
  end
  D -->|cursor de servidor, itersize| R[Lectura en flujo]
  A[Token IAM / Entra / secreto] -.-> L
```

## 10. Código

```python
# Python 3.12, psycopg 3.3.6 y PostgreSQL 17 local (ejecutado; mypy --strict sin errores): carga con COPY
# a una tabla de staging, upsert idempotente en una transacción y lectura en flujo con un cursor de servidor.
import os

import psycopg

DSN = os.environ.get("PG_DSN", "postgresql://dekh:dekh@localhost:54329/dekh")   # en producción: desde un gestor de secretos
FILAS = [("v1", "T1", 120), ("v2", "T2", 40), ("v3", "T1", None), ("v4", "O'Higgins", 75)]

with psycopg.connect(DSN) as conn:                   # al salir del with: commit, o rollback si hubo excepción
    conn.execute("CREATE TEMP TABLE ventas (venta_id text PRIMARY KEY, tienda text NOT NULL, monto bigint)")
    conn.execute("CREATE TEMP TABLE stg_ventas (LIKE ventas)")

    def cargar(filas: list[tuple[str, str, int | None]]) -> int:
        with conn.transaction():                     # staging + upsert: todo o nada
            conn.execute("TRUNCATE stg_ventas")
            with conn.cursor() as cur:
                with cur.copy("COPY stg_ventas (venta_id, tienda, monto) FROM STDIN") as copy:
                    for fila in filas:
                        copy.write_row(fila)         # COPY: una de las formas más eficientes de cargar en PostgreSQL
                cur.execute(
                    """INSERT INTO ventas SELECT * FROM stg_ventas
                       ON CONFLICT (venta_id) DO UPDATE SET tienda = EXCLUDED.tienda, monto = EXCLUDED.monto
                       WHERE (ventas.tienda, ventas.monto) IS DISTINCT FROM (EXCLUDED.tienda, EXCLUDED.monto)"""
                )
                return cur.rowcount

    print(cargar(FILAS), cargar(FILAS))              # 4 0: re-ejecutar no duplica ni reescribe filas iguales
    print(cargar([("v3", "T1", 10)]))                # 1: solo cambia la fila corregida

    tienda = "O'Higgins"                             # parámetro, nunca formateo de cadenas: sin inyección SQL
    print(conn.execute("SELECT venta_id FROM ventas WHERE tienda = %s", (tienda,)).fetchall())   # [('v4',)]

    with conn.cursor(name="lector") as cur:          # cursor con nombre: el resultado queda en el servidor
        cur.itersize = 2                             # filas pedidas por viaje de red al iterar
        cur.execute("SELECT venta_id, monto FROM ventas ORDER BY venta_id")
        print([fila for fila in cur])                # [('v1', 120), ('v2', 40), ('v3', 10), ('v4', 75)]
```

Se ejecutó contra PostgreSQL 17.11 local con psycopg 3.3.6 y pasó `mypy --strict`. Las tablas son temporales: desaparecen al cerrar la sesión y no tocan nada del esquema de la base. La segunda carga del mismo lote devuelve `rowcount` 0, y la corrección de `v3` actualiza una sola fila. El valor con comilla (`O'Higgins`) viaja como parámetro.

## 11. GCP

Para **Cloud SQL**, los Cloud SQL Language Connectors dan cifrado y autorización basada en IAM. No crean la ruta de red: esa tiene que existir. El conector de Python se autentica con Application Default Credentials, y para PostgreSQL admite los drivers **pg8000** y **asyncpg**, no psycopg. El código de esta ficha, que usa psycopg, necesita otra vía de conexión, o pasar a uno de esos drivers. Una opción es el Cloud SQL Auth Proxy. Otra es una conexión directa, salvo que la instancia tenga *connector enforcement*, que rechaza las conexiones directas.

## 12. AWS

Con la autenticación IAM de **Amazon RDS** no se usa contraseña sino un token que RDS genera a pedido, firmado con AWS Signature Version 4, que dura **15 minutos**. En Python, el cliente `rds` de Boto3 lo genera con `generate_db_auth_token(...)` y se pasa como contraseña al conectar. Un job largo tiene que generar un token nuevo para cada conexión que abra después de que venza.

## 13. Azure

**Azure Database for PostgreSQL** admite autenticación de Microsoft Entra, sin contraseña, con `azure-identity` y `DefaultAzureCredential`, o autenticación de PostgreSQL. El ejemplo de la documentación usa psycopg y advierte que los tokens de Microsoft Entra ID tienen vida limitada (24 horas por defecto). También aclara que el código de ejemplo no es apto para producción tal cual. Diferencia con RDS: la vida del token es mucho mayor, pero igual hay que renovarlo en procesos largos.

## 14. Buenas prácticas

- Parámetros siempre; para nombres de tablas o columnas dinámicos, `psycopg.sql.Identifier`, nunca formateo de cadenas.
- COPY a staging y upsert en una transacción para cargas por lote.
- `IS DISTINCT FROM` en el `WHERE` del upsert para no reescribir filas iguales.
- Cursor de servidor para lecturas grandes; `fetchall()` solo para resultados pequeños.
- Una conexión por proceso o un pool, con `with`; nunca conexiones abiertas sin cerrar.
- **Seguridad:** credenciales de corta duración (IAM, Entra) o desde un gestor de secretos; usuario con permisos mínimos (escritura solo sobre staging y destino); TLS en la conexión; parámetros contra la inyección SQL.
- **Observabilidad:** registrar filas cargadas a staging, insertadas y actualizadas (`rowcount`) por lote, y la duración de la transacción; una transacción larga bloquea a otros procesos.
- **Costo:** COPY y upsert por lote reducen tiempo de cómputo y carga sobre la base frente a inserciones fila a fila; leer en flujo evita sobredimensionar la memoria del job.

## 15. Errores frecuentes

- `f"... WHERE id = '{valor}'"`: inyección SQL y fallas con comillas.
- `executemany` de `INSERT` fila a fila para millones de filas, en lugar de COPY.
- Upsert sin transacción: un fallo deja el destino a medias.
- `fetchall()` sobre una tabla grande: el proceso se queda sin memoria.
- Contraseñas en el código o en el repositorio.
- Tokens de corta duración generados una vez al inicio de un job que dura horas.

## 16. Trade-offs

COPY a staging más upsert es rápido e idempotente, a cambio de una tabla extra y una transacción que bloquea filas mientras dura. El cursor de servidor ahorra memoria, pero cada vuelta es un viaje al servidor y la transacción queda abierta mientras se lee. Los tokens de corta duración eliminan contraseñas fijas, a cambio de lógica de renovación.

## 17. Conceptos relacionados

- `upsert` y `sql-merge`: la operación en SQL.
- `idempotency`: re-ejecutar sin cambiar el resultado.
- `batch-ingestion`: cargas por lote.
- `python-context-managers`: conexión, transacción y COPY como bloques `with`.
- `database-ingestion`: elegir entre carga completa, incremental por watermark o CDC.

## 18. Preguntas técnicas abiertas

1. ¿Cómo manejarías un lote que viola una restricción en una sola fila sin perder el resto?
2. ¿Qué tamaño de `itersize` elegirías y cómo lo medirías?
3. En tu plataforma, ¿cómo renovarías el token de la base en un job que dura más que su vida útil?

## 19. Laboratorio relacionado

Pendiente (F4).

## 20. Fuentes

- psycopg 3: *Passing parameters to SQL queries*, *Using COPY TO and COPY FROM*, *Basic module usage*, *Transactions management*, *Cursor types* y *Cursor classes*.
- PostgreSQL 17: *COPY*, *INSERT* y *CREATE TABLE*.
- Google Cloud: *Connect using Cloud SQL Language Connectors*.
- AWS: *IAM database authentication* y *Connecting using IAM authentication and the AWS SDK for Python*.
- Microsoft Learn: *Connect to Azure Database for PostgreSQL with Python*.

El detalle de cada fuente está en `sources` del frontmatter.

## 21. Fecha de última verificación

2026-10-09. Pasa a `verified`: revisión B-F3.1 del lote F3b-03b aplicada, sin VERIFY pendientes.

## 22. Historial de cambios importantes

- 2026-10-08: creación (lote F3b-03b).
- 2026-10-09: revisión B-F3.1 del lote F3b-03b aplicada (docs/reviews/cards-f3b-03b.md): filas aprobadas sin cambios en esta ficha.
- 2026-10-09: `verification_status: verified` (sin VERIFY pendientes).
- 2026-10-11: §17 enlaza `database-ingestion`, que ya tiene ficha (lote F3b-05a); antes figuraba como pendiente de ficha.

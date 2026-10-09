# Revisión B-F3.1 · Lote F3b-03b

Fichas en `content/concepts/`. Carril B no las edita. Felipe aprobó todas las filas el 2026-10-09, incluidas las tres propuestas: decir en `pyspark-dataframes` que el §10 no se pasó por `mypy --strict`; citar la página de comparación para el nombre anterior (Dataproc on Compute Engine y Google Cloud Serverless for Apache Spark) y quitar «el mismo código de PySpark corre en las dos modalidades»; en `python-concurrency`, publicar solo la medición de 0.5 s de esta máquina en el asyncio. Las once siguen en `review_required` hasta que Carril A aplique la revisión. No hay comentarios `VERIFY`.

Las 11: `python-decorators`, `python-concurrency`, `python-dataframes`, `arrow-columnar-memory` (`modern`), `http-clients`, `data-apis-with-fastapi` (`modern`), `beam-programming-model` (`modern`), `pyspark-dataframes` (`modern`), `python-file-processing`, `python-database-io` y `python-pipeline-structure` (pattern).

El 2026-10-09 contrasté las páginas que Claude Code marcó (Cloud SQL Python Connector, la guía Java de Managed Flink, Managed Service for Apache Spark, el aviso de `httpx2` en Starlette y el texto de mypy y de los tiempos). No volví a ejecutar los bloques de código.

Propuestas, las tres en las filas de cada ficha:

1. En `pyspark-dataframes`, decir que el §10 no se pasó por `mypy --strict`.
2. Citar la página que dice el nombre anterior (Dataproc on Compute Engine y Google Cloud Serverless for Apache Spark). `clusters-overview` no lo dice. Quitar «el mismo código de PySpark corre en las dos modalidades».
3. En `python-concurrency`, el comentario `# ~0.4s` del asyncio es el cálculo de dos `sleep(0.2)`. La medición de esta máquina es 0.5 s. Dejar una sola cifra publicada: la de esta máquina.

## Criterios heredados del lote 1

| Criterio | Hallazgo | Estado |
|---|---|---|
| §14 con seguridad, observabilidad y costo | Las 11 fichas los traen como viñetas explícitas de §14. | aprobada |
| Ejemplos atómicos e idempotentes | Siete fichas dicen que su §10 pasó `mypy --strict` (`python-decorators`, `python-concurrency`, `http-clients`, `data-apis-with-fastapi`, `python-file-processing`, `python-database-io`, `python-pipeline-structure`). `python-dataframes`, `arrow-columnar-memory` y `beam-programming-model` dicen que no se pasó por `mypy --strict`. `pyspark-dataframes` no lo dice. Propuesta: decirlo en esa ficha. El §10 de PySpark está marcado como ejecutado en la CI (Java 17, `pyspark==4.2.0`), no en local. El §7 dice que es un subconjunto de ese bloque. `os.replace` en `python-file-processing` y `python-pipeline-structure` usa la frase de la documentación: si tiene éxito, el renombrado es atómico, y la operación puede fallar entre sistemas de archivos. | aprobada |
| Relaciones completas | En las 11, cada slug de `related_topics` está en `relations`. Hay relaciones de más; no faltan las declaradas. | aprobada |
| Nivel 4 solo conceptual | No hay fuentes Nivel 4 en estas fichas. Las nuevas del registro (`pandas-docs`, `polars-docs`, `apache-arrow-docs`, `apache-beam-docs`, `fastapi-docs`, `httpx-docs`, `requests-docs`, `gcp-managed-spark-docs`, `aws-emr-docs`, `gcp-cloud-sql-docs`, `aws-rds-docs`) son Nivel 1. | aprobada |
| Atribución de nube y de versión | Las URLs de Python citadas son `/3.12/`. pandas usa `/version/3.0/`, Spark `/docs/4.2.0/`, Beam pydoc `2.77.0` y PostgreSQL `/docs/17/`. Donde la doc no versiona la URL (Polars, HTTPX, FastAPI, Requests, PyArrow, psycopg), la nota dice la versión ejecutada. Donde no hay fuente de una nube, §11–13 lo dicen: Azure en DataFrames, Arrow, Beam y FastAPI; AWS en Arrow y FastAPI. | aprobada |

## `python-decorators`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Qué envuelve, cuándo sí y cuándo no, `functools.wraps` y `ParamSpec`, y §14 están. §11–13 dicen que no aplica de forma específica. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Decoradores, `wraps` y `ParamSpec` están en notas de `/3.12/`. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que pasó `mypy --strict`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Medir duración y reintentar una llamada son un uso habitual. | aprobada |
| Relaciones faltantes | `python-functions`, `python-error-handling-and-retries` y `python-logging` están en `relations`. | aprobada |

## `python-concurrency`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Hilos para E/S, procesos para CPU, asyncio con límite, cuándo sí y cuándo no, y §14 están. §11–13 atribuyen vCPU a la página de cada plataforma. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `ThreadPoolExecutor`, `ProcessPoolExecutor`, `TaskGroup` y el GIL están en notas de `/3.12/`. Lambda (128 MB a 10,240 MB; 1,769 MB = 1 vCPU) y Cloud Run (1 vCPU por defecto) están en las notas de esas páginas. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El párrafo de salida dice «en esta máquina (Windows, 12 núcleos lógicos, Python 3.12.3)» y que los tiempos varían. Los comentarios `# ~1.6s` y `# ~0.2s` coinciden con esa medición y con `sleep(0.2)`. El de asyncio dice `# ~0.4s` (dos tandas de 4) y el párrafo medido dice 0.5 s. Propuesta: publicar solo la cifra de esta máquina y dejar el comentario como el cálculo de dos `sleep(0.2)`. | aprobada |
| Ejemplos poco realistas | Descargar con hilos y hashear con procesos es el corte habitual entre E/S y CPU. | aprobada |
| Relaciones faltantes | `python-api-consumption`, `http-clients` y `python-generators` están en `relations`. | aprobada |

## `python-dataframes`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | pandas frente a Polars, cuándo sí y cuándo no, Copy-on-Write y el tipo `str` de pandas 3.0, y §14 están. §13 dice que no cita una fuente de Azure. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | CoW, el tipo `str` y `chunksize` están en notas de pandas 3.0. El lazy API y el streaming están en notas de Polars 2.0.0. La Storage Read API (Avro o Arrow) y los límites de memoria de Lambda están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La ficha dice que no se pasó por `mypy --strict` porque el resultado depende de los stubs. Ejecutado con pandas 3.0.6 y Polars 2.0.0. No marco otro error. | aprobada |
| Ejemplos poco realistas | Filtrar, deduplicar y agregar ventas por tienda es un uso habitual. | aprobada |
| Relaciones faltantes | `arrow-columnar-memory`, `pyspark-dataframes` y `data-transformation` están en `relations`. | aprobada |

## `arrow-columnar-memory`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Formato columnar, cero copia hacia pandas y Polars, cuándo sí y cuándo no, y §14 están. §12 y §13 dicen que no citan fuente de AWS ni de Azure. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | El formato y `pyarrow` están en notas de la documentación de Arrow. La nota dice PyArrow 25.0.1, la versión ejecutada. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La ficha dice que no se pasó por `mypy --strict` porque depende de los stubs de PyArrow. No marco otro error. | aprobada |
| Ejemplos poco realistas | Pasar una tabla Arrow a pandas y a Polars es el uso habitual del formato. | aprobada |
| Relaciones faltantes | `row-vs-columnar-formats`, `parquet-format` y `python-dataframes` están en `relations`. | aprobada |

## `http-clients`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | HTTPX frente a Requests, timeouts, reintentos, cuándo sí y cuándo no, y §14 están. §11–13 dicen que no aplica de forma específica y remiten a las bibliotecas de cada nube. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | Timeouts y el cliente están en notas de HTTPX 0.28.1 y de Requests 2.34.2. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que pasó `mypy --strict`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un GET con timeout y reintento acotado es un uso habitual. | aprobada |
| Relaciones faltantes | `python-api-consumption`, `python-error-handling-and-retries` y `api-ingestion` están en `relations`. | aprobada |

## `data-apis-with-fastapi`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Validación con Pydantic, `TestClient`, cuándo sí y cuándo no, y §14 están. §12 y §13 dicen que no citan fuente de AWS ni de Azure. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `TestClient` basado en HTTPX está en la nota de la página de testing de FastAPI 0.143.0. El aviso de `httpx2` no se atribuye a esa página: el párrafo de ejecución dice que, con Starlette 1.7.0, importar `TestClient` emite `StarletteDeprecationWarning` pidiendo instalar `httpx2` en lugar de `httpx`, y que los tests igual pasan. La página actual de Starlette dice lo mismo: `TestClient` se apoya en `httpx2` y `httpx` sigue funcionando, con aviso de deprecación. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que pasó `mypy --strict`. El aviso queda como observación de esa corrida, con la versión de Starlette. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un endpoint que valida un cuerpo y un test con `TestClient` es un uso habitual. | aprobada |
| Relaciones faltantes | `data-validation-with-pydantic`, `http-clients` y `testing-with-pytest` están en `relations`. | aprobada |

## `beam-programming-model`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | `PCollection`, ventanas, triggers, cuándo sí y cuándo no, y §14 están. §13 dice que no cita una fuente de Azure sobre un runner administrado. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | El modelo y el DirectRunner están en notas de Beam 2.77.0. Dataflow y Managed Flink están en notas Nivel 1. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La URL citada es `.../managed-flink/latest/java/how-creating-apps-beam.html`. El §12 dice que esa página es la guía para Java y que la ficha no verifica soporte de pipelines Beam en Python. La página habla del runner de Flink, de métricas que no se ven en la consola y de Flink 1.8 o posterior. No afirma el SDK de Python. La ficha dice que no se pasó por `mypy --strict`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un pipeline con ventana y un elemento tarde es el caso habitual del modelo. | aprobada |
| Relaciones faltantes | `batch-vs-streaming`, `late-arriving-data` y `dead-letter-queue` están en `relations`. | aprobada |

## `pyspark-dataframes`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Plan perezoso, acción, ventana, broadcast, cuándo sí y cuándo no, y §14 están. §11–13 citan Managed Spark, EMR, Glue, Databricks y Synapse. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | DataFrame, ventana y broadcast están en notas de Spark 4.2.0. EMR está en nota de `aws-emr-docs`. El nombre «Managed Service for Apache Spark» es el de la documentación actual. La nota y el §11 atribuyen el nombre anterior a `https://docs.cloud.google.com/managed-spark/docs/concepts/clusters-overview`. Esa página describe los clústeres y no dice que el producto se llamara Dataproc. La página de comparación sí: Managed Service for Apache Spark incluye lo que antes era Dataproc on Compute Engine (despliegue en clúster) y Google Cloud Serverless for Apache Spark (despliegue serverless). Las release notes repiten «formerly Dataproc on Compute Engine». Propuesta: citar la página de comparación para el nombre anterior. El §11 añade «el mismo código de PySpark corre en las dos modalidades». Esa frase no está en la página citada ni en la de comparación. Propuesta: dejar la diferencia de despliegue (clúster frente a serverless) y quitar esa frase. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que lo ejecuta la CI con Java 17 y `pyspark==4.2.0`, y que no se ejecutó en local. No hay ninguna frase sobre mypy. Propuesta: decir que no se pasó por `mypy --strict`. | aprobada |
| Ejemplos poco realistas | Quedarse con la última versión por clave y un join con broadcast es un uso habitual. | aprobada |
| Relaciones faltantes | `python-dataframes`, `join-optimization` y `query-plans` están en `relations`. | aprobada |

## `python-file-processing`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | CSV y JSON por partes, escritura atómica, cuándo sí y cuándo no, y §14 están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | `csv`, `json` y `os.replace` están en notas de `/3.12/`. La frase de atomicidad es la de la documentación. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que pasó `mypy --strict`. `os.replace`: si tiene éxito, el renombrado es atómico, y puede fallar entre sistemas de archivos. No marco otro error. | aprobada |
| Ejemplos poco realistas | Leer un CSV por filas y publicar el archivo con `os.replace` es un uso habitual. | aprobada |
| Relaciones faltantes | `python-file-handling`, `file-ingestion` e `idempotency` están en `relations`. | aprobada |

## `python-database-io`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | psycopg, transacciones, `executemany`, cuándo sí y cuándo no, y §14 están. El código contra PostgreSQL local está marcado como ejecutado; las conexiones de nube, como sintaxis documentada. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | psycopg 3.3.6 y PostgreSQL 17 están en notas Nivel 1. El token de RDS (15 minutos) y el de Entra (24 h por defecto, ejemplo no listo para producción) están en las notas de esas páginas. | aprobada |
| Errores técnicos o simplificaciones peligrosas | La página del Cloud SQL Python Connector dice: «The drivers that PostgreSQL supports are pg8000 and asyncpg.» El §11 dice lo mismo y que el ejemplo con psycopg necesita otro camino o esos drivers. No lista psycopg como driver del conector. El §10 dice que pasó `mypy --strict`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un lote con `executemany` dentro de una transacción es un uso habitual. | aprobada |
| Relaciones faltantes | `upsert`, `idempotency` y `batch-ingestion` están en `relations`. | aprobada |

## `python-pipeline-structure`

| Criterio | Hallazgo | Estado |
|---|---|---|
| Preguntas de §48 no respondidas | Extraer, validar, escribir, cuándo sí y cuándo no, y §14 están. | aprobada |
| Afirmaciones sin fuente o con fuente de nivel bajo | El patrón se apoya en `os.replace` y en las fichas de archivo y de pruebas. La frase de atomicidad es la de `/3.12/`. | aprobada |
| Errores técnicos o simplificaciones peligrosas | El §10 dice que pasó `mypy --strict`. No marco otro error. | aprobada |
| Ejemplos poco realistas | Un script que escribe a un temporal y publica con `os.replace` es un uso habitual. | aprobada |
| Relaciones faltantes | `data-pipeline`, `testing-with-pytest` y `python-logging` están en `relations`. | aprobada |

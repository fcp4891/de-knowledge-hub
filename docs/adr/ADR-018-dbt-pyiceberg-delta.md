# ADR-018 — dbt Core y PyIceberg en los tests de snippets; Delta y Hudi sin ejecutar

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Fase:** F3b — Contenido por dominio, dominio 20-open-data-stack (decisiones de Felipe al aprobar el plan de 20)
- **Referencias:** ADR-016 y ADR-017 (Docker y Kafka en la CI), `requirements-snippets.txt`, el servicio postgres:17 de la CI.

## Contexto

20b trata de los formatos de tabla abiertos (Iceberg, Delta Lake, Hudi) y de dbt. Los ejemplos se entienden mejor si corren: un snapshot que se puede leer después, una columna que se agrega sin reescribir archivos, un `dbt build` con modelos y tests. La CI ya tiene PostgreSQL 17 y PySpark 4.2.0.

## Decisión

1. **dbt Core contra el PostgreSQL de la CI.** `dbt-core==1.12.6` y `dbt-postgres==1.11.0` (PyPI, 2026-10-14 y 2026-07-16) en `requirements-snippets.txt`. El ejemplo de `dbt-core-concepts` corre `dbt build` con `dbtRunner` en una base temporal que el test crea y borra. Es dbt Core, la generación en Python que la documentación de dbt mantiene como v1; la generación actual del motor (v2) no se usa.
2. **PyIceberg con catálogo SQLite.** `pyiceberg[sql-sqlite,pyarrow,pyiceberg-core]==0.12.0` (PyPI, 2026-09-01; el extra `pyiceberg-core` hace falta para escribir tablas particionadas): tablas Iceberg con un catálogo SQL en SQLite y datos en una carpeta temporal, sin servicios. En Windows el test se salta, porque PyArrow no abre las rutas `file:///C:/…` que arma el catálogo; en la CI (Linux) corre.
3. **Delta Lake sin ejecutar.** La tabla de compatibilidad de *Releases* de Delta Lake (docs.delta.io, consultada el 2026-10-20) lista Delta 4.3.x con Spark 4.0.x y 4.1.x, y ninguna versión con Spark 4.2. Como la CI usa PySpark 4.2.0 y no se cambia, el código de Delta queda «no ejecutado». PyPI publica `delta-spark` 4.4.1 (2026-10-05) con `pyspark<=4.2.0,>=4.0.1`, pero la tabla de compatibilidad no lo lista; no se usa hasta que la tabla lo diga.
4. **Hudi sin ejecutar**, por decisión del plan.

## Consecuencias

- `make snippets-deps` instala tres paquetes más; la CI tarda algo más en instalar.
- Actualizar dbt o PyIceberg es cambiar la versión fija aquí y en `requirements-snippets.txt`, y volver a correr los tests.
- Si la tabla de compatibilidad de Delta llega a listar Spark 4.2, se puede ejecutar el código de Delta con un ADR que lo registre.

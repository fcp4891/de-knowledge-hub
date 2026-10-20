# ADR-019 — Great Expectations (GX Core) en los tests de snippets

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Fase:** F3b — Contenido por dominio, dominio 15-data-quality (decisión de Felipe al aprobar el plan de 15)
- **Referencias:** ADR-018 (dbt Core y PyIceberg), `requirements-snippets.txt`, `tests/test_quality_snippets.py`.

## Contexto

La ficha `great-expectations-validation` (lote F3b-15b) explica cómo se valida un lote con Great Expectations. Felipe pidió ejecutarla en la CI con una versión fija, siempre que se instale sin conflictos; si chocaba con las dependencias actuales, el código quedaba «no ejecutado».

## Decisión

1. **Versión fija.** `great_expectations==1.24.0` (GX Core; PyPI, 2026-10-07; requiere Python >=3.10,<3.15) en `requirements-snippets.txt`.
2. **Sin conflictos.** Instalado junto con `requirements.txt` y el resto de `requirements-snippets.txt` en un entorno limpio con Python 3.12, `pip check` no reporta dependencias rotas (2026-10-20). GX agrega, entre otros, pandas 3.0.6, numpy 2.5.4, scipy 1.18.1, marshmallow 4.3.1 y altair 6.3.0; ninguno cambia la versión de un paquete ya fijado.
3. **pandas 3 y PySpark.** PySpark 4.2.0 avisa (FutureWarning) que todavía no soporta del todo pandas >= 3.0.0. Ningún snippet de PySpark usa pandas (`toPandas` solo se menciona en texto); los tests de PySpark corren en la CI con pandas presente. Si alguno falla por eso, se revisa este ADR antes de fijar pandas.
4. **Data Context efímero.** El ejemplo usa `gx.get_context(mode="ephemeral")`: la configuración vive en memoria y no se escribe nada en el repositorio.
5. **Fuente sin versión en la URL.** La documentación de GX Core 1.x no publica URLs versionadas (solo la 0.18 tiene `/docs/0.18/`; `/docs/1.24/` y `/docs/1.x/` dan 404). Se cita `docs.greatexpectations.io/docs/core/…` con fecha; las páginas citadas muestran «Version: 1.24.0».
6. **Sin mypy.** GX no declara explícitamente sus exportaciones (`great_expectations.expectations`), así que `mypy --strict` rechaza las clases de expectations; el snippet de GX no pasa por mypy.

## Consecuencias

- `make snippets-deps` instala GX y sus dependencias; la CI tarda algo más en instalar.
- Actualizar GX es cambiar la versión aquí y en `requirements-snippets.txt`, y volver a correr `tests/test_quality_snippets.py`.
- Una diferencia ya encontrada entre la guía y la versión fijada: *Create an Expectation* nombra `get_maximum_severity_failure`, y en 1.24.0 el método es `get_max_severity_failure`. La ficha lo dice.

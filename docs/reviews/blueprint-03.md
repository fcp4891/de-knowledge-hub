# Revisión B-F1b · Dominio 03 Python

Archivo de origen: `content/blueprint/03-python.yaml`. Carril B no lo edita. Solo los cinco conceptos con `mvp: true`. El tope de ~5 de este dominio no se mueve.

| Fila | Slug | Propuesta | Estado |
|---|---|---|---|
| 1 | `data-validation-with-pydantic` | Mantener `modern`, `intermediate`, `high` y `mvp: true`. Agregar `python-api-consumption` y `data-contracts` en `related_concepts`. Nota: valida el payload en el borde; el contrato sigue en `data-contracts`. Typing sigue fuera del MVP. | pendiente |
| 2 | `testing-with-pytest` | Mantener los flags. Agregar `python-api-consumption` y `python-error-handling-and-retries` en `related_concepts`. Nota: la ficha prueba ingesta y transformación, no es un curso de pytest. | pendiente |
| 3 | `python-logging` | Subir `level` a `intermediate`. Siguen `core`, `high` y `mvp: true`. Agregar `python-api-consumption`, `python-error-handling-and-retries` y `observability-logs` en `related_concepts`. Nota: logs estructurados y qué no se loguea van aquí. `observability-logs` (16) sigue fuera del MVP. | pendiente |
| 4 | `python-api-consumption` | Mantener los flags. Agregar `data-validation-with-pydantic`, `python-error-handling-and-retries` y `python-logging` en `related_concepts`. Nota: requests y httpx se detallan en `http-clients`, que sigue fuera del MVP. | pendiente |
| 5 | `python-error-handling-and-retries` | Mantener los flags. Agregar `python-api-consumption` en `related_concepts`. Nota: backoff y jitter están en `retries` (05); aquí va el código (excepciones, timeouts) y cuándo no reintentar. | pendiente |
| 6 | Los cinco MVP | Siguen en `mvp: true`. No se agrega un sexto. | pendiente |

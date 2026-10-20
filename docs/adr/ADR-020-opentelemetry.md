# ADR-020 — OpenTelemetry (API y SDK de Python) en los tests de snippets

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Fase:** F3b — Contenido por dominio, dominio 16-observability (decisión de Felipe al aprobar el plan de 16)
- **Referencias:** ADR-018 y ADR-019, `requirements-snippets.txt`, `tests/test_observability_snippets.py`.

## Contexto

Las fichas de logs, métricas y trazas de 16a se entienden mejor si sus ejemplos corren: un span por etapa de un pipeline, un contador de filas por tabla, un log con el `trace_id` del span activo. Felipe pidió ejecutarlas en la CI con OpenTelemetry, con exporters en memoria y sin collector, siempre que se instalara sin conflictos.

## Decisión

1. **Versiones fijas.** `opentelemetry-api==1.45.1` y `opentelemetry-sdk==1.45.1` (PyPI, 2026-10-06; requieren Python >=3.10) en `requirements-snippets.txt`. El SDK trae `opentelemetry-semantic-conventions==0.66b1`.
2. **Sin conflictos.** Instaladas sobre `requirements.txt` y el resto de `requirements-snippets.txt` con Python 3.12, `pip check` no reporta dependencias rotas (2026-10-20).
3. **Sin collector ni backend.** Las métricas se leen con `InMemoryMetricReader`, que la documentación del SDK describe como útil para tests. Para las trazas se usa un `SpanExporter` propio de pocas líneas que guarda los spans en una lista: el SDK trae `InMemorySpanExporter`, pero la documentación publicada del SDK no lo describe, y se prefiere la interfaz documentada (`SpanExporter.export`).
4. **Fuentes.** Los conceptos se citan de opentelemetry.io (sin versión en la URL); el SDK de Python, de opentelemetry-python.readthedocs.io en `/en/stable/` (la URL con versión, `/en/v1.45.1/`, da 404). Por la regla de CLAUDE.md, las fichas no citan la versión de parche del SDK.

## Consecuencias

- `make snippets-deps` instala tres paquetes más.
- Actualizar OpenTelemetry es cambiar las dos versiones aquí y en `requirements-snippets.txt`, y volver a correr `tests/test_observability_snippets.py`.
- Exportar a un backend real (Cloud Trace, X-Ray, Azure Monitor) queda «no ejecutado» en las fichas.

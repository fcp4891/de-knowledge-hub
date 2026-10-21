# ADR-021 — OpenLineage (cliente de Python) en los tests de snippets

- **Estado:** Aceptado
- **Fecha:** 2026-10-20
- **Fase:** F3b — Contenido por dominio, dominio 17-governance (decisión de Felipe al aprobar el plan de 17)
- **Referencias:** ADR-020 (OpenTelemetry), `requirements-snippets.txt`, `tests/test_governance_snippets.py`.

## Contexto

La ficha `data-lineage` (lote F3b-17a) cubre la vista operativa (de dónde viene una tabla) y la de gobierno (qué se ve afectado si cambia una fuente). Felipe pidió ejecutarla en la CI con el cliente de OpenLineage para Python, con versión fija y transporte a archivo, sin Marquez, siempre que se instalara sin conflictos.

## Decisión

1. **Versión fija.** `openlineage-python==1.54.0` (PyPI, 2026-10-12; requiere Python >=3.10) en `requirements-snippets.txt`. Trae, entre otros, `attrs`, `httpx2`, `pyyaml` y `requests`.
2. **Sin conflictos.** Instalado sobre `requirements.txt` y el resto de `requirements-snippets.txt` con Python 3.12, `pip check` no reporta dependencias rotas (2026-10-20).
3. **Transporte a archivo, sin backend.** El ejemplo configura `{"transport": {"type": "file", "log_file_path": …, "append": True}}`, como muestran *Python* (*Usage*) y *Configuration* de la documentación del cliente; los eventos quedan en un archivo JSON Lines en una carpeta temporal, y el grafo se arma leyendo ese archivo. No se levanta Marquez ni otro servidor.
4. **Fuente.** `openlineage-docs` (openlineage.io/docs). La documentación no publica URLs con versión; las páginas citadas muestran «Version: 1.54.0», la misma versión fijada.

## Consecuencias

- `make snippets-deps` instala un paquete más y sus dependencias.
- Actualizar el cliente es cambiar la versión aquí y en `requirements-snippets.txt`, y volver a correr `tests/test_governance_snippets.py`.
- Enviar los eventos a un backend (Knowledge Catalog, DataZone, SageMaker Unified Studio, Marquez) queda «no ejecutado» en las fichas.

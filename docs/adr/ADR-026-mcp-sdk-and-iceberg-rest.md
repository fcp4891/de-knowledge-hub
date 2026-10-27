# ADR-026 — SDK oficial de MCP y catálogo REST de Iceberg en la CI (dominio 23)

- **Estado:** Aceptado (decisiones de Felipe al aprobar el plan de 23, 2026-10-27)
- **Fecha:** 2026-10-27
- **Fase:** F3b — Contenido por dominio, dominio 23-emerging-technologies
- **Referencias:**
  - ADR-016 y ADR-017: Docker real en la CI, con imágenes por digest y `docker run` desde el test.
  - ADR-018: PyIceberg 0.12 con catálogo SQL en SQLite, en Linux.
  - ADR-025: ejemplos de IA en la CI sin APIs pagadas.

## Contexto

23 trata tecnologías que evolucionan rápido. Dos de ellas tienen una parte que la CI puede ejecutar sin servicios pagados:

- **Model Context Protocol (MCP):** un protocolo entre un host (la aplicación con el modelo) y servidores que exponen herramientas. Lo que importa a un data engineer, el servidor y sus herramientas, se puede probar con un cliente local sin modelo.
- **Catálogos REST de Iceberg:** el estándar de interoperabilidad entre motores y catálogos. Un cliente (PyIceberg) puede hablar con un servidor REST en un contenedor.

## Decisión

1. **SDK oficial de MCP para Python, con versión fija.**
   - **Versión:** `mcp==2.3.0`, publicada en PyPI el 2026-10-02 (más de dos semanas antes de esta decisión). Va en `requirements-snippets.txt`.
   - **Solo stdio y local:** el cliente lanza el servidor como subproceso. Sin red, sin puertos y sin credenciales.
   - **Una herramienta de solo lectura:** el servidor del ejemplo abre la base en modo solo lectura y no expone herramientas que escriban.
   - **Sin modelo de lenguaje:** el cliente hace lo que haría el host: listar herramientas y llamarlas.
   - **Si el paquete falta, el test se salta** con `pytest.importorskip` («falta mcp (make snippets-deps)»). En la CI no falta.
2. **Catálogo REST de Iceberg en Docker, fijado por digest.**
   - La imagen y su digest se eligen y se registran al implementar 23b (`interoperability-standards`), con `docker run` desde el test, como en ADR-017.
   - PyIceberg 0.12 (ADR-018) es el cliente. No se agrega otra dependencia de Python.

## Consecuencias

- **Una dependencia nueva:** `mcp` trae sus propias dependencias (pydantic, httpx, starlette y otras). `pip check` no reporta conflictos con las versiones fijadas del proyecto.
- **El protocolo cambia:** la ficha cita la revisión vigente de la especificación tal como la declara su página. Cuando aparezca una revisión nueva, se actualiza la versión del SDK con un ADR o una enmienda.
- **Lo que no se ejecuta:** los servidores MCP administrados de cada nube se citan desde su página, «no ejecutado».

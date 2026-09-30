# ADR-005 — Servicio de la API y búsqueda de texto completo

- **Estado:** Aceptado
- **Fecha:** 2026-09-30
- **Fase:** F2 — Plataforma MVP (tarea A-F2.3)
- **Referencias:** plan maestro §35; ADR-000, ADR-001, ADR-002; A-F2.2.

## Contexto

La API (FastAPI) debe devolver exactamente las formas de `docs/contracts/api.yaml`. Los mocks, generados desde `content/` con la proyección de A-F2.1, son la referencia ejecutable de esas formas. El compilador de A-F2.2 ya guarda el contenido en PostgreSQL sin pérdida y sabe reconstruir el índice que usa la proyección.

## Decisión

1. **Servicio desde un índice en memoria.**
   - La API lee de PostgreSQL el `ContentIndex` y lo sirve con la proyección, que se movió a `backend/app/projection.py`.
   - Lo recarga solo si cambia la huella de `content_files` (número de archivos y última compilación). La comprobación es una consulta barata por petición, así que una recompilación se ve sin reiniciar la API.
   - Así la forma coincide con los mocks por construcción. El catálogo del MVP cabe en pocos MB; en F7 se revisa si crece mucho.
   - El estado personal (`/me`, A-F2.4) usará SQL por petición.
2. **Búsqueda FTS en PostgreSQL** (migración `0002`):
   - Tabla `search_documents`, que llena el compilador por archivo con borrado en cascada. Un concepto con ficha tiene dos documentos, uno del blueprint y otro de la ficha; en los resultados se queda el de mayor puntaje.
   - Configuraciones `es_unaccent` y `en_unaccent` (`unaccent` + stemmer): "particion" encuentra "Particionamiento".
   - Pesos: título y slug A (el slug está en inglés y el título en español), tags B, descripción o nota C, cuerpo D.
   - Puntaje: el mejor `ts_rank` entre español e inglés, más 1.0 si alguna palabra del título o del slug empieza por la consulta (no vale una subcadena interna: "particion" no coincide con "Compartición"), más 0.5 si hay coincidencia exacta, más 0.1 si es `core`.
   - Filtros `type`, `domain` y `classification`, y resultados agrupados por tipo (§35).
3. **`/search` queda fuera de la igualdad byte a byte con los mocks.**
   - Los mocks de búsqueda se generan con una coincidencia de texto simple, sin PostgreSQL, y siguen siendo **ejemplos de forma**, no de resultados.
   - La búsqueda real se cubre con la validación de contrato y con tests de comportamiento: ranking en español e inglés, coincidencias sin tilde, filtros, orden por puntaje y escape de comodines.
   - El resto de los mocks de conocimiento se comparan byte a byte con la API.
4. **Pydantic solo para parámetros y errores.** Las respuestas son los diccionarios de la proyección y los tests las validan contra `api.yaml`, así no se duplica el contrato en modelos.
5. **`/openapi.json` sirve `docs/contracts/api.yaml`**, no un esquema generado por FastAPI. `/docs` muestra el contrato real.
6. **Cambio de contrato (aditivo):** se declara `422` (`ValidationError`, `problem+json`) en todas las operaciones con parámetros. Antes solo lo tenían `/search` y los PUT/POST de `/me`, pero la API responde 422 ante un slug mal formado, un enum inválido o un `limit` fuera de rango. Los mocks no cambian. El cliente tipado del frontend debe regenerarse.

## Consecuencias

- La forma de las respuestas tiene una sola implementación, la proyección. Tanto los mocks como la API la usan.
- Si cambia la versión del compilador (ahora `2`, con `search_documents`), se recompila todo.
- `backend/db/compiler.py` sigue importando `scripts/validate.py`. Moverlo a un paquete compartido queda en BACKLOG.

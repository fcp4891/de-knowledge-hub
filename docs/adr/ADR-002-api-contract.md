# ADR-002 — Contrato de API del MVP

- **Estado:** Aceptado
- **Fecha:** 2026-09-29
- **Fase:** F2 — Plataforma MVP (tarea A-F2.1)
- **Referencias:** plan maestro §22, §35, §37, §38, §40; ROADMAP F2; ADR-000, ADR-001, ADR-003, ADR-004.

## Contexto

Carril B construye el frontend en paralelo al backend. Para eso necesita un contrato estable y datos de ejemplo reales antes de que exista la API. Hoy solo hay 2 fichas en `content/`, pero el blueprint inventaría 359 conceptos: el Explorer y la navegación del MVP deben funcionar sobre ese inventario, aunque la mayoría de los conceptos todavía no tenga ficha.

## Decisión

1. **Contrato:** `docs/contracts/api.yaml`, OpenAPI 3.1 con dialecto JSON Schema 2020-12, servidor `/api/v1`. Es la única referencia de forma para el backend (A-F2.3) y el frontend (Carril B). Cambiarlo exige un ADR.
2. **Conceptos desde el blueprint:** `/concepts` y `/domains` exponen todos los conceptos del blueprint. `has_page` indica si existe la ficha en `content/`. Sin ficha, el detalle trae la metadata del blueprint, `sections: []`, y `null` en los campos que aún no tienen valor (`description`, fechas, `verification_status`).
3. **Metadata §40 en todo detalle:** `ConceptDetail` y `TechnologyDetail` extienden `Metadata` con los 18 campos de §40.
4. **Secciones de la ficha:** el cuerpo Markdown se divide por los encabezados `## N. Título` en las 22 secciones de §22, cada una con una clave estable (`summary`, `how_it_works`, `gcp`…). Las claves están en `Section.key` y en `scripts/contracts/projection.py`, y un test comprueba que coinciden.
5. **Relaciones:** `/entities/{slug}/relations` combina:
   - las aristas de las entidades (`origin: entity`);
   - los `related_concepts` y `related_technologies` del blueprint, como `RELATED_TO` (`origin: blueprint`).

   Se agrupan por tipo y dirección:
   - las relaciones salientes usan como etiqueta el tipo;
   - las entrantes usan el nombre inverso del catálogo (`implemented_by`, `hosts`…);
   - las simétricas se muestran una sola vez (`direction: both`). Si una misma pareja aparece desde la entidad y desde el blueprint, prevalece la de la entidad.
6. **Fuentes por slug:** `/sources/{slug}`, no `{id}`: el slug es único en `content/` y el id (`source:slug`) tiene dos puntos.
7. **Tecnologías y matriz:** el detalle de una tecnología incluye las celdas de la Cloud Capability Matrix donde aparece, con los equivalentes de los otros clouds y sus diferencias. Así se cubre la "comparación relacionada" del MVP (§51) sin un endpoint aparte.
8. **Estado personal (§37):**
   - por slug: `GET`/`PUT /me/study-state/{slug}`, `GET`/`POST /me/notes/{slug}` y `GET`/`PUT /me/favorites/{slug}`;
   - listados para la Home (§38): `GET /me/study-state?state=` (del más reciente al más antiguo) y `GET /me/favorites`;
   - `PUT` es idempotente. Un slug sin estado registrado devuelve `not_reviewed`.
9. **Convenciones:**
   - paginación con `limit`, `offset` y `total`;
   - errores `application/problem+json` (RFC 9457);
   - fechas ISO (`date` para contenido, `date-time` para estado personal).
10. **Mocks:** `docs/contracts/mock-data/` se genera desde `content/` con `make mocks` (`scripts/contracts/build_mocks.py`):
    - `index.json` asocia `MÉTODO /ruta[?query]` con su archivo de respuesta;
    - la generación es determinista, y los tests verifican que cada mock cumple su schema, que toda operación tiene mock y que los mocks están al día con `content/`;
    - el estado personal de los mocks es un ejemplo fijo, porque en producción vive en PostgreSQL.

## Opciones descartadas

| Opción | Motivo |
|---|---|
| Exponer solo las fichas existentes | Hoy son 2; el Explorer quedaría vacío hasta F3. |
| Solo aristas de entidades | Casi no hay; el panel de relacionados de B-F2.2 quedaría vacío. |
| Mocks escritos a mano | Se desactualizan. Generarlos desde `content/` los mantiene reales y verificables. |
| Validación formal del OpenAPI con `openapi-spec-validator` | Dependencia nueva; queda en BACKLOG. Mientras tanto, los tests validan los mocks contra los schemas del contrato. |

## Consecuencias

- La API real (A-F2.3) debe devolver exactamente las formas de `scripts/contracts/projection.py`, que sirve de referencia ejecutable. Los tests de contrato de A-F2.3 reutilizarán `tests/test_contract.py`.
- Los endpoints de arquitecturas y labs se agregan en F4 con su propio ADR.
- La búsqueda de los mocks es una coincidencia de texto simple; la real (FTS en español e inglés) es A-F2.3.

# ADR-028 — Ficha de arquitectura de referencia

- **Estado:** Aceptado (decisión de Felipe, 2026-11-01)
- **Fecha:** 2026-11-01
- **Fase:** F3b — Contenido por dominio, dominio 07 «Arquitecturas de datos»
- **Referencias:** ADR-003 (`kind` del blueprint), ADR-009 (fichas de F3b), ADR-010 (aliases), ADR-016 a ADR-018 y ADR-026 (código en la CI), CLAUDE.md §9 (diagramas).

## Contexto

El dominio 07 tiene 15 arquitecturas (`kind: architecture`). Hasta ahora quedaban en F4. Felipe decidió escribir las 15 fichas en F3b; F4 queda solo para los laboratorios en la nube: `terraform apply`, costo con fuente, teardown y evidencia.

Había una plantilla de arquitectura (`content/_templates/architecture.md`, §24) con 18 secciones sin numerar, pero el sistema no la soportaba:

- el validador solo revisaba las secciones de `concept` y `pattern`;
- el contrato no tenía claves de sección para arquitecturas.

Un diagrama de 8 nodos no alcanza para una arquitectura completa.

## Decisión

### 1. Plantilla

`content/_templates/architecture.md` tiene 22 secciones numeradas. Los números del §10, §11–13, §17 y §19–22 son los de la ficha de concepto, así que valen sin cambios:

- los tests del código del §10;
- la regla del §17 con `relations`;
- las tablas por nube;
- las fuentes, la fecha y el historial.

| § | Concepto | Arquitectura | Clave en la API |
|---|---|---|---|
| 1 | Resumen | Resumen | `summary` |
| 2 | Qué es | Escenario y requerimientos | `scenario` |
| 3 | Problema que resuelve | Vista de contexto | `context_view` |
| 4 | Cómo funciona | Componentes | `components` |
| 5 | Cuándo utilizarlo | Vista de datos | `data_view` |
| 6 | Cuándo no utilizarlo | Vista de despliegue | `deployment_view` |
| 7 | Ejemplo sencillo | Seguridad y gobierno | `security` |
| 8 | Ejemplo de producción | Escalabilidad, observabilidad y operación | `operations` |
| 9 | Arquitectura | Costos | `costs` |
| 10 | Código | Código y configuración | `code` |
| 11–13 | GCP, AWS, Azure | GCP, AWS, Azure | `gcp`, `aws`, `azure` |
| 14 | Buenas prácticas | Riesgos y modos de falla | `risks` |
| 15 | Errores frecuentes | Errores frecuentes | `common_mistakes` |
| 16 | Trade-offs | Trade-offs y alternativas | `trade_offs` |
| 17 | Conceptos relacionados | Conceptos relacionados | `related_concepts` |
| 18 | Preguntas técnicas abiertas | Evolución | `evolution` |
| 19–22 | Laboratorio, fuentes, fecha, historial | Laboratorio, fuentes, fecha, historial | `related_lab`, `sources`, `last_verified`, `change_history` |

### 2. Tres vistas

El §3 (contexto), el §5 (datos) y el §6 (despliegue) llevan cada uno un diagrama Mermaid de 8 nodos o menos.

- **Subgraph:** en estas vistas, un `subgraph` cuenta como un nodo más.
- **Error, no aviso:** el validador marca como error que falte una vista o que una supere los 8 nodos. Para el resto de los diagramas sigue el aviso de tamaño de siempre.
- **Conexión entre vistas:** las tres vistas comparten los nombres de la tabla de componentes del §4. El validador no compara etiquetas: la igualdad de nombres la revisa una persona en la revisión del lote (revisión de 07-0, 2026-11-02).
- **Nubes:** las diferencias entre GCP, AWS y Azure van en tablas en §11–13, no en un cuarto diagrama.

### 3. Validador

`backend/content/page_sections.py`:

- `PAGE_TYPES` incluye `architecture`, así que la regla del §17, las fuentes de Nivel 1–2 y `related_topics` valen igual que en una ficha;
- `TEMPLATES` agrega la plantilla de arquitectura;
- las viñetas Seguridad, Observabilidad y Costo del §14 solo se exigen en `concept` y `pattern` (`PRACTICE_TYPES`), porque en una arquitectura esos temas tienen sección propia (§7–9).

`architecture_views` en `validate.py` revisa las tres vistas. `diagrams.view_nodes` cuenta los subgraph.

### 4. Compilador y API

**Sin migración y con el mismo `COMPILER_VERSION`.** El compilador ya guarda cualquier entidad. Los patterns tampoco tienen tabla propia.

**Contrato (cambio aditivo):**

- las arquitecturas se sirven en `GET /concepts` y `GET /concepts/{slug}` con `kind: architecture`, que ya estaba en el enum `Kind`; no hay `/architectures`;
- es el mismo precedente de los patterns, que no tienen ruta propia;
- `Section.key` suma `scenario`, `context_view`, `components`, `data_view`, `deployment_view`, `security`, `operations`, `costs`, `risks` y `evolution`;
- la proyección elige las claves según el `kind`.

Las fichas viven en `content/architectures/<slug>.md`.

### 5. Enmienda de diagramas en CLAUDE.md

Se agrega la regla de las tres vistas por arquitectura, con el subgraph contado como nodo.

## Consecuencias

- **Lotes:** las 15 arquitecturas se escriben en F3b, en tres lotes de 5 (07a, 07b y 07c). ROADMAP y BACKLOG se actualizan.
- **Pedido a Carril B:** que `/concepts/<slug>/` muestre una ficha con `kind: architecture` con los títulos de su plantilla. El detalle está en `docs/status/lane-a.md`.
- **CDC:** se ejecuta en la CI con logical decoding (`test_decoding`, incluido en PostgreSQL). Debezium se explica en el texto con fuente N1, y su ejecución queda para F4. No hay ADR nuevo.

## Alternativas descartadas

- **Endpoint `/architectures` y ruta propia:** más trabajo para Carril B y para el contrato, sin precedente; los patterns comparten `/concepts`.
- **Subir el límite de nodos:** un diagrama de 15 nodos no se lee en una pantalla; tres vistas pequeñas sí.
- **Mantener las 18 secciones sin numerar:** obligaba a duplicar en el validador y en los tests la lógica que hoy depende de los números.

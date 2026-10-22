# ADR-024 — Jerarquía de fichas padre e hijas

- **Estado:** Propuesto (pendiente de aprobación de Felipe; no implementado)
- **Fecha:** 2026-10-22
- **Fase:** F3b — upgrade de 19-compliance
- **Referencias:** ADR-000, ADR-002 (contrato), ADR-003 (blueprint), ADR-023 (contenido con origen legal).

## Contexto

El upgrade de 19 organiza el subdominio «Ingeniería de datos y Ley 21.719» como una ficha padre (`chile-data-protection`) y diez fichas hijas. El schema no tiene cómo expresarlo:

- `relationships.schema.json` no tiene un tipo de relación de pertenencia; los tipos son USES, IMPLEMENTS, DEPENDS_ON, ALTERNATIVE_TO, RELATED_TO, REPLACES, EXTENDS, RUNS_ON, PRODUCES, CONSUMES, PRACTICES, AFFECTS, UPDATES y REQUIRES.
- El blueprint agrupa por subdominio, pero no dice cuál es la ficha de entrada ni el orden.

Hoy la jerarquía se representa con `RELATED_TO` en las dos direcciones y con texto («Es ficha hija de `chile-data-protection`»; la §17 de la padre lista las hijas). El frontend no puede distinguir una ficha padre de una relacionada.

## Opciones

### A. Relación `PART_OF` (recomendada)

- **Schema:** `relationships.schema.json` agrega `PART_OF` (hija → padre). La inversa (`HAS_PART`) se deriva, como las demás relaciones (se guardan en una sola dirección).
- **Validación:**
  - una ficha tiene a lo sumo un `PART_OF`;
  - padre e hija son del mismo dominio y subdominio;
  - no hay ciclos;
  - la padre nombra a todas sus hijas en la §17.
- **Contrato:** cambio aditivo; `RelationType` agrega `PART_OF`. Las relaciones de la ficha ya llegan agrupadas, así que el frontend puede mostrar «Ficha padre» y «Fichas hijas» sin campos nuevos.
- **A favor:** usa el grafo que ya existe, no agrega un campo, y sirve para otras jerarquías (por ejemplo, arquitecturas de F4 y sus componentes).
- **En contra:** las relaciones no tienen orden; el orden de estudio de las hijas tendría que venir de otro lado (el blueprint, o el `order` del objetivo de Inicio).

### B. Campo `parent` en el frontmatter

- **Schema:** `base.schema.json` agrega `parent` (slug de la ficha padre).
- **Contrato:** `ConceptDetail` agrega `parent: Slug | null` y `children: Slug[]`, que se derivan.
- **A favor:** explícito y fácil de leer.
- **En contra:** duplica algo que es una relación del grafo, y el grafo no lo ve si no se proyecta aparte.

## Decisión propuesta

Opción A: `PART_OF`, con las reglas de validación de arriba. El orden de las hijas lo da el blueprint: se agrega un campo opcional `order` al subdominio, o se usa el orden en que aparecen. Eso queda a definir al implementar.

## Consecuencias

- **Implementación** (cuando se apruebe):
  - schema y catálogo de relaciones;
  - las reglas de validación, con sus tests;
  - el contrato;
  - reemplazar en las fichas de 19 los `RELATED_TO` hija → padre por `PART_OF`.
- **Pedido a Carril B:** mostrar «Ficha padre» arriba de cada hija y la lista «Fichas hijas» en la padre, en el orden del blueprint.
- **Mientras tanto:** la jerarquía va en el texto y en `RELATED_TO`, como está hoy.

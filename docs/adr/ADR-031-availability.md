# ADR-031 — Disponibilidad por ficha

- **Estado:** Propuesto (2026-11-12)
- **Fecha:** 2026-11-12
- **Fase:** F3b — itinerario «Protección de datos personales» (dominio 24)
- **Referencias:** ADR-002 (contrato de la API), ADR-005 (base derivada), ADR-027 (dominio 24), ADR-029 y ADR-030 (fichas con vistas).

## Contexto

El itinerario publica sus cinco tramos, pero solo algunas fichas están listas para leerse. Las demás tienen que seguir teniendo una URL estable, sin mostrar contenido que todavía se está revisando o diseñando. Los enlaces que otras fichas les hacen tienen que verse distintos y no llevar a una página vacía.

## Decisión

1. **Campo `availability`** en el frontmatter de toda entidad con página (`schemas/base.schema.json`):
   - `available` (valor por defecto, sin el campo): la ficha se publica completa.
   - `in_review`: el contenido está listo y en revisión.
   - `in_development`: el contenido y el diseño están en preparación.
2. **Textos en contenido.** La etiqueta y la ayuda de cada estado, y el texto del enlace de vuelta, van en `content/ui/availability.yaml`, validado contra `schemas/ui-availability.schema.json`. Ningún componente los escribe:
   - `in_development`: «En desarrollo» · «Contenido y diseño en preparación».
   - `in_review`: «En revisión» · «Contenido listo; en revisión antes de publicarse».
   - `back_label`: «Volver al itinerario».
3. **`content/ui/`** es una carpeta de estructura nueva. Cada archivo necesita su schema en `UI_SCHEMAS`, y el compilador lo guarda en la tabla `ui_texts` (migración 0008, `COMPILER_VERSION` 8).
4. **Proyección y contrato** (`docs/contracts/api.yaml`):
   - `ConceptSummary.availability`, en el índice.
   - `ConceptDetail.availability`.
   - `ConceptDetail.availability_text` (`label`, `help`, `back_label`), solo si la ficha no está disponible.
   - **Página mínima.** Una ficha no disponible se publica sin contenido: `sections`, `sources` y `legal_basis` van vacíos y sin `views` ni `annexes`. Tampoco los llevan los datos estáticos.
   - `ConceptDetail.unavailable_links`: las fichas no disponibles que esta enlaza. Se buscan en enlaces `/concepts/<slug>/` del cuerpo y de las vistas, en `slug` entre comillas invertidas, en entradas `page` de Fuentes, en `relations`, en `related_topics` y en `related_concepts` del blueprint. Cada una lleva `target_availability` y su etiqueta.
   - `RelationItem.target_availability`, y lo mismo en las entradas `page` de `sources_grouped`.
5. **Frontend.** La página de una ficha no disponible muestra su título, la etiqueta, la ayuda y el enlace de vuelta al tramo del itinerario, y lleva `noindex`. El diseño de esa página y del enlace marcado, con etiqueta y sin navegar, queda para Carril B.
6. **Asignación inicial** en el itinerario «Protección de datos personales»:
   - Paso 1, Fundamentos: `chile-data-protection` y `pii-identification` quedan `available`; `processing-activities-inventory`, `in_review`.
   - Pasos 2 a 5: sus 12 fichas quedan `in_development`.

## Consecuencias

- Cambiar el estado de una ficha es una línea de frontmatter; los textos se editan en un solo archivo.
- El sitio no tiene sitemap. Si se agrega uno, debe excluir las fichas no disponibles.
- **Búsqueda.** Una ficha no disponible no indexa su cuerpo, su descripción, sus etiquetas ni sus alias:
  - en la base (`search_documents`) queda solo el título;
  - en la búsqueda de la proyección y en el índice estático del navegador, el título y la etiqueta de disponibilidad.

## Enmienda 1 (2026-11-12): tramos del itinerario

- **Regla.** Un tramo está deshabilitado si ninguna de sus fichas tiene `availability = available`. Se calcula con los datos (`frontend/lib/routeAvailability.ts`), no por slug.
- **Textos de conteo.** `content/ui/availability.yaml` suma:
  - `available.count` («{n} disponibles»);
  - `in_review.count` e `in_development.count`;
  - `route_count` («{n} de {total} fichas disponibles»).
- **Contrato.** `DomainDetail.availability_texts` expone el archivo completo.
- **Cabecera del recorrido.**
  - Contador «N de M fichas disponibles».
  - Tramo deshabilitado: número en círculo punteado, título gris, línea punteada hacia él y etiqueta del estado. No navega y lleva `aria-disabled`.
  - Bajo 620 px de ancho del bloque, los pasos pasan a una lista vertical. Es una consulta de contenedor, no de pantalla.
- **Panel «Tu itinerario».**
  - Un tramo con fichas disponibles muestra «{n} disponibles» y «{n} en revisión».
  - Uno deshabilitado muestra el número punteado, el título gris, el peso con contorno y la etiqueta del estado.

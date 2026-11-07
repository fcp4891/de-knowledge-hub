# ADR-030 — Vistas estructuradas de la ficha (`views`)

- **Estado:** Aceptado (decisión de Felipe, 2026-11-07)
- **Fecha:** 2026-11-07
- **Fase:** F3b — dominio 24, ficha padre `chile-data-protection` (maqueta de bloques 0–6)
- **Referencias:** ADR-002 (contrato), ADR-012 (`page_title`), ADR-023 (contenido legal), ADR-029 (secciones omitidas y anexo).

## Contexto

La maqueta de `chile-data-protection` cambia seis bloques de Markdown por componentes:

- la idea central en dos lados;
- la línea de vigencia;
- el enfoque en un desplegable propio;
- las buenas prácticas por etapa;
- las sanciones en tarjetas;
- las fuentes agrupadas.

Cursor construye los componentes; Carril A define el contrato y el contenido. Felipe fijó tres reglas:

- **Activación explícita.** Una vista se activa con una marca o un campo explícito, nunca detectando textos o encabezados.
- **Campos opcionales.** Las demás fichas no cambian.
- **Mapeo 1:1.** El contrato corresponde campo a campo con las props acordadas.

## Decisión

### 1. Datos: `views` en el frontmatter

`views` es un objeto opcional de `base.schema.json`. Tiene una clave por vista, en snake_case, con los mismos campos que las props del componente.

| Clave | Componente | Posición |
|---|---|---|
| `central_idea` | `CentralIdea` | Marca en el cuerpo |
| `vigencia_timeline` | `VigenciaTimeline` | Marca en el cuerpo |
| `approach` | Pasos del enfoque, `size="lg"` | Fija: desplegable sin número, justo después del Resumen |
| `practice_lanes` | `PracticeLanes` | Marca en el cuerpo |
| `severity_cards` | `SeverityCards` | Marca en el cuerpo |
| `sources_grouped` | `SourcesGrouped` | Fija: reemplaza la lista de Fuentes |

Los textos siguen en `content/`: el frontmatter también es fuente de verdad.

### 2. Marca de posición

La marca es `<!-- view: clave -->`, en su propia línea. El validador exige estas cuatro reglas:

- toda marca tiene sus datos en `views`;
- toda vista con posición por marca está marcada una sola vez;
- las vistas con posición fija no llevan marca;
- cada URL de `sources_grouped` es una cita de `sources` y cada cita aparece en una sola entrada.

En el frontend, el parser convierte la marca en un bloque `view`; ya no se muestra como nota «Pendiente de verificación».

### 3. `sources_grouped` resuelto en la API

En el frontmatter, cada entrada nombra sus `urls`. La proyección las resuelve a `links: [{label?, href}]`: el `label` sale del rótulo de la cita (ADR-029). El campo `level` («Nivel N») sale del registro. Así, las fuentes siguen en `sources`, con su `page_title` y su `accessed`, y la vista solo las agrupa.

### 4. Buenas prácticas

Con `practice_lanes`, no se exigen en la §14 las viñetas Seguridad, Observabilidad y Costo, que cubren las etapas «Proteger» y «Operar» y el recuadro «Por dónde empezar». La §14 conserva una frase etiquetada (ADR-023) y la marca.

### 5. API y frontend

- **API.** `ConceptDetail.views` aparece solo si la ficha lo trae. Los mocks de las demás fichas no cambian.
- **Adaptadores.** `frontend/lib/views.ts` convierte cada vista a sus props en camelCase, con un renombre 1:1.
- **Respaldo.** Hasta conectar los componentes de diseño, `ViewFallbacks.tsx` dibuja cada vista con listas simples.

## Consecuencias

- Hay tests de las reglas de marca, de la cobertura de fuentes, de la exención de la §14, del schema, de la proyección y del parser.
- La matriz de control del §4 (ADR-029) todavía se reconoce por sus encabezados. Este ADR no la cambia; pasarla a una marca queda pendiente de decisión.

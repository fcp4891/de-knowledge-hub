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

## Enmienda 1 (2026-11-09) — Componentes de diseño con datos del contrato

Los componentes de Cursor (`ui/ficha-ley21719-componentes`) traían su texto fijo, y la vista previa los ubicaba buscando textos y encabezados con expresiones regulares. Con esta enmienda, cada componente recibe sus datos por props desde `views`, y nada se ubica por texto.

### Vistas nuevas

| Clave | Componente | Posición |
|---|---|---|
| `treatment_map` | `TreatmentMap` | Marca en §1 |
| `legal_foundations` | `LegalFoundations` (título y recuadro de roles) | Fija: §2 |
| `problem_journey` | `ProblemJourney` | Marca en §3 |
| `design_board` | `DesignBoard` | Marca en §4 |
| `control_matrix` | `ControlMatrix` | Marca en §4 |
| `when_to_use` | `WhenToUse` | Marca en §5 |
| `requirement_to_data` | `RequirementToData` | Marca en §9 |
| `control_evidence` | `ControlEvidence` | Marca en §9 |
| `code_guide` | `CodeGuide` | Marca en §10 |
| `cloud_compare` | `CloudCompare` | Marca en §11 (ADR-029, enmienda 1) |

Además, `approach` suma el ejemplo y la referencia de cada paso, los rótulos de sus filas y las fuentes; `vigencia_timeline` suma `note`, `icon`, `intro` e `intro_mark`.

### Reglas

- **Texto con enlaces.** Los campos marcados como texto enriquecido admiten Markdown en línea: `[rótulo](https://…)`, negrita, cursiva y código. Se dibujan con `RichText`.
- **Enlaces citados.** Todo enlace de una vista, sea un campo `href` o un enlace Markdown dentro de un texto, tiene que ser una cita de `sources`. Lo comprueba el validador.
- **Marca como contenido.** Una marca de vista cuenta como contenido de la sección, así que una sección que solo trae su marca no está vacía.
- **Fecha de la legislación comparada (ADR-023).** La regla `accessed` = `last_verified` rige para la legislación de la jurisdicción de la ficha. La legislación comparada, como el RGPD en EUR-Lex dentro de una ficha `CL`, lleva su propia fecha de consulta.
- **Guía del código.** Los escenarios de `code_guide` y sus salidas tienen que coincidir con los de la CI, y sus funciones con las de `CONTROLS`. Lo comprueba un test.

### Componentes eliminados

- `DataFlow`: lo reemplaza `TreatmentMap`.
- `DesignQuestions`: no se usaba.
- `ViewFallbacks`: ya no hace falta un render de respaldo.
- La vista previa (`/preview-ficha`) dibuja la misma ficha, sin slots propios.

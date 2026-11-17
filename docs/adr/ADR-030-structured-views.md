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

## Enmienda 2 (2026-11-09) — Anclas internas

- **Píldoras enlazadas.** Las píldoras (`tags`) de `design_board` y `when_to_use` llevan `href` con un ancla interna `#…`, y se dibujan como enlaces.
- **Destinos.** Las filas de `control_matrix`, la propia matriz, las reglas de `code_guide` y las tarjetas de `practice_lanes` pueden declarar un `id`.
- **Enlace al código.** `control_evidence.example.code_link` agrega el enlace «Ver código ↓» al pie del ejemplo, apuntando al §10.
- **Anclas válidas.** Un ancla existe si cumple una de estas condiciones:
  - es una sección presente (`s{N}`, el número de la plantilla);
  - es un `id` declarado en las vistas;
  - es una fila del catálogo legal (`lb-ley-19628-<artículo>`) de un artículo de `legal_basis`. Al hacer clic, abre el modal del artículo.
- **Validación.** El validador rechaza un ancla que no existe, y un test revisa las píldoras de `chile-data-protection`.

## Enmienda 3 (2026-11-09) — Principios, prácticas, trade-offs, sanciones y preguntas

- **`legal_foundations.principles`.** Asigna píldoras a cada principio del §2 (`label`, `tags`). Se dibujan bajo cada tarjeta, y la descripción al pasar el mouse no cambia.
- **`practice_lanes`.**
  - `start` pasa a ser un recuadro de aviso y admite texto enriquecido.
  - Las tarjetas aceptan `tags`.
  - `cross` es una franja transversal (`title`, `label`, `items`) bajo las columnas.
  - El número de columnas sigue al número de etapas (`data-count`).
- **`trade_offs`** (componente nuevo, `TradeOffs`). Cada trade-off es una balanza «A ⇄ B» con su texto y la franja `resolution_label` + `resolution`. Lleva `arq` y la nota final. Marca en §16.
- **`severity_cards`.** Cada nivel suma `article` y `examples_label`. `modifiers` agrega las tarjetas Aumenta / Atenúa (`effect`, `effect_label`, `title`, `text`, `basis`).
- **`open_questions`** (componente nuevo, `OpenQuestions`, de cliente).
  - Tarjetas con píldoras y la casilla `check_label`.
  - El contador sale de la plantilla `counter`, con `{n}` y `{total}`.
  - El estado vive en memoria, sin localStorage.
  - Marca en §18.
- **`Pills`.** Componente compartido con el estilo de las píldoras de Cómo funciona. Las de código muestran el rótulo en estilo código.
- **Ids nuevos.** Se agregan `id` en las preguntas de `design_board`, en las filas de `cloud_compare` y en `control_evidence`, como destinos de anclas.
- **Escala de sanciones.** Los tokens `--severity-1/2/3` pasan a amarillo, naranja y rojo, en claro y en oscuro.

## Enmienda 4 (2026-11-09): roles con campos explícitos

- **Antes.** `LegalFoundations` tenía fijos los rótulos «Decide», «Evalúa» y «Ojo». Armaba «Evalúa» partiendo `decide.items` y sacaba el enlace del aviso desde `processor.text`.
- **Ahora.** Los roles leen campos explícitos de `views.legal_foundations.roles`:
  - `responsible.decide{kicker, items}`;
  - `responsible.evaluate{kicker, items}`, opcional;
  - `responsible.build{kicker, items}`;
  - `processor{title, text, alert?{title, text}}`.
- **Sin `evaluate`,** el recuadro queda en dos columnas (`is-pair`). **Sin `alert`,** no se muestra el aviso. En ambos casos la ficha valida igual.
- **Diseño.** No cambia: con los mismos textos, las capturas a 1366 px y 390 px son idénticas antes y después.
- **Contrato.** `schemas/base.schema.json` y `docs/contracts/api.yaml` se regeneran con los dos campos opcionales. Las demás fichas no usan la vista y no cambian.

## Enmienda 5 (2026-11-12): vistas de pii-identification

**Vistas nuevas.** El componente de cada una queda para Carril B, con estos nombres:

| Clave | Componente | Sección | Marca |
|---|---|---|---|
| `catalog_fields` | CatalogFields | §1 | `<!-- view: catalog_fields -->` |
| `concept_map` | ConceptMap | §2 | `<!-- view: concept_map -->` |
| `decision_tree` | DecisionTree | §2 | `<!-- view: decision_tree -->` |
| `coverage_strip` | CoverageStrip | §3 | `<!-- view: coverage_strip -->` |
| `column_types` | ColumnTypes | §3 | `<!-- view: column_types -->` |
| `evidence_steps` | EvidenceSteps | §4 | `<!-- view: evidence_steps -->` |
| `use_avoid` | UseAvoid | §5 | `<!-- view: use_avoid -->` |
| `practice_pairs` | PracticePairs | §14 | `<!-- view: practice_pairs -->` |
| `notes` | Note | §1, §2, §3, §4, §11 | `<!-- view: note <id> -->` |
| `chips` | Chips | §1, §4 | `<!-- view: chips <id> -->` |
| `section_titles` | — | todas | sin marca (posición fija) |

**Convenciones nuevas:**
- **Marca con id.** `notes` y `chips` admiten varias instancias por ficha: la marca nombra el id. Cada entrada se marca una sola vez.
- **`section_ref`.** En cualquier texto enriquecido, «[§](#sN)» es una referencia a otra sección. El componente la dibuja como «§<número visible> · <nombre>». El nombre es `section_titles[].ref` si existe y, si no, `title`. El validador comprueba que el ancla exista.
- **Enlaces a otras fichas.** Usan `/concepts/<slug>/` (con ancla opcional), en `chips`, en `decision_tree.law.link` y en entradas `page` de `sources_grouped`. El validador comprueba que la ficha exista, y la API marca `target_availability` (ADR-031).
- **`TAG.section`.** El número de sección de una píldora que apunta a otra sección; el componente muestra «§<número visible>» como `kind`. `TAG.href` admite además una cita https.

**Extensiones opcionales** de vistas existentes, que no cambian chile-data-protection:
- `control_evidence`: `note` y `example.note` aceptan texto enriquecido.
- `code_guide`:
  - `rules.headers` admite 3 o 4 columnas, y `rules.items[].finds` es la cuarta;
  - `not_covered.intro` y sus ítems aceptan texto enriquecido;
  - `not_covered.note` es nuevo;
  - `scenarios.items[].text` acepta texto enriquecido.
- `cloud_compare`:
  - `headers` admite 4 o 5 columnas, y `rows[].own` es la columna «Este ejemplo»;
  - `rows[].tone: where` marca la fila «Dónde busca», y `rows[].meta` pasa a ser opcional;
  - las celdas tienen `name` y `text` enriquecidos, y `text` es opcional;
  - `closing` pasa a ser opcional.
- `trade_offs`: `items[].a_text` y `items[].b_text` (texto por lado); `items[].text` y `note` pasan a ser opcionales.
- `open_questions`: `check_label` y `counter` pasan a ser opcionales.
- `sources_grouped`: una entrada puede ser otra ficha (`page` y `label`) en vez de `urls` y `publisher`; `why` acepta texto enriquecido.

**Validador:** con `practice_pairs`, como con `practice_lanes`, la §14 no exige las viñetas Seguridad, Observabilidad y Costo.

## Enmienda 6 (2026-11-12): página de un PDF citado

- Un enlace `<pdf>#page=N` en una vista es válido si el mismo PDF sin fragmento ya es una cita de `sources`. No se agrega otra cita, así que tampoco hay avisos de URL ni de título repetido.
- `pii-identification` cita el texto publicado de la Ley 21.719 en su página: art. 2 → 2; art. 14 quinquies letra a → 10; art. 16 → 12; art. 16 quáter → 13.
- El atributo `target="ley-21719"`, para abrir siempre la misma pestaña, lo pone el componente de Carril B.
- Otro fragmento distinto de `#page=N` sigue exigiendo su propia cita.

## Enmienda 7 (2026-11-13): opciones de lectura y divisiones de sección

Las vistas dejan de decidir por slug o por el texto visible de un encabezado. Lo que antes se resolvía así pasa al contrato.

- **`views.reading`** (posición fija, sin marca):
  - `inline_arrows: false`: las flechas «→» del cuerpo no se dibujan como flecha (antes, `slug !== "data-lineage"`);
  - `summary_pairs: true`: el Resumen se maqueta en pares;
  - `legal_basis_panel: false`: sin el panel lateral de base legal, porque la ficha la trae en una vista.
- **`views.section_splits`**: `[{section, key, title}]`. Divide la sección `section` en dos desplegables en la marca `<!-- split: <key> -->` de su cuerpo. El segundo lleva `title` y el número `section + 0,5`. Reemplaza la detección de «### Contexto normativo» (§1) y «### Sanciones» (§16).
- **`views.legal_foundations.annex_link`**: `{label, href}` opcional, el enlace bajo los fundamentos legales. Antes era un texto fijo en el componente.
- **Validador:**
  - cada `section_splits[]` exige su marca en el cuerpo de esa sección, y cada marca exige su entrada;
  - las anclas de los anexos (`s23`, `s24`, …) son válidas para `href`.
- Sin estas claves, la lectura no cambia: flechas, resumen simple y panel de base legal, como hasta ahora.

## Enmienda 8 (2026-11-15): Fuentes con título visible y títulos enlazados

- **`views.sources_grouped.heading`** (opcional): título visible bajo el rótulo de la sección «Fuentes». Sin él, no se pinta.
- **`views.sources_grouped.link_titles`** (opcional, booleano): con `true`, una fuente de un solo enlace pinta su título como enlace y no muestra el dominio aparte; una ficha de la plataforma (`page`) lleva el título enlazado y su tipo («Ficha madre», «Ficha») a la derecha, en la misma fila. Una fuente con varios enlaces sigue mostrándolos.
- La API los proyecta en orden fijo, antes de `groups`.
- Quien no los declara no cambia: chile-data-protection sigue con el título sin enlace y el dominio debajo.
- **`views.reading.break_identifiers`** (opcional, booleano): con `true`, los nombres en código del ejemplo de `control_evidence` y de la tabla de `code_guide` llevan una oportunidad de corte tras cada guion bajo (`<wbr>`), para partirse ahí y no salirse de su tarjeta. Sin él no se agrega ninguna: chile no cambia.
- **`views.open_questions.items[].tags`** pasa a ser opcional: una pregunta puede no llevar etiquetas; si las lleva, la lista no está vacía.

## Enmienda 9 (2026-11-17): vistas del Inventario de actividades de tratamiento

Aprobada por el dueño el 2026-11-17. Es retrocompatible: chile-data-protection y pii-identification validan sin cambios.

- **Vistas extendidas** (todo lo nuevo es opcional):
  - `requirement_to_data`: `governance.items[].highlight` y `data.stages[].highlight` (caja con contorno de acento), y `data.banners` (varias franjas punteadas) como alternativa a `data.banner`; se declara una de las dos.
  - `control_evidence`: `example` pasa a ser opcional; un ítem de paso puede ser `{pill, text}`, con la pastilla que distingue la pista («Lo nuevo», «Lo que ya corre»); `decide.outcomes[].tone` admite `warn` (alerta ámbar).
  - `code_guide`: `exit_codes_label` (la línea «escenario → código», armada con `scenarios`), `lead_more` (párrafos tras «Qué hace»), `rules.title`, `rules.summary` (con `{rows}` y `{total}` calculados), `rules.items[].count` (×N), `not_covered.table` y `scenarios.items[].fixes` (hallazgo → corrección).
  - `rules.disclosure` y `scenarios.disclosure` (`open` o `closed`): el bloque se dibuja con el desplegable reutilizable «Ver detalle / Ocultar» (`<button aria-expanded aria-controls>` y una región con `hidden`; el título también abre y cierra).
  - `cloud_compare.rows[].span`: `{title, text}`, una celda para las tres nubes cuando dicen lo mismo; reemplaza a `gcp`, `aws` y `azure` en esa fila.
  - `sources_grouped.legend`: leyenda de los niveles de fuente.
  - `notes.*.tone` admite `key` (idea central).
- **Vistas nuevas:** `build_cards` (§1), `law_ladder` y `register_fields` (§2), `activity_explorer` (Qué es), `case_compare` (Problema) y `cycle_lanes` (Cómo funciona).
- **Datos generados:** `register_fields.cases` y `activity_explorer.activities` los escribe `scripts/generators/inventory_views.py` desde el `inventario.py` de la ficha. Un test vuelve a generarlos y falla si el frontmatter no coincide.

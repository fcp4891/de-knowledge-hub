# ADR-023 — Schema para contenido con origen legal (dominio 19, Ley 21.719)

- **Estado:** Aceptado (aprobado por Felipe el 2026-10-21, tal como está); implementado con el lote F3b-19a. Enmienda 1 (2026-10-24): `implication` en `legal_basis`. Enmienda 2 (2026-10-28, ADR-027): alcance en los dominios 19 y 24. Enmienda 3 (2026-10-30): línea «Etiqueta: […]» para tablas uniformes en §4 y §11–13. Enmienda 4 (2026-10-30): tablas sin columna «Etiqueta». Enmienda 5 (2026-10-30): jurisdicciones EU y BR para los marcos comparados
- **Fecha:** 2026-10-21
- **Fase:** F3b — Contenido por dominio, antes de 19-compliance
- **Referencias:** ADR-000 (content-as-code), ADR-002 (contrato), ADR-009 (contenido por dominio), ADR-012 (`page_title`); decisión de Felipe sobre la Ley 21.719 (ROADMAP, F3b, 2026-10-21).

## Contexto

El dominio 19 va a explicar cómo trabaja un ingeniero de datos bajo la Ley 21.719. La ley entra solo como origen de cada requisito. Felipe fijó estas reglas el 2026-10-21:

- Las afirmaciones legales se citan solo de Nivel 1: BCN LeyChile, Diario Oficial y Senado. El brief es un guion, no una fuente.
- Cada afirmación lleva una de tres etiquetas: Obligación legal (art. N), Buena práctica o Decisión de arquitectura.
- Cada ficha recorre la cadena Requisito → implicancia técnica → patrón → herramientas → código en la CI → evidencia de cumplimiento.
- Cada ficha lleva el aviso «no es asesoría legal».
- Se verifican la vigencia y el boletín 18.623-07 el día en que se escribe la ficha, y se revisa una vez al mes.
- Una ficha de 19 pasa a `verified` solo con la aprobación explícita de Felipe.

El schema actual no puede expresar ni validar nada de esto:

- `source_type` no tiene un valor para la legislación.
- Ninguna entidad declara a qué país se aplica.
- Las etiquetas de cada afirmación serían texto libre, sin control.
- Un artículo citado en el cuerpo no queda atado a la página oficial que lo contiene.

## Decisión

### 1. Tipo de fuente `legislative`

- **Enum.** `source_type` agrega `legislative`: textos legales oficiales, como BCN LeyChile, el Diario Oficial y el Senado o la Cámara (tramitación y boletines).
- **Validación.** Una fuente `legislative` exige:
  - `authority_level: 1`;
  - `jurisdiction`, que tiene exactamente un país;
  - `review_frequency: monthly`.
- **Uso.** Solo las entidades que declaran `jurisdiction` (punto 2) pueden citar fuentes `legislative`. Así 18-security y el resto de los dominios técnicos quedan sin citas legales, como se decidió para 18.

### 2. Campo `jurisdiction`

- **Schema.** `base.schema.json` agrega `jurisdiction`: una lista de códigos ISO 3166-1 alfa-2 con un enum nuevo, `jurisdiction` en `enums.schema.json`. El enum arranca solo con `CL`; agregar otro país pide un ADR nuevo.
- **Quién lo usa.** Es opcional para todas las entidades. Lo declaran las fichas cuyo contenido depende de una ley y las fuentes `legislative`.
- **Alcance.** Una ficha con `jurisdiction` debe estar en el dominio 19. Una ficha de otro dominio no lo puede declarar.

### 3. Base legal en el frontmatter: `legal_basis`

Las fichas con `jurisdiction` llevan `legal_basis`, una lista de los artículos en que se apoyan:

```yaml
legal_basis:
  - law: ley-21719            # slug de la norma (ver punto 7)
    article: "14 bis"         # como lo numera el texto oficial
    url: https://www.bcn.cl/leychile/navegar?idNorma=...   # debe ser la url de una cita de sources
    note: "Lo que dice el artículo, en paráfrasis breve."
```

Validación:

- `url` debe coincidir con una cita de `sources` cuya fuente sea `legislative` y tenga la misma `jurisdiction` que la ficha.
- Cada artículo del cuerpo (punto 4) debe estar en `legal_basis`, y cada entrada de `legal_basis` debe aparecer en el cuerpo.

### 4. Etiqueta en cada afirmación, en el cuerpo

La etiqueta va como prefijo en negrita al comienzo del ítem, del párrafo o de la celda. Se lee bien en el Markdown y el frontend la muestra sin cambios:

- `**[Obligación legal · art. 14 bis]**` (el artículo debe existir en `legal_basis`)
- `**[Buena práctica]**`
- `**[Decisión de arquitectura]**`

En las fichas con `jurisdiction`, la validación exige:

- **Etiquetas por sección.** Cada ítem y cada párrafo de §2, §3, §4 y §14 empieza con una etiqueta.
- **Tablas de §11–13.** Llevan una columna «Etiqueta».
- **Fuente de las obligaciones legales.** Las celdas de §11–13 no pueden tener una «Obligación legal» que no venga de `legal_basis`.

### 5. La cadena requisito → evidencia dentro de las 22 secciones

Se mantienen las 22 secciones de la plantilla, para no cambiar `page_sections` ni el frontend. Cada paso de la cadena se ubica en una sección:

| Paso | Sección |
|---|---|
| Requisito (artículo) | §2 Qué es |
| Implicancia técnica | §3 Problema que resuelve |
| Patrón o metodología | §4 Cómo funciona |
| Código en la CI | §10 Código |
| Herramientas | §11–13 (nubes), «no ejecutado», con fuente de cada lado |
| Evidencia de cumplimiento | §8, subsección obligatoria `### Evidencia de cumplimiento`: tabla de evidencia, dónde se guarda y quién la produce |

### 6. Avisos, vigencia, revisión mensual y aprobación

En las fichas con `jurisdiction`:

- **Aviso.** §1 contiene el texto «Esta ficha no es asesoría legal». La validación da error si falta.
- **Vigencia.** La cita de la norma en `sources` lleva en `note` la vigencia y el estado del boletín (18.623-07) con la fecha de consulta. Su `accessed` debe ser igual a `last_verified` de la ficha.
- **Revisión mensual.** Con `last_verified` de más de 31 días, `make validate` da un aviso y sugiere `potentially_outdated`.
- **Aprobación.** `verified` exige el campo `owner_approved_at` (una fecha). Lo registro solo cuando Felipe aprueba explícitamente y no lo infiero de ningún otro paso. Sin ese campo, la validación da error.

### 7. La norma como fuente, no como entidad nueva

La Ley 21.719 y la 21.663 no son un tipo de entidad nuevo:

- se citan como páginas de una fuente `legislative`, por ejemplo `bcn-leychile`, con su `page_title`;
- `law` en `legal_basis` es un slug estable de la norma (`ley-21719`, `ley-21663`), que se valida contra un enum `law` en `enums.schema.json`.

### 8. Contrato y base derivada (cambios aditivos)

- **Contrato.**
  - `SourceType` agrega `legislative`.
  - `ConceptDetail` y `PatternDetail` agregan `jurisdiction: string[]` (vacío si no aplica), `legal_basis: LegalBasis[]` y `owner_approved_at: Date | null`.
  - `Source` agrega `jurisdiction: string[]`.
- **Base derivada.**
  - La migración 0005 agrega `entities.jurisdiction`, `entities.owner_approved_at` y la tabla `entity_legal_basis`.
  - `COMPILER_VERSION` pasa a `"5"`.
- **Mocks.** Se regeneran con `make mocks`.

## Alternativas descartadas

- **Un tipo de entidad nuevo** (`legal_requirement`). Duplicaría la plantilla y las rutas del frontend. Además separaría el requisito de la técnica, que es justo lo que la ficha debe unir.
- **Las afirmaciones como una lista en el frontmatter.** Duplicaría el cuerpo y se desincronizaría. La etiqueta en el cuerpo, más `legal_basis` validado, da el mismo control.
- **Etiquetas solo en el cuerpo, sin `legal_basis`.** No permitiría comprobar que cada artículo citado sale de una página oficial.
- **Una sección 23 «Evidencia de cumplimiento».** Cambiaría `page_sections`, el contrato y el frontend en todas las fichas. Una subsección obligatoria en §8 basta.

## Consecuencias

- **Implementación** (cuando se apruebe), en Carril A:
  - schema y enums;
  - las reglas de `make validate`, con sus tests;
  - el contrato, la migración 0005, el compilador y los mocks;
  - las fuentes `legislative`, verificadas el día de escritura.
- **Pedido a Carril B:**
  - mostrar `legislative` como «Legislación · Nivel 1»;
  - un distintivo de `jurisdiction` (CL);
  - el aviso de §1 destacado;
  - la lista de `legal_basis` con enlace al artículo;
  - estilos para las tres etiquetas.
- **Ley en 18-security.** Sigue sin mencionar la ley; la regla del punto 1 lo garantiza al validar.
- **Riesgo.** La revisión mensual agrega trabajo fijo. El aviso de `make validate` lo hace visible sin bloquear.
- **Pendiente para el plan de 19, fuera de este ADR:**
  - el subdominio «Ingeniería de datos y Ley 21.719»;
  - sus fichas candidatas;
  - qué pasa con las fichas de 19 que ya están en el blueprint (`gdpr`, `lgpd`, `chile-data-protection` y otras).

## Notas de implementación (lote F3b-19a, 2026-10-21)

- `ConceptDetail` cubre concept y pattern (`kind`), así que los campos nuevos van ahí; no existe un `PatternDetail` aparte.
- Etiqueta con ley: si un artículo existe en más de una norma de `legal_basis`, la etiqueta la nombra: `**[Obligación legal · Ley 21.663, art. 9]**`. Sin ambigüedad basta `art. N`.
- `article` sin «art.» ni «°» (p. ej. `3`, `14 quinquies`, `16 quáter`).
- Las tablas de §2, §3, §4 y §14 también llevan la columna «Etiqueta», como las de §11–13.
- La viñeta de §14 admite la etiqueta antes del rótulo: `- **[Buena práctica]** **Seguridad:** ...`.
- Fuentes: `bcn-leychile` (texto oficial, con la versión «Con Vigencia Diferida por Fecha») y `senado-tramitacion` (boletines). `page_title` es el h1 que renderiza la página (por ejemplo «Ley 19628 SOBRE PROTECCION DE LOS DATOS PERSONALES» y «Boletín 18623-07»), no su `<title>` (ADR-012).
- `law` admite `ley-19628`: la Ley 21.719 (art. primero) reescribe la Ley 19.628, y los deberes del responsable se citan del texto de la 19.628 con vigencia diferida.

## Enmienda 1 — Implicancia técnica por artículo (2026-10-24)

Pedida por Felipe el 2026-10-24, junto con la aceptación de ADR-024.

- **Qué cambia.** Cada entrada de `legal_basis` lleva `implication`, obligatorio: la implicancia técnica del artículo para la plataforma de datos. Dice qué se construye o se controla (por ejemplo, «Guardar el consentimiento por finalidad, con fecha y versión») y no repite el texto legal; eso sigue en `note` y en el cuerpo, con su etiqueta.
- **No es una afirmación legal.** Es una consecuencia técnica, como una **[Buena práctica]**. No reemplaza la etiqueta del cuerpo ni cambia la regla de que cada artículo de `legal_basis` aparece en el cuerpo y viceversa.
- **Origen del texto en las 11 fichas de 19.** La columna «Implicancia técnica» de las tablas de `docs/briefs/upgrade-19/`, ajustada a los artículos corregidos. Ejemplos:
  - en el art. 34 ter, la k) en vez de la j);
  - en el art. 26, el reglamento de comunicación y cesión;
  - en el art. 28, sin «la Agencia no está instalada».

  Donde el brief no tiene esa columna, el texto sale de la tabla y del cuerpo de cada ficha:
  - `chile-data-protection` usa la columna «Qué implica para datos»;
  - `pii-identification` y `data-minimization-by-layer` no están en el brief;
  - el art. 9 de la Ley 21.663 en `data-breach-response` tampoco.
- **Schema.** `legal_basis_ref` en `base.schema.json` agrega `implication` (string, `minLength` 1) a `required`.
- **Contrato** (aditivo). `LegalBasis` agrega `implication: string`, requerido en la respuesta.
- **Base derivada.**
  - La migración 0006 agrega `entity_legal_basis.implication`.
  - `COMPILER_VERSION` pasa a `"6"`.
- **Pedido a Carril B.** Mostrar `implication` junto a cada artículo de la lista de `legal_basis`.

## Enmienda 2 — Alcance en los dominios 19 y 24 (2026-10-28, ADR-027)

- Las fichas de la Ley 21.719 pasan a `24-privacy-engineering`. Esta decisión rige en los dominios `compliance` (19) y `privacy-engineering` (24): `jurisdiction`, `legal_basis` con `implication`, la etiqueta por afirmación, el aviso «no es asesoría legal», la evidencia del §8, la cita legal consultada el día de `last_verified` y `verified` solo con `owner_approved_at`, que da Felipe.
- **Implementación:** `LEGAL_DOMAINS` en `backend/content/validate.py`; el error de `jurisdiction` nombra los dos dominios.
- **Actualización (2026-10-30, ADR-027 Enmienda 1):** 19 se integró al 24; el alcance queda solo en `privacy-engineering`.

## Enmienda 3 — Línea «Etiqueta: […]» para tablas uniformes en §4 y §11–13 (2026-10-30)

- Decisión de Felipe. En las tablas del §4 y de §11–13, la columna «Etiqueta» es obligatoria solo si las filas tienen etiquetas distintas. Si todas son iguales, la tabla va sin columna y lleva antes la línea `Etiqueta: **[…]**`. Una columna con la misma etiqueta en todas sus filas es un error en esas secciones.
- Sin cambios en §2, §3 y §14: allí cada tabla sigue llevando la columna.
- **Implementación:** `UNIFORM_SECTIONS` y `check_label_table` en `backend/content/validate.py`; la línea `Etiqueta:` no cuenta como párrafo sin etiqueta del §4. Tests en `tests/test_validate_legal.py`: caso uniforme con línea, columna uniforme, tabla sin columna ni línea, y la línea fuera de §4 y §11–13. Las tablas uniformes de las fichas del dominio 24 se convirtieron con una línea de historial.
- **Reemplazada por la Enmienda 4** el mismo día.

## Enmienda 4 — Tablas sin columna «Etiqueta» (2026-10-30)

- Decisión de Felipe. Reemplaza la columna «Etiqueta» del punto original y la Enmienda 3.
- Ninguna tabla de las fichas de privacidad, en ninguna sección, lleva columna «Etiqueta» ni línea `Etiqueta: **[…]**` antes.
- Una fila con origen legal empieza su primera celda con `**[Obligación legal · …]**`; esos artículos cuentan para el cruce con `legal_basis`. El resto de las filas va sin marca: ni «Buena práctica» ni «Decisión de arquitectura» dentro de una tabla.
- Sin cambios en los ítems y párrafos de §2, §3, §4 y §14, que siguen empezando con su etiqueta.
- **Implementación:**
  - `check_label_table` en `backend/content/validate.py` revisa todas las tablas del cuerpo. Da error si hay columna o línea «Etiqueta», si hay otra etiqueta en una celda, o si «Obligación legal» no está al inicio de la primera celda. Se quitan `TABLE_SECTIONS` y `UNIFORM_SECTIONS`.
  - Cuatro tests en `tests/test_validate_legal.py`.
  - Un script de una sola vez convirtió las tablas de las 17 fichas con `jurisdiction`, con una línea de historial en cada una y sin cambios de contenido.
- **Pedido a Carril B:** revisar que la lectura de las tablas en `/concepts/<slug>/` no dependa de la columna «Etiqueta».

## Enmienda 5 — Jurisdicciones EU y BR para los marcos comparados (2026-10-30)

- Decisión de Felipe (lote P4). Las fichas `gdpr` y `lgpd` del tramo 6 de 24, «Marcos regulatorios comparados», comparan cada marco con la Ley 21.719 desde la ingeniería de datos. No son resúmenes legales.
- **`jurisdiction`** acepta `EU` y `BR` además de `CL` (`schemas/enums.schema.json`). `EU` es el código que ISO 3166-1 reserva para la Unión Europea. Una ficha comparada declara las dos jurisdicciones cuyas normas etiqueta: `[CL, EU]` o `[CL, BR]`.
- **`law`** acepta `eu-2016-679` (RGPD) y `br-lei-13709` (LGPD).
- **Etiquetas:** `**[Obligación legal · GDPR art. N]**` y `**[Obligación legal · LGPD art. N]**`, sin coma, además de las chilenas. En las fichas comparadas, las chilenas nombran la ley (`Ley 19.628, art. N`), porque varios números de artículo existen en las dos normas.
- **Fuentes legislative nuevas**, con revisión mensual y un solo país:
  - `boe-doue` (EU): el BOE reproduce el DOUE y publica el RGPD en español, una de sus versiones auténticas.
  - `camara-legin` (BR): la Câmara dos Deputados publica el texto actualizado de la LGPD.
  - EUR-Lex y planalto.gov.br bloquearon la lectura automática el 2026-10-30. Si vuelven a responder, se pueden agregar como fuentes legislative sin otra enmienda.
- **Fuentes N1 `official_docs`:** `anpd-docs` (reglamentos de incidentes y de transferencias de la ANPD) y `ec-data-protection` (decisiones de adecuación de la Comisión).
- **Sin cambios:** aviso, evidencia del §8, etiqueta por afirmación, cita legal consultada el día de `last_verified`, revisión mensual y `verified` solo con `owner_approved_at`. Las citas van en su idioma original: el RGPD en español; la LGPD y la ANPD en portugués, con una traducción breve.
- **Implementación:**
  - `LABEL` y `FOREIGN_LAWS` en `backend/content/validate.py`.
  - Cuatro tests en `tests/test_validate_legal.py`: caso válido, artículo sin `legal_basis`, mismo número en dos leyes y cita no legislative.
- **Contrato (cambio aditivo):** `Jurisdiction` acepta `EU` y `BR`, y `LegalBasis.law` acepta `eu-2016-679` y `br-lei-13709`, en `docs/contracts/api.yaml`.
- **Pedido a Carril B:** regenerar `frontend/lib/api/schema.d.ts`, y que el superíndice y el enlace a la fila de la Base legal reconozcan «GDPR art. N» y «LGPD art. N».

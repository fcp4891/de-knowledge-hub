# ADR-027 — Dominio 24 · Ingeniería de privacidad · Ley 21.719

- **Estado:** Aceptado (decisión de Felipe en el lote A, 2026-10-28)
- **Fecha:** 2026-10-28
- **Fase:** F3b — Contenido por dominio
- **Referencias:**
  - ADR-003: blueprint (dominio → subdominio → concepto).
  - ADR-023: contenido con origen legal; esta decisión lo enmienda (Enmienda 2).
  - ADR-024: fichas padre e hijas; esta decisión lo enmienda (Enmienda 1).

## Contexto

Las 11 fichas de la Ley 21.719 (una padre y diez hijas) estaban en un solo subdominio de 19-compliance, en la capa Transversal. Con el upgrade y el lote P1 crecieron hasta ser un programa de estudio propio, con tramos de dificultad y cuatro fichas más por escribir. 19 sigue siendo el lugar del cumplimiento genérico: GDPR y LGPD están en el BACKLOG.

## Decisión

1. **Dominio nuevo `24-privacy-engineering`** («Ingeniería de privacidad · Ley 21.719»), en una banda nueva, **Especialización**, fuera de las 6 capas. El dominio lo declara en el blueprint con `band: especializacion`. La UI decide cómo mostrar la banda; este ADR solo entrega el dato.
2. **Cinco subdominios (tramos), en este orden:**

   | Tramo | Fichas |
   |---|---|
   | `fundamentos` | `chile-data-protection` (padre), `pii-identification`, `processing-activities-inventory` |
   | `diseno-protegido` | `data-minimization-by-layer`, `chilean-identifier-pseudonymization`, `purpose-based-authorization` (nueva) |
   | `derechos-ciclo-vida` | `data-subject-rights-pipeline`, `distributed-erasure-propagation` (nueva), `retention-and-erasure`, `privacy-backup-and-recovery` (nueva) |
   | `riesgo-terceros-incidentes` | `processors-and-international-transfers`, `dpia-and-automated-decisions`, `data-breach-response` |
   | `evidencia-automatizacion` | `privacy-controls-as-code`, `privacy-in-ai-rag-llm` (nueva) |

3. **Las 11 fichas se mueven sin cambiar su contenido.** Solo cambian `domain` y `subdomain`, la nota de la relación PART_OF («Ficha padre del dominio»), la primera frase de la descripción de la padre, y se agrega una línea de historial a cada ficha. Siguen en `review_required`.
4. **Las 4 fichas nuevas** quedan en el blueprint como entradas «pendiente de ficha» (`added_by: blueprint`). Así el §17 de las existentes puede nombrarlas sin romper la CI.
5. **19-compliance se queda en Transversal** con el subdominio `regulatory-frameworks` (GDPR y LGPD, en el BACKLOG).
6. **Laboratorio integral** de privacidad: entrada en el backlog de F4, con fuente `docs/briefs/privacy-program/06-laboratorio-integral-gcp.md`.
7. **Marco legal como dato para la UI.** El directorio de estructura `content/legal-frameworks/` guarda un archivo por marco legal (`legal-framework.schema.json`). El dominio lo referencia con `legal_framework`. Cada hecho (la ley, la vigencia, el estado del proyecto de postergación) lleva:
   - su URL de Nivel 1 (BCN, Senado o Cámara; el schema lo exige con un patrón);
   - una fuente `legislative` del registro;
   - su `verified_at`.

   Los valores se verifican el día que se escriben: no se suponen.
8. **API y base de datos:**
   - `DomainSummary` gana `band` (`especializacion` o `null`).
   - `DomainDetail` gana `legal_framework` (el documento o `null`).
   - La migración 0007 agrega `domains.band` y `domains.legal_framework`, y crea la tabla `legal_frameworks`.
   - `COMPILER_VERSION` pasa a "7".
   - No hay endpoint nuevo.
9. **URLs antiguas.** La ficha se publica en `/concepts/<slug>/`, que no depende del dominio, así que su URL no cambia. Aun así, la demo estática incluye `/explorer/compliance/<slug>/` para las 11 fichas: una página sin JavaScript con `canonical` y `meta refresh` hacia `/concepts/<slug>/` (`scripts/static/redirects.py`). Se agrega al zip al empaquetar, sin tocar `frontend/`.

## Enmiendas

- **ADR-023, Enmienda 2:** su alcance pasa a ser «dominios 19 y 24». `jurisdiction`, `legal_basis`, las etiquetas por afirmación, el aviso, la cita legal consultada el día de `last_verified` y `owner_approved_at`, que solo da Felipe, rigen en `compliance` y en `privacy-engineering`.
- **ADR-024, Enmienda 1:** la ficha padre debe ser **del mismo dominio**. Ya no se exige que esté en el mismo subdominio: en 24, la padre abre el primer tramo y las hijas están en los cinco. Las demás reglas siguen igual: a lo sumo una padre, sin ciclos, y la padre nombra a todas sus hijas en el §17.

## Alternativas descartadas

- **Un subdominio más dentro de 19:** mezcla la especialización chilena con el cumplimiento genérico y no permite tramos.
- **Una capa nueva entre las 6:** las capas ordenan el oficio general de data engineering; esto es una especialización transversal a él.
- **Redirigir en `.htaccess`:** lo escribe el build de Carril B (`frontend/`); la página estática funciona en cualquier hosting.

## Consecuencias

- 24 dominios en el blueprint; los tests que contaban 23 cuentan 24.
- La UI puede leer `band` y `legal_framework` sin cambios en el contrato de las demás rutas. La presentación es de Carril B.
- Cuando cambie el estado del proyecto de postergación, se vuelve a verificar y se actualiza `content/legal-frameworks/cl-ley-21719.yaml`.

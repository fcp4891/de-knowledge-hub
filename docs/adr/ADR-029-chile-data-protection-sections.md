# ADR-029 — Secciones omitidas y anexo en chile-data-protection

- **Estado:** Aceptado (decisión de Felipe, 2026-11-06)
- **Fecha:** 2026-11-06
- **Fase:** F3b — dominio 24 «Ingeniería de privacidad», ficha padre
- **Referencias:** plan maestro §22 (22 secciones), ADR-002 (contrato), ADR-012 (`page_title`), ADR-023 (contenido legal), ADR-024 (fichas padre e hijas), ADR-027 (dominio 24).

## Contexto

Felipe pidió depurar `chile-data-protection`, solo eliminando o acortando contenido. Seis secciones salen completas:

- 6 Cuándo no utilizarlo;
- 7 Ejemplo sencillo;
- 8 Ejemplo de producción;
- 15 Errores frecuentes;
- 17 Conceptos relacionados;
- 19 Laboratorio relacionado.

Además, el catálogo legal agrupado por tema sale del §2 y pasa a un anexo al final de la ficha.

Con la regla actual, la ficha no valida: toda ficha `concept` o `pattern` que no es stub lleva las 22 secciones de la plantilla.

Hay un segundo problema en las citas del boletín 18.623-07. Sus dos títulos de página son casi iguales: «Boletín 18623-07» y «Boletín N° 18.623-07». El `page_title` copia el H1 de la página (ADR-012), así que no se puede cambiar para distinguirlas.

## Decisión

### 1. Enmienda a la regla de plantilla: solo chile-data-protection

- **Secciones que puede omitir.** `chile-data-protection` puede omitir las secciones 6, 7, 8, 15, 17 y 19. Las demás secciones siguen siendo obligatorias, y todas las demás fichas siguen con las 22.
- **Dónde se fija.** La excepción vive en `backend/content/page_sections.py`, en la constante `OMITTABLE`. Por ahora es la única entrada; agregar otra ficha exige enmendar este ADR.
- **Numeración.** Los encabezados conservan el número de la plantilla, por ejemplo `## 9. Arquitectura`. Así no cambian las claves de la API, los anclas `#sN` ni el progreso guardado.
- **Reglas que dejan de aplicarse.** Si falta el §8, no se exige su subsección «Evidencia de cumplimiento» (ADR-023). Si falta el §17, no se aplica la regla del §17; ya era así para cualquier ficha sin §17.

### 2. Anexos

- **Formato.** Un anexo es un encabezado `## Anexo · Título` que va después de la última sección y no puede estar vacío.
- **Quién puede usarlos.** Solo las fichas de `OMITTABLE`, es decir, hoy solo esta.
- **Validación.** El validador no cuenta el anexo como parte del §22.
- **API.** La proyección lo entrega aparte, en `annexes: [{title, markdown}]`. La propiedad solo aparece si la ficha tiene anexos, así que la forma de las demás fichas no cambia.

### 3. Rótulo de la cita

- **Campo.** `source_ref` admite un `label` opcional de 1 a 40 caracteres.
- **Cuándo se usa.** Distingue dos citas cuyos títulos de página son casi iguales. Aquí son «tramitación» y «mensaje».
- **API.** La API lo devuelve solo si la cita lo trae.
- **UI.** El texto del enlace pasa a ser `page_title · label`.

### 4. UI: solo para esta ficha

- **Índice.** Las secciones omitidas no aparecen. Los grupos que quedan vacíos se ocultan; eso ya funcionaba así.
- **Numeración visible.** Es correlativa: el número que se muestra es la posición de la sección entre las presentes.
- **Progreso.** «Leído N de M» usa como M la cantidad de secciones presentes, y N cuenta las presentes leídas.
- **Anexo.**
  - Va al final, plegado, sin número y fuera del índice.
  - El catálogo legal conserva su componente: búsqueda, filtros por tema y modal del artículo.
  - El modal sigue en el §2, así que un enlace `#lb-…` lo abre aunque el anexo esté cerrado.
- **Tabla sin encabezado.** Si todas las celdas del encabezado de una tabla están vacías, no se dibuja el `thead`. Así queda la tabla de preguntas del §1 sin su fila de encabezado.

## Consecuencias

- La ficha valida con 16 secciones y un anexo. Un test cubre cada regla: omitir solo esas seis, solo en esta ficha, anexo al final y no vacío, `annexes` y `label` solo cuando existen.
- Los mocks no cambian, salvo los de esta ficha: ninguna otra trae `annexes` ni `label`.
- El recorrido del dominio en el explorador muestra «sección N de 22» según el número de la plantilla. Este ADR no lo cambia.

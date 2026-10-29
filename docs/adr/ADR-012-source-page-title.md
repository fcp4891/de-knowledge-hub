# ADR-012 — Título de la página en cada cita (`page_title`)

- **Estado:** Aceptado
- **Fecha:** 2026-10-13
- **Fase:** F3b — Contenido por dominio (pedido de Felipe)
- **Referencias:** ADR-002 (contrato), ADR-010.

## Contexto

En la §20 de las fichas, cada cita se muestra con el título de la fuente del registro (`SourceRef.title`). Una ficha de BigQuery cita varias páginas de `gcp-bigquery-docs`, y todas aparecen como «BigQuery documentation · Nivel 1»: los links son distintos y no se distinguen. Se comprobó con los mocks: `bigquery-partitioning` tiene 5 URLs distintas con ese mismo título.

## Decisión

1. **Esquema.** Cada elemento de `sources` admite `page_title` (string de 1 a 300 caracteres, opcional): el título de la página citada, tal como lo muestra la página (su encabezado principal; si no tiene, su `<title>`). No se inventa: si no se pudo verificar, el campo se omite.
2. **Contrato (cambio aditivo).** `SourceRef` incluye `page_title: string | null`. `title` sigue siendo el título de la fuente del registro.
3. **Base derivada.** `entity_sources.page_title` (migración 0004); `COMPILER_VERSION` pasa a `"4"`.
4. **Validación.** `make validate` avisa (sin fallar) si una entidad tiene dos citas con la misma URL o el mismo `page_title`.

## Consecuencias

- El frontend puede mostrar `page_title` como link principal y «registro · Nivel N» como línea secundaria; sin `page_title`, la ruta de la URL (pedido a Carril B en `docs/status/lane-a.md`).
- Las citas nuevas llevan `page_title` desde su creación.

## Enmienda 1 (2026-10-28)

- Un H1 de banner, aviso o navegación no cuenta como encabezado principal; en ese caso se usa el `<title>` sin el nombre del sitio (p. ej. OWASP: «LLMRisks Archive»).

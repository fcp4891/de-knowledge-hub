# ADR-006 — Estado personal (/me)

- **Estado:** Aceptado
- **Fecha:** 2026-09-30
- **Fase:** F2 — Plataforma MVP (tarea A-F2.4)
- **Referencias:** plan maestro §37, §38; ADR-000, ADR-002, ADR-005.

## Contexto

El seguimiento personal de §37 incluye: estados manuales (sin quizzes ni notas numéricas), fecha del último estudio, "pendiente de profundización", notas personales y favoritos. Es dato de uso, no conocimiento. ADR-000 lo deja fuera de `content/` y lo guarda en PostgreSQL. El contrato (ADR-002) ya definía las lecturas, `PUT` de estado y favoritos, y `POST` de notas.

## Decisión

1. **Tablas propias, independientes del contenido** (migración `0003`): `me_study_states`, `me_notes` y `me_favorites`.
   - No tienen clave foránea a `content_files` ni a `entities`. El compilador nunca las toca: ni una recompilación completa ni borrar un archivo de `content/` las modifican. Lo verifica un test.
   - Se consultan con SQL en cada petición; no usan el índice en memoria de ADR-005.
2. **Usuario único con `user_id` en la clave primaria.** Todas las tablas `me_*` tienen `user_id` como parte de la PK, con valor fijo `default`. La API no lo expone. Pasar a varios usuarios no requerirá migrar datos.
3. **Qué slugs admiten estado personal:** los conceptos del blueprint y las tecnologías (`technology` y `cloud_service`). Cualquier otro slug devuelve 404.
4. **Slugs que dejan de existir** (concepto o tecnología borrados o renombrados en `content/`):
   - el estado **se conserva** en la base, porque es del usuario;
   - **se oculta** de los listados, para no mostrar enlaces rotos;
   - `GET /me/.../{slug}` devuelve 404.

   Si el slug vuelve a existir, el estado reaparece.
5. **Semántica:**
   - `PUT /me/study-state/{slug}` reemplaza el registro y es idempotente. `pending_deep_dive` vale `false` si no viene.
   - **`last_studied_at` lo fija el cliente.** Si el cuerpo no lo trae, se conserva el valor anterior; el servidor nunca lo inventa.
   - Un slug sin registro devuelve `not_reviewed`, con las fechas en `null`.
   - Los listados van del más reciente al más antiguo (`updated_at`). `GET /me/favorites` solo muestra los marcados.
   - Las fechas se devuelven en UTC con sufijo `Z`. Solo llevan milisegundos si los tienen, así una fecha enviada por el cliente vuelve tal cual.
6. **Cambio de contrato (aditivo):**
   - `PUT /me/notes/{slug}/{note_id}` (esquema `NoteUpdate`) y `DELETE /me/notes/{slug}/{note_id}` (204);
   - el `note_id` es un uuid generado por el servidor y solo vale junto con su slug: una nota de otro slug devuelve 404;
   - se agrega el mock del `PUT` de nota; los existentes no cambian.
7. **Mocks de `/me`:** la API reproduce el estado de ejemplo de los mocks. Los tests comparan las respuestas ignorando los campos que genera el servidor (`updated_at`, `created_at` e `id`).

## Consecuencias

- El respaldo del estado personal (§49 "backups") pasa a ser necesario: es el único dato que no se puede regenerar desde Git. Queda en BACKLOG.
- Borrar el volumen de Docker (`dekh-pgdata`) borra el estado personal. `make db-down` conserva el volumen.

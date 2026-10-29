# Revisión · espacio de privacidad

Rama `b/review-ui-privacy`, creada desde `73b67ee` (`origin/b/ui-privacy-space`). No se editó `content/` ni `frontend/`. Estado: pendiente de la aprobación de Felipe.

## Común

`/privacidad` arma la página con el mismo `DomainRoute` que `/explorer/[slug]` (el de `ai-for-data-engineering`): etapas desde los subdominios, fichas en `/concepts/<slug>/`, pendiente como `div`, siguiente recomendado, búsqueda por dominio y miga Inicio / Rutas. El aviso del espacio es «Este contenido no es asesoría legal.»; el de las fichas sigue en `frontend/lib/legal.ts` («Esta ficha no es asesoría legal»). En mock y en static no se llama a `/me` (`API_MODE === "mock"` también en el explorador).

El mock `privacy-engineering.json` tiene 15 `has_page` y ninguno en `false`.

Tests de `tests/frontend/privacySpace.test.ts`:

```
✔ una fecha ISO se muestra como DD-MM-AAAA y el resto del hecho no se reescribe
✔ la leyenda usa la verificación más antigua
✔ el objetivo ley21719 recorre los tramos de 24 y no apunta a 19
ℹ pass 3
ℹ fail 0
```

La suite completa (`node --test tests/frontend/*.test.ts`) queda en 28 pruebas verdes y 2 que no arrancan: falta `happy-dom` y `minisearch` en `frontend/node_modules` de este checkout. No son aserciones de esta rama.

A 390 px no medí un viewport renderizado (el dev server necesita esas dependencias). El CSS de Inicio y de la ruta usa `max-width: 100%`, `min-width: 0` y la fila de estaciones en `.home-stations-scroll` con `overflow-x: auto`. El mismo patrón ya contenía las capas de 5 estaciones.

## Por pieza

### `/privacidad` y el estándar de la ruta

**Hallazgo.** Sin hallazgo de estructura. La cabecera propia (banda, aviso, caja Comprender → Aplicar → Demostrar → Profundizar y laboratorio deshabilitado) se suma al layout de la ruta; no lo reemplaza.

**Severidad.** ninguna

**Evidencia.** `frontend/app/privacidad/page.tsx` llama a `DomainRoute` con las etapas de `getDomain("privacy-engineering")`. `frontend/app/explorer/[slug]/page.tsx` usa el mismo componente. `STUDY_PATH` es `Comprender`, `Aplicar`, `Demostrar`, `Profundizar`. `PRIVACY_LAB` entra como `disabledStage` una sola vez.

**Corrección.** Ninguna.

### Banda «Especialización» en el mapa

**Hallazgo.** Sin hallazgo. La banda queda fuera de las 6 capas y el dominio 24 no entra en ninguna. El 19 sigue en Transversal. Las estaciones son los títulos de los tramos que vienen del detalle del dominio.

**Severidad.** ninguna

**Evidencia.** `LAYERS` no incluye `'24'`. Transversal sigue con `'19'`. `PlatformMap` pinta `SpecializationBand` cuando `domain.band === "especializacion"`, antes de las capas. El test `privacySpace` afirma lo mismo (`LAYERS.every` sin 24, y 19 en transversal).

**Corrección.** Ninguna.

### Tarjeta del marco legal en Inicio

**Hallazgo.** En `73b67ee` la tarjeta salió de Inicio. En `babd720` se leía de `legal_framework` (etiqueta, valor y `verified_at`), sin textos fijos de los tres hechos. En `/privacidad` la tarjeta sigue leyendo el mismo objeto, y no enlaza la `url` de cada hecho.

**Severidad.** media en Inicio; baja en el enlace de cada hecho.

**Evidencia.** El diff `babd720..73b67ee` borra `legalFacts` en `frontend/app/page.tsx` y `LegalFrameworkCard` en `HomeScreen.tsx`. Hoy `HomeScreen` no nombra `legal_framework`. `LegalCard` en `privacidad/page.tsx` imprime `fact.label` y `displayFactValue(fact.value)`. El mock trae `url` en cada hecho (BCN y Senado) y el componente no la usa.

**Corrección.** Volver a mostrar en Inicio la tarjeta armada con `legal_framework` del dominio, y enlazar cada hecho a su `url`.

### Objetivo 7

**Hallazgo.** Sin hallazgo. Es el séptimo ítem de `GOALS`, clave `ley21719`, cinco pasos del dominio 24 por tramo. Inicio recorre `GOALS`, así que la tarjeta entra en «Elige un objetivo».

**Severidad.** ninguna

**Evidencia.** `learning-paths.ts`, líneas 113–125. El test compara los cinco `stage` y comprueba que `nextDistinctDomain` de ese objetivo no apunta a 19.

**Corrección.** Ninguna.

### Contraste del token

**Hallazgo.** En oscuro, `--band-especializacion` pasa a `#E4C0EA` y el punto de estación completo usa ese color de fondo con texto blanco. El contraste es 1.61:1.

**Severidad.** media

**Evidencia.** `tokens.css`: en claro `#7C3A6E` y `#5C234F`; en `prefers-color-scheme: dark` solo cambia el primero a `#E4C0EA`. `.home-station-dot` tiene `color: #fff` y `[data-fill="complete"]` usa `background: var(--layer-color)`, que en la banda es `--band-especializacion`. Ratios calculados: blanco sobre `#7C3A6E` 7.81:1; blanco sobre `#5C234F` 11.61:1; blanco sobre `#E4C0EA` 1.61:1. El rótulo (color del token, no fondo) queda en 7.20:1 sobre `#F5F6F3` y 11.42:1 sobre `#12141A`.

**Corrección.** En oscuro, el fondo que lleva texto blanco tiene que seguir siendo un color con al menos 4.5:1. El pastel `#E4C0EA` sirve como color de texto o de línea, no como fondo de ese número.

### 390 px

**Hallazgo.** Sin hallazgo en el CSS. No hay un ancho fijo de página por encima de 390 px. Las estaciones largas scrollean dentro de la fila.

**Severidad.** ninguna

**Evidencia.** `.home` y `.route`: `max-width: 100%` y `min-width: 0`. `.home-stations` tiene `min-width: calc(var(--station-count) * 92px)` dentro de `.home-stations-scroll` (`overflow-x: auto`, `min-width: 0`). A 390 px el menú es la barra superior; la columna lateral entra desde 1024 px.

**Corrección.** Ninguna.

# Rediseño UI — DE Knowledge Hub · paquete para Carril B (Cursor)

**Fecha:** 07-10-2026 · **Alcance:** solo `frontend/` · **Rama sugerida:** `b/ui-redesign` desde `main`
**Debe funcionar en los dos modos:** `hybrid` (API local) y `static` (demo en cPanel con `BASE_PATH`).

## Contenido del paquete

| Archivo | Qué es | Cómo usarlo |
|---|---|---|
| `README.md` | Esta especificación | Fuente de verdad del comportamiento |
| `tokens.css` | Colores, tipografía, radios, espacios | Copiar a `frontend/styles/tokens.css` |
| `learning-paths.ts` | Capas del mapa, 6 objetivos, grupos del índice de la ficha | Copiar a `frontend/lib/learning-paths.ts` |
| `referencias/01-inicio.dc.html` | Maqueta Inicio v2 | Referencia de markup, estilos y lógica |
| `referencias/02-ruta-dominio.dc.html` | Maqueta Ruta de dominio | Ídem |
| `referencias/03-ficha.dc.html` | Maqueta Ficha en modo lectura | Ídem |

Las maquetas son **referencia visual y de comportamiento**, no código para copiar. Usan un formato de diseño propio (`<x-dc>`, `<sc-for>`, `{{ hueco }}`, clase `Component` con `renderVals()`): los estilos inline dan los valores exactos y `renderVals()` muestra la lógica. No se abren solas en el navegador; para verlas renderizadas, Felipe adjunta capturas del lienzo de diseño.

Los datos de las maquetas son ilustrativos: todo número, estado o texto de ficha sale de la API real.

---

## Principios (no negociables)

1. **Una acción principal por pantalla.** Lo secundario queda visualmente por debajo.
2. **Carga cognitiva baja:** poca información a la vez; lo demás, colapsado o a un clic.
3. **Progreso visible sin gamificación:** nada de puntos, rachas ni porcentajes de "dominio".
4. **El estado no depende solo del color:** forma o texto lo acompañan siempre.
5. **Accesible:** contraste AA, objetivos táctiles ≥ 44 px, foco visible, `aria-pressed` / `aria-expanded` / `aria-current`, todo navegable con teclado.
6. **Móvil primero en el layout:** nada con anchos fijos que rompa a 375 px.

---

## Estructura global

- **Menú lateral** (≥ 1024 px; en móvil, barra superior con menú desplegable):
  logo "Knowledge Hub · Data Engineering", botón **Buscar (Ctrl K)** que abre la búsqueda existente, y los enlaces **Inicio · Rutas · Repaso (contador de "necesita repaso") · Snippets**.
  **Se elimina la lista de dominios del menú**, porque duplicaba el mapa.
- Tipografía: IBM Plex Sans en la interfaz, Source Serif 4 solo en el cuerpo de lectura de la ficha y JetBrains Mono en código y códigos de dominio.
- Fondo `--bg`; tarjetas y paneles en `--surface` con borde `--border`.

---

## Pantalla 1 · Inicio (`/`)

Referencia: `01-inicio.dc.html`.

### Bloques, en orden
1. **Encabezado:** fecha, "¿Qué quieres hacer hoy?" y la bajada "Elige un camino. Todo lo demás espera."
2. **Continuar donde quedaste** (tarjeta oscura, acción principal): el concepto en estado *Revisando* con `last_studied_at` más reciente. Muestra el dominio y el subdominio, la última sección leída ("Ibas en la sección N de 22: «título»"), una barra de progreso de lectura y el botón **Continuar →** a `/concepts/<slug>`.
   - El progreso de lectura se guarda en el cliente (ver Ficha). Si no existe, se omite la línea de sección.
   - Si no hay ningún concepto *Revisando*, la tarjeta no aparece.
3. **Elige un objetivo:** grilla de tarjetas (`minmax(300px, 1fr)`) con los 6 `GOALS`. Cada tarjeta muestra el título, una etiqueta de nivel con el color de su nivel, la descripción, los requisitos y "N pasos".
   - Clic: selecciona (fondo `--ink`, texto blanco, `aria-pressed="true"`). Clic sobre la seleccionada: **deselecciona** y todo vuelve al estado neutro.
   - Debajo, una línea: "Próximamente: Pipeline en GCP (…) y Entrevista para un rol (…)", desde `UPCOMING_GOALS`.
   - El objetivo elegido se recuerda en `localStorage` (envuelto en try/catch).
4. **Tu itinerario** (izquierda, ~380 px) + **Mapa de la plataforma** (derecha, flexible). En móvil, el itinerario va arriba.

### Itinerario
- **Con objetivo:** el texto de requisitos y una lista ordenada. Cada paso lleva:
  - un número en un círculo con el color **`dark` de su capa** (texto blanco);
  - el nombre del dominio y una etiqueta **Esencial** (fondo oscuro) o **Complementario** (fondo suave);
  - debajo, "Capa · estado de contenido": *Completo*, *En construcción · x/y* o *Próximamente*;
  - un conector vertical gris entre pasos.

  Cierra con el botón **"Empezar por <primer paso>"** (cuidado con el espacio) a `/explorer/<dominio>`.
- **Sin objetivo:** un recuadro "Sin objetivo elegido" con el texto de ayuda que sugiere «Empiezo desde cero». Sin botón.

### Mapa de la plataforma
- Una fila por capa de `LAYERS`, en ese orden. A la izquierda va el nombre de la capa con su color y "x/y fichas" (la suma de sus dominios). La fila *Cimientos* lleva el fondo `--layer-cimientos-bg`.
- **Estaciones**, en una grilla de N columnas iguales (`minmax(92px, 1fr)`, con scroll horizontal si no caben). Cada estación es:
  - una línea izquierda, el círculo de 32 px y una línea derecha. **Las líneas se dibujan por estación** (sin posiciones absolutas), así no se desalinean al cambiar el ancho. La primera estación no tiene línea izquierda y la última no tiene derecha;
  - el círculo lleva un borde de 4 px del color de la capa y un relleno proporcional a `con ficha / total`: `conic-gradient(color p%, #fff 0)`. Va lleno si está completo y en blanco si no tiene contenido;
  - debajo, el nombre corto (`SHORT_NAMES`).

  Toda la estación es un enlace a `/explorer/<dominio>`.
- **Con objetivo:**
  - las estaciones del recorrido se rellenan con el `dark` de su capa y muestran el número de paso en blanco, con el nombre en negrita;
  - las demás quedan con el borde y la línea al 25 % de opacidad del color y el nombre en `--ink-disabled`;
  - un segmento de línea se pinta con el color pleno **solo si une dos pasos del recorrido**; si no, va tenue.
- **Sin objetivo:** todo en color pleno, sin números.

### Datos
- Dominios, nombres y "con ficha / total": desde `/domains` (o `/concepts?domain=&has_page=`), según lo que exponga el contrato. Si falta un campo, anótalo como pedido a Carril A en `lane-b.md`; **no lo inventes**.
- Estado de estudio: desde `/me/study-state` (en `static`, desde `localStorage`, como hoy).

---

## Pantalla 2 · Ruta de dominio (`/explorer/[dominio]`)

Referencia: `02-ruta-dominio.dc.html`. Reemplaza la vista actual del Explorer por dominio.

### Bloques
1. **Migas de pan:** Inicio / Rutas / NN Dominio. A la derecha, el botón "Buscar en este dominio", que abre la búsqueda con el filtro del dominio.
2. **Cabecera:** "Dominio NN · E etapas · C conceptos", el título y la descripción. Debajo, tres píldoras:
   - "x de y fichas verificadas" (verde);
   - "N comprendidos por ti";
   - "N para repasar" (ámbar), que se oculta si es 0.
3. **Ruta vertical** (columna principal): una **etapa por subdominio**, en el orden del blueprint.
   - Marcador numerado de 40 px:
     - lleno de acento si todos los conceptos de la etapa están comprendidos;
     - con borde de acento si la etapa ya empezó;
     - gris si no.
   - Una línea vertical une las etapas; va en color de acento cuando la etapa anterior está completa.
   - Encabezado de etapa: título y "x de y comprendidos".
   - Los conceptos van en una grilla `minmax(210px, 1fr)`, **ordenados de básico a avanzado** y, dentro del mismo nivel, en el orden del blueprint.
4. **Columna lateral:**
   - tarjeta oscura **Siguiente paso recomendado**: título, una frase de por qué, nivel, ~min de lectura y botón **Empezar**;
   - **Para repasar**: los conceptos en *Necesita repaso*, con "hace N días" desde `last_studied_at`;
   - **Cómo leer la ruta**: la leyenda de estados.

### Tarjeta de concepto: estados

| Estado de estudio (API) | Visual | Texto |
|---|---|---|
| Comprendido / Aplicado | círculo lleno de acento con ✓ | "Comprendido" o "Aplicado" |
| Revisando | círculo medio lleno, borde de acento | "Estudiando · sección N de 22" si hay progreso |
| Necesita repaso | círculo ámbar con ↺, fondo de tarjeta ámbar suave | "Necesita repaso" |
| No revisado | círculo vacío gris | "Sin estudiar" |
| *Siguiente recomendado* | flecha →, fondo acento suave, borde de 2 px | "Siguiente recomendado" |

- **Concepto sin ficha** (`has_page: false`): la tarjeta no es enlace. Va con opacidad reducida y la etiqueta "Ficha pendiente".
- **Regla del siguiente recomendado:** el primer concepto **con ficha** y no comprendido, recorriendo las etapas en orden y, dentro de cada una, de básico a avanzado. Si todo está comprendido, la tarjeta dice "Dominio completo" y sugiere el siguiente dominio del objetivo activo, si lo hay.
- Usa los nombres de enum que define el contrato para los estados; la tabla describe solo su significado.

---

## Pantalla 3 · Ficha en modo lectura (`/concepts/[slug]`)

Referencia: `03-ficha.dc.html`.

### Layout de tres columnas
Índice (~250 px) · lectura (flexible, máximo `70ch`, centrada) · panel "Tu estudio" (~300 px). En móvil se apilan: lectura, panel y, al final, el índice como desplegable al inicio.

### Barra superior
Migas de pan (Inicio / NN Dominio / Subdominio / Concepto) y, a la derecha, "Leído N de 22" con su barra.

### Índice lateral
- Las 22 secciones agrupadas según `CARD_SECTION_GROUPS`: Entender, Aplicar, Multicloud, Profundizar, Practicar y Referencias.
- Cada ítem muestra el número en mono y el título, y enlaza a su ancla. La sección actual se resalta con `--accent-soft` (IntersectionObserver); las ya leídas van en `--ink-muted`.
- Las secciones vacías o ausentes no se listan.

### Columna de lectura
1. **Cabecera:**
   - etiquetas de clasificación, nivel y MVP, y la de estado: *Verificada · fecha* (verde) o *En revisión* (ámbar);
   - el título en `--text-display`;
   - "~N min de lectura · N fuentes oficiales". La lectura se estima en palabras / 200, redondeado.
2. **Resumen (sección 1):** tarjeta blanca siempre visible, en serif a 19 px.
3. **Secciones 2 a 22:** el título como h2 con su número.
   - Abiertas por defecto: **1, 3 y 10**, y el bloque **Multicloud** (11 a 13) como pestañas **GCP / AWS / Azure** (`role="tablist"`, flechas del teclado).
   - El resto colapsado en `<details>` (52 px, número en mono).
   - Botón "Expandir todo / Contraer todo" encima de las secciones.
4. **Código:** bloque oscuro (`--ink`) con una barra que muestra lenguaje y descripción, el botón **Copiar** y el resaltado actual. Reutiliza el componente existente.
5. **Pie de acción:**
   - acción principal **Marcar como comprendido** (acento);
   - acción secundaria **Necesita repaso**;
   - a la derecha, **"Siguiente en la ruta: <concepto> →"**: el concepto siguiente según el orden de la Pantalla 2.

### Progreso de lectura
- Se guarda en `localStorage` como `dekh:reading:<slug>`, con la mayor sección vista y su fecha.
- Alimenta "Leído N de 22" y la tarjeta "Continuar donde quedaste" del Inicio.
- Sirve igual en `hybrid` y `static`, sin tocar la API.

### Panel "Tu estudio"
- **Tu estado:** radiogroup con los estados del contrato (incluido *Aplicado* si existe), que **se guarda al cambiar**. Debajo, la casilla "Pendiente de profundizar" y el texto "Se guarda al cambiar."
- **Tus notas:** las notas existentes con editar y borrar (ya implementado) y un textarea para una nota nueva. En `static`: "En la demo, tus notas se guardan solo en este navegador."
- **Relacionados:** hasta ~6 relaciones de `/entities/{slug}/relations`, con su tipo (concepto o patrón), y el enlace "Ver todas" que abre el grafo existente.

---

## Fuera de alcance (no hacer)

- Modo oscuro.
- Objetivos GCP y Entrevista (solo el texto "Próximamente").
- Cambios en el backend, el contrato, `content/` o el blueprint.
- Contenido inventado: si un dato no está en la API, se muestra vacío o se pide a Carril A.

---

## Plan de entrega sugerido (un commit por paso)

1. Tokens, fuentes, layout global y menú lateral sin la lista de dominios.
2. Inicio: Continuar, objetivos, itinerario y mapa.
3. Ruta de dominio.
4. Ficha en modo lectura y progreso de lectura.
5. Pasada de responsive y accesibilidad; build `hybrid` y `static` con `BASE_PATH`.

## Criterios de aceptación

- [ ] Lint y los dos builds en verde.
- [ ] Inicio: elegir y deseleccionar un objetivo deja el estado neutro, sin restos de numeración ni opacidad.
- [ ] Itinerario: los números van en el color oscuro de su capa y el botón dice "Empezar por X", con espacio.
- [ ] Mapa: no se desalinea entre 375 px y 1440 px, y las capas largas hacen scroll horizontal.
- [ ] Ruta: los conceptos sin ficha no son enlace y el "Siguiente recomendado" cumple su regla.
- [ ] Ficha: el índice resalta la sección actual, las pestañas multicloud funcionan con teclado y el progreso persiste al recargar.
- [ ] Probado en Chrome normal (no en el navegador de Cursor) en `hybrid` y en `static` bajo `/aprendizaje-continuo/`.
- [ ] `docs/status/lane-b.md` actualizado, con los pedidos a Carril A si faltan campos.

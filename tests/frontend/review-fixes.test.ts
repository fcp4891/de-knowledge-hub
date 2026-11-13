import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { loadTsx } from "./load-tsx.ts";

const requireFromFrontend = createRequire(pathToFileURL(join(import.meta.dirname, "../../frontend/package.json")).href);
const React = requireFromFrontend("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server") as typeof import("react-dom/server");
const ficha = join(import.meta.dirname, "../../frontend/components/ficha");
const read = (path: string) => readFileSync(join(import.meta.dirname, "../..", path), "utf8");
const html = (component: unknown, props: object) =>
  renderToStaticMarkup(React.createElement(component as React.ComponentType<object>, props));

test("A1: la búsqueda estática toma la disponibilidad de search-index.json, sin API ni localhost", () => {
  const { marksFromDocuments } = loadTsx(join(import.meta.dirname, "../../frontend/lib/searchAvailability.ts"));
  const marks: Map<string, { label: string }> = marksFromDocuments([
    { id: "concept:a", slug: "a", title: "A", type: "concept", domain: null, classification: null, has_page: true, snippet: "" },
    {
      id: "pattern:data-minimization-by-layer", slug: "data-minimization-by-layer", title: "Minimización por capa",
      type: "pattern", domain: null, classification: null, has_page: true, snippet: "En desarrollo",
      availability: { status: "in_development", label: "En desarrollo", help: "Contenido y diseño en preparación." },
    },
  ]);
  assert.deepEqual([...marks.keys()], ["data-minimization-by-layer"]);
  assert.equal(marks.get("data-minimization-by-layer")?.label, "En desarrollo");
  const source = read("frontend/lib/searchAvailability.ts");
  assert.equal(source.includes("localhost"), false);
  assert.match(source, /NEXT_PUBLIC_API_MODE === "static"\) \{\n\s+return marksFromDocuments/);
  assert.match(read("frontend/next.config.ts"), /NEXT_PUBLIC_API_BASE_URL: isStatic \? "" :/);
});

test("A2: el globo de ayuda cerrado no ocupa espacio y abierto se ancla al contenedor en pantallas angostas", () => {
  const css = read("frontend/components/availability/availability.css");
  const closed = css.slice(css.indexOf(".availability-help {"), css.indexOf("}", css.indexOf(".availability-help {")));
  assert.match(closed, /display: none;/);
  assert.equal(closed.includes("visibility: hidden"), false);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*position: static;[\s\S]*max-width: 100%;/);
});

test("A3/A4: las notas de ControlEvidence pasan por RichText (sin «§» sueltos)", () => {
  const view = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const markup = html(view.ControlEvidence, {
    title: "Detección", lead: "Patrón", steps: [], decide: { number: "4", title: "Decidir", outcomes: [] },
    note: "Servicios en la nube [§](#s11); ninguno decide.",
    example: { summary: "Ver ejemplo", steps: [], note: "Cubre 5 de 7 tipos de [§](#s3)." },
  });
  assert.equal(markup.includes("[§]"), false);
  assert.match(markup, /href="#s11"/);
  assert.match(markup, /href="#s3"/);
});

test("M1: el salto a «§N» abre la sección y una sección colapsada no cuenta como leída", () => {
  const source = read("frontend/components/card/ConceptReading.tsx");
  assert.match(source, /element instanceof HTMLDetailsElement && !element\.open/);
  assert.match(source, /closest\("a\[href\^='#s'\]"\)/);
  assert.match(source, /addEventListener\("hashchange", onHash\)/);
  assert.match(source, /goToRef\.current\(target\)/);
});

test("M2: «Ver con <columna> →» es un botón aparte, sin enlace dentro de un botón", () => {
  const view = loadTsx(join(ficha, "ConceptMap.tsx"));
  const map = {
    label: "Mapa",
    outside: { kicker: "Fuera", items: [], hint: "P1" },
    personal: {
      kicker: "Personal", definition: "Def", text: "Texto",
      also: { kicker: "Siguen", items: [{ title: "Seudonimizado [(art. 2 letra l)](https://example.org/ley.pdf#page=2)", text: "x", example: { label: "Ver con", column: "rut_hash" } }] },
    },
    sensitive: { kicker: "Sensible", text: "x", hint: "P3" },
    minors: { kicker: "NNA", text: "x", hint: "P4" },
  };
  const markup = html(view.ConceptMap, { view: map });
  assert.match(markup, /<button[^>]*class="pii-card-pick"[^>]*>Ver con <code>rut_hash<\/code>/);
  assert.equal(/<button[^>]*>(?:(?!<\/button>).)*<a /.test(markup), false);
});

test("M3: Hacer y evitar se apilan por pares, con ✓ y ✕", () => {
  const view = loadTsx(join(ficha, "PracticePairs.tsx"));
  const markup = html(view.PracticePairs, {
    view: { start: { title: "Por dónde empezar", text: "x" }, labels: { do: "Hacer", avoid: "Evitar" },
            items: [{ do: "Uno", avoid: "No uno" }, { do: "Dos", avoid: "No dos" }] },
  });
  const rows = markup.match(/<div class="pii-pair-row"[^>]*>.*?<\/div>/g) ?? [];
  assert.equal(rows.length, 2);
  assert.ok(rows[0].indexOf("Uno") < rows[0].indexOf("No uno"));
  assert.match(rows[0], /✓/);
  assert.match(rows[0], /✕/);
});

test("M4: el panel de estudio parte plegado bajo 1400 px si no hay preferencia", () => {
  const source = read("frontend/components/card/ConceptReading.tsx");
  assert.match(source, /STUDY_OPEN_QUERY = "\(min-width: 1400px\)"/);
  assert.match(source, /study !== "open" && !window\.matchMedia\(STUDY_OPEN_QUERY\)\.matches/);
});

test("M5: el árbol de §2 parte en la columna del contrato (view.default)", () => {
  const source = read("frontend/components/ficha/DecisionTree.tsx");
  assert.match(source, /view\.examples\.find\(\(item\) => item\.column === view\.default\)/);
  assert.equal(source.includes("{view.default}"), false);   // ya no se dibuja como texto suelto
});

test("B1: Fuentes pasa why por RichText en las tres ramas", () => {
  const source = read("frontend/components/ficha/SourcesGrouped.tsx");
  assert.equal((source.match(/<RichText text=\{source\.why\} \/>/g) ?? []).length, 3);
  assert.equal(source.includes('<p className="sources-why">{source.why}</p>'), false);
});

test("B3: el título de la pestaña es el de la ficha", () => {
  assert.match(read("frontend/app/layout.tsx"), /template: "%s · Data Engineering Knowledge Hub"/);
  const page = read("frontend/app/concepts/[slug]/page.tsx");
  assert.match(page, /return \{ title: concept\.data\.title, robots: \{ index: false, follow: true \} \};/);
  assert.match(page, /return \{ title: concept\.data\.title \};/);
});

test("ALTO-2 y MEDIO-1: tokens que se invierten con el tema, sin #fff sobre var(--ink)", () => {
  const tokens = read("frontend/styles/tokens.css");
  for (const name of ["--ink-inverse", "--availability-count-ink", "--availability-count-bg"]) {
    assert.equal((tokens.match(new RegExp(`${name}:`, "g")) ?? []).length, 3, name);   // claro, prefers-color-scheme y data-theme
  }
  assert.match(tokens, /:root\[data-theme="dark"\] \{/);
  const css = read("frontend/components/home/home.css");
  assert.match(css, /\.availability-count \{[^}]*color: var\(--availability-count-ink\);[^}]*background: var\(--availability-count-bg\);/);
  assert.match(css, /\.home-goal\[aria-pressed="true"\] \{[^}]*color: var\(--ink-inverse\);/);
  assert.match(css, /\.home-weight\[data-weight="Esencial"\] \{[^}]*color: var\(--ink-inverse\);/);
});

test("Cabecera del recorrido a todo el ancho, sobre el panel y el mapa", () => {
  const source = read("frontend/components/home/HomeScreen.tsx");
  assert.ok(source.indexOf("<RouteHeader") < source.indexOf('<div className="home-split">'));
  assert.match(source, /<section className="home-map home-route"/);
});

test("B-N4: /privacidad usa route_count, igual que el inicio", () => {
  const page = read("frontend/app/privacidad/page.tsx");
  assert.match(page, /fillCount\(routeTexts\.route_count, \{ n: totals\.available, total: totals\.total \}\)/);
  assert.match(read("frontend/components/explorer/DomainRoute.tsx"), /route-pill route-pill-count">\{routeCount\}/);
});

test("B-N5: «Leído N de M» cuenta solo las secciones abiertas y vistas", () => {
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
  };
  try {
    const progress = loadTsx(join(import.meta.dirname, "../../frontend/lib/readingProgress.ts"));
    progress.markSectionSeen("pii", 1, "Propósito");
    progress.markSectionSeen("pii", 16.5, "Sanciones");
    const stored = progress.readReadingProgress("pii");
    assert.deepEqual(stored.seen, [1, 16.5]);
    assert.equal(stored.section, 16);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
  const reading = read("frontend/components/card/ConceptReading.tsx");
  assert.match(reading, /present\.filter\(\(number\) => seen\.has\(number\)\)\.length/);
  assert.match(reading, /function goTo\(section: ReadingSectionModel\) \{\n\s+\/\/ B-N5[^\n]*\n\s+setCurrent\(section\.number\);/);
});

test("client.ts no llama a la API en el sitio estático", () => {
  const client = read("frontend/lib/api/client.ts");
  assert.match(client, /=== "static"\) \{\n\s+return \{ ok: false, reason: "unavailable", detail: "El sitio estático no usa la API\." \};/);
});

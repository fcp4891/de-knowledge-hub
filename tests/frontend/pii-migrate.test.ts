// Migración de pii-identification desde la maqueta (rama a/pii-migrate).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { loadTsx } from "./load-tsx.ts";

const requireFromFrontend = createRequire(pathToFileURL(join(import.meta.dirname, "../../frontend/package.json")).href);
const React = requireFromFrontend("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server") as typeof import("react-dom/server");

const FRONTEND = join(import.meta.dirname, "../../frontend");
const ficha = join(FRONTEND, "components/ficha");

export function html(component: unknown, props: object): string {
  return renderToStaticMarkup(React.createElement(component as React.ComponentType<object>, props));
}

export function cells(row: string): string[] {
  return [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
}

export const css = (name: string): string => readFileSync(join(ficha, name), "utf8");

test("§3: una celda por encabezado; los ejemplos de columna van dentro de la celda del tipo", () => {
  const { ColumnTypes } = loadTsx(join(ficha, "ColumnTypes.tsx"));
  const view = {
    headers: ["Tipo de columna", "Solo patrones", "Detector de la ficha", "Categoría probable", "Por qué"],
    rows: [{
      type: "Identificador directo", examples: "`rut_cliente`", patterns: { mark: "ok", text: "RUT y correo" },
      detector: { mark: "part", text: "Lo deja en revisión" }, categories: [{ label: "Personal", tone: "personal" }], why: "Identifica sola.",
    }],
    legend: ["✓ detecta"],
  };
  const tds = cells(/<tbody>([\s\S]*?)<\/tbody>/.exec(html(ColumnTypes, { view }))?.[1] ?? "");
  assert.equal(tds.length, view.headers.length);
  assert.match(tds[0], /Identificador directo[\s\S]*rut_cliente/);
  assert.match(tds[1], /RUT y correo/);
  assert.match(tds[2], /Lo deja en revisión/);
  assert.match(tds[3], /Personal/);
  assert.match(tds[4], /Identifica sola/);
});

test("§7 a 390 px: la tabla de pii (con «Este ejemplo») apila cada celda a todo el ancho, en el @media y en el contenedor", () => {
  const blocks = css("ficha-blocks.css");
  const rule = ".cloud-compare .markdown-table-steps table:has(td.cloud-own) :is(th, td):nth-child(-n + 2) {\n    display: block;\n    position: static;\n    width: 100%;";
  const media = blocks.slice(blocks.indexOf("@media (max-width: 720px) {\n  .cloud-compare"));
  const container = blocks.slice(blocks.indexOf("@container reading (max-width: 720px) {\n  /* pii §7"));
  assert.ok(media.includes(rule) && container.includes(rule));
  assert.match(blocks, /table:has\(td\.cloud-own\) td::before \{\n    display: block;/);
  // Sin desplazamiento a 390 px: el min-width de escritorio (40rem) se anula en los dos bloques móviles.
  assert.equal((blocks.match(/table\.pii-table:has\(td\.cloud-own\) \{\n    min-width: 0;/g) ?? []).length, 2);
});

test("§2: el árbol pinta «Recorrido…», «Resultado para» y el título del desenlace (o el fallback)", () => {
  const { DecisionTree } = loadTsx(join(ficha, "DecisionTree.tsx"));
  const exit = { answer: "yes", label: "Sí", outcome: "sensitive", title: "Dato sensible", text: "Consentimiento expreso (art. 16)." };
  const view = {
    intro: { title: "Mapa", text: "t" }, examples_title: "Ejemplos", path_label: "Recorrido de la columna elegida",
    result_label: "Resultado para", catalog_label: "Catálogo", answer_labels: { yes: "Sí", no: "No" },
    step_labels: { question: "Pregunta", next: "siguiente", end: "termina" },
    questions: [{ number: 1, question: "¿Sensible?", help: "h", gloss: { yes: "revela", no: "no revela" }, exits: [exit] }],
    fallback: { label: "fin", outcome: "personal", title: "Dato personal", text: "Identificable." },
    catalog_fields: { category: "C", basis: "B", risk: "R", method: "M", review: "V" }, review: "privacidad", default: "diagnostico",
    examples: [{ column: "diagnostico", description: "d", answers: ["yes"], outcome: "sensitive", title: "Sensible", explanation: "e",
      catalog: { category: "c", basis: "b", risk: "r", method: "m" } }],
    law: { summary: "s", items: [], link: { label: "l", href: "/concepts/chile-data-protection/" } },
  };
  const markup = html(DecisionTree, { view });
  assert.match(markup, /Recorrido de la columna elegida/);
  assert.match(markup, /Resultado para <code>diagnostico<\/code>/);
  assert.match(markup, /class="pii-outcome" data-outcome="sensitive"[\s\S]*<strong>Dato sensible<\/strong>/);
  const fallback = html(DecisionTree, { view: { ...view, examples: [{ ...view.examples[0], answers: ["no"] }] } });
  assert.match(fallback, /data-outcome="personal"[\s\S]*<strong>Dato personal<\/strong>/);
});

test("el chip de pii «Cómo funciona · ¿Qué datos trato?» tiene destino: DesignBoard pinta el id del contrato", () => {
  const { DesignBoard } = loadTsx(join(ficha, "DesignBoard.tsx"));
  const markup = html(DesignBoard, {
    intro: "i", groups: [{ title: "Conocer", items: [{ id: "como-funciona-01", number: "01", question: "¿Qué datos?", text: "t", tags: [] }] }],
  });
  assert.match(markup, /<article id="como-funciona-01">/);
});

test("tipografía: .pii-view fija la sans de la UI y la serif del Resumen no alcanza a pii", () => {
  assert.match(css("pii-views.css"), /\.pii-view,\n\.pii-use,\n\.pii-note,\n\.pii-risk,\n[^{]*\{\n  font-family: var\(--font-ui\)/);
  assert.match(readFileSync(join(FRONTEND, "components/card/reading.css"), "utf8"), /\.reading-summary \.markdown p:not\(\.pii-view \*, \.pii-use \*, \.pii-note, \.pii-risk\)/);
});

test("ronda 2 · §2: recorrido, desenlace y «Resultado para» van en una rejilla de tres zonas; la ley queda fuera", () => {
  const { DecisionTree } = loadTsx(join(ficha, "DecisionTree.tsx"));
  const view = {
    intro: { title: "Mapa", text: "t" }, examples_title: "Ejemplos", path_label: "Recorrido", result_label: "Resultado para",
    catalog_label: "Catálogo", answer_labels: { yes: "Sí", no: "No" }, step_labels: { question: "Pregunta", next: "sigue", end: "termina" },
    questions: [{ number: 1, question: "¿Sensible?", help: "h", gloss: { yes: "revela", no: "no revela" }, exits: [] }],
    fallback: { label: "fin", outcome: "personal", title: "Dato personal", text: "t" },
    catalog_fields: { category: "C", basis: "B", risk: "R", method: "M", review: "V" }, review: "v", default: "x",
    examples: [{ column: "x", description: "d", answers: ["no"], outcome: "personal", title: "P", explanation: "e",
      catalog: { category: "c", basis: "b", risk: "r", method: "m" }, law: true }],
    law: { summary: "Ley", items: ["a"], link: { label: "l", href: "/concepts/chile-data-protection/" } },
  };
  const markup = html(DecisionTree, { view });
  const route = /<div class="pii-route">([\s\S]*?)<\/aside><\/div>/.exec(markup)?.[1] ?? "";
  assert.match(route, /^<div class="pii-route-path">[\s\S]*<div class="pii-outcome"[\s\S]*<aside class="pii-live"/);
  assert.equal(route.includes("pii-law"), false);
  assert.match(markup, /<\/div><details class="pii-law">/);
  assert.match(css("pii-views.css"), /\.pii-route \{\n  display: grid;\n  grid-template-columns: minmax\(0, 1\.45fr\) minmax\(0, 0\.8fr\) minmax\(0, 1\.15fr\);/);
});

test("ronda 2 · §2: la tarjeta completa es un botón real con foco visible; ejemplos en cuatro columnas hasta 600 px", () => {
  const sheet = css("pii-views.css");
  assert.match(sheet, /\.pii-card-pick::after \{\n  content: "";\n  position: absolute;\n  inset: 0;/);
  assert.match(sheet, /\.pii-card:has\(\.pii-card-pick:focus-visible\) \{\n  outline: 2px solid var\(--accent\);/);
  assert.match(sheet, /\.pii-kicker a \{\n  text-transform: none;/);
  assert.equal(sheet.includes("@container reading (max-width: 900px)"), false);
  assert.match(sheet, /@container reading \(max-width: 600px\) \{\n  \.pii-also,\n  \.pii-examples \{/);
});

test("ronda 2 · §3 en móvil conserva la tabla con desplazamiento; marcas con ícono y leyenda en una línea", () => {
  const sheet = css("pii-views.css");
  assert.equal((sheet.match(/\.pii-column-types\.pii-table-wrap \.pii-table \{\n    display: table;\n    width: 100%;\n    min-width: 640px;/g) ?? []).length, 2);
  assert.match(sheet, /\.pii-column-types \.pii-mark\.is-part::before \{\n  content: "~";/);
  assert.match(sheet, /\.pii-view \.pii-legend \{[^}]*list-style: none;/);
});

test("ronda 2 · §6, §7 y §10: lo compartido con chile solo cambia bajo una ficha con vistas de pii", () => {
  const sheet = css("pii-views.css");
  for (const rule of [
    ".reading-article:has(.pii-view) :is(.control-evidence-steps, .control-evidence-code) {\n  min-width: 42rem;",
    ".reading-article:has(.pii-view) .code-guide td code {",
    ".reading-article:has(.pii-view) .open-questions article > p {",
    ".cloud-compare:has(td.cloud-own) .pii-table th {\n  color: var(--ink);",
  ]) {
    assert.ok(sheet.includes(rule), rule);
  }
  // Ningún selector nuevo de §6/§10 sin el alcance de pii en ficha-blocks.css.
  assert.equal(css("ficha-blocks.css").includes("min-width: 42rem"), false);
});

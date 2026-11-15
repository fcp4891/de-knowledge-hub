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
  assert.match(css("pii-views.css"), /\.pii-view,\n\.pii-note,\n\.pii-risk,\n[^{]*\{\n  font-family: var\(--font-ui\)/);
  assert.match(readFileSync(join(FRONTEND, "components/card/reading.css"), "utf8"), /\.reading-summary \.markdown p:not\(\.pii-view \*, \.pii-note, \.pii-risk\)/);
});

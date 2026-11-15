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

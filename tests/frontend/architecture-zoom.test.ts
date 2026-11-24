// Zoom de arquitectura (ADR-030, enmienda 12): un componente base con dos variantes, recorte leído de la madre y contraste.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { contrast } from "./contrast.test.ts";
import { loadTsx } from "./load-tsx.ts";

const requireFromFrontend = createRequire(pathToFileURL(join(import.meta.dirname, "../../frontend/package.json")).href);
const React = requireFromFrontend("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server") as typeof import("react-dom/server");
const yaml = requireFromFrontend("js-yaml") as { load: (text: string) => unknown };
const ROOT = join(import.meta.dirname, "../..");
const ficha = join(ROOT, "frontend/components/ficha");
const html = (c: unknown, p: object) => renderToStaticMarkup(React.createElement(c as React.ComponentType<object>, p));

type AnyView = Record<string, any>;
function views(slug: string): AnyView {
  const text = readFileSync(join(ROOT, "content/concepts", `${slug}.md`), "utf8");
  return (yaml.load(text.split("---\n")[1]) as AnyView).views;
}
const madre = views("chile-data-protection");
const inv = views("processing-activities-inventory");
const pii = views("pii-identification");
const { ArchitectureZoom } = loadTsx(join(ficha, "ArchitectureZoom.tsx"));
const { architectureZoomProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
const render = (own: AnyView, source: AnyView | undefined) => html(ArchitectureZoom, architectureZoomProps(own.architecture_zoom, source, own));

test("Inventario: recorte de Gobierno de la madre, el registro resaltado con «Zoom», 13 campos en 4 grupos y 4 usos", () => {
  const markup = render(inv, madre);
  assert.match(markup, /class="ficha-block architecture-zoom"/);
  assert.match(markup, /class="requirement-gov"/);
  assert.match(markup, /<article><strong>Legal y negocio<\/strong><span>finalidad, base de licitud, plazo<\/span><\/article>/);
  assert.match(markup, /<article class="is-highlight"><span class="zoom-badge">Zoom<\/span><strong>Registro de actividades de tratamiento<\/strong>/);
  assert.equal(markup.includes("requirement-legend"), false);
  assert.match(markup, /class="zoom-wedge"/);
  assert.match(markup, /href="[^"]*\/concepts\/chile-data-protection\/#s9">← Volver a la vista general<\/a>/);
  assert.equal((markup.match(/<h4>/g) ?? []).length, 4);
  const fields = [...markup.matchAll(/<div><h4>[^<]+<\/h4><ul>(.*?)<\/ul><\/div>/g)].flatMap((m) => [...m[1].matchAll(/<li>([^<]+)<\/li>/g)].map((x) => x[1]));
  assert.equal(fields.length, 12);   // + «Ámbito territorial», una vez por registro
  assert.match(markup, /Ámbito territorial: Se declara una vez por registro\./);
  assert.equal((markup.match(/<li class="zoom-card">/g) ?? []).length, 4);
  assert.equal((markup.match(/class="zoom-chip /g) ?? []).length, 3);
  assert.equal(markup.includes("zoom-phase"), false);
});

test("pii: recorte de Datos (Bronze, Silver con Seudonimización, Gold), dos resaltadas, tres fases y la rama 4a/4b", () => {
  const markup = render(pii, madre);
  assert.match(markup, /<article class="is-layer is-highlight"><span class="zoom-badge">Zoom<\/span><strong>Bronze<\/strong>/);
  assert.match(markup, /<article class="is-layer is-highlight"><strong>Silver<\/strong><em class="is-layer">Seudonimización<\/em>/);
  assert.match(markup, /<article class="is-layer"><strong>Gold<\/strong><span>agregado por producto<\/span>/);
  assert.equal(/Ingesta con contrato|Consumo por finalidad/.test(markup), false);
  assert.equal((markup.match(/class="zoom-badge"/g) ?? []).length, 1);
  assert.equal((markup.match(/class="zoom-phase"/g) ?? []).length, 3);
  assert.match(markup, /class="zoom-row is-fork has-2"/);
  assert.match(markup, /class="zoom-card is-branch is-open"/);
  assert.match(markup, /class="zoom-card is-branch is-lock"/);
  assert.match(markup, /class="zoom-card is-gate"/);
  assert.match(markup, /Salida 1: la CI bloquea/);
  assert.equal(markup.includes("zoom-register"), false);
});

test("sin la madre (lectura fallida) el panel se dibuja igual, sin recorte ni cuña", () => {
  const markup = render(inv, undefined);
  assert.equal(markup.includes("zoom-map"), false);
  assert.match(markup, /class="zoom-panel"/);
});

test("la madre conserva su marcado: sin insignia ni leyenda faltante", () => {
  const { RequirementToData } = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const { requirementToDataProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const diagram = html(RequirementToData, requirementToDataProps(madre.requirement_to_data));
  assert.equal(diagram.includes("zoom-badge"), false);
  assert.match(diagram, /class="requirement-legend"><span>el contrato fija los campos permitidos<\/span>/);
});

function tokens(): { light: Record<string, string>; dark: Record<string, string> } {
  const css = readFileSync(join(ROOT, "frontend/styles/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const decl = (block: string) => Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const light = decl(/:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "");
  return { light, dark: { ...light, ...decl(/@media \(prefers-color-scheme: dark\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "") } };
}
function hex(name: string, t: Record<string, string>, depth = 0): string {
  const v = t[name] ?? "";
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(v);
  return ref && depth < 5 ? hex(ref[1], t, depth + 1) : v;
}

test("contraste del zoom: cada par de tokens con texto llega a 4,5:1 en claro y oscuro", () => {
  const pairs: [string, string][] = [
    ["--accent", "--surface"],               // rótulo, enlace, fases, nota
    ["--accent", "--accent-soft"],           // código, ámbito territorial, registro y puerta
    ["--on-accent", "--accent"],             // insignia «Zoom» y «versionado»
    ["--ink", "--accent-soft"],              // campos y textos del registro
    ["--ink", "--surface"],                  // títulos de tarjeta y campos
    ["--ink-muted", "--surface"],            // bajada y textos de tarjeta
    ["--ink", "--surface-muted"],            // evidencias
    ["--surface", "--lvl-intermedio-ink"],   // número de tarjeta e insignia de glifo
    ["--ok-ink", "--ok-bg"],                 // chips que habilitan
    ["--warn-ink", "--warn-bg"],             // chips que bloquean o alertan
    ["--lvl-intermedio-ink", "--lvl-intermedio-bg"], // cajas de Gobierno de la madre
  ];
  const { light, dark } = tokens();
  for (const [theme, t] of [["claro", light], ["oscuro", dark]] as const) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(hex(fg, t), hex(bg, t));
      assert.ok(ratio >= 4.5, `${fg} sobre ${bg} en ${theme}: ${ratio.toFixed(2)}:1`);
    }
  }
});

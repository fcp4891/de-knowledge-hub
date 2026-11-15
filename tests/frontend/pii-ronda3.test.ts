// Ronda 3 de pii-identification: base legal, franjas, sticky, §4, nombres de función, Fuentes enlazadas y sin «§N».
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
const ROOT = join(import.meta.dirname, "../..");
const ficha = join(ROOT, "frontend/components/ficha");
const html = (c: unknown, p: object) => renderToStaticMarkup(React.createElement(c as React.ComponentType<object>, p));
const css = (n: string) => readFileSync(join(ficha, n), "utf8");

test("1 · la leyenda «enlaza su fila en Base legal» solo sale si esa fila existe (panel o anexo)", () => {
  const reading = readFileSync(join(ROOT, "frontend/components/card/ConceptReading.tsx"), "utf8");
  assert.match(reading, /const legalLegend = legalBasis\.length > 0 && \(legalBasisPanel \|\| sections\.some\(\(section\) => section\.annex\)\);/);
  assert.match(reading, /\{legalLegend \? \(/);
  const pii = readFileSync(join(ROOT, "content/concepts/pii-identification.md"), "utf8");
  assert.match(pii, /^views:\n  reading:\n    legal_basis_panel: false\n/m);
  assert.match(pii, /^legal_basis:/m);   // ADR-023: legal_basis sigue en el frontmatter
});

test("2 y 4 · «Cuatro preguntas…» es una franja con la frase en negrita; la cobertura no tiene rótulo visible", () => {
  const tree = readFileSync(join(ficha, "DecisionTree.tsx"), "utf8");
  assert.match(tree, /<p className="pii-note pii-how">\n\s+<strong>\{view\.intro\.title\}<\/strong> <RichText text=\{view\.intro\.text\} \/>/);
  assert.equal(tree.includes("<h3>{view.intro.title}</h3>"), false);
  const { CoverageStrip } = loadTsx(join(ficha, "CoverageStrip.tsx"));
  const markup = html(CoverageStrip, { view: { label: "Cobertura sobre las nueve columnas", lead: "l", columns: ["a"], rows: [], note: "n" } });
  assert.match(markup, /aria-label="Cobertura sobre las nueve columnas"/);
  assert.equal(markup.includes("pii-kicker"), false);
});

test("3 · desenlace y «Resultado para» son sticky (top 12 px) con los quiebres de la maqueta", () => {
  const sheet = css("pii-views.css");
  assert.match(sheet, /\.pii-route \.pii-outcome,\n\.pii-route \.pii-live \{\n  position: sticky;\n  top: 12px;/);
  assert.match(sheet, /@media \(max-width: 900px\) \{\n  \.pii-route \{[^}]*\}\n\n  \.pii-route \.pii-live \{\n    position: static;/);
  assert.match(sheet, /@media \(max-width: 640px\) \{\n  \.pii-route \{[^}]*\}\n\n  \.pii-route \.pii-outcome \{\n    position: static;/);
});

test("5 · la franja EVIDENCIA queda pegada al borde inferior de su tarjeta", () => {
  assert.match(css("pii-views.css"), /\.pii-view \.pii-step \.pii-evidence \{\n  margin: auto 0 0;\n\}/);
});

test("6 · los <wbr> solo van si la ficha declara views.reading.break_identifiers (pii sí, chile no)", () => {
  const page = readFileSync(join(ROOT, "frontend/app/concepts/[slug]/page.tsx"), "utf8");
  assert.match(page, /const breakCodes = views\.reading\?\.break_identifiers === true;/);
  assert.match(readFileSync(join(ficha, "ControlEvidence.tsx"), "utf8"), /breakCodes \? breakAtUnderscores\(item\.code\) : item\.code/);
  assert.match(readFileSync(join(ficha, "CodeGuide.tsx"), "utf8"), /breakCodes \? breakAtUnderscores\(row\.fn\) : row\.fn/);
  const pii = readFileSync(join(ROOT, "content/concepts/pii-identification.md"), "utf8");
  assert.match(pii, /^  reading:\n    legal_basis_panel: false\n    break_identifiers: true\n/m);
  assert.equal(readFileSync(join(ROOT, "content/concepts/chile-data-protection.md"), "utf8").includes("break_identifiers"), false);
});

test("6 · los nombres de función se parten en los guiones bajos, sin nowrap", () => {
  const { breakAtUnderscores } = loadTsx(join(ROOT, "frontend/lib/breakUnderscores.tsx"));
  const markup = renderToStaticMarkup(React.createElement("code", null, breakAtUnderscores("identificadores_directos")));
  assert.equal(markup, "<code>identificadores_<wbr/>directos</code>");
  const rule = /:is\(\.code-guide td, \.control-evidence-code\) code \{([^}]*)\}/.exec(css("pii-views.css"))?.[1] ?? "";
  assert.match(rule, /white-space: normal;/);
  assert.equal(rule.includes("nowrap"), false);
});

test("7 · Fuentes: título visible y títulos como enlace solo con link_titles (chile no lo declara)", () => {
  const { SourcesGrouped } = loadTsx(join(ficha, "SourcesGrouped.tsx"));
  const groups = [{ title: "Normativa", sources: [{ kind: "citation", title: "Ley 21.719", publisher: "DO", level: "Nivel 1", links: [{ href: "https://example.org/ley" }] }] }];
  const linked = html(SourcesGrouped, { heading: "Fuentes", linkTitles: true, groups });
  assert.match(linked, /<h3 class="sources-heading">Fuentes<\/h3>/);
  assert.match(linked, /<h4><a href="https:\/\/example\.org\/ley"[^>]*>Ley 21\.719<\/a><\/h4>/);
  assert.equal(linked.includes("sources-links"), false);
  const plain = html(SourcesGrouped, { groups });
  assert.match(plain, /<h4>Ley 21\.719<\/h4>/);
  assert.match(plain, /sources-links/);
  assert.equal(plain.includes("is-linked"), false);
});

test("8 · pii no tiene referencias en línea «§N · Nombre»", () => {
  const pii = readFileSync(join(ROOT, "content/concepts/pii-identification.md"), "utf8");
  assert.equal(pii.includes("[§](#s"), false);
});

test("10 · el menú oculta Rutas, Repaso y Snippets sin borrar sus rutas", () => {
  const nav = readFileSync(join(ROOT, "frontend/components/SideNav.tsx"), "utf8");
  for (const label of ["Rutas", "Repaso", "Snippets"]) {
    assert.match(nav, new RegExp(`label: "${label}", hidden: true`));
  }
  assert.match(nav, /ITEMS\.filter\(\(item\) => !item\.hidden\)\.map/);
  for (const page of ["app/explorer/page.tsx", "app/repaso/page.tsx", "app/snippets/page.tsx"]) {
    assert.ok(readFileSync(join(ROOT, "frontend", page), "utf8").length > 0, page);
  }
});

test("ronda 4 · §10 sin chips «§N» (queda «art. 16 quáter»), entrada sin «enlace», §6 sin «Ver código ↓»", () => {
  const pii = readFileSync(join(ROOT, "content/concepts/pii-identification.md"), "utf8");
  const block = pii.slice(pii.indexOf("  open_questions:\n"), pii.indexOf("  sources_grouped:\n"));
  assert.equal(/- section: \d+/.test(block), false);
  assert.match(block, /label: art\. 16 quáter\n        legal: true/);
  assert.match(block, /intro: Si no sabes responder una, repasa la parte de la ficha que trata ese tema\./);
  assert.equal(block.includes("enlace"), false);
  assert.equal(pii.includes("Ver código ↓"), false);
  const { OpenQuestions } = loadTsx(join(ficha, "OpenQuestions.tsx"));
  const markup = html(OpenQuestions, { intro: "i", items: [{ question: "¿Sin etiquetas?" }] });
  assert.match(markup, /¿Sin etiquetas\?/);
  assert.equal(markup.includes("ficha-pills"), false);
});

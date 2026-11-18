// processing-activities-inventory (ADR-030, enmienda 9): vistas nuevas, extensiones retrocompatibles y contraste.
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
const inv = views("processing-activities-inventory");

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

test("«Campos del registro»: 13 filas, 11 ojos y 3 bombillas, la bombilla en la primera posición si no hay ojo", () => {
  const { RegisterFields } = loadTsx(join(ficha, "RegisterFields.tsx"));
  const markup = html(RegisterFields, { view: inv.register_fields });
  assert.equal((markup.match(/class="inv-rg-cols inv-rg-row/g) ?? []).length, 13);
  assert.equal((markup.match(/aria-label="Ver la norma de /g) ?? []).length, 11);
  assert.equal((markup.match(/aria-label="Ver lo propuesto de /g) ?? []).length, 3);
  for (const name of ["Activos y consumidores", "Aprobación y versión"]) {
    const row = new RegExp(`${name}</p>.*?<div class="inv-rg-source">(<button[^>]*>)`).exec(markup)?.[1] ?? "";
    assert.match(row, /is-proposal/, name);   // sin ojo: la bombilla ocupa la posición del ojo
  }
  assert.equal(markup.includes('href="#campo-'), false);   // las tarjetas no enlazan a las filas
  assert.match(markup, /aria-live="polite"/);
  assert.match(markup, /role="region" tabindex="0" aria-label="Campos del registro y de dónde viene cada uno, 13 filas"/);
  assert.match(markup, /Exportar actividad de tratamiento · Emitir y gestionar pasajes · actual/);
  assert.match(markup, /<b>12 de 13<\/b>/);   // venta_pasajes, actual: el ámbito sin evaluar no cuenta como completo
});

test("los filtros dejan 11 (norma) y 3 (propuesto) campos, y el segundo clic vuelve a los 13", () => {
  const { visibleFields } = loadTsx(join(ficha, "RegisterFields.tsx"));
  const fields = inv.register_fields.fields;
  assert.equal(visibleFields(fields, "norm").length, 11);
  assert.equal(visibleFields(fields, "proposal").length, 3);
  assert.equal(visibleFields(fields, "all").length, 13);
});

test("rulesSummary calcula {rows} y {total} de las filas (CodeGuide; el Inventario ya no muestra esa tabla)", () => {
  const { rulesSummary } = loadTsx(join(ficha, "CodeGuide.tsx"));
  const items = [{ count: 1 }, { count: 5 }, { count: 2 }, {}];
  assert.equal(rulesSummary("{rows} controles · {total} hallazgos", items), "4 controles · 8 hallazgos");
});

test("«Ver detalle / Ocultar»: botón real con aria-expanded y aria-controls, región con hidden y el resumen visible", () => {
  const { Disclosure } = loadTsx(join(ficha, "Disclosure.tsx"));
  const closed = html(Disclosure, { title: "Escenarios", summary: "actual 1", open: false, children: "x" });
  assert.match(closed, /<button type="button" class="disclosure-button" aria-expanded="false" aria-controls="[^"]+">/);
  assert.match(closed, /<span>Ver detalle<\/span><span class="disclosure-sr">: Escenarios<\/span>/);
  assert.match(closed, /role="region" aria-labelledby="[^"]+" hidden=""/);
  assert.match(closed, /<span class="disclosure-summary">actual 1<\/span>/);
  const open = html(Disclosure, { title: "Controles", open: true, children: "x" });
  assert.match(open, /aria-expanded="true"/);
  assert.match(open, /<span>Ocultar<\/span>/);
  assert.equal(/hidden=""/.test(open), false);
});

test("Código del Inventario: sin tabla de controles, sin «Escenarios» ni línea de códigos de salida; quedan las demás subsecciones", () => {
  const { CodeGuide } = loadTsx(join(ficha, "CodeGuide.tsx"));
  const { codeGuideProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  // Retirados por decisión del dueño (2026-11-18); las cifras siguen en la «Salida» de actual (test_inventory_views).
  assert.equal(inv.code_guide.rules, undefined);
  assert.equal(inv.code_guide.scenarios, undefined);
  assert.equal(inv.code_guide.exit_codes_label, undefined);
  const markup = html(CodeGuide, codeGuideProps(inv.code_guide));
  for (const gone of ["Controles del código", "9 controles", "Escenarios", "code-guide-exits", "code-guide-scenarios", "control-evidence-example"]) {
    assert.equal(markup.includes(gone), false, gone);
  }
  const order = ["Qué hace", "Qué no cubre", "Lo que el formulario muestra", "Qué simplifica", "Límite"];
  const positions = order.map((label) => markup.indexOf(label));
  assert.ok(positions.every((position) => position >= 0), "están todas las subsecciones que se quedan");
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "orden de las subsecciones");
});

test("CodeGuide conserva tabla de controles, «Escenarios» y códigos de salida cuando una ficha los declara", () => {
  const { CodeGuide } = loadTsx(join(ficha, "CodeGuide.tsx"));
  const { codeGuideProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const view = {
    exit_codes_label: "Códigos de salida", lead: { title: "Qué hace.", text: "t" },
    rules: { title: "Controles", summary: "{rows} controles · {total} hallazgos", disclosure: "open", headers: ["Control", "Función", "Encuentra", "Hallazgos"],
             items: [{ rule: "r1", fn: "f", requirement: "q", count: 2 }, { rule: "r2", fn: "f", requirement: "q", count: 1 }] },
    not_covered: { title: "Qué no cubre", items: [{ title: "A:", text: "b" }] },
    scenarios: { title: "Escenarios", disclosure: "closed", items: [
      { name: "actual", text: "t", exit_code: 1 }, { name: "corregido", text: "t", exit_code: 0, fixes: [{ finding: "x", fix: "y" }] }] },
    simplifies: { title: "Qué simplifica", items: [{ title: "A:", text: "b" }] }, limit: { title: "Límite.", text: "l" },
  };
  const markup = html(CodeGuide, codeGuideProps(view));
  assert.match(markup, /Códigos de salida<\/span> <span><code>actual<\/code> → 1<\/span>/);
  assert.match(markup, /<h4 id="[^"]+">Controles<\/h4><span class="disclosure-summary">2 controles · 3 hallazgos<\/span>/);
  assert.match(markup, /<h4 id="[^"]+">Escenarios<\/h4>/);
  assert.match(markup, /<li><code>x<\/code> → (<!-- -->)?<span>y<\/span><\/li>/);
  const madre = views("chile-data-protection");   // la madre sigue con su tabla de reglas y sus escenarios
  const own = html(CodeGuide, codeGuideProps(madre.code_guide));
  assert.match(own, /code-guide-scenarios/);
  assert.match(own, /<th>Regla<\/th>/);
});

test("Arquitectura: el diagrama de la madre con el registro resaltado y dos franjas; sin «Control y evidencia»", () => {
  const { RequirementToData } = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const { requirementToDataProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const diagram = html(RequirementToData, requirementToDataProps(inv.requirement_to_data));
  assert.match(diagram, /<article class="is-highlight"><strong>Registro de actividades de tratamiento<\/strong>/);
  assert.match(diagram, /class="is-end is-highlight"><strong>Consumo por finalidad<\/strong>/);
  assert.equal((diagram.match(/class="control-evidence-banner"/g) ?? []).length, 2);
  // Retirado del Inventario por decisión del dueño (2026-11-18): ni la vista ni su marca en Arquitectura.
  const text = readFileSync(join(ROOT, "content/concepts/processing-activities-inventory.md"), "utf8");
  assert.equal(inv.control_evidence, undefined);
  assert.equal(text.includes("<!-- view: control_evidence -->"), false);
});

test("ControlEvidence conserva las extensiones de la enmienda 9 aunque el Inventario no las use (pastillas, ámbar, sin ejemplo)", () => {
  const { ControlEvidence } = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const { controlEvidenceProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const fixture = {
    title: "Patrón", lead: "l",
    steps: [{ number: "1", title: "Observar", items: ["simple", { pill: "Lo nuevo", text: "a" }, { pill: "Lo que ya corre", text: "b" }] }],
    decide: { number: "2", title: "Decidir", outcomes: [
      { tone: "pass", text: "p" }, { tone: "fail", text: "f" }, { tone: "warn", text: "w" }, { tone: "keep", text: "k" }] },
    note: "n",
  };
  const control = html(ControlEvidence, controlEvidenceProps(fixture));
  assert.equal((control.match(/class="control-evidence-pill"/g) ?? []).length, 2);
  for (const tone of ["is-pass", "is-fail", "is-warn", "is-keep"]) assert.match(control, new RegExp(`class="${tone}"`));
  assert.equal(control.includes("control-evidence-example"), false);
});

test("retrocompatible: la madre conserva una franja, sin resaltados, y su ejemplo; pii no cambia de marcado en sus vistas", () => {
  const { RequirementToData, ControlEvidence } = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const { requirementToDataProps, controlEvidenceProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const madre = views("chile-data-protection");
  const diagram = html(RequirementToData, requirementToDataProps(madre.requirement_to_data));
  assert.equal((diagram.match(/class="control-evidence-banner"/g) ?? []).length, 1);
  assert.equal(diagram.includes("is-highlight"), false);
  assert.match(diagram, /<strong>Registro de actividades de tratamiento<\/strong>/);   // único cambio de texto de la madre
  assert.match(html(ControlEvidence, controlEvidenceProps(madre.control_evidence)), /control-evidence-example/);
  const { CloudCompare } = loadTsx(join(ficha, "CloudCompare.tsx"));
  const { cloudCompareProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const pii = html(CloudCompare, cloudCompareProps(views("pii-identification").cloud_compare));
  assert.equal(/ id="cloud-h-|cloud-span/.test(pii), false);
});

test("En la nube: el mismo componente que pii; Finalidad y Puerta de despliegue en una celda con headers", () => {
  const { CloudCompare } = loadTsx(join(ficha, "CloudCompare.tsx"));
  const { cloudCompareProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const markup = html(CloudCompare, cloudCompareProps(inv.cloud_compare));
  assert.match(markup, /class="pii-table"/);
  assert.equal((markup.match(/class="cloud-span" colSpan="3" headers="cloud-h-0 cloud-h-2 cloud-h-3 cloud-h-4"/g) ?? []).length, 2);
  assert.equal((markup.match(/data-tone="where"/g) ?? []).length, 1);
  assert.match(markup, /395 días/);
  assert.match(markup, /No incluye consultas servidas desde la caché/);
  assert.equal(markup.includes("GetTable"), false);
});

test("§3 explorador y §4 caso: datos generados del código y rótulos móviles", () => {
  const { ActivityExplorer } = loadTsx(join(ficha, "ActivityExplorer.tsx"));
  const explorer = html(ActivityExplorer, { view: inv.activity_explorer });
  assert.match(explorer, /role="tab"[^>]*aria-selected="true"[^>]*><code>venta_pasajes<\/code>/);
  assert.match(explorer, /Sin hallazgos: dag_reservas lee solo columnas que su finalidad necesita\./);
  const { CaseCompare } = loadTsx(join(ficha, "InventoryBlocks.tsx"));
  const caso = html(CaseCompare, { view: inv.case_compare });
  assert.equal((caso.match(/data-c="Con inventario"/g) ?? []).length, 4);
});

test("contraste AA (4,5:1) de los pares nuevos, en claro y oscuro", () => {
  const pairs: [string, string][] = [
    ["--pii-result", "--pii-result-bg"],      // ojo, pestaña del 14 ter y franja alternada
    ["--ink-2", "--pii-result-bg"],           // texto de la fila alternada
    ["--pii-personal", "--pii-personal-bg"],  // pestaña del Decreto
    ["--warn-ink", "--warn-bg"],              // sin evaluar, tono ámbar de ControlEvidence, nota de la hoja
    ["--pii-sensitive", "--pii-sensitive-bg"],// revisión, fila de riesgo, chip ✕
    ["--accent", "--accent-soft"],            // tarjeta activa, pastillas, botón «Ver detalle» con hover
    ["--accent", "--surface"],                // botón «Ver detalle» en reposo
    ["--pii-pick", "--pii-pick-bg"],          // pestaña elegida del explorador
    ["--ink-3", "--surface-muted"],           // encabezado de columnas y rótulos
    ["--on-accent", "--accent"],              // ✓ del caso con inventario
  ];
  const { light, dark } = tokens();
  for (const [theme, t] of [["claro", light], ["oscuro", dark]] as const) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(hex(fg, t), hex(bg, t));
      assert.ok(ratio >= 4.5, `${fg} sobre ${bg} en ${theme}: ${ratio.toFixed(2)}:1`);
    }
  }
});

test("§2: 2.1 y 2.2 comparten el encabezado de subsección; 2.2 ya no dibuja su propio título", async () => {
  const { RegisterFields } = loadTsx(join(ficha, "RegisterFields.tsx"));
  const markup = html(RegisterFields, { view: inv.register_fields });
  assert.equal(markup.includes("inv-rg-title"), false);
  assert.equal(/<h4[^>]*>Campos del registro y de dónde viene cada uno<\/h4>/.test(markup), false);
  assert.match(markup, /<section class="inv-view inv-rg" aria-label="Campos del registro y de dónde viene cada uno">/);
  const { subsectionAnchors } = loadTsx(join(ROOT, "frontend/components/markdown/MarkdownBody.tsx"));
  const { parseMarkdown } = loadTsx(join(ROOT, "frontend/lib/markdown.ts"));
  const blocks = parseMarkdown("### Cinco preguntas\n\n<!-- view: law_ladder -->\n\n### Campos del registro\n\n<!-- view: register_fields -->");
  assert.deepEqual([...subsectionAnchors(blocks, "ley").values()], ["ley-1", "ley-2"]);
  assert.equal(subsectionAnchors(blocks).size, 0);   // sin la clave de la división, ningún ### se numera
  const css = readFileSync(join(ROOT, "frontend/components/card/reading.css"), "utf8");
  assert.match(css, /\.reading-details \.markdown h3\.reading-subsection::before \{\n  content: var\(--section-number\) "\." counter\(subsection\)/);
  const reading = readFileSync(join(ROOT, "frontend/components/card/ConceptReading.tsx"), "utf8");
  assert.match(reading, /"--section-number": `"\$\{shownNumber\(section\)\}"`/);
});

test("«Lo que el formulario muestra y el código no guarda» va en un desplegable cerrado, con la tabla sin cambios", () => {
  const { CodeGuide } = loadTsx(join(ficha, "CodeGuide.tsx"));
  const { codeGuideProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  assert.equal(inv.code_guide.not_covered.table.disclosure, "closed");
  const markup = html(CodeGuide, codeGuideProps(inv.code_guide));
  const block = /<div class="disclosure" data-open="false"><div class="disclosure-head"><h4 id="[^"]+">Lo que el formulario muestra y el código no guarda<\/h4><button[^>]*aria-expanded="false"[^>]*>.*?<\/div><\/div><\/div>/.exec(markup)?.[0] ?? "";
  assert.ok(block, "el desplegable con su título (sin el punto final) y cerrado");
  assert.match(block, /hidden=""/);
  assert.equal((block.match(/<tr>/g) ?? []).length, 1 + inv.code_guide.not_covered.table.rows.length);   // encabezado + 8 filas
  assert.equal(markup.includes("<strong>Lo que el formulario muestra"), false);   // ya no es un título en el cuerpo
});

test("ancho y tipografía: los bloques <ol> del Inventario llenan su tarjeta y las tarjetas de §1 usan la sans de los componentes", () => {
  const sheet = readFileSync(join(ficha, "inventory-views.css"), "utf8");
  assert.match(sheet, /\.reading-measure \.markdown ol\.inv-build,\n\.reading-measure \.markdown ol\.inv-ladder,\n\.reading-measure \.markdown \.inv-lane ol \{\n  max-width: none;\n  padding-left: 0;\n\}/);
  const reading = readFileSync(join(ROOT, "frontend/components/card/reading.css"), "utf8");
  assert.match(reading, /\.reading-summary \.markdown p:not\(\.pii-view \*, \.pii-use \*, \.pii-note, \.pii-risk, \.inv-view \*\)/);
});

test("§5: pasos alineados por fila con subgrid solo lado a lado; «Usarlo» por debajo del subtítulo solo en el Inventario", () => {
  const sheet = readFileSync(join(ficha, "inventory-views.css"), "utf8");
  assert.match(sheet, /@media \(min-width: 821px\) \{\n  \.inv-lane ol \{\n    grid-template-rows: repeat\(6, auto\);\n  \}\n\n  \.inv-lane li \{\n    display: grid;\n    grid-row: span 6;\n    grid-template-rows: subgrid;/);
  const { CycleLanes } = loadTsx(join(ficha, "InventoryBlocks.tsx"));
  const markup = html(CycleLanes, { view: inv.cycle_lanes });
  for (const step of [...markup.matchAll(/<li>(.*?)<\/li>/g)].map((m) => m[1])) {
    // seis hijos en orden: número, título, descripción, caso, evidencia, no demuestra (una fila de la subgrid cada uno)
    assert.match(step, /^<span class="inv-lane-n">[^<]+<\/span><b>[^<]+<\/b><p>.*<\/p><p class="inv-lane-case">.*<\/p><p class="inv-lane-evidence">.*<\/p><p class="inv-lane-limit">.*<\/p>$/);
  }
  assert.match(sheet, /\.reading-article:has\(\.inv-view\) \.reading-details \.pii-use \.pii-col > h3 \{\n  font-size: 15px;/);
  assert.equal(readFileSync(join(ficha, "pii-views.css"), "utf8").includes("font-size: 15px;\n  letter-spacing: 0.06em"), false);   // pii no cambia
});

test("enmienda 11: la interpretación de la escalera va en su propia línea, solo en la fila que la declara", () => {
  const { LawLadder } = loadTsx(join(ficha, "InventoryBlocks.tsx"));
  const markup = html(LawLadder, { view: inv.law_ladder });
  // Dos filas la declaran: el plazo (interpretación) y la quinta fila (marca «Consecuencia, no obligación», 2026-11-18).
  assert.equal((markup.match(/<p class="inv-ladder-interp">/g) ?? []).length, 2);
  assert.match(markup, /<p class="inv-ladder-interp"><strong>Interpretación de la ficha:<\/strong>(<span>)? La ley no fija un plazo general/);
  assert.match(markup, /<p class="inv-ladder-interp"><strong>Consecuencia, no obligación<\/strong><\/p>/);
  assert.match(markup, /<span>Lo que se espera \(paráfrasis\)<\/span>/);
  const without = html(LawLadder, { view: { ...inv.law_ladder, rows: inv.law_ladder.rows.map(({ interpretation, ...row }) => row) } });
  assert.equal(without.includes("inv-ladder-interp"), false);
});

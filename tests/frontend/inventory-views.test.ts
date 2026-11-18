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

test("«9 controles · 14 hallazgos» se calcula de las filas de la tabla", () => {
  const { rulesSummary } = loadTsx(join(ficha, "CodeGuide.tsx"));
  assert.equal(rulesSummary(inv.code_guide.rules.summary, inv.code_guide.rules.items), "9 controles · 14 hallazgos");
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

test("Código del Inventario sigue a la madre: sin ejemplo ni tarjetas de paso, desplegables y códigos de salida", () => {
  const { CodeGuide } = loadTsx(join(ficha, "CodeGuide.tsx"));
  const { codeGuideProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const markup = html(CodeGuide, codeGuideProps(inv.code_guide));
  assert.match(markup, /Códigos de salida<\/span> <span><code>actual<\/code> → 1<\/span>/);
  assert.match(markup, /<h4 id="[^"]+">Controles del código y qué encuentra en actual<\/h4><span class="disclosure-summary">9 controles · 14 hallazgos<\/span>/);
  assert.match(markup, /<h4 id="[^"]+">Escenarios<\/h4>/);
  assert.equal((markup.match(/<li><code>[^<]+<\/code> → /g) ?? []).length, 14);   // hallazgo → corrección
  assert.equal(markup.includes("control-evidence-example"), false);
  const order = ["Qué hace", "Controles del código", "Qué no cubre", "Lo que el formulario muestra", "Escenarios", "Qué simplifica", "Límite"];
  const positions = order.map((label) => markup.indexOf(label));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "orden de las subsecciones");
});

test("Arquitectura: el diagrama de la madre con el registro resaltado, dos franjas y «Control y evidencia» sin ejemplo", () => {
  const { RequirementToData, ControlEvidence } = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const { requirementToDataProps, controlEvidenceProps } = loadTsx(join(ROOT, "frontend/lib/views.ts"));
  const diagram = html(RequirementToData, requirementToDataProps(inv.requirement_to_data));
  assert.match(diagram, /<article class="is-highlight"><strong>Registro de actividades de tratamiento<\/strong>/);
  assert.match(diagram, /class="is-end is-highlight"><strong>Consumo por finalidad<\/strong>/);
  assert.equal((diagram.match(/class="control-evidence-banner"/g) ?? []).length, 2);
  const control = html(ControlEvidence, controlEvidenceProps(inv.control_evidence));
  assert.equal((control.match(/class="control-evidence-pill"/g) ?? []).length, 4);
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
    ["--warn-ink", "--warn-bg"],              // sin evaluar, ámbar de «Control y evidencia», nota de la hoja
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

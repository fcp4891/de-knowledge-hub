import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { test } from "node:test";

import {
  annotateCode,
  centerScrollTop,
  centerTarget,
  codeSteps,
  contrastRatio,
  copySource,
  downloadFilename,
  downloadSource,
  fitsInCompact,
  nextTrapIndex,
  scenarioNames,
  type CodeOutput,
  type CodePresentation,
} from "../../frontend/lib/codeBlocks.ts";
import { parseMarkdown, type Block } from "../../frontend/lib/markdown.ts";

const root = join(import.meta.dirname, "../..");
const content = join(root, "content");

function markdownFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_templates") continue;
      found.push(...markdownFiles(path));
      continue;
    }
    if (entry.name.endsWith(".md")) found.push(path);
  }
  return found;
}

function body(raw: string): string {
  if (!raw.startsWith("---\n")) return raw;
  const end = raw.indexOf("\n---\n", 3);
  return end === -1 ? raw : raw.slice(end + 5);
}

function viewsOf(markdown: string): { block: Extract<Block, { type: "code" }>; view: CodePresentation }[] {
  const blocks = parseMarkdown(markdown);
  const notes = annotateCode(blocks);
  const views: { block: Extract<Block, { type: "code" }>; view: CodePresentation }[] = [];
  for (const block of blocks) {
    if (block.type !== "code") continue;
    const note = notes.get(block);
    if (note?.role !== "code") continue;
    views.push({ block, view: note.view });
  }
  return views;
}

const output = (name: string | null, text = name ?? "salida", exitCode: 0 | 1 | null = null): CodeOutput => ({
  name,
  text,
  exitCode,
});

test("el texto copiado y descargado de todas las fichas es el original", () => {
  const files = markdownFiles(content);
  assert.ok(files.length > 100);
  let blocks = 0;
  for (const file of files) {
    const parsed = parseMarkdown(body(readFileSync(file, "utf8")));
    const notes = annotateCode(parsed);
    const attached = new Set<string>();
    for (const block of parsed) {
      if (block.type !== "code" || block.language.trim().toLowerCase() === "mermaid") continue;
      const note = notes.get(block);
      if (note?.role === "code") {
        blocks += 1;
        assert.equal(note.view.code, block.code);
        assert.equal(copySource(note.view.code), block.code);
        assert.equal(downloadSource(note.view.code), block.code);
        for (const item of note.view.outputs) attached.add(item.text);
      }
      if (note?.role === "output") assert.ok(attached.has(block.code), file);
    }
  }
  assert.ok(blocks > 50);
});

test("un bloque corto cabe entero y uno largo pide el modal", () => {
  assert.equal(fitsInCompact(1), true);
  assert.equal(fitsInCompact(10), true);
  assert.equal(fitsInCompact(11), false);
  const css = readFileSync(join(root, "frontend/components/markdown/code-block.css"), "utf8");
  const source = readFileSync(join(root, "frontend/components/markdown/CodeBlock.tsx"), "utf8");
  assert.match(css, /\.code-scroll\s*\{[^}]*max-height:\s*200px/s);
  assert.match(css, /data-fit="true"\] \.code-scroll\s*\{[^}]*max-height:\s*none/s);
  assert.match(source, /fits \? null : \(/);
  assert.match(source, /Ver completo/);
  assert.match(source, /writeText\(code\)/);
  assert.match(source, /new Blob\(\[downloadSource\(code\)\]/);
  assert.match(source, /aria-label="Código"/);
  assert.match(source, /tabIndex=\{0\}/);
  assert.match(source, /left: 0/);
});

test("los pasos se deducen en Python, SQL y bash, y uno solo no muestra la barra", () => {
  const python = codeSteps("python", "def cargar():\n    return 1\n\ndef guardar():\n    return 2\n");
  assert.deepEqual(python.map((step) => step.title), ["cargar", "guardar"]);
  assert.equal(python[0].start, 0);
  assert.ok(python[0].end < python[1].start);

  const nested = codeSteps("python", "@dataclass\nclass Caja:\n    def interna(self):\n        return 1\n\ndef cerrar():\n    return 2\n");
  assert.deepEqual(nested.map((step) => step.title), ["Caja", "cerrar"]);
  assert.equal(nested[0].start, 0);

  const sql = codeSteps("sql", "-- Crea la tabla\nCREATE TABLE t (id int);\n\n-- Borra la tabla\nDROP TABLE t;\n");
  assert.deepEqual(sql.map((step) => step.title), ["Crea la tabla", "Borra la tabla"]);

  const bash = codeSteps("bash", "# prepara el directorio\nmkdir out\n\n# publica el mensaje\necho hi\n");
  assert.equal(bash.length, 2);
  assert.equal(bash[0].title, "prepara el directorio");
  assert.equal(bash[1].fullTitle, "publica el mensaje");

  const yaml = codeSteps("yaml", "# servicio\napiVersion: v1\n\n# puerto\nports:\n  - 80\n");
  assert.deepEqual(yaml.map((step) => step.title), ["servicio", "puerto"]);

  assert.deepEqual(codeSteps("python", "def solo():\n    pass\n"), []);
  assert.deepEqual(codeSteps("bash", "# un solo grupo\necho hi\n"), []);
  assert.deepEqual(codeSteps("sql", "SELECT 1;\n"), []);
  const many = Array.from({ length: 9 }, (_, index) => `def f${index}():\n    return ${index}\n`).join("\n");
  assert.deepEqual(codeSteps("python", many), []);

  const marked = codeSteps("python", "# @paso 1 Crear la tabla de pedidos\nx = 1\n# @paso 2 Guardar\nx = 2\n");
  assert.equal(marked[0].title, "Crear la tabla");
  assert.equal(marked[0].truncated, true);
  assert.equal(marked[0].fullTitle, "Crear la tabla de pedidos");
  assert.equal(marked[1].title, "Guardar");
});

test("Todo mantiene centrado el último paso y el foco vuelve al recorrer el modal", () => {
  const steps = codeSteps("python", "def uno():\n    return 1\n\ndef dos():\n    return 2\n");
  assert.equal(centerTarget(1, 0, steps)?.title, "dos");
  assert.equal(centerTarget(null, 1, steps)?.title, "dos");
  assert.equal(centerTarget(null, null, steps), null);
  assert.equal(centerScrollTop(0, 40, 200), 0);
  assert.equal(centerScrollTop(400, 40, 200), 320);
  assert.equal(nextTrapIndex(-1, 3, false), 0);
  assert.equal(nextTrapIndex(0, 3, true), 2);
  assert.equal(nextTrapIndex(2, 3, false), 0);
  assert.equal(nextTrapIndex(1, 3, false), null);
  const source = readFileSync(join(root, "frontend/components/markdown/CodeBlock.tsx"), "utf8");
  assert.match(source, /centerTarget\(nextActive, nextLast, steps\)/);
  assert.match(source, /scrollAll\(active, last\)/);
  assert.match(source, /openRef\.current\?\.focus\(\)/);
});

test("el selector de escenarios solo aparece con dos o más salidas con nombre", () => {
  assert.equal(scenarioNames([output("con-brechas")]), null);
  assert.deepEqual(scenarioNames([output("con-brechas"), output("corregido")]), ["con-brechas", "corregido"]);
  assert.equal(scenarioNames([output("con-brechas"), output(null)]), null);
  assert.equal(scenarioNames([]), null);

  const paired = viewsOf(
    [
      "```python",
      "def main():",
      "    return 1",
      "```",
      "",
      "Sale con código 1:",
      "",
      "```text",
      "con-brechas: FAIL",
      "CI: rechazada (1)",
      "```",
      "",
      "Y el corregido:",
      "",
      "```text",
      "corregido: PASS",
      "CI: aprobada (0)",
      "```",
    ].join("\n"),
  );
  assert.equal(paired.length, 1);
  assert.equal(paired[0].view.code, "def main():\n    return 1");
  assert.deepEqual(scenarioNames(paired[0].view.outputs), ["con-brechas", "corregido"]);
  assert.deepEqual(
    paired[0].view.outputs.map((item) => item.exitCode),
    [1, 0],
  );
  assert.equal(paired[0].view.status, null);

  const single = viewsOf("```bash\necho hi\n```\n\n```text\nhecho\n```\n");
  assert.equal(single[0].view.outputs.length, 1);
  assert.equal(scenarioNames(single[0].view.outputs), null);

  const none = viewsOf("```sql\nSELECT 1;\n```\n");
  assert.deepEqual(none[0].view.outputs, []);
});

test("los botones claros sobre fondo oscuro cumplen AA y a 390 px el modal no desborda", () => {
  const tokens = readFileSync(join(root, "frontend/styles/tokens.css"), "utf8");
  const css = readFileSync(join(root, "frontend/components/markdown/code-block.css"), "utf8");
  const fill = /--band-especializacion-fill:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
  const button = /--code-button:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
  const ink = /--code-ink:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
  const bar = /--code-bar:\s*(#[0-9A-Fa-f]{6})/.exec(tokens)?.[1];
  assert.ok(fill && button && ink && bar);
  assert.ok(contrastRatio("#ffffff", fill) >= 4.5);
  assert.ok(contrastRatio("#ffffff", button) >= 4.5);
  assert.ok(contrastRatio(ink, bar) >= 4.5);
  assert.match(css, /background:\s*var\(--code-button\)/);
  assert.match(css, /color:\s*#fff/);
  assert.match(css, /background:\s*var\(--band-especializacion-fill\)/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /white-space:\s*pre/);
  assert.match(css, /overflow:\s*auto/);
  assert.match(css, /@media \(max-width:\s*390px\)[\s\S]*width:\s*100%;[\s\S]*height:\s*100%/);
  assert.match(css, /\.code-shell\s*\{[^}]*max-width:\s*100%/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*scroll-behavior:\s*auto/);
  const dark = tokens.split("@media (prefers-color-scheme: dark)")[1] ?? "";
  assert.equal(dark.includes("--code-button"), false);
  assert.equal(dark.includes("--band-especializacion-fill: #7C3A6E"), true);
});

test("la extensión de descarga sigue al lenguaje y el nombre de archivo no se inventa", () => {
  assert.equal(downloadFilename("python", null), "codigo.py");
  assert.equal(downloadFilename("sql", null), "codigo.sql");
  assert.equal(downloadFilename("bash", null), "codigo.sh");
  assert.equal(downloadFilename("yaml", null), "codigo.yaml");
  assert.equal(downloadFilename("python", "controles.py"), "controles.py");
  assert.equal(downloadFilename("sh", null), "codigo.sh");
});

test("censo de pasos, terminal y escenarios", () => {
  const rows: { file: string; language: string; steps: number; outputs: number; scenarios: number }[] = [];
  for (const file of markdownFiles(content)) {
    const relative = file.slice(content.length + 1).split(sep).join("/");
    for (const item of viewsOf(body(readFileSync(file, "utf8")))) {
      if (item.block.language.trim().toLowerCase() === "text") continue;
      const names = scenarioNames(item.view.outputs);
      rows.push({
        file: relative,
        language: item.view.language || item.block.language,
        steps: item.view.steps.length,
        outputs: item.view.outputs.length,
        scenarios: names?.length ?? 0,
      });
    }
  }
  const withSteps = rows.filter((row) => row.steps >= 2);
  const withTerminal = rows.filter((row) => row.outputs >= 1);
  const withScenarios = rows.filter((row) => row.scenarios >= 2);
  console.log(
    JSON.stringify(
      {
        blocks: rows.length,
        steps: withSteps.length,
        terminal: withTerminal.length,
        scenarios: withScenarios.length,
        stepExamples: withSteps.slice(0, 3),
        terminalExamples: withTerminal.slice(0, 3),
        scenarioExamples: withScenarios.slice(0, 3),
      },
      null,
      2,
    ),
  );
  assert.equal(withScenarios.every((row) => row.scenarios >= 2), true);
  assert.equal(withSteps.every((row) => row.steps >= 2 && row.steps <= 8), true);

  const chile = rows.filter((row) => row.file.endsWith("chile-data-protection.md") && row.language === "python");
  assert.equal(chile.length, 1);
  assert.equal(chile[0].outputs, 4);   // piloto de código guiado (2026-11-03): un bloque text por escenario
  assert.equal(chile[0].scenarios, 4);
  assert.equal(chile[0].steps, 4);     // # @paso 1 Datos … 4 Resultado
  const chileView = viewsOf(body(readFileSync(join(content, "concepts/chile-data-protection.md"), "utf8"))).find(
    (item) => item.view.language === "python",
  );
  assert.equal(chileView?.view.status?.label, "ejecutado en CI");
  assert.deepEqual(scenarioNames(chileView?.view.outputs ?? []), ["con-brechas", "corregido", "sin-revision", "evidencia-alterada"]);
  assert.deepEqual(chileView?.view.outputs.map((output) => output.exitCode), [1, 0, 1, 1]);

  const sql = rows.filter((row) => row.file.endsWith("cloud-sql-as-source.md") && row.language === "sql");
  assert.equal(sql.length, 2);
  assert.equal(sql.every((row) => row.scenarios === 0), true);

  const bash = rows.filter((row) => row.file.endsWith("kappa-architecture.md") && row.language === "bash");
  assert.equal(bash.length, 1);
  assert.equal(bash[0].outputs, 1);
  assert.equal(bash[0].scenarios, 0);
});

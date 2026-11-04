import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { groupArrowRuns, readInlineArrows, type ArrowRun } from "../../frontend/lib/inlineArrows.ts";
import { parseMarkdown, type Inline, type ListItem } from "../../frontend/lib/markdown.ts";
import { readPipeline } from "../../frontend/lib/pipeline.ts";

function item(markdown: string): Inline[] {
  const block = parseMarkdown(markdown)[0];
  if (block.type === "paragraph") {
    return block.inlines;
  }
  if (block.type === "list") {
    return (block.items[0] as ListItem).inlines;
  }
  throw new Error(block.type);
}

function cell(markdown: string, row: number, column: number): Inline[] {
  const block = parseMarkdown(markdown).find((entry) => entry.type === "table");
  if (!block || block.type !== "table") {
    throw new Error("sin tabla");
  }
  return block.rows[row][column];
}

function show(runs: ArrowRun[] | null): string | null {
  if (!runs) {
    return null;
  }
  return runs
    .map((run) => {
      if (run.kind === "arrow") {
        return run.value;
      }
      if (run.kind === "space") {
        return run.value;
      }
      const text = run.inlines.map((part) => part.value).join("");
      return run.kind === "pill" ? `[${text}]` : text;
    })
    .join("");
}

test("términos claros quedan en píldoras, también con ↔ y con «y»", () => {
  const shown = show(
    readInlineArrows(
      item("- **Relaciones muchos a muchos:** actividad ↔ activo y actividad ↔ consumidor."),
    ),
  );
  assert.match(shown ?? "", /\[actividad\] ↔ \[activo\] y \[actividad\] ↔ \[consumidor\]/);
});

test("el código inline es un término claro", () => {
  const runs = readInlineArrows(item("`numeric` → `bigint`"));
  assert.equal(show(runs), "[numeric] → [bigint]");
  const pill = runs?.find((run) => run.kind === "pill");
  assert.equal(pill?.kind === "pill" ? pill.inlines[0].type : "", "code");
});

test("una cadena de una a tres palabras queda en píldoras", () => {
  assert.equal(
    show(readInlineArrows(item("producto → subcategoría → categoría."))),
    "[producto] → [subcategoría] → [categoría].",
  );
});

test("si el lado no cabe en tres palabras, solo se estiliza la flecha", () => {
  const shown = show(
    readInlineArrows(item("- **Runbook:** regla nueva → desplegar v2 con grupo nuevo desde el inicio.")),
  );
  assert.equal(shown?.includes("["), false);
  assert.match(shown ?? "", /regla nueva → desplegar v2 con grupo nuevo desde el inicio/);
});

test("la celda de la matriz es flecha en línea, no una cadena de pasos", () => {
  const inlines = cell(
    "| Evidencia | Dónde |\n|---|---|\n| Matriz requisito → control → evidencia | Repositorio |",
    0,
    0,
  );
  assert.equal(show(readInlineArrows(inlines)), "[Matriz requisito] → [control] → [evidencia]");
  assert.ok(readPipeline(inlines));
});

test("la celda de flujos es flecha en línea", () => {
  const inlines = cell(
    "| Error | Consecuencia |\n|---|---|\n| Suponer | Flujos Chile → Brasil o Brasil → Chile tratados como si tuvieran adecuación |",
    0,
    1,
  );
  assert.equal(
    show(readInlineArrows(inlines)),
    "[Flujos Chile] → [Brasil] o Brasil → Chile tratados como si tuvieran adecuación",
  );
});

test("comuna y región quedan en el mismo grupo que la flecha", () => {
  const runs = readInlineArrows(item("generalizar (comuna → región, año → década)"));
  const groups = groupArrowRuns(runs ?? []);
  const glued = groups.filter((group) => group.nowrap);
  assert.equal(glued.length, 2);
  assert.match(show(glued[0]?.runs ?? null) ?? "", /\[comuna\] → \[región\]/);
  assert.match(show(glued[1]?.runs ?? null) ?? "", /\[año\] → \[década\]/);
  const css = readFileSync(join(import.meta.dirname, "../../frontend/components/markdown/pipeline.css"), "utf8");
  assert.match(css, /\.flow-pair\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(css, /margin-inline:\s*0\.25em/);
});

test("varios grupos entre paréntesis no se transforman", () => {
  assert.equal(
    readInlineArrows(
      item("`stg_pedidos` (raw.pedidos → stg.pedidos), `stg_clientes` (raw.clientes → stg.clientes)."),
    ),
    null,
  );
});

test("las celdas no pasan por el lector de cadenas", () => {
  const source = readFileSync(join(import.meta.dirname, "../../frontend/components/markdown/MarkdownBody.tsx"), "utf8");
  const table = source.slice(source.indexOf('block.type === "table"'), source.indexOf('block.type === "list"'));
  assert.equal(table.includes("readPipeline"), false);
  assert.match(table, /ArrowInlines/);
  const page = readFileSync(join(import.meta.dirname, "../../frontend/app/concepts/[slug]/page.tsx"), "utf8");
  assert.match(page, /slug !== "data-lineage"/);
});

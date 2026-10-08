// Tests del parser de Markdown del frontend (frontend/lib/markdown.ts), con el runner nativo de Node.
// Node 24 elimina los tipos de TypeScript al importar; no hace falta ninguna dependencia nueva.
// Uso: node --test tests/frontend/   (o `make test-frontend`).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { parseMarkdown, type Block } from "../../frontend/lib/markdown.ts";

const ROOT = join(import.meta.dirname, "..", "..");

function only<T extends Block["type"]>(blocks: Block[], type: T): Extract<Block, { type: T }>[] {
  return blocks.filter((block): block is Extract<Block, { type: T }> => block.type === type);
}

test("tabla GFM: encabezados, alineación y filas", () => {
  const [table] = only(parseMarkdown("| Motor | NULL | Costo |\n|:---|:---:|---:|\n| BigQuery | `NULL` | alto |\n| PostgreSQL | ignora | bajo |"), "table");
  assert.ok(table);
  assert.deepEqual(table.headers.map((cell) => cell.map((i) => i.value).join("")), ["Motor", "NULL", "Costo"]);
  assert.deepEqual(table.aligns, ["left", "center", "right"]);
  assert.equal(table.rows.length, 2);
  assert.deepEqual(table.rows[0][1], [{ type: "code", value: "NULL" }]);
});

test("tabla sin barras en los extremos y con barra escapada", () => {
  const [table] = only(parseMarkdown("a | b\n--- | ---\nx \\| y | z"), "table");
  assert.ok(table);
  assert.equal(table.rows[0][0][0].value, "x | y");
  assert.equal(table.rows[0][1][0].value, "z");
});

test("fila con menos celdas se completa con celdas vacías", () => {
  const [table] = only(parseMarkdown("| a | b | c |\n|---|---|---|\n| 1 | 2 |"), "table");
  assert.ok(table);
  assert.equal(table.rows[0].length, 3);
  assert.deepEqual(table.rows[0][2], []);
});

// Pendiente de Carril B: en GFM una fila de una sola celda sigue siendo fila de la tabla; hoy isTableRow
// exige 2 celdas, así que la tabla termina y "| 1 |" queda como párrafo. Ninguna ficha tiene ese caso.
test("fila de una sola celda sigue dentro de la tabla (GFM)", { todo: "isTableRow exige 2 celdas" }, () => {
  const blocks = parseMarkdown("| a | b |\n|---|---|\n| 1 |");
  assert.deepEqual(blocks.map((block) => block.type), ["table"]);
});

test("una línea con | sin separador no es tabla", () => {
  const blocks = parseMarkdown("El operador a | b no es una tabla.\nSigue el párrafo.");
  assert.equal(only(blocks, "table").length, 0);
  assert.equal(only(blocks, "paragraph").length, 1);
});

test("la tabla termina en la línea en blanco y el párrafo siguiente se conserva", () => {
  const blocks = parseMarkdown("| a | b |\n|---|---|\n| 1 | 2 |\n\nTexto después.");
  assert.deepEqual(blocks.map((block) => block.type), ["table", "paragraph"]);
});

test("una tabla dentro de un bloque de código no se interpreta", () => {
  const blocks = parseMarkdown("```text\n| a | b |\n|---|---|\n```");
  assert.deepEqual(blocks.map((block) => block.type), ["code"]);
});

test("listas de tareas, tachado y enlaces automáticos", () => {
  const [list] = only(parseMarkdown("- [x] hecho\n- [ ] pendiente\n- normal"), "list");
  assert.ok(list);
  assert.deepEqual(list.items.map((item) => item.checked), [true, false, null]);

  const [paragraph] = only(parseMarkdown("~~viejo~~ ver https://docs.python.org/3.12/library/os.html."), "paragraph");
  assert.ok(paragraph);
  assert.deepEqual(paragraph.inlines[0], { type: "del", value: "viejo" });
  const link = paragraph.inlines.find((inline) => inline.type === "link");
  assert.deepEqual(link, { type: "link", href: "https://docs.python.org/3.12/library/os.html", value: "https://docs.python.org/3.12/library/os.html" });
  assert.deepEqual(paragraph.inlines.at(-1), { type: "text", value: "." });
});

test("comentario VERIFY se muestra como nota", () => {
  const [note] = only(parseMarkdown("<!-- VERIFY: confirmar el límite -->"), "note");
  assert.ok(note);
  assert.deepEqual(note.inlines, [{ type: "text", value: "confirmar el límite" }]);
});

test("toda tabla de content/ se reconoce y sus filas no tienen más celdas que encabezados", () => {
  const dirs = ["concepts", "snippets"].map((dir) => join(ROOT, "content", dir));
  let tablas = 0;
  for (const dir of dirs) {
    for (const name of readdirSync(dir).filter((file) => file.endsWith(".md"))) {
      const body = readFileSync(join(dir, name), "utf-8").replace(/\r\n/g, "\n").split(/^---$/m).slice(2).join("---");
      const separadores = body
        .replace(/```[\s\S]*?```/g, "")
        .split("\n")
        .filter((line) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim())).length;
      const tables = only(parseMarkdown(body), "table");
      assert.equal(tables.length, separadores, `${name}: tablas reconocidas`);
      for (const table of tables) {
        for (const row of table.rows) {
          assert.ok(row.length <= table.headers.length, `${name}: fila con ${row.length} celdas y ${table.headers.length} encabezados`);
        }
      }
      tablas += tables.length;
    }
  }
  assert.ok(tablas > 0, "se esperaba al menos una tabla en content/");
});

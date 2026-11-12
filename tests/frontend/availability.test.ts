import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const page = readFileSync(join(import.meta.dirname, "../../frontend/app/concepts/[slug]/page.tsx"), "utf8");

test("una ficha no disponible es una página mínima con noindex y textos del contrato (ADR-031)", () => {
  assert.match(page, /robots: \{ index: false, follow: true \}/);
  assert.match(page, /data\.availability !== "available" && data\.availability_text/);
  assert.match(page, /\{text\.label\}/);
  assert.match(page, /\{text\.help\}/);
  assert.match(page, /\{text\.back_label\}/);
  for (const fixed of ["En desarrollo", "En revisión", "Volver al itinerario"]) {
    assert.equal(page.includes(fixed), false, fixed);
  }
});

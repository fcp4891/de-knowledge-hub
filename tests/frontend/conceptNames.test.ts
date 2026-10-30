import assert from "node:assert/strict";
import { test } from "node:test";

import { conceptInline, conceptRefs } from "../../frontend/lib/conceptNames.ts";

const refs = conceptRefs([
  { slug: "pii-identification", title: "Identificación de datos personales y sensibles", has_page: true },
  { slug: "retention-schedule", title: "Calendario de retención", has_page: false },
  { slug: "sin-titulo", title: "   ", has_page: true },
]);

test("un slug con ficha se muestra con su nombre y enlace", () => {
  assert.deepEqual(conceptInline("pii-identification", refs), {
    kind: "link",
    label: "Identificación de datos personales y sensibles",
    href: "/concepts/pii-identification/",
    slug: "pii-identification",
  });
});

test("un slug del blueprint sin ficha queda pendiente y sin enlace", () => {
  assert.deepEqual(conceptInline("retention-schedule", refs), {
    kind: "pending",
    label: "Calendario de retención",
  });
});

test("el código que no es un slug de concepto se queda como código", () => {
  assert.deepEqual(conceptInline("silver.pasajeros", refs), { kind: "code" });
  assert.deepEqual(conceptInline("read_csv", refs), { kind: "code" });
  assert.deepEqual(conceptInline("sin-titulo", refs), { kind: "code" });
  assert.deepEqual(conceptInline("pii-identification", undefined), { kind: "code" });
});

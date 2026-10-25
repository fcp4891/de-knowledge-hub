import assert from "node:assert/strict";
import { test } from "node:test";

import { partOfParent, routeChildren, withoutPartOf } from "../../frontend/lib/partOf.ts";

const child = (slug: string, title: string) => ({ slug, title, entity_type: "concept" });

test("las hijas siguen el orden de estudio de ley21719", () => {
  const groups = [
    {
      type: "PART_OF",
      direction: "incoming",
      items: [
        child("privacy-controls-as-code", "Controles como código"),
        child("pii-identification", "Identificación"),
        child("otra-ficha", "Fuera del pedido"),
        child("processing-activities-inventory", "Inventario"),
      ],
    },
    {
      type: "RELATED_TO",
      direction: "both",
      items: [child("data-classification", "Clasificación")],
    },
  ];
  assert.deepEqual(
    routeChildren(groups).map((item) => item.slug),
    ["pii-identification", "processing-activities-inventory", "privacy-controls-as-code", "otra-ficha"],
  );
  assert.equal(partOfParent(groups), null);
  assert.deepEqual(
    withoutPartOf(groups).map((group) => group.type),
    ["RELATED_TO"],
  );
});

test("la hija apunta a una sola padre", () => {
  const parent = partOfParent([
    {
      type: "PART_OF",
      direction: "outgoing",
      items: [child("chile-data-protection", "Ley 21.719 para ingenieros de datos")],
    },
  ]);
  assert.equal(parent?.slug, "chile-data-protection");
  assert.equal(parent?.title, "Ley 21.719 para ingenieros de datos");
  assert.deepEqual(routeChildren([]), []);
});

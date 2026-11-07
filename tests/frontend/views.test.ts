import assert from "node:assert/strict";
import { test } from "node:test";

import { CHILE_PRINCIPLES } from "../../frontend/lib/chileLegalCatalog.ts";
import { parseMarkdown } from "../../frontend/lib/markdown.ts";
import {
  centralIdeaProps,
  groupedSourceCount,
  severityCardsProps,
  sourcesGroupedProps,
  vigenciaTimelineProps,
} from "../../frontend/lib/views.ts";

test("la marca <!-- view: clave --> es un bloque de vista, no una nota pendiente (ADR-030)", () => {
  const blocks = parseMarkdown("Antes.\n\n<!-- view: central_idea -->\n\n<!-- VERIFY: revisar -->\n");
  assert.deepEqual(blocks[1], { type: "view", name: "central_idea" });
  assert.equal(blocks[2].type, "note");
});

test("las props salen del contrato con un renombre 1:1", () => {
  const idea = centralIdeaProps({
    checks_title: "El pipeline lo comprueba",
    checks: ["a"],
    status: "estado: exitoso",
    risks_title: "Y aun así puede",
    risks: [{ text: "r", tag: "Finalidad" }],
    closing: "c",
  });
  assert.deepEqual(Object.keys(idea), ["checksTitle", "checks", "status", "risksTitle", "risks", "closing"]);
  const timeline = vigenciaTimelineProps({ items: [{ date: "2026-12-01", title: "t", detail: "d", state: "current" }], as_of: "x" });
  assert.equal(timeline.asOf, "x");
  assert.equal(severityCardsProps({ levels: [{ name: "Leve", level: 1, amount: "5", examples: ["e"] }] }).levels[0].level, 1);
  const grouped = {
    groups: [
      { title: "A", sources: [{ title: "s", links: [{ href: "https://e.org" }], publisher: "p", level: "Nivel 1" }] },
      { title: "B", layout: "providers" as const, sources: [] },
    ],
  };
  assert.equal(sourcesGroupedProps(grouped).groups[1].layout, "providers");
  assert.equal(groupedSourceCount(grouped, 99), 1);
  assert.equal(groupedSourceCount(undefined, 13), 13);
});

test("los ocho principios se nombran sin letra", () => {
  assert.equal(CHILE_PRINCIPLES.length, 8);
  assert.deepEqual(
    CHILE_PRINCIPLES.filter((item) => /^[a-h]\)/.test(item.label)),
    [],
  );
  assert.equal(CHILE_PRINCIPLES[0].label, "Licitud y lealtad");
});

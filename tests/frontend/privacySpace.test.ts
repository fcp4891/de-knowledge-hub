import assert from "node:assert/strict";
import { test } from "node:test";

import { GOALS, LAYERS } from "../../frontend/lib/learning-paths.ts";
import { displayFactValue, goalPathIds, nextDistinctDomain, STUDY_PATH, verifiedCount, verifiedLegend } from "../../frontend/lib/privacySpace.ts";

test("una fecha ISO se muestra como DD-MM-AAAA y el resto del hecho no se reescribe", () => {
  assert.equal(displayFactValue("2026-12-01"), "01-12-2026");
  assert.equal(displayFactValue("En tramitación"), "En tramitación");
});

test("la leyenda usa la verificación más antigua", () => {
  assert.equal(verifiedLegend(["2026-10-28", "2026-10-28"]), "verificado el 28-10-2026");
  assert.equal(verifiedLegend(["2026-11-02", "2026-10-28"]), "verificado el 28-10-2026");
  assert.equal(verifiedLegend([]), null);
});

test("el objetivo ley21719 recorre los tramos de 24 y no apunta a 19", () => {
  const goal = GOALS.find((item) => item.key === "ley21719");
  assert.ok(goal);
  assert.deepEqual(
    goal.steps.map((step) => step.stage),
    ["fundamentos", "diseno-protegido", "derechos-ciclo-vida", "riesgo-terceros-incidentes", "evidencia-automatizacion"],
  );
  assert.deepEqual(goalPathIds(goal.steps), goal.steps.map((step) => step.stage));
  assert.ok(goal.steps.every((step) => step.domain === "24"));
  assert.equal(nextDistinctDomain(goal.steps, "24"), null);
  assert.equal(nextDistinctDomain([{ domain: "15" }, { domain: "19" }], "15"), "19");
  assert.deepEqual([...STUDY_PATH], ["Comprender", "Aplicar", "Demostrar", "Profundizar"]);
  assert.ok(LAYERS.every((layer) => !layer.domains.includes("24")));
  // ADR-027, Enmienda 1: 19 se integró al 24; «Marcos regulatorios comparados» es su tramo 6 y Transversal queda con 15–18.
  assert.ok(LAYERS.every((layer) => !layer.domains.includes("19")));
  assert.deepEqual(LAYERS.find((layer) => layer.key === "transversal")?.domains, ["15", "16", "17", "18"]);
  assert.ok(GOALS.some((item) => item.steps.some((step) => step.domain === "24" && step.stage === "regulatory-frameworks")));
  assert.equal(verifiedCount(["verified", "review_required", null]).verified, 1);
  assert.equal(verifiedCount(["verified", "review_required", null]).total, 3);
});

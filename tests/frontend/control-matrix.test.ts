import assert from "node:assert/strict";
import { test } from "node:test";

import { isControlMatrix, stepNumber } from "../../frontend/lib/controlMatrix.ts";

test("la matriz se reconoce solo con los cinco pasos en orden", () => {
  assert.equal(isControlMatrix(["Requisito", "Riesgo", "Control técnico", "Verificación", "Evidencia"]), true);
  assert.equal(isControlMatrix(["Requisito", "Control técnico", "Riesgo", "Verificación", "Evidencia"]), false);
  assert.equal(isControlMatrix(["Requisito o necesidad", "Decisión aprobada por", "Control técnico", "Evidencia verificable"]), false);
  assert.deepEqual([0, 4].map(stepNumber), ["01", "05"]);
});

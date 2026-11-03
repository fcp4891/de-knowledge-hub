import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ARCHITECTURE_GROUPS,
  architectureTitle,
  componentAnchor,
  isArchitectureView,
  sameComponent,
  splitCodeStatus,
} from "../../frontend/lib/architecture.ts";

test("el índice de arquitectura usa las secciones de arquitectura", () => {
  assert.equal(architectureTitle("scenario", "Escenario y requerimientos"), "Escenario");
  assert.equal(architectureTitle("operations", "Escalabilidad"), "Operación");
  assert.equal(architectureTitle("gcp", "GCP"), "GCP / AWS / Azure");
  assert.equal(isArchitectureView("context_view"), true);
  assert.equal(isArchitectureView("components"), false);
  const numbers = ARCHITECTURE_GROUPS.flatMap((group) => group.sections);
  assert.deepEqual(numbers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
  assert.equal(ARCHITECTURE_GROUPS.find((group) => group.group === "Vistas")?.sections.join(","), "3,4,5,6");
  assert.equal(ARCHITECTURE_GROUPS.find((group) => group.group === "Operación")?.sections.join(","), "7,8,9");
});

test("el estado del código sale como chip", () => {
  assert.deepEqual(splitCodeStatus("El script se ejecuta en la CI con la biblioteca estándar."), [
    { type: "text", value: "El script se " },
    { type: "status", label: "ejecutado en CI", tone: "ci" },
    { type: "text", value: " con la biblioteca estándar." },
  ]);
  assert.deepEqual(splitCodeStatus("Queda como configuración validada."), [
    { type: "text", value: "Queda como " },
    { type: "status", label: "configuración validada", tone: "config" },
    { type: "text", value: "." },
  ]);
  assert.deepEqual(splitCodeStatus("No ejecutado; el diseño es el mismo"), [
    { type: "status", label: "no ejecutado", tone: "skipped" },
    { type: "text", value: "; el diseño es el mismo" },
  ]);
  assert.deepEqual(splitCodeStatus("Sin estado."), [{ type: "text", value: "Sin estado." }]);
});

test("un componente iguala el nodo del diagrama o queda como ancla", () => {
  assert.equal(sameComponent("Zona de aterrizaje", "Zona de aterrizaje"), true);
  assert.equal(sameComponent("Orquestador", "Orquestador"), true);
  assert.equal(sameComponent("Staging", "Job de carga"), false);
  assert.equal(componentAnchor("Zona de aterrizaje"), "component-zona-de-aterrizaje");
  assert.equal(componentAnchor("Carga de partición"), "component-carga-de-particion");
});

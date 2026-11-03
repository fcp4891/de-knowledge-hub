import assert from "node:assert/strict";
import { test } from "node:test";

import { horizontalFlowchart } from "../../frontend/lib/diagramDirection.ts";

const chile = `flowchart TB
  L["Legal y negocio"] --> C["Catálogo"]
  C --> I["Ingesta"]`;

test("la arquitectura vertical se dibuja de izquierda a derecha", () => {
  assert.match(horizontalFlowchart(chile), /^flowchart LR/);
  assert.match(horizontalFlowchart("flowchart TD\n  A-->B"), /^flowchart LR/);
  assert.match(horizontalFlowchart("graph BT\n  A-->B"), /^graph LR/);
  assert.equal(horizontalFlowchart("flowchart LR\n  A-->B"), "flowchart LR\n  A-->B");
  assert.equal(horizontalFlowchart("sequenceDiagram\n  A->>B: hola"), "sequenceDiagram\n  A->>B: hola");
  const withInit = "%%{init: {'theme':'base'}}%%\nflowchart TB\n  A-->B";
  assert.match(horizontalFlowchart(withInit), /flowchart LR/);
  assert.match(horizontalFlowchart(withInit), /init/);
});

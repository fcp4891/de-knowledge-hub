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

test("las cadenas largas también giran: en §9 se dibuja siempre en LR (decisión de Felipe, 2026-11-03)", () => {
  const six = `flowchart TB
  A["Uno"] --> B["Dos"]
  B --> C{"¿Tres?"}
  C -- "sí" --> D["Cuatro"]
  D -.-> E["Cinco"]
  E ==> F["Seis"]`;
  assert.match(horizontalFlowchart(six), /^flowchart LR/);
  const eight = "flowchart TB\n  A --> B --> C --> D --> E --> F --> G --> H";
  assert.equal(horizontalFlowchart(eight), eight.replace("flowchart TB", "flowchart LR"));
  const subgraphs = `flowchart TD
  subgraph S["Origen"]
    A["Uno"]
  end
  A --> B --> C --> D --> E --> F`;
  assert.match(horizontalFlowchart(subgraphs), /^flowchart LR/);
});

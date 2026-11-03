import assert from "node:assert/strict";
import { test } from "node:test";

import { horizontalFlowchart, longestChain } from "../../frontend/lib/diagramDirection.ts";

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

test("una cadena de más de 5 nodos se mantiene vertical (estándar de diagramas)", () => {
  const six = `flowchart TB
  A["Uno"] --> B["Dos"]
  B --> C{"¿Tres?"}
  C -- "sí" --> D["Cuatro"]
  D -.-> E["Cinco"]
  E ==> F["Seis"]`;
  assert.equal(longestChain(six), 6);
  assert.equal(horizontalFlowchart(six), six);
  const five = "flowchart TB\n  A --> B --> C\n  C --> D & E\n  D --> F";
  assert.equal(longestChain(five), 5);
  assert.match(horizontalFlowchart(five), /^flowchart LR/);
  const subgraphs = `flowchart TB
  subgraph S["Origen"]
    A["Uno"]
  end
  A --> B --> C --> D --> E --> F`;
  assert.equal(horizontalFlowchart(subgraphs), subgraphs);
});

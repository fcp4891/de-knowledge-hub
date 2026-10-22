import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";

const require = createRequire(new URL("../../frontend/package.json", import.meta.url));

test("un bloque mermaid se convierte en SVG", async () => {
  const { Window } = await import(pathToFileURL(require.resolve("happy-dom")).href);
  const window = new Window();
  const defined = new Set(Object.getOwnPropertyNames(globalThis));
  let prototype: object | null = window;
  while (prototype && prototype !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (defined.has(key) || key === "navigator") {
        continue;
      }
      defined.add(key);
      try {
        const value = window[key as keyof Window];
        Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
      } catch {
        // Algunos globales de Node no se pueden reemplazar.
      }
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  Object.defineProperty(globalThis, "window", { value: window, configurable: true, writable: true });
  Object.defineProperty(globalThis, "document", { value: window.document, configurable: true, writable: true });
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: window.getComputedStyle.bind(window),
    configurable: true,
    writable: true,
  });

  const { renderMermaid } = await import("../../frontend/lib/renderMermaid.ts");
  const svg = await renderMermaid("flowchart LR\n  A-->B", "diagramTest");
  assert.match(svg, /<svg[\s>]/);
  assert.equal(/jsdelivr|unpkg|cdn\./i.test(svg), false);

  const labeled = await renderMermaid(
    'flowchart LR\n  L["Área legal:<br/>finalidad"] --> C["Catálogo"]',
    "diagramLabels",
  );
  assert.match(labeled, /<svg[\s>]/);
  await window.happyDOM.abort();
});

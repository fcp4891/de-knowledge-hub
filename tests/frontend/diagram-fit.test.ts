import assert from "node:assert/strict";
import test from "node:test";

import { splitViewsFit, svgIntrinsicWidth } from "../../frontend/lib/diagramFit.ts";

test("lado a lado solo si la letra queda legible en la columna", () => {
  assert.equal(splitViewsFit([400, 420, 380], 320), true);
  assert.equal(splitViewsFit([800, 420, 380], 320), false);
  assert.equal(splitViewsFit([], 320), false);
  assert.equal(splitViewsFit([400], 0), false);
});

test("el ancho intrínseco sale del viewBox", () => {
  const svg = {
    getAttribute(name: string) {
      if (name === "viewBox") return "0 0 640 240";
      if (name === "width") return "100";
      return null;
    },
  };
  assert.equal(svgIntrinsicWidth(svg as unknown as Element), 640);
});

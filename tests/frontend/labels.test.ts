import assert from "node:assert/strict";
import { test } from "node:test";

import { alsoKnownLabel } from "../../frontend/lib/labels.ts";

test("también conocido como omite slugs y se oculta si no queda ninguno", () => {
  assert.equal(alsoKnownLabel([]), null);
  assert.equal(alsoKnownLabel(["compliance-scope-for-data-engineers"]), null);
  assert.equal(
    alsoKnownLabel(["privacy-by-design-checklist", "Privacidad desde el diseño en cada pipeline"]),
    "También conocido como: Privacidad desde el diseño en cada pipeline",
  );
  assert.equal(
    alsoKnownLabel(["Vertex AI para Data Engineers", "Vertex AI"]),
    "También conocido como: Vertex AI para Data Engineers, Vertex AI",
  );
});

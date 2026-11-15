// Enlaces internos con el basePath del export estático (un <a> crudo no lo recibe de Next).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { loadTsx } from "./load-tsx.ts";

const FRONTEND = join(import.meta.dirname, "../../frontend");

test("withBasePath antepone el basePath solo a rutas internas", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "/aprendizaje-continuo";
  try {
    const { withBasePath } = loadTsx(join(FRONTEND, "lib/basePath.ts"));
    assert.equal(withBasePath("/concepts/chile-data-protection/#matriz-minimizacion"), "/aprendizaje-continuo/concepts/chile-data-protection/#matriz-minimizacion");
    assert.equal(withBasePath("#s10"), "#s10");
    assert.equal(withBasePath("https://www.bcn.cl/leychile"), "https://www.bcn.cl/leychile");
    assert.equal(withBasePath("//cdn.example.org/x"), "//cdn.example.org/x");
    assert.equal(withBasePath("/aprendizaje-continuo/concepts/x/"), "/aprendizaje-continuo/concepts/x/");
    process.env.NEXT_PUBLIC_BASE_PATH = "";
    assert.equal(withBasePath("/concepts/x/"), "/concepts/x/");
  } finally {
    process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("los componentes que pintan un <a> con href dinámico pasan por withBasePath", () => {
  for (const file of ["components/availability/FichaLink.tsx", "components/card/LegalFoundations.tsx", "components/ficha/Pills.tsx",
    "components/ficha/RichText.tsx", "components/ficha/SourcesGrouped.tsx", "components/ficha/VigenciaTimeline.tsx",
    "components/ficha/WhenToUse.tsx", "components/ficha/ControlEvidence.tsx", "components/markdown/InlineText.tsx"]) {
    const source = readFileSync(join(FRONTEND, file), "utf8");
    const raw = [...source.matchAll(/<a\b[^>]*\bhref=\{(?!withBasePath\()(?!`#)([^}]+)\}/g)].map((m) => m[1]).filter((h) => !/url|source\./.test(h));
    assert.deepEqual(raw, [], file);
  }
});

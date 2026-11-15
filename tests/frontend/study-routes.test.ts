// Rutas de estudio ocultas con una sola bandera (lib/siteConfig.ts): enlaces fuera, páginas vivas.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { loadTsx } from "./load-tsx.ts";

const FRONTEND = join(import.meta.dirname, "../../frontend");
const read = (path: string) => readFileSync(join(FRONTEND, path), "utf8");

test("una sola bandera decide qué enlaces de estudio se ocultan", () => {
  const config = loadTsx(join(FRONTEND, "lib/siteConfig.ts"));
  assert.equal(config.SHOW_STUDY_ROUTES, false);
  for (const href of ["/explorer", "/explorer/privacy-engineering", "/explorer/x#tramo", "/repaso", "/snippets", "/snippets/abc", "/snippets?lang=py"]) {
    assert.equal(config.isHiddenStudyRoute(href), true, href);
    assert.equal(config.studyHref(href), null, href);
  }
  for (const href of ["/concepts/pii-identification/", "/privacidad#fundamentos", "/explorers", "/", null]) {
    assert.equal(config.isHiddenStudyRoute(href), false, String(href));
  }
});

test("cada enlace hacia /explorer, /repaso o /snippets pregunta a la bandera", () => {
  assert.match(read("app/concepts/[slug]/page.tsx"), /domainHref: domainOpen \? studyHref\(`\/explorer\//);
  assert.match(read("app/concepts/[slug]/page.tsx"), /next = SHOW_STUDY_ROUTES && found/);
  assert.match(read("app/concepts/[slug]/page.tsx"), /href=\{studyHref\(itineraryHref\(/);
  assert.match(read("components/card/ConceptReading.tsx"), /\{SHOW_STUDY_ROUTES \? \(\n\s+<button[\s\S]*?Necesita repaso/);
  assert.match(read("components/home/HomeScreen.tsx"), /studyHref\(stepHref\(step/);
  assert.match(read("components/card/ConceptReading.tsx"), /\(state\) => SHOW_STUDY_ROUTES \|\| state !== "needs_review"/);
  assert.match(read("components/explorer/DomainRoute.tsx"), /isHiddenStudyRoute\("\/explorer"\) \? null/);
  assert.match(read("components/explorer/DomainRoute.tsx"), /nextDomain && !isHiddenStudyRoute/);
  assert.match(read("components/card/ImplementedSnippets.tsx"), /if \(isHiddenStudyRoute\("\/snippets"\)\) \{\n\s+return null;/);
  assert.match(read("components/card/RelationPanel.tsx"), /isHiddenStudyRoute\(entityHref\(item\.entity_type, item\.slug\)\)/);
  assert.match(read("components/card/NeighborhoodGraph.tsx"), /if \(isHiddenStudyRoute\(href\)\) \{\n\s+return;/);
  assert.match(read("app/snippets/[slug]/page.tsx"), /backHref=\{studyHref\("\/snippets"\) \?\? undefined\}/);
  assert.match(read("components/SearchDialog.tsx"), /if \(isHiddenStudyRoute\(resultHref\(item\.type, item\.slug\)\)\) \{\n\s+return null;/);
  // Las páginas no se borran.
  for (const page of ["app/explorer/page.tsx", "app/explorer/[slug]/page.tsx", "app/repaso/page.tsx", "app/snippets/page.tsx", "app/snippets/[slug]/page.tsx"]) {
    assert.ok(read(page).length > 0, page);
  }
});

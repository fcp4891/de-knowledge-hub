import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { loadTsx } from "./load-tsx.ts";
import { disabledStatus, fillCount, routeTotals, stageAvailability, stageDisabled } from "../../frontend/lib/routeAvailability.ts";

const requireFromFrontend = createRequire(pathToFileURL(join(import.meta.dirname, "../../frontend/package.json")).href);
const React = requireFromFrontend("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server") as typeof import("react-dom/server");

const TEXTS = {
  in_review: { label: "En revisión", help: "Contenido listo.", count: "{n} en revisión" },
  in_development: { label: "En desarrollo", help: "En preparación.", count: "{n} en desarrollo" },
  available: { count: "{n} disponibles" },
  route_count: "{n} de {total} fichas disponibles",
  back_label: "Volver al itinerario",
};

const fundamentos = stageAvailability([{ availability: "available" }, { availability: null }, { availability: "in_review" }]);
const dev = (n: number) => stageAvailability(Array.from({ length: n }, () => ({ availability: "in_development" })));

test("un tramo está deshabilitado si ninguna ficha está disponible (por datos, no por slug)", () => {
  assert.deepEqual(fundamentos, { available: 2, inReview: 1, inDevelopment: 0, total: 3 });
  assert.equal(stageDisabled(fundamentos), false);
  assert.equal(stageDisabled(dev(3)), true);
  assert.equal(disabledStatus(dev(3)), "in_development");
  assert.equal(disabledStatus(stageAvailability([{ availability: "in_review" }])), "in_review");
  const totals = routeTotals([fundamentos, dev(3), dev(4), dev(3), dev(2)]);
  assert.deepEqual(totals, { available: 2, total: 15 });
  assert.equal(fillCount(TEXTS.route_count, { n: totals.available, total: totals.total }), "2 de 15 fichas disponibles");
});

const stages = [
  { slug: "fundamentos", title: "Fundamentos", verified: 0, total: 2, withPage: 2, availability: fundamentos },
  { slug: "diseno-protegido", title: "Diseño protegido", verified: 0, total: 0, withPage: 0, availability: dev(3) },
  { slug: "derechos-ciclo-vida", title: "Derechos y ciclo de vida", verified: 0, total: 0, withPage: 0, availability: dev(4) },
  { slug: "riesgo-terceros-incidentes", title: "Riesgo, terceros e incidentes", verified: 0, total: 0, withPage: 0, availability: dev(3) },
  { slug: "evidencia-automatizacion", title: "Evidencia y automatización", verified: 0, total: 0, withPage: 0, availability: dev(2) },
];
const domain = {
  id: "24", slug: "privacy-engineering", title: "Ingeniería de privacidad", band: "especializacion" as const,
  conceptCount: 2, withPage: 2, stages, availabilityTexts: TEXTS,
};

test("cabecera: contador «N de M fichas disponibles» y tramos deshabilitados sin enlace", () => {
  const home = loadTsx(join(import.meta.dirname, "../../frontend/components/home/HomeScreen.tsx"));
  const markup = renderToStaticMarkup(React.createElement(home.SpecializationBand, { domain, path: null }));
  assert.match(markup, /2 de 15 fichas disponibles/);
  assert.equal((markup.match(/data-disabled="true" aria-disabled="true"/g) ?? []).length, 4);
  assert.equal((markup.match(/En desarrollo/g) ?? []).length, 4);
  assert.equal((markup.match(/href="[^"]*privacidad#/g) ?? []).length, 1);   // solo Fundamentos navega
  assert.equal((markup.match(/data-fill="disabled"/g) ?? []).length, 4);
  assert.match(markup, /data-tone="disabled"/);
});

test("panel: Fundamentos con «2 disponibles» y «1 en revisión»; los demás deshabilitados", () => {
  const home = loadTsx(join(import.meta.dirname, "../../frontend/components/home/HomeScreen.tsx"));
  const paths = loadTsx(join(import.meta.dirname, "../../frontend/lib/learning-paths.ts"));
  const goal = paths.GOALS.find((item: { key: string }) => item.key === "ley21719");
  const markup = renderToStaticMarkup(
    React.createElement(home.Itinerary, { goal, domainsById: new Map([["24", domain]]) }),
  );
  assert.match(markup, /2 disponibles/);
  assert.match(markup, /availability-tag is-in_review[^>]*>.*?1 en revisión/);
  assert.equal((markup.match(/<li class="home-step" data-disabled="true">/g) ?? []).length, 4);
  assert.equal((markup.match(/aria-disabled="true"/g) ?? []).length, 4);
  assert.equal((markup.match(/En desarrollo/g) ?? []).length, 4);
  const source = readFileSync(join(import.meta.dirname, "../../frontend/components/home/HomeScreen.tsx"), "utf8");
  for (const fixed of ["disponibles", "En desarrollo", "En revisión", "en revisión"]) {
    assert.equal(source.includes(fixed), false, fixed);   // los textos vienen de content/ui/availability.yaml
  }
});

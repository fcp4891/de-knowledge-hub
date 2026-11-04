import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { conceptInline, conceptRefs } from "../../frontend/lib/conceptNames.ts";
import { GOALS, LAYERS } from "../../frontend/lib/learning-paths.ts";
import {
  BAND_LABEL,
  CONSTRUCTION_LAYER,
  CONSTRUCTION_MARK,
  MORE_ROUTES,
  SHOW_UNPUBLISHED,
  PUBLISHED_DOMAINS,
  PUBLISHED_GOALS,
  explorerHref,
  inPublishedSearch,
  isDomainPublished,
  isGoalPublished,
  isStagePublished,
  layerIsClosed,
  relationVisible,
  requirementPlainText,
  scopeFromConcepts,
  snippetListed,
  PUBLISHED_STAGES,
  stepHref,
  visibleGoals,
  visibleLayers,
  visibleStages,
} from "../../frontend/lib/publishedScope.ts";

const HOME = readFileSync(new URL("../../frontend/components/home/HomeScreen.tsx", import.meta.url), "utf8");

test("el interruptor publica un solo dominio y un solo objetivo", () => {
  assert.deepEqual(
    PUBLISHED_DOMAINS.map((domain) => domain.slug),
    ["privacy-engineering"],
  );
  assert.equal(PUBLISHED_DOMAINS[0]?.id, "24");
  assert.deepEqual([...PUBLISHED_GOALS], ["ley21719"]);
  assert.equal(isDomainPublished({ id: "24", slug: "privacy-engineering" }), true);
  assert.equal(isDomainPublished({ slug: "sql" }), false);
  assert.ok(LAYERS.every((layer) => layerIsClosed(layer.domains)));
  assert.equal(isGoalPublished("ley21719"), true);
  assert.equal(isGoalPublished("cero"), false);
});

test("una capa apagada no tiene enlace", () => {
  assert.equal(explorerHref({ id: "02", slug: "sql" }), null);
  assert.equal(explorerHref({ id: "24", slug: "privacy-engineering" }), "/explorer/privacy-engineering");
  assert.equal(CONSTRUCTION_LAYER, "En construcción · la estamos escribiendo ficha a ficha");
  assert.match(HOME, /\{CONSTRUCTION_LAYER\}/);
  assert.match(HOME, /layerIsClosed\(layer\.domains\)/);
  assert.match(HOME, /open && domain \?/);
});

test("un objetivo fuera de la lista queda deshabilitado y el requisito no enlaza", () => {
  const active = GOALS.find((goal) => goal.key === "ley21719");
  assert.ok(active);
  assert.equal(isGoalPublished(active.key), true);
  assert.equal(requirementPlainText(active.requires), active.requires);
  assert.equal(requirementPlainText(active.requires).includes("href"), false);
  assert.match(active.requires, /Modelado/);
  assert.equal(GOALS.filter((goal) => !isGoalPublished(goal.key)).length, 6);
  assert.match(HOME, /aria-disabled="true"/);
});

test("los números del itinerario usan el mismo enlace que el título", () => {
  const goal = GOALS.find((item) => item.key === "ley21719");
  assert.ok(goal);
  assert.deepEqual(
    goal.steps.map((step) => stepHref(step, "privacy-engineering")),
    [
      "/privacidad#fundamentos",
      "/privacidad#diseno-protegido",
      "/privacidad#derechos-ciclo-vida",
      "/privacidad#riesgo-terceros-incidentes",
      "/privacidad#evidencia-automatizacion",
    ],
  );
  assert.match(HOME, /<Link[^>]*className="home-step-num"/);
  assert.equal(BAND_LABEL, "Protección de datos personales");
  assert.equal(HOME.includes("Especialización"), false);
});

test("la búsqueda y los relacionados solo dejan fichas del alcance", () => {
  assert.equal(inPublishedSearch("privacy-engineering"), true);
  assert.equal(inPublishedSearch("sql"), false);
  assert.equal(inPublishedSearch(null), false);
  const scope = scopeFromConcepts([
    { slug: "pii-identification", domain: "privacy-engineering" },
    { slug: "spark", domain: "streaming" },
  ]);
  assert.equal(relationVisible({ slug: "pii-identification", entity_type: "concept" }, scope), true);
  assert.equal(relationVisible({ slug: "spark", entity_type: "concept" }, scope), false);
  assert.equal(snippetListed(["spark"], scope), false);
  assert.equal(snippetListed(["pii-identification"], scope), true);
});

test("un enlace del §17 a una ficha fuera de alcance no lleva href", () => {
  const refs = conceptRefs([
    { slug: "spark", title: "Spark", has_page: true, domain: "streaming" },
    { slug: "pii-identification", title: "Identificación", has_page: true, domain: "privacy-engineering" },
  ]);
  const outside = conceptInline("spark", refs);
  assert.equal(outside.kind, "construction");
  assert.equal("href" in outside, false);
  assert.equal(CONSTRUCTION_MARK, "en construcción");
  assert.equal(conceptInline("pii-identification", refs).kind, "link");
});

test("los tramos publicados ocultan marcos regulatorios y el laboratorio", () => {
  assert.deepEqual(
    [...PUBLISHED_STAGES],
    [
      "fundamentos",
      "diseno-protegido",
      "derechos-ciclo-vida",
      "riesgo-terceros-incidentes",
      "evidencia-automatizacion",
    ],
  );
  assert.equal(isStagePublished("regulatory-frameworks"), false);
  assert.equal(isStagePublished("laboratorio"), false);
  const stages = [
    { slug: "fundamentos" },
    { slug: "regulatory-frameworks" },
    { slug: "laboratorio" },
  ];
  assert.deepEqual(visibleStages(stages).map((stage) => stage.slug), ["fundamentos"]);
  const withFrameworks = [...PUBLISHED_STAGES, "regulatory-frameworks", "laboratorio"];
  assert.equal(isStagePublished("regulatory-frameworks", withFrameworks), true);
  assert.equal(visibleStages(stages, withFrameworks).length, 3);
  assert.match(HOME, /visibleStages\(domain\.stages\)/);
  assert.match(HOME, /isStagePublished\(step\.stage\)/);
});

test("con SHOW_UNPUBLISHED en false, Inicio y el mapa ocultan lo no publicado", () => {
  assert.equal(SHOW_UNPUBLISHED, false);
  assert.equal(MORE_ROUTES, "Más rutas en construcción");
  assert.deepEqual(
    visibleGoals(GOALS).map((goal) => goal.key),
    ["ley21719"],
  );
  assert.equal(visibleLayers(LAYERS).length, 0);
  assert.equal(visibleGoals(GOALS, true).length, GOALS.length);
  assert.equal(visibleLayers(LAYERS, true).length, LAYERS.length);
  assert.match(HOME, /visibleGoals\(GOALS\)/);
  assert.match(HOME, /\{MORE_ROUTES\}/);
});

test("agregar un dominio a la lista reactiva su estación y sus fichas", () => {
  const wider = [...PUBLISHED_DOMAINS, { id: "02", slug: "sql" }];
  assert.equal(layerIsClosed(["01", "02", "03", "04"], wider), false);
  assert.equal(explorerHref({ id: "02", slug: "sql" }, wider), "/explorer/sql");
  assert.equal(explorerHref({ id: "01", slug: "fundamentals" }, wider), null);
  const refs = conceptRefs([{ slug: "joins", title: "Joins", has_page: true, domain: "sql" }]);
  assert.equal(conceptInline("joins", refs).kind, "construction");
  assert.equal(conceptInline("joins", refs, wider).kind, "link");
  assert.equal(isGoalPublished("cero", ["ley21719", "cero"]), true);
});

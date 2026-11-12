import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import { loadTsx } from "./load-tsx.ts";

const requireFromFrontend = createRequire(pathToFileURL(join(import.meta.dirname, "../../frontend/package.json")).href);
const React = requireFromFrontend("react") as typeof import("react");
const { renderToStaticMarkup } = requireFromFrontend("react-dom/server") as typeof import("react-dom/server");

const ficha = join(import.meta.dirname, "../../frontend/components/ficha");

function html(component: unknown, props: object): string {
  return renderToStaticMarkup(React.createElement(component as React.ComponentType<object>, props));
}

const catalog = {
  title: "Catálogo",
  headers: ["Campo", "Para qué"],
  rows: [
    {
      field: "categoria",
      text: "Qué es",
      categories: [
        { label: "personal", tone: "personal" as const },
        { label: "sensible", tone: "sensitive" as const },
        { label: "revisión", tone: "review" as const },
      ],
      note: "nota",
    },
  ],
};

test("catalog_fields pinta tonos y la nota bajo la fila", () => {
  const view = loadTsx(join(ficha, "CatalogFields.tsx"));
  const markup = html(view.CatalogFields, { view: catalog });
  assert.match(markup, /pii-tone is-personal/);
  assert.match(markup, /pii-tone is-sensitive/);
  assert.match(markup, /pii-tone is-review/);
  assert.match(markup, /pii-row-note/);
  assert.match(markup, /categoria/);
});

test("el árbol muestra la columna elegida, solo su recorrido y la ley si el ejemplo la trae", () => {
  const view = loadTsx(join(ficha, "DecisionTree.tsx"));
  const tree = {
    intro: { title: "Mapa", text: "Cuatro preguntas." },
    examples_title: "Ejemplos",
    path_label: "Recorrido",
    result_label: "Resultado",
    catalog_label: "Catálogo",
    answer_labels: { yes: "Sí", no: "No" },
    step_labels: { question: "Pregunta", next: "siguiente", end: "termina" },
    questions: [
      { number: 1, question: "¿Uno?", help: "h", gloss: { yes: "sí uno", no: "no uno" }, exits: [] },
      { number: 2, question: "¿Dos?", help: "h", gloss: { yes: "sí dos", no: "no dos" }, exits: [] },
    ],
    fallback: { label: "fin", outcome: "personal" as const, title: "Dato personal", text: "t" },
    catalog_fields: { category: "Categoría", basis: "Fundamento", risk: "Riesgo", method: "Método", review: "Revisión" },
    review: "privacidad",
    default: "por defecto",
    examples: [
      {
        column: "rut_hash",
        description: "Un hash",
        answers: ["no" as const],
        outcome: "personal" as const,
        title: "Dato personal",
        explanation: "Sigue siendo personal.",
        catalog: { category: "personal", basis: "art. 2", risk: "media", method: "nombre" },
        law: true,
      },
      {
        column: "precio",
        description: "Lista",
        answers: ["no" as const, "no" as const],
        outcome: "unlinked" as const,
        title: "Sin vínculo",
        explanation: "No refiere a una persona.",
        catalog: { category: "ninguna", basis: "esquema", risk: "baja", method: "revisión" },
      },
    ],
    law: { summary: "Artículos", items: ["letra f"], link: { label: "Ley", href: "/concepts/chile-data-protection/" } },
  };
  const markup = html(view.DecisionTree, { view: tree });
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /rut_hash/);
  assert.match(markup, /Pregunta 1 · No, no uno/);
  assert.match(markup, /data-outcome="personal"/);
  assert.match(markup, /pii-law/);
  assert.equal(markup.includes("¿Dos?"), false);
});

test("el siguiente recomendado salta una ficha no disponible", () => {
  const route = loadTsx(join(import.meta.dirname, "../../frontend/lib/domainRoute.ts"));
  const nextRecommended = route.nextRecommended as (
    stages: { concepts: { slug: string; hasPage: boolean; available: boolean; level: "basic"; blueprintIndex: number }[] }[],
    study: (slug: string) => string,
  ) => { slug: string } | null;
  const stages = [
    {
      concepts: [
        { slug: "a", hasPage: true, available: false, level: "basic" as const, blueprintIndex: 0 },
        { slug: "b", hasPage: true, available: true, level: "basic" as const, blueprintIndex: 1 },
      ],
    },
  ];
  assert.equal(nextRecommended(stages, () => "not_reviewed")?.slug, "b");
});

test("trade-offs usa a_text y b_text sin partir la frase", () => {
  const view = loadTsx(join(ficha, "TradeOffs.tsx"));
  const markup = html(view.TradeOffs, {
    resolutionLabel: "Se resuelve con",
    items: [{ a: "Costo", b: "Detalle", text: "Una sola frase y no se parte.", aText: "lado costo", bText: "lado detalle", resolution: "r" }],
  });
  assert.match(markup, /lado costo/);
  assert.match(markup, /lado detalle/);
  assert.equal(markup.includes("Una sola frase"), false);
});

test("la búsqueda no abre una ficha no disponible y muestra su etiqueta", () => {
  const availability = loadTsx(join(import.meta.dirname, "../../frontend/lib/searchAvailability.ts"));
  const marks = (
    availability.unavailableSearchMarks as (
      concepts: { slug: string; availability: string }[],
      copy: { in_review?: { label: string; help: string } },
    ) => Map<string, { status: string; label: string; help: string }>
  )(
    [
      { slug: "processing-activities-inventory", availability: "in_review" },
      { slug: "pii-identification", availability: "available" },
    ],
    { in_review: { label: "Etiqueta de revisión", help: "Ayuda de revisión" } },
  );
  assert.equal(marks.has("pii-identification"), false);
  assert.equal(marks.get("processing-activities-inventory")?.label, "Etiqueta de revisión");

  const row = loadTsx(join(import.meta.dirname, "../../frontend/components/availability/SearchUnavailable.tsx"));
  const markup = html(row.SearchUnavailable, {
    title: "Inventario de actividades de tratamiento",
    status: "in_review",
    label: "Etiqueta de revisión",
    help: "Ayuda de revisión",
  });
  assert.match(markup, /search-unavailable/);
  assert.match(markup, /Inventario de actividades de tratamiento/);
  assert.match(markup, /Etiqueta de revisión/);
  assert.match(markup, /Ayuda de revisión/);
  assert.equal(markup.includes("href"), false);

  const dialog = readFileSync(join(import.meta.dirname, "../../frontend/components/SearchDialog.tsx"), "utf8");
  assert.equal(dialog.includes("En revisión"), false);
  assert.equal(dialog.includes("En desarrollo"), false);
  assert.match(dialog, /SearchUnavailable/);
});

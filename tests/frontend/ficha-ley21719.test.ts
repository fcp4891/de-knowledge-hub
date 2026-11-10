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
const fixtures = loadTsx(join(ficha, "fixtures.ts"));
const central = loadTsx(join(ficha, "CentralIdea.tsx"));
const vigencia = loadTsx(join(ficha, "VigenciaTimeline.tsx"));
const lanes = loadTsx(join(ficha, "PracticeLanes.tsx"));
const severity = loadTsx(join(ficha, "SeverityCards.tsx"));
const sources = loadTsx(join(ficha, "SourcesGrouped.tsx"));
const steps = loadTsx(join(import.meta.dirname, "../../frontend/components/markdown/PipelineSteps.tsx"));

function html(component: unknown, props: object): string {
  return renderToStaticMarkup(React.createElement(component as React.ComponentType<object>, props));
}

test("la idea central muestra checks, estado, etiquetas y cierre", () => {
  const props = fixtures.centralIdeaFixture as { checks: string[]; risks: { tag: string }[]; status: string; closing: string };
  const markup = html(central.CentralIdea, props);
  assert.match(markup, /central-idea-checks/);
  assert.match(markup, /✓/);
  assert.match(markup, new RegExp(props.status));
  assert.match(markup, /ficha-tag">Finalidad/);
  assert.match(markup, /central-idea-closing/);
  assert.match(markup, new RegExp(props.closing.slice(0, 24)));
});

test("la vigencia distingue pasado, actual y propuesto", () => {
  const markup = html(vigencia.VigenciaTimeline, fixtures.vigenciaFixture as object);
  assert.match(markup, /data-state="past"/);
  assert.match(markup, /data-state="current"/);
  assert.match(markup, /data-state="proposed"/);
  assert.match(markup, /2026-12-01/);
  assert.match(markup, /Estado al 2026-10-28/);
  assert.match(markup, /Boletín 18\.623-07/);
});

test("las etapas numeran cinco carriles y marcan arquitectura", () => {
  const markup = html(lanes.PracticeLanes, fixtures.practiceLanesFixture as object);
  assert.match(markup, /practice-lanes/);
  assert.equal(markup.match(/practice-lane"/g)?.length, 5);
  assert.match(markup, /claim-arq/);
  assert.match(markup, /Control técnico/);
  const css = readFileSync(join(ficha, "ficha-blocks.css"), "utf8");
  assert.match(css, /\.practice-lanes\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width:\s*620px\)[\s\S]*\.practice-lanes,\s*[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("las tarjetas de gravedad pintan tantas barras como el nivel", () => {
  const markup = html(severity.SeverityCards, fixtures.severityFixture as object);
  assert.match(markup, /data-level="1"/);
  assert.match(markup, /data-level="3"/);
  assert.match(markup, /5\.000 UTM/);
  assert.match(markup, /20\.000 UTM/);
  const grave = markup.slice(markup.indexOf('data-level="2"'), markup.indexOf('data-level="3"'));
  assert.equal(grave.match(/data-on="true"/g)?.length, 2);
  const css = readFileSync(join(import.meta.dirname, "../../frontend/styles/tokens.css"), "utf8");
  assert.match(css, /--severity-1-bg/);
  assert.match(css, /--severity-3-bar/);
  assert.match(css, /prefers-color-scheme:\s*dark[\s\S]*--severity-3-ink/);
});

test("las fuentes separan lista y columnas por proveedor", () => {
  const markup = html(sources.SourcesGrouped, fixtures.sourcesFixture as object);
  assert.match(markup, /BCN · Nivel 1/);
  assert.match(markup, /sources-why/);
  assert.match(markup, /sources-providers/);
  assert.match(markup, />GCP</);
  assert.match(markup, />AWS</);
  assert.match(markup, />Azure</);
});

test("los pasos sin la variante grande no cambian", () => {
  const chain = fixtures.stepsChain;
  const descriptions = fixtures.stepDescriptions as string[];
  const plain = html(steps.PipelineSteps, { chain });
  const ignored = html(steps.PipelineSteps, { chain, descriptions });
  assert.equal(plain, ignored);
  assert.equal(plain.includes("step-desc"), false);
  assert.equal(plain.includes("data-size"), false);
  assert.match(plain, /step-number/);
  assert.match(plain, /Requisito normativo/);
  const large = html(steps.PipelineSteps, { chain, size: "lg", descriptions });
  assert.match(large, /data-size="lg"/);
  assert.match(large, /step-desc/);
  assert.match(large, /Lo que la norma exige/);
  const css = readFileSync(join(import.meta.dirname, "../../frontend/components/markdown/pipeline.css"), "utf8");
  assert.match(css, /\.step-number\s*\{[^}]*font-size:\s*10px/);
  assert.match(css, /\.step-name\s*\{[^}]*font-size:\s*12px/);
  assert.match(css, /\.pipeline\[data-size="lg"\] \.step-number\s*\{[^}]*font-size:\s*13px/);
  assert.match(css, /\.pipeline\[data-size="lg"\] \.step-name\s*\{[^}]*font-size:\s*15\.5px/);
});

test("las píldoras con ancla son enlaces y el ejemplo enlaza al código (ADR-030, enmienda 2)", () => {
  const board = loadTsx(join(ficha, "DesignBoard.tsx"));
  const markup = html(board.DesignBoard, {
    intro: "x",
    groups: [{ title: "Conocer", items: [{ number: "02", question: "¿Para qué?", text: "t", tags: [{ kind: "Matriz", label: "Finalidad", href: "#matriz-finalidad" }, { label: "sin ancla" }] }] }],
  });
  assert.match(markup, /¿Para qué?/);
  assert.equal(markup.includes("#matriz-finalidad"), false);
  assert.equal(markup.includes("sin ancla"), false);
  const evidence = loadTsx(join(ficha, "ControlEvidence.tsx"));
  const example = html(evidence.ControlEvidence, {
    title: "Control y evidencia",
    lead: "l",
    steps: [],
    decide: { number: "4", title: "d", outcomes: [] },
    note: "n",
    example: { summary: "Ver ejemplo", steps: [], note: "e", codeLink: { label: "Ver código ↓", href: "#s10" } },
  });
  assert.match(example, /<a href="#s10">Ver código ↓<\/a>/);
});

test("trade-offs como tarjetas, preguntas con píldoras y modificadores de la multa", () => {
  const trade = loadTsx(join(ficha, "TradeOffs.tsx"));
  const balance = html(trade.TradeOffs, {
    arq: true,
    resolutionLabel: "Se resuelve con",
    items: [{ a: "Seudonimización", b: "Anonimización", text: "t", resolution: "r." }],
    note: "nota",
  });
  assert.match(balance, /<h3>Seudonimización<\/h3>/);
  assert.match(balance, /<h3>Anonimización<\/h3>/);
  assert.match(balance, /trade-resolution"><strong>Se resuelve con<\/strong> r\./);
  assert.match(balance, /claim-arq/);
  assert.match(balance, /nota/);
  const questions = loadTsx(join(ficha, "OpenQuestions.tsx"));
  const cards = html(questions.OpenQuestions, {
    intro: "i",
    checkLabel: "Sé responderla",
    counter: "{n} de {total} que sabes responder",
    items: [
      { question: "¿Uno?", tags: [{ kind: "Código", label: "purpose_check", href: "#codigo-purpose-check" }] },
      { question: "¿Dos?", tags: [] },
    ],
  });
  assert.match(cards, /open-questions-lead">i/);
  assert.equal(cards.includes("Sé responderla"), false);
  assert.equal(cards.includes("que sabes responder"), false);
  assert.match(cards, /<a href="#codigo-purpose-check"><b>Código<\/b><code>purpose_check<\/code><\/a>/);
  assert.equal(cards.includes('type="checkbox"'), false);
  const severity = loadTsx(join(ficha, "SeverityCards.tsx"));
  const modifiers = html(severity.SeverityCards, {
    levels: [{ name: "Leve", level: 1, article: "art. 34 bis", amount: "hasta 5.000 UTM", examplesLabel: "Ejemplos con origen técnico", examples: ["e"] }],
    modifiers: [{ effect: "down", effectLabel: "Atenúa", title: "Modelo", text: "t", basis: "art. 51" }],
  });
  assert.match(modifiers, /severity-article">art\. 34 bis/);
  assert.match(modifiers, /Ejemplos con origen técnico/);
  assert.match(modifiers, /data-effect="down"/);
  assert.match(modifiers, /Atenúa/);
  assert.match(modifiers, /art\. 51/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  numberedTitles,
  sectionKind,
  sectionRefLabel,
  usesCompactNumbering,
  visibleNumbers,
  withSectionTitles,
} from "../../frontend/lib/sectionNumbering.ts";

const PII_TITLES = [
  { section: 1, title: "Propósito" },
  { section: 2, title: "Qué cuenta como dato personal y sensible", ref: "Qué protege la ley" },
  { section: 3, title: "Problema que resuelve" },
  { section: 4, title: "Cómo funciona" },
  { section: 5, title: "Cuándo usarlo" },
  { section: 10, title: "Código" },
  { section: 11, title: "En la nube" },
  { section: 14, title: "Hacer y evitar" },
  { section: 16, title: "Trade-offs" },
  { section: 18, title: "Preguntas técnicas abiertas" },
  { section: 20, title: "Fuentes" },
];
const TEMPLATE: Record<number, string> = {
  1: "Resumen", 2: "Qué es", 3: "Problema que resuelve", 4: "Cómo funciona", 5: "Cuándo utilizarlo", 9: "Arquitectura",
  10: "Código", 11: "Detectores en la nube, por frente del código", 14: "Buenas prácticas", 16: "Trade-offs",
  18: "Preguntas técnicas abiertas", 20: "Fuentes",
};

test("pii-identification: títulos de section_titles, secciones 1 a 11 y referencias con el número visible", () => {
  const models = PII_TITLES.map(({ section }) => ({ number: section, title: TEMPLATE[section] }));
  assert.equal(usesCompactNumbering(PII_TITLES), true);
  const titled = withSectionTitles(models, PII_TITLES);
  assert.deepEqual(titled.map((m) => m.title), PII_TITLES.map((t) => t.title));
  const visible = visibleNumbers(titled);
  assert.deepEqual([...visible.values()], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const refs = numberedTitles(PII_TITLES, visible);
  assert.equal(sectionRefLabel("#s10", "§", refs), "§6 · Código");
  assert.equal(sectionRefLabel("#s2", "§", refs), "§2 · Qué protege la ley");
  assert.equal(sectionRefLabel("#s11", "§", refs), "§7 · En la nube");
  assert.equal(sectionRefLabel("#s10", "Código", refs), null);
  assert.equal(sectionKind(14, refs), "§8");
});

test("chile-data-protection: misma numeración (14 secciones con Contexto normativo y Sanciones) y mismos títulos", () => {
  const current = [
    [1, "Propósito"], [1.5, "Contexto normativo"], [2, "Principios y responsabilidades"], [3, "Problema que resuelve"],
    [4, "Cómo funciona"], [5, "Cuándo utilizarlo"], [9, "Arquitectura"], [10, "Código"], [11, "En la nube"],
    [14, "Buenas prácticas"], [16, "Trade-offs"], [16.5, "Sanciones"], [18, "Preguntas técnicas abiertas"], [20, "Fuentes"],
  ] as const;
  const models = [
    ...current.map(([number, title]) => ({ number, title })),
    { number: 23, title: "Anexo · Catálogo legal por tema", annex: true },
  ];
  const titles = current.filter(([n]) => Number.isInteger(n)).map(([section, title]) => ({ section, title }));
  const titled = withSectionTitles(models, titles);
  assert.deepEqual(titled.map((m) => m.title), models.map((m) => m.title));
  const visible = visibleNumbers(titled);
  assert.equal(visible.size, 14);
  assert.equal(visible.get(1.5), 2);
  assert.equal(visible.get(16.5), 12);
  assert.equal(visible.get(20), 14);
  assert.equal(visible.has(23), false);
});

test("sin section_titles la ficha conserva la numeración de la plantilla y sus títulos", () => {
  assert.equal(usesCompactNumbering(undefined), false);
  assert.equal(usesCompactNumbering([]), false);
  const models = [{ number: 1, title: "Resumen" }];
  assert.deepEqual(withSectionTitles(models, undefined), models);
});

test("la numeración compacta depende del contrato, no del slug; píldoras y Fuentes pasan por anchorAttrs", () => {
  const page = readFileSync(join(import.meta.dirname, "../../frontend/app/concepts/[slug]/page.tsx"), "utf8");
  assert.equal(page.includes('compactNumbering={data.slug === "chile-data-protection"}'), false);
  assert.match(page, /compactNumbering=\{usesCompactNumbering\(sectionTitles\)\}/);
  for (const file of ["Pills.tsx", "SourcesGrouped.tsx"]) {
    const source = readFileSync(join(import.meta.dirname, "../../frontend/components/ficha", file), "utf8");
    assert.match(source, /\{\.\.\.anchorAttrs\(/, file);
  }
});

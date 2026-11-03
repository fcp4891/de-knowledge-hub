import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { principleActivation, principleAriaLabel, tooltipAlign } from "../../frontend/lib/principleCards.ts";

const css = readFileSync(join(import.meta.dirname, "../../frontend/components/card/reading.css"), "utf8");
const view = readFileSync(join(import.meta.dirname, "../../frontend/components/card/LegalFoundations.tsx"), "utf8");

test("el rótulo del enlace nombra el principio y la ficha hija", () => {
  assert.equal(
    principleAriaLabel("a) Licitud y lealtad.", "Inventario de actividades de tratamiento"),
    "a) Licitud y lealtad. Abrir ficha: Inventario de actividades de tratamiento",
  );
});

test("el primer toque revela y el segundo navega", () => {
  assert.equal(principleActivation({ hoverNone: true, alreadyOpen: false, keyboard: false }), "reveal");
  assert.equal(principleActivation({ hoverNone: true, alreadyOpen: true, keyboard: false }), "navigate");
});

test("con ratón o con Enter el enlace navega", () => {
  assert.equal(principleActivation({ hoverNone: false, alreadyOpen: false, keyboard: false }), "navigate");
  assert.equal(principleActivation({ hoverNone: true, alreadyOpen: false, keyboard: true }), "navigate");
});

test("Esc cierra y la tarjeta es un enlace sin «Ver en detalle»", () => {
  assert.match(view, /event\.key !== "Escape"/);
  assert.match(view, /role="tooltip"/);
  assert.match(view, /aria-describedby=\{open \? tipId : undefined\}/);
  assert.match(view, /href=\{`\/concepts\/\$\{principle\.slug\}\/`\}/);
  assert.equal(view.includes("Ver en detalle"), false);
});

test("la mitad derecha abre el tooltip hacia la izquierda", () => {
  assert.equal(tooltipAlign(0, 4), "start");
  assert.equal(tooltipAlign(2, 4), "end");
  assert.equal(tooltipAlign(3, 4), "end");
  assert.equal(tooltipAlign(0, 2), "start");
  assert.equal(tooltipAlign(1, 2), "end");
  assert.match(css, /nth-child\(4n \+ 3\)/);
  assert.match(css, /max-width:\s*560px/);
  assert.match(css, /nth-child\(2n\)/);
});

test("el hover usa la escala de Especialización con más especificidad y sin !important", () => {
  const rule = css.slice(css.indexOf(".legal-foundations .lf-principles a.lf-principle-card:hover"));
  assert.match(rule, /background:\s*var\(--band-especializacion-50\)/);
  assert.match(rule, /border-color:\s*var\(--band-especializacion-200\)/);
  assert.match(rule, /color:\s*var\(--band-especializacion-800\)/);
  assert.match(rule, /--band-especializacion-900/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.equal(rule.slice(0, rule.indexOf("@media (max-width: 560px)")).includes("!important"), false);
});

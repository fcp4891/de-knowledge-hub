import assert from "node:assert/strict";
import { test } from "node:test";

import { groupEvidence, parseMarkdown } from "../../frontend/lib/markdown.ts";
import {
  bcnLinkText,
  claimKind,
  claimLabel,
  extractLegalNotice,
  lawLabel,
  legalBasisRows,
  legalNoticeCopy,
  legislationBadge,
} from "../../frontend/lib/legal.ts";

test("el badge de jurisdicción nombra el país", () => {
  assert.equal(legislationBadge([]), null);
  assert.equal(legislationBadge(["CL"]), "Legislación · CL");
});

test("la norma se muestra con el número oficial y el enlace a BCN", () => {
  assert.equal(lawLabel("ley-19628"), "Ley 19.628");
  assert.equal(lawLabel("ley-21719"), "Ley 21.719");
  assert.equal(lawLabel("ley-21663"), "Ley 21.663");
  assert.equal(bcnLinkText("https://www.bcn.cl/leychile/navegar?idNorma=141599"), "BCN");
});

test("las tres etiquetas se distinguen por tipo", () => {
  assert.equal(claimKind("[Obligación legal · art. 14 bis]"), "obligation");
  assert.equal(claimKind("[Obligación legal · Ley 21.663, art. 9]"), "obligation");
  assert.equal(claimKind("[Buena práctica]"), "practice");
  assert.equal(claimKind("[Decisión de arquitectura]"), "architecture");
  assert.equal(claimKind("tratamiento"), null);
  assert.equal(claimLabel("[Obligación legal · art. 2]"), "Obligación legal · art. 2");
});

test("el aviso sale del resumen y no queda como párrafo suelto", () => {
  const source = [
    "Esta ficha no es asesoría legal: explica el alcance técnico.",
    "",
    "El resto del resumen sigue en la sección.",
  ].join("\n");
  const split = extractLegalNotice(source);
  assert.equal(split.notice, "Esta ficha no es asesoría legal: explica el alcance técnico.");
  assert.equal(split.markdown.includes("asesoría legal"), false);
  assert.equal(split.markdown, "El resto del resumen sigue en la sección.");
  const copy = legalNoticeCopy(split.notice);
  assert.equal(copy.lead, "Esta ficha no es asesoría legal.");
  assert.equal(copy.detail, "explica el alcance técnico.");
});

test("la implicancia técnica sale de legal_basis y no del texto del §4", () => {
  const [row] = legalBasisRows([
    {
      law: "ley-19628",
      article: "2",
      url: "https://www.bcn.cl/leychile/navegar?idNorma=141599",
      note: "Definiciones.",
      implication: "Clasificar columnas y datasets.",
    },
  ]);
  assert.equal(row.says, "Definiciones.");
  assert.equal(row.implication, "Clasificar columnas y datasets.");
  assert.equal(
    legalBasisRows([
      { law: "ley-19628", article: "15 bis", url: "https://www.bcn.cl/", note: null, implication: "  " },
    ])[0].implication,
    null,
  );
});

test("la subsección de evidencia agrupa el título y la tabla", () => {
  const blocks = parseMarkdown(
    ["Texto previo.", "", "### Evidencia de cumplimiento", "", "| Evidencia | Dónde queda |", "|---|---|", "| Matriz | Repositorio |", ""].join("\n"),
  );
  const grouped = groupEvidence(blocks);
  const evidence = grouped.find((block) => block.type === "evidence");
  assert.ok(evidence && evidence.type === "evidence");
  assert.equal(evidence.blocks.length, 1);
  assert.equal(evidence.blocks[0].type, "table");
  assert.equal(grouped.some((block) => block.type === "heading"), false);
});

test("el parser deja cada etiqueta como un solo énfasis", () => {
  const [list] = parseMarkdown("- **[Buena práctica]** El control queda en la CI.\n").filter(
    (block) => block.type === "list",
  );
  assert.ok(list && list.type === "list");
  assert.deepEqual(list.items[0].inlines[0], { type: "strong", value: "[Buena práctica]" });
});

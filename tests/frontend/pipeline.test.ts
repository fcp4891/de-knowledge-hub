import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { parseMarkdown, type Inline, type ListItem } from "../../frontend/lib/markdown.ts";
import { pipelineLayout, readPipeline } from "../../frontend/lib/pipeline.ts";

function item(markdown: string): Inline[] {
  const block = parseMarkdown(markdown)[0];
  if (block.type === "paragraph") {
    return block.inlines;
  }
  if (block.type === "list") {
    return (block.items[0] as ListItem).inlines;
  }
  throw new Error(block.type);
}

test("una cadena sola se convierte en pasos", () => {
  const chain = readPipeline(item("**Requisito normativo → Riesgo identificado → Control técnico → Verificación → Evidencia**"));
  assert.ok(chain);
  assert.equal(chain.chips.length, 0);
  assert.equal(chain.label, null);
  assert.deepEqual(
    chain.steps.map((step) => step.name.map((part) => part.value).join("")),
    ["Requisito normativo", "Riesgo identificado", "Control técnico", "Verificación", "Evidencia"],
  );
});

test("un rótulo antes de los dos puntos queda como título", () => {
  const chain = readPipeline(item("- **Consulta de streaming:** `readStream` → transformaciones → `writeStream`."));
  assert.ok(chain);
  assert.equal(chain.label?.map((part) => part.value).join(""), "Consulta de streaming");
  assert.deepEqual(
    chain.steps.map((step) => step.name.map((part) => part.value).join("")),
    ["readStream", "transformaciones", "writeStream"],
  );
  assert.equal(chain.steps[0].name[0].type, "code");
});

test("un chip de etiqueta se conserva y el rótulo también", () => {
  const chain = readPipeline(
    item(
      "- **[Decisión de arquitectura]** **Pipeline de solicitudes:** recepción → autenticación → decisión del área legal → localización → ejecución por destino → verificación → respuesta → cierre.",
    ),
  );
  assert.ok(chain);
  assert.equal(chain.chips[0]?.kind, "architecture");
  assert.equal(chain.label?.map((part) => part.value).join(""), "Pipeline de solicitudes");
  assert.equal(chain.steps.length, 8);
});

test("el paréntesis de un tramo queda como subtítulo y no cuenta para el límite", () => {
  const chain = readPipeline(
    item("- **ETL**: fuente → motor de transformación (Spark, Beam, un script) → destino con datos ya modelados."),
  );
  assert.ok(chain);
  assert.equal(chain.label?.map((part) => part.value).join(""), "ETL");
  assert.equal(chain.steps[1]?.note, "Spark, Beam, un script");
  assert.equal(chain.steps[1]?.name.map((part) => part.value).join(""), "motor de transformación");
  assert.equal(chain.steps[2]?.note, null);
});

test("una flecha dentro de una oración no se transforma", () => {
  assert.equal(
    readPipeline(item("- Siempre que un paso necesite el resultado de otro: extraer → validar → cargar.")),
    null,
  );
  assert.equal(readPipeline(item("3. `run(cfg, dia)` encadena `extraer` → `transformar` → `cargar`:")), null);
  assert.equal(
    readPipeline(
      item(
        "**[Buena práctica]** Trazabilidad decisión aprobada → control → implementación → evidencia → responsable; separar controles preventivos.",
      ),
    ),
    null,
  );
});

test("un tramo que parece código no se transforma", () => {
  assert.equal(
    readPipeline(
      item(
        "- **Copo de nieve:** `dim_producto_sf(producto, subcategoria_key)` → `dim_subcategoria(subcategoria, categoria_key)` → `dim_categoria(categoria)`.",
      ),
    ),
    null,
  );
});

test("ocho pasos a 390 px se apilan en vertical", () => {
  const chain = readPipeline(
    item("a → b → c → d → e → f → g → h"),
  );
  assert.equal(chain?.steps.length, 8);
  assert.equal(pipelineLayout(8, 390), "stack");
  assert.equal(pipelineLayout(8, 1440), "wrap");
  assert.equal(pipelineLayout(5, 1440), "row");
  const css = readFileSync(join(import.meta.dirname, "../../frontend/components/markdown/pipeline.css"), "utf8");
  assert.match(css, /max-width:\s*450px/);
  assert.match(css, /pipeline-arrow-stack/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

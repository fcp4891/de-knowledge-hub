// Búsqueda estática: los alias se indexan con el mismo peso que el título (ADR-010).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { searchDocuments, type SearchDocument } from "../../frontend/lib/browserSearch.ts";

const ROOT = join(import.meta.dirname, "..", "..");

function frontmatterList(yaml: string, key: string): string[] {
  const lines = yaml.split("\n");
  const start = lines.findIndex((line) => line === `${key}:`);
  const items: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const item = /^- (.+)$/.exec(line);
    if (!item) {
      break;
    }
    items.push(item[1]);
  }
  return items;
}

test("buscar Composer encuentra Managed Service for Apache Airflow", () => {
  const yaml = readFileSync(join(ROOT, "content/technologies/gcp-cloud-composer.yaml"), "utf8");
  const title = /^title: (.+)$/m.exec(yaml)?.[1] ?? "";
  const aliases = frontmatterList(yaml, "aliases");
  assert.equal(title, "Managed Service for Apache Airflow");
  assert.ok(aliases.includes("Composer"));

  const document: SearchDocument = {
    id: "cloud_service:gcp-cloud-composer",
    slug: "gcp-cloud-composer",
    title,
    type: "cloud_service",
    domain: null,
    classification: "modern",
    has_page: true,
    snippet: "servicio administrado de airflow",
    tags: ["orchestration", "airflow"],
    aliases,
  };

  assert.deepEqual(searchDocuments([document], "Composer"), ["Managed Service for Apache Airflow"]);
  const { aliases: _aliases, ...withoutAliases } = document;
  assert.deepEqual(searchDocuments([withoutAliases], "Composer"), []);
});

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mockRoot = path.resolve(frontendRoot, "..", "docs", "contracts", "mock-data");
const dataRoot = path.join(frontendRoot, "public", "data");

function documentsFromLists() {
  const concepts = JSON.parse(readFileSync(path.join(dataRoot, "concepts.json"), "utf8"));
  const snippets = JSON.parse(readFileSync(path.join(dataRoot, "snippets.json"), "utf8"));
  const technologies = JSON.parse(readFileSync(path.join(dataRoot, "technologies.json"), "utf8"));
  const documents = [];
  for (const item of concepts.items) {
    documents.push({
      id: `${item.kind}:${item.slug}`,
      slug: item.slug,
      title: item.title,
      type: item.kind,
      domain: item.domain ?? null,
      classification: item.classification ?? null,
      has_page: Boolean(item.has_page),
      snippet: item.title,
    });
  }
  for (const item of snippets.items) {
    documents.push({
      id: `code_snippet:${item.slug}`,
      slug: item.slug,
      title: item.title,
      type: "code_snippet",
      domain: null,
      classification: null,
      has_page: true,
      snippet: item.description ?? "",
    });
  }
  for (const item of technologies.items) {
    documents.push({
      id: `${item.type}:${item.slug}`,
      slug: item.slug,
      title: item.title,
      type: item.type,
      domain: null,
      classification: item.classification ?? null,
      has_page: true,
      snippet: item.title,
    });
  }
  return documents;
}

export function syncStaticData() {
  if (!existsSync(path.join(dataRoot, "index.json"))) {
    mkdirSync(path.dirname(dataRoot), { recursive: true });
    cpSync(mockRoot, dataRoot, { recursive: true });
  }
  const searchIndex = path.join(dataRoot, "search-index.json");
  if (!existsSync(searchIndex)) {
    writeFileSync(searchIndex, `${JSON.stringify({ documents: documentsFromLists() })}\n`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncStaticData();
}

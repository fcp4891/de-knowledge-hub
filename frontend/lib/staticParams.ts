import { readFileSync } from "node:fs";
import path from "node:path";

export function staticSlugs(listFile: string): { slug: string }[] {
  if (process.env.API_MODE !== "static") {
    return [];
  }
  const text = readFileSync(path.join(process.cwd(), "public", "data", listFile), "utf8");
  const data = JSON.parse(text) as { items: { slug: string }[] };
  return data.items.map((item) => ({ slug: item.slug }));
}

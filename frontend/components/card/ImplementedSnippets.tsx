import Link from "next/link";

import type { RelationGroups } from "@/lib/api/types";

export function ImplementedSnippets({ groups }: { groups: RelationGroups }) {
  const seen = new Set<string>();
  const snippets = [];
  for (const group of groups.groups) {
    if (group.type !== "IMPLEMENTS" || group.direction !== "incoming") {
      continue;
    }
    for (const item of group.items) {
      if (item.entity_type !== "code_snippet" || seen.has(item.slug)) {
        continue;
      }
      seen.add(item.slug);
      snippets.push(item);
    }
  }

  if (snippets.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Snippets</h2>
      <ul className="stack">
        {snippets.map((snippet) => (
          <li key={snippet.slug}>
            <Link href={`/snippets/${snippet.slug}`}>{snippet.title}</Link>
            {snippet.note ? <p className="muted">{snippet.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

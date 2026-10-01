import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import type { ApiResult, EntityType, RelationGroups } from "@/lib/api/types";
import { entityHref } from "@/lib/entityHref";
import { RELATION_LABEL } from "@/lib/labels";

export async function RelationPanel({
  result,
  center,
}: {
  result: ApiResult<RelationGroups>;
  center: { slug: string; title: string; entityType: EntityType };
}) {
  const hasNeighbors = result.ok && result.data.groups.some((group) => group.items.length > 0);
  const Graph = hasNeighbors ? (await import("./NeighborhoodGraph")).NeighborhoodGraph : null;

  return (
    <aside className="panel relation-panel">
      <h2>Relaciones</h2>
      {Graph ? <Graph center={center} groups={result.ok ? result.data.groups : []} /> : null}
      {result.ok ? <RelationGroupsView groups={result.data} /> : <ApiFailure result={result} />}
    </aside>
  );
}

function RelationGroupsView({ groups }: { groups: RelationGroups }) {
  if (groups.groups.length === 0) {
    return <p className="muted">Sin relaciones.</p>;
  }

  return (
    <div className="relation-groups">
      {groups.groups.map((group) => (
        <section key={`${group.type}-${group.direction}`}>
          <h3>{RELATION_LABEL[group.label] ?? group.label.replaceAll("_", " ")}</h3>
          <ul className="stack">
            {group.items.map((item) => (
              <li key={`${group.type}-${item.slug}`}>
                <Link href={entityHref(item.entity_type, item.slug)}>{item.title}</Link>
                {item.note ? <p className="muted">{item.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

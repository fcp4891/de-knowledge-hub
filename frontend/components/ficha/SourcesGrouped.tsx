import { hideOwnerName } from "@/lib/hideOwnerName";

import "./ficha-blocks.css";

type SourceLink = { label?: string; href: string };

type SourceItem = {
  title: string;
  links: SourceLink[];
  publisher: string;
  level: string;
  why?: string;
  provider?: string;
};

function linkLabel(link: SourceLink): string {
  if (link.label) {
    return link.label;
  }
  try {
    return new URL(link.href).host;
  } catch {
    return link.href;
  }
}

function providerColumns(sources: SourceItem[]): { provider: string; sources: SourceItem[] }[] {
  const order: string[] = [];
  const groups = new Map<string, SourceItem[]>();
  for (const source of sources) {
    const provider = source.provider ?? "Otros";
    const column = groups.get(provider);
    if (column) {
      column.push(source);
    } else {
      groups.set(provider, [source]);
      order.push(provider);
    }
  }
  return order.map((provider) => ({ provider, sources: groups.get(provider) ?? [] }));
}

function SourceLinks({ links }: { links: SourceLink[] }) {
  if (links.length === 0) {
    return null;
  }
  return (
    <ul className="sources-links">
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href}>{linkLabel(link)}</a>
        </li>
      ))}
    </ul>
  );
}

export function SourcesGrouped({
  groups,
}: {
  groups: { title: string; layout?: "list" | "providers"; sources: SourceItem[] }[];
}) {
  return (
    <section className="ficha-block sources">
      {groups.map((group) => {
        const layout = group.layout ?? "list";
        return (
          <section key={group.title} className="sources-group">
            <h3>{group.title}</h3>
            {layout === "providers" ? (
              <div className="sources-providers">
                {providerColumns(group.sources).map((column) => (
                  <section key={column.provider} className="sources-provider">
                    <h4>{column.provider}</h4>
                    <ul className="sources-list">
                      {column.sources.map((source) => (
                        <li key={source.title}>
                          <h4>{source.title}</h4>
                          <p className="sources-meta">
                            {source.publisher} · {source.level}
                          </p>
                          {source.why ? <p className="sources-why">{hideOwnerName(source.why)}</p> : null}
                          <SourceLinks links={source.links} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <ul className="sources-list">
                {group.sources.map((source) => (
                  <li key={source.title}>
                    <div className="sources-row">
                      <h4>{source.title}</h4>
                      <p className="sources-meta">
                        {source.publisher} · {source.level}
                      </p>
                    </div>
                    {source.why ? <p className="sources-why">{hideOwnerName(source.why)}</p> : null}
                    <SourceLinks links={source.links} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </section>
  );
}

import type { CitationSource, PageSource } from "@/lib/views";

import { FichaAnchor } from "@/components/availability/FichaLink";

import { RichText } from "./RichText";
import "./ficha-blocks.css";

type SourceLink = { label?: string; href: string };

type SourceItem = CitationSource | PageSource;

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

function citations(sources: SourceItem[]): CitationSource[] {
  return sources.filter((source): source is CitationSource => {
    if (source.kind === "page") {
      return false;
    }
    return "links" in source;
  });
}

function providerColumns(sources: CitationSource[]): { provider: string; sources: CitationSource[] }[] {
  const order: string[] = [];
  const groups = new Map<string, CitationSource[]>();
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
        const pages = group.sources.filter((source): source is PageSource => source.kind === "page" && "page" in source);
        const cited = citations(group.sources);
        return (
          <section key={group.title} className="sources-group">
            <h3>{group.title}</h3>
            {pages.length > 0 ? (
              <ul className="sources-list">
                {pages.map((source) => (
                  <li key={source.page}>
                    <h4>{source.title}</h4>
                    <FichaAnchor href={`/concepts/${source.page}/`} blocked={source.targetAvailability !== undefined}>
                      {source.label}
                    </FichaAnchor>
                    {source.why ? (
                      <p className="sources-why">
                        <RichText text={source.why} />
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {layout === "providers" ? (
              <div className="sources-providers">
                {providerColumns(cited).map((column) => (
                  <section key={column.provider} className="sources-provider">
                    <h4>{column.provider}</h4>
                    <ul className="sources-list">
                      {column.sources.map((source) => (
                        <li key={source.title}>
                          <h4>{source.title}</h4>
                          <p className="sources-meta">
                            {source.publisher} · {source.level}
                          </p>
                          {source.why ? <p className="sources-why">{source.why}</p> : null}
                          <SourceLinks links={source.links} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <ul className="sources-list">
                {cited.map((source) => (
                  <li key={source.title}>
                    <div className="sources-row">
                      <h4>{source.title}</h4>
                      <p className="sources-meta">
                        {source.publisher} · {source.level}
                      </p>
                    </div>
                    {source.why ? <p className="sources-why">{source.why}</p> : null}
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

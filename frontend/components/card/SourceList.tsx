import type { SourceRef } from "@/lib/api/types";
import { citationDetail, citationLinkText } from "@/lib/citation";

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <section className="panel">
      <h2>Fuentes</h2>
      {sources.length === 0 ? (
        <p className="muted">Sin fuentes en esta ficha.</p>
      ) : (
        <ul className="stack">
          {sources.map((source) => (
            <li key={`${source.source}-${source.url}`}>
              <a href={source.url}>{citationLinkText(source)}</a>
              <p className="meta">{citationDetail(source)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

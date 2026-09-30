import type { SourceRef } from "@/lib/api/types";

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
              <a href={source.url}>{source.title}</a>
              <p className="meta">
                <span>Nivel {source.authority_level}</span>
                <span>{source.source}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { MarkdownBody } from "@/components/markdown/MarkdownBody";
import type { SnippetSection } from "@/lib/api/types";

const OPEN_SECTIONS = new Set<SnippetSection["key"]>(["what_it_solves", "code"]);

export function SnippetBody({ sections }: { sections: SnippetSection[] }) {
  const ordered = [...sections].sort((left, right) => left.number - right.number);

  return (
    <div className="sections">
      {ordered.map((section) => {
        const body = section.markdown.trim() ? (
          <MarkdownBody markdown={section.markdown} />
        ) : (
          <p className="muted">Sin contenido.</p>
        );
        if (OPEN_SECTIONS.has(section.key)) {
          return (
            <section key={section.number} className="panel">
              <h2>{section.title}</h2>
              {body}
            </section>
          );
        }
        return (
          <details key={section.number} className="panel">
            <summary>{section.title}</summary>
            {body}
          </details>
        );
      })}
    </div>
  );
}

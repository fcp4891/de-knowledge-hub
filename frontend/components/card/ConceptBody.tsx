import { CloudTabs } from "@/components/card/CloudTabs";
import { MarkdownBody } from "@/components/markdown/MarkdownBody";
import type { Section } from "@/lib/api/types";

const CLOUD_KEYS = new Set(["gcp", "aws", "azure"]);

export function ConceptBody({
  sections,
  omitSourceSection,
}: {
  sections: Section[];
  omitSourceSection: boolean;
}) {
  if (sections.length === 0) {
    return <p className="muted">Esta ficha todavía no tiene secciones.</p>;
  }

  const ordered = [...sections].sort((left, right) => left.number - right.number);
  const nodes: React.ReactNode[] = [];
  let cloudsPlaced = false;

  for (const section of ordered) {
    if (CLOUD_KEYS.has(section.key)) {
      if (!cloudsPlaced) {
        nodes.push(
          <section key="clouds" className="panel">
            <CloudTabs
              tabs={ordered.filter((item) => CLOUD_KEYS.has(item.key)).map((item) => ({
                id: item.key,
                title: item.title,
                content: item.markdown.trim() ? (
                  <MarkdownBody markdown={item.markdown} />
                ) : (
                  <p className="muted">Sin contenido en esta nube.</p>
                ),
              }))}
            />
          </section>,
        );
        cloudsPlaced = true;
      }
      continue;
    }

    if (omitSourceSection && section.key === "sources") {
      continue;
    }

    const body = section.markdown.trim() ? (
      <MarkdownBody markdown={section.markdown} />
    ) : (
      <p className="muted">Sin contenido.</p>
    );

    if (section.key === "summary") {
      nodes.push(
        <section key={section.number} className="panel">
          <h2>{section.title}</h2>
          {body}
        </section>,
      );
      continue;
    }

    nodes.push(
      <details key={section.number} className="panel">
        <summary>{section.title}</summary>
        {body}
      </details>,
    );
  }

  return <div className="sections">{nodes}</div>;
}

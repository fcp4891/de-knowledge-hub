import { InlineText } from "@/components/markdown/InlineText";
import { droppedEtiquetaIndex, type ObligationBasis } from "@/lib/legal";
import { groupEvidence, parseMarkdown, type Block, type EvidenceGroup } from "@/lib/markdown";

export async function MarkdownBody({
  markdown,
  etiquetaColumn = false,
  obligations = [],
}: {
  markdown: string;
  etiquetaColumn?: boolean;
  obligations?: readonly ObligationBasis[];
}) {
  const blocks = parseMarkdown(markdown);
  const grouped = groupEvidence(blocks);
  const hasCode = blocks.some((block) => block.type === "code" && block.language !== "mermaid");
  const hasMermaid = blocks.some((block) => block.type === "code" && block.language === "mermaid");
  const codeModule = hasCode ? await import("@/components/markdown/CodeBlock") : null;
  const mermaidModule = hasMermaid ? await import("@/components/markdown/MermaidDiagram") : null;
  const codeBlock = codeModule?.CodeBlock ?? null;
  const mermaidDiagram = mermaidModule?.MermaidDiagram ?? null;

  return (
    <div className="markdown">
      {grouped.map((block, index) =>
        block.type === "evidence" ? (
          <EvidenceBlock
            key={index}
            titleId={`evidence-title-${index}`}
            group={block}
            obligations={obligations}
            CodeBlock={codeBlock}
            MermaidDiagram={mermaidDiagram}
          />
        ) : (
          <MarkdownBlock
            key={index}
            block={block}
            etiquetaColumn={etiquetaColumn}
            obligations={obligations}
            CodeBlock={codeBlock}
            MermaidDiagram={mermaidDiagram}
          />
        ),
      )}
    </div>
  );
}

function EvidenceBlock({
  titleId,
  group,
  obligations,
  CodeBlock,
  MermaidDiagram,
}: {
  titleId: string;
  group: EvidenceGroup;
  obligations: readonly ObligationBasis[];
  CodeBlock: ((props: { code: string; language: string }) => React.ReactNode) | null;
  MermaidDiagram: ((props: { source: string }) => React.ReactNode) | null;
}) {
  return (
    <section className="evidence" aria-labelledby={titleId}>
      <h3 id={titleId} className="evidence-title">
        <svg className="evidence-mark" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M9 3h6v4H9z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m8.5 14 2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        Evidencia de cumplimiento
      </h3>
      {group.blocks.map((block, index) => (
        <MarkdownBlock
          key={index}
          block={block}
          etiquetaColumn={false}
          obligations={obligations}
          CodeBlock={CodeBlock}
          MermaidDiagram={MermaidDiagram}
        />
      ))}
    </section>
  );
}

function MarkdownBlock({
  block,
  etiquetaColumn,
  obligations,
  CodeBlock,
  MermaidDiagram,
}: {
  block: Block;
  etiquetaColumn: boolean;
  obligations: readonly ObligationBasis[];
  CodeBlock: ((props: { code: string; language: string }) => React.ReactNode) | null;
  MermaidDiagram: ((props: { source: string }) => React.ReactNode) | null;
}) {
  if (block.type === "heading") {
    return <h3>{block.text}</h3>;
  }
  if (block.type === "code" && block.language === "mermaid") {
    return MermaidDiagram ? <MermaidDiagram source={block.code} /> : <pre>{block.code}</pre>;
  }
  if (block.type === "code") {
    return CodeBlock ? (
      <CodeBlock code={block.code} language={block.language} />
    ) : (
      <pre>
        <code>{block.code}</code>
      </pre>
    );
  }
  if (block.type === "note") {
    return (
      <p className="verify-note">
        Pendiente de verificación: <InlineText inlines={block.inlines} obligations={obligations} />
      </p>
    );
  }
  if (block.type === "table") {
    const drop = etiquetaColumn ? droppedEtiquetaIndex(block.headers, block.rows) : null;
    const indexes = block.headers.map((_, index) => index).filter((index) => index !== drop);
    return (
      <div className="markdown-table-wrap">
        <table>
          <thead>
            <tr>
              {indexes.map((index) => (
                <th key={index} data-align={block.aligns[index] ?? "left"}>
                  <InlineText inlines={block.headers[index]} obligations={obligations} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {indexes.map((index) => (
                  <td key={index} data-align={block.aligns[index] ?? "left"}>
                    <InlineText inlines={row[index] ?? []} obligations={obligations} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={index} className={item.checked === null ? undefined : "task"}>
            {item.checked === null ? null : (
              <input type="checkbox" defaultChecked={item.checked} disabled aria-label={item.checked ? "Hecho" : "Pendiente"} />
            )}
            <InlineText inlines={item.inlines} obligations={obligations} />
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <p>
      <InlineText inlines={block.inlines} obligations={obligations} />
    </p>
  );
}

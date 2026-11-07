import { Fragment } from "react";

import { ArrowInlines } from "@/components/markdown/InlineArrows";
import { PipelineSteps } from "@/components/markdown/PipelineSteps";
import type { ConceptRefs } from "@/lib/conceptNames";
import { annotateCode, type CodeAnnotation, type CodePresentation } from "@/lib/codeBlocks";
import { isControlMatrix, stepNumber } from "@/lib/controlMatrix";
import { horizontalFlowchart } from "@/lib/diagramDirection";
import { articleMapColumns, droppedEtiquetaIndex, type ObligationBasis } from "@/lib/legal";
import { groupEvidence, parseMarkdown, type Block, type EvidenceGroup, type Inline } from "@/lib/markdown";
import { readPipeline } from "@/lib/pipeline";

export async function MarkdownBody({
  markdown,
  etiquetaColumn = false,
  obligations = [],
  conceptRefs,
  markCodeStatus = false,
  horizontalDiagrams = false,
  styleArrows = true,
  views,
}: {
  markdown: string;
  etiquetaColumn?: boolean;
  obligations?: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus?: boolean;
  horizontalDiagrams?: boolean;
  styleArrows?: boolean;
  /** ADR-030: lo que se dibuja en cada marca <!-- view: clave -->; sin entrada, la marca no dibuja nada. */
  views?: Readonly<Record<string, React.ReactNode>>;
}) {
  const blocks = parseMarkdown(markdown);
  const notes = annotateCode(blocks);
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
        block.type === "view" ? (
          <Fragment key={index}>{views?.[block.name] ?? null}</Fragment>
        ) : block.type === "evidence" ? (
          <EvidenceBlock
            key={index}
            titleId={`evidence-title-${index}`}
            group={block}
            obligations={obligations}
            conceptRefs={conceptRefs}
            markCodeStatus={markCodeStatus}
            notes={notes}
            horizontalDiagrams={horizontalDiagrams}
            styleArrows={styleArrows}
            CodeBlock={codeBlock}
            MermaidDiagram={mermaidDiagram}
          />
        ) : (
          <MarkdownBlock
            key={index}
            block={block}
            etiquetaColumn={etiquetaColumn}
            markCodeStatus={markCodeStatus}
            obligations={obligations}
            conceptRefs={conceptRefs}
            annotation={notes.get(block)}
            horizontalDiagrams={horizontalDiagrams}
            styleArrows={styleArrows}
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
  conceptRefs,
  markCodeStatus,
  notes,
  horizontalDiagrams,
  styleArrows,
  CodeBlock,
  MermaidDiagram,
}: {
  titleId: string;
  group: EvidenceGroup;
  obligations: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus: boolean;
  notes: WeakMap<Block, CodeAnnotation>;
  horizontalDiagrams: boolean;
  styleArrows: boolean;
  CodeBlock: ((props: CodePresentation) => React.ReactNode) | null;
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
          markCodeStatus={markCodeStatus}
          obligations={obligations}
          conceptRefs={conceptRefs}
          annotation={notes.get(block)}
          horizontalDiagrams={horizontalDiagrams}
          styleArrows={styleArrows}
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
  conceptRefs,
  markCodeStatus,
  annotation,
  horizontalDiagrams,
  styleArrows,
  CodeBlock,
  MermaidDiagram,
}: {
  block: Block;
  etiquetaColumn: boolean;
  obligations: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus: boolean;
  annotation?: CodeAnnotation;
  horizontalDiagrams: boolean;
  styleArrows: boolean;
  CodeBlock: ((props: CodePresentation) => React.ReactNode) | null;
  MermaidDiagram: ((props: { source: string }) => React.ReactNode) | null;
}) {
  if (block.type === "view") {
    return null;
  }
  if (block.type === "heading") {
    return <h3>{block.text}</h3>;
  }
  if (block.type === "code" && block.language === "mermaid") {
    const source = horizontalDiagrams ? horizontalFlowchart(block.code) : block.code;
    return MermaidDiagram ? <MermaidDiagram source={source} /> : <pre>{source}</pre>;
  }
  if (block.type === "code") {
    if (annotation?.role === "output") return null;
    if (annotation?.role === "code" && CodeBlock) return <CodeBlock {...annotation.view} />;
    return (
      <pre>
        <code>{block.code}</code>
      </pre>
    );
  }
  if (block.type === "note") {
    return (
      <p className="verify-note">
        Pendiente de verificación: <ArrowInlines inlines={block.inlines} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} styleArrows={styleArrows} />
      </p>
    );
  }
  if (block.type === "table") {
    const articleMap = etiquetaColumn ? null : articleMapColumns(block.headers, block.rows);
    const drop = etiquetaColumn ? droppedEtiquetaIndex(block.headers, block.rows) : null;
    const indexes = articleMap
      ? articleMap.columns
      : block.headers.map((_, index) => index).filter((index) => index !== drop);
    const matrix = isControlMatrix(block.headers.map(cellLabel));
    const wrapClass = articleMap
      ? "markdown-table-wrap markdown-table-fit"
      : matrix
        ? "markdown-table-wrap markdown-table-steps"
        : "markdown-table-wrap";
    return (
      <div className={wrapClass}>
        <table>
          {block.headers.some((cell) => cell.length > 0) ? (
            <thead>
              <tr>
                {indexes.map((index) => (
                  <th key={index} data-align={block.aligns[index] ?? "left"}>
                    {matrix ? <span className="step-number">{stepNumber(index)}</span> : null}
                    <ArrowInlines inlines={block.headers[index]} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} styleArrows={styleArrows} />
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {indexes.map((index) => {
                  const ficha = articleMap && index === articleMap.articleIndex ? articleMap.fichaTitles[rowIndex] : null;
                  return (
                    <td
                      key={index}
                      data-align={block.aligns[index] ?? "left"}
                      data-label={cellLabel(block.headers[index] ?? [])}
                      title={ficha ?? undefined}
                    >
                      <ArrowInlines inlines={row[index] ?? []} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} styleArrows={styleArrows} />
                    </td>
                  );
                })}
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
            <FlowText inlines={item.inlines} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} styleArrows={styleArrows} />
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <FlowText inlines={block.inlines} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} styleArrows={styleArrows} paragraph />
  );
}

function FlowText({
  inlines,
  obligations,
  conceptRefs,
  markCodeStatus,
  styleArrows,
  paragraph = false,
}: {
  inlines: Inline[];
  obligations: readonly ObligationBasis[];
  conceptRefs?: ConceptRefs;
  markCodeStatus: boolean;
  styleArrows: boolean;
  paragraph?: boolean;
}) {
  const chain = readPipeline(inlines);
  if (chain) {
    return (
      <PipelineSteps chain={chain} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={markCodeStatus} />
    );
  }
  return (
    <ArrowInlines
      inlines={inlines}
      obligations={obligations}
      conceptRefs={conceptRefs}
      markCodeStatus={markCodeStatus}
      styleArrows={styleArrows}
      paragraph={paragraph}
    />
  );
}

function cellLabel(inlines: Inline[]): string {
  return inlines.map((part) => part.value).join("").replace(/\s+/g, " ").trim();
}

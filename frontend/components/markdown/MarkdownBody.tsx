import { InlineText } from "@/components/markdown/InlineText";
import { parseMarkdown, type Block } from "@/lib/markdown";

export async function MarkdownBody({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);
  const hasCode = blocks.some((block) => block.type === "code" && block.language !== "mermaid");
  const hasMermaid = blocks.some((block) => block.type === "code" && block.language === "mermaid");
  const codeModule = hasCode ? await import("@/components/markdown/CodeBlock") : null;
  const mermaidModule = hasMermaid ? await import("@/components/markdown/MermaidDiagram") : null;

  return (
    <div className="markdown">
      {blocks.map((block, index) => (
        <MarkdownBlock
          key={index}
          block={block}
          CodeBlock={codeModule?.CodeBlock ?? null}
          MermaidDiagram={mermaidModule?.MermaidDiagram ?? null}
        />
      ))}
    </div>
  );
}

function MarkdownBlock({
  block,
  CodeBlock,
  MermaidDiagram,
}: {
  block: Block;
  CodeBlock: ((props: { code: string; language: string }) => React.ReactNode) | null;
  MermaidDiagram: ((props: { source: string }) => React.ReactNode) | null;
}) {
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
        Pendiente de verificación: <InlineText inlines={block.inlines} />
      </p>
    );
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={index}>
            <InlineText inlines={item} />
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <p>
      <InlineText inlines={block.inlines} />
    </p>
  );
}

"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { renderMermaid } = await import("@/lib/renderMermaid");
        const rendered = await renderMermaid(source, `diagram-${reactId}`);
        if (!cancelled) {
          setSvg(rendered);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reactId, source]);

  if (failed) {
    return <pre className="code-block">{source}</pre>;
  }
  if (!svg) {
    return <p className="muted">Cargando diagrama…</p>;
  }
  return (
    <div className="diagram" role="img" aria-label="Diagrama" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

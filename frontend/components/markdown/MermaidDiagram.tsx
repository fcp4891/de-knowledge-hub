"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
      try {
        const rendered = await mermaid.render(`diagram-${reactId}`, source);
        if (!cancelled) {
          setSvg(rendered.svg);
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
  return <div className="diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export function MermaidDiagram({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

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
    <figure className="diagram-frame">
      <div className="diagram-bar">
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setOpen(true);
          }}
        >
          Ampliar
        </button>
      </div>
      {open ? null : (
        <div className="diagram" role="img" aria-label="Diagrama" dangerouslySetInnerHTML={{ __html: svg }} />
      )}
      {open ? (
        <DiagramModal svg={svg} zoom={zoom} onZoom={setZoom} onClose={() => setOpen(false)} />
      ) : null}
    </figure>
  );
}

function DiagramModal({
  svg,
  zoom,
  onZoom,
  onClose,
}: {
  svg: string;
  zoom: number;
  onZoom: (zoom: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.deltaY < 0 ? 0.1 : -0.1;
      onZoom(clampZoom(zoom + step));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [onZoom, zoom]);

  return (
    <div className="diagram-modal" role="dialog" aria-modal="true" aria-label="Diagrama ampliado">
      <div className="diagram-modal-bar">
        <button type="button" aria-label="Alejar" onClick={() => onZoom(clampZoom(zoom - 0.25))}>
          −
        </button>
        <span className="diagram-modal-zoom">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Acercar" onClick={() => onZoom(clampZoom(zoom + 0.25))}>
          +
        </button>
        <button ref={closeRef} type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="diagram-modal-stage" ref={stageRef}>
        <div
          className="diagram-modal-canvas"
          style={{ width: diagramSize(svg).width * zoom, height: diagramSize(svg).height * zoom }}
        >
          <div
            style={{
              width: diagramSize(svg).width,
              height: diagramSize(svg).height,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    </div>
  );
}

function diagramSize(svg: string): { width: number; height: number } {
  const width = Number(/\swidth="([\d.]+)"/.exec(svg)?.[1] ?? 0);
  const height = Number(/\sheight="([\d.]+)"/.exec(svg)?.[1] ?? 0);
  return {
    width: Number.isFinite(width) && width > 0 ? width : 640,
    height: Number.isFinite(height) && height > 0 ? height : 360,
  };
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

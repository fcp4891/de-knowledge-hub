"use client";

import { useEffect, useRef, useState } from "react";

import { componentAnchor, normalizeLabel, sameComponent } from "@/lib/architecture";
import { splitViewsFit, svgIntrinsicWidth } from "@/lib/diagramFit";

export type ArchitectureViewPane = {
  key: string;
  number: number;
  title: string;
  label: string;
  body: React.ReactNode;
};

export function ArchitectureStage({
  views,
  activeKey,
  onActiveKey,
  components,
}: {
  views: ArchitectureViewPane[];
  activeKey: string;
  onActiveKey: (key: string) => void;
  components: { number: number; title: string; body: React.ReactNode } | null;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<"tabs" | "split">("tabs");
  const [narrow, setNarrow] = useState(false);
  const [splitFits, setSplitFits] = useState(false);
  const shown = narrow || !splitFits ? "tabs" : layout;
  const active = views.some((view) => view.key === activeKey) ? activeKey : (views[0]?.key ?? "");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 899px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || narrow) {
      return;
    }
    const apply = () => {
      const fits = measureSplit(root, views.length);
      setSplitFits(fits);
      if (!fits) {
        setLayout("tabs");
      }
    };
    apply();
    const resize = new ResizeObserver(apply);
    resize.observe(root);
    const mutations = new MutationObserver(apply);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      mutations.disconnect();
    };
  }, [narrow, views.length]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const bind = () => {
      const table = root.querySelector(".arch-components table");
      if (!table) {
        return;
      }
      for (const row of table.querySelectorAll<HTMLTableRowElement>("tbody tr")) {
        const name = row.querySelector("td")?.textContent?.trim() ?? "";
        if (name.length === 0) {
          continue;
        }
        row.id = componentAnchor(name);
        row.dataset.component = normalizeLabel(name);
      }
    };
    bind();
    const observer = new MutationObserver(bind);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  function paint(name: string) {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    let hits = 0;
    for (const node of root.querySelectorAll(".arch-views .node")) {
      const hit = name.length > 0 && sameComponent(name, node.textContent ?? "");
      node.classList.toggle("is-hot", hit);
      if (hit) {
        hits += 1;
      }
    }
    const row = [...(root.querySelectorAll<HTMLTableRowElement>(".arch-components tbody tr") ?? [])].find(
      (item) => item.dataset.component === name,
    );
    if (row instanceof HTMLElement) {
      row.dataset.anchored = hits === 0 && name.length > 0 ? "true" : "false";
    }
  }

  return (
    <div className="arch-stage" ref={rootRef}>
      <div className="arch-toolbar">
        <div className="cloud-tabs">
          <div role="group" aria-label="Disposición de las vistas">
            <button type="button" aria-pressed={shown === "tabs"} onClick={() => setLayout("tabs")}>
              Pestañas
            </button>
            {narrow || !splitFits ? null : (
              <button type="button" aria-pressed={shown === "split"} onClick={() => setLayout("split")}>
                Lado a lado
              </button>
            )}
          </div>
        </div>
        {shown === "tabs" ? (
          <div className="cloud-tabs">
            <div role="tablist" aria-label="Vistas de la arquitectura">
              {views.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  role="tab"
                  aria-selected={view.key === active}
                  onClick={() => onActiveKey(view.key)}
                >
                  {view.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="arch-views" data-layout={shown}>
        {views.map((view) => (
          <section
            key={view.key}
            id={`s${view.number}`}
            className="arch-view"
            hidden={shown === "tabs" && view.key !== active}
            aria-label={view.label}
            data-reading-section={view.number}
            data-reading-title={view.title}
          >
            <p className="arch-view-kicker">{view.label}</p>
            {view.body}
          </section>
        ))}
      </div>
      {components ? (
        <section
          id={`s${components.number}`}
          className="arch-components reading-section"
          aria-labelledby={`h-${components.number}`}
          data-reading-section={components.number}
          data-reading-title={components.title}
          onMouseOver={(event) => {
            const row = (event.target as HTMLElement).closest<HTMLTableRowElement>("tbody tr");
            paint(row?.dataset.component ?? "");
          }}
          onMouseLeave={() => paint("")}
        >
          <h2 id={`h-${components.number}`}>
            {components.number} · {components.title}
          </h2>
          {components.body}
        </section>
      ) : null}
    </div>
  );
}

const SPLIT_GAP = 12;
const SPLIT_CHROME = 26;

function measureSplit(root: HTMLElement, viewCount: number): boolean {
  const host = root.querySelector(".arch-views");
  if (!(host instanceof HTMLElement) || viewCount < 2) {
    return false;
  }
  const svgs = [...host.querySelectorAll(".arch-view svg")];
  if (svgs.length < viewCount) {
    return false;
  }
  const column = (host.clientWidth - SPLIT_GAP * (viewCount - 1)) / viewCount - SPLIT_CHROME;
  return splitViewsFit(svgs.map(svgIntrinsicWidth), column);
}

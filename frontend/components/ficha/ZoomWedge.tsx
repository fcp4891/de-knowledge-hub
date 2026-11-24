"use client";

import { useEffect, useRef } from "react";

const HEIGHT = 30;

/** Cuña «lupa» del zoom de arquitectura (ADR-030, enmienda 12): une las cajas resaltadas del recorte con el panel.
 * Se dibuja en el navegador, midiendo las cajas `.is-highlight` del contenedor; bajo 640 px la oculta el CSS. */
export function ZoomWedge() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const map = svg?.parentElement;
    if (!svg || !map) {
      return;
    }
    const [area, left, right] = Array.from(svg.children) as SVGElement[];
    const draw = () => {
      const box = svg.getBoundingClientRect();
      const lit = map.querySelectorAll(".is-highlight");
      if (!box.width || lit.length === 0) {
        return;
      }
      const first = lit[0].getBoundingClientRect();
      const last = lit[lit.length - 1].getBoundingClientRect();
      const x1 = first.left - box.left;
      const x2 = last.right - box.left;
      const w = box.width;
      svg.setAttribute("viewBox", `0 0 ${w} ${HEIGHT}`);
      area.setAttribute("points", `${x1},0 ${x2},0 ${w},${HEIGHT} 0,${HEIGHT}`);
      left.setAttribute("x1", String(x1));
      left.setAttribute("x2", "0");
      right.setAttribute("x1", String(x2));
      right.setAttribute("x2", String(w));
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(map);
    void document.fonts?.ready.then(draw);
    return () => observer.disconnect();
  }, []);

  return (
    <svg ref={ref} className="zoom-wedge" height={HEIGHT} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <polygon className="zoom-wedge-area" points="" />
      <line className="zoom-wedge-edge" y1="0" y2={HEIGHT} />
      <line className="zoom-wedge-edge" y1="0" y2={HEIGHT} />
    </svg>
  );
}

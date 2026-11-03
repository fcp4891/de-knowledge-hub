/** Letra nativa del SVG (renderMermaid fija 14px). Por debajo, «Lado a lado» no se ofrece. */
export const DIAGRAM_FONT_PX = 14;
export const MIN_LEGIBLE_FONT_PX = 10;

export function splitViewsFit(intrinsicWidths: readonly number[], columnWidth: number): boolean {
  if (columnWidth <= 0 || intrinsicWidths.length === 0) {
    return false;
  }
  return intrinsicWidths.every(
    (width) => width > 0 && (DIAGRAM_FONT_PX * columnWidth) / width >= MIN_LEGIBLE_FONT_PX,
  );
}

export function svgIntrinsicWidth(svg: Element): number {
  const box = svg.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number) ?? [];
  if (box.length === 4 && Number.isFinite(box[2]) && box[2] > 0) {
    return box[2];
  }
  const width = Number(svg.getAttribute("width"));
  return Number.isFinite(width) && width > 0 ? width : 0;
}

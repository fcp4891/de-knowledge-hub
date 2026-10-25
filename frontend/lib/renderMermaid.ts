import mermaid from "mermaid";

/**
 * Colores de tokens.css (el SVG no resuelve variables CSS).
 * Fondo --bg, nodos --surface, líneas --ink, marco del cluster --border-strong.
 */
const UI_FONT = "IBM Plex Sans, system-ui, sans-serif";
const INK = "#15171C";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F3";
const BORDER_STRONG = "#D5D8D1";

/**
 * Dibuja un bloque mermaid a SVG con el paquete local.
 * Next lo empaqueta en el build estático (assetPrefix = BASE_PATH); el bundle no llama a un CDN.
 * El tamaño queda en píxeles del viewBox: 14px de letra no se achican para caber.
 */
export async function renderMermaid(source: string, id: string): Promise<string> {
  const svg = await draw(source, id, "strict");
  if (svg.includes("<svg")) {
    return normalizeDiagram(svg);
  }
  // DOMPurify, con el DOM de los tests, elimina el <svg>. En el navegador strict ya lo conserva.
  const plain = await draw(source, `${id}plain`, "loose");
  if (!plain.includes("<svg")) {
    throw new Error("mermaid no devolvió SVG");
  }
  return normalizeDiagram(plain);
}

async function draw(source: string, id: string, securityLevel: "strict" | "loose"): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel,
    fontFamily: UI_FONT,
    htmlLabels: false,
    theme: "base",
    themeVariables: {
      fontFamily: UI_FONT,
      fontSize: "14px",
      background: BG,
      mainBkg: SURFACE,
      primaryColor: SURFACE,
      primaryTextColor: INK,
      primaryBorderColor: INK,
      secondaryColor: "#EDEFEA",
      secondaryTextColor: INK,
      secondaryBorderColor: INK,
      tertiaryColor: BG,
      tertiaryTextColor: INK,
      tertiaryBorderColor: INK,
      lineColor: INK,
      textColor: INK,
      nodeBorder: INK,
      clusterBkg: BG,
      clusterBorder: BORDER_STRONG,
      defaultLinkColor: INK,
      titleColor: INK,
      edgeLabelBackground: BG,
      nodeTextColor: INK,
    },
    flowchart: {
      htmlLabels: false,
      useMaxWidth: false,
      padding: 16,
      nodeSpacing: 36,
      rankSpacing: 48,
      diagramPadding: 8,
    },
  });
  const rendered = await mermaid.render(id, source);
  return rendered.svg;
}

export function normalizeDiagram(svg: string): string {
  const viewBox = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([-\d.]+)\s+([-\d.]+)\s*"/.exec(svg);
  let next = svg.replace(/font-size\s*:\s*[\d.]+px/gi, "font-size:14px");
  next = next.replace(/font-size="[\d.]+(?:px)?"/gi, 'font-size="14"');
  next = next.replace(/max-width\s*:\s*[^;"]+;?/gi, "");
  if (viewBox) {
    const width = Number(viewBox[1]);
    const height = Number(viewBox[2]);
    if (Number.isFinite(width) && width > 0) {
      next = /\swidth="/.test(next)
        ? next.replace(/\swidth="[^"]*"/, ` width="${width}"`)
        : next.replace("<svg", `<svg width="${width}"`);
    }
    if (Number.isFinite(height) && height > 0) {
      next = /\sheight="/.test(next)
        ? next.replace(/\sheight="[^"]*"/, ` height="${height}"`)
        : next.replace("<svg", `<svg height="${height}"`);
    }
  }
  const style =
    `<style>text,tspan{font-family:${UI_FONT};font-size:14px}` +
    `.node rect,.node polygon,.node circle,.node ellipse,.node path,.flowchart-link,.edgePath path{stroke:${INK};stroke-width:1.5px}</style>`;
  return next.replace(/<svg\b([^>]*)>/, `<svg$1>${style}`);
}

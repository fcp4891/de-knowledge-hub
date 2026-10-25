import mermaid from "mermaid";

/**
 * Dibuja un bloque mermaid a SVG con el paquete local.
 * Next lo empaqueta en el build estático (assetPrefix = BASE_PATH); el bundle no llama a un CDN.
 */
export async function renderMermaid(source: string, id: string): Promise<string> {
  const svg = await draw(source, id, "strict");
  if (svg.includes("<svg")) {
    return svg;
  }
  // DOMPurify, con el DOM de los tests, elimina el <svg>. En el navegador strict ya lo conserva.
  const plain = await draw(source, `${id}plain`, "loose");
  if (!plain.includes("<svg")) {
    throw new Error("mermaid no devolvió SVG");
  }
  return plain;
}

async function draw(source: string, id: string, securityLevel: "strict" | "loose"): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel,
    fontFamily: "inherit",
    htmlLabels: false,
  });
  const rendered = await mermaid.render(id, source);
  return rendered.svg;
}

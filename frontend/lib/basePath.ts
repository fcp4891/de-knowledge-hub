/**
 * Ruta interna con el basePath del export estático (p. ej. /aprendizaje-continuo).
 * next/link lo agrega solo; un <a href="/concepts/…"> crudo no, y en el sitio publicado daba 404.
 * Las anclas (#…), las URL absolutas y las de protocolo relativo (//…) no cambian.
 */
export function withBasePath(href: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base || !href.startsWith("/") || href.startsWith("//") || href.startsWith(`${base}/`)) {
    return href;
  }
  return `${base}${href}`;
}

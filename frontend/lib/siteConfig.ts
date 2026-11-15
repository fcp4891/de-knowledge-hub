/**
 * Configuración del sitio. Una sola bandera, global y reversible.
 *
 * SHOW_STUDY_ROUTES: con `false` se ocultan todos los enlaces hacia /explorer/, /repaso/ y /snippets/ (breadcrumb de la
 * ficha, «Siguiente en la ruta», estaciones e itinerario de Inicio, «Rutas» y dominio siguiente en la página de dominio,
 * «Implementado en», enlaces a snippets, el «volver» del detalle de snippet, el botón «Necesita repaso» y los resultados
 * de búsqueda que lleven ahí). Las páginas siguen respondiendo por URL directa. Para mostrarlos de nuevo: `true`.
 */
export const SHOW_STUDY_ROUTES = false;

const STUDY_PREFIXES = ["/explorer", "/repaso", "/snippets"];

/** true si el enlace lleva a una ruta de estudio y esas rutas están ocultas. */
export function isHiddenStudyRoute(href: string | null | undefined): boolean {
  if (SHOW_STUDY_ROUTES || !href) {
    return false;
  }
  return STUDY_PREFIXES.some((prefix) => href === prefix || /^[/?#]/.test(href.slice(prefix.length)) && href.startsWith(prefix));
}

/** El enlace, o null si lleva a una ruta de estudio oculta (el componente pinta el texto sin enlace). */
export function studyHref(href: string | null | undefined): string | null {
  return href && !isHiddenStudyRoute(href) ? href : null;
}

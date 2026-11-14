/** Citas al PDF de la ley abren en la ventana `ley-21719`. El resto de https abre en blanco. */
export function anchorAttrs(href: string): { target?: string; rel?: string } {
  if (/#page=\d+/.test(href)) {
    return { target: "ley-21719", rel: "noopener" };
  }
  if (/^https?:\/\//.test(href)) {
    return { target: "_blank", rel: "noopener noreferrer" };
  }
  return {};
}

export function conceptSlugFromHref(href: string): string | null {
  const match = /^\/concepts\/([a-z0-9-]+)\/?(?:#[a-z0-9-]+)?$/.exec(href);
  return match?.[1] ?? null;
}

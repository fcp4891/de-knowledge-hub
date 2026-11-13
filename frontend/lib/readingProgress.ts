/** Lo escribe la ficha. El inicio solo lo lee. Clave: `dekh:reading:<slug>`. */

export const CARD_SECTION_COUNT = 22;

export type ReadingProgress = {
  section: number;
  title: string | null;
  /** B-N5: secciones abiertas y vistas (número de plantilla; 1.5 y 16.5 incluidos). Cuenta «Leído N de M». */
  seen: number[];
};

export function readingStorageKey(slug: string): string {
  return `dekh:reading:${slug}`;
}

export function readReadingProgress(slug: string): ReadingProgress | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(readingStorageKey(slug));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { section?: unknown; title?: unknown; seen?: unknown };
    if (typeof parsed.section !== "number" || !Number.isInteger(parsed.section) || parsed.section < 1) {
      return null;
    }
    const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : null;
    const seen = Array.isArray(parsed.seen) ? parsed.seen.filter((n): n is number => typeof n === "number" && n > 0) : [];
    return { section: parsed.section, title, seen };
  } catch {
    return null;
  }
}

/** Guarda la mayor sección vista. No baja el número si ya había una más alta. */
export function writeReadingProgress(slug: string, section: number, title: string): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!Number.isInteger(section) || section < 1 || section > CARD_SECTION_COUNT) {
    return;
  }
  const current = readReadingProgress(slug);
  if (current && current.section >= section) {
    return;
  }
  const payload = {
    section,
    title,
    seen: current?.seen ?? [],
    at: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(readingStorageKey(slug), JSON.stringify(payload));
  } catch {
    /* sin almacenamiento, el progreso vive solo en la página */
  }
}

/** B-N5: agrega una sección abierta y vista; conserva la mayor sección para «Continuar». */
export function markSectionSeen(slug: string, section: number, title: string): number[] {
  if (typeof window === "undefined") {
    return [];
  }
  const current = readReadingProgress(slug);
  // Un anexo (número > 22) u otro valor fuera de rango no cuenta, pero tampoco borra lo ya visto.
  if (!(section > 0) || section > CARD_SECTION_COUNT) {
    return current?.seen ?? [];
  }
  const seen = [...new Set([...(current?.seen ?? []), section])].sort((left, right) => left - right);
  const top = Math.max(current?.section ?? 0, Math.floor(section));
  const payload = {
    section: top,
    title: top === current?.section ? current.title : title,
    seen,
    at: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(readingStorageKey(slug), JSON.stringify(payload));
  } catch {
    /* sin almacenamiento, el progreso vive solo en la página */
  }
  return seen;
}

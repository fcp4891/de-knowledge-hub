/** Lo escribe la ficha. El inicio solo lo lee. Clave: `dekh:reading:<slug>`. */

export const CARD_SECTION_COUNT = 22;

export type ReadingProgress = {
  section: number;
  title: string | null;
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
    const parsed = JSON.parse(raw) as { section?: unknown; title?: unknown };
    if (typeof parsed.section !== "number" || !Number.isInteger(parsed.section) || parsed.section < 1) {
      return null;
    }
    const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : null;
    return { section: parsed.section, title };
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
    at: new Date().toISOString(),
  };
  window.localStorage.setItem(readingStorageKey(slug), JSON.stringify(payload));
}

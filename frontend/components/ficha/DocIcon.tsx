/** Glifos de línea (24 × 24, trazo de `.inv-icon`) que comparten el Inventario y el zoom de arquitectura (ADR-030,
 * enmienda 12). Los trazos siguen el set Tabler Icons (MIT), el mismo estilo del glifo de documento de la ficha. */
const GLYPHS = {
  doc: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z", "M14 3v5h5M9 13h6M9 17h6"],
  lock: ["M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z", "M11 16a1 1 0 1 0 2 0a1 1 0 0 0-2 0", "M8 11V7a4 4 0 1 1 8 0v4"],
  "lock-open": ["M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z", "M11 16a1 1 0 1 0 2 0a1 1 0 0 0-2 0", "M8 11V6a4 4 0 0 1 8 0"],
  scale: ["M7 20h10", "M6 6l6-1 6 1", "M12 3v17", "M9 12 6 6l-3 6a3 3 0 0 0 6 0", "M21 12l-3-6-3 6a3 3 0 0 0 6 0"],
  checklist: ["M9.6 20H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8", "M14 19l2 2 4-4", "M9 8h4", "M9 12h2"],
  building: ["M3 21h18", "M3 10h18", "M5 6l7-3 7 3", "M4 10v11", "M20 10v11", "M8 14v3", "M12 14v3", "M16 14v3"],
  "map-pin": ["M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0", "M17.66 16.66 13.4 20.9a2 2 0 0 1-2.82 0l-4.25-4.24a8 8 0 1 1 11.32 0Z"],
  hash: ["M5 9h14", "M5 15h14", "M11 4 7 20", "M17 4l-4 16"],
  cloud: [
    "M6.66 18C4.08 18 2 16 2 13.52s2.08-4.49 4.66-4.49c.39-1.76 1.79-3.2 3.67-3.77 1.88-.57 3.96-.2 5.45 1 1.49 1.19 2.16 3 1.77 4.77h.99c1.91 0 3.46 1.56 3.46 3.49S20.45 18 18.54 18Z",
  ],
  "zoom-in": ["M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0", "M7 10h6", "M10 7v6", "M21 21l-6-6"],
  ban: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0", "M5.7 5.7l12.6 12.6"],
  alert: ["M12 9v4", "M10.36 3.59 2.26 17.13A1.91 1.91 0 0 0 3.9 20h16.2a1.91 1.91 0 0 0 1.64-2.87L13.64 3.59a1.91 1.91 0 0 0-3.28 0Z", "M12 16h.01"],
  help: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0", "M12 16v.01", "M12 13a2 2 0 0 0 .91-3.78 1.98 1.98 0 0 0-2.41.48"],
  check: ["M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0", "M9 12l2 2 4-4"],
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg className="inv-icon" viewBox="0 0 24 24" aria-hidden="true">
      {GLYPHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Insignia circular azul (--lvl-intermedio-ink) con el glifo en --surface. */
export function BadgeIcon({ glyph, size }: { glyph: GlyphName; size: "card" | "head" | "label" }) {
  return (
    <span className={`inv-doc-badge is-${size}`} aria-hidden="true">
      <Glyph name={glyph} />
    </span>
  );
}

/** Insignia de documento del Inventario. La usan el botón «Documento propuesto» (card, 28 px), el encabezado
 * «Registro del documento a proponer» (head, 24 px) y su rótulo móvil (label, 20 px). */
export function DocIcon({ size }: { size: "card" | "head" | "label" }) {
  return <BadgeIcon glyph="doc" size={size} />;
}

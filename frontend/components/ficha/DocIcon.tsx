/** Insignia de documento del Inventario: círculo azul (--lvl-intermedio-ink) con el glifo en --surface. La usan el botón
 * «Documento propuesto» (card, 28 px), el encabezado «Registro del documento a proponer» (head, 24 px) y su rótulo
 * móvil (label, 20 px). */
export function DocIcon({ size }: { size: "card" | "head" | "label" }) {
  return (
    <span className={`inv-doc-badge is-${size}`} aria-hidden="true">
      <svg className="inv-icon" viewBox="0 0 24 24">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
    </span>
  );
}

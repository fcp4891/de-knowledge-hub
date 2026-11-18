"use client";

import { useId, useState, type ReactNode } from "react";

import "./disclosure.css";

/**
 * ADR-030 enmienda 9: desplegable «Ver detalle / Ocultar» reutilizable. El botón es un <button> real con
 * aria-expanded y aria-controls; la región se oculta con hidden. El título completo también abre y cierra; el
 * resumen queda visible con el bloque cerrado. Los textos del botón son del componente (no de una ficha).
 */
export function Disclosure({
  title,
  summary,
  open = false,
  children,
}: {
  title: string;
  summary?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(open);
  const id = useId();
  const titleId = `${id}-t`;
  const regionId = `${id}-r`;
  const toggle = () => setExpanded((value) => !value);
  return (
    <div className="disclosure" data-open={expanded ? "true" : "false"}>
      <div
        className="disclosure-head"
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest(".disclosure-button")) toggle();
        }}
      >
        <h4 id={titleId}>{title}</h4>
        {summary ? <span className="disclosure-summary">{summary}</span> : null}
        <button type="button" className="disclosure-button" aria-expanded={expanded} aria-controls={regionId} onClick={toggle}>
          <span>{expanded ? "Ocultar" : "Ver detalle"}</span>
          <span className="disclosure-sr">: {title}</span>
          <svg className="disclosure-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div id={regionId} className="disclosure-region" role="region" aria-labelledby={titleId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

"use client";

import { useId, useState, type ReactNode } from "react";

import "./availability.css";

export type UnavailableStatus = "in_review" | "in_development";

export function AvailabilityIcon({ status }: { status: UnavailableStatus }) {
  if (status === "in_review") {
    return (
      <svg className="availability-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="availability-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" strokeLinejoin="round" />
      <path d="m13 7 4 4" strokeLinecap="round" />
    </svg>
  );
}

/** Etiqueta del estado. Con ayuda, el texto se abre al pasar, al enfocar y al tocar. */
export function AvailabilityMark({
  status,
  label,
  help,
  compact = false,
}: {
  status: UnavailableStatus;
  label: string;
  help?: string;
  compact?: boolean;
}) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const icon = <AvailabilityIcon status={status} />;
  if (compact || !help) {
    return (
      <span className={`availability-tag is-${status}`}>
        {icon}
        {label}
      </span>
    );
  }
  return (
    <span className="availability-tip" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className={`availability-tag is-${status}`}
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
        {label}
      </button>
      <span role="tooltip" id={tipId} className="availability-help">
        {help}
      </span>
    </span>
  );
}

export function AvailabilityGlyph({ status }: { status: UnavailableStatus }): ReactNode {
  return <AvailabilityIcon status={status} />;
}

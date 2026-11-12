"use client";

import type { Views } from "@/lib/views";

import { FichaAnchor } from "@/components/availability/FichaLink";
import { RichText } from "./RichText";
import "./pii-views.css";

type Note = NonNullable<Views["notes"]>[string];
type Chips = NonNullable<Views["chips"]>[string];

export function FichaNote({ note }: { note: Note }) {
  return (
    <p className={note.tone === "risk" ? "pii-risk" : "pii-note"}>
      {note.lead ? <strong>{note.lead} </strong> : null}
      <RichText text={note.text} />
    </p>
  );
}

export function FichaChips({ chips }: { chips: Chips }) {
  return (
    <p className="pii-chips">
      <span>{chips.label}</span>
      {chips.items.map((item) => (
        <FichaAnchor key={`${item.href}-${item.label}`} className="pii-chip" href={item.href}>
          {item.kind ? <i>{item.kind}</i> : null}
          {item.label}
        </FichaAnchor>
      ))}
    </p>
  );
}

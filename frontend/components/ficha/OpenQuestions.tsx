"use client";

import { useState } from "react";

import type { OpenQuestionsProps } from "@/lib/views";

import { Pills } from "./Pills";
import "./ficha-blocks.css";

/** Preguntas técnicas abiertas con casilla «Sé responderla» (ADR-030, enmienda 3). El estado vive en memoria. */
export function OpenQuestions({ intro, items, checkLabel, counter }: OpenQuestionsProps) {
  const [known, setKnown] = useState<ReadonlySet<number>>(() => new Set());
  const total = items.length;

  function toggle(index: number) {
    setKnown((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section className="ficha-block open-questions" aria-label="Preguntas técnicas abiertas">
      <p className="open-questions-intro">{intro}</p>
      <p className="open-questions-counter" aria-live="polite">
        {counter.replace("{n}", String(known.size)).replace("{total}", String(total))}
      </p>
      <ul className="open-questions-list">
        {items.map((item, index) => (
          <li key={item.question} className={known.has(index) ? "open-question is-known" : "open-question"}>
            <p>{item.question}</p>
            <Pills tags={item.tags} />
            <label className="open-question-check">
              <input type="checkbox" checked={known.has(index)} onChange={() => toggle(index)} />
              {checkLabel}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

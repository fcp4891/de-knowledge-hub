"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { ArchitectureDot } from "@/components/markdown/InlineText";

import "./ficha-blocks.css";

const OPEN_AT_START = new Set([0, 2]);

const QuestionsContext = createContext<{
  open: readonly boolean[];
  setOne: (index: number, open: boolean) => void;
} | null>(null);

export function DesignQuestions({ intro, total, children }: { intro: string; total: number; children: ReactNode }) {
  const [open, setOpen] = useState<boolean[]>(() => Array.from({ length: total }, (_, index) => OPEN_AT_START.has(index)));
  const openCount = open.filter(Boolean).length;
  const allOpen = openCount === total;
  const word = openCount === 1 ? "desplegada" : "desplegadas";

  function setOne(index: number, value: boolean) {
    setOpen((current) => {
      if (current[index] === value) {
        return current;
      }
      const next = current.slice();
      next[index] = value;
      return next;
    });
  }

  function setAll(value: boolean) {
    setOpen(Array.from({ length: total }, () => value));
  }

  return (
    <QuestionsContext.Provider value={{ open, setOne }}>
      <section className="ficha-block design-questions" aria-label="Preguntas de diseño">
        <header className="design-questions-head">
          <p className="design-questions-intro">{intro}</p>
          <p className="design-questions-badge">{total} preguntas de diseño</p>
        </header>
        <div className="design-questions-list">{children}</div>
        <footer className="design-questions-foot">
          <p className="design-questions-status">
            {openCount} de {total} {word}
          </p>
          <button type="button" aria-expanded={allOpen} onClick={() => setAll(!allOpen)}>
            {allOpen ? "Contraer todas" : "Expandir todas"}
          </button>
        </footer>
      </section>
    </QuestionsContext.Provider>
  );
}

export function DesignQuestion({
  index,
  number,
  question,
  arq = false,
  children,
}: {
  index: number;
  number: number;
  question: string;
  arq?: boolean;
  children: ReactNode;
}) {
  const questions = useContext(QuestionsContext);
  const open = questions?.open[index] ?? false;
  return (
    <details
      className="design-question"
      open={open}
      onToggle={(event) => questions?.setOne(index, event.currentTarget.open)}
    >
      <summary>
        <span className="design-question-num">{String(number).padStart(2, "0")}</span>
        <span className="design-question-title">
          {arq ? <ArchitectureDot /> : null}
          {question}
        </span>
        <span className="design-question-chevron" aria-hidden="true" />
      </summary>
      <div className="design-question-body">{children}</div>
    </details>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { LanguageFn } from "highlight.js";

import "highlight.js/styles/github.css";
import "./code-block.css";
import {
  centerTarget,
  downloadFilename,
  downloadSource,
  fitsInCompact,
  nextTrapIndex,
  scenarioNames,
  type CodeOutput,
  type CodePresentation,
  type CodeStep,
} from "@/lib/codeBlocks";

const LANGUAGE_LOADERS: Record<string, () => Promise<{ default: LanguageFn }>> = {
  sql: () => import("highlight.js/lib/languages/sql"),
  python: () => import("highlight.js/lib/languages/python"),
  bash: () => import("highlight.js/lib/languages/bash"),
  javascript: () => import("highlight.js/lib/languages/javascript"),
  typescript: () => import("highlight.js/lib/languages/typescript"),
  json: () => import("highlight.js/lib/languages/json"),
  yaml: () => import("highlight.js/lib/languages/yaml"),
};

const LANGUAGE_ALIAS: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function focusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>("button, a[href], [tabindex='0']")].filter(
    (element) => !element.hasAttribute("disabled"),
  );
}

function scrollStep(container: HTMLElement, step: CodeStep | null, behavior: ScrollBehavior) {
  if (!step) {
    container.scrollTo({ left: 0, top: 0, behavior });
    return;
  }
  const first = container.querySelector<HTMLElement>(`[data-line="${step.start}"]`);
  const last = container.querySelector<HTMLElement>(`[data-line="${step.end}"]`);
  if (!first || !last) return;
  const view = container.getBoundingClientRect();
  const top = first.getBoundingClientRect().top;
  const bottom = last.getBoundingClientRect().bottom;
  const delta = (top + bottom) / 2 - (view.top + view.height / 2);
  container.scrollTo({ left: 0, top: Math.max(0, container.scrollTop + delta), behavior });
}

function CodeLines({
  lines,
  html,
  active,
  steps,
  scrollRef,
  className,
}: {
  lines: string[];
  html: string[] | null;
  active: number | null;
  steps: CodeStep[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  className: string;
}) {
  const range = active === null ? null : steps[active];
  return (
    <div className={className} tabIndex={0} aria-label="Código" ref={scrollRef}>
      <div className="code-lines">
        {lines.map((line, index) => {
          const on = range ? index >= range.start && index <= range.end : false;
          const dim = range ? !on : false;
          const source = html?.[index] || escapeHtml(line) || "\u00a0";
          return (
            <div key={index} className={["code-row", on ? "is-on" : "", dim ? "is-dim" : ""].filter(Boolean).join(" ")} data-line={index}>
              <span className="code-ln">{index + 1}</span>
              <span className="code-text hljs" dangerouslySetInnerHTML={{ __html: source }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepBar({
  steps,
  active,
  onChoose,
}: {
  steps: CodeStep[];
  active: number | null;
  onChoose: (index: number | null) => void;
}) {
  if (steps.length === 0) return null;
  return (
    <div className="code-steps" role="group" aria-label="Pasos">
      <button type="button" className={active === null ? "is-selected" : undefined} aria-pressed={active === null} onClick={() => onChoose(null)}>
        Todo
      </button>
      {steps.map((step, index) => (
        <button
          key={`${step.start}-${step.title}`}
          type="button"
          className={active === index ? "is-selected" : undefined}
          aria-pressed={active === index}
          title={step.truncated ? step.fullTitle : undefined}
          aria-label={step.truncated ? step.fullTitle : undefined}
          onClick={() => onChoose(index)}
        >
          {step.title}
        </button>
      ))}
    </div>
  );
}

function Terminal({
  outputs,
  names,
  scenario,
  typed,
  onScenario,
}: {
  outputs: CodeOutput[];
  names: string[] | null;
  scenario: number;
  typed: string;
  onScenario: (index: number) => void;
}) {
  if (outputs.length === 0) return null;
  const exitCode = outputs[scenario]?.exitCode ?? null;
  return (
    <div className="code-terminal">
      {names ? (
        <div className="code-scenarios" role="group" aria-label="Escenarios">
          {names.map((name, index) => (
            <button
              key={`${name}-${index}`}
              type="button"
              className={scenario === index ? "is-selected" : undefined}
              aria-pressed={scenario === index}
              onClick={() => onScenario(index)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="code-terminal-bar">
        <span className="code-terminal-label">Salida</span>
        {exitCode === null ? null : (
          <span className={exitCode === 0 ? "code-exit is-ok" : "code-exit is-bad"} aria-label={`código de salida ${exitCode}`}>
            {exitCode}
          </span>
        )}
      </div>
      <pre className="code-terminal-body">{typed}</pre>
    </div>
  );
}

export function CodeBlock({ code, language, filename, status, steps, outputs }: CodePresentation) {
  const lines = code.split("\n");
  const fits = fitsInCompact(lines.length);
  const names = scenarioNames(outputs);
  const normalized = LANGUAGE_ALIAS[language.toLowerCase()] ?? language.toLowerCase();
  const [html, setHtml] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [scenario, setScenario] = useState(0);
  const [typed, setTyped] = useState(outputs[0]?.text ?? "");
  const [reduced, setReduced] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | null>(null);
  const shownText = useRef<string | null>(null);

  useEffect(() => {
    const load = LANGUAGE_LOADERS[normalized];
    if (!load) return;
    let cancelled = false;
    void (async () => {
      const [{ default: hljs }, languageModule] = await Promise.all([import("highlight.js/lib/core"), load()]);
      hljs.registerLanguage(normalized, languageModule.default);
      const highlighted = code.split("\n").map((line) => (line ? hljs.highlight(line, { language: normalized }).value : ""));
      if (!cancelled) setHtml(highlighted);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, normalized]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => () => {
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
  }, []);

  const outputText = outputs[scenario]?.text ?? "";
  useEffect(() => {
    if (shownText.current === null || shownText.current === outputText || reduced) {
      shownText.current = outputText;
      setTyped(outputText);
      return;
    }
    shownText.current = outputText;
    let count = 0;
    setTyped("");
    const chunk = Math.max(8, Math.ceil(outputText.length / 10));
    const timer = window.setInterval(() => {
      count += chunk;
      setTyped(outputText.slice(0, count));
      if (count >= outputText.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [outputText, reduced]);

  function scrollAll(nextActive: number | null, nextLast: number | null) {
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const target = centerTarget(nextActive, nextLast, steps);
    for (const node of [scrollRef.current, modalScrollRef.current]) {
      if (node) scrollStep(node, target, behavior);
    }
  }

  useEffect(() => {
    scrollAll(active, last);
    // El centrado se recalcula al abrir el modal y cuando el resaltado está listo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, last, open, reduced, html]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
    openRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      openRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function choose(index: number | null) {
    const nextLast = index === null ? last : index;
    setActive(index);
    if (index !== null) setLast(index);
    scrollAll(index, nextLast);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob([downloadSource(code)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFilename(language, filename);
    link.click();
    URL.revokeObjectURL(url);
  }

  function onDialogKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = focusable(dialogRef.current);
    const next = nextTrapIndex(items.indexOf(document.activeElement as HTMLElement), items.length, event.shiftKey);
    if (next === null) return;
    event.preventDefault();
    items[next]?.focus();
  }

  const label = language.trim() ? language : "código";

  return (
    <div className="code-shell" data-fit={fits ? "true" : "false"} data-steps={steps.length} data-outputs={outputs.length} data-scenarios={names?.length ?? 0}>
      <div className="code-bar">
        <span className="code-lang">{label}</span>
        {filename ? <span className="code-file">{filename}</span> : null}
        {status ? <span className={`code-status is-${status.tone}`}>{status.label}</span> : null}
        <div className="code-bar-actions">
          <button type="button" onClick={() => void copy()}>
            {copied ? "Copiado" : "Copiar"}
          </button>
          {fits ? null : (
            <button type="button" ref={openRef} onClick={() => setOpen(true)}>
              Ver completo
            </button>
          )}
        </div>
      </div>
      <StepBar steps={steps} active={active} onChoose={choose} />
      <CodeLines lines={lines} html={html} active={active} steps={steps} scrollRef={scrollRef} className="code-scroll" />
      <Terminal outputs={outputs} names={names} scenario={scenario} typed={typed} onScenario={setScenario} />
      {open ? (
        <div
          className="code-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="code-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Código completo"
            tabIndex={-1}
            ref={dialogRef}
            onKeyDown={onDialogKey}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="code-bar">
              <span className="code-lang">{label}</span>
              {filename ? <span className="code-file">{filename}</span> : null}
              {status ? <span className={`code-status is-${status.tone}`}>{status.label}</span> : null}
              <div className="code-bar-actions">
                <button type="button" onClick={() => void copy()}>
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button type="button" onClick={download}>
                  Descargar
                </button>
                <button type="button" onClick={close}>
                  Cerrar
                </button>
              </div>
            </div>
            <StepBar steps={steps} active={active} onChoose={choose} />
            <CodeLines lines={lines} html={html} active={active} steps={steps} scrollRef={modalScrollRef} className="code-modal-scroll" />
            <Terminal outputs={outputs} names={names} scenario={scenario} typed={typed} onScenario={setScenario} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

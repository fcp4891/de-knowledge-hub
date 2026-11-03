import type { Inline } from "./markdown.ts";

const ARROW = new Set(["→", "←", "↔"]);
const PUNCT = new Set([...".,;:!?()[]{}«»\"'“”‘’—–/"]);

export type ArrowRun =
  | { kind: "text"; inlines: Inline[] }
  | { kind: "space"; value: string }
  | { kind: "pill"; inlines: Inline[] }
  | { kind: "arrow"; value: "→" | "←" | "↔" };

type Span = { inline: Inline; start: number; end: number };
type Range = { start: number; end: number };

function locate(inlines: readonly Inline[]): { text: string; spans: Span[] } {
  let text = "";
  const spans: Span[] = [];
  for (const inline of inlines) {
    const start = text.length;
    text += inline.value;
    spans.push({ inline, start, end: text.length });
  }
  return { text, spans };
}

function sliceInlines(spans: readonly Span[], from: number, to: number): Inline[] {
  const out: Inline[] = [];
  for (const span of spans) {
    const start = Math.max(span.start, from);
    const end = Math.min(span.end, to);
    if (start >= end) {
      continue;
    }
    const value = span.inline.value.slice(start - span.start, end - span.start);
    if (value.length === 0) {
      continue;
    }
    out.push({ ...span.inline, value });
  }
  return out;
}

function arrowsIn(text: string, spans: readonly Span[]): { index: number; value: "→" | "←" | "↔" }[] {
  const found: { index: number; value: "→" | "←" | "↔" }[] = [];
  for (const span of spans) {
    if (span.inline.type === "code") {
      continue;
    }
    for (let index = span.start; index < span.end; index += 1) {
      const value = text[index];
      if (value === "→" || value === "←" || value === "↔") {
        found.push({ index, value });
      }
    }
  }
  return found;
}

function isComplex(text: string): boolean {
  const groups = text.match(/\([^()]*[→←↔][^()]*\)/g);
  return (groups?.length ?? 0) >= 2;
}

function skipSpace(text: string, index: number, direction: -1 | 1): number {
  let cursor = index;
  while (cursor >= 0 && cursor < text.length && text[cursor] === " ") {
    cursor += direction;
  }
  return cursor;
}

function codeAt(spans: readonly Span[], index: number): Span | null {
  return spans.find((span) => span.inline.type === "code" && span.start <= index && index < span.end) ?? null;
}

function onlySpaces(text: string, from: number, to: number): boolean {
  return text.slice(from, to).trim() === "";
}

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

function clearTerm(value: string): boolean {
  const parts = words(value);
  return parts.length >= 1 && parts.length <= 3 && ![...value].some((char) => ARROW.has(char));
}

function boundaryBefore(text: string, end: number): number {
  let index = end - 1;
  while (index >= 0) {
    const char = text[index];
    if (PUNCT.has(char) || ARROW.has(char)) {
      return index + 1;
    }
    if (char === " " && index >= 2 && (text[index - 1] === "y" || text[index - 1] === "o") && text[index - 2] === " ") {
      return index + 1;
    }
    index -= 1;
  }
  return 0;
}

function boundaryAfter(text: string, start: number): number {
  let index = start;
  while (index < text.length) {
    const char = text[index];
    if (PUNCT.has(char) || ARROW.has(char)) {
      return index;
    }
    if (text.startsWith(" y ", index) || text.startsWith(" o ", index)) {
      return index;
    }
    index += 1;
  }
  return text.length;
}

function trimRange(text: string, start: number, end: number): Range | null {
  const raw = text.slice(start, end);
  const leading = raw.length - raw.trimStart().length;
  const value = raw.trim();
  if (!clearTerm(value)) {
    return null;
  }
  return { start: start + leading, end: start + leading + value.length };
}

function termBefore(text: string, spans: readonly Span[], arrowAt: number): Range | null {
  const index = skipSpace(text, arrowAt - 1, -1);
  if (index < 0) {
    return null;
  }
  const code = codeAt(spans, index);
  if (code && onlySpaces(text, code.end, arrowAt)) {
    return { start: code.start, end: code.end };
  }
  return trimRange(text, boundaryBefore(text, index + 1), index + 1);
}

function termAfter(text: string, spans: readonly Span[], arrowEnd: number): Range | null {
  const index = skipSpace(text, arrowEnd, 1);
  if (index >= text.length) {
    return null;
  }
  const code = codeAt(spans, index);
  if (code && onlySpaces(text, arrowEnd, code.start)) {
    return { start: code.start, end: code.end };
  }
  return trimRange(text, index, boundaryAfter(text, index));
}

function merge(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((left, right) => left.start - right.start || left.end - right.end);
  const out: Range[] = [];
  for (const range of sorted) {
    const last = out[out.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      out.push({ ...range });
    }
  }
  return out;
}

/** Flechas en línea. Null si no hay flechas o si están anidadas en varios paréntesis. */
export function readInlineArrows(inlines: readonly Inline[]): ArrowRun[] | null {
  if (inlines.length === 0) {
    return null;
  }
  const { text, spans } = locate(inlines);
  const arrows = arrowsIn(text, spans);
  if (arrows.length === 0 || isComplex(text)) {
    return null;
  }
  const pills: Range[] = [];
  for (const arrow of arrows) {
    const left = termBefore(text, spans, arrow.index);
    const right = termAfter(text, spans, arrow.index + 1);
    if (left && right && left.end <= arrow.index && right.start >= arrow.index + 1) {
      pills.push(left, right);
    }
  }
  const events: { start: number; end: number; kind: "pill" | "arrow"; value?: "→" | "←" | "↔" }[] = [
    ...merge(pills).map((range) => ({ start: range.start, end: range.end, kind: "pill" as const })),
    ...arrows.map((arrow) => ({ start: arrow.index, end: arrow.index + 1, kind: "arrow" as const, value: arrow.value })),
  ].sort((left, right) => left.start - right.start || (left.kind === "arrow" ? -1 : 1));

  const runs: ArrowRun[] = [];
  let cursor = 0;
  const pushText = (from: number, to: number) => {
    if (from >= to) {
      return;
    }
    const value = text.slice(from, to);
    if (value.trim().length === 0) {
      runs.push({ kind: "space", value });
      return;
    }
    const parts = sliceInlines(spans, from, to);
    if (parts.length > 0) {
      runs.push({ kind: "text", inlines: parts });
    }
  };
  for (const event of events) {
    if (event.start < cursor) {
      continue;
    }
    pushText(cursor, event.start);
    if (event.kind === "arrow" && event.value) {
      runs.push({ kind: "arrow", value: event.value });
    } else {
      const parts = sliceInlines(spans, event.start, event.end);
      if (parts.length > 0) {
        runs.push({ kind: "pill", inlines: parts });
      }
    }
    cursor = Math.max(cursor, event.end);
  }
  pushText(cursor, text.length);
  return runs;
}

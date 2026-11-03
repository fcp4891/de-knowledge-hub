import { claimKind, type ClaimKind } from "./legal.ts";
import type { Inline } from "./markdown.ts";

const WORD_LIMIT = 6;

export type PipelineStep = {
  name: Inline[];
  note: string | null;
};

export type PipelineChain = {
  chips: { value: string; kind: ClaimKind }[];
  label: Inline[] | null;
  steps: PipelineStep[];
};

export type PipelineLayout = "row" | "wrap" | "stack";

export function pipelineLayout(steps: number, viewport: number): PipelineLayout {
  if (viewport <= 450) {
    return "stack";
  }
  if (steps >= 6) {
    return "wrap";
  }
  return "row";
}

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

function isColumnList(note: string): boolean {
  const parts = note.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 && parts.every((part) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part));
}

function isCodeStep(name: string, note: string | null): boolean {
  if (name.includes("_")) {
    return true;
  }
  return note != null && isColumnList(note);
}

type Span = { inline: Inline; start: number; end: number };

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

function splitNote(part: string): { name: string; note: string | null } {
  const match = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(part.trim());
  if (!match) {
    return { name: part.trim(), note: null };
  }
  return { name: match[1].trim(), note: match[2].trim() };
}

export function readPipeline(inlines: readonly Inline[]): PipelineChain | null {
  let index = 0;
  const chips: PipelineChain["chips"] = [];
  while (index < inlines.length) {
    const part = inlines[index];
    if (part.type === "strong") {
      const kind = claimKind(part.value);
      if (kind) {
        chips.push({ value: part.value, kind });
        index += 1;
        continue;
      }
    }
    if (part.type === "text" && part.value.trim() === "") {
      index += 1;
      continue;
    }
    break;
  }
  const rest = inlines.slice(index);
  if (rest.length === 0 || !rest.some((part) => part.value.includes("→"))) {
    return null;
  }
  const { text, spans } = locate(rest);
  const arrowAt = text.indexOf("→");
  if (arrowAt < 0) {
    return null;
  }
  const colonAt = text.indexOf(":");
  let chainFrom = 0;
  let label: Inline[] | null = null;
  if (colonAt !== -1 && colonAt < arrowAt) {
    const labelText = text.slice(0, colonAt).trim();
    if (words(labelText).length === 0 || words(labelText).length > WORD_LIMIT || labelText.includes("→")) {
      return null;
    }
    label = sliceInlines(spans, text.indexOf(labelText), text.indexOf(labelText) + labelText.length);
    chainFrom = colonAt + 1;
  }
  let chainText = text.slice(chainFrom).trim();
  let chainStart = text.indexOf(chainText, chainFrom);
  if (chainText.endsWith(".")) {
    chainText = chainText.slice(0, -1).trim();
    chainStart = text.indexOf(chainText, chainFrom);
  }
  if (chainStart < 0 || /[.!?;:]/.test(chainText) || /\([^)]*→[^)]*\)/.test(chainText)) {
    return null;
  }
  const arrows: number[] = [];
  for (let cursor = 0; cursor < chainText.length; cursor += 1) {
    const at = chainText.indexOf("→", cursor);
    if (at < 0) {
      break;
    }
    arrows.push(at);
    cursor = at;
  }
  if (arrows.length < 2) {
    return null;
  }
  const bounds = [0, ...arrows.map((at) => at), chainText.length];
  const cuts: { start: number; end: number }[] = [];
  for (let part = 0; part < bounds.length - 1; part += 1) {
    const from = part === 0 ? bounds[part] : bounds[part] + 1;
    const to = part === bounds.length - 2 ? bounds[part + 1] : bounds[part + 1];
    const raw = chainText.slice(from, to);
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const local = raw.indexOf(trimmed);
    cuts.push({ start: chainStart + from + local, end: chainStart + from + local + trimmed.length });
  }
  if (cuts.length < 3) {
    return null;
  }
  const steps: PipelineStep[] = [];
  for (const cut of cuts) {
    const part = text.slice(cut.start, cut.end);
    const { name, note } = splitNote(part);
    if (words(name).length === 0 || words(name).length > WORD_LIMIT || isCodeStep(name, note)) {
      return null;
    }
    const nameAt = part.indexOf(name);
    const nameInlines = sliceInlines(spans, cut.start + nameAt, cut.start + nameAt + name.length);
    if (nameInlines.length === 0) {
      return null;
    }
    steps.push({ name: nameInlines, note });
  }
  return { chips, label, steps };
}

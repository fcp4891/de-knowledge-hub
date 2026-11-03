import { splitCodeStatus, type CodeStatusTone } from "./architecture.ts";
import type { Block, Inline } from "./markdown.ts";

export const COMPACT_HEIGHT = 200;
export const CODE_LINE_HEIGHT = 20;

const FILENAME = /^(?:[\w.-]+\/)*[\w.-]+\.[A-Za-z0-9]+$/;
const STEP_MARKER = /^\s*(?:#|\/\/|--)\s*@paso\s+\d+\s+(.+?)\s*$/;
const PY_DEF = /^(?:async\s+)?def\s+([A-Za-z_]\w*)/;
const PY_CLASS = /^class\s+([A-Za-z_]\w*)/;
const PY_MAIN = /^if\s+__name__\s*==\s*['"]__main__['"]/;

const DOWNLOAD_EXT: Record<string, string> = {
  python: "py",
  py: "py",
  sql: "sql",
  bash: "sh",
  sh: "sh",
  shell: "sh",
  yaml: "yaml",
  yml: "yaml",
  javascript: "js",
  js: "js",
  typescript: "ts",
  ts: "ts",
  json: "json",
};

export type CodeStep = {
  title: string;
  fullTitle: string;
  truncated: boolean;
  start: number;
  end: number;
};

export type CodeOutput = {
  name: string | null;
  text: string;
  exitCode: 0 | 1 | null;
};

export type CodeStatus = { label: string; tone: CodeStatusTone };

export type CodePresentation = {
  code: string;
  language: string;
  filename: string | null;
  status: CodeStatus | null;
  steps: CodeStep[];
  outputs: CodeOutput[];
};

export type CodeAnnotation = { role: "plain" } | { role: "output" } | { role: "code"; view: CodePresentation };

type RawStep = { start: number; end: number; title: string };

export function fitsInCompact(lineCount: number): boolean {
  return lineCount * CODE_LINE_HEIGHT <= COMPACT_HEIGHT;
}

export function copySource(code: string): string {
  return code;
}

export function downloadSource(code: string): string {
  return code;
}

export function fenceParts(raw: string): { language: string; filename: string | null } {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  const language = (parts[0] ?? "").toLowerCase();
  const rest = parts.slice(1).join(" ");
  return { language, filename: FILENAME.test(rest) ? rest : null };
}

export function filenameFromCode(code: string): string | null {
  const body = commentBody(code.split("\n")[0] ?? "");
  return body && FILENAME.test(body) ? body : null;
}

export function downloadFilename(language: string, filename: string | null): string {
  if (filename) {
    const base = filename.split("/").pop();
    if (base) return base;
  }
  return `codigo.${DOWNLOAD_EXT[language.toLowerCase()] ?? "txt"}`;
}

export function shortTitle(full: string): { title: string; truncated: boolean } {
  const clean = full.replace(/\s+/g, " ").trim();
  const words = clean.split(" ").filter(Boolean);
  if (words.length <= 3 && clean.length <= 32) {
    return { title: clean, truncated: false };
  }
  const cut = words.slice(0, 3).join(" ");
  const title = cut.length > 32 ? `${cut.slice(0, 32).trimEnd()}…` : cut;
  return { title, truncated: true };
}

export function codeSteps(language: string, code: string): CodeStep[] {
  const lines = code.split("\n");
  const marked = markerSteps(lines);
  const raw = marked ?? deduceSteps(language, lines);
  if (raw.length < 2 || raw.length > 8) return [];
  return raw.map((step) => {
    const fullTitle = step.title.replace(/\s+/g, " ").trim();
    const short = shortTitle(fullTitle);
    return { title: short.title, fullTitle, truncated: short.truncated, start: step.start, end: step.end };
  });
}

export function centerTarget(active: number | null, last: number | null, steps: readonly CodeStep[]): CodeStep | null {
  const index = active ?? last;
  if (index === null) return null;
  return steps[index] ?? null;
}

export function centerScrollTop(blockTop: number, blockHeight: number, viewHeight: number): number {
  return Math.max(0, blockTop + blockHeight / 2 - viewHeight / 2);
}

export function nextTrapIndex(current: number, count: number, shift: boolean): number | null {
  if (count <= 0) return null;
  if (current < 0) return shift ? count - 1 : 0;
  if (shift && current === 0) return count - 1;
  if (!shift && current === count - 1) return 0;
  return null;
}

export function exitCodeOf(text: string): 0 | 1 | null {
  let found: 0 | 1 | null = null;
  for (const match of text.matchAll(/\((0|1)\)|\bexit\s+(0|1)\b/gi)) {
    const digit = match[1] ?? match[2];
    found = digit === "1" ? 1 : 0;
  }
  return found;
}

export function outputName(text: string): string | null {
  const first = text.split("\n").find((line) => line.trim() !== "") ?? "";
  const label = /^([A-Za-z0-9_-]+)\s*:/.exec(first.trim());
  if (label) return label[1];
  for (const line of text.split("\n")) {
    const dollar = /^\s*\$\s+(\S+)(?:\s+(\S+))?/.exec(line);
    if (dollar) return dollar[2] ?? dollar[1];
  }
  return null;
}

export function scenarioNames(outputs: readonly CodeOutput[]): string[] | null {
  if (outputs.length < 2 || outputs.some((output) => !output.name)) return null;
  return outputs.map((output) => output.name as string);
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const value = hex.replace("#", "");
    const channels = [0, 2, 4].map((index) => {
      const channel = parseInt(value.slice(index, index + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

export function annotateCode(blocks: readonly Block[]): WeakMap<Block, CodeAnnotation> {
  const notes = new WeakMap<Block, CodeAnnotation>();
  const consumed = new Set<number>();
  blocks.forEach((block, index) => {
    if (consumed.has(index)) {
      notes.set(block, { role: "output" });
      return;
    }
    if (block.type === "code" && isOutput(block)) {
      notes.set(block, { role: "code", view: present(block, "", []) });
      return;
    }
    if (block.type !== "code" || !isRealCode(block)) {
      notes.set(block, { role: "plain" });
      return;
    }
    const outputs: CodeOutput[] = [];
    const prose: string[] = [];
    for (let next = index + 1; next < blocks.length; next += 1) {
      const candidate = blocks[next];
      if (candidate.type === "heading") break;
      if (candidate.type === "code" && candidate.language.trim().toLowerCase() === "mermaid") break;
      if (isRealCode(candidate)) break;
      if (candidate.type === "code" && isOutput(candidate)) {
        outputs.push({ name: outputName(candidate.code), text: candidate.code, exitCode: exitCodeOf(candidate.code) });
        consumed.add(next);
        continue;
      }
      const text = blockPlain(candidate);
      if (text) prose.push(text);
    }
    notes.set(block, { role: "code", view: present(block, prose.join("\n"), outputs) });
  });
  return notes;
}

function present(block: Extract<Block, { type: "code" }>, prose: string, outputs: CodeOutput[]): CodePresentation {
  const info = fenceParts(block.language);
  return {
    code: block.code,
    language: info.language,
    filename: info.filename ?? filenameFromCode(block.code),
    status: statusIn(prose) ?? statusIn(leadingHeader(block.code)),
    steps: codeSteps(info.language, block.code),
    outputs,
  };
}

function isOutput(block: Block): boolean {
  return block.type === "code" && block.language.trim().toLowerCase() === "text";
}

function isRealCode(block: Block): boolean {
  return block.type === "code" && !isOutput(block) && block.language.trim().toLowerCase() !== "mermaid";
}

function statusIn(text: string): CodeStatus | null {
  if (!text.trim()) return null;
  for (const piece of splitCodeStatus(text)) {
    if (piece.type === "status") return { label: piece.label, tone: piece.tone };
  }
  return null;
}

function leadingHeader(code: string): string {
  const parts: string[] = [];
  for (const line of code.split("\n")) {
    if (line.trim() === "") {
      if (parts.length > 0) break;
      continue;
    }
    const body = commentBody(line);
    if (body === null) break;
    if (body) parts.push(body);
  }
  return parts.join("\n");
}

function blockPlain(block: Block): string {
  if (block.type === "paragraph" || block.type === "note") return inlineText(block.inlines);
  if (block.type === "heading") return block.text;
  if (block.type === "list") return block.items.map((item) => inlineText(item.inlines)).join("\n");
  if (block.type === "table") {
    return [...block.headers, ...block.rows.flat()].map((cell) => inlineText(cell)).join(" ");
  }
  return "";
}

function inlineText(inlines: readonly Inline[]): string {
  return inlines.map((item) => item.value).join("");
}

function commentBody(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.startsWith("#!")) return null;
  if (trimmed.startsWith("#")) return trimmed.replace(/^#\s?/, "").trim();
  if (trimmed.startsWith("//")) return trimmed.replace(/^\/\/\s?/, "").trim();
  if (trimmed.startsWith("--")) return trimmed.replace(/^--\s?/, "").trim();
  return null;
}

function markerSteps(lines: readonly string[]): RawStep[] | null {
  const marks: { start: number; title: string }[] = [];
  lines.forEach((line, index) => {
    const match = STEP_MARKER.exec(line);
    if (match) marks.push({ start: index, title: match[1].trim() });
  });
  if (marks.length === 0) return null;
  return marks.map((mark, index) => ({
    start: mark.start,
    end: (marks[index + 1]?.start ?? lines.length) - 1,
    title: mark.title,
  }));
}

function deduceSteps(language: string, lines: readonly string[]): RawStep[] {
  const lang = language.toLowerCase();
  if (lang === "python" || lang === "py") return pythonSteps(lines);
  if (lang === "sql") return sqlSteps(lines);
  return commentGroups(lines);
}

function pythonSteps(lines: readonly string[]): RawStep[] {
  const marks: { start: number; title: string }[] = [];
  lines.forEach((line, index) => {
    if (line.trim() === "" || /^[ \t]/.test(line)) return;
    const named = PY_DEF.exec(line) ?? PY_CLASS.exec(line);
    const main = PY_MAIN.exec(line);
    if (!named && !main) return;
    let start = index;
    while (start > 0 && /^@/.test(lines[start - 1])) start -= 1;
    marks.push({ start, title: main ? "__main__" : named![1] });
  });
  return marks.map((mark, index) => ({
    start: mark.start,
    end: (marks[index + 1]?.start ?? lines.length) - 1,
    title: mark.title,
  }));
}

function sqlSteps(lines: readonly string[]): RawStep[] {
  const spans: { codeStart: number; codeEnd: number }[] = [];
  let start: number | null = null;
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const comment = commentBody(line) !== null;
    if (start === null && (trimmed === "" || comment)) return;
    if (start === null) start = index;
    if (endsStatement(line)) {
      spans.push({ codeStart: start, codeEnd: index });
      start = null;
    }
  });
  if (start !== null) spans.push({ codeStart: start, codeEnd: lines.length - 1 });
  const expanded = spans.map((span) => ({
    start: rewindComments(lines, span.codeStart),
    end: span.codeEnd,
    title: sqlTitle(lines, span.codeStart),
  }));
  for (let index = 0; index < expanded.length - 1; index += 1) {
    expanded[index].end = Math.max(expanded[index].end, expanded[index + 1].start - 1);
  }
  return expanded;
}

function sqlTitle(lines: readonly string[], codeStart: number): string {
  const comments: string[] = [];
  let index = codeStart - 1;
  while (index >= 0 && lines[index].trim() === "") index -= 1;
  while (index >= 0) {
    const body = commentBody(lines[index]);
    if (body === null) break;
    if (body) comments.unshift(body);
    index -= 1;
  }
  return comments[0] ?? lines[codeStart].trim().replace(/\s+/g, " ");
}

function rewindComments(lines: readonly string[], codeStart: number): number {
  let start = codeStart;
  let index = codeStart - 1;
  while (index >= 0 && lines[index].trim() === "") index -= 1;
  while (index >= 0 && commentBody(lines[index]) !== null) {
    start = index;
    index -= 1;
  }
  return start;
}

function endsStatement(line: string): boolean {
  let quote: "'" | '"' | null = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quote === "'" && char === "'" && line[index + 1] === "'") {
      index += 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === "-" && line[index + 1] === "-") return false;
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === ";") return true;
  }
  return false;
}

function commentGroups(lines: readonly string[]): RawStep[] {
  const groups: RawStep[] = [];
  let index = 0;
  while (index < lines.length) {
    if (commentBody(lines[index]) === null) {
      index += 1;
      continue;
    }
    const start = index;
    const titles: string[] = [];
    while (index < lines.length) {
      const body = commentBody(lines[index]);
      if (body !== null) {
        if (body) titles.push(body);
        index += 1;
        continue;
      }
      if (lines[index].trim() === "") {
        let look = index;
        while (look < lines.length && lines[look].trim() === "") look += 1;
        if (look < lines.length && commentBody(lines[look]) !== null) {
          index = look;
          continue;
        }
      }
      break;
    }
    const codeStart = index;
    while (index < lines.length && commentBody(lines[index]) === null) index += 1;
    const hasCode = lines.slice(codeStart, index).some((line) => line.trim() !== "");
    if (hasCode && titles.length > 0) {
      groups.push({ start, end: index - 1, title: titles[0] });
    }
  }
  return groups;
}

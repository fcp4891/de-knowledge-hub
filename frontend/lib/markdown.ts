export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; href: string; value: string };

export type Block =
  | { type: "paragraph"; inlines: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "code"; language: string; code: string }
  | { type: "note"; inlines: Inline[] };

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

export function parseMarkdown(markdown: string): Block[] {
  const text = markdown.replace(/\r\n/g, "\n");
  const blocks: Block[] = [];
  let prose = "";
  let index = 0;

  const flushProse = () => {
    if (prose.trim()) {
      blocks.push(...parseProse(prose));
    }
    prose = "";
  };

  while (index < text.length) {
    if (text.startsWith("<!--", index)) {
      flushProse();
      const end = text.indexOf("-->", index + 4);
      const raw = end === -1 ? text.slice(index + 4) : text.slice(index + 4, end);
      const note = raw.trim().replace(/^VERIFY:\s*/, "");
      if (note) {
        blocks.push({ type: "note", inlines: parseInline(note) });
      }
      index = end === -1 ? text.length : end + 3;
      continue;
    }

    if (text.startsWith("```", index)) {
      flushProse();
      const languageEnd = text.indexOf("\n", index + 3);
      const language = (languageEnd === -1 ? text.slice(index + 3) : text.slice(index + 3, languageEnd)).trim();
      const codeStart = languageEnd === -1 ? text.length : languageEnd + 1;
      const close = text.indexOf("```", codeStart);
      const code = close === -1 ? text.slice(codeStart) : text.slice(codeStart, close);
      blocks.push({ type: "code", language, code: code.replace(/\n$/, "") });
      index = close === -1 ? text.length : close + 3;
      continue;
    }

    prose += text[index];
    index += 1;
  }

  flushProse();
  return blocks;
}

function parseProse(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split("\n");
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    const value = paragraph.join(" ").trim();
    paragraph = [];
    if (value) {
      blocks.push({ type: "paragraph", inlines: parseInline(value) });
    }
  };

  const flushList = () => {
    if (!list) {
      return;
    }
    blocks.push({
      type: "list",
      ordered: list.ordered,
      items: list.items.map((item) => parseInline(item)),
    });
    list = null;
  };

  for (const line of lines) {
    const unordered = /^- (.*)$/.exec(line);
    const ordered = /^\d+\. (.*)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const nextOrdered = Boolean(ordered);
      const item = (unordered ?? ordered)?.[1] ?? "";
      if (!list || list.ordered !== nextOrdered) {
        flushList();
        list = { ordered: nextOrdered, items: [] };
      }
      list.items.push(item);
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

function parseInline(input: string): Inline[] {
  const inlines: Inline[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (const match of input.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) {
      inlines.push(...linkify(input.slice(last, start)));
    }
    if (match[1] != null) {
      inlines.push({ type: "code", value: match[1] });
    } else if (match[2] != null) {
      inlines.push({ type: "strong", value: match[2] });
    } else if (match[3] != null) {
      inlines.push({ type: "em", value: match[3] });
    }
    last = start + match[0].length;
  }
  if (last < input.length) {
    inlines.push(...linkify(input.slice(last)));
  }
  return inlines;
}

function linkify(text: string): Inline[] {
  const inlines: Inline[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const raw = match[0];
    const trimmed = raw.replace(/[.,;:)]+$/, "");
    const tail = raw.slice(trimmed.length);
    if (start > last) {
      inlines.push({ type: "text", value: text.slice(last, start) });
    }
    inlines.push({ type: "link", href: trimmed, value: trimmed });
    if (tail) {
      inlines.push({ type: "text", value: tail });
    }
    last = start + raw.length;
  }
  if (last < text.length) {
    inlines.push({ type: "text", value: text.slice(last) });
  }
  return inlines;
}

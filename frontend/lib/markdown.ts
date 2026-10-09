export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "del"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; href: string; value: string };

export type ListItem = {
  checked: boolean | null;
  inlines: Inline[];
};

export type TableAlign = "left" | "center" | "right";

export type Block =
  | { type: "paragraph"; inlines: Inline[] }
  | { type: "list"; ordered: boolean; items: ListItem[] }
  | { type: "table"; headers: Inline[][]; aligns: TableAlign[]; rows: Inline[][][] }
  | { type: "code"; language: string; code: string }
  | { type: "note"; inlines: Inline[] };

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

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
  let list: { ordered: boolean; items: ListItem[] } | null = null;

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
    blocks.push({ type: "list", ordered: list.ordered, items: list.items });
    list = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1];
    if (next && isTableRow(line) && isTableSeparator(next)) {
      flushParagraph();
      flushList();
      const headers = splitRow(line).map((cell) => parseInline(cell));
      const aligns = splitRow(next).map(tableAlign);
      const rows: Inline[][][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim() !== "" && isTableRow(lines[index])) {
        const cells = splitRow(lines[index]).map((cell) => parseInline(cell));
        while (cells.length < headers.length) {
          cells.push([]);
        }
        rows.push(cells.slice(0, Math.max(headers.length, cells.length)));
        index += 1;
      }
      index -= 1;
      blocks.push({ type: "table", headers, aligns, rows });
      continue;
    }

    const task = /^- \[([ xX])\] (.*)$/.exec(line);
    const unordered = task ? null : /^- (.*)$/.exec(line);
    const ordered = /^\d+\. (.*)$/.exec(line);
    if (task || unordered || ordered) {
      flushParagraph();
      const nextOrdered = Boolean(ordered);
      if (!list || list.ordered !== nextOrdered) {
        flushList();
        list = { ordered: nextOrdered, items: [] };
      }
      const text = task?.[2] ?? unordered?.[1] ?? ordered?.[1] ?? "";
      list.items.push({
        checked: task ? task[1].toLowerCase() === "x" : null,
        inlines: parseInline(text),
      });
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

function isTableRow(line: string): boolean {
  // GFM: una fila con una sola celda (`| 1 |`) sigue dentro de la tabla.
  return line.includes("|") && splitRow(line).length >= 1;
}

function isTableSeparator(line: string): boolean {
  const cells = splitRow(line);
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitRow(line: string): string[] {
  let text = line.trim();
  if (text.startsWith("|")) {
    text = text.slice(1);
  }
  if (text.endsWith("|")) {
    text = text.slice(0, -1);
  }
  const cells: string[] = [];
  let current = "";
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\\" && text[index + 1] === "|") {
      current += "|";
      index += 1;
      continue;
    }
    if (text[index] === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += text[index];
  }
  cells.push(current.trim());
  return cells;
}

function tableAlign(cell: string): TableAlign {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) {
    return "center";
  }
  if (right) {
    return "right";
  }
  return "left";
}

function parseInline(input: string): Inline[] {
  const inlines: Inline[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*]+)\*|<(https?:\/\/[^>\s]+)>|<([^>\s]+@[^>\s]+)>/g;
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
      inlines.push({ type: "del", value: match[3] });
    } else if (match[4] != null) {
      inlines.push({ type: "em", value: match[4] });
    } else if (match[5] != null) {
      inlines.push({ type: "link", href: match[5], value: match[5] });
    } else if (match[6] != null) {
      inlines.push({ type: "link", href: `mailto:${match[6]}`, value: match[6] });
    }
    last = start + match[0].length;
  }
  if (last < input.length) {
    inlines.push(...linkify(input.slice(last)));
  }
  return inlines;
}

function linkHref(value: string): string {
  if (value.startsWith("www.")) {
    return `https://${value}`;
  }
  if (value.includes("@") && !value.includes("://")) {
    return `mailto:${value}`;
  }
  return value;
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
    inlines.push({ type: "link", href: linkHref(trimmed), value: trimmed });
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

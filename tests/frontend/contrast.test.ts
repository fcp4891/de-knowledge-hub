import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";

import { loadTsx } from "./load-tsx.ts";

const ROOT = join(import.meta.dirname, "../..");
const FRONTEND = join(ROOT, "frontend");
const MIN = 4.5;

type Tokens = Record<string, string>;

function declarations(block: string): Tokens {
  return Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

function themeTokens(): { light: Tokens; dark: Tokens } {
  const css = readFileSync(join(FRONTEND, "styles/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const light = declarations(/:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "");
  const dark = { ...light, ...declarations(/@media \(prefers-color-scheme: dark\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "") };
  return { light, dark };
}

function resolve(value: string, tokens: Tokens, depth = 0): string | null {
  const v = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(v)) {
    return v;
  }
  if (v === "white") return "#ffffff";
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(v);
  if (ref && depth < 5 && tokens[ref[1]]) {
    return resolve(tokens[ref[1]], tokens, depth + 1);
  }
  return null;   // color-mix, gradientes y demás: fuera del cálculo
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (["node_modules", ".next", "out"].includes(name)) return [];
    if (statSync(path).isDirectory()) return cssFiles(path);
    return name.endsWith(".css") ? [path] : [];
  });
}

type Rule = { file: string; selector: string; color?: string; background?: string };

function rules(): Rule[] {
  return cssFiles(FRONTEND).flatMap((file) => {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((m) => {
      const body = m[2];
      const color = /(?:^|[;\s])color:\s*([^;]+);/.exec(body)?.[1]?.trim();
      const background = /background(?:-color)?:\s*([^;]+);/.exec(body)?.[1]?.trim();
      return m[1].split(",").map((selector) => ({ file: relative(ROOT, file), selector: selector.trim(), color, background }));
    });
  });
}

/** Texto sobre contenedores con fondo --accent o --ink: el contenedor y sus descendientes (anidados o con su prefijo). */
export function contrastFailures(): string[] {
  const { light, dark } = themeTokens();
  const all = rules();
  const containers = all.filter((r) => r.background === "var(--accent)" || r.background === "var(--ink)");
  const failures: string[] = [];
  for (const box of containers) {
    // Hijos por prefijo solo si el contenedor es una clase compuesta (.route-next → .route-next-kicker).
    const block = /^\.[a-z0-9]+-[a-z0-9-]+$/.test(box.selector) ? box.selector : null;
    const inner = all.filter(
      (r) => r === box || r.selector.startsWith(`${box.selector} `) || (block !== null && r.selector.startsWith(`${block}-`)),
    );
    for (const rule of inner) {
      if (!rule.color) continue;
      for (const [theme, tokens] of [["claro", light], ["oscuro", dark]] as const) {
        const fg = resolve(rule.color, tokens);
        const bg = resolve(rule.background ?? box.background ?? "", tokens);
        if (!fg || !bg) continue;
        const ratio = contrast(fg, bg);
        if (ratio < MIN) {
          failures.push(`${rule.file}: ${rule.selector} en ${theme}: ${ratio.toFixed(2)}:1`);
        }
      }
    }
  }
  return [...new Set(failures)];
}

test("todo texto sobre --accent o --ink, y en sus descendientes, llega a 4,5:1 en claro y oscuro (todos los CSS)", () => {
  assert.deepEqual(contrastFailures(), []);
});

test("cubre la tarjeta «Siguiente paso» y el enlace de salto", () => {
  const { light, dark } = themeTokens();
  const all = rules();
  const pairs: [string, string, string][] = [
    [".route-next-kicker", ".route-next-kicker", ".route-next"],
    [".route-next p", ".route-next p", ".route-next"],
    [".route-next-action", ".route-next-action", ".route-next-action"],
    [".skip-link", ".skip-link", ".skip-link"],
  ];
  for (const [name, textSel, bgSel] of pairs) {
    const text = all.find((r) => r.selector === textSel && r.color);
    const box = all.find((r) => r.selector === bgSel && r.background);
    assert.ok(text?.color && box?.background, name);
    for (const tokens of [light, dark]) {
      const ratio = contrast(resolve(text.color, tokens)!, resolve(box.background, tokens)!);
      assert.ok(ratio >= MIN, `${name}: ${ratio.toFixed(2)}:1`);
    }
  }
});

test("B-N5: una sección mayor que 22 (anexo) no borra lo ya visto", () => {
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
  };
  try {
    const progress = loadTsx(join(FRONTEND, "lib/readingProgress.ts"));
    progress.markSectionSeen("chile-data-protection", 1, "Propósito");
    progress.markSectionSeen("chile-data-protection", 16.5, "Sanciones");
    assert.deepEqual(progress.markSectionSeen("chile-data-protection", 23, "Anexo"), [1, 16.5]);
    assert.deepEqual(progress.readReadingProgress("chile-data-protection").seen, [1, 16.5]);
  } finally {
    delete (globalThis as { window?: unknown }).window;
  }
  const reading = readFileSync(join(FRONTEND, "components/card/ConceptReading.tsx"), "utf8");
  assert.match(reading, /if \(seenNow\.length > 0\) \{\n\s+setSeen\(new Set\(seenNow\)\);/);
});

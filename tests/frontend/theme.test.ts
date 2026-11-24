import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import vm from "node:vm";

import {
  nextTheme,
  readStoredTheme,
  resetThemeFallback,
  resolveTheme,
  THEME_BOOT_SCRIPT,
  THEME_KEY,
  themeLabel,
  writeStoredTheme,
} from "../../frontend/lib/theme.ts";

const ROOT = join(import.meta.dirname, "../..");

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem(key: string) {
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function declarations(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

test("sin preferencia guardada manda el sistema", () => {
  resetThemeFallback();
  assert.equal(readStoredTheme(memoryStorage()), null);
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme(null, true), "dark");
});

test("la preferencia guardada manda sobre el sistema", () => {
  resetThemeFallback();
  const storage = memoryStorage();
  assert.equal(writeStoredTheme(storage, "dark"), true);
  assert.equal(readStoredTheme(storage), "dark");
  assert.equal(resolveTheme("dark", false), "dark");
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(storage.data[THEME_KEY], "dark");
});

test("almacenamiento bloqueado no lanza y conserva la elección en la pestaña", () => {
  resetThemeFallback();
  const blocked = {
    getItem(): string | null {
      throw new Error("blocked");
    },
    setItem(): void {
      throw new Error("blocked");
    },
  };
  assert.equal(readStoredTheme(blocked), null);
  assert.equal(writeStoredTheme(blocked, "dark"), false);
  assert.equal(readStoredTheme(blocked), "dark");
  assert.equal(resolveTheme(readStoredTheme(blocked), false), "dark");
  resetThemeFallback();
});

test("el botón alterna dos estados y nombra la acción en español", () => {
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("dark"), "light");
  assert.equal(themeLabel("light"), "Cambiar a tema oscuro");
  assert.equal(themeLabel("dark"), "Cambiar a tema claro");
});

test("el script del head fija el atributo antes de pintar y aguanta el almacenamiento bloqueado", () => {
  const layout = readFileSync(join(ROOT, "frontend/app/layout.tsx"), "utf8");
  const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
  assert.match(head, /THEME_BOOT_SCRIPT/);
  assert.match(THEME_BOOT_SCRIPT, /try\{/);
  assert.match(THEME_BOOT_SCRIPT, /catch\(e\)\{\}/);

  function boot(storage: { getItem(key: string): string | null }) {
    const marks: string[] = [];
    const element: { theme: string | null } = { theme: null };
    const context = {
      localStorage: storage,
      document: {
        documentElement: {
          setAttribute(name: string, value: string) {
            if (name === "data-theme") element.theme = value;
          },
        },
      },
      performance: { mark(name: string) { marks.push(name); } },
    };
    vm.runInNewContext(THEME_BOOT_SCRIPT, context);
    return { element, marks };
  }

  const saved = boot({
    getItem(key: string) {
      return key === THEME_KEY ? "dark" : null;
    },
  });
  assert.equal(saved.element.theme, "dark");
  assert.deepEqual(saved.marks, ["dekh-theme"]);

  const system = boot({
    getItem() {
      return null;
    },
  });
  assert.equal(system.element.theme, null);

  const blocked = boot({
    getItem() {
      throw new Error("blocked");
    },
  });
  assert.equal(blocked.element.theme, null);
  assert.deepEqual(blocked.marks, ["dekh-theme"]);
});

test("el tema forzado repite los tokens oscuros y el contraste de texto sigue en 4,5:1", () => {
  const tokens = readFileSync(join(ROOT, "frontend/styles/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const media = declarations(/@media \(prefers-color-scheme: dark\)\s*\{([\s\S]*?)\n\}/.exec(tokens)?.[1] ?? "");
  const forced = declarations(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/.exec(tokens)?.[1] ?? "");
  for (const [name, value] of Object.entries(media)) {
    assert.equal(forced[name], value, name);
  }
  for (const set of [media, forced]) {
    const ratio = contrast(set["--ink"], set["--bg"]);
    assert.ok(ratio >= 4.5, `ink/bg ${ratio}`);
    const accent = contrast(set["--on-accent"], set["--accent"]);
    assert.ok(accent >= 4.5, `on-accent ${accent}`);
  }
  const toggle = readFileSync(join(ROOT, "frontend/app/globals.css"), "utf8");
  const rule = /\.theme-toggle\s*\{([^}]+)\}/.exec(toggle)?.[1] ?? "";
  assert.match(rule, /color:\s*var\(--ink\)/);
  assert.match(rule, /background:\s*var\(--surface\)/);
  assert.equal(/#[0-9a-f]{3,8}/i.test(rule), false);
});

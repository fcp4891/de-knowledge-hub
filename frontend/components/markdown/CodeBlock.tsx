"use client";

import { useEffect, useState } from "react";
import type { LanguageFn } from "highlight.js";

import "highlight.js/styles/github.css";

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

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const normalized = LANGUAGE_ALIAS[language.toLowerCase()] ?? language.toLowerCase();

  useEffect(() => {
    const load = LANGUAGE_LOADERS[normalized];
    if (!load) {
      return;
    }
    let cancelled = false;
    void (async () => {
      const [{ default: hljs }, languageModule] = await Promise.all([
        import("highlight.js/lib/core"),
        load(),
      ]);
      hljs.registerLanguage(normalized, languageModule.default);
      const highlighted = hljs.highlight(code, { language: normalized }).value;
      if (!cancelled) {
        setHtml(highlighted);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, normalized]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <button type="button" onClick={() => void copy()}>
        {copied ? "Copiado" : "Copiar"}
      </button>
      <pre>
        {html ? (
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}

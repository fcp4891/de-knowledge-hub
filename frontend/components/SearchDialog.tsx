"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import type { ApiResult, SearchResults } from "@/lib/api/types";
import { resultHref } from "@/lib/entityHref";
import { RESULT_LABEL } from "@/lib/labels";

const DEBOUNCE_MS = 250;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<ApiResult<SearchResults> | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open || debounced.length < 2) {
      setResult(null);
      setPending(false);
      return;
    }
    const controller = new AbortController();
    setPending(true);
    void fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then(async (response) => (await response.json()) as ApiResult<SearchResults>)
      .then((payload) => {
        setResult(payload);
        setPending(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResult({ ok: false, reason: "unavailable", detail: "No se pudo contactar la API." });
        setPending(false);
      });
    return () => controller.abort();
  }, [debounced, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const groups = result?.ok ? result.data.groups.filter((group) => group.items.length > 0) : [];

  return (
    <div className="search-backdrop" onClick={onClose}>
      <div
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>Buscar</h2>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Al menos 2 caracteres"
          aria-label="Consulta"
        />
        {debounced.length < 2 ? <p className="muted">Escribe al menos 2 caracteres.</p> : null}
        {pending ? <p className="muted">Buscando…</p> : null}
        {result && !result.ok ? <p role="status">{result.detail ?? "No se pudo buscar."}</p> : null}
        {result?.ok && groups.length === 0 && !pending ? <p className="muted">Sin resultados.</p> : null}
        {result?.ok
          ? groups.map((group) => (
              <section key={group.type}>
                <h3>{RESULT_LABEL[group.type]}</h3>
                <ul className="stack">
                  {group.items.map((item) => {
                    const href = resultHref(item.type, item.slug);
                    return (
                      <li key={`${item.type}-${item.slug}`}>
                        {href ? (
                          <Link href={href} onClick={onClose}>
                            {item.title}
                          </Link>
                        ) : (
                          <span>{item.title}</span>
                        )}
                        <p className="meta">
                          {item.classification ? (
                            <span className={`badge classification-${item.classification}`}>{item.classification}</span>
                          ) : null}
                          {item.has_page === false ? <span className="badge">ficha pendiente</span> : null}
                        </p>
                        {item.snippet ? <p className="muted">{item.snippet}</p> : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          : null}
      </div>
    </div>
  );
}

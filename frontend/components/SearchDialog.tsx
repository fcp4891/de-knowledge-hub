"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { ApiResult, SearchResults } from "@/lib/api/types";
import { searchLocal } from "@/lib/browserSearch";
import { resultHref } from "@/lib/entityHref";
import { RESULT_LABEL } from "@/lib/labels";

const DEBOUNCE_MS = 250;

function filterSearchDomain(result: ApiResult<SearchResults>, domain: string): ApiResult<SearchResults> {
  if (!result.ok) {
    return result;
  }
  const groups = result.data.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.domain === domain),
    }))
    .filter((group) => group.items.length > 0);
  const total = groups.reduce((count, group) => count + group.items.length, 0);
  return { ok: true, data: { ...result.data, groups, total } };
}

export function SearchDialog({
  open,
  onClose,
  domain,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  domain?: string;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
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
    const params = new URLSearchParams({ q: debounced });
    if (domain) {
      params.set("domain", domain);
    }
    const request =
      process.env.NEXT_PUBLIC_API_MODE === "static"
        ? searchLocal(debounced).then((payload) => (domain ? filterSearchDomain(payload, domain) : payload))
        : fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/search?${params.toString()}`, {
            signal: controller.signal,
          }).then(async (response) => {
            if (!response.ok) {
              return { ok: false as const, reason: "unavailable" as const, detail: "No se pudo contactar la API." };
            }
            return { ok: true as const, data: (await response.json()) as SearchResults };
          });
    void request
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
  }, [debounced, domain, open]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const back = returnFocusRef?.current ?? null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.setTimeout(() => back?.focus(), 0);
    };
  }, [open, returnFocusRef]);

  function trapTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])")];
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!open) {
    return null;
  }

  const groups = result?.ok ? result.data.groups.filter((group) => group.items.length > 0) : [];

  return (
    <div className="search-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapTab}
      >
        <h2 id={titleId}>{domain ? "Buscar en este dominio" : "Buscar"}</h2>
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

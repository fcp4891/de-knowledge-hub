"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Cloud, Language, SnippetSummary } from "@/lib/api/types";
import { CLOUD_LABEL, LANGUAGE_LABEL, VERIFICATION_LABEL } from "@/lib/labels";

const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Language[];
const CLOUDS = Object.keys(CLOUD_LABEL) as Cloud[];
const PAGE_SIZE = 50;

function isLanguage(value: string | null): value is Language {
  return LANGUAGES.some((language) => language === value);
}

function isCloud(value: string | null): value is Cloud {
  return CLOUDS.some((cloud) => cloud === value);
}

function pageHref(filters: { language?: Language; cloud?: Cloud; implements?: string }, offset: number): string {
  const params = new URLSearchParams();
  if (filters.language) {
    params.set("language", filters.language);
  }
  if (filters.cloud) {
    params.set("cloud", filters.cloud);
  }
  if (filters.implements) {
    params.set("implements", filters.implements);
  }
  if (offset > 0) {
    params.set("offset", String(offset));
  }
  const query = params.toString();
  return query ? `/snippets?${query}` : "/snippets";
}

export function SnippetBrowser({ snippets }: { snippets: SnippetSummary[] }) {
  const params = useSearchParams();
  const languageParam = params.get("language");
  const cloudParam = params.get("cloud");
  const language = isLanguage(languageParam) ? languageParam : undefined;
  const cloud = isCloud(cloudParam) ? cloudParam : undefined;
  const implemented = params.get("implements")?.trim() || undefined;
  const parsedOffset = Number(params.get("offset"));
  const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? Math.floor(parsedOffset) : 0;
  const filters = { language, cloud, implements: implemented };
  const matched = snippets.filter((snippet) => {
    if (filters.language && snippet.language !== filters.language) {
      return false;
    }
    if (filters.cloud && !snippet.cloud.includes(filters.cloud)) {
      return false;
    }
    if (filters.implements && !snippet.implements.includes(filters.implements)) {
      return false;
    }
    return true;
  });
  const page = matched.slice(offset, offset + PAGE_SIZE);
  const hasFilters = Boolean(filters.language || filters.cloud || filters.implements);

  return (
    <>
      <form className="filters" method="get">
        <label>
          Lenguaje
          <select name="language" defaultValue={filters.language ?? ""}>
            <option value="">Todos</option>
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {LANGUAGE_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cloud
          <select name="cloud" defaultValue={filters.cloud ?? ""}>
            <option value="">Todos</option>
            {CLOUDS.map((item) => (
              <option key={item} value={item}>
                {CLOUD_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Implementa
          <input name="implements" defaultValue={filters.implements ?? ""} placeholder="slug del concepto" />
        </label>
        <button type="submit">Filtrar</button>
        {hasFilters ? <Link href="/snippets">Quitar filtros</Link> : null}
      </form>
      {page.length === 0 ? (
        <p className="muted">Ningún snippet coincide con esos filtros.</p>
      ) : (
        <>
          <div className="domain-list">
            {page.map((snippet) => (
              <article key={snippet.slug} className="panel">
                <h2>
                  <Link href={`/snippets/${snippet.slug}`}>{snippet.title}</Link>
                </h2>
                <p>{snippet.description}</p>
                <p className="meta">
                  <span>{LANGUAGE_LABEL[snippet.language]}</span>
                  {snippet.dialect ? <span>{snippet.dialect}</span> : null}
                  {snippet.cloud.map((item) => (
                    <span key={item}>{CLOUD_LABEL[item]}</span>
                  ))}
                  <span className={snippet.verification_status === "review_required" ? "badge badge-alert" : undefined}>
                    {VERIFICATION_LABEL[snippet.verification_status]}
                  </span>
                </p>
                {snippet.implements.length > 0 ? (
                  <p className="meta">
                    {snippet.implements.map((slug) => (
                      <Link key={slug} href={`/concepts/${slug}`}>
                        {slug}
                      </Link>
                    ))}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          {offset > 0 || offset + PAGE_SIZE < matched.length ? (
            <p className="meta">
              {offset > 0 ? <Link href={pageHref(filters, Math.max(0, offset - PAGE_SIZE))}>Anterior</Link> : null}
              <span>
                {offset + 1}–{Math.min(offset + page.length, matched.length)} de {matched.length}
              </span>
              {offset + PAGE_SIZE < matched.length ? (
                <Link href={pageHref(filters, offset + PAGE_SIZE)}>Siguiente</Link>
              ) : null}
            </p>
          ) : null}
        </>
      )}
    </>
  );
}

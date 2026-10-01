import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import { listSnippets } from "@/lib/api/client";
import type { Cloud, Language } from "@/lib/api/types";
import { CLOUD_LABEL, LANGUAGE_LABEL, VERIFICATION_LABEL } from "@/lib/labels";

const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Language[];
const CLOUDS = Object.keys(CLOUD_LABEL) as Cloud[];

function isLanguage(value: string | undefined): value is Language {
  return LANGUAGES.some((language) => language === value);
}

function isCloud(value: string | undefined): value is Cloud {
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

export default async function SnippetsPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; cloud?: string; implements?: string; offset?: string }>;
}) {
  const params = await searchParams;
  const language = isLanguage(params.language) ? params.language : undefined;
  const cloud = isCloud(params.cloud) ? params.cloud : undefined;
  const implemented = params.implements?.trim() || undefined;
  const parsedOffset = Number(params.offset);
  const offset = Number.isFinite(parsedOffset) && parsedOffset > 0 ? Math.floor(parsedOffset) : 0;
  const filters = { language, cloud, implements: implemented };
  const result = await listSnippets({ ...filters, offset });
  const hasFilters = Boolean(language || cloud || implemented);

  return (
    <div className="page">
      <h1>Snippets</h1>
      <p className="lead">Código de la Code Library, con el concepto que implementa.</p>
      <form className="filters" method="get">
        <label>
          Lenguaje
          <select name="language" defaultValue={language ?? ""}>
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
          <select name="cloud" defaultValue={cloud ?? ""}>
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
          <input name="implements" defaultValue={implemented ?? ""} placeholder="slug del concepto" />
        </label>
        <button type="submit">Filtrar</button>
        {hasFilters ? <Link href="/snippets">Quitar filtros</Link> : null}
      </form>
      {result.ok ? (
        result.data.items.length === 0 ? (
          <p className="muted">Ningún snippet coincide con esos filtros.</p>
        ) : (
          <>
            <div className="domain-list">
              {result.data.items.map((snippet) => (
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
            {result.data.offset > 0 || result.data.offset + result.data.limit < result.data.total ? (
              <p className="meta">
                {result.data.offset > 0 ? (
                  <Link href={pageHref(filters, Math.max(0, result.data.offset - result.data.limit))}>Anterior</Link>
                ) : null}
                <span>
                  {result.data.offset + 1}–{Math.min(result.data.offset + result.data.items.length, result.data.total)} de{" "}
                  {result.data.total}
                </span>
                {result.data.offset + result.data.limit < result.data.total ? (
                  <Link href={pageHref(filters, result.data.offset + result.data.limit)}>Siguiente</Link>
                ) : null}
              </p>
            ) : null}
          </>
        )
      ) : (
        <ApiFailure result={result} />
      )}
    </div>
  );
}

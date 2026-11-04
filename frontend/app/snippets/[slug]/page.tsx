import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import { CardHeader } from "@/components/card/CardHeader";
import { SnippetBody } from "@/components/card/SnippetBody";
import { SourceList } from "@/components/card/SourceList";
import { getRelations, getSnippet } from "@/lib/api/client";
import { loadConceptRefs } from "@/lib/loadConceptRefs";
import type { RelationGroups } from "@/lib/api/types";
import { ConstructionBanner } from "@/components/ConstructionBanner";
import { conceptInline } from "@/lib/conceptNames";
import { CLOUD_LABEL, LANGUAGE_LABEL } from "@/lib/labels";
import { CONSTRUCTION_MARK, snippetListed, scopeFromConcepts } from "@/lib/publishedScope";
import { staticSlugs } from "@/lib/staticParams";

// El build estático cambia este literal a false: Next solo acepta true o false.
export const dynamicParams = true;
// no-store en la API: en hybrid la página se arma en cada pedido.
// El build estático quita esta línea (output: export no admite force-dynamic).
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticSlugs("snippets.json");
}

function implementedConcepts(slugs: string[], relations: RelationGroups | null) {
  const titles = new Map<string, string>();
  if (relations) {
    for (const group of relations.groups) {
      if (group.type !== "IMPLEMENTS" || group.direction === "incoming") {
        continue;
      }
      for (const item of group.items) {
        titles.set(item.slug, item.title);
      }
    }
  }
  return slugs.map((slug) => ({ slug, title: titles.get(slug) ?? slug }));
}

export default async function SnippetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [snippet, relations, conceptRefs] = await Promise.all([
    getSnippet(slug),
    getRelations(slug),
    loadConceptRefs(),
  ]);

  if (!snippet.ok) {
    return (
      <div className="page">
        <ApiFailure result={snippet} slug={slug} />
      </div>
    );
  }

  const data = snippet.data;
  const concepts = implementedConcepts(data.implements, relations.ok ? relations.data : null);
  const scope = scopeFromConcepts(
    Object.entries(conceptRefs).map(([conceptSlug, ref]) => ({ slug: conceptSlug, domain: ref.domain ?? "" })),
  );

  return (
    <div className="page">
      {snippetListed(data.implements, scope) ? null : <ConstructionBanner />}
      <CardHeader
        title={data.title}
        description={data.description}
        classification={data.classification}
        level={data.level}
        mvp={false}
        lastVerified={data.last_verified}
        verificationStatus={data.verification_status}
        backHref="/snippets"
        backLabel="Volver a snippets"
      />
      <p className="meta">
        <span>{LANGUAGE_LABEL[data.language]}</span>
        {data.dialect ? <span>{data.dialect}</span> : null}
        {data.cloud.map((cloud) => (
          <span key={cloud}>{CLOUD_LABEL[cloud]}</span>
        ))}
      </p>
      <div className="sections">
        <section className="panel">
          <h2>Requisitos</h2>
          {data.requirements.length === 0 ? (
            <p className="muted">Sin requisitos declarados.</p>
          ) : (
            <ul>
              {data.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <h2>Conceptos implementados</h2>
          {concepts.length === 0 ? (
            <p className="muted">No declara conceptos.</p>
          ) : (
            <ul className="stack">
              {concepts.map((concept) => {
                const named = conceptInline(concept.slug, conceptRefs);
                return (
                  <li key={concept.slug}>
                    {named.kind === "link" ? (
                      <Link href={`/concepts/${concept.slug}`}>{concept.title}</Link>
                    ) : (
                      <span>
                        {concept.title}
                        {named.kind === "construction" ? (
                          <>
                            {" "}
                            <span className="ficha-construction-mark">{CONSTRUCTION_MARK}</span>
                          </>
                        ) : null}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <SnippetBody
          sections={data.sections.filter((section) => section.key !== "sources" || data.sources.length === 0)}
          conceptRefs={conceptRefs}
        />
        {data.sources.length > 0 ? <SourceList sources={data.sources} /> : null}
      </div>
    </div>
  );
}

import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import { listAllConcepts, listDomains } from "@/lib/api/client";

export default async function ExplorerPage() {
  const [domains, concepts] = await Promise.all([listDomains(), listAllConcepts()]);
  const withPage = new Map<string, number>();
  if (concepts.ok) {
    for (const concept of concepts.data) {
      if (concept.has_page) {
        withPage.set(concept.domain, (withPage.get(concept.domain) ?? 0) + 1);
      }
    }
  }

  return (
    <div className="page">
      <h1>Explorer</h1>
      <p className="lead">Dominios del blueprint. Entra a uno para ver subdominios y conceptos.</p>
      {domains.ok ? (
        <div className="domain-list">
          {domains.data.items.map((domain) => (
            <article key={domain.slug} className="panel">
              <h2>
                <Link href={`/explorer/${domain.slug}`}>
                  {domain.id} · {domain.title}
                </Link>
              </h2>
              <p>{domain.description}</p>
              <p className="meta">
                <span>
                  {concepts.ok
                    ? `${withPage.get(domain.slug) ?? 0} de ${domain.concept_count} con ficha`
                    : `${domain.concept_count} conceptos`}
                </span>
                <span>{domain.mvp_count} MVP</span>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <ApiFailure result={domains} />
      )}
      {domains.ok && !concepts.ok ? <ApiFailure result={concepts} /> : null}
    </div>
  );
}

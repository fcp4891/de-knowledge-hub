import Link from "next/link";

import { MockMiss } from "@/components/MockMiss";
import { listDomains } from "@/lib/api/client";

export default async function ExplorerPage() {
  const domains = await listDomains();

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
                <span>{domain.concept_count} conceptos</span>
                <span>{domain.mvp_count} MVP</span>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <MockMiss />
      )}
    </div>
  );
}

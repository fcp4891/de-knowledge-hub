import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import { listAllConcepts, listDomains } from "@/lib/api/client";
import type { DomainSummary } from "@/lib/api/types";
import { LAYERS, SHORT_NAMES } from "@/lib/learning-paths";
import {
  BAND_LABEL,
  CONSTRUCTION_LAYER,
  isDomainPublished,
  layerIsClosed,
} from "@/lib/publishedScope";

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
  const items = domains.ok ? domains.data.items : [];
  const byId = new Map(items.map((domain) => [domain.id, domain]));
  const placed = new Set<string>(LAYERS.flatMap((layer) => layer.domains));
  const special = items.filter((domain) => domain.band === "especializacion");
  for (const domain of special) {
    placed.add(domain.id);
  }
  const rest = items.filter((domain) => !placed.has(domain.id));

  return (
    <div className="page">
      <h1>Rutas</h1>
      <p className="lead">La banda publicada se recorre por sus estaciones. El resto se está escribiendo.</p>
      {domains.ok ? (
        <div>
          {special.length > 0 ? (
            <LayerBlock
              name={BAND_LABEL}
              closed={special.every((domain) => !isDomainPublished(domain))}
              domains={special}
              withPage={withPage}
              conceptsOk={concepts.ok}
            />
          ) : null}
          {LAYERS.map((layer) => (
            <LayerBlock
              key={layer.key}
              name={layer.name}
              closed={layerIsClosed(layer.domains)}
              domains={layer.domains.map((id) => byId.get(id) ?? null)}
              withPage={withPage}
              conceptsOk={concepts.ok}
            />
          ))}
          {rest.length > 0 ? (
            <LayerBlock
              name="Otras estaciones"
              closed={rest.every((domain) => !isDomainPublished(domain))}
              domains={rest}
              withPage={withPage}
              conceptsOk={concepts.ok}
            />
          ) : null}
        </div>
      ) : (
        <ApiFailure result={domains} />
      )}
      {domains.ok && !concepts.ok ? <ApiFailure result={concepts} /> : null}
    </div>
  );
}

function LayerBlock({
  name,
  closed,
  domains,
  withPage,
  conceptsOk,
}: {
  name: string;
  closed: boolean;
  domains: (DomainSummary | null)[];
  withPage: Map<string, number>;
  conceptsOk: boolean;
}) {
  return (
    <section className="scope-layer" data-published={closed ? "false" : "true"}>
      <h2 className="scope-layer-name">{name}</h2>
      {closed ? <p className="scope-layer-note">{CONSTRUCTION_LAYER}</p> : null}
      <ul className="scope-stations">
        {domains.map((domain) => {
          if (!domain) {
            return null;
          }
          const open = isDomainPublished(domain);
          const label = `${domain.id} · ${SHORT_NAMES[domain.id] ?? domain.title}`;
          const count = conceptsOk ? `${withPage.get(domain.slug) ?? 0} de ${domain.concept_count} con ficha` : `${domain.concept_count} conceptos`;
          return (
            <li key={domain.slug}>
              {open ? (
                <Link className="scope-station" href={`/explorer/${domain.slug}`}>
                  {label}
                </Link>
              ) : (
                <span className="scope-station">{label}</span>
              )}
              <p className="meta">{count}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from "next/link";

import { ApiFailure } from "@/components/ApiFailure";
import { ConceptMeta } from "@/components/ConceptMeta";
import { getDomain, listAllConcepts } from "@/lib/api/client";
import type { Classification, ConceptSummary, Level } from "@/lib/api/types";

const CLASSIFICATIONS: Classification[] = ["core", "modern", "emerging"];
const LEVELS: Level[] = ["basic", "intermediate", "advanced"];

type Filters = {
  classification?: string;
  level?: string;
  mvp?: string;
  ficha?: string;
};

export default async function DomainPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Filters>;
}) {
  const { slug } = await params;
  const filters = await searchParams;
  const domain = await getDomain(slug);

  if (!domain.ok) {
    return (
      <div className="page">
        <ApiFailure result={domain} slug={slug} />
      </div>
    );
  }

  const classification = CLASSIFICATIONS.find((value) => value === filters.classification);
  const level = LEVELS.find((value) => value === filters.level);
  const mvp = filters.mvp === "true" ? true : filters.mvp === "false" ? false : undefined;
  const hasPage = filters.ficha === "true" ? true : filters.ficha === "false" ? false : undefined;
  const listed = hasPage === undefined ? null : await listAllConcepts({ domain: slug, hasPage });
  const allowed =
    listed === null ? undefined : new Set(listed.ok ? listed.data.map((concept) => concept.slug) : []);
  const withPage = domain.data.subdomains.reduce(
    (count, subdomain) => count + subdomain.concepts.filter((concept) => concept.has_page).length,
    0,
  );
  const visible = domain.data.subdomains.some((subdomain) =>
    subdomain.concepts.some((concept) => matches(concept, classification, level, mvp, allowed)),
  );

  return (
    <div className="page">
      <h1>
        {domain.data.id} · {domain.data.title}
      </h1>
      <p className="meta">
        <span>
          {withPage} de {domain.data.concept_count} con ficha
        </span>
      </p>
      <p className="lead">{domain.data.description}</p>
      <form className="filters" method="get">
        <label>
          Clasificación
          <select name="classification" defaultValue={classification ?? ""}>
            <option value="">Todas</option>
            {CLASSIFICATIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nivel
          <select name="level" defaultValue={level ?? ""}>
            <option value="">Todos</option>
            <option value="basic">básico</option>
            <option value="intermediate">intermedio</option>
            <option value="advanced">avanzado</option>
          </select>
        </label>
        <label>
          MVP
          <select name="mvp" defaultValue={mvp === undefined ? "" : String(mvp)}>
            <option value="">Todos</option>
            <option value="true">Solo MVP</option>
            <option value="false">Sin marca MVP</option>
          </select>
        </label>
        <label>
          Contenido
          <select name="ficha" defaultValue={hasPage === undefined ? "" : String(hasPage)}>
            <option value="">Todas</option>
            <option value="true">Con ficha</option>
            <option value="false">Pendientes</option>
          </select>
        </label>
        <button type="submit">Filtrar</button>
      </form>
      {listed !== null && !listed.ok ? <ApiFailure result={listed} /> : null}
      {visible || (listed !== null && !listed.ok) ? null : (
        <p className="muted">Ningún concepto con estos filtros.</p>
      )}
      {domain.data.subdomains.map((subdomain) => {
        const concepts = subdomain.concepts.filter((concept) =>
          matches(concept, classification, level, mvp, allowed),
        );
        if (concepts.length === 0) {
          return null;
        }
        return (
          <section key={subdomain.slug} className="subdomain">
            <h2>{subdomain.title}</h2>
            <ul className="stack">
              {concepts.map((concept) => (
                <li key={concept.slug} className="panel">
                  <Link href={`/concepts/${concept.slug}`}>{concept.title}</Link>
                  <ConceptMeta
                    classification={concept.classification}
                    level={concept.level}
                    mvp={concept.mvp}
                    hasPage={concept.has_page}
                    verificationStatus={concept.verification_status}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function matches(
  concept: ConceptSummary,
  classification: Classification | undefined,
  level: Level | undefined,
  mvp: boolean | undefined,
  allowed: Set<string> | undefined,
): boolean {
  if (allowed && !allowed.has(concept.slug)) {
    return false;
  }
  if (classification && concept.classification !== classification) {
    return false;
  }
  if (level && concept.level !== level) {
    return false;
  }
  if (mvp !== undefined && concept.mvp !== mvp) {
    return false;
  }
  return true;
}

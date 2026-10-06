"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ConceptMeta } from "@/components/ConceptMeta";
import type { Classification, ConceptSummary, DomainDetail, Level } from "@/lib/api/types";

const CLASSIFICATIONS: Classification[] = ["core", "modern", "emerging"];
const LEVELS: Level[] = ["basic", "intermediate", "advanced"];

function matches(
  concept: ConceptSummary,
  classification: Classification | undefined,
  level: Level | undefined,
  mvp: boolean | undefined,
): boolean {
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

export function DomainBrowser({ domain }: { domain: DomainDetail }) {
  const params = useSearchParams();
  const classification = CLASSIFICATIONS.find((value) => value === params.get("classification"));
  const level = LEVELS.find((value) => value === params.get("level"));
  const mvpParam = params.get("mvp");
  const mvp = mvpParam === "true" ? true : mvpParam === "false" ? false : undefined;
  const visible = domain.subdomains.some((subdomain) =>
    subdomain.concepts.some((concept) => matches(concept, classification, level, mvp)),
  );

  return (
    <>
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
        <button type="submit">Filtrar</button>
      </form>
      {visible ? null : <p className="muted">Ningún concepto con estos filtros.</p>}
      {domain.subdomains.map((subdomain) => {
        const concepts = subdomain.concepts.filter((concept) => matches(concept, classification, level, mvp));
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
                  <ConceptMeta classification={concept.classification} level={concept.level} mvp={concept.mvp} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

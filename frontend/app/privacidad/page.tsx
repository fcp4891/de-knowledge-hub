import { ApiFailure } from "@/components/ApiFailure";
import { DomainRoute, type GoalDomain, type RouteStage, type RouteStudy } from "@/components/explorer/DomainRoute";
import { LegalFactLink } from "@/components/legal/LegalFactLink";
import { getConcept, getDomain, listDomains, listStudyStates } from "@/lib/api/client";
import type { ApiResult, DomainDetail } from "@/lib/api/types";
import { PRIVACY_LAB, STUDY_PATH, verifiedLegend } from "@/lib/privacySpace";

const SPACE_NOTICE = "Este contenido no es asesoría legal.";

async function loadStudy(slugs: Set<string>): Promise<ApiResult<Record<string, RouteStudy>>> {
  const study: Record<string, RouteStudy> = {};
  let offset = 0;
  let total = 0;
  do {
    const page = await listStudyStates(undefined, { offset, limit: 500 });
    if (!page.ok) {
      return page;
    }
    for (const item of page.data.items) {
      if (slugs.has(item.slug)) {
        study[item.slug] = { state: item.state, lastStudiedAt: item.last_studied_at };
      }
    }
    total = page.data.total;
    if (page.data.items.length === 0) {
      break;
    }
    offset += page.data.items.length;
  } while (offset < total);
  return { ok: true, data: study };
}

function readingMinutes(markdown: string): number | null {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return null;
  }
  return Math.max(1, Math.round(words / 200));
}

async function loadMinutes(slugs: string[]): Promise<Record<string, number>> {
  const details = await Promise.all(slugs.map((slug) => getConcept(slug)));
  const minutes: Record<string, number> = {};
  for (const detail of details) {
    if (!detail.ok) {
      continue;
    }
    const text = detail.data.sections.map((section) => section.markdown).join(" ");
    const estimate = readingMinutes(text);
    if (estimate !== null) {
      minutes[detail.data.slug] = estimate;
    }
  }
  return minutes;
}

function LegalCard({ framework }: { framework: NonNullable<DomainDetail["legal_framework"]> }) {
  const legend = verifiedLegend(framework.facts.map((fact) => fact.verified_at));
  return (
    <section className="route-side route-legal">
      <h2>{framework.title}</h2>
      <dl>
        {framework.facts.map((fact) => (
          <div key={fact.key}>
            <dt>{fact.label}</dt>
            <dd>
              <LegalFactLink value={fact.value} url={fact.url} />
            </dd>
          </div>
        ))}
      </dl>
      {legend ? <p className="route-legal-verified">{legend}</p> : null}
    </section>
  );
}

export default async function PrivacyPage() {
  const localPersonal = process.env.API_MODE === "static" || process.env.API_MODE === "mock";
  const domain = await getDomain("privacy-engineering");
  if (!domain.ok) {
    return (
      <div className="page">
        <ApiFailure result={domain} slug="privacy-engineering" />
      </div>
    );
  }

  const data = domain.data;
  const stages: RouteStage[] = data.subdomains.map((subdomain) => ({
    slug: subdomain.slug,
    title: subdomain.title,
    concepts: subdomain.concepts.map((concept, index) => ({
      slug: concept.slug,
      title: concept.title,
      level: concept.level,
      hasPage: concept.has_page,
      verified: concept.verification_status === "verified",
      blueprintIndex: index,
    })),
  }));
  const slugs = new Set(stages.flatMap((stage) => stage.concepts.map((concept) => concept.slug)));
  const withPage = stages.flatMap((stage) => stage.concepts.filter((concept) => concept.hasPage).map((concept) => concept.slug));
  const [studyResult, catalog, minutes] = await Promise.all([
    localPersonal ? Promise.resolve(null) : loadStudy(slugs),
    listDomains(),
    loadMinutes(withPage),
  ]);
  const goalDomains: GoalDomain[] = catalog.ok
    ? catalog.data.items.map((item) => ({ id: item.id, slug: item.slug }))
    : [];

  return (
    <>
      {studyResult && !studyResult.ok ? <ApiFailure result={studyResult} /> : null}
      <DomainRoute
        id={data.id}
        slug={data.slug}
        title={data.title}
        description={data.description}
        conceptCount={data.concept_count}
        stages={stages}
        minutes={minutes}
        study={studyResult && studyResult.ok ? studyResult.data : null}
        staticMode={localPersonal}
        goalDomains={goalDomains}
        bandLabel="Especialización"
        notice={SPACE_NOTICE}
        readingPath={STUDY_PATH}
        verifiedTotal={data.concept_count}
        disabledStage={{ id: PRIVACY_LAB.id, title: PRIVACY_LAB.label }}
        asideExtra={data.legal_framework ? <LegalCard framework={data.legal_framework} /> : null}
      />
    </>
  );
}

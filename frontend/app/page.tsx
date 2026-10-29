import { ApiFailure } from "@/components/ApiFailure";
import { HomeScreen, type HomeConcept, type HomeDomain } from "@/components/home/HomeScreen";
import { getDomain, listAllConcepts, listDomains, listStudyStates } from "@/lib/api/client";
import type { ApiResult, StudyState } from "@/lib/api/types";
import { verifiedCount } from "@/lib/privacySpace";

async function latestReviewing(): Promise<ApiResult<StudyState | null>> {
  const items: StudyState[] = [];
  let offset = 0;
  let total = 0;
  do {
    const page = await listStudyStates("reviewing", { offset, limit: 500 });
    if (!page.ok) {
      return page;
    }
    items.push(...page.data.items);
    total = page.data.total;
    if (page.data.items.length === 0) {
      break;
    }
    offset += page.data.items.length;
  } while (offset < total);

  items.sort((left, right) => (right.last_studied_at ?? "").localeCompare(left.last_studied_at ?? ""));
  return { ok: true, data: items[0] ?? null };
}

export default async function HomePage() {
  const staticMode = process.env.API_MODE === "static";
  const localStudy = staticMode || process.env.API_MODE === "mock";
  const [domainList, conceptList, reviewing] = await Promise.all([
    listDomains(),
    listAllConcepts(),
    localStudy ? Promise.resolve(null) : latestReviewing(),
  ]);

  const domainItems = domainList.ok ? domainList.data.items : [];
  const details = await Promise.all(domainItems.map((domain) => getDomain(domain.slug)));
  const subdomainTitle = new Map<string, string>();
  for (const detail of details) {
    if (!detail.ok) {
      continue;
    }
    for (const subdomain of detail.data.subdomains) {
      subdomainTitle.set(`${detail.data.slug}/${subdomain.slug}`, subdomain.title);
    }
  }

  const withPage = new Map<string, number>();
  if (conceptList.ok) {
    for (const concept of conceptList.data) {
      if (concept.has_page) {
        withPage.set(concept.domain, (withPage.get(concept.domain) ?? 0) + 1);
      }
    }
  }

  const domains: HomeDomain[] = domainItems.map((domain) => {
    const detail = details.find((item) => item.ok && item.data.id === domain.id);
    const data = detail && detail.ok ? detail.data : null;
    const stages =
      domain.band === "especializacion" && data
        ? data.subdomains.map((subdomain) => {
            const progress = verifiedCount(subdomain.concepts.map((concept) => concept.verification_status));
            return { slug: subdomain.slug, title: subdomain.title, ...progress };
          })
        : [];
    return {
      id: domain.id,
      slug: domain.slug,
      title: domain.title,
      band: domain.band,
      conceptCount: domain.concept_count,
      withPage: conceptList.ok ? (withPage.get(domain.slug) ?? 0) : null,
      stages,
    };
  });
  const idBySlug = new Map(domains.map((domain) => [domain.slug, domain.id]));
  const concepts: HomeConcept[] = conceptList.ok
    ? conceptList.data.map((concept) => ({
        slug: concept.slug,
        title: concept.title,
        domainId: idBySlug.get(concept.domain) ?? "",
        subdomainTitle: subdomainTitle.get(`${concept.domain}/${concept.subdomain}`) ?? null,
      }))
    : [];

  const continueSlug =
    reviewing && reviewing.ok && reviewing.data && concepts.some((concept) => concept.slug === reviewing.data?.slug)
      ? reviewing.data.slug
      : null;

  return (
    <div className="home">
      {domainList.ok ? null : <ApiFailure result={domainList} />}
      {conceptList.ok ? null : <ApiFailure result={conceptList} />}
      {reviewing && !reviewing.ok ? <ApiFailure result={reviewing} /> : null}
      <HomeScreen domains={domains} concepts={concepts} continueSlug={continueSlug} staticMode={staticMode} />
    </div>
  );
}

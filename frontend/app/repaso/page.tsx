import { ApiFailure } from "@/components/ApiFailure";
import { ReviewList, type ReviewEntry } from "@/components/review/ReviewList";
import { ReviewListStatic } from "@/components/review/ReviewListStatic";
import { listAllConcepts, listDomains, listStudyStates } from "@/lib/api/client";

type CatalogItem = { title: string; domainLabel: string | null };

async function loadCatalog(): Promise<Record<string, CatalogItem>> {
  const [concepts, domains] = await Promise.all([listAllConcepts(), listDomains()]);
  const domainLabel = new Map(
    domains.ok ? domains.data.items.map((domain) => [domain.slug, `${domain.id} ${domain.title}`]) : [],
  );
  const catalog: Record<string, CatalogItem> = {};
  if (concepts.ok) {
    for (const concept of concepts.data) {
      catalog[concept.slug] = { title: concept.title, domainLabel: domainLabel.get(concept.domain) ?? null };
    }
  }
  return catalog;
}

export default async function ReviewPage() {
  const catalog = await loadCatalog();

  if (process.env.API_MODE === "static") {
    return (
      <div className="page">
        <ReviewHeader />
        <ReviewListStatic catalog={catalog} />
      </div>
    );
  }

  const states = await listStudyStates("needs_review");
  const entries: ReviewEntry[] = states.ok
    ? states.data.items.map((item) => ({
        slug: item.slug,
        title: catalog[item.slug]?.title ?? item.slug,
        domainLabel: catalog[item.slug]?.domainLabel ?? null,
        lastStudiedAt: item.last_studied_at,
      }))
    : [];

  return (
    <div className="page">
      <ReviewHeader />
      {states.ok ? <ReviewList entries={entries} now={new Date()} /> : <ApiFailure result={states} />}
    </div>
  );
}

function ReviewHeader() {
  return (
    <header className="page-header">
      <h1>Repaso</h1>
      <p className="lead">Conceptos que marcaste como «Necesita repaso», empezando por los que estudiaste hace más tiempo.</p>
    </header>
  );
}

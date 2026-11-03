import { ApiFailure } from "@/components/ApiFailure";
import { CapabilityList } from "@/components/card/CapabilityList";
import { CardHeader } from "@/components/card/CardHeader";
import { PersonalSlot } from "@/components/card/PersonalSlot";
import { RelationPanel } from "@/components/card/RelationPanel";
import { SourceList } from "@/components/card/SourceList";
import { ConstructionBanner } from "@/components/ConstructionBanner";
import { getRelations, getTechnology } from "@/lib/api/client";
import { loadConceptRefs } from "@/lib/loadConceptRefs";
import { isDomainPublished, relationVisible, scopeFromConcepts } from "@/lib/publishedScope";
import { staticSlugs } from "@/lib/staticParams";

// El build estático cambia este literal a false: Next solo acepta true o false.
export const dynamicParams = true;
// no-store en la API: en hybrid la página se arma en cada pedido.
// El build estático quita esta línea (output: export no admite force-dynamic).
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticSlugs("technologies.json");
}

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [technology, relations, conceptRefs] = await Promise.all([
    getTechnology(slug),
    getRelations(slug),
    loadConceptRefs(),
  ]);

  if (!technology.ok) {
    return (
      <div className="page">
        <ApiFailure result={technology} slug={slug} />
      </div>
    );
  }

  const data = technology.data;
  const scope = scopeFromConcepts(
    Object.entries(conceptRefs).map(([conceptSlug, ref]) => ({ slug: conceptSlug, domain: ref.domain ?? "" })),
  );
  const scopedRelations = relations.ok
    ? {
        ...relations,
        data: {
          ...relations.data,
          groups: relations.data.groups
            .map((group) => ({ ...group, items: group.items.filter((item) => relationVisible(item, scope)) }))
            .filter((group) => group.items.length > 0),
        },
      }
    : relations;

  return (
    <div className="page">
      {isDomainPublished({ slug: data.domain }) ? null : <ConstructionBanner />}
      <CardHeader
        title={data.title}
        description={data.description}
        classification={data.classification}
        level={data.level}
        mvp={data.mvp}
        lastVerified={data.last_verified}
        verificationStatus={data.verification_status}
        aliases={data.aliases}
      />
      <p className="meta">
        <span>{data.origin}</span>
        <span>{data.category}</span>
        {data.stub ? <span>marcador</span> : null}
      </p>
      <div className="card-layout">
        <div className="sections">
          <PersonalSlot slug={data.slug} />
          {data.note ? <p>{data.note}</p> : null}
          <CapabilityList capabilities={data.capabilities} />
          <SourceList sources={data.sources} />
        </div>
        <RelationPanel
          result={scopedRelations}
          center={{ slug: data.slug, title: data.title, entityType: data.type }}
        />
      </div>
    </div>
  );
}

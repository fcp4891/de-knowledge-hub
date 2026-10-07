import { ApiFailure } from "@/components/ApiFailure";
import { CapabilityList } from "@/components/card/CapabilityList";
import { CardHeader } from "@/components/card/CardHeader";
import { PersonalSlot } from "@/components/card/PersonalSlot";
import { RelationPanel } from "@/components/card/RelationPanel";
import { SourceList } from "@/components/card/SourceList";
import { getRelations, getTechnology } from "@/lib/api/client";
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
  const [technology, relations] = await Promise.all([getTechnology(slug), getRelations(slug)]);

  if (!technology.ok) {
    return (
      <div className="page">
        <ApiFailure result={technology} slug={slug} />
      </div>
    );
  }

  const data = technology.data;

  return (
    <div className="page">
      <CardHeader
        title={data.title}
        description={data.description}
        classification={data.classification}
        level={data.level}
        mvp={data.mvp}
        lastVerified={data.last_verified}
        verificationStatus={data.verification_status}
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
          result={relations}
          center={{ slug: data.slug, title: data.title, entityType: data.type }}
        />
      </div>
    </div>
  );
}

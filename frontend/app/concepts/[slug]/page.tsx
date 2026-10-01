import { ApiFailure } from "@/components/ApiFailure";
import { CardHeader } from "@/components/card/CardHeader";
import { ConceptBody } from "@/components/card/ConceptBody";
import { PersonalPanel } from "@/components/card/PersonalPanel";
import { RelationPanel } from "@/components/card/RelationPanel";
import { SourceList } from "@/components/card/SourceList";
import { getConcept, getRelations } from "@/lib/api/client";

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [concept, relations] = await Promise.all([getConcept(slug), getRelations(slug)]);

  if (!concept.ok) {
    return (
      <div className="page">
        <ApiFailure result={concept} slug={slug} />
      </div>
    );
  }

  const data = concept.data;

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
        backHref={data.domain ? `/explorer/${data.domain}` : undefined}
        backLabel="Volver al dominio"
      />
      <div className="card-layout">
        <div className="sections">
          <PersonalPanel slug={data.slug} />
          <ConceptBody sections={data.sections} omitSourceSection={data.sources.length > 0} />
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

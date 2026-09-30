import Link from "next/link";

import { ConceptMeta } from "@/components/ConceptMeta";
import { MockMiss } from "@/components/MockMiss";
import { getConcept } from "@/lib/api/client";

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = await getConcept(slug);

  if (!concept.ok) {
    return (
      <div className="page">
        {concept.reason === "mock_missing" ? <MockMiss slug={slug} /> : <p>No existe.</p>}
      </div>
    );
  }

  const data = concept.data;

  return (
    <div className="page">
      {data.domain ? (
        <p className="meta">
          <Link href={`/explorer/${data.domain}`}>Volver al dominio</Link>
        </p>
      ) : null}
      <h1>{data.title}</h1>
      {data.classification && data.level ? (
        <ConceptMeta classification={data.classification} level={data.level} mvp={data.mvp} />
      ) : null}
      {data.description ? <p>{data.description}</p> : null}
      <p className="meta">
        <span>{data.verification_status ?? "sin verificación"}</span>
        <span>{data.last_verified ?? "sin fecha"}</span>
        <span>{data.has_page ? "con ficha" : "sin ficha"}</span>
      </p>
    </div>
  );
}

import { Suspense } from "react";

import { ApiFailure } from "@/components/ApiFailure";
import { DomainBrowser } from "@/components/explorer/DomainBrowser";
import { getDomain } from "@/lib/api/client";
import { staticSlugs } from "@/lib/staticParams";

// El build estático cambia este literal a false: Next solo acepta true o false.
export const dynamicParams = true;

export function generateStaticParams() {
  return staticSlugs("domains.json");
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = await getDomain(slug);

  if (!domain.ok) {
    return (
      <div className="page">
        <ApiFailure result={domain} slug={slug} />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>
        {domain.data.id} · {domain.data.title}
      </h1>
      <p className="lead">{domain.data.description}</p>
      <Suspense fallback={<p className="muted">Cargando conceptos…</p>}>
        <DomainBrowser domain={domain.data} />
      </Suspense>
    </div>
  );
}

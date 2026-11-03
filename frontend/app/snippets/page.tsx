import { Suspense } from "react";

import { ApiFailure } from "@/components/ApiFailure";
import { SnippetBrowser } from "@/components/snippets/SnippetBrowser";
import { listAllConcepts, listSnippets } from "@/lib/api/client";
import { scopeFromConcepts } from "@/lib/publishedScope";

export default async function SnippetsPage() {
  const [result, concepts] = await Promise.all([listSnippets(), listAllConcepts()]);
  const scope = concepts.ok ? [...scopeFromConcepts(concepts.data)] : [];

  return (
    <div className="page">
      <h1>Snippets</h1>
      <p className="lead">Código de la Code Library, con el concepto que implementa.</p>
      {result.ok ? (
        <Suspense fallback={<p className="muted">Cargando snippets…</p>}>
          <SnippetBrowser snippets={result.data.items} scopeSlugs={scope} />
        </Suspense>
      ) : (
        <ApiFailure result={result} />
      )}
      {result.ok && !concepts.ok ? <ApiFailure result={concepts} /> : null}
    </div>
  );
}

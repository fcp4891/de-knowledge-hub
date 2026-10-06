import { Suspense } from "react";

import { ApiFailure } from "@/components/ApiFailure";
import { SnippetBrowser } from "@/components/snippets/SnippetBrowser";
import { listSnippets } from "@/lib/api/client";

export default async function SnippetsPage() {
  const result = await listSnippets();

  return (
    <div className="page">
      <h1>Snippets</h1>
      <p className="lead">Código de la Code Library, con el concepto que implementa.</p>
      {result.ok ? (
        <Suspense fallback={<p className="muted">Cargando snippets…</p>}>
          <SnippetBrowser snippets={result.data.items} />
        </Suspense>
      ) : (
        <ApiFailure result={result} />
      )}
    </div>
  );
}

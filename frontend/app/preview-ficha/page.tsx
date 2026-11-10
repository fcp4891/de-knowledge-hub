import { redirect } from "next/navigation";

import { ConceptArticle } from "../concepts/[slug]/page";

export const dynamic = "force-dynamic";

/** Vista previa de chile-data-protection: la misma ficha, con las vistas que trae su contrato (ADR-030). */
export default async function PreviewFichaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (typeof params.grupo !== "string") {
    redirect("/preview-ficha?grupo=lf-fundamentos");
  }
  return <ConceptArticle slug="chile-data-protection" />;
}

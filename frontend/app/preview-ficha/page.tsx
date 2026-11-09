import { redirect } from "next/navigation";

import { ConceptArticle } from "../concepts/[slug]/page";
import { renderPreviewView } from "./slots";

export const dynamic = "force-dynamic";

export default async function PreviewFichaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (typeof params.grupo !== "string") {
    redirect("/preview-ficha?grupo=lf-fundamentos");
  }
  return <ConceptArticle slug="chile-data-protection" renderView={renderPreviewView} />;
}

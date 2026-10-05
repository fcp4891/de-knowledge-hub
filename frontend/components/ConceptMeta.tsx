import type { Classification, Level, VerificationStatus } from "@/lib/api/types";
import { LEVEL_LABEL, VERIFICATION_LABEL } from "@/lib/labels";

export function contentStatus(
  hasPage: boolean,
  verificationStatus: VerificationStatus | null,
): { label: string; tone: "verified" | "review" | "pending" | "page" } {
  if (!hasPage) {
    return { label: "Pendiente", tone: "pending" };
  }
  if (verificationStatus === "verified") {
    return { label: "Verificada", tone: "verified" };
  }
  if (verificationStatus === "review_required") {
    return { label: "En revisión", tone: "review" };
  }
  if (verificationStatus === null) {
    return { label: "Con ficha", tone: "page" };
  }
  return { label: VERIFICATION_LABEL[verificationStatus], tone: "page" };
}

export function ConceptMeta({
  classification,
  level,
  mvp,
  hasPage,
  verificationStatus,
}: {
  classification: Classification;
  level: Level;
  mvp: boolean;
  hasPage: boolean;
  verificationStatus: VerificationStatus | null;
}) {
  const status = contentStatus(hasPage, verificationStatus);
  return (
    <p className="meta">
      <span className={`badge classification-${classification}`}>{classification}</span>
      <span>{LEVEL_LABEL[level]}</span>
      {mvp ? <span className="badge">MVP</span> : null}
      <span className={`badge badge-${status.tone}`}>{status.label}</span>
    </p>
  );
}

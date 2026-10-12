import Link from "next/link";

import type { Classification, Level, VerificationStatus } from "@/lib/api/types";
import { alsoKnownLabel, LEVEL_LABEL, VERIFICATION_LABEL } from "@/lib/labels";

const ALERT_STATUS = new Set<VerificationStatus>(["review_required", "potentially_outdated"]);

export function CardHeader({
  title,
  description,
  classification,
  level,
  mvp,
  lastVerified,
  verificationStatus,
  backHref,
  backLabel,
  aliases = [],
}: {
  title: string;
  description: string | null;
  classification: Classification | null;
  level: Level | null;
  mvp: boolean;
  lastVerified: string | null;
  verificationStatus: VerificationStatus | null;
  backHref?: string;
  backLabel?: string;
  aliases?: readonly string[];
}) {
  const known = alsoKnownLabel(aliases);
  return (
    <header className="card-header">
      {backHref ? (
        <p className="meta">
          <Link href={backHref}>{backLabel ?? "Volver"}</Link>
        </p>
      ) : null}
      <h1>{title}</h1>
      {known ? <p className="also-known">{known}</p> : null}
      <p className="meta">
        {classification ? (
          <span className={`badge classification-${classification}`}>{classification}</span>
        ) : null}
        {level ? <span>{LEVEL_LABEL[level]}</span> : null}
        {mvp ? <span className="badge">MVP</span> : null}
        <span>{lastVerified ?? "sin fecha"}</span>
        {verificationStatus ? (
          <span className={ALERT_STATUS.has(verificationStatus) ? "badge badge-alert" : undefined}>
            {VERIFICATION_LABEL[verificationStatus]}
          </span>
        ) : (
          <span>sin verificación</span>
        )}
      </p>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

import type { Classification, Level } from "@/lib/api/types";
import { LEVEL_LABEL } from "@/lib/labels";

export function ConceptMeta({
  classification,
  level,
  mvp,
}: {
  classification: Classification;
  level: Level;
  mvp: boolean;
}) {
  return (
    <p className="meta">
      <span className={`badge classification-${classification}`}>{classification}</span>
      <span>{LEVEL_LABEL[level]}</span>
      {mvp ? <span className="badge">MVP</span> : null}
    </p>
  );
}

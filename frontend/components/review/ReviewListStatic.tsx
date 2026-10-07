"use client";

import { useEffect, useState } from "react";

import { ReviewList, type ReviewEntry } from "@/components/review/ReviewList";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";

type CatalogItem = { title: string; domainLabel: string | null };

/** Demo estática: el estado de estudio vive en localStorage; el catálogo llega del build. */
export function ReviewListStatic({ catalog }: { catalog: Record<string, CatalogItem> }) {
  const [entries, setEntries] = useState<ReviewEntry[] | null>(null);

  useEffect(() => {
    const refresh = () =>
      setEntries(
        listStoredStudy()
          .filter((item) => item.state === "needs_review")
          .map((item) => ({
            slug: item.slug,
            title: catalog[item.slug]?.title ?? item.slug,
            domainLabel: catalog[item.slug]?.domainLabel ?? null,
            lastStudiedAt: item.last_studied_at,
          })),
      );
    refresh();
    return subscribePersonal(refresh);
  }, [catalog]);

  if (entries === null) {
    return <p className="muted">Cargando…</p>;
  }
  return (
    <>
      <ReviewList entries={entries} now={new Date()} />
      <p className="muted review-note">En la demo, tu estado de estudio se guarda solo en este navegador.</p>
    </>
  );
}

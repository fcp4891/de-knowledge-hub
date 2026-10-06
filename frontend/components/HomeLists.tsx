"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { StudyState } from "@/lib/api/types";
import { STUDY_LABEL } from "@/lib/labels";
import { listStoredStudy, subscribePersonal } from "@/lib/personalStore";

function Section({ title, items }: { title: string; items: StudyState[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">Nada en esta lista.</p>
      ) : (
        <ul className="stack">
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={`/concepts/${item.slug}`}>{item.slug}</Link>
              <p className="meta">
                <span>{STUDY_LABEL[item.state]}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HomeLists() {
  const [items, setItems] = useState<StudyState[]>([]);

  useEffect(() => {
    const refresh = () => setItems(listStoredStudy());
    refresh();
    return subscribePersonal(refresh);
  }, []);

  return (
    <>
      <Section title="Continuar estudiando" items={items.filter((item) => item.state === "reviewing")} />
      <Section title="Necesita repaso" items={items.filter((item) => item.state === "needs_review")} />
      <Section title="Conceptos recientes" items={items} />
    </>
  );
}

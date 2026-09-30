import Link from "next/link";

import { MockMiss } from "@/components/MockMiss";
import { listConcepts, listStudyStates } from "@/lib/api/client";
import { STUDY_LABEL } from "@/lib/labels";
import type { StudyState } from "@/lib/api/types";

const PLACEHOLDERS = [
  "Novedades importantes",
  "Cambios en herramientas que utilizo",
  "Tecnologías emergentes",
  "Arquitecturas destacadas",
  "Laboratorios pendientes",
  "Ofertas laborales analizadas recientemente",
];

export default async function HomePage() {
  const [catalog, states, needsReview] = await Promise.all([
    listConcepts(),
    listStudyStates(),
    listStudyStates("needs_review"),
  ]);

  const titles = new Map(
    catalog.ok ? catalog.data.items.map((concept) => [concept.slug, concept.title]) : [],
  );

  const recent = states.ok ? states.data.items : [];
  const continuing = recent.filter((item) => item.state === "reviewing");

  return (
    <div className="page">
      <h1>Data Engineering Knowledge Hub</h1>
      <p className="lead">Continúa por donde ibas. El resto del inicio todavía no tiene datos.</p>
      <div className="sections">
        <StudySection title="Continuar estudiando" items={states.ok ? continuing : null} titles={titles} />
        <StudySection
          title="Necesita repaso"
          items={needsReview.ok ? needsReview.data.items : null}
          titles={titles}
        />
        <StudySection title="Conceptos recientes" items={states.ok ? recent : null} titles={titles} />
        {PLACEHOLDERS.map((title) => (
          <section key={title} className="panel panel-empty" aria-label={title}>
            <h2>{title}</h2>
          </section>
        ))}
      </div>
    </div>
  );
}

function StudySection({
  title,
  items,
  titles,
}: {
  title: string;
  items: StudyState[] | null;
  titles: Map<string, string>;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {items === null ? (
        <MockMiss />
      ) : items.length === 0 ? (
        <p className="muted">Nada en esta lista.</p>
      ) : (
        <ul className="stack">
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={`/concepts/${item.slug}`}>{titles.get(item.slug) ?? item.slug}</Link>
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

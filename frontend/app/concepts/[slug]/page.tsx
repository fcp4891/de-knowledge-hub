import { ApiFailure } from "@/components/ApiFailure";
import { NoteForm, NoteItem } from "@/components/card/PersonalForms";
import { ConceptReading, type ReadingSectionModel } from "@/components/card/ConceptReading";
import { MarkdownBody } from "@/components/markdown/MarkdownBody";
import { getConcept, getDomain, getRelations, getStudyState, listNotes } from "@/lib/api/client";
import type { NoteList, RelationGroups, Section, SourceRef } from "@/lib/api/types";
import { citationDetail, citationLinkText } from "@/lib/citation";
import { extractLegalNotice, legalNoticeCopy } from "@/lib/legal";
import { entityHref } from "@/lib/entityHref";
import { SHORT_NAMES } from "@/lib/learning-paths";
import { nextInRoute } from "@/lib/domainRoute";
import { staticSlugs } from "@/lib/staticParams";

const CLOUD_KEYS = new Set(["gcp", "aws", "azure"]);
const OPEN_NUMBERS = new Set([3, 10]);

// El build estático cambia este literal a false: Next solo acepta true o false.
export const dynamicParams = true;
// no-store en la API: en hybrid la página se arma en cada pedido.
// El build estático quita esta línea (output: export no admite force-dynamic).
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staticSlugs("concepts.json");
}

function readingMinutes(sections: Section[]): number | null {
  const words = sections
    .map((section) => section.markdown)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words === 0) {
    return null;
  }
  return Math.max(1, Math.round(words / 200));
}

function formatWhen(value: string | null): string {
  if (!value) {
    return "sin fecha";
  }
  return value.replace("T", " ").replace(".000Z", " UTC").replace("Z", " UTC");
}

function SourceLinks({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="reading-sources">
      {sources.map((source) => (
        <li key={`${source.source}-${source.url}`}>
          <a href={source.url}>{citationLinkText(source)}</a>
          <p className="reading-quiet">{citationDetail(source)}</p>
        </li>
      ))}
    </ul>
  );
}

function sectionModels(sections: Section[], sources: SourceRef[]): ReadingSectionModel[] {
  const ordered = [...sections].sort((left, right) => left.number - right.number);
  const models: ReadingSectionModel[] = [];
  let clouds: ReadingSectionModel[] = [];

  function flushClouds() {
    models.push(...clouds);
    clouds = [];
  }

  for (const section of ordered) {
    const text = section.markdown.trim().length > 0;
    if (section.key === "summary") {
      flushClouds();
      models.push({
        number: section.number,
        key: section.key,
        title: section.title,
        presentation: "summary",
        listed: text,
        body: text ? <MarkdownBody markdown={section.markdown} /> : null,
      });
      continue;
    }
    if (CLOUD_KEYS.has(section.key)) {
      if (!text) {
        continue;
      }
      clouds.push({
        number: section.number,
        key: section.key,
        title: section.title,
        presentation: "cloud",
        listed: true,
        body: <MarkdownBody markdown={section.markdown} />,
      });
      continue;
    }
    flushClouds();
    if (section.key === "sources") {
      const showList = sources.length > 0;
      if (!text && !showList) {
        continue;
      }
      models.push({
        number: section.number,
        key: section.key,
        title: section.title,
        presentation: "details",
        listed: true,
        body: showList ? <SourceLinks sources={sources} /> : <MarkdownBody markdown={section.markdown} />,
      });
      continue;
    }
    if (!text) {
      continue;
    }
    models.push({
      number: section.number,
      key: section.key,
      title: section.title,
      presentation: OPEN_NUMBERS.has(section.number) ? "open" : "details",
      listed: true,
      body: <MarkdownBody markdown={section.markdown} />,
    });
  }
  flushClouds();
  if (sources.length > 0 && !models.some((item) => item.key === "sources")) {
    models.push({
      number: 20,
      key: "sources",
      title: "Fuentes",
      presentation: "details",
      listed: true,
      body: <SourceLinks sources={sources} />,
    });
  }
  return models;
}

function relatedItems(groups: RelationGroups["groups"]) {
  const seen = new Set<string>();
  const items: { href: string; title: string; kind: string }[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (item.entity_type !== "concept" && item.entity_type !== "pattern") {
        continue;
      }
      if (seen.has(item.slug)) {
        continue;
      }
      seen.add(item.slug);
      items.push({
        href: entityHref(item.entity_type, item.slug),
        title: item.title,
        kind: item.entity_type === "pattern" ? "patrón" : "concepto",
      });
      if (items.length === 6) {
        return items;
      }
    }
  }
  return items;
}

async function HybridNotes({ slug }: { slug: string }) {
  const notes = await listNotes(slug);
  return (
    <>
      {!notes.ok ? <p className="reading-error">{notes.detail ?? "No se pudieron cargar las notas."}</p> : null}
      {notes.ok && notes.data.items.length === 0 ? <p className="reading-quiet">Sin notas.</p> : null}
      {notes.ok ? <NoteListView slug={slug} notes={notes.data} /> : null}
      <NoteForm slug={slug} placeholder="Escribe en Markdown…" />
    </>
  );
}

function NoteListView({ slug, notes }: { slug: string; notes: NoteList }) {
  return notes.items.map((note) => (
    <NoteItem key={note.id} slug={slug} note={note} when={formatWhen(note.created_at)}>
      <MarkdownBody markdown={note.body_markdown} />
    </NoteItem>
  ));
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticMode = process.env.API_MODE === "static";
  const [concept, relations] = await Promise.all([getConcept(slug), getRelations(slug)]);

  if (!concept.ok) {
    return (
      <div className="page">
        <ApiFailure result={concept} slug={slug} />
      </div>
    );
  }

  const data = concept.data;
  const summary = data.sections.find((section) => section.key === "summary");
  const noticeSplit = extractLegalNotice(summary?.markdown ?? "");
  const sections = data.sections.map((section) =>
    section.key === "summary" ? { ...section, markdown: noticeSplit.markdown } : section,
  );
  const domain = data.domain ? await getDomain(data.domain) : null;
  const study = staticMode ? null : await getStudyState(slug);
  const groups = relations.ok ? relations.data.groups : [];

  let crumb: { domainHref: string; domainLabel: string; subdomain: string | null } | null = null;
  let next: { slug: string; title: string } | null = null;
  if (domain?.ok) {
    const short = SHORT_NAMES[domain.data.id] ?? domain.data.title;
    const subdomain = domain.data.subdomains.find((item) => item.slug === data.subdomain)?.title ?? null;
    crumb = {
      domainHref: `/explorer/${domain.data.slug}`,
      domainLabel: `${domain.data.id} ${short}`,
      subdomain,
    };
    const stages = domain.data.subdomains.map((item) => ({
      concepts: item.concepts.map((conceptItem, index) => ({
        slug: conceptItem.slug,
        title: conceptItem.title,
        level: conceptItem.level,
        hasPage: conceptItem.has_page,
        blueprintIndex: index,
      })),
    }));
    const found = nextInRoute(stages, data.slug);
    next = found ? { slug: found.slug, title: found.title } : null;
  }

  return (
    <ConceptReading
      slug={data.slug}
      title={data.title}
      aliases={data.aliases}
      classification={data.classification}
      level={data.level}
      mvp={data.mvp}
      lastVerified={data.last_verified}
      verificationStatus={data.verification_status}
      jurisdiction={data.jurisdiction}
      legalNotice={data.jurisdiction.length > 0 ? legalNoticeCopy(noticeSplit.notice) : null}
      legalBasis={data.legal_basis}
      technicalMarkdown={data.sections.find((section) => section.key === "how_it_works")?.markdown ?? ""}
      minutes={readingMinutes(sections)}
      sourceCount={data.sources.length}
      crumb={crumb}
      next={next}
      sections={sectionModels(sections, data.sources)}
      staticMode={staticMode}
      initialStudy={
        study?.ok ? { state: study.data.state, pendingDeepDive: study.data.pending_deep_dive } : null
      }
      studyError={study && !study.ok ? (study.detail ?? "No se pudo cargar el estado de estudio.") : null}
      related={relatedItems(groups)}
      relationGroups={groups}
      relationsError={relations.ok ? null : (relations.detail ?? "No se pudieron cargar las relaciones.")}
      entityType={data.type}
    >
      {staticMode ? null : <HybridNotes slug={data.slug} />}
    </ConceptReading>
  );
}

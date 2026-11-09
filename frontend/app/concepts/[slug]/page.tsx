import { ApiFailure } from "@/components/ApiFailure";
import { NoteForm, NoteItem } from "@/components/card/PersonalForms";
import { ConceptReading, type ReadingSectionModel } from "@/components/card/ConceptReading";
import { LegalCatalog, LegalFoundations } from "@/components/card/LegalFoundations";
import { canViewChangeHistory, canViewRelatedLab, currentViewer } from "@/lib/changeHistoryAccess";
import { MarkdownBody } from "@/components/markdown/MarkdownBody";
import { getConcept, getDomain, getRelations, getStudyState, listNotes } from "@/lib/api/client";
import type { ConceptRefs } from "@/lib/conceptNames";
import { loadConceptRefs } from "@/lib/loadConceptRefs";
import type { Annex, NoteList, RelationGroups, Section, SourceRef } from "@/lib/api/types";
import { CARD_SECTION_COUNT } from "@/lib/readingProgress";
import { citationDetail, citationLinkText } from "@/lib/citation";
import { extractLegalNotice, legalNoticeCopy, usesArchitectureMark, type ObligationBasis } from "@/lib/legal";
import { withoutPartOf } from "@/lib/partOf";
import { entityHref } from "@/lib/entityHref";
import { architectureTitle, isArchitectureView } from "@/lib/architecture";
import { SHORT_NAMES } from "@/lib/learning-paths";
import { isDomainPublished, relationVisible, scopeFromConcepts } from "@/lib/publishedScope";
import { nextInRoute } from "@/lib/domainRoute";
import { staticSlugs } from "@/lib/staticParams";
import type { ReactNode } from "react";

const VIEW_MARK = /<!-- view: ([a-z0-9_]+) -->/g;
const ACTIVITY_FLOW = /[—–-]\s*recolección, ingesta, consulta, transformación, almacenamiento, integración, transmisión, conservación y eliminación\s*[—–-]/;
const DESIGN_QUESTIONS =
  /\*\*\[Buena práctica\]\*\* Seis preguntas de diseño\.[\s\S]*?(?=\*\*\[Decisión de arquitectura\]\*\* Matriz de control:)/;

export type FichaViewRenderer = (id: string, views: unknown) => ReactNode | null;

function withCodeGuide(markdown: string): string {
  const start = markdown.indexOf("El script se");
  if (start < 0) {
    return markdown;
  }
  const head = markdown.slice(0, start).trimEnd();
  const fences = [...markdown.slice(start).matchAll(/```text[\s\S]*?```/g)].map((match) => match[0]);
  return `${head}\n\n${fences.join("\n\n")}\n\n<!-- view: code_guide -->\n`;
}

function markdownWithViews(
  markdown: string,
  renderView: ((id: string) => ReactNode | null) | undefined,
  body: ReactNode,
  props: {
    obligations: readonly ObligationBasis[];
    conceptRefs: ConceptRefs;
    markCodeStatus?: boolean;
    styleArrows?: boolean;
    etiquetaColumn?: boolean;
    horizontalDiagrams?: boolean;
  },
): ReactNode {
  const source = renderView
    ? markdown
        .replace(
          /### Qué implica para Ingeniería de Datos\s*\n[\s\S]*$/,
          "### Qué implica para Ingeniería de Datos\n\n<!-- view: treatment_map -->\n",
        )
        .replace(ACTIVITY_FLOW, "\n\n<!-- view: data_flow -->\n\n")
        .replace(DESIGN_QUESTIONS, "<!-- view: design_questions -->\n\n")
        .replace(
          /\*\*\[Decisión de arquitectura\]\*\* Matriz de control:[\s\S]*?referencia interna protegida\./,
          "<!-- view: control_matrix -->\n",
        )
        .replace(/\*\*Del requisito al dato\.\*\*\s*```mermaid[\s\S]*?```\s*/, "<!-- view: requirement_to_data -->\n\n")
        .replace(/\*\*Control y evidencia\.\*\*\s*```mermaid[\s\S]*?```/, "<!-- view: control_evidence -->")
    : markdown;
  const guided = renderView ? withCodeGuide(source) : source;
  if (!renderView || !guided.includes("<!-- view:")) {
    return body;
  }
  const parts: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of guided.matchAll(VIEW_MARK)) {
    const start = match.index ?? 0;
    const before = guided.slice(last, start);
    if (before.trim()) {
      parts.push(<MarkdownBody key={`md-${index}`} markdown={before} {...props} />);
      index += 1;
    }
    const slot = renderView(match[1] ?? "");
    if (slot) {
      parts.push(<div key={`view-${index}`}>{slot}</div>);
      index += 1;
    }
    last = start + match[0].length;
  }
  const after = guided.slice(last);
  if (after.trim()) {
    parts.push(<MarkdownBody key={`md-${index}`} markdown={after} {...props} />);
  }
  return <>{parts}</>;
}

const CLOUD_KEYS = new Set(["gcp", "aws", "azure"]);
const OPEN_NUMBERS = new Set<number>();

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

function sectionModels(
  sections: Section[],
  sources: SourceRef[],
  obligations: readonly ObligationBasis[],
  slug: string,
  conceptRefs: ConceptRefs,
  kind: string,
  renderView?: (id: string) => ReactNode | null,
): ReadingSectionModel[] {
  const architecture = kind === "architecture";
  const styleArrows = slug !== "data-lineage";
  const titleOf = (section: Section) => (architecture ? architectureTitle(section.key, section.title) : section.title);
  const ordered = [...sections].sort((left, right) => left.number - right.number);
  const viewer = currentViewer();
  const showHistory = canViewChangeHistory(viewer);
  const showLab = canViewRelatedLab(viewer);
  const models: ReadingSectionModel[] = [];
  let clouds: ReadingSectionModel[] = [];

  function flushClouds() {
    const board = clouds.length > 0 ? renderView?.("cloud_compare") : null;
    if (board && clouds[0]) {
      models.push({
        number: clouds[0].number,
        key: "cloud_compare",
        title: "En la nube",
        presentation: "open",
        listed: true,
        body: board,
      });
    } else {
      models.push(...clouds);
    }
    clouds = [];
  }

  for (const section of ordered) {
    if (section.key === "change_history" && !showHistory) {
      continue;
    }
    if (section.key === "related_lab" && !showLab) {
      continue;
    }
    const text = section.markdown.trim().length > 0;
    if (architecture && (isArchitectureView(section.key) || section.key === "components")) {
      flushClouds();
      if (!text) {
        continue;
      }
      models.push({
        number: section.number,
        key: section.key,
        title: titleOf(section),
        presentation: section.key === "components" ? "components" : "view",
        listed: true,
        body: markdownWithViews(
          section.markdown,
          renderView,
          <MarkdownBody markdown={section.markdown} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus styleArrows={styleArrows} />,
          { obligations, conceptRefs, markCodeStatus: true, styleArrows },
        ),
      });
      continue;
    }
    if (section.key === "summary") {
      flushClouds();
      const summaryBody = text
        ? markdownWithViews(
            section.markdown,
            renderView,
            <MarkdownBody markdown={section.markdown} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={architecture} styleArrows={styleArrows} />,
            { obligations, conceptRefs, markCodeStatus: architecture, styleArrows },
          )
        : null;
      const approach = section.markdown.includes("view: approach") ? null : renderView?.("approach");
      models.push({
        number: section.number,
        key: section.key,
        title: titleOf(section),
        presentation: "summary",
        listed: text || Boolean(approach),
        body: approach ? (
          <>
            {summaryBody}
            {approach}
          </>
        ) : (
          summaryBody
        ),
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
        title: titleOf(section),
        presentation: "cloud",
        listed: !(architecture && (section.key === "aws" || section.key === "azure")),
        body: markdownWithViews(
          section.markdown,
          renderView,
          <MarkdownBody
            markdown={section.markdown}
            etiquetaColumn
            obligations={obligations}
            conceptRefs={conceptRefs}
            markCodeStatus={architecture}
            styleArrows={styleArrows}
          />,
          { obligations, conceptRefs, markCodeStatus: architecture, styleArrows, etiquetaColumn: true },
        ),
      });
      continue;
    }
    flushClouds();
    if (section.key === "what_is" && slug === "chile-data-protection") {
      models.push({
        number: section.number,
        key: section.key,
        title: "Fundamentos legales y aplicación técnica",
        presentation: "details",
        listed: true,
        body: <LegalFoundations />,
      });
      continue;
    }
    if (section.key === "sources") {
      const grouped = renderView?.("sources_grouped");
      const showList = sources.length > 0;
      if (!text && !showList && !grouped) {
        continue;
      }
      models.push({
        number: section.number,
        key: section.key,
        title: titleOf(section),
        presentation: "details",
        listed: true,
        body: grouped ? (
          grouped
        ) : showList ? (
          <SourceLinks sources={sources} />
        ) : (
          <MarkdownBody markdown={section.markdown} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={architecture} styleArrows={styleArrows} />
        ),
      });
      continue;
    }
    if (section.key === "problem") {
      const replacement = renderView?.("problem");
      if (replacement) {
        models.push({
          number: section.number,
          key: section.key,
          title: titleOf(section),
          presentation: "details",
          listed: true,
          body: replacement,
        });
        continue;
      }
    }
    if (section.key === "when_to_use") {
      const replacement = renderView?.("when_to_use");
      if (replacement) {
        models.push({
          number: section.number,
          key: section.key,
          title: titleOf(section),
          presentation: "details",
          listed: true,
          body: replacement,
        });
        continue;
      }
    }
    if (!text) {
      continue;
    }
    models.push({
      number: section.number,
      key: section.key,
      title: titleOf(section),
      presentation:
        slug === "chile-data-protection" && section.number === 3
          ? "details"
          : OPEN_NUMBERS.has(section.number)
            ? "open"
            : "details",
      listed: true,
      body: markdownWithViews(
        section.markdown,
        renderView,
        <MarkdownBody
          markdown={section.markdown}
          obligations={obligations}
          conceptRefs={conceptRefs}
          markCodeStatus={architecture}
          horizontalDiagrams={section.key === "architecture"}
          styleArrows={styleArrows}
        />,
        {
          obligations,
          conceptRefs,
          markCodeStatus: architecture,
          styleArrows,
          horizontalDiagrams: section.key === "architecture",
        },
      ),
    });
  }
  flushClouds();
  const groupedSources = renderView?.("sources_grouped");
  if ((sources.length > 0 || groupedSources) && !models.some((item) => item.key === "sources")) {
    models.push({
      number: 20,
      key: "sources",
      title: "Fuentes",
      presentation: "details",
      listed: true,
      body: groupedSources ?? <SourceLinks sources={sources} />,
    });
  }
  return models;
}

/** ADR-029: anexos al final, plegados y fuera del índice; el catálogo legal usa su componente. */
function annexModels(
  annexes: readonly Annex[],
  obligations: readonly ObligationBasis[],
  conceptRefs: ConceptRefs,
): ReadingSectionModel[] {
  return annexes.map((annex, index) => ({
    number: CARD_SECTION_COUNT + 1 + index,
    key: `annex-${index + 1}`,
    title: `Anexo · ${annex.title}`,
    presentation: "details",
    listed: false,
    annex: true,
    body:
      annex.title === "Catálogo legal por tema" ? (
        <LegalCatalog />
      ) : (
        <MarkdownBody markdown={annex.markdown} obligations={obligations} conceptRefs={conceptRefs} />
      ),
  }));
}

function relatedItems(groups: RelationGroups["groups"], scope: ReadonlySet<string>) {
  const seen = new Set<string>();
  const items: { href: string; title: string; kind: string }[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (item.entity_type !== "concept" && item.entity_type !== "pattern") {
        continue;
      }
      if (!scope.has(item.slug)) {
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

export async function ConceptArticle({
  slug,
  renderView,
}: {
  slug: string;
  renderView?: FichaViewRenderer;
}) {
  const staticMode = process.env.API_MODE === "static";
  const [concept, relations, conceptRefs] = await Promise.all([
    getConcept(slug),
    getRelations(slug),
    loadConceptRefs(),
  ]);

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
  const scope = scopeFromConcepts(
    Object.entries(conceptRefs).map(([conceptSlug, ref]) => ({ slug: conceptSlug, domain: ref.domain ?? "" })),
  );
  const groups = relations.ok
    ? relations.data.groups
        .map((group) => ({ ...group, items: group.items.filter((item) => relationVisible(item, scope)) }))
        .filter((group) => group.items.length > 0)
    : [];
  const listedGroups = withoutPartOf(groups);
  const domainOpen = Boolean(domain?.ok && isDomainPublished(domain.data));

  let crumb: { domainHref: string | null; domainLabel: string; subdomain: string | null; subdomainHref: string | null } | null = null;
  let next: { slug: string; title: string } | null = null;
  if (domain?.ok) {
    const short = SHORT_NAMES[domain.data.id] ?? domain.data.title;
    const subdomain = domain.data.subdomains.find((item) => item.slug === data.subdomain)?.title ?? null;
    crumb = {
      domainHref: domainOpen ? `/explorer/${domain.data.slug}` : null,
      domainLabel: `${domain.data.id} ${short}`,
      subdomain,
      subdomainHref: domainOpen && data.subdomain ? `/explorer/${domain.data.slug}#${data.subdomain}` : null,
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
    next = found && scope.has(found.slug) ? { slug: found.slug, title: found.title } : null;
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
      minutes={readingMinutes(sections)}
      sourceCount={data.sources.length}
      crumb={crumb}
      next={next}
      construction={!domainOpen}
      sections={[
        ...sectionModels(
          sections,
          data.sources,
          data.legal_basis,
          data.slug,
          conceptRefs,
          data.kind,
          renderView ? (id) => renderView(id, (data as { views?: unknown }).views) : undefined,
        ),
        ...annexModels(data.annexes ?? [], data.legal_basis, conceptRefs),
      ]}
      compactNumbering={data.slug === "chile-data-protection"}
      staticMode={staticMode}
      initialStudy={
        study?.ok ? { state: study.data.state, pendingDeepDive: study.data.pending_deep_dive } : null
      }
      studyError={study && !study.ok ? (study.detail ?? "No se pudo cargar el estado de estudio.") : null}
      related={relatedItems(listedGroups, scope)}
      relationGroups={groups}
      relationsError={relations.ok ? null : (relations.detail ?? "No se pudieron cargar las relaciones.")}
      entityType={data.type}
      pageKind={data.kind}
      architectureLegend={sections.some((section) => usesArchitectureMark(section.markdown))}
    >
      {staticMode ? null : <HybridNotes slug={data.slug} />}
    </ConceptReading>
  );
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ConceptArticle slug={slug} />;
}

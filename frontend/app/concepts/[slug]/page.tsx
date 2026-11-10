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
import { hideOwnerName } from "@/lib/hideOwnerName";
import { staticSlugs } from "@/lib/staticParams";
import type { ReactNode } from "react";

import { ApproachBoard } from "@/components/ficha/ApproachBoard";
import { CentralIdea } from "@/components/ficha/CentralIdea";
import { CloudCompare } from "@/components/ficha/CloudCompare";
import { CodeGuide } from "@/components/ficha/CodeGuide";
import { ControlEvidence, RequirementToData } from "@/components/ficha/ControlEvidence";
import { ControlMatrix } from "@/components/ficha/ControlMatrix";
import { DesignBoard } from "@/components/ficha/DesignBoard";
import { PracticeLanes } from "@/components/ficha/PracticeLanes";
import { ProblemJourney } from "@/components/ficha/ProblemJourney";
import { SeverityCards } from "@/components/ficha/SeverityCards";
import { SourcesGrouped } from "@/components/ficha/SourcesGrouped";
import { OpenQuestions } from "@/components/ficha/OpenQuestions";
import { TradeOffs } from "@/components/ficha/TradeOffs";
import { TreatmentMap } from "@/components/ficha/TreatmentMap";
import { VigenciaTimeline } from "@/components/ficha/VigenciaTimeline";
import { WhenToUse } from "@/components/ficha/WhenToUse";
import {
  approachProps,
  centralIdeaProps,
  cloudCompareProps,
  codeGuideProps,
  controlEvidenceProps,
  controlMatrixProps,
  designBoardProps,
  groupedSourceCount,
  legalFoundationsProps,
  openQuestionsProps,
  practiceLanesProps,
  problemJourneyProps,
  requirementToDataProps,
  severityCardsProps,
  tradeOffsProps,
  sourcesGroupedProps,
  treatmentMapProps,
  vigenciaTimelineProps,
  whenToUseProps,
  type Views,
} from "@/lib/views";

const CLOUD_KEYS = new Set(["gcp", "aws", "azure"]);

function splitPurpose(markdown: string): { purpose: string; context: string } | null {
  const objective = markdown.indexOf("### Objetivo");
  const context = markdown.indexOf("### Contexto normativo");
  if (objective < 0 || context <= objective) {
    return null;
  }
  const before = markdown.slice(0, objective).trim();
  const purpose = [before, markdown.slice(objective, context).trim()].filter(Boolean).join("\n\n");
  const contextBody = markdown.slice(context).replace(/^### Contexto normativo[^\n]*\n?/, "").trim();
  return { purpose, context: contextBody };
}
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

/** ADR-030: el componente de cada marca <!-- view: clave -->, con sus datos del contrato. Sin la vista, no dibuja nada. */
function markedViews(views: Views | undefined): Record<string, ReactNode> {
  const nodes: Record<string, ReactNode> = {};
  if (!views) {
    return nodes;
  }
  if (views.central_idea) nodes.central_idea = <CentralIdea {...centralIdeaProps(views.central_idea)} />;
  if (views.vigencia_timeline) nodes.vigencia_timeline = <VigenciaTimeline {...vigenciaTimelineProps(views.vigencia_timeline)} />;
  if (views.treatment_map) nodes.treatment_map = <TreatmentMap {...treatmentMapProps(views.treatment_map)} />;
  if (views.problem_journey) nodes.problem_journey = <ProblemJourney {...problemJourneyProps(views.problem_journey)} />;
  if (views.design_board) nodes.design_board = <DesignBoard {...designBoardProps(views.design_board)} />;
  if (views.control_matrix) nodes.control_matrix = <ControlMatrix {...controlMatrixProps(views.control_matrix)} />;
  if (views.when_to_use) nodes.when_to_use = <WhenToUse {...whenToUseProps(views.when_to_use)} />;
  if (views.requirement_to_data) nodes.requirement_to_data = <RequirementToData {...requirementToDataProps(views.requirement_to_data)} />;
  if (views.control_evidence) nodes.control_evidence = <ControlEvidence {...controlEvidenceProps(views.control_evidence)} />;
  if (views.code_guide) nodes.code_guide = <CodeGuide {...codeGuideProps(views.code_guide)} />;
  if (views.cloud_compare) nodes.cloud_compare = <CloudCompare {...cloudCompareProps(views.cloud_compare)} />;
  if (views.practice_lanes) nodes.practice_lanes = <PracticeLanes {...practiceLanesProps(views.practice_lanes)} />;
  if (views.trade_offs) nodes.trade_offs = <TradeOffs {...tradeOffsProps(views.trade_offs)} />;
  if (views.severity_cards) nodes.severity_cards = <SeverityCards {...severityCardsProps(views.severity_cards)} />;
  if (views.open_questions) nodes.open_questions = <OpenQuestions {...openQuestionsProps(views.open_questions)} />;
  return nodes;
}

function sectionModels(
  sections: Section[],
  sources: SourceRef[],
  obligations: readonly ObligationBasis[],
  slug: string,
  conceptRefs: ConceptRefs,
  kind: string,
  views?: Views,
): ReadingSectionModel[] {
  const viewNodes = markedViews(views);
  const architecture = kind === "architecture";
  const styleArrows = slug !== "data-lineage";
  const titleOf = (section: Section) => (architecture ? architectureTitle(section.key, section.title) : section.title);
  const ordered = [...sections]
    .sort((left, right) => left.number - right.number)
    .map((section) =>
      slug === "chile-data-protection" ? { ...section, markdown: hideOwnerName(section.markdown) } : section,
    );
  const viewer = currentViewer();
  const showHistory = canViewChangeHistory(viewer);
  const showLab = canViewRelatedLab(viewer);
  const models: ReadingSectionModel[] = [];
  let clouds: ReadingSectionModel[] = [];

  function flushClouds() {
    models.push(...clouds);
    clouds = [];
  }

  const body = (section: Section, extra: { etiquetaColumn?: boolean } = {}) => (
    <MarkdownBody
      markdown={section.markdown}
      obligations={obligations}
      conceptRefs={conceptRefs}
      markCodeStatus={architecture}
      horizontalDiagrams={section.key === "architecture"}
      styleArrows={styleArrows}
      views={viewNodes}
      {...extra}
    />
  );

  for (const section of ordered) {
    if (section.key === "change_history" && !showHistory) {
      continue;
    }
    if (section.key === "last_verified" && slug === "chile-data-protection") {
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
        body: (
          <MarkdownBody markdown={section.markdown} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus styleArrows={styleArrows} views={viewNodes} />
        ),
      });
      continue;
    }
    if (section.key === "summary") {
      flushClouds();
      const opening = slug === "chile-data-protection" ? splitPurpose(section.markdown) : null;
      if (opening) {
        const approach = views?.approach ? <ApproachBoard {...approachProps(views.approach)} /> : null;
        models.push({
          number: section.number,
          key: "purpose",
          title: "Propósito",
          presentation: "summary",
          listed: true,
          body: (
            <>
              {body({ ...section, markdown: opening.purpose })}
              {approach}
            </>
          ),
        });
        models.push({
          number: section.number + 0.5,
          key: "context",
          title: "Contexto normativo",
          presentation: "details",
          listed: true,
          body: body({ ...section, markdown: opening.context }),
        });
      } else {
        models.push({
          number: section.number,
          key: section.key,
          title: titleOf(section),
          presentation: "summary",
          listed: text,
          body: text ? body(section) : null,
        });
        if (views?.approach) {
          const approach = approachProps(views.approach);
          models.push({
            number: 30,
            key: "approach",
            title: approach.title,
            presentation: "details",
            listed: false,
            annex: true,
            body: <ApproachBoard {...approach} />,
          });
        }
      }
      continue;
    }
    if (CLOUD_KEYS.has(section.key) && views?.cloud_compare) {
      flushClouds();
      if (text) {
        models.push({
          number: section.number,
          key: "cloud_compare",
          title: views.cloud_compare.title,
          presentation: "details",
          listed: true,
          body: body(section),
        });
      }
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
        body: body(section, { etiquetaColumn: true }),
      });
      continue;
    }
    flushClouds();
    if (section.key === "what_is" && slug === "chile-data-protection") {
      const foundations = views?.legal_foundations ? legalFoundationsProps(views.legal_foundations) : null;
      models.push({
        number: section.number,
        key: section.key,
        title: foundations?.title ?? titleOf(section),
        presentation: "details",
        listed: true,
        body: (
          <>
            <LegalFoundations roles={foundations?.roles} principles={foundations?.principles} />
            <p>
              <a href="#s23">Detalle por tema y artículo en el Anexo · Catálogo legal</a>
            </p>
          </>
        ),
      });
      continue;
    }
    if (section.key === "sources") {
      const showList = sources.length > 0;
      if (!text && !showList) {
        continue;
      }
      if (views?.sources_grouped) {
        models.push({
          number: section.number,
          key: section.key,
          title: titleOf(section),
          presentation: "details",
          listed: true,
          body: <SourcesGrouped {...sourcesGroupedProps(views.sources_grouped)} />,
        });
        continue;
      }
      models.push({
        number: section.number,
        key: section.key,
        title: titleOf(section),
        presentation: "details",
        listed: true,
        body: showList ? (
          <SourceLinks sources={sources} />
        ) : (
          <MarkdownBody markdown={section.markdown} obligations={obligations} conceptRefs={conceptRefs} markCodeStatus={architecture} styleArrows={styleArrows} />
        ),
      });
      continue;
    }
    if (!text) {
      continue;
    }
    if (section.key === "trade_offs" && slug === "chile-data-protection" && section.markdown.includes("### Sanciones")) {
      flushClouds();
      const cut = section.markdown.indexOf("### Sanciones");
      const tradeMarkdown = section.markdown.slice(0, cut).trim();
      const sanctionsMarkdown = section.markdown.slice(cut).replace(/^### Sanciones[^\n]*\n?/, "").trim();
      models.push({
        number: section.number,
        key: section.key,
        title: titleOf(section),
        presentation: "details",
        listed: true,
        body: body({ ...section, markdown: tradeMarkdown }),
      });
      models.push({
        number: section.number + 0.5,
        key: "sanctions",
        title: "Sanciones",
        presentation: "details",
        listed: true,
        body: body({ ...section, markdown: sanctionsMarkdown }),
      });
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
      body: body(section),
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

export async function ConceptArticle({ slug }: { slug: string }) {
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
      sourceCount={groupedSourceCount(data.views?.sources_grouped, data.sources.length)}
      crumb={crumb}
      next={next}
      construction={!domainOpen}
      sections={[
        ...sectionModels(sections, data.sources, data.legal_basis, data.slug, conceptRefs, data.kind, data.views),
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

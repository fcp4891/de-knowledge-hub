/**
 * ADR-030: del contrato (`views`, snake_case) a las props de cada componente de la ficha (camelCase).
 * Cada función es un renombre 1:1; no agrega ni deduce datos. Los textos marcados como «rich» admiten
 * Markdown en línea ([rótulo](https://…), **negrita**, *cursiva*, `código`) y se dibujan con RichText.
 */
import type { components } from "@/lib/api/schema";

export type Views = components["schemas"]["Views"];
type V = Required<Views>;

export type Titled = { title: string; text: string };
export type Label = { title: string; detail?: string };
export type Cite = { title: string; href: string; detail: string };
export type Tag = { kind?: string; label: string; legal?: boolean; href?: string; section?: number };

export type CentralIdeaProps = {
  checksTitle: string;
  checks: string[];
  status: string;
  risksTitle: string;
  risks: { text: string; tag: string }[];
  closing: string;
};

export type TimelineState = "past" | "current" | "proposed";

export type VigenciaTimelineProps = {
  intro?: string;
  introMark?: string;
  items: {
    date: string;
    title: string;
    detail: string;
    links?: { label: string; href: string }[];
    note?: string;
    icon?: "calendar" | "institution";
    state: TimelineState;
  }[];
  asOf: string;
};

export type TreatmentMapProps = {
  lead: string;
  lawLabel: Label;
  techLabel: Label;
  verbs: { verb: string; practice: string; examples: string }[];
  conclusion: string;
  note: string;
  sources: Cite[];
};

export type ApproachProps = {
  title: string;
  intro: string;
  stepLabel: string;
  exampleLabel?: Label;
  referenceLabel?: Label;
  steps: { name: string; description: string; example?: string; reference?: string }[];
  notes: Titled[];
  sources: Cite[];
};

export type RolesProps = {
  caption?: string;
  responsible: {
    title: string;
    lead: string;
    decide: { kicker: string; items: Titled[] };
    evaluate?: { kicker: string; items: Titled[] };
    build: { kicker: string; items: Titled[] };
  };
  processor: Titled & { alert?: Titled };
  source?: Cite;
};

export type LegalFoundationsProps = { title: string; roles: RolesProps; principles: { label: string; tags: Tag[] }[] };

export type ProblemJourneyProps = {
  question: { kicker: string; text: string };
  lead: string;
  labels: { route: string; without: string; with: string };
  stages: { title: string; detail: string; gap: string; gapMark: "?" | "×"; control: string }[];
  note: string;
};

export type DesignBoardProps = {
  intro: string;
  /** id: ancla explícita del contrato (ADR-030, enmienda 2), p. ej. #como-funciona-01. */
  groups: { title: string; items: { id?: string; number: string; question: string; text: string; arq?: boolean; tags: Tag[] }[] }[];
};

export type ControlMatrixProps = {
  id?: string;
  title: string;
  legend: string;
  headers: string[];
  rows: { id?: string; name: string; bases: string[]; code?: string; risk: string; control: string; check: string; evidence: string }[];
  closing: string;
};

export type WhenToUseProps = {
  intro: string;
  groups: { title: string; hint: string; items: { title: string; text: string; legal?: boolean; tags: Tag[] }[] }[];
};

export type RequirementToDataProps = {
  title: string;
  lead: string;
  governance: { kicker: Label; items: (Label & { highlight?: boolean })[]; legend: string[] };
  data: {
    kicker: Label;
    stages: { title: string; detail?: string; pill?: string; tone: "end" | "layer"; highlight?: boolean }[];
    /** ADR-030 enmienda 9: una o varias franjas punteadas. */
    banners: string[];
  };
};

export type ControlEvidenceProps = {
  id?: string;
  title: string;
  lead: string;
  /** ADR-030 enmienda 9: un ítem puede llevar la pastilla de su pista («Lo nuevo»). */
  steps: { number: string; title: string; items: (string | { pill: string; text: string })[] }[];
  decide: { number: string; title: string; outcomes: { tone: OutcomeTone; text: string }[] };
  note: string;
  example?: {
    summary: string;
    steps: { title: string; items: { text: string; code?: string }[] }[];
    note: string;
    codeLink?: { label: string; href: string };
  };
};

export type OutcomeTone = "pass" | "fail" | "warn" | "keep";
export type Disclosure = "open" | "closed";

export type CodeGuideProps = {
  /** ADR-030 enmienda 9: rótulo de la línea «escenario → código». */
  exitCodesLabel?: string;
  lead: Titled;
  leadMore?: string[];
  rules?: {
    title?: string;
    summary?: string;
    disclosure?: Disclosure;
    headers: string[];
    items: { id?: string; rule: string; fn: string; requirement: string; finds?: string; count?: number }[];
  };
  notCovered: {
    title: string;
    intro?: string;
    items: Titled[];
    note?: string;
    table?: { lead: Titled; headers: string[]; rows: { item: string; form: string; code: string }[]; disclosure?: Disclosure };
  };
  scenarios?: {
    title: string;
    disclosure?: Disclosure;
    items: { name: string; text: string; exitCode: 0 | 1; fixes?: { finding: string; fix: string }[] }[];
  };
  simplifies: { title: string; items: Titled[] };
  limit: Titled;
};

export type CloudCell = { name: string; text?: string; warn?: string };

export type CloudCompareProps = {
  title: string;
  intro: string;
  alert: Titled;
  headers: string[];
  rows: {
    id?: string;
    need: string;
    meta?: string;
    /** ADR-030 enmienda 5: fila «Dónde busca» y columna «Este ejemplo». */
    tone?: "where";
    own?: { text: string };
    gcp?: CloudCell;
    aws?: CloudCell;
    azure?: CloudCell;
    /** ADR-030 enmienda 9: una celda para las tres nubes. */
    span?: Titled;
  }[];
  closing?: string;
};

export type PracticeItem = { id?: string; title: string; text: string; arq?: boolean; tags?: Tag[] };

export type PracticeLanesProps = {
  start?: Titled;
  lanes: { title: string; items: PracticeItem[] }[];
  cross?: { title: string; label: string; items: PracticeItem[] };
};

export type SeverityCardsProps = {
  levels: {
    name: string;
    level: 1 | 2 | 3;
    article?: string;
    amount: string;
    note?: string;
    examplesLabel?: string;
    examples: string[];
  }[];
  modifiers?: { effect: "up" | "down"; effectLabel: string; title: string; text: string; basis: string }[];
};

export type TradeOffsProps = {
  arq?: boolean;
  resolutionLabel: string;
  /** text es la frase sin partir. a_text y b_text, si vienen, son cada lado. */
  items: { a: string; b: string; text: string; aText?: string; bText?: string; resolution: string }[];
  note?: string;
};

export type OpenQuestionsProps = {
  intro: string;
  checkLabel?: string;
  /** Plantilla con {n} y {total}. */
  counter?: string;
  items: { question: string; tags?: Tag[] }[];
};

export type CitationSource = {
  kind: "citation";
  title: string;
  links: { label?: string; href: string }[];
  publisher: string;
  level: string;
  why?: string;
  provider?: string;
};

export type PageSource = {
  kind: "page";
  title: string;
  page: string;
  label: string;
  why?: string;
  targetAvailability?: "in_review" | "in_development";
};

export type SourcesGroupedProps = {
  /** ADR-030 enmienda 8: título visible bajo el rótulo y títulos de fuente como enlace. */
  heading?: string;
  linkTitles?: boolean;
  /** ADR-030 enmienda 9: leyenda de los niveles de fuente. */
  legend?: string;
  groups: {
    title: string;
    layout?: "list" | "providers";
    sources: (CitationSource | PageSource)[];
  }[];
};

export function centralIdeaProps(view: V["central_idea"]): CentralIdeaProps {
  return {
    checksTitle: view.checks_title,
    checks: view.checks,
    status: view.status,
    risksTitle: view.risks_title,
    risks: view.risks,
    closing: view.closing,
  };
}

export function vigenciaTimelineProps(view: V["vigencia_timeline"]): VigenciaTimelineProps {
  return {
    intro: view.intro,
    introMark: view.intro_mark,
    items: view.items.map((item) => ({
      date: item.date,
      title: item.title,
      detail: item.detail,
      links: item.links,
      note: item.note,
      icon: item.icon as "calendar" | "institution" | undefined,
      state: item.state as TimelineState,
    })),
    asOf: view.as_of,
  };
}

export function treatmentMapProps(view: V["treatment_map"]): TreatmentMapProps {
  return {
    lead: view.lead,
    lawLabel: view.law_label,
    techLabel: view.tech_label,
    verbs: view.verbs,
    conclusion: view.conclusion,
    note: view.note,
    sources: view.sources ?? [],
  };
}

export function approachProps(view: V["approach"]): ApproachProps {
  return {
    title: view.title,
    intro: view.intro,
    stepLabel: view.step_label ?? "Paso",
    exampleLabel: view.example_label,
    referenceLabel: view.reference_label,
    steps: view.steps,
    notes: view.notes ?? [],
    sources: view.sources ?? [],
  };
}

export function legalFoundationsProps(view: V["legal_foundations"]): LegalFoundationsProps {
  return { title: view.title, roles: view.roles, principles: view.principles ?? [] };
}

export function problemJourneyProps(view: V["problem_journey"]): ProblemJourneyProps {
  return {
    question: view.question,
    lead: view.lead,
    labels: view.labels,
    stages: view.stages.map((stage) => ({ ...stage, gapMark: stage.gap_mark as "?" | "×" })),
    note: view.note,
  };
}

export function designBoardProps(view: V["design_board"]): DesignBoardProps {
  return { intro: view.intro, groups: view.groups };
}

export function controlMatrixProps(view: V["control_matrix"]): ControlMatrixProps {
  return { id: view.id, title: view.title, legend: view.legend, headers: view.headers, rows: view.rows, closing: view.closing };
}

export function whenToUseProps(view: V["when_to_use"]): WhenToUseProps {
  return { intro: view.intro, groups: view.groups };
}

export function requirementToDataProps(view: V["requirement_to_data"]): RequirementToDataProps {
  return {
    title: view.title,
    lead: view.lead,
    governance: view.governance,
    data: {
      kicker: view.data.kicker,
      stages: view.data.stages.map((stage) => ({ ...stage, tone: stage.tone as "end" | "layer" })),
      banners: view.data.banners ?? (view.data.banner ? [view.data.banner] : []),
    },
  };
}

export function controlEvidenceProps(view: V["control_evidence"]): ControlEvidenceProps {
  return {
    id: view.id,
    title: view.title,
    lead: view.lead,
    steps: view.steps,
    decide: {
      ...view.decide,
      outcomes: view.decide.outcomes.map((outcome) => ({ ...outcome, tone: outcome.tone as OutcomeTone })),
    },
    note: view.note,
    example: view.example
      ? {
          summary: view.example.summary,
          steps: view.example.steps,
          note: view.example.note,
          codeLink: view.example.code_link,
        }
      : undefined,
  };
}

export function codeGuideProps(view: V["code_guide"]): CodeGuideProps {
  return {
    exitCodesLabel: view.exit_codes_label,
    lead: view.lead,
    leadMore: view.lead_more,
    rules: view.rules && {
      title: view.rules.title,
      summary: view.rules.summary,
      disclosure: view.rules.disclosure as Disclosure | undefined,
      headers: view.rules.headers,
      items: view.rules.items.map((item) => ({
        id: item.id,
        rule: item.rule,
        fn: item.fn,
        requirement: item.requirement,
        finds: item.finds,
        count: item.count,
      })),
    },
    notCovered: {
      title: view.not_covered.title,
      intro: view.not_covered.intro,
      items: view.not_covered.items,
      note: view.not_covered.note,
      table: view.not_covered.table
        ? { ...view.not_covered.table, disclosure: view.not_covered.table.disclosure as Disclosure | undefined }
        : undefined,
    },
    scenarios: view.scenarios && {
      title: view.scenarios.title,
      disclosure: view.scenarios.disclosure as Disclosure | undefined,
      items: view.scenarios.items.map((item) => ({
        name: item.name,
        text: item.text,
        exitCode: item.exit_code as 0 | 1,
        fixes: item.fixes,
      })),
    },
    simplifies: view.simplifies,
    limit: view.limit,
  };
}

export function cloudCompareProps(view: V["cloud_compare"]): CloudCompareProps {
  return {
    title: view.title,
    intro: view.intro,
    alert: view.alert,
    headers: view.headers,
    rows: view.rows,
    closing: view.closing,
  };
}

export function practiceLanesProps(view: V["practice_lanes"]): PracticeLanesProps {
  return { start: view.start, lanes: view.lanes, cross: view.cross };
}

export function severityCardsProps(view: V["severity_cards"]): SeverityCardsProps {
  return {
    levels: view.levels.map((level) => ({
      name: level.name,
      level: level.level as 1 | 2 | 3,
      article: level.article,
      amount: level.amount,
      note: level.note,
      examplesLabel: level.examples_label,
      examples: level.examples,
    })),
    modifiers: (view.modifiers ?? []).map((item) => ({
      effect: item.effect as "up" | "down",
      effectLabel: item.effect_label,
      title: item.title,
      text: item.text,
      basis: item.basis,
    })),
  };
}

export function tradeOffsProps(view: V["trade_offs"]): TradeOffsProps {
  const items = view.items.map((item) => ({
    a: item.a,
    b: item.b,
    text: item.text ?? [item.a_text, item.b_text].filter(Boolean).join(" "),
    aText: item.a_text,
    bText: item.b_text,
    resolution: item.resolution,
  }));
  return { arq: view.arq, resolutionLabel: view.resolution_label, items, note: view.note };
}

export function openQuestionsProps(view: V["open_questions"]): OpenQuestionsProps {
  return { intro: view.intro, checkLabel: view.check_label, counter: view.counter, items: view.items };
}

export function sourcesGroupedProps(view: V["sources_grouped"]): SourcesGroupedProps {
  return {
    heading: view.heading,
    linkTitles: view.link_titles === true,
    legend: view.legend,
    groups: view.groups.map((group) => ({
      title: group.title,
      layout: group.layout as "list" | "providers" | undefined,
      sources: group.sources.flatMap((source): (CitationSource | PageSource)[] => {
        if (source.page && source.label) {
          return [
            {
              kind: "page" as const,
              title: source.title,
              page: source.page,
              label: source.label,
              why: source.why,
              targetAvailability: source.target_availability,
            },
          ];
        }
        if (source.links && source.publisher && source.level) {
          return [
            {
              kind: "citation" as const,
              title: source.title,
              links: source.links,
              publisher: source.publisher,
              level: source.level,
              why: source.why,
              provider: source.provider,
            },
          ];
        }
        return [];
      }),
    })),
  };
}

/** Cantidad de fuentes que muestra el encabezado: entradas agrupadas si hay sources_grouped. */
export function groupedSourceCount(view: V["sources_grouped"] | undefined, fallback: number): number {
  return view ? view.groups.reduce((total, group) => total + group.sources.length, 0) : fallback;
}

/** Partes de un texto con Markdown en línea: enlaces, negrita, cursiva y código (sin HTML). */
export type RichPart =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "code"; value: string };

const RICH = /\[([^\]]+)\]\((https:\/\/[^)\s]+|\/[^)\s]+|#[^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

export function richParts(text: string): RichPart[] {
  const parts: RichPart[] = [];
  let last = 0;
  for (const match of text.matchAll(RICH)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ type: "text", value: text.slice(last, start) });
    if (match[1] != null && match[2] != null) parts.push({ type: "link", value: match[1], href: match[2] });
    else if (match[3] != null) parts.push({ type: "strong", value: match[3] });
    else if (match[4] != null) parts.push({ type: "em", value: match[4] });
    else if (match[5] != null) parts.push({ type: "code", value: match[5] });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

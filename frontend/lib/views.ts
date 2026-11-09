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
export type Tag = { kind?: string; label: string; legal?: boolean; href?: string };

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
    build: { kicker: string; items: Titled[] };
  };
  processor: Titled;
  source?: Cite;
};

export type LegalFoundationsProps = { title: string; roles: RolesProps };

export type ProblemJourneyProps = {
  question: { kicker: string; text: string };
  lead: string;
  labels: { route: string; without: string; with: string };
  stages: { title: string; detail: string; gap: string; gapMark: "?" | "×"; control: string }[];
  note: string;
};

export type DesignBoardProps = {
  intro: string;
  groups: { title: string; items: { number: string; question: string; text: string; arq?: boolean; tags: Tag[] }[] }[];
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
  governance: { kicker: Label; items: Label[]; legend: string[] };
  data: {
    kicker: Label;
    stages: { title: string; detail?: string; pill?: string; tone: "end" | "layer" }[];
    banner: string;
  };
};

export type ControlEvidenceProps = {
  title: string;
  lead: string;
  steps: { number: string; title: string; items: string[] }[];
  decide: { number: string; title: string; outcomes: { tone: "pass" | "fail" | "keep"; text: string }[] };
  note: string;
  example: {
    summary: string;
    steps: { title: string; items: { text: string; code?: string }[] }[];
    note: string;
    codeLink?: { label: string; href: string };
  };
};

export type CodeGuideProps = {
  lead: Titled;
  rules: { headers: string[]; items: { id?: string; rule: string; fn: string; requirement: string }[] };
  notCovered: { title: string; intro: string; items: Titled[] };
  scenarios: { title: string; items: { name: string; text: string; exitCode: 0 | 1 }[] };
  simplifies: { title: string; items: Titled[] };
  limit: Titled;
};

export type CloudCell = { name: string; text: string; warn?: string };

export type CloudCompareProps = {
  title: string;
  intro: string;
  alert: Titled;
  headers: string[];
  rows: { need: string; meta: string; gcp: CloudCell; aws: CloudCell; azure: CloudCell }[];
  closing: string;
};

export type PracticeLanesProps = {
  start?: Titled;
  lanes: { title: string; items: { id?: string; title: string; text: string; arq?: boolean }[] }[];
};

export type SeverityCardsProps = {
  levels: { name: string; level: 1 | 2 | 3; amount: string; note?: string; examples: string[] }[];
};

export type SourcesGroupedProps = {
  groups: {
    title: string;
    layout?: "list" | "providers";
    sources: { title: string; links: { label?: string; href: string }[]; publisher: string; level: string; why?: string; provider?: string }[];
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
  return { title: view.title, roles: view.roles };
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
      banner: view.data.banner,
    },
  };
}

export function controlEvidenceProps(view: V["control_evidence"]): ControlEvidenceProps {
  return {
    title: view.title,
    lead: view.lead,
    steps: view.steps,
    decide: {
      ...view.decide,
      outcomes: view.decide.outcomes.map((outcome) => ({ ...outcome, tone: outcome.tone as "pass" | "fail" | "keep" })),
    },
    note: view.note,
    example: {
      summary: view.example.summary,
      steps: view.example.steps,
      note: view.example.note,
      codeLink: view.example.code_link,
    },
  };
}

export function codeGuideProps(view: V["code_guide"]): CodeGuideProps {
  return {
    lead: view.lead,
    rules: view.rules,
    notCovered: view.not_covered,
    scenarios: {
      title: view.scenarios.title,
      items: view.scenarios.items.map((item) => ({ name: item.name, text: item.text, exitCode: item.exit_code as 0 | 1 })),
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
  return { start: view.start, lanes: view.lanes };
}

export function severityCardsProps(view: V["severity_cards"]): SeverityCardsProps {
  return { levels: view.levels.map((level) => ({ ...level, level: level.level as 1 | 2 | 3 })) };
}

export function sourcesGroupedProps(view: V["sources_grouped"]): SourcesGroupedProps {
  return {
    groups: view.groups.map((group) => ({ ...group, layout: group.layout as "list" | "providers" | undefined })),
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

const RICH = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;

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

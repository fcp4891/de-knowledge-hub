/**
 * ADR-030: del contrato (`views`, snake_case) a las props acordadas de cada componente (camelCase).
 * Cada función es un renombre 1:1; no agrega ni deduce datos.
 */
import type { components } from "@/lib/api/schema";

export type Views = components["schemas"]["Views"];

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
  items: { date: string; title: string; detail: string; links?: { label: string; href: string }[]; state: TimelineState }[];
  asOf: string;
};

export type ApproachProps = {
  title: string;
  intro: string;
  steps: { name: string; description: string }[];
  notes: { title: string; text: string }[];
};

export type PracticeLanesProps = {
  start?: { title: string; text: string };
  lanes: { title: string; items: { title: string; text: string; arq?: boolean }[] }[];
};

export type SeverityCardsProps = {
  levels: { name: string; level: 1 | 2 | 3; amount: string; note?: string; examples: string[] }[];
};

export type SourcesGroupedProps = {
  groups: {
    title: string;
    layout?: "list" | "providers";
    sources: {
      title: string;
      links: { label?: string; href: string }[];
      publisher: string;
      level: string;
      why?: string;
      provider?: string;
    }[];
  }[];
};

type V = Required<Views>;

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
  return { items: view.items.map((item) => ({ ...item, state: item.state as TimelineState })), asOf: view.as_of };
}

export function approachProps(view: V["approach"]): ApproachProps {
  return { title: view.title, intro: view.intro, steps: view.steps, notes: view.notes ?? [] };
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

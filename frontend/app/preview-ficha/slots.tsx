import type { ReactNode } from "react";

import { ApproachBoard } from "@/components/ficha/ApproachBoard";
import { CloudCompare } from "@/components/ficha/CloudCompare";
import { CentralIdea } from "@/components/ficha/CentralIdea";
import { CodeGuide } from "@/components/ficha/CodeGuide";
import { ControlEvidence, RequirementToData } from "@/components/ficha/ControlEvidence";
import { ControlMatrix } from "@/components/ficha/ControlMatrix";
import { DataFlow } from "@/components/ficha/DataFlow";
import { DesignBoard } from "@/components/ficha/DesignBoard";
import { PracticeLanes } from "@/components/ficha/PracticeLanes";
import { ProblemJourney } from "@/components/ficha/ProblemJourney";
import { SeverityCards } from "@/components/ficha/SeverityCards";
import { SourcesGrouped } from "@/components/ficha/SourcesGrouped";
import { TreatmentMap } from "@/components/ficha/TreatmentMap";
import { VigenciaTimeline } from "@/components/ficha/VigenciaTimeline";
import { WhenToUse } from "@/components/ficha/WhenToUse";

type Level = 1 | 2 | 3;

type Views = {
  central_idea?: {
    checks_title: string;
    checks: string[];
    status: string;
    risks_title: string;
    risks: { text: string; tag: string }[];
    closing: string;
  };
  vigencia_timeline?: {
    as_of: string;
    items: {
      date: string;
      title: string;
      detail: string;
      state: string;
      links?: { label: string; href: string }[];
    }[];
  };
  approach?: {
    title: string;
    intro: string;
    steps: { name: string; description: string }[];
    notes?: { title: string; text: string }[];
  };
  practice_lanes?: {
    start?: { title: string; text: string };
    lanes: { title: string; items: { title: string; text: string; arq?: boolean }[] }[];
  };
  severity_cards?: {
    levels: { name: string; level: number; amount: string; note?: string; examples: string[] }[];
  };
  sources_grouped?: {
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
};

function asLevel(value: number): Level | null {
  return value === 1 || value === 2 || value === 3 ? value : null;
}

export function renderPreviewView(id: string, views: unknown): ReactNode | null {
  if (!views || typeof views !== "object") {
    return null;
  }
  const data = views as Views;
  if (id === "design_questions") {
    return <DesignBoard />;
  }
  if (id === "control_matrix") {
    return <ControlMatrix />;
  }
  if (id === "control_evidence") {
    return <ControlEvidence />;
  }
  if (id === "requirement_to_data") {
    return <RequirementToData />;
  }
  if (id === "code_guide") {
    return <CodeGuide />;
  }
  if (id === "cloud_compare") {
    return <CloudCompare />;
  }
  if (id === "when_to_use") {
    return <WhenToUse />;
  }
  if (id === "problem") {
    return <ProblemJourney />;
  }
  if (id === "treatment_map") {
    return <TreatmentMap />;
  }
  if (id === "data_flow") {
    return (
      <DataFlow
        steps={[
          "recolección",
          "ingesta",
          "consulta",
          "transformación",
          "almacenamiento",
          "integración",
          "transmisión",
          "conservación",
          "eliminación",
        ]}
      />
    );
  }
  if (id === "central_idea" && data.central_idea) {
    const idea = data.central_idea;
    return (
      <CentralIdea
        checksTitle={idea.checks_title}
        checks={idea.checks}
        status={idea.status}
        risksTitle={idea.risks_title}
        risks={idea.risks}
        closing={idea.closing}
      />
    );
  }
  if (id === "vigencia_timeline" && data.vigencia_timeline) {
    const href = (includes: string) =>
      data.vigencia_timeline?.items.flatMap((item) => item.links ?? []).find((link) => link.href.includes(includes))?.href;
    return (
      <VigenciaTimeline
        asOf="Estado de la tramitación: 28 de octubre de 2026 · Fuentes: BCN y Senado."
        items={[
          {
            date: "2024-12-13",
            title: "Publicación de la ley",
            detail: "Se publica la Ley 21.719, que moderniza la regulación sobre protección de datos personales en Chile.",
            state: "past",
            icon: "calendar",
            links: [{ label: "BCN", href: href("1209272") ?? "https://www.bcn.cl/leychile/navegar?idNorma=1209272" }],
          },
          {
            date: "2026-10-28",
            title: "Avance legislativo",
            detail: "El Senado aprueba la propuesta de postergación y la envía a la Cámara de Diputados.",
            state: "past",
            icon: "institution",
            links: [
              {
                label: "Boletín 18.623-07",
                href: href("18623-07") ?? "https://tramitacion.senado.cl/appsenado/templates/tramitacion/index.php?boletin_ini=18623-07",
              },
            ],
          },
          {
            date: "2026-12-01",
            title: "Entrada en vigencia",
            detail: "Fecha establecida por la ley, mientras no se publique una modificación.",
            state: "current",
            icon: "calendar",
            note: "Fecha legal indicada",
          },
          {
            date: "2027-12-01",
            title: "Postergación propuesta",
            detail: "Nueva fecha planteada, sujeta a aprobación y publicación como ley.",
            state: "proposed",
            icon: "calendar",
            note: "Proyecto en tramitación",
          },
        ]}
      />
    );
  }
  if (id === "approach" && data.approach) {
    return (
      <ApproachBoard
        title={data.approach.title}
        intro="La ley establece obligaciones y responsabilidades jurídicas. La Ingeniería de Datos contribuye a su cumplimiento con soluciones técnicas adecuadas al contexto, al riesgo y a las decisiones de las áreas responsables. Para estudiar esa relación, es posible utilizar este enfoque:"
      />
    );
  }
  if (id === "practice_lanes" && data.practice_lanes) {
    return <PracticeLanes start={data.practice_lanes.start} lanes={data.practice_lanes.lanes} />;
  }
  if (id === "severity_cards" && data.severity_cards) {
    const levels = data.severity_cards.levels.flatMap((item) => {
      const level = asLevel(item.level);
      return level ? [{ ...item, level }] : [];
    });
    return <SeverityCards levels={levels} />;
  }
  if (id === "sources_grouped" && data.sources_grouped) {
    return <SourcesGrouped groups={data.sources_grouped.groups} />;
  }
  return null;
}

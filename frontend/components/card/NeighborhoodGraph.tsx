"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { EntityType, RelationGroups } from "@/lib/api/types";
import { entityHref } from "@/lib/entityHref";
import { RELATION_LABEL } from "@/lib/labels";

const ENTITY_COLOR: Record<string, string> = {
  concept: "#1f4d3a",
  pattern: "#3d6b4f",
  architecture: "#245c7a",
  technology: "#6b4a1f",
  cloud_service: "#8a6230",
  source: "#5e584f",
  code_snippet: "#4a3f6b",
  lab: "#3f4a6b",
};

const ENTITY_LABEL: Record<string, string> = {
  concept: "concepto",
  pattern: "patrón",
  architecture: "arquitectura",
  technology: "tecnología",
  cloud_service: "servicio cloud",
  source: "fuente",
  code_snippet: "snippet",
  lab: "laboratorio",
  news: "noticia",
  release: "release",
  job_description: "descripción de puesto",
  interview_question: "pregunta de entrevista",
  personal_note: "nota",
};

function colorOf(entityType: string): string {
  return ENTITY_COLOR[entityType] ?? "#5e584f";
}

function labelOf(entityType: string): string {
  return ENTITY_LABEL[entityType] ?? entityType.replaceAll("_", " ");
}

export function NeighborhoodGraph({
  center,
  groups,
}: {
  center: { slug: string; title: string; entityType: EntityType };
  groups: RelationGroups["groups"];
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const present = new Set<string>([center.entityType]);
  for (const group of groups) {
    for (const item of group.items) {
      present.add(item.entity_type);
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let destroyed = false;
    let graph: { destroy: () => void } | null = null;

    void import("cytoscape").then(({ default: cytoscape }) => {
      if (destroyed) {
        return;
      }

      const nodes = new Map<string, { id: string; label: string; entityType: string; center: boolean }>();
      nodes.set(center.slug, {
        id: center.slug,
        label: center.title,
        entityType: center.entityType,
        center: true,
      });

      const edges: {
        id: string;
        source: string;
        target: string;
        label: string;
        blueprint: boolean;
        both: boolean;
      }[] = [];

      for (const group of groups) {
        const relation = RELATION_LABEL[group.label] ?? group.label.replaceAll("_", " ");
        for (const item of group.items) {
          if (!nodes.has(item.slug)) {
            nodes.set(item.slug, {
              id: item.slug,
              label: item.title,
              entityType: item.entity_type,
              center: false,
            });
          }
          const outgoing = group.direction !== "incoming";
          const source = outgoing ? center.slug : item.slug;
          const target = outgoing ? item.slug : center.slug;
          if (source === target) {
            continue;
          }
          edges.push({
            id: `${group.type}-${group.direction}-${item.origin}-${item.slug}`,
            source,
            target,
            label: relation,
            blueprint: item.origin === "blueprint",
            both: group.direction === "both",
          });
        }
      }

      const cy = cytoscape({
        container,
        elements: [
          ...[...nodes.values()].map((node) => ({
            data: {
              id: node.id,
              label: node.label,
              entityType: node.entityType,
              color: colorOf(node.entityType),
            },
            classes: node.center ? "center" : "",
          })),
          ...edges.map((edge) => ({
            data: edge,
            classes: [edge.blueprint ? "blueprint" : "entity", edge.both ? "both" : ""].filter(Boolean).join(" "),
          })),
        ],
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": "data(color)",
              color: "#1c1915",
              "font-size": 10,
              "text-wrap": "wrap",
              "text-max-width": "72px",
              width: 22,
              height: 22,
              "text-valign": "bottom",
              "text-margin-y": 4,
            },
          },
          {
            selector: "node.center",
            style: {
              width: 30,
              height: 30,
              "border-width": 2,
              "border-color": "#1c1915",
            },
          },
          {
            selector: "edge",
            style: {
              width: 1.5,
              "line-color": "#5e584f",
              "target-arrow-color": "#5e584f",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": 8,
              color: "#5e584f",
              "text-rotation": "autorotate",
              "text-margin-y": -8,
            },
          },
          {
            selector: "edge.blueprint",
            style: { "line-style": "dashed" },
          },
          {
            selector: "edge.both",
            style: {
              "source-arrow-shape": "triangle",
              "source-arrow-color": "#5e584f",
            },
          },
        ],
        layout: {
          name: "breadthfirst",
          roots: [center.slug],
          directed: true,
          spacingFactor: 1.15,
          padding: 12,
        },
        userZoomingEnabled: false,
        userPanningEnabled: false,
      });

      cy.on("tap", "node", (event) => {
        const slug = event.target.id();
        if (slug === center.slug) {
          return;
        }
        const entityType = event.target.data("entityType") as EntityType;
        router.push(entityHref(entityType, slug));
      });
      cy.fit(undefined, 16);
      graph = cy;
    });

    return () => {
      destroyed = true;
      graph?.destroy();
    };
  }, [center.entityType, center.slug, center.title, groups, router]);

  return (
    <div className="neighborhood-wrap">
      <div ref={containerRef} className="neighborhood" role="img" aria-label={`Vecindario de ${center.title}`} />
      <ul className="neighborhood-legend">
        {[...present].map((entityType) => (
          <li key={entityType}>
            <span className="swatch" style={{ background: colorOf(entityType) }} />
            {labelOf(entityType)}
          </li>
        ))}
        <li>
          <span className="legend-line" />
          entidad
        </li>
        <li>
          <span className="legend-line dashed" />
          blueprint
        </li>
      </ul>
    </div>
  );
}

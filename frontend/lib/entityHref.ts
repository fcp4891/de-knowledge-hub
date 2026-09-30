import type { EntityType, ResultType } from "./api/types";

export function entityHref(entityType: EntityType, slug: string): string {
  if (entityType === "technology" || entityType === "cloud_service") {
    return `/technologies/${slug}`;
  }
  return `/concepts/${slug}`;
}

export function resultHref(type: ResultType, slug: string): string | null {
  if (type === "source") {
    return null;
  }
  if (type === "technology" || type === "cloud_service") {
    return `/technologies/${slug}`;
  }
  return `/concepts/${slug}`;
}

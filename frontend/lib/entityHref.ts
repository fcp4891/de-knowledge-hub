import type { EntityType } from "./api/types";

export function entityHref(entityType: EntityType, slug: string): string {
  if (entityType === "technology" || entityType === "cloud_service") {
    return `/technologies/${slug}`;
  }
  return `/concepts/${slug}`;
}

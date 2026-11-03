import { CONSTRUCTION_BANNER } from "@/lib/publishedScope";

export function ConstructionBanner() {
  return (
    <p className="scope-banner" role="status">
      {CONSTRUCTION_BANNER}
    </p>
  );
}

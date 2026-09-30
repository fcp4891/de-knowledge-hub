import { MockMiss } from "@/components/MockMiss";
import type { ApiResult } from "@/lib/api/types";

export function ApiFailure({ result, slug }: { result: Extract<ApiResult<unknown>, { ok: false }>; slug?: string }) {
  if (result.reason === "mock_missing") {
    return <MockMiss slug={slug} />;
  }
  if (result.reason === "not_found") {
    return <p>No existe.</p>;
  }
  return <p role="status">{result.detail ?? "No se pudo contactar la API."}</p>;
}

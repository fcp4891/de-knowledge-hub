import { search } from "@/lib/api/client";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const result = await search(query);
  return Response.json(result);
}

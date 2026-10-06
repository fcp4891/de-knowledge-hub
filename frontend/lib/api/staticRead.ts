import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ApiResult } from "./types";

const DATA_ROOT = path.join(process.cwd(), "public", "data");

type Index = Record<string, string>;

let indexPromise: Promise<Index> | undefined;

function loadIndex(): Promise<Index> {
  indexPromise ??= readFile(path.join(DATA_ROOT, "index.json"), "utf8").then(
    (text) => JSON.parse(text) as Index,
  );
  return indexPromise;
}

async function readRelative<T>(relative: string): Promise<T> {
  const text = await readFile(path.join(DATA_ROOT, relative), "utf8");
  return JSON.parse(text) as T;
}

type ListPage = { items: Record<string, unknown>[] };

function baseListKey(pathname: string): string | null {
  if (pathname === "/concepts") {
    return "GET /concepts?limit=500";
  }
  if (pathname === "/snippets") {
    return "GET /snippets?limit=500";
  }
  if (pathname === "/technologies") {
    return "GET /technologies?limit=500";
  }
  return null;
}

function matchesQuery(item: Record<string, unknown>, params: URLSearchParams): boolean {
  const domain = params.get("domain");
  if (domain && item.domain !== domain) {
    return false;
  }
  const subdomain = params.get("subdomain");
  if (subdomain && item.subdomain !== subdomain) {
    return false;
  }
  const kind = params.get("kind");
  if (kind && item.kind !== kind) {
    return false;
  }
  const classification = params.get("classification");
  if (classification && item.classification !== classification) {
    return false;
  }
  const level = params.get("level");
  if (level && item.level !== level) {
    return false;
  }
  const mvp = params.get("mvp");
  if (mvp === "true" || mvp === "false") {
    if (item.mvp !== (mvp === "true")) {
      return false;
    }
  }
  const hasPage = params.get("has_page");
  if (hasPage === "true" || hasPage === "false") {
    if (item.has_page !== (hasPage === "true")) {
      return false;
    }
  }
  const language = params.get("language");
  if (language && item.language !== language) {
    return false;
  }
  const cloud = params.get("cloud");
  if (cloud && !(Array.isArray(item.cloud) && item.cloud.includes(cloud))) {
    return false;
  }
  const implemented = params.get("implements");
  if (implemented && !(Array.isArray(item.implements) && item.implements.includes(implemented))) {
    return false;
  }
  return true;
}

async function filterList<T>(index: Index, key: string): Promise<ApiResult<T> | null> {
  const match = /^GET (\/[^?]*)\?(.*)$/.exec(key);
  if (!match) {
    return null;
  }
  const listKey = baseListKey(match[1]);
  const relative = listKey ? index[listKey] : undefined;
  if (!relative) {
    return null;
  }
  const page = await readRelative<ListPage>(relative);
  const params = new URLSearchParams(match[2]);
  const items = page.items.filter((item) => matchesQuery(item, params));
  const limit = Number(params.get("limit") ?? "50");
  const offset = Number(params.get("offset") ?? "0");
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;
  const safeOffset = Number.isFinite(offset) && offset > 0 ? offset : 0;
  return {
    ok: true,
    data: {
      total: items.length,
      limit: safeLimit,
      offset: safeOffset,
      items: items.slice(safeOffset, safeOffset + safeLimit),
    } as T,
  };
}

/** Lee un JSON de public/data/ según la clave de index.json. */
export async function readStatic<T>(key: string): Promise<ApiResult<T>> {
  try {
    const index = await loadIndex();
    const relative = index[key];
    if (relative) {
      return { ok: true, data: await readRelative<T>(relative) };
    }
    const filtered = await filterList<T>(index, key);
    if (filtered) {
      return filtered;
    }
    return { ok: false, reason: "not_found" };
  } catch {
    return { ok: false, reason: "unavailable", detail: "No se pudieron leer los datos estáticos." };
  }
}

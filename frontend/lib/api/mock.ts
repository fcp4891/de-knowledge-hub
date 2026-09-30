import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ApiResult } from "./types";

const MOCK_ROOT = path.join(process.cwd(), "..", "docs", "contracts", "mock-data");

type MockIndex = Record<string, string>;

let indexPromise: Promise<MockIndex> | undefined;

function loadIndex(): Promise<MockIndex> {
  indexPromise ??= readFile(path.join(MOCK_ROOT, "index.json"), "utf8").then(
    (text) => JSON.parse(text) as MockIndex,
  );
  return indexPromise;
}

/** Devuelve el JSON del índice, en el orden en que está guardado. */
export async function readMock<T>(key: string): Promise<ApiResult<T>> {
  const index = await loadIndex();
  const relative = index[key];
  if (!relative) {
    return { ok: false, reason: "mock_missing" };
  }
  const text = await readFile(path.join(MOCK_ROOT, relative), "utf8");
  return { ok: true, data: JSON.parse(text) as T };
}

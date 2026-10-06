import type { ApiResult, Favorite, Note, StudyState, StudyStatus } from "@/lib/api/types";

function unused<T>(): ApiResult<T> {
  return { ok: false, reason: "unavailable", detail: "En la demo estática el estado se guarda en el navegador." };
}

function ignore(...values: unknown[]): void {
  void values;
}

export function saveStudyState(
  slug: string,
  state: StudyStatus,
  pendingDeepDive: boolean,
): Promise<ApiResult<StudyState>> {
  ignore(slug, state, pendingDeepDive);
  return Promise.resolve(unused());
}

export function saveFavorite(slug: string, favorite: boolean): Promise<ApiResult<Favorite>> {
  ignore(slug, favorite);
  return Promise.resolve(unused());
}

export function addNote(slug: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  ignore(slug, bodyMarkdown);
  return Promise.resolve(unused());
}

export function editNote(slug: string, noteId: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  ignore(slug, noteId, bodyMarkdown);
  return Promise.resolve(unused());
}

export function removeNote(slug: string, noteId: string): Promise<ApiResult<null>> {
  ignore(slug, noteId);
  return Promise.resolve(unused());
}

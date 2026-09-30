"use server";

import { revalidatePath } from "next/cache";

import { createNote, deleteNote, putFavorite, putStudyState, updateNote } from "@/lib/api/client";
import type { ApiResult, Favorite, Note, StudyState, StudyStatus } from "@/lib/api/types";

function refresh(slug: string) {
  revalidatePath("/");
  revalidatePath(`/concepts/${slug}`);
  revalidatePath(`/technologies/${slug}`);
}

export async function saveStudyState(
  slug: string,
  state: StudyStatus,
  pendingDeepDive: boolean,
): Promise<ApiResult<StudyState>> {
  const result = await putStudyState(slug, {
    state,
    pending_deep_dive: pendingDeepDive,
    last_studied_at: new Date().toISOString(),
  });
  if (result.ok) {
    refresh(slug);
  }
  return result;
}

export async function saveFavorite(slug: string, favorite: boolean): Promise<ApiResult<Favorite>> {
  const result = await putFavorite(slug, favorite);
  if (result.ok) {
    refresh(slug);
  }
  return result;
}

export async function addNote(slug: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  const result = await createNote(slug, bodyMarkdown);
  if (result.ok) {
    refresh(slug);
  }
  return result;
}

export async function editNote(slug: string, noteId: string, bodyMarkdown: string): Promise<ApiResult<Note>> {
  const result = await updateNote(slug, noteId, bodyMarkdown);
  if (result.ok) {
    refresh(slug);
  }
  return result;
}

export async function removeNote(slug: string, noteId: string): Promise<ApiResult<null>> {
  const result = await deleteNote(slug, noteId);
  if (result.ok) {
    refresh(slug);
  }
  return result;
}

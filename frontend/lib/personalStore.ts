import type { Favorite, Note, StudyState, StudyStatus } from "@/lib/api/types";

const STORAGE_KEY = "dekh.personal";
const CHANGE_EVENT = "dekh-personal";

type Store = {
  study: Record<string, StudyState>;
  favorites: Record<string, Favorite>;
  notes: Record<string, Note[]>;
};

function emptyStore(): Store {
  return { study: {}, favorites: {}, notes: {} };
}

function readStore(): Store {
  if (typeof window === "undefined") {
    return emptyStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStore();
    }
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      study: parsed.study ?? {},
      favorites: parsed.favorites ?? {},
      notes: parsed.notes ?? {},
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePersonal(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function now(): string {
  return new Date().toISOString();
}

export function defaultStudy(slug: string): StudyState {
  return {
    slug,
    state: "not_reviewed",
    pending_deep_dive: false,
    last_studied_at: null,
    updated_at: null,
  };
}

export function loadStudy(slug: string): StudyState {
  return readStore().study[slug] ?? defaultStudy(slug);
}

export function saveStudy(slug: string, state: StudyStatus, pendingDeepDive: boolean): StudyState {
  const store = readStore();
  const next: StudyState = {
    slug,
    state,
    pending_deep_dive: pendingDeepDive,
    last_studied_at: now(),
    updated_at: now(),
  };
  store.study[slug] = next;
  writeStore(store);
  return next;
}

export function listStoredStudy(): StudyState[] {
  return Object.values(readStore().study).sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
}

export function loadFavorite(slug: string): Favorite {
  return readStore().favorites[slug] ?? { slug, favorite: false, updated_at: null };
}

export function saveFavorite(slug: string, favorite: boolean): Favorite {
  const store = readStore();
  const next: Favorite = { slug, favorite, updated_at: now() };
  store.favorites[slug] = next;
  writeStore(store);
  return next;
}

export function loadNotes(slug: string): Note[] {
  return readStore().notes[slug] ?? [];
}

export function addStoredNote(slug: string, bodyMarkdown: string): Note {
  const store = readStore();
  const stamp = now();
  const note: Note = {
    id: crypto.randomUUID(),
    slug,
    body_markdown: bodyMarkdown,
    created_at: stamp,
    updated_at: stamp,
  };
  store.notes[slug] = [...(store.notes[slug] ?? []), note];
  writeStore(store);
  return note;
}

export function editStoredNote(slug: string, noteId: string, bodyMarkdown: string): Note | null {
  const store = readStore();
  const notes = store.notes[slug] ?? [];
  const current = notes.find((note) => note.id === noteId);
  if (!current) {
    return null;
  }
  const next: Note = { ...current, body_markdown: bodyMarkdown, updated_at: now() };
  store.notes[slug] = notes.map((note) => (note.id === noteId ? next : note));
  writeStore(store);
  return next;
}

export function removeStoredNote(slug: string, noteId: string) {
  const store = readStore();
  store.notes[slug] = (store.notes[slug] ?? []).filter((note) => note.id !== noteId);
  writeStore(store);
}

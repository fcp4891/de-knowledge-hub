import { readMock } from "./mock";
import type {
  ApiResult,
  Favorite,
  Note,
  NoteList,
  StudyState,
  StudyStateList,
  StudyStateUpdate,
  StudyStatus,
} from "./types";

type Store = {
  study: Map<string, StudyState>;
  studySeeded: boolean;
  favorites: Map<string, Favorite>;
  favoritesSeeded: boolean;
  notes: Map<string, Note[]>;
};

function store(): Store {
  const globalStore = globalThis as typeof globalThis & { __hubPersonal?: Store };
  globalStore.__hubPersonal ??= {
    study: new Map(),
    studySeeded: false,
    favorites: new Map(),
    favoritesSeeded: false,
    notes: new Map(),
  };
  return globalStore.__hubPersonal;
}

const STUDY_STATES: StudyStatus[] = [
  "not_reviewed",
  "reviewing",
  "understood",
  "applied",
  "needs_review",
];

function byRecent(left: { updated_at: string | null }, right: { updated_at: string | null }): number {
  return (right.updated_at ?? "").localeCompare(left.updated_at ?? "");
}

async function seedStudy(): Promise<void> {
  const current = store();
  if (current.studySeeded) {
    return;
  }
  const listed = await readMock<StudyStateList>("GET /me/study-state");
  if (listed.ok) {
    for (const item of listed.data.items) {
      current.study.set(item.slug, item);
    }
  }
  current.studySeeded = true;
}

async function seedFavorites(): Promise<void> {
  const current = store();
  if (current.favoritesSeeded) {
    return;
  }
  const listed = await readMock<{ items: Favorite[] }>("GET /me/favorites");
  if (listed.ok) {
    for (const item of listed.data.items) {
      current.favorites.set(item.slug, item);
    }
  }
  current.favoritesSeeded = true;
}

export async function listPersonalStudyStates(state?: StudyStatus): Promise<ApiResult<StudyStateList>> {
  await seedStudy();
  const items = [...store().study.values()]
    .filter((item) => (state ? item.state === state : true))
    .sort(byRecent);
  return { ok: true, data: { items, total: items.length, limit: 50, offset: 0 } };
}

export async function getPersonalStudyState(slug: string): Promise<ApiResult<StudyState>> {
  await seedStudy();
  const saved = store().study.get(slug);
  if (saved) {
    return { ok: true, data: saved };
  }
  const file = await readMock<StudyState>(`GET /me/study-state/${slug}`);
  if (file.ok) {
    store().study.set(slug, file.data);
    return file;
  }
  return {
    ok: true,
    data: {
      slug,
      state: "not_reviewed",
      pending_deep_dive: false,
      last_studied_at: null,
      updated_at: null,
    },
  };
}

export async function putPersonalStudyState(
  slug: string,
  update: StudyStateUpdate,
): Promise<ApiResult<StudyState>> {
  if (!STUDY_STATES.includes(update.state)) {
    return { ok: false, reason: "validation", detail: "Estado de estudio no válido." };
  }
  await seedStudy();
  const saved: StudyState = {
    slug,
    state: update.state,
    pending_deep_dive: update.pending_deep_dive ?? false,
    last_studied_at: update.last_studied_at ?? null,
    updated_at: new Date().toISOString(),
  };
  store().study.set(slug, saved);
  return { ok: true, data: saved };
}

export async function getPersonalFavorite(slug: string): Promise<ApiResult<Favorite>> {
  await seedFavorites();
  const saved = store().favorites.get(slug);
  if (saved) {
    return { ok: true, data: saved };
  }
  const file = await readMock<Favorite>(`GET /me/favorites/${slug}`);
  if (file.ok) {
    store().favorites.set(slug, file.data);
    return file;
  }
  return { ok: true, data: { slug, favorite: false, updated_at: null } };
}

export async function putPersonalFavorite(slug: string, favorite: boolean): Promise<ApiResult<Favorite>> {
  await seedFavorites();
  const saved: Favorite = { slug, favorite, updated_at: new Date().toISOString() };
  store().favorites.set(slug, saved);
  return { ok: true, data: saved };
}

async function notesFor(slug: string): Promise<Note[]> {
  const current = store();
  const saved = current.notes.get(slug);
  if (saved) {
    return saved;
  }
  const file = await readMock<NoteList>(`GET /me/notes/${slug}`);
  const items = file.ok ? file.data.items : [];
  current.notes.set(slug, items);
  return items;
}

export async function listPersonalNotes(slug: string): Promise<ApiResult<NoteList>> {
  const items = await notesFor(slug);
  return { ok: true, data: { slug, items } };
}

export async function createPersonalNote(slug: string, body: string): Promise<ApiResult<Note>> {
  const bodyMarkdown = body.trim();
  if (bodyMarkdown.length < 1 || bodyMarkdown.length > 20000) {
    return { ok: false, reason: "validation", detail: "La nota debe tener entre 1 y 20000 caracteres." };
  }
  const items = await notesFor(slug);
  const now = new Date().toISOString();
  const note: Note = {
    id: `note-${crypto.randomUUID()}`,
    slug,
    body_markdown: bodyMarkdown,
    created_at: now,
    updated_at: now,
  };
  items.unshift(note);
  return { ok: true, data: note };
}

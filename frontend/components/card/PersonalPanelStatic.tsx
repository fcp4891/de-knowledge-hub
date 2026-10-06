"use client";

import { useEffect, useState } from "react";

import type { Favorite, Note, StudyState, StudyStatus } from "@/lib/api/types";
import { STUDY_LABEL } from "@/lib/labels";
import {
  addStoredNote,
  editStoredNote,
  loadFavorite,
  loadNotes,
  loadStudy,
  removeStoredNote,
  saveFavorite as storeFavorite,
  saveStudy,
} from "@/lib/personalStore";

const STUDY_STATES: StudyStatus[] = ["not_reviewed", "reviewing", "understood", "applied", "needs_review"];

function formatWhen(value: string | null): string {
  if (!value) {
    return "sin fecha de estudio";
  }
  return value.replace("T", " ").replace(".000Z", " UTC").replace("Z", " UTC");
}

export function PersonalPanelStatic({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const [study, setStudy] = useState<StudyState | null>(null);
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  useEffect(() => {
    setStudy(loadStudy(slug));
    setFavorite(loadFavorite(slug));
    setNotes(loadNotes(slug));
    setReady(true);
  }, [slug]);

  function persistStudy(state: StudyStatus, pendingDeepDive: boolean) {
    setStudy(saveStudy(slug, state, pendingDeepDive));
    setMessage("Estado guardado.");
  }

  function toggleFavorite() {
    if (!favorite) {
      return;
    }
    const next = storeFavorite(slug, !favorite.favorite);
    setFavorite(next);
    setMessage(next.favorite ? "Marcado como favorito." : "Favorito quitado.");
  }

  function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    addStoredNote(slug, draft.trim());
    setNotes(loadNotes(slug));
    setDraft("");
    setMessage("Nota agregada.");
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    if (editingBody.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    editStoredNote(slug, noteId, editingBody.trim());
    setNotes(loadNotes(slug));
    setEditingId(null);
    setMessage("Nota actualizada.");
  }

  function remove(noteId: string) {
    removeStoredNote(slug, noteId);
    setNotes(loadNotes(slug));
    setMessage("Nota borrada.");
  }

  return (
    <section className="panel personal-panel">
      <h2>Estudio personal</h2>
      <p className="muted">Tus notas se guardan solo en este navegador.</p>
      {ready && study && favorite ? (
        <>
          <p className="meta">
            <span>{formatWhen(study.last_studied_at)}</span>
          </p>
          <div className="personal-form">
            <label>
              Estado de estudio
              <select
                value={study.state}
                onChange={(event) => persistStudy(event.target.value as StudyStatus, study.pending_deep_dive)}
              >
                {STUDY_STATES.map((value) => (
                  <option key={value} value={value}>
                    {STUDY_LABEL[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={study.pending_deep_dive}
                onChange={(event) => persistStudy(study.state, event.target.checked)}
              />
              Pendiente de profundizar
            </label>
          </div>
          <div className="personal-form">
            <button type="button" onClick={toggleFavorite} aria-pressed={favorite.favorite}>
              {favorite.favorite ? "Quitar favorito" : "Marcar favorito"}
            </button>
          </div>
        </>
      ) : (
        <p className="muted">Cargando estudio…</p>
      )}
      <h3>Notas</h3>
      {ready && notes.length === 0 ? <p className="muted">Sin notas.</p> : null}
      {notes.map((note) => (
        <article key={note.id} className="note">
          {editingId === note.id ? (
            <form className="personal-form" onSubmit={(event) => saveEdit(event, note.id)}>
              <label>
                Editar nota
                <textarea
                  value={editingBody}
                  onChange={(event) => setEditingBody(event.target.value)}
                  rows={4}
                  maxLength={20000}
                />
              </label>
              <div className="note-actions">
                <button type="submit">Guardar nota</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <p className="note-body">{note.body_markdown}</p>
          )}
          <p className="meta">
            <span>{formatWhen(note.created_at)}</span>
          </p>
          {editingId === note.id ? null : (
            <div className="note-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingId(note.id);
                  setEditingBody(note.body_markdown);
                }}
              >
                Editar
              </button>
              <button type="button" onClick={() => remove(note.id)}>
                Borrar
              </button>
            </div>
          )}
        </article>
      ))}
      <form className="personal-form" onSubmit={addNote}>
        <label>
          Nueva nota
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} maxLength={20000} />
        </label>
        <button type="submit">Agregar nota</button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}

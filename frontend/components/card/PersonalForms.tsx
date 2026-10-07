"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { addNote, editNote, removeNote, saveFavorite, saveStudyState } from "@/lib/personalActions";
import type { Favorite, Note, StudyState, StudyStatus } from "@/lib/api/types";
import { STUDY_LABEL } from "@/lib/labels";

const STUDY_STATES: StudyStatus[] = [
  "not_reviewed",
  "reviewing",
  "understood",
  "applied",
  "needs_review",
];

export function StudyForm({ slug, current }: { slug: string; current: StudyState }) {
  const router = useRouter();
  const [state, setState] = useState(current.state);
  const [pendingDeepDive, setPendingDeepDive] = useState(current.pending_deep_dive);
  const [message, setMessage] = useState<string | null>(null);
  const latest = useRef({ state: current.state, pendingDeepDive: current.pending_deep_dive });

  async function persist(nextState: StudyStatus, nextPending: boolean) {
    latest.current = { state: nextState, pendingDeepDive: nextPending };
    setState(nextState);
    setPendingDeepDive(nextPending);
    const result = await saveStudyState(slug, nextState, nextPending);
    if (latest.current.state !== nextState || latest.current.pendingDeepDive !== nextPending) {
      return;
    }
    setMessage(result.ok ? "Estado guardado." : (result.detail ?? "No se pudo guardar."));
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <div className="personal-form">
      <label>
        Estado de estudio
        <select
          value={state}
          onChange={(event) =>
            void persist(event.target.value as StudyStatus, latest.current.pendingDeepDive)
          }
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
          checked={pendingDeepDive}
          onChange={(event) => void persist(latest.current.state, event.target.checked)}
        />
        Pendiente de profundizar
      </label>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}

export function FavoriteButton({ slug, current }: { slug: string; current: Favorite }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(current.favorite);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle() {
    const result = await saveFavorite(slug, !favorite);
    if (result.ok) {
      setFavorite(result.data.favorite);
      setMessage(result.data.favorite ? "Marcado como favorito." : "Favorito quitado.");
      router.refresh();
    } else {
      setMessage(result.detail ?? "No se pudo guardar.");
    }
  }

  return (
    <div className="personal-form">
      <button type="button" onClick={() => void toggle()} aria-pressed={favorite}>
        {favorite ? "Quitar favorito" : "Marcar favorito"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}

export function NoteForm({ slug, placeholder }: { slug: string; placeholder?: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (body.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    const result = await addNote(slug, body);
    if (result.ok) {
      setBody("");
      setMessage("Nota agregada.");
      router.refresh();
    } else {
      setMessage(result.detail ?? "No se pudo guardar.");
    }
  }

  return (
    <form className="personal-form" onSubmit={(event) => void onSubmit(event)}>
      <label>
        Nueva nota
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          maxLength={20000}
          placeholder={placeholder}
        />
      </label>
      <button type="submit">Agregar nota</button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}

export function NoteItem({
  slug,
  note,
  when,
  children,
}: {
  slug: string;
  note: Note;
  when: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body_markdown);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (body.trim().length < 1) {
      setMessage("La nota debe tener entre 1 y 20000 caracteres.");
      return;
    }
    const result = await editNote(slug, note.id, body);
    if (result.ok) {
      setEditing(false);
      setMessage("Nota actualizada.");
      router.refresh();
    } else {
      setMessage(result.detail ?? "No se pudo guardar.");
    }
  }

  async function remove() {
    const result = await removeNote(slug, note.id);
    setMessage(result.ok ? "Nota borrada." : (result.detail ?? "No se pudo borrar."));
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <article className="note">
      {editing ? (
        <form className="personal-form" onSubmit={(event) => void save(event)}>
          <label>
            Editar nota
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={20000} />
          </label>
          <div className="note-actions">
            <button type="submit">Guardar nota</button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setBody(note.body_markdown);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        children
      )}
      <p className="meta">
        <span>{when}</span>
      </p>
      {editing ? null : (
        <div className="note-actions">
          <button type="button" onClick={() => setEditing(true)}>
            Editar
          </button>
          <button type="button" onClick={() => void remove()}>
            Borrar
          </button>
        </div>
      )}
      {message ? <p className="muted">{message}</p> : null}
    </article>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { addNote, saveFavorite, saveStudyState } from "@/lib/personalActions";
import type { Favorite, StudyState, StudyStatus } from "@/lib/api/types";
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await saveStudyState(slug, state, pendingDeepDive);
    setMessage(result.ok ? "Estado guardado." : (result.detail ?? "No se pudo guardar."));
    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <form className="personal-form" onSubmit={(event) => void onSubmit(event)}>
      <label>
        Estado de estudio
        <select value={state} onChange={(event) => setState(event.target.value as StudyStatus)}>
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
          onChange={(event) => setPendingDeepDive(event.target.checked)}
        />
        Pendiente de profundizar
      </label>
      <button type="submit">Guardar estado</button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
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

export function NoteForm({ slug }: { slug: string }) {
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
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={20000} />
      </label>
      <button type="submit">Agregar nota</button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}

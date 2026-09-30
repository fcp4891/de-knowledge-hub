import { ApiFailure } from "@/components/ApiFailure";
import { FavoriteButton, NoteForm, NoteItem, StudyForm } from "@/components/card/PersonalForms";
import { MarkdownBody } from "@/components/markdown/MarkdownBody";
import { getFavorite, getStudyState, listNotes } from "@/lib/api/client";

function formatWhen(value: string | null): string {
  if (!value) {
    return "sin fecha de estudio";
  }
  return value.replace("T", " ").replace(".000Z", " UTC").replace("Z", " UTC");
}

export async function PersonalPanel({ slug }: { slug: string }) {
  const [study, favorite, notes] = await Promise.all([
    getStudyState(slug),
    getFavorite(slug),
    listNotes(slug),
  ]);

  return (
    <section className="panel personal-panel">
      <h2>Estudio personal</h2>
      {study.ok ? (
        <>
          <p className="meta">
            <span>{formatWhen(study.data.last_studied_at)}</span>
          </p>
          <StudyForm slug={slug} current={study.data} />
        </>
      ) : (
        <ApiFailure result={study} />
      )}
      {favorite.ok ? <FavoriteButton slug={slug} current={favorite.data} /> : <ApiFailure result={favorite} />}
      <h3>Notas</h3>
      {notes.ok && notes.data.items.length === 0 ? <p className="muted">Sin notas.</p> : null}
      {notes.ok ? (
        notes.data.items.map((note) => (
          <NoteItem key={note.id} slug={slug} note={note} when={formatWhen(note.created_at)}>
            <MarkdownBody markdown={note.body_markdown} />
          </NoteItem>
        ))
      ) : (
        <ApiFailure result={notes} />
      )}
      <NoteForm slug={slug} />
    </section>
  );
}

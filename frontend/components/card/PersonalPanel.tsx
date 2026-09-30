import { FavoriteButton, NoteForm, StudyForm } from "@/components/card/PersonalForms";
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
        <p>{study.detail ?? "No se pudo cargar el estado."}</p>
      )}
      {favorite.ok ? <FavoriteButton slug={slug} current={favorite.data} /> : null}
      <h3>Notas</h3>
      {notes.ok && notes.data.items.length === 0 ? <p className="muted">Sin notas.</p> : null}
      {notes.ok
        ? notes.data.items.map((note) => (
            <article key={note.id} className="note">
              <MarkdownBody markdown={note.body_markdown} />
              <p className="meta">
                <span>{formatWhen(note.created_at)}</span>
              </p>
              <div className="note-actions">
                <button type="button" disabled title="Disponible cuando el contrato incluya editar notas.">
                  Editar
                </button>
                <button type="button" disabled title="Disponible cuando el contrato incluya borrar notas.">
                  Borrar
                </button>
              </div>
            </article>
          ))
        : null}
      <NoteForm slug={slug} />
    </section>
  );
}

import "./ficha-blocks.css";

type Tag = { kind?: string; label: string; legal?: boolean; code?: boolean };

const QUESTIONS: { text: string; tags: Tag[] }[] = [
  {
    text: "¿Qué pipelines tuyos tratan datos de personas, incluidos datos sensibles o de niños, niñas y adolescentes, y para qué actividad registrada?",
    tags: [
      { kind: "Matriz", label: "Finalidad" },
      { kind: "Código", label: "purpose_check", code: true },
    ],
  },
  {
    text: "¿Qué columnas personales llegan a tus capas analíticas sin que ninguna finalidad las necesite?",
    tags: [
      { kind: "Matriz", label: "Minimización" },
      { kind: "Código", label: "schema_minimization", code: true },
    ],
  },
  {
    text: "¿Cuándo vence cada dato que guardas, y qué pasa con sus copias en respaldos y reprocesos?",
    tags: [
      { kind: "Matriz", label: "Retención" },
      { kind: "Código", label: "retention_check", code: true },
    ],
  },
  {
    text: "¿Quién accedió a datos personales la semana pasada, y podrías demostrarlo con registros de auditoría activos?",
    tags: [
      { kind: "Matriz", label: "Acceso restringido" },
      { kind: "En la nube", label: "Auditar accesos" },
    ],
  },
  {
    text: "Si mañana llega una solicitud de supresión, ¿en cuántas tablas, respaldos y exportaciones está ese titular, y un backfill lo restauraría?",
    tags: [
      { kind: "Matriz", label: "Derechos del titular" },
      { kind: "Código", label: "erasure_replay_check", code: true },
      { label: "art. 7", legal: true },
    ],
  },
  {
    text: "¿Qué información técnica necesitarían seguridad y privacidad para dimensionar una vulneración y reportarla sin dilaciones?",
    tags: [
      { kind: "Matriz", label: "Vulneraciones" },
      { label: "art. 14 sexies", legal: true },
    ],
  },
  {
    text: "¿Qué datos personales salen hacia proveedores, incluidas APIs de LLM, o fuera de Chile, y con qué contrato?",
    tags: [
      { kind: "Matriz", label: "Transferencias" },
      { label: "art. 15 bis · arts. 27 a 29", legal: true },
    ],
  },
  {
    text: "¿Qué controles tuyos tienen evidencia dentro del plazo de tu política, y cuáles harían fallar la CI hoy?",
    tags: [
      { kind: "Arquitectura", label: "Control y evidencia" },
      { kind: "Código", label: "validate()", code: true },
    ],
  },
];

export function OpenQuestions() {
  return (
    <section className="ficha-block open-questions" aria-label="Preguntas técnicas abiertas">
      <p className="open-questions-lead">
        Respóndelas para tu propia plataforma. Hay una por cada fila de la matriz y una para la evidencia; si no sabes una, la ficha indica dónde se trabaja.
      </p>
      <ol>
        {QUESTIONS.map((question) => (
          <li key={question.text}>
            <article>
              <p>{question.text}</p>
              <ul>
                {question.tags.map((tag) => (
                  <li key={`${tag.kind ?? ""}-${tag.label}`} className={tag.legal ? "is-legal" : undefined}>
                    {tag.kind ? <b>{tag.kind}</b> : null}
                    {tag.code ? <code>{tag.label}</code> : tag.label}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

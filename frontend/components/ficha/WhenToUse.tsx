import "./ficha-blocks.css";

type Tag = { kind?: string; label: string; legal?: boolean };

type Card = { title: string; text: string; legal?: boolean; tags: Tag[] };

const GROUPS: { title: string; hint: string; items: Card[] }[] = [
  {
    title: "Cambia la plataforma",
    hint: "dónde y cómo se tratan",
    items: [
      {
        title: "Diseño o rediseño",
        text: "Una plataforma o pipeline nuevo que trata datos personales.",
        tags: [{ kind: "Matriz", label: "Minimización" }],
      },
      {
        title: "Nueva fuente o integración",
        text: "APIs, CDC, archivos o colas que traen datos personales.",
        tags: [{ kind: "Matriz", label: "Transferencias" }],
      },
      {
        title: "Migración a la nube",
        text: "Cambian ubicaciones, proveedores y copias.",
        tags: [{ kind: "Matriz", label: "Transferencias" }],
      },
      {
        title: "Ambientes y respaldos",
        text: "Desarrollo, pruebas, respaldos y recuperación.",
        tags: [{ kind: "Matriz", label: "Retención" }],
      },
    ],
  },
  {
    title: "Cambia el uso",
    hint: "para qué y quién recibe",
    items: [
      {
        title: "Nueva finalidad",
        text: "Usar datos existentes para un fin distinto del original.",
        legal: true,
        tags: [
          { label: "Principio de finalidad · art. 3", legal: true },
          { kind: "Matriz", label: "Finalidad" },
        ],
      },
      {
        title: "Productos de datos",
        text: "Modelos, dashboards y exportaciones.",
        tags: [{ kind: "Matriz", label: "Finalidad" }],
      },
      {
        title: "Nuevo proveedor",
        text: "Un tercero que trata datos por cuenta de la organización, incluida una API de LLM.",
        legal: true,
        tags: [{ label: "Encargado · art. 15 bis", legal: true }],
      },
      {
        title: "Destino fuera de Chile",
        text: "Réplicas, proveedores o APIs en otro país.",
        legal: true,
        tags: [{ label: "Transferencia internacional · arts. 27 a 29", legal: true }],
      },
    ],
  },
  {
    title: "Momentos de control",
    hint: "revisar y demostrar",
    items: [
      {
        title: "Tratamiento de alto riesgo",
        text: "Antes de empezar, evaluar el impacto en protección de datos.",
        legal: true,
        tags: [{ label: "Evaluación de impacto · art. 15 ter", legal: true }],
      },
      {
        title: "Vulneración",
        text: "Dimensionar el alcance y reportar.",
        legal: true,
        tags: [
          { label: "Reporte · art. 14 sexies", legal: true },
          { kind: "Matriz", label: "Vulneraciones" },
        ],
      },
      {
        title: "Revisión periódica",
        text: "Auditorías internas y requerimientos de la Agencia.",
        tags: [{ kind: "Matriz", label: "Evidencia" }],
      },
    ],
  },
];

export function WhenToUse() {
  return (
    <section className="ficha-block when-to-use" aria-label="Cuándo utilizarlo">
      <p className="when-to-use-intro">
        En cada cambio de la plataforma o del uso de los datos. Estos son los disparadores más comunes; los de borde
        marcado tienen un deber legal asociado.
      </p>
      <div className="when-to-use-grid">
        {GROUPS.map((group) => (
          <div key={group.title} className="when-to-use-col">
            <h3>
              {group.title}
              <small>{group.hint}</small>
            </h3>
            {group.items.map((item) => (
              <article key={item.title} className={item.legal ? "is-legal" : undefined}>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
                <ul>
                  {item.tags.map((tag) => (
                    <li key={`${item.title}-${tag.label}`} className={tag.legal ? "is-legal" : undefined}>
                      {tag.kind ? <b>{tag.kind}</b> : null}
                      {tag.label}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

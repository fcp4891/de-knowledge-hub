import { ArchitectureDot } from "@/components/markdown/InlineText";

import "./ficha-blocks.css";

type Tag = { kind: string; label: string };

type Question = {
  number: string;
  question: string;
  text: string;
  arq?: boolean;
  tags: Tag[];
};

const GROUPS: { title: string; items: Question[] }[] = [
  {
    title: "Conocer",
    items: [
      {
        number: "01",
        question: "¿Qué datos trato?",
        text: "Descubrir identificadores directos e indirectos, datos sensibles y combinaciones reidentificables.",
        tags: [{ kind: "Prácticas", label: "Clasificación automática" }],
      },
      {
        number: "02",
        question: "¿Para qué los necesito?",
        text: "Registrar cada actividad de tratamiento con finalidad, base de licitud y plazo, y asociarla a sus activos. Un dataset puede servir a varias actividades con bases distintas.",
        arq: true,
        tags: [{ kind: "Arquitectura", label: "Catálogo de actividades" }],
      },
    ],
  },
  {
    title: "Controlar",
    items: [
      {
        number: "03",
        question: "¿Dónde circulan?",
        text: "Trazar fuentes, APIs, colas, buckets, tablas, modelos, exportaciones y proveedores, incluidos los que están fuera de Chile.",
        tags: [{ kind: "Matriz", label: "Transferencias" }],
      },
      {
        number: "04",
        question: "¿Quién accede?",
        text: "Acceso por finalidad con IAM o RBAC, segregación de funciones y revisión periódica de permisos.",
        tags: [{ kind: "Matriz", label: "Acceso restringido" }],
      },
    ],
  },
  {
    title: "Proteger",
    items: [
      {
        number: "05",
        question: "¿Cómo los protejo?",
        text: "Minimizar desde la ingesta con contratos de campos por capa, seudonimizar cuando proceda y evaluar el impacto cuando la ley lo exige.",
        arq: true,
        tags: [{ kind: "Matriz", label: "Minimización" }],
      },
      {
        number: "06",
        question: "¿Cuánto tiempo los guardo?",
        text: "Plazo por clase de dato y almacenamiento; al vencer, suprimir o anonimizar.",
        tags: [{ kind: "Matriz", label: "Retención" }],
      },
    ],
  },
  {
    title: "Responder",
    items: [
      {
        number: "07",
        question: "¿Cómo atiendo los derechos?",
        text: "Corregir, bloquear o suprimir alcanzando derivados, historiales, respaldos, CDC y reprocesos.",
        tags: [
          { kind: "Matriz", label: "Derechos del titular" },
          { kind: "", label: "art. 4" },
        ],
      },
      {
        number: "08",
        question: "¿Cómo lo demuestro?",
        text: "Cada control produce evidencia y la CI falla si falta un control o su evidencia. Ante una vulneración, la consulta por linaje dimensiona el alcance.",
        arq: true,
        tags: [
          { kind: "Matriz", label: "Vulneraciones" },
          { kind: "Código", label: "validate()" },
        ],
      },
    ],
  },
];

export function DesignBoard() {
  return (
    <section className="ficha-block design-board" aria-label="Preguntas de diseño">
      <p className="design-board-intro">
        Ocho preguntas de diseño, desde identificar los datos hasta demostrar que los controles funcionan. Cada una
        indica dónde se desarrolla en esta ficha.
      </p>
      <div className="design-board-grid">
        {GROUPS.map((group) => (
          <div key={group.title} className="design-board-col">
            <h3>{group.title}</h3>
            {group.items.map((item) => (
              <article key={item.number}>
                <h4>
                  <span>{item.number}</span>
                  {item.question}
                  {item.arq ? <ArchitectureDot /> : null}
                </h4>
                <p>{item.text}</p>
                <ul>
                  {item.tags.map((tag) => (
                    <li key={`${item.number}-${tag.label}`}>
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
      <p className="design-board-note">
        Estas ocho preguntas reemplazan las del Resumen («una arquitectura de datos debe permitir responder…»), que
        quedan en un solo lugar.
      </p>
    </section>
  );
}

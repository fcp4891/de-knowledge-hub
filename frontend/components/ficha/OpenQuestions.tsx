import type { OpenQuestionsProps } from "@/lib/views";

import { Pills } from "./Pills";
import "./ficha-blocks.css";

/** Preguntas técnicas abiertas. Las casillas y el contador no se muestran: la ficha no gamifica. */
export function OpenQuestions({ intro, items }: OpenQuestionsProps) {
  return (
    <section className="ficha-block open-questions" aria-label="Preguntas técnicas abiertas">
      <p className="open-questions-lead">{intro}</p>
      <ol>
        {items.map((item) => (
          <li key={item.question}>
            <article>
              <p>{item.question}</p>
              <Pills tags={item.tags} />
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

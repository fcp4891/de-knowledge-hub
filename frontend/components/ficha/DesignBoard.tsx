import { ArchitectureDot } from "@/components/markdown/InlineText";
import type { DesignBoardProps } from "@/lib/views";

import "./ficha-blocks.css";

export function DesignBoard({ intro, groups }: DesignBoardProps) {
  return (
    <section className="ficha-block design-board" aria-label="Preguntas de diseño">
      <p className="design-board-intro">{intro}</p>
      <div className="design-board-grid">
        {groups.map((group) => (
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
    </section>
  );
}

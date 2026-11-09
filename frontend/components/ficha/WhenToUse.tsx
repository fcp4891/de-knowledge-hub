import type { WhenToUseProps } from "@/lib/views";

import "./ficha-blocks.css";

export function WhenToUse({ intro, groups }: WhenToUseProps) {
  return (
    <section className="ficha-block when-to-use" aria-label="Cuándo utilizarlo">
      <p className="when-to-use-intro">{intro}</p>
      <div className="when-to-use-grid">
        {groups.map((group) => (
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

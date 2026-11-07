import "./ficha-blocks.css";

export function VigenciaTimeline({
  items,
  asOf,
}: {
  items: {
    date: string;
    title: string;
    detail: string;
    links?: { label: string; href: string }[];
    state: "past" | "current" | "proposed";
  }[];
  asOf: string;
}) {
  return (
    <section className="ficha-block vigencia" aria-label="Vigencia">
      <ol className="vigencia-list">
        {items.map((item) => (
          <li key={item.date + item.title} className="vigencia-item" data-state={item.state}>
            <time className="vigencia-date" dateTime={item.date}>
              {item.date}
            </time>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            {item.links && item.links.length > 0 ? (
              <ul className="vigencia-links">
                {item.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="vigencia-asof">{asOf}</p>
    </section>
  );
}

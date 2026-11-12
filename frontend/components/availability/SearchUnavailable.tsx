import { AvailabilityMark } from "./AvailabilityMark";

/** Resultado de búsqueda que no abre la ficha: título y etiqueta del contenido. */
export function SearchUnavailable({
  title,
  status,
  label,
  help,
}: {
  title: string;
  status: "in_review" | "in_development";
  label: string;
  help?: string;
}) {
  return (
    <li className="search-unavailable">
      <span>{title}</span>
      <p className="meta">
        <AvailabilityMark status={status} label={label} help={help} />
      </p>
    </li>
  );
}

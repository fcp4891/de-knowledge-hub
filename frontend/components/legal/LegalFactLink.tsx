import { displayFactValue } from "@/lib/privacySpace";

export function LegalFactLink({ value, url }: { value: string; url: string }) {
  return (
    <a className="legal-fact-link" href={url} target="_blank" rel="noopener noreferrer">
      {displayFactValue(value)}
      <span className="legal-fact-extra">, se abre en una pestaña nueva</span>
    </a>
  );
}

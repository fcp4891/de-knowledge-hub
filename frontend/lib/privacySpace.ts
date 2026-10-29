/** Los niveles no se asignan a los tramos: son la forma de estudiar cada ficha. */

export const PRIVACY_DOMAIN_ID = "24";
export const PRIVACY_SPACE_HREF = "/privacidad";
export const PRIVACY_LAB = { id: "laboratorio", label: "Laboratorio · F4" } as const;
export const STUDY_PATH = ["Comprender", "Aplicar", "Demostrar", "Profundizar"] as const;

export function goalPathIds(steps: readonly { domain: string; stage?: string }[]): string[] {
  return steps.map((step) => step.stage ?? step.domain);
}

/** El paso siguiente de otro dominio. Varios tramos del mismo dominio no cuentan como otro paso. */
export function nextDistinctDomain(steps: readonly { domain: string }[], currentDomainId: string): string | null {
  const index = steps.findIndex((step) => step.domain === currentDomainId);
  if (index < 0) {
    return null;
  }
  return steps.slice(index + 1).find((step) => step.domain !== currentDomainId)?.domain ?? null;
}

export function verifiedCount(statuses: readonly (string | null)[]): { verified: number; total: number } {
  return {
    total: statuses.length,
    verified: statuses.filter((status) => status === "verified").length,
  };
}

/** `YYYY-MM-DD` → `DD-MM-AAAA`. Cualquier otro texto se deja igual. */
export function displayFactValue(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** La leyenda usa la verificación más antigua, para no adelantar un hecho sin revisar. */
export function verifiedLegend(dates: readonly string[]): string | null {
  const iso = dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  const first = iso[0];
  if (!first) {
    return null;
  }
  return `verificado el ${displayFactValue(first)}`;
}

/** The ficha notes name the reviewer. The page does not show that name. */
export function hideOwnerName(text: string): string {
  return text
    .replaceAll(" (Felipe)", "")
    .replaceAll(" por Felipe", "")
    .replaceAll("Felipe la volvió a consultar", "Se volvió a consultar");
}

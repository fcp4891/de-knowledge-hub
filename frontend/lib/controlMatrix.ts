/** Matriz de control de chile-data-protection §4: los cinco pasos del Resumen como encabezados. */
export const CONTROL_MATRIX_STEPS = ["Requisito", "Riesgo", "Control técnico", "Verificación", "Evidencia"] as const;

/** True si los encabezados son exactamente los cinco pasos, en orden. */
export function isControlMatrix(headers: readonly string[]): boolean {
  return (
    headers.length === CONTROL_MATRIX_STEPS.length && headers.every((header, index) => header === CONTROL_MATRIX_STEPS[index])
  );
}

/** Número de paso con dos dígitos, como en el componente de pasos: 01 … 05. */
export function stepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

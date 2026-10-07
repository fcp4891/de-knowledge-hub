/** `null` es el estado neutro: sin números y sin atenuar. Un arreglo vacío atenuaría todo. */
export type GoalPath = string[] | null;

export type LineTone = "none" | "full" | "faint";
export type StationFill = "step" | "complete" | "partial" | "empty";

export type StationPaint = {
  stepNumber: string;
  dimmed: boolean;
  emphasized: boolean;
  lineLeft: LineTone;
  lineRight: LineTone;
  fill: StationFill;
  percent: number;
};

export function contentStatus(withPage: number | null, total: number): string | null {
  if (withPage === null) {
    return null;
  }
  if (withPage >= total) {
    return "Completo";
  }
  if (withPage === 0) {
    return "Próximamente";
  }
  return `En construcción · ${withPage}/${total}`;
}

export function paintStation(input: {
  id: string;
  index: number;
  ids: string[];
  path: GoalPath;
  withPage: number | null;
  total: number;
}): StationPaint {
  const { id, index, ids, path, withPage, total } = input;
  const known = withPage !== null && total > 0;
  const percent = known ? Math.min(100, Math.round((withPage / total) * 100)) : 0;
  const stepIndex = path === null ? -1 : path.indexOf(id);
  const onPath = stepIndex >= 0;
  const prev = index > 0 ? ids[index - 1] : null;
  const next = index < ids.length - 1 ? ids[index + 1] : null;
  const joins = (neighbor: string | null) =>
    neighbor !== null && (path === null || (path.includes(id) && path.includes(neighbor)));

  let fill: StationFill = "empty";
  if (onPath) {
    fill = "step";
  } else if (path === null && known && percent >= 100) {
    fill = "complete";
  } else if (path === null && known && percent > 0) {
    fill = "partial";
  }

  return {
    stepNumber: onPath ? String(stepIndex + 1) : "",
    dimmed: path !== null && !onPath,
    emphasized: onPath,
    lineLeft: prev === null ? "none" : joins(prev) ? "full" : "faint",
    lineRight: next === null ? "none" : joins(next) ? "full" : "faint",
    fill,
    percent,
  };
}

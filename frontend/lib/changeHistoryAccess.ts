/**
 * El §19 (laboratorio, pendiente de generación) y el §22 (historial) solo los ve un usuario con permiso.
 * La autenticación está pendiente: no hay sesión, así que `currentViewer` devuelve null
 * y esas secciones quedan ocultas. Cuando exista la sesión, devolver aquí ese usuario.
 */
export const CHANGE_HISTORY_VIEWER_ID = "felipe";

export type Viewer = {
  id: string;
};

export function currentViewer(): Viewer | null {
  return null;
}

export function canViewChangeHistory(viewer: Viewer | null): boolean {
  return viewer !== null && viewer.id === CHANGE_HISTORY_VIEWER_ID;
}

export function canViewRelatedLab(viewer: Viewer | null): boolean {
  return canViewChangeHistory(viewer);
}

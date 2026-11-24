export const THEME_KEY = "dekh:theme";

export type ThemeChoice = "light" | "dark";

type ThemeStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

/** Preferencia de esta pestaña si el almacenamiento rechazó la escritura. */
let fallback: ThemeChoice | null = null;

export function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "light" || value === "dark";
}

/** Valor guardado. Si el almacenamiento falla, usa la preferencia de esta pestaña o null (sistema). */
export function readStoredTheme(storage: Pick<ThemeStorage, "getItem"> | null): ThemeChoice | null {
  try {
    const value = storage?.getItem(THEME_KEY) ?? null;
    if (isThemeChoice(value)) {
      return value;
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function writeStoredTheme(storage: Pick<ThemeStorage, "setItem"> | null, theme: ThemeChoice): boolean {
  if (!storage) {
    fallback = theme;
    return false;
  }
  try {
    storage.setItem(THEME_KEY, theme);
    fallback = null;
    return true;
  } catch {
    fallback = theme;
    return false;
  }
}

/** Sin valor guardado, manda el sistema. */
export function resolveTheme(stored: ThemeChoice | null, systemDark: boolean): ThemeChoice {
  return stored ?? (systemDark ? "dark" : "light");
}

export function nextTheme(current: ThemeChoice): ThemeChoice {
  return current === "dark" ? "light" : "dark";
}

export function themeLabel(current: ThemeChoice): string {
  return current === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
}

/** Solo tests: olvida la preferencia de pestaña entre casos. */
export function resetThemeFallback(): void {
  fallback = null;
}

/**
 * Corre en el <head> antes del primer pintado.
 * No pone el atributo si no hay preferencia guardada: el sistema sigue en la media query.
 */
export const THEME_BOOT_SCRIPT =
  '(function(){try{var t=localStorage.getItem("dekh:theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}try{performance.mark("dekh-theme");}catch(e){}})();';

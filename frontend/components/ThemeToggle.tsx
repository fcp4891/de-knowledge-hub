"use client";

import { useLayoutEffect, useState } from "react";

import { nextTheme, readStoredTheme, resolveTheme, themeLabel, writeStoredTheme, type ThemeChoice } from "@/lib/theme";

function systemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function storageOrNull(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function applyStored(stored: ThemeChoice | null): ThemeChoice {
  const root = document.documentElement;
  if (stored) {
    root.dataset.theme = stored;
  } else {
    delete root.dataset.theme;
  }
  const resolved = resolveTheme(stored, systemIsDark());
  root.style.colorScheme = resolved;
  return resolved;
}

/** Un botón, dos estados. Sin preferencia guardada, el icono sigue al sistema. */
export function ThemeToggle() {
  const [resolved, setResolved] = useState<ThemeChoice>("light");

  useLayoutEffect(() => {
    const sync = () => setResolved(applyStored(readStoredTheme(storageOrNull())));
    sync();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function onClick() {
    const theme = nextTheme(resolved);
    writeStoredTheme(storageOrNull(), theme);
    setResolved(applyStored(theme));
  }

  const dark = resolved === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={dark}
      aria-label={themeLabel(resolved)}
      title={themeLabel(resolved)}
      onClick={onClick}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

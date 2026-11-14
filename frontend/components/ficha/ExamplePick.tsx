"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ExamplePickValue = { column: string | null; pick: (column: string) => void };

const ExamplePickContext = createContext<ExamplePickValue | null>(null);

export function ExamplePickProvider({ children }: { children: ReactNode }) {
  const [column, setColumn] = useState<string | null>(null);
  const pick = useCallback((next: string) => setColumn(next), []);
  const value = useMemo(() => ({ column, pick }), [column, pick]);
  return <ExamplePickContext.Provider value={value}>{children}</ExamplePickContext.Provider>;
}

export function useExamplePick(): ExamplePickValue | null {
  return useContext(ExamplePickContext);
}

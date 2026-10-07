"use client";

import { useId, useRef, useState } from "react";

export function CloudTabs({
  tabs,
  activeId,
  onActiveChange,
}: {
  tabs: { id: string; title: string; content: React.ReactNode }[];
  activeId?: string;
  onActiveChange?: (id: string) => void;
}) {
  const [internal, setInternal] = useState(tabs[0]?.id ?? "");
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const uid = useId();
  const active = tabs.some((tab) => tab.id === (activeId ?? internal))
    ? (activeId ?? internal)
    : (tabs[0]?.id ?? "");

  if (tabs.length === 0) {
    return null;
  }

  function select(id: string, focus: boolean) {
    setInternal(id);
    onActiveChange?.(id);
    if (!focus) {
      return;
    }
    const index = tabs.findIndex((tab) => tab.id === id);
    buttons.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    if (index < 0) {
      return;
    }
    let next = index;
    if (event.key === "ArrowRight") {
      next = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    select(tabs[next].id, true);
  }

  return (
    <div className="cloud-tabs">
      <div role="tablist" aria-label="GCP, AWS y Azure" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            id={`${uid}-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            aria-controls={`${uid}-panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => select(tab.id, false)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${uid}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

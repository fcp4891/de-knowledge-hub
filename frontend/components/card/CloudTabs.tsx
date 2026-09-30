"use client";

import { useState } from "react";

export function CloudTabs({
  tabs,
}: {
  tabs: { id: string; title: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="cloud-tabs">
      <div role="tablist" aria-label="GCP, AWS y Azure">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" hidden={tab.id !== active}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

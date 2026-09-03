"use client";

import { useState } from "react";
import { StructuredContent } from "@/components/mentorships/StructuredContent";

const labels: Record<string, string> = {
  temas: "Banco de temas",
  prompts: "Prompts",
  stories: "Stories",
  roteiros: "Roteiros",
  estrategias: "Estratégias",
};

function labelFor(value: string) {
  return labels[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ContentCenter({ content }: { content: unknown }) {
  const sections =
    typeof content === "object" && content !== null && !Array.isArray(content)
      ? Object.entries(content as Record<string, unknown>)
      : [];
  const [active, setActive] = useState(sections[0]?.[0] ?? "");
  const selected = sections.find(([key]) => key === active);

  if (!sections.length) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-text-secondary">
        A Central de Conteúdo está sendo preparada pela equipe.
      </div>
    );
  }

  return (
    <div>
      <div className="scrollbar-none flex gap-2 overflow-x-auto border-b border-border pb-3">
        {sections.map(([key]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active === key
                ? "bg-primary text-background"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            {labelFor(key)}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-5 rounded-2xl border border-border bg-surface p-5 lg:p-7">
          <StructuredContent value={selected[1]} />
        </div>
      )}
    </div>
  );
}

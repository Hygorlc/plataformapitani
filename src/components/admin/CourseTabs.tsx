"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Painel", segment: "panel" },
  { label: "Links de divulgação", segment: "links" },
  { label: "Informações básicas", segment: "info" },
  { label: "Área de membros", segment: "members-area" },
  { label: "Página do produto", segment: "product-page" },
  { label: "Coproduções", segment: "coproductions" },
  { label: "Ferramentas", segment: "tools" },
] as const;

export function CourseTabs({ courseId }: { courseId: string }) {
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 lg:w-60">
      <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {TABS.map((tab) => {
          const href = `/admin/courses/${courseId}/${tab.segment}`;
          const active = pathname === href;
          return (
            <li key={tab.segment} className="shrink-0">
              <Link
                href={href}
                className={`block whitespace-nowrap border-b border-border px-4 py-3 text-sm transition-colors lg:whitespace-normal ${
                  active
                    ? "border-l-2 border-l-primary bg-surface font-semibold text-text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

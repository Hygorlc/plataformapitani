"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, CheckSquare, FileText, Video } from "lucide-react";

const items = [
  { href: "/mentorships", label: "Meus Materiais", icon: BookOpen, exact: true },
  { href: "/mentorships/content", label: "Conteúdo", icon: Video },
  { href: "/mentorships/tasks", label: "Minhas Pendências", icon: CheckSquare },
  { href: "/mentorships/files", label: "Arquivos", icon: FileText },
];

export function MentorshipPortalNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client");

  return (
    <aside className="border-b border-border bg-surface/70 lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Área de Mentoria
        </p>
        <p className="mt-1 text-sm text-text-secondary">Portal do cliente</p>
      </div>
      <nav className="scrollbar-none flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible lg:p-4">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={clientId ? `${href}?client=${encodeURIComponent(clientId)}` : href}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                active
                  ? "bg-primary text-background"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

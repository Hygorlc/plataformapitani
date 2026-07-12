"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutGrid,
  BookOpen,
  Award,
  Users,
  HelpCircle,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export const memberNavItems: NavItem[] = [
  { label: "Catálogo", href: "/catalog", icon: LayoutGrid },
  { label: "Meus Cursos", href: "/my-courses", icon: BookOpen },
  { label: "Certificados", href: "/certificates", icon: Award },
  { label: "Comunidade", href: "/community", icon: Users },
  { label: "Suporte", href: "/support", icon: HelpCircle },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Cursos", href: "/admin/courses", icon: Library },
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { label: "Configurações", href: "/admin/settings", icon: Settings },
];

export function Sidebar({
  items,
  brandLabel,
}: {
  items: NavItem[];
  brandLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <GraduationCap className="text-primary" size={24} />
        <span className="text-lg font-semibold text-text-primary">
          Pitani{" "}
          <span className="font-normal text-text-secondary">
            {brandLabel ?? "Academy"}
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary font-semibold text-background"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

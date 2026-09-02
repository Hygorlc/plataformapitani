"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Search, Bell } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

const navItems = [
  { label: "Início", href: "/catalog" },
  { label: "Meus Cursos", href: "/my-courses" },
  { label: "Mentorias", href: "/mentorships" },
  { label: "Comunidade", href: "/community" },
  { label: "Suporte", href: "/support" },
];

export function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-8 px-6 lg:px-12">
        <Link href="/catalog" className="flex shrink-0 items-center gap-2">
          <GraduationCap className="text-primary" size={26} />
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Pitani <span className="font-normal text-primary">Academy</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/catalog" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active
                    ? "font-semibold text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button type="button" className="text-text-secondary hover:text-text-primary">
            <Search size={20} />
          </button>
          <button type="button" className="relative text-text-secondary hover:text-text-primary">
            <Bell size={20} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-semibold text-background">
            {initial}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

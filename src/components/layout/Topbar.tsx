import { Bell, Search } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";

export function Topbar({
  userName,
  showSearch = false,
}: {
  userName: string;
  showSearch?: boolean;
}) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
      {showSearch ? (
        <div className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-text-secondary">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative text-text-secondary hover:text-text-primary"
        >
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-status-danger" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-background">
            {initial}
          </div>
          <span className="text-sm text-text-primary">Oi, {userName}</span>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}

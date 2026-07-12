import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      >
        <LogOut size={16} />
        Sair
      </button>
    </form>
  );
}

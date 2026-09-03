"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 30_000;

export function LiveMentorshipRefresh() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const lastRefreshAt = useRef(0);

  const refresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshAt.current < 1_000) return;
    lastRefreshAt.current = now;
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_INTERVAL_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-status-completed" />
        Sincronização automática a cada 30 segundos
      </span>
      <button
        type="button"
        onClick={refresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 font-medium text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-60"
      >
        <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
        {isRefreshing ? "Atualizando..." : "Atualizar agora"}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

function getRemaining(endAt: string) {
  return Math.max(0, new Date(endAt).getTime() - Date.now());
}

export function PromotionCountdown() {
  return (
    <div className="rounded-md border border-primary/50 bg-background/95 px-3 py-2 text-center shadow-xl backdrop-blur-sm">
      <p className="text-xs font-bold text-red-500">Desbloqueie com desconto</p>
    </div>
  );
}

export function PromotionTimer({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));

  useEffect(() => {
    const update = () => setRemaining(getRemaining(endAt));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [endAt]);

  if (remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return (
    <div className="whitespace-nowrap rounded-md border border-red-500/60 bg-background/95 px-2.5 py-1 text-xs font-bold text-red-500 shadow-lg backdrop-blur-sm">
      {days > 0 ? `${days}d ${clock}` : clock}
    </div>
  );
}

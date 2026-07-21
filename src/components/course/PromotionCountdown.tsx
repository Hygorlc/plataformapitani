"use client";

import { useEffect, useState } from "react";

function getRemaining(endAt: string) {
  return Math.max(0, new Date(endAt).getTime() - Date.now());
}

export function PromotionCountdown({ endAt }: { endAt?: string | null }) {
  const [remaining, setRemaining] = useState(() => (endAt ? getRemaining(endAt) : 0));

  useEffect(() => {
    if (!endAt) return;

    const update = () => setRemaining(getRemaining(endAt));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [endAt]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  return (
    <div className="rounded-md border border-primary/50 bg-background/95 px-3 py-2 text-center shadow-xl backdrop-blur-sm">
      <p className="text-xs font-bold text-red-500">Desconto Exclusivo</p>
      {endAt && remaining > 0 && (
        <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-text-primary">
          {days > 0 ? `${days}d ${clock}` : clock}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BuyButton({
  courseId,
  priceLabel,
}: {
  courseId: string;
  priceLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "Não foi possível iniciar o pagamento. Tente novamente.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Redirecionando..." : `Comprar por ${priceLabel}`}
      </Button>
      {error && <span className="text-xs text-status-danger">{error}</span>}
    </div>
  );
}

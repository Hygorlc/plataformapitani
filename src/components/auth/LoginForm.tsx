"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function LoginForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/catalog";
  const recoveryMessage = encodeURIComponent(
    `Olá! Esqueci minha senha da Pitani Academy e preciso de ajuda para recuperar o acesso. Meu e-mail cadastrado é: ${email || "[informe seu e-mail]"}.`
  );
  const recoveryUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${recoveryMessage}`
    : null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-text-secondary">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-text-secondary">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-status-danger">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>

      {recoveryUrl ? (
        <a
          href={recoveryUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-lg border border-primary/60 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Recuperar senha
        </a>
      ) : (
        <p className="text-center text-xs text-text-muted">
          Recuperação pelo WhatsApp temporariamente indisponível.
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { signup, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state?.confirmEmailSent) {
    return (
      <p className="text-sm text-text-secondary">
        Enviamos um link de confirmação para o seu e-mail. Clique nele para
        ativar sua conta e depois entre normalmente.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm text-text-secondary">
          Nome completo
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-text-secondary">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
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
          minLength={8}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-text-muted">Mínimo de 8 caracteres.</span>
      </div>

      {state?.error && (
        <p className="text-sm text-status-danger">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}

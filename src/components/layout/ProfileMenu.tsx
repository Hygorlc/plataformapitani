"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ProfileMenu({ userName }: { userName: string }) {
  const initial = userName.charAt(0).toUpperCase();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("password_confirmation") ?? "");

    if (password.length < 8) {
      setIsError(true);
      setMessage("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setIsError(true);
      setMessage("As senhas informadas não são iguais.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setIsError(true);
      setMessage("Não foi possível alterar a senha. Tente novamente.");
      return;
    }

    form.reset();
    setMessage("Senha alterada com sucesso.");
  }

  return (
    <details className="group relative">
      <summary
        aria-label="Abrir opções do perfil"
        title="Opções do perfil"
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded bg-primary text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
      >
        {initial}
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <KeyRound size={18} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Alterar senha</p>
            <p className="text-xs text-text-muted">Defina uma nova senha para sua conta.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="mt-3 space-y-3">
          <div>
            <label htmlFor="profile-new-password" className="text-xs font-medium text-text-secondary">
              Nova senha
            </label>
            <input
              id="profile-new-password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="profile-password-confirmation" className="text-xs font-medium text-text-secondary">
              Confirmar nova senha
            </label>
            <input
              id="profile-password-confirmation"
              name="password_confirmation"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="Digite novamente"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {message && (
            <p role="status" className={`text-xs ${isError ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </details>
  );
}

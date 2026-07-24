import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginGlobeBackground } from "@/components/auth/LoginGlobeBackground";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua área de membro."
      background={<LoginGlobeBackground />}
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

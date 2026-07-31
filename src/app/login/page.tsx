import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginGlobeBackground } from "@/components/auth/LoginGlobeBackground";
import { LoginForm } from "@/components/auth/LoginForm";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function LoginPage() {
  await connection();
  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("platform_settings")
    .select("home_carousel_slides")
    .eq("id", "main")
    .maybeSingle();
  const supportSettings = Array.isArray(settings?.home_carousel_slides)
    ? settings.home_carousel_slides.find(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          (item as Record<string, unknown>).kind === "support"
      )
    : null;
  const whatsappNumber =
    supportSettings && typeof supportSettings === "object"
      ? String((supportSettings as Record<string, unknown>).whatsappNumber ?? "")
      : "";

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
        <LoginForm whatsappNumber={whatsappNumber} />
      </Suspense>
    </AuthCard>
  );
}

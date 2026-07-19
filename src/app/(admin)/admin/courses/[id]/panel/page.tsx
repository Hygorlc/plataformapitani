import Link from "next/link";
import { Users, DollarSign, PlaySquare, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/Button";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CoursePanelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: enrollments }, { count: lessonCount }] = await Promise.all([
    supabase.from("enrollments").select("amount_paid_cents").eq("course_id", id),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("course_id", id),
  ]);

  const students = enrollments?.length ?? 0;
  const revenueCents = (enrollments ?? []).reduce((sum, e) => sum + e.amount_paid_cents, 0);
  const lessons = lessonCount ?? 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Painel</h2>
      <p className="mt-1 text-sm text-text-secondary">Resumo do desempenho deste curso.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Alunos" value={String(students)} />
        <StatCard icon={DollarSign} label="Receita" value={formatBRL(revenueCents)} />
        <StatCard icon={PlaySquare} label="Aulas" value={String(lessons)} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-text-primary">Adicionar conteúdo</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Você já tem o conteúdo do seu curso online? Organize os módulos e as aulas em
          vídeo na Área de membros — é lá que seus alunos vão assistir ao curso.
        </p>
        <Link href={`/admin/courses/${id}/members-area`} className="mt-4 inline-block">
          <Button className="flex items-center gap-2">
            Ir para a Área de membros <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

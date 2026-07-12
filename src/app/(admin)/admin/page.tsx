import Link from "next/link";
import { Users, Library, DollarSign, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getAdminCourses } from "@/lib/data/admin";
import { StatCard } from "@/components/admin/StatCard";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/Button";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [stats, courses] = await Promise.all([
    getDashboardStats(supabase),
    getAdminCourses(supabase),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Admin Dashboard</h1>
      <p className="mt-1 text-text-secondary">Métricas gerais da plataforma.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total de Alunos"
          value={String(stats.totalStudents)}
          delta={stats.newStudentsLast30Days > 0 ? `+${stats.newStudentsLast30Days} nos últimos 30 dias` : undefined}
        />
        <StatCard
          icon={Library}
          label="Cursos Ativos"
          value={String(stats.activeCourses)}
          delta={stats.newCoursesLast30Days > 0 ? `+${stats.newCoursesLast30Days} nos últimos 30 dias` : undefined}
        />
        <StatCard
          icon={DollarSign}
          label="Receita"
          value={formatBRL(stats.revenueCents)}
          delta={
            stats.revenueLast30DaysCents > 0
              ? `+${formatBRL(stats.revenueLast30DaysCents)} nos últimos 30 dias`
              : undefined
          }
        />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between p-5">
          <Link href="/admin/courses/new">
            <Button>
              <Plus size={16} /> Adicionar Novo Curso
            </Button>
          </Link>
        </div>

        <div className="px-5 pb-2">
          <h2 className="text-lg font-semibold text-text-primary">Cursos Recentes</h2>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Curso</th>
              <th className="px-5 py-3 font-medium">Instrutor</th>
              <th className="px-5 py-3 font-medium">Alunos</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {courses.slice(0, 5).map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-text-primary">{course.title}</td>
                <td className="px-5 py-3 text-text-secondary">
                  {course.instructor_name ?? "—"}
                </td>
                <td className="px-5 py-3 text-text-secondary">{course.studentCount}</td>
                <td className="px-5 py-3">
                  <PublishToggle courseId={course.id} status={course.status} />
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-text-secondary">
                  Nenhum curso cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getAdminCourses, getDashboardStats } from "@/lib/data/admin";

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const [stats, courses] = await Promise.all([
    getDashboardStats(supabase),
    getAdminCourses(supabase),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Relatórios</h1>
      <p className="mt-1 text-text-secondary">Desempenho por curso.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Curso</th>
              <th className="px-5 py-3 font-medium">Alunos</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-text-primary">{c.title}</td>
                <td className="px-5 py-3 text-text-secondary">{c.studentCount}</td>
                <td className="px-5 py-3 text-text-secondary">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-text-muted">
        Receita total: {formatBRL(stats.revenueCents)}
      </p>
    </div>
  );
}

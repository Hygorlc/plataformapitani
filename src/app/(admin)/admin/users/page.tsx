import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/data/admin";
import {
  addProductToUser,
  createStudent,
  updateUserRole,
} from "@/lib/actions/admin/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const [users, { data: courses }] = await Promise.all([
    getAdminUsers(supabase),
    supabase.from("courses").select("id, title").order("title"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Usuários</h1>
      <p className="mt-1 text-text-secondary">
        Cadastre alunos, libere produtos e gerencie os papéis da plataforma.
      </p>

      <form action={createStudent} className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold text-text-primary">Cadastrar usuário</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Crie o acesso do aluno e, se desejar, já libere o primeiro produto.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            name="full_name"
            placeholder="Nome completo"
            required
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <input
            name="password"
            type="password"
            minLength={6}
            placeholder="Senha inicial"
            required
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <select
            name="course_id"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            defaultValue=""
          >
            <option value="">Sem produto inicial</option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="mt-4">Cadastrar aluno</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Papel</th>
              <th className="px-5 py-3 font-medium">Cadastrado em</th>
              <th className="px-5 py-3 font-medium">Produtos</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-text-primary">{user.full_name ?? "—"}</td>
                <td className="px-5 py-3 text-text-secondary">{user.email}</td>
                <td className="px-5 py-3">
                  <Badge status={user.role === "admin" ? "completed" : "draft"}>
                    {user.role === "admin" ? "Admin" : "Aluno"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-text-secondary">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-5 py-3">
                  <form action={addProductToUser.bind(null, user.id)} className="flex min-w-72 gap-2">
                    <select
                      name="course_id"
                      required
                      defaultValue=""
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="" disabled>Adicionar produto...</option>
                      {(courses ?? []).map((course) => (
                        <option key={course.id} value={course.id}>
                          {user.enrolledCourseIds.includes(course.id) ? "✓ " : ""}{course.title}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="secondary" size="sm">Liberar</Button>
                  </form>
                  <p className="mt-1 text-xs text-text-muted">
                    {user.enrolledCourseIds.length} produto(s) ativo(s)
                  </p>
                </td>
                <td className="px-5 py-3">
                  <form
                    action={updateUserRole.bind(
                      null,
                      user.id,
                      user.role === "admin" ? "student" : "admin"
                    )}
                  >
                    <Button type="submit" variant="secondary" size="sm">
                      {user.role === "admin" ? "Rebaixar para Aluno" : "Promover a Admin"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

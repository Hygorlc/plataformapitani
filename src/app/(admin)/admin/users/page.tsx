import { createClient } from "@/lib/supabase/server";
import { getAdminUsers, getCourseAccessAssignments } from "@/lib/data/admin";
import {
  addProductToUser,
  assignCoursesByEmail,
  createStudent,
  updateStudentPassword,
  updateUserRole,
} from "@/lib/actions/admin/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteStudentButton } from "@/components/admin/DeleteStudentButton";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const [users, assignments, { data: courses }] = await Promise.all([
    getAdminUsers(supabase),
    getCourseAccessAssignments(),
    supabase
      .from("courses")
      .select("id, title")
      .eq("status", "published")
      .order("title"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Usuários</h1>
      <p className="mt-1 text-text-secondary">
        Cadastre alunos, libere produtos e gerencie os papéis da plataforma.
      </p>

      <form
        action={assignCoursesByEmail}
        className="mt-6 rounded-xl border border-primary/40 bg-surface p-5"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Liberar cursos por e-mail
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Se o aluno já estiver cadastrado, o acesso é imediato. Caso contrário, os cursos
          serão liberados automaticamente quando ele criar a conta com este e-mail.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(260px,0.7fr)_1.3fr]">
          <div>
            <label htmlFor="assignment-email" className="text-sm font-medium text-text-primary">
              E-mail do aluno
            </label>
            <input
              id="assignment-email"
              name="email"
              type="email"
              placeholder="aluno@exemplo.com"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-text-primary">
              Cursos que serão liberados
            </legend>
            <div className="mt-1.5 grid max-h-48 gap-2 overflow-y-auto rounded-lg border border-border bg-background p-3 sm:grid-cols-2">
              {(courses ?? []).map((course) => (
                <label key={course.id} className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    name="course_ids"
                    value={course.id}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>{course.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <Button type="submit" className="mt-4">Salvar liberações</Button>
      </form>

      {assignments.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-text-primary">Liberações por e-mail</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Acompanhe quais cursos aguardam cadastro e quais já foram liberados.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Curso</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-text-primary">{assignment.email}</td>
                    <td className="px-5 py-3 text-text-secondary">{assignment.courseTitle}</td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(assignment.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={assignment.claimed_at ? "completed" : "draft"}>
                        {assignment.claimed_at ? "Liberado" : "Aguardando cadastro"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <div className="flex flex-wrap gap-2">
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
                  {user.role !== "admin" && (
                    <>
                      <details className="relative">
                        <summary className="cursor-pointer list-none rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover">
                          Alterar senha
                        </summary>
                        <form
                          action={updateStudentPassword.bind(null, user.id)}
                          className="absolute right-0 z-30 mt-2 flex w-72 gap-2 rounded-lg border border-border bg-surface p-3 shadow-xl"
                        >
                          <input
                            name="password"
                            type="password"
                            minLength={8}
                            required
                            autoComplete="new-password"
                            placeholder="Nova senha (mín. 8)"
                            className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <Button type="submit" size="sm">Salvar</Button>
                        </form>
                      </details>
                      <DeleteStudentButton
                        userId={user.id}
                        studentName={user.full_name ?? user.email}
                      />
                    </>
                  )}
                  </div>
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

import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/data/admin";
import { updateUserRole } from "@/lib/actions/admin/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const users = await getAdminUsers(supabase);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Usuários</h1>
      <p className="mt-1 text-text-secondary">
        Gerencie os papéis de aluno e administrador da plataforma.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Papel</th>
              <th className="px-5 py-3 font-medium">Cadastrado em</th>
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
  );
}

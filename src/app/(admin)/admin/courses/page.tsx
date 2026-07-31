import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminCourses } from "@/lib/data/admin";
import {
  deleteCourse,
  materializeBuiltInCourse,
} from "@/lib/actions/admin/courses";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/Button";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const courses = await getAdminCourses(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Gerenciar Cursos</h1>
          <p className="mt-1 text-text-secondary">
            Crie, edite e publique os cursos da plataforma.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus size={16} /> Adicionar Novo Curso
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-5 py-3 font-medium">Curso</th>
              <th className="px-5 py-3 font-medium">Instrutor</th>
              <th className="px-5 py-3 font-medium">Alunos</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-text-primary">{course.title}</td>
                <td className="px-5 py-3 text-text-secondary">
                  {course.instructor_name ?? "—"}
                </td>
                <td className="px-5 py-3 text-text-secondary">{course.studentCount}</td>
                <td className="px-5 py-3">
                  {course.isBuiltIn ? (
                    <span className="inline-flex rounded-full bg-status-completed/15 px-2.5 py-1 text-xs font-medium text-status-completed">
                      Publicado
                    </span>
                  ) : (
                    <PublishToggle courseId={course.id} status={course.status} />
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {course.isBuiltIn ? (
                      <form action={materializeBuiltInCourse.bind(null, course.slug)}>
                        <button type="submit" className="text-primary hover:underline">
                          Editar
                        </button>
                      </form>
                    ) : (
                      <>
                        <Link
                          href={`/admin/courses/${course.id}/panel`}
                          className="text-primary hover:underline"
                        >
                          Editar
                        </Link>
                        <form action={deleteCourse.bind(null, course.id)}>
                          <button
                            type="submit"
                            className="text-status-danger hover:opacity-80"
                            aria-label="Excluir curso"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
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

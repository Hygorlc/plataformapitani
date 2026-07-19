import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteCourse } from "@/lib/actions/admin/courses";

export default async function CourseToolsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id").eq("id", id).single();
  if (!course) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Ferramentas</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Ações avançadas de gerenciamento deste curso.
      </p>

      <div className="mt-6 rounded-xl border border-status-danger/40 bg-status-danger/5 p-5">
        <p className="font-medium text-text-primary">Excluir curso</p>
        <p className="mt-1 text-sm text-text-secondary">
          Remove permanentemente este curso, seus módulos, aulas, matrículas e comentários.
          Esta ação não pode ser desfeita.
        </p>
        <form action={deleteCourse.bind(null, course.id)} className="mt-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-status-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Trash2 size={16} />
            Excluir curso permanentemente
          </button>
        </form>
      </div>
    </div>
  );
}

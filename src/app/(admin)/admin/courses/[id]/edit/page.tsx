import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/actions/admin/courses";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/Button";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from("modules").select("*").eq("course_id", id).order("position"),
    supabase.from("lessons").select("*").eq("course_id", id).order("position"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Editar Curso</h1>
        <div className="flex items-center gap-4">
          <PublishToggle courseId={course.id} status={course.status} />
          <form action={deleteCourse.bind(null, course.id)}>
            <button type="submit" className="text-status-danger hover:opacity-80">
              <Trash2 size={18} />
            </button>
          </form>
        </div>
      </div>

      <form action={updateCourse.bind(null, course.id)} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm text-text-secondary">
            Título
          </label>
          <input
            id="title"
            name="title"
            defaultValue={course.title}
            required
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm text-text-secondary">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={course.description ?? ""}
            className="resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="instructor_name" className="text-sm text-text-secondary">
              Instrutor
            </label>
            <input
              id="instructor_name"
              name="instructor_name"
              defaultValue={course.instructor_name ?? ""}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="price" className="text-sm text-text-secondary">
              Preço (R$)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={course.price_cents / 100}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <Button type="submit" className="w-fit">
          Salvar Alterações
        </Button>
      </form>

      <div className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-text-primary">
          Módulos e Aulas
        </h2>

        <div className="flex flex-col gap-4">
          {(modules ?? []).map((mod) => (
            <div key={mod.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <form
                  action={updateModule.bind(null, mod.id, course.id)}
                  className="flex flex-1 items-center gap-2"
                >
                  <input
                    name="title"
                    defaultValue={mod.title}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Salvar
                  </Button>
                </form>
                <form action={deleteModule.bind(null, mod.id, course.id)}>
                  <button type="submit" className="text-status-danger hover:opacity-80">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {(lessons ?? [])
                  .filter((l) => l.module_id === mod.id)
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-2">
                        <form
                          action={updateLesson.bind(null, lesson.id, course.id)}
                          className="flex flex-1 flex-col gap-2"
                        >
                          <input
                            name="title"
                            defaultValue={lesson.title}
                            placeholder="Título da aula"
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <input
                            name="video_url"
                            defaultValue={lesson.video_url}
                            placeholder="Link do YouTube/Vimeo"
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <textarea
                            name="description"
                            defaultValue={lesson.description ?? ""}
                            placeholder="Descrição (opcional)"
                            rows={2}
                            className="resize-none rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <Button type="submit" variant="secondary" size="sm" className="w-fit">
                            Salvar Aula
                          </Button>
                        </form>
                        <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                          <button
                            type="submit"
                            className="text-status-danger hover:opacity-80"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                <form
                  action={createLesson.bind(null, mod.id, course.id)}
                  className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
                >
                  <input
                    name="title"
                    placeholder="Título da nova aula"
                    required
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <input
                    name="video_url"
                    placeholder="Link do YouTube/Vimeo"
                    required
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <textarea
                    name="description"
                    placeholder="Descrição (opcional)"
                    rows={2}
                    className="resize-none rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <Button type="submit" size="sm" className="w-fit">
                    Adicionar Aula
                  </Button>
                </form>
              </div>
            </div>
          ))}

          <form
            action={createModule.bind(null, course.id)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4"
          >
            <input
              name="title"
              placeholder="Título do novo módulo"
              required
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <Button type="submit" size="sm">
              Adicionar Módulo
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

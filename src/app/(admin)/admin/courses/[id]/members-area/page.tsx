import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  createModule,
  updateModuleWithLessons,
  deleteModule,
  createLesson,
  deleteLesson,
  uploadLessonMaterial,
  deleteLessonMaterial,
} from "@/lib/actions/admin/courses";
import { Button } from "@/components/ui/Button";

export default async function CourseMembersAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("id").eq("id", id).single();
  if (!course) notFound();

  const [{ data: modules }, { data: lessons }, { data: materials }] = await Promise.all([
    supabase.from("modules").select("*").eq("course_id", id).order("position"),
    supabase.from("lessons").select("*").eq("course_id", id).order("position"),
    supabase
      .from("lesson_materials")
      .select("*")
      .eq("course_id", id)
      .order("created_at"),
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Área de membros</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Organize os módulos e as aulas em vídeo que seus alunos vão assistir.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {(modules ?? []).map((mod) => {
          const moduleLessons = (lessons ?? []).filter((l) => l.module_id === mod.id);

          return (
            <div key={mod.id} className="rounded-xl border border-border bg-surface p-4">
              <form
                action={updateModuleWithLessons.bind(
                  null,
                  mod.id,
                  course.id,
                  moduleLessons.map((l) => l.id)
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    name="module_title"
                    defaultValue={mod.title}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    formAction={deleteModule.bind(null, mod.id, course.id)}
                    className="text-status-danger hover:opacity-80"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {moduleLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex flex-1 flex-col gap-2">
                          <input
                            name={`lesson_${lesson.id}_title`}
                            defaultValue={lesson.title}
                            placeholder="Título da aula"
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <input
                            name={`lesson_${lesson.id}_video_url`}
                            defaultValue={lesson.video_url}
                            placeholder="Link do YouTube/Vimeo"
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                          <textarea
                            name={`lesson_${lesson.id}_description`}
                            defaultValue={lesson.description ?? ""}
                            placeholder="Descrição (opcional)"
                            rows={2}
                            className="resize-none rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          formAction={deleteLesson.bind(null, lesson.id, course.id)}
                          className="text-status-danger hover:opacity-80"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit" size="sm" className="mt-4 w-fit">
                  Salvar Módulo
                </Button>
              </form>

              <div className="mt-4 flex flex-col gap-3">
                {moduleLessons.map((lesson) => {
                  const lessonMaterials = (materials ?? []).filter(
                    (material) => material.lesson_id === lesson.id
                  );
                  return (
                    <div key={lesson.id} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-sm font-medium text-text-primary">
                        Materiais — {lesson.title}
                      </p>
                      {lessonMaterials.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                          {lessonMaterials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-2"
                            >
                              <a
                                href={`/api/materials/${material.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="min-w-0 truncate text-sm text-primary hover:underline"
                              >
                                {material.title}
                              </a>
                              <form
                                action={deleteLessonMaterial.bind(
                                  null,
                                  material.id,
                                  course.id
                                )}
                              >
                                <button
                                  type="submit"
                                  title="Excluir material"
                                  className="text-status-danger hover:opacity-80"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      )}
                      <form
                        action={uploadLessonMaterial.bind(null, lesson.id, course.id)}
                        className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <input
                          name="title"
                          placeholder="Nome do material (opcional)"
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                        />
                        <input
                          name="file"
                          type="file"
                          required
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary file:mr-3 file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-semibold file:text-background"
                        />
                        <Button type="submit" size="sm">
                          Adicionar arquivo
                        </Button>
                      </form>
                      <p className="mt-1 text-xs text-text-muted">
                        PDF, documentos, planilhas, imagens, ZIP e outros arquivos — até 50 MB.
                      </p>
                    </div>
                  );
                })}
              </div>

              <form
                action={createLesson.bind(null, mod.id, course.id)}
                className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
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
          );
        })}

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
  );
}

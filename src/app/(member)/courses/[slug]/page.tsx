import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Play, CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getCourseDetail,
  firstIncompleteLessonId,
  courseProgressPercent,
} from "@/lib/data/courses";
import { EnrollFreeButton } from "@/components/course/EnrollFreeButton";
import { BuyButton } from "@/components/course/BuyButton";
import { CourseCover } from "@/components/course/CourseCover";
import { Button } from "@/components/ui/Button";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course = await getCourseDetail(supabase, slug, user.id);
  if (!course) notFound();

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const nextLessonId = course.enrolled ? firstIncompleteLessonId(course.modules) : null;
  const isCompleted = totalLessons > 0 && courseProgressPercent(course.modules) >= 100;

  return (
    <div>
      <div className="relative flex h-[52vh] min-h-[360px] w-full items-end overflow-hidden">
        <CourseCover
          title={course.title}
          size={280}
          className="absolute inset-0"
          thumbnailUrl={course.thumbnail_url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/10 to-transparent" />

        <div className="relative z-10 max-w-2xl px-6 pb-10 lg:px-12">
          {course.instructor_name && (
            <p className="mb-2 text-sm font-medium text-primary-light">
              {course.instructor_name}
            </p>
          )}
          <h1 className="text-3xl font-bold text-text-primary drop-shadow-lg lg:text-5xl">
            {course.title}
          </h1>

          <div className="mt-6 flex items-center gap-3">
            {course.enrolled ? (
              <Link href={`/courses/${course.slug}/${nextLessonId ?? ""}`}>
                <Button disabled={!nextLessonId} className="flex items-center gap-2">
                  <Play size={18} fill="currentColor" />
                  {isCompleted ? "Revisar" : "Continuar"}
                </Button>
              </Link>
            ) : course.price_cents === 0 ? (
              <EnrollFreeButton courseId={course.id} courseSlug={course.slug} />
            ) : (
              <BuyButton
                courseId={course.id}
                priceLabel={(course.price_cents / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              />
            )}

            {totalLessons > 0 && (
              <span className="text-sm text-text-secondary">{totalLessons} aulas</span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-12">
        {course.description && (
          <p className="text-text-secondary">{course.description}</p>
        )}

        {course.modules.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              Conteúdo do Curso
            </h2>

            <div className="flex flex-col gap-6">
              {course.modules.map((mod, modIndex) => (
                <div key={mod.id}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
                    Módulo {modIndex + 1}: {mod.title}
                  </h3>
                  <div className="divide-y divide-border rounded-lg border border-border bg-surface">
                    {mod.lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.slug}/${lesson.id}`}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-hover"
                      >
                        <span className="w-6 text-center text-sm text-text-muted">
                          {lessonIndex + 1}
                        </span>
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary/20 to-background">
                          <Play size={16} className="text-primary" />
                        </div>
                        <span className="flex-1 text-sm text-text-primary">{lesson.title}</span>
                        {lesson.completed ? (
                          <CheckCircle2 size={18} className="shrink-0 text-status-completed" />
                        ) : (
                          <Circle size={18} className="shrink-0 text-text-muted" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

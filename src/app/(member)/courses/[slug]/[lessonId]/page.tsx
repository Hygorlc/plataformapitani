import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCourseDetail,
  courseProgressPercent,
  getLessonNav,
  isPitaniCourseId,
} from "@/lib/data/courses";
import { getLessonComments } from "@/lib/data/comments";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { VideoEmbed } from "@/components/course/VideoEmbed";
import { CurriculumTree } from "@/components/course/CurriculumTree";
import { MarkCompleteButton } from "@/components/course/MarkCompleteButton";
import { CommentThread } from "@/components/comments/CommentThread";
import { Button } from "@/components/ui/Button";

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course = await getCourseDetail(supabase, slug, user.id);
  if (!course || !course.enrolled) notFound();

  const { current, prev, next } = getLessonNav(course.modules, lessonId);
  if (!current) notFound();

  const progressPercent = courseProgressPercent(course.modules);
  const lessonPath = `/courses/${slug}/${lessonId}`;
  const isPitaniCourse = isPitaniCourseId(course.id);
  const comments = isPitaniCourse ? [] : await getLessonComments(supabase, lessonId, user.id);

  return (
    <div className="px-6 py-8 lg:px-12">
      <ProgressBar percent={progressPercent} label={`${progressPercent}% Completo`} />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <VideoEmbed url={current.video_url} title={current.title} />

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{current.title}</h1>
              {current.description && (
                <p className="mt-1 text-sm text-text-secondary">{current.description}</p>
              )}
            </div>
            {!isPitaniCourse && (
              <MarkCompleteButton
                lessonId={current.id}
                courseId={course.id}
                courseSlug={slug}
                completed={current.completed}
              />
            )}
          </div>

          {current.materials.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-4">
              <h2 className="font-semibold text-text-primary">Materiais da aula</h2>
              <div className="mt-3 grid gap-2">
                {current.materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.file_url}
                    target="_blank"
                    rel="noreferrer"
                    download={material.file_name}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:border-primary/60"
                  >
                    <FileText size={20} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">
                        {material.title}
                      </span>
                      <span className="text-xs text-text-muted">
                        {(material.file_size_bytes / 1024 / 1024).toLocaleString("pt-BR", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        MB
                      </span>
                    </span>
                    <Download size={18} className="text-text-secondary" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Link href={prev ? `/courses/${slug}/${prev.id}` : "#"}>
              <Button variant="secondary" disabled={!prev}>
                <ChevronLeft size={16} /> Aula Anterior
              </Button>
            </Link>
            <Link href={next ? `/courses/${slug}/${next.id}` : "#"}>
              <Button variant="secondary" disabled={!next}>
                Próxima Aula <ChevronRight size={16} />
              </Button>
            </Link>
          </div>

          {!isPitaniCourse && (
            <div className="mt-10 border-t border-border pt-6">
              <CommentThread
                comments={comments}
                lessonId={lessonId}
                courseId={course.id}
                courseSlug={slug}
                lessonPath={lessonPath}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Currículo do Curso
          </h2>
          <CurriculumTree
            modules={course.modules}
            courseSlug={slug}
            currentLessonId={lessonId}
          />
        </div>
      </div>
    </div>
  );
}

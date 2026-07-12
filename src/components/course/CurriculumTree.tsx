import Link from "next/link";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
import type { CourseModule } from "@/lib/data/courses";

export function CurriculumTree({
  modules,
  courseSlug,
  currentLessonId,
}: {
  modules: CourseModule[];
  courseSlug: string;
  currentLessonId?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {modules.map((mod) => {
        const containsCurrent = mod.lessons.some((l) => l.id === currentLessonId);

        return (
          <details
            key={mod.id}
            open={containsCurrent || !currentLessonId}
            className="group rounded-lg border border-border bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-text-primary">
              {mod.title}
              <ChevronDown
                size={16}
                className="text-text-secondary transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="flex flex-col gap-1 px-2 pb-2">
              {mod.lessons.map((lesson) => {
                const active = lesson.id === currentLessonId;
                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseSlug}/${lesson.id}`}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 size={16} className="shrink-0 text-status-completed" />
                    ) : (
                      <Circle size={16} className="shrink-0" />
                    )}
                    {lesson.title}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

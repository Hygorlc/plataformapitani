"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Info } from "lucide-react";
import { CourseCover } from "@/components/course/CourseCover";
import type { CatalogCourse } from "@/lib/data/courses";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ courses }: { courses: CatalogCourse[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || courses.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % courses.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, courses.length]);

  if (courses.length === 0) return null;

  return (
    <div
      className="relative h-[68vh] min-h-[420px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {courses.map((course, i) => {
        const ctaLabel = course.enrolled
          ? course.status === "completed"
            ? "Revisar"
            : "Continuar"
          : course.price_cents === 0
            ? "Começar Grátis"
            : "Assistir";

        return (
          <div
            key={course.id}
            className={`absolute inset-0 flex items-end transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <CourseCover
              title={course.title}
              size={340}
              className="absolute inset-0"
              thumbnailUrl={course.thumbnail_url}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />

            <div className="relative z-10 max-w-2xl px-6 pb-16 lg:px-12">
              {course.instructor_name && (
                <p className="mb-2 text-sm font-medium text-primary-light">
                  {course.instructor_name}
                </p>
              )}
              <h1 className="text-4xl font-bold text-text-primary drop-shadow-lg lg:text-6xl">
                {course.title}
              </h1>
              {course.description && (
                <p className="mt-4 line-clamp-3 text-base text-text-secondary lg:text-lg">
                  {course.description}
                </p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={`/courses/${course.slug}`}
                  className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-semibold text-background transition-colors hover:bg-primary-hover"
                >
                  <Play size={18} fill="currentColor" />
                  {ctaLabel}
                </Link>
                <Link
                  href={`/courses/${course.slug}`}
                  className="flex items-center gap-2 rounded-md bg-surface/80 px-6 py-2.5 font-semibold text-text-primary backdrop-blur-sm transition-colors hover:bg-surface-hover"
                >
                  <Info size={18} />
                  Mais informações
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {courses.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 lg:left-12 lg:translate-x-0">
          {courses.map((course, i) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para ${course.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-4 bg-text-muted/50 hover:bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

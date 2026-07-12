"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import type { CatalogCourse } from "@/lib/data/courses";

export function CourseRow({
  title,
  courses,
}: {
  title: string;
  courses: CatalogCourse[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 800, behavior: "smooth" });
  }

  if (courses.length === 0) return null;

  return (
    <div className="group/row relative">
      <h2 className="mb-3 px-6 text-lg font-semibold text-text-primary lg:px-12">{title}</h2>

      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        className="absolute left-0 top-[calc(50%+0.75rem)] z-30 hidden h-full w-10 -translate-y-1/2 items-center justify-center bg-gradient-to-r from-background to-transparent text-text-primary opacity-0 transition-opacity group-hover/row:opacity-100 lg:flex"
        aria-label="Rolar para a esquerda"
      >
        <ChevronLeft size={28} />
      </button>

      <div
        ref={scrollerRef}
        className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth px-6 pb-2 snap-x lg:px-12"
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        className="absolute right-0 top-[calc(50%+0.75rem)] z-30 hidden h-full w-10 -translate-y-1/2 items-center justify-center bg-gradient-to-l from-background to-transparent text-text-primary opacity-0 transition-opacity group-hover/row:opacity-100 lg:flex"
        aria-label="Rolar para a direita"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}

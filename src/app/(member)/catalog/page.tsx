import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCourses } from "@/lib/data/courses";
import { HeroVideo } from "@/components/course/HeroCarousel";
import { CourseRow } from "@/components/course/CourseRow";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = await getCatalogCourses(supabase, user.id);

  const inProgress = courses.filter((c) => c.status === "in_progress");
  const newCourses = courses.filter((c) => c.status === "new");
  const completed = courses.filter((c) => c.status === "completed");

  return (
    <div>
      <HeroVideo />

      <div className="flex flex-col gap-10 py-8">
        <CourseRow title="Continuar Aprendendo" courses={inProgress} />
        <CourseRow title="Novidades" courses={newCourses} />
        <CourseRow title="Todos os Cursos" courses={courses} />
        <CourseRow title="Concluídos" courses={completed} />
      </div>

      {courses.length === 0 && (
        <p className="px-6 py-16 text-center text-text-secondary lg:px-12">
          Nenhum curso disponível no momento.
        </p>
      )}
    </div>
  );
}

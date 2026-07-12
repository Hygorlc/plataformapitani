import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCourses } from "@/lib/data/courses";
import { CourseCard } from "@/components/course/CourseCard";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = (await getCatalogCourses(supabase, user.id)).filter((c) => c.enrolled);

  return (
    <div className="px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-semibold text-text-primary">Meus Cursos</h1>
      <p className="mt-1 text-text-secondary">
        Seus cursos em andamento e concluídos.
      </p>

      {courses.length === 0 ? (
        <p className="mt-8 text-text-secondary">
          Você ainda não está matriculado em nenhum curso. Explore o{" "}
          <a href="/catalog" className="text-primary hover:underline">
            catálogo
          </a>{" "}
          para começar.
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

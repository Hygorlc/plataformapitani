import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCatalogCourses } from "@/lib/data/courses";
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
      <section className="relative flex w-full items-center justify-center overflow-hidden border-b border-border bg-black px-4 py-5 md:px-8 md:py-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_62%)]"
        />
        <Image
          src="/alianca-empreendedora-convite.jpeg"
          alt="Convite Aliança Empreendedora — encontro presencial em Porto Alegre"
          width={1024}
          height={1280}
          priority
          className="relative h-auto max-h-[78vh] w-auto max-w-full rounded-sm object-contain shadow-2xl shadow-black ring-1 ring-primary/20"
        />
      </section>

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

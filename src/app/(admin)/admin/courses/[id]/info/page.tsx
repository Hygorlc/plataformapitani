import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCourseInfo } from "@/lib/actions/admin/courses";
import { CourseInfoForm } from "@/components/admin/CourseInfoForm";

export default async function CourseInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">Informações básicas</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Os dados abaixo são muito importantes para seu produto. Preencha-os com atenção.
      </p>

      <form action={updateCourseInfo.bind(null, course.id)} className="mt-6">
        <CourseInfoForm course={course} />
      </form>
    </div>
  );
}

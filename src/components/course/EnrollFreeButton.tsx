import { redirect } from "next/navigation";
import { enrollFree } from "@/lib/actions/courses";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export function EnrollFreeButton({
  courseId,
  courseSlug,
}: {
  courseId: string;
  courseSlug: string;
}) {
  const action = async () => {
    "use server";
    await enrollFree(courseId);

    // Enrollment now exists, so RLS allows reading this course's lessons.
    const supabase = await createClient();
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .order("position")
      .limit(1);

    let firstLessonId: string | null = null;
    if (modules?.[0]) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("module_id", modules[0].id)
        .order("position")
        .limit(1);
      firstLessonId = lessons?.[0]?.id ?? null;
    }

    redirect(firstLessonId ? `/courses/${courseSlug}/${firstLessonId}` : `/courses/${courseSlug}`);
  };

  return (
    <form action={action}>
      <Button type="submit">Inscrever-se Grátis</Button>
    </form>
  );
}

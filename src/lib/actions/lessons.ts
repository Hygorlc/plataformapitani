"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleLessonComplete(
  lessonId: string,
  courseId: string,
  courseSlug: string,
  completed: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) throw new Error(error.message);

  if (completed) {
    await maybeIssueCertificate(supabase, user.id, courseId);
  }

  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/catalog");
  revalidatePath("/my-courses");
  revalidatePath("/certificates");
}

async function maybeIssueCertificate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string
) {
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (!lessons || lessons.length === 0) return;

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", true);

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));
  const allCompleted = lessons.every((l) => completedIds.has(l.id));
  if (!allCompleted) return;

  const admin = createAdminClient();
  await admin
    .from("certificates")
    .upsert(
      { user_id: userId, course_id: courseId },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );
}

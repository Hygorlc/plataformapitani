"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function enrollFree(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: course } = await supabase
    .from("courses")
    .select("id, price_cents, status")
    .eq("id", courseId)
    .single();

  if (!course || course.status !== "published" || course.price_cents !== 0) {
    throw new Error("Este curso não está disponível para matrícula gratuita.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("enrollments")
    .upsert(
      { user_id: user.id, course_id: courseId, amount_paid_cents: 0 },
      { onConflict: "user_id,course_id" }
    );

  if (error) throw new Error(error.message);

  revalidatePath("/catalog");
  revalidatePath("/my-courses");
}

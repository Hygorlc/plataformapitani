"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function postComment(
  lessonId: string,
  courseId: string,
  courseSlug: string,
  lessonPath: string,
  parentId: string | null,
  formData: FormData
) {
  const trimmed = String(formData.get("body") ?? "").trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("comments").insert({
    lesson_id: lessonId,
    course_id: courseId,
    user_id: user.id,
    parent_id: parentId ?? null,
    body: trimmed,
  });

  if (error) throw new Error(error.message);

  revalidatePath(lessonPath);
  void courseSlug;
}

export async function toggleReaction(
  commentId: string,
  emoji: string,
  lessonPath: string,
  _formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: existing } = await supabase
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("comment_reactions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("comment_reactions")
      .insert({ comment_id: commentId, user_id: user.id, emoji });
  }

  revalidatePath(lessonPath);
}

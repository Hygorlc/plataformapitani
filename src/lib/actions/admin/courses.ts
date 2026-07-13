"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const instructorName = String(formData.get("instructor_name") ?? "").trim() || null;
  const priceReais = Number(formData.get("price") ?? 0);
  const priceCents = Math.max(0, Math.round(priceReais * 100));

  if (!title) throw new Error("O título é obrigatório.");

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug: slugify(title),
      description,
      instructor_name: instructorName,
      price_cents: priceCents,
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const instructorName = String(formData.get("instructor_name") ?? "").trim() || null;
  const priceReais = Number(formData.get("price") ?? 0);
  const priceCents = Math.max(0, Math.round(priceReais * 100));

  if (!title) throw new Error("O título é obrigatório.");

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description,
      instructor_name: instructorName,
      price_cents: priceCents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
}

export async function togglePublish(courseId: string, nextStatus: "draft" | "published") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ status: nextStatus })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function createModule(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { data: existing } = await supabase
    .from("modules")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existing?.[0]?.position ?? 0) + 1;

  const { error } = await supabase
    .from("modules")
    .insert({ course_id: courseId, title, position: nextPosition });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { error } = await supabase.from("modules").update({ title }).eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateModuleWithLessons(
  moduleId: string,
  courseId: string,
  lessonIds: string[],
  formData: FormData
) {
  const supabase = await createClient();

  const moduleTitle = String(formData.get("module_title") ?? "").trim();
  if (!moduleTitle) throw new Error("O título do módulo é obrigatório.");

  const { error: moduleError } = await supabase
    .from("modules")
    .update({ title: moduleTitle })
    .eq("id", moduleId);
  if (moduleError) throw new Error(moduleError.message);

  for (const lessonId of lessonIds) {
    const title = String(formData.get(`lesson_${lessonId}_title`) ?? "").trim();
    const videoUrl = String(formData.get(`lesson_${lessonId}_video_url`) ?? "").trim();
    const description =
      String(formData.get(`lesson_${lessonId}_description`) ?? "").trim() || null;
    if (!title || !videoUrl) continue;

    const { error: lessonError } = await supabase
      .from("lessons")
      .update({ title, video_url: videoUrl, description })
      .eq("id", lessonId);
    if (lessonError) throw new Error(lessonError.message);
  }

  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title || !videoUrl) return;

  const { data: existing } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existing?.[0]?.position ?? 0) + 1;

  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    course_id: courseId,
    title,
    video_url: videoUrl,
    description,
    position: nextPosition,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!title || !videoUrl) return;

  const { error } = await supabase
    .from("lessons")
    .update({ title, video_url: videoUrl, description })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

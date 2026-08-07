"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPitaniCourseVideoUrl, PITANI_COURSES } from "@/lib/data/courses";
import type { TablesUpdate } from "@/types/database.types";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const COVER_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

async function uploadCoverImage(file: File, slug: string): Promise<string> {
  const ext = COVER_TYPES[file.type];
  if (!ext) throw new Error("A imagem deve ser JPG ou PNG.");
  if (file.size > MAX_COVER_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");

  const admin = createAdminClient();
  const path = `${slug}-${Date.now()}.${ext}`;

  const { error } = await admin.storage
    .from("course-covers")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Falha no upload da imagem: ${error.message}`);

  const { data } = admin.storage.from("course-covers").getPublicUrl(path);
  return data.publicUrl;
}

async function uniqueSlug(base: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin.from("courses").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((c) => c.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function materializeBuiltInCourse(slug: string) {
  const template = PITANI_COURSES.find((course) => course.slug === slug);
  if (!template) throw new Error("Curso padrão não encontrado.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Acesso não autorizado.");

  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  let courseId = existing?.id;
  if (!courseId) {
    const { data: course, error: courseError } = await admin
      .from("courses")
      .insert({
        title: template.title,
        slug: template.slug,
        description: template.description,
        category: template.category,
        instructor_name: template.instructor_name,
        thumbnail_url: template.thumbnail_url,
        price_cents: template.price_cents,
        status: "published",
        created_by: user.id,
      })
      .select("id")
      .single();
    if (courseError) throw new Error(courseError.message);
    courseId = course.id;

    const { data: module, error: moduleError } = await admin
      .from("modules")
      .insert({ course_id: courseId, title: "Treinamento", position: 1 })
      .select("id")
      .single();
    if (moduleError) {
      await admin.from("courses").delete().eq("id", courseId);
      throw new Error(moduleError.message);
    }

    const { error: lessonError } = await admin.from("lessons").insert({
      course_id: courseId,
      module_id: module.id,
      title: template.title,
      description: template.description,
      video_url: getPitaniCourseVideoUrl(template.slug),
      position: 1,
    });
    if (lessonError) {
      await admin.from("courses").delete().eq("id", courseId);
      throw new Error(lessonError.message);
    }
  }

  revalidatePath("/admin/courses");
  revalidatePath("/catalog");
  revalidatePath(`/courses/${slug}`);
  redirect(`/admin/courses/${courseId}/panel`);
}

export async function createCourseWizard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("O nome do produto é obrigatório.");

  const description = String(formData.get("description") ?? "").trim().slice(0, 2000) || null;
  const language = String(formData.get("language") ?? "").trim() || null;
  const salesCountry = String(formData.get("sales_country") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const instructorName = String(formData.get("instructor_name") ?? "").trim() || null;
  const priceReais = Number(formData.get("price") ?? 0);
  const priceCents = Math.max(0, Math.round(priceReais * 100));

  const slug = await uniqueSlug(slugify(title));

  let thumbnailUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    thumbnailUrl = await uploadCoverImage(image, slug);
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug,
      description,
      language,
      sales_country: salesCountry,
      category,
      instructor_name: instructorName,
      thumbnail_url: thumbnailUrl,
      price_cents: priceCents,
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}/panel`);
}

export async function updateCourseInfo(courseId: string, formData: FormData) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("O nome do produto é obrigatório.");

  const description = String(formData.get("description") ?? "").trim().slice(0, 2000) || null;
  const language = String(formData.get("language") ?? "").trim() || null;
  const salesCountry = String(formData.get("sales_country") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const instructorName = String(formData.get("instructor_name") ?? "").trim() || null;

  const updates: TablesUpdate<"courses"> = {
    title,
    description,
    language,
    sales_country: salesCountry,
    category,
    instructor_name: instructorName,
    updated_at: new Date().toISOString(),
  };

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const { data: course } = await supabase
      .from("courses")
      .select("slug")
      .eq("id", courseId)
      .single();
    updates.thumbnail_url = await uploadCoverImage(image, course?.slug ?? courseId);
  }

  const { error } = await supabase.from("courses").update(updates).eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/courses/${courseId}`, "layout");
  revalidatePath("/admin/courses");
}

export async function updateCoursePricing(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Acesso não autorizado.");

  const admin = createAdminClient();

  const priceReais = Number(formData.get("price") ?? 0);
  const priceCents = Math.max(0, Math.round(priceReais * 100));
  const originalPriceReais = Number(formData.get("original_price") ?? 0);
  const originalPriceCents =
    originalPriceReais > 0 ? Math.round(originalPriceReais * 100) : null;
  const promotionEnabled = formData.get("promotion_enabled") === "on";
  const promotionText =
    String(formData.get("promotion_text") ?? "").trim().slice(0, 60) ||
    "Condição especial";
  const promotionDays = Math.min(
    365,
    Math.max(1, Math.round(Number(formData.get("promotion_days") ?? 7) || 7))
  );

  const { error } = await admin
    .from("courses")
    .update({
      price_cents: priceCents,
      original_price_cents: originalPriceCents,
      promotion_enabled: promotionEnabled,
      promotion_text: promotionText,
      promotion_days: promotionDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId);
  if (error?.code === "42703") {
    const { error: legacyError } = await admin
      .from("courses")
      .update({ price_cents: priceCents, updated_at: new Date().toISOString() })
      .eq("id", courseId);
    if (legacyError) throw new Error(legacyError.message);
  } else if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/courses/${courseId}`, "layout");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/users");
  revalidatePath("/catalog");
}


export async function togglePublish(courseId: string, nextStatus: "draft" | "published") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ status: nextStatus })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Acesso não autorizado.");

  const admin = createAdminClient();
  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle();
  if (courseError) throw new Error(courseError.message);
  if (!course) throw new Error("Curso não encontrado.");

  const { data: comments, error: commentsError } = await admin
    .from("comments")
    .select("id")
    .eq("course_id", courseId);
  if (commentsError) throw new Error(commentsError.message);

  const commentIds = (comments ?? []).map((comment) => comment.id);
  if (commentIds.length > 0) {
    const { error } = await admin
      .from("comment_reactions")
      .delete()
      .in("comment_id", commentIds);
    if (error) throw new Error(error.message);
  }

  const { data: materials, error: materialsError } = await admin
    .from("lesson_materials")
    .select("storage_path")
    .eq("course_id", courseId);
  if (materialsError) throw new Error(materialsError.message);

  const storagePaths = (materials ?? []).map((material) => material.storage_path);
  if (storagePaths.length > 0) {
    const { error } = await admin.storage.from("lesson-materials").remove(storagePaths);
    if (error) throw new Error(error.message);
  }

  for (const table of [
    "certificates",
    "comments",
    "lesson_progress",
    "enrollments",
    "course_access_invites",
    "lesson_materials",
    "lessons",
    "modules",
  ] as const) {
    const { error } = await admin.from(table).delete().eq("course_id", courseId);
    if (error) throw new Error(error.message);
  }

  // Mantém apenas uma marca interna para que cursos padrão excluídos não reapareçam.
  const { error } = await admin
    .from("courses")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", courseId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/users");
  revalidatePath("/catalog");
  revalidatePath("/my-courses");
  revalidatePath("/community");
  revalidatePath(`/courses/${course.slug}`, "layout");
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
  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

export async function updateModule(moduleId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { error } = await supabase.from("modules").update({ title }).eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`, "layout");
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

  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

export async function deleteModule(moduleId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`, "layout");
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
  revalidatePath(`/admin/courses/${courseId}`, "layout");
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
  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

const MAX_MATERIAL_BYTES = 50 * 1024 * 1024;

export async function uploadLessonMaterial(
  lessonId: string,
  courseId: string,
  formData: FormData
) {
  const file = formData.get("file");
  const customTitle = String(formData.get("title") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecione um arquivo.");
  }
  if (file.size > MAX_MATERIAL_BYTES) {
    throw new Error("O arquivo deve ter no máximo 50 MB.");
  }

  const safeName = file.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-");
  const storagePath = `${courseId}/${lessonId}/${crypto.randomUUID()}-${safeName}`;
  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from("lesson-materials")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) throw new Error(`Falha no envio: ${uploadError.message}`);

  const { data: publicUrl } = admin.storage
    .from("lesson-materials")
    .getPublicUrl(storagePath);
  const { error: insertError } = await admin.from("lesson_materials").insert({
    course_id: courseId,
    lesson_id: lessonId,
    title: customTitle || file.name,
    file_name: file.name,
    file_url: publicUrl.publicUrl,
    storage_path: storagePath,
    file_size_bytes: file.size,
    mime_type: file.type || null,
  });

  if (insertError) {
    await admin.storage.from("lesson-materials").remove([storagePath]);
    throw new Error(insertError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

export async function deleteLessonMaterial(
  materialId: string,
  courseId: string
) {
  const admin = createAdminClient();
  const { data: material } = await admin
    .from("lesson_materials")
    .select("storage_path")
    .eq("id", materialId)
    .single();
  if (!material) throw new Error("Material não encontrado.");

  const { error: storageError } = await admin.storage
    .from("lesson-materials")
    .remove([material.storage_path]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await admin.from("lesson_materials").delete().eq("id", materialId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`, "layout");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Acesso não autorizado.");
  return user;
}

export async function updateUserRole(userId: string, role: "student" | "admin") {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}

export async function createStudent(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const courseId = String(formData.get("course_id") ?? "").trim();

  if (!fullName || !email || password.length < 6) {
    throw new Error("Informe nome, e-mail e uma senha com pelo menos 6 caracteres.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(error.message);

  const now = new Date().toISOString();
  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role: "student",
    student_since: courseId ? now : null,
  });
  if (profileError) throw new Error(profileError.message);

  if (courseId) {
    const { error: enrollmentError } = await admin.from("enrollments").insert({
      user_id: data.user.id,
      course_id: courseId,
      status: "active",
      enrolled_at: now,
    });
    if (enrollmentError) throw new Error(enrollmentError.message);
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
}

export async function addProductToUser(userId: string, formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "").trim();
  if (!courseId) throw new Error("Selecione um produto.");

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  const now = new Date().toISOString();
  const { error } = existing
    ? await admin
        .from("enrollments")
        .update({ status: "active", enrolled_at: now })
        .eq("id", existing.id)
    : await admin.from("enrollments").insert({
        user_id: userId,
        course_id: courseId,
        status: "active",
        enrolled_at: now,
      });
  if (error) throw new Error(error.message);

  await admin
    .from("profiles")
    .update({ student_since: now })
    .eq("id", userId)
    .is("student_since", null);

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
}

export async function deleteStudent(userId: string) {
  const currentAdmin = await requireAdmin();
  if (currentAdmin.id === userId) {
    throw new Error("Você não pode excluir a própria conta.");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) throw new Error("Aluno não encontrado.");
  if (profile.role === "admin") {
    throw new Error("Contas administrativas não podem ser excluídas por este botão.");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
}

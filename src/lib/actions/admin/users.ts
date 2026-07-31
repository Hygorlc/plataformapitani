"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  applyPendingCourseAssignments,
  normalizeAssignmentEmail,
} from "@/lib/course-assignments";

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

export async function assignCoursesByEmail(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const email = normalizeAssignmentEmail(String(formData.get("email") ?? ""));
  const courseIds = [
    ...new Set(
      formData
        .getAll("course_ids")
        .map(String)
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Informe um e-mail válido.");
  }
  if (!courseIds.length) {
    throw new Error("Selecione pelo menos um curso.");
  }

  const admin = createAdminClient();
  const { data: validCourses, error: courseError } = await admin
    .from("courses")
    .select("id")
    .in("id", courseIds)
    .eq("status", "published");
  if (courseError) throw new Error(courseError.message);
  if ((validCourses ?? []).length !== courseIds.length) {
    throw new Error("Um ou mais cursos selecionados não estão disponíveis.");
  }

  const { error: inviteError } = await admin.from("course_access_invites").upsert(
    courseIds.map((courseId) => ({
      email,
      course_id: courseId,
      created_by: currentAdmin.id,
      created_at: new Date().toISOString(),
      claimed_at: null,
      claimed_by: null,
    })),
    { onConflict: "email,course_id" }
  );
  if (inviteError) throw new Error(inviteError.message);

  const { data: authData, error: authError } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) throw new Error(authError.message);
  const existingUser = authData.users.find(
    (user) => normalizeAssignmentEmail(user.email ?? "") === email
  );
  if (existingUser) {
    await applyPendingCourseAssignments(existingUser.id, email);
  }

  revalidatePath("/admin/users");
  revalidatePath("/catalog");
  revalidatePath("/my-courses");
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
  const courseIds = [
    ...new Set(
      formData
        .getAll("course_ids")
        .map(String)
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
  if (!courseIds.length) throw new Error("Selecione pelo menos um produto.");

  const admin = createAdminClient();
  const { data: validCourses, error: courseError } = await admin
    .from("courses")
    .select("id")
    .in("id", courseIds)
    .eq("status", "published");
  if (courseError) throw new Error(courseError.message);
  if ((validCourses ?? []).length !== courseIds.length) {
    throw new Error("Um ou mais produtos selecionados não estão disponíveis.");
  }

  const { data: existing, error: existingError } = await admin
    .from("enrollments")
    .select("id, course_id")
    .eq("user_id", userId)
    .in("course_id", courseIds);
  if (existingError) throw new Error(existingError.message);

  const now = new Date().toISOString();
  const existingIds = (existing ?? []).map((enrollment) => enrollment.id);
  if (existingIds.length) {
    const { error } = await admin
      .from("enrollments")
      .update({ status: "active", enrolled_at: now })
      .in("id", existingIds);
    if (error) throw new Error(error.message);
  }

  const existingCourseIds = new Set(
    (existing ?? []).map((enrollment) => enrollment.course_id)
  );
  const newEnrollments = courseIds
    .filter((courseId) => !existingCourseIds.has(courseId))
    .map((courseId) => ({
      user_id: userId,
      course_id: courseId,
      status: "active",
      enrolled_at: now,
    }));
  if (newEnrollments.length) {
    const { error } = await admin.from("enrollments").insert(newEnrollments);
    if (error) throw new Error(error.message);
  }

  await admin
    .from("profiles")
    .update({ student_since: now })
    .eq("id", userId)
    .is("student_since", null);

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
}

export async function updateStudentPassword(userId: string, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || profile.role === "admin") {
    throw new Error("A senha só pode ser alterada por esta opção para contas de alunos.");
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
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

  const { data: authData, error: authError } =
    await admin.auth.admin.getUserById(userId);
  if (authError) throw new Error(authError.message);

  const email = normalizeAssignmentEmail(authData.user.email ?? "");
  if (!email) {
    throw new Error("Não foi possível identificar o e-mail do aluno.");
  }

  const { error: progressError } = await admin
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId);
  if (progressError) throw new Error(progressError.message);

  const { error: enrollmentError } = await admin
    .from("enrollments")
    .delete()
    .eq("user_id", userId);
  if (enrollmentError) throw new Error(enrollmentError.message);

  const { error: claimedInviteError } = await admin
    .from("course_access_invites")
    .delete()
    .eq("claimed_by", userId);
  if (claimedInviteError) throw new Error(claimedInviteError.message);

  const { error: emailInviteError } = await admin
    .from("course_access_invites")
    .delete()
    .eq("email", email);
  if (emailInviteError) throw new Error(emailInviteError.message);

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin/courses");
  revalidatePath("/catalog");
  revalidatePath("/my-courses");
}

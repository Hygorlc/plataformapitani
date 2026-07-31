import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export function normalizeAssignmentEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function applyPendingCourseAssignments(userId: string, rawEmail: string) {
  const email = normalizeAssignmentEmail(rawEmail);
  if (!email) return 0;

  const admin = createAdminClient();
  const { data: invites, error: inviteError } = await admin
    .from("course_access_invites")
    .select("id, course_id")
    .eq("email", email)
    .is("claimed_at", null);
  if (inviteError) throw new Error(inviteError.message);
  if (!invites?.length) return 0;

  const courseIds = [...new Set(invites.map((invite) => invite.course_id))];
  const { data: existing, error: existingError } = await admin
    .from("enrollments")
    .select("id, course_id, status")
    .eq("user_id", userId)
    .in("course_id", courseIds);
  if (existingError) throw new Error(existingError.message);

  const now = new Date().toISOString();
  const existingCourseIds = new Set((existing ?? []).map((item) => item.course_id));
  const existingIds = (existing ?? []).map((item) => item.id);
  const missingCourseIds = courseIds.filter((courseId) => !existingCourseIds.has(courseId));

  if (existingIds.length) {
    const { error } = await admin
      .from("enrollments")
      .update({ status: "active", enrolled_at: now })
      .in("id", existingIds);
    if (error) throw new Error(error.message);
  }

  if (missingCourseIds.length) {
    const { error } = await admin.from("enrollments").insert(
      missingCourseIds.map((courseId) => ({
        user_id: userId,
        course_id: courseId,
        status: "active",
        enrolled_at: now,
      }))
    );
    if (error) throw new Error(error.message);
  }

  const { error: claimError } = await admin
    .from("course_access_invites")
    .update({ claimed_at: now, claimed_by: userId })
    .in("id", invites.map((invite) => invite.id));
  if (claimError) throw new Error(claimError.message);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ student_since: now })
    .eq("id", userId)
    .is("student_since", null);
  if (profileError) throw new Error(profileError.message);

  return courseIds.length;
}

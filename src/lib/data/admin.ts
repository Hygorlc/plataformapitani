import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { PITANI_COURSES } from "@/lib/data/courses";

type TypedClient = SupabaseClient<Database>;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface DashboardStats {
  totalStudents: number;
  newStudentsLast30Days: number;
  activeCourses: number;
  newCoursesLast30Days: number;
  revenueCents: number;
  revenueLast30DaysCents: number;
}

export async function getDashboardStats(supabase: TypedClient): Promise<DashboardStats> {
  const [{ data: profiles }, { data: courses }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("created_at"),
    supabase.from("courses").select("status, created_at"),
    supabase.from("enrollments").select("amount_paid_cents, enrolled_at"),
  ]);

  const cutoff = Date.now() - THIRTY_DAYS_MS;

  const totalStudents = profiles?.length ?? 0;
  const newStudentsLast30Days = (profiles ?? []).filter(
    (p) => new Date(p.created_at).getTime() >= cutoff
  ).length;

  const activeCoursesList = (courses ?? []).filter((c) => c.status === "published");
  const activeCourses = activeCoursesList.length;
  const newCoursesLast30Days = activeCoursesList.filter(
    (c) => new Date(c.created_at).getTime() >= cutoff
  ).length;

  const revenueCents = (enrollments ?? []).reduce((sum, e) => sum + e.amount_paid_cents, 0);
  const revenueLast30DaysCents = (enrollments ?? [])
    .filter((e) => new Date(e.enrolled_at).getTime() >= cutoff)
    .reduce((sum, e) => sum + e.amount_paid_cents, 0);

  return {
    totalStudents,
    newStudentsLast30Days,
    activeCourses,
    newCoursesLast30Days,
    revenueCents,
    revenueLast30DaysCents,
  };
}

export interface AdminCourseRow {
  id: string;
  title: string;
  slug: string;
  instructor_name: string | null;
  status: string;
  studentCount: number;
  isBuiltIn: boolean;
}

export async function getAdminCourses(supabase: TypedClient): Promise<AdminCourseRow[]> {
  const [{ data: courses }, { data: enrollments }, { data: students }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("enrollments").select("course_id"),
    supabase.from("profiles").select("id").eq("role", "student"),
  ]);

  const countByCourse = new Map<string, number>();
  (enrollments ?? []).forEach((e) => {
    countByCourse.set(e.course_id, (countByCourse.get(e.course_id) ?? 0) + 1);
  });

  const databaseCourses = (courses ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    instructor_name: c.instructor_name,
    status: c.status,
    studentCount: countByCourse.get(c.id) ?? 0,
    isBuiltIn: false,
  }));

  const databaseSlugs = new Set(databaseCourses.map((course) => course.slug));
  const builtInCourses = PITANI_COURSES.filter(
    (course) => !databaseSlugs.has(course.slug)
  ).map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    instructor_name: course.instructor_name,
    status: "published",
    studentCount: students?.length ?? 0,
    isBuiltIn: true,
  }));

  return [...builtInCourses, ...databaseCourses];
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "student" | "admin";
  created_at: string;
  enrolledCourseIds: string[];
}

export interface CourseAccessAssignmentRow {
  id: string;
  email: string;
  courseTitle: string;
  created_at: string;
  claimed_at: string | null;
}

export async function getCourseAccessAssignments(): Promise<CourseAccessAssignmentRow[]> {
  const admin = createAdminClient();
  const [{ data: assignments }, { data: courses }] = await Promise.all([
    admin
      .from("course_access_invites")
      .select("id, email, course_id, created_at, claimed_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("courses").select("id, title"),
  ]);
  const courseTitleById = new Map((courses ?? []).map((course) => [course.id, course.title]));

  return (assignments ?? []).map((assignment) => ({
    id: assignment.id,
    email: assignment.email,
    courseTitle: courseTitleById.get(assignment.course_id) ?? "Curso removido",
    created_at: assignment.created_at,
    claimed_at: assignment.claimed_at,
  }));
}

export async function getAdminUsers(supabase: TypedClient): Promise<AdminUserRow[]> {
  const [{ data: profiles }, { data: enrollments }, admin] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("enrollments").select("user_id, course_id").eq("status", "active"),
    Promise.resolve(createAdminClient()),
  ]);

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(authData?.users.map((u) => [u.id, u.email ?? ""]) ?? []);
  const coursesByUser = new Map<string, string[]>();
  (enrollments ?? []).forEach((enrollment) => {
    coursesByUser.set(enrollment.user_id, [
      ...(coursesByUser.get(enrollment.user_id) ?? []),
      enrollment.course_id,
    ]);
  });

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? "",
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      enrolledCourseIds: coursesByUser.get(p.id) ?? [],
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

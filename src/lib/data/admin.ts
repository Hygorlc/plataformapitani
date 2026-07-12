import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";

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
  instructor_name: string | null;
  status: string;
  studentCount: number;
}

export async function getAdminCourses(supabase: TypedClient): Promise<AdminCourseRow[]> {
  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: false }),
    supabase.from("enrollments").select("course_id"),
  ]);

  const countByCourse = new Map<string, number>();
  (enrollments ?? []).forEach((e) => {
    countByCourse.set(e.course_id, (countByCourse.get(e.course_id) ?? 0) + 1);
  });

  return (courses ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    instructor_name: c.instructor_name,
    status: c.status,
    studentCount: countByCourse.get(c.id) ?? 0,
  }));
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "student" | "admin";
  created_at: string;
}

export async function getAdminUsers(supabase: TypedClient): Promise<AdminUserRow[]> {
  const [{ data: profiles }, admin] = await Promise.all([
    supabase.from("profiles").select("*"),
    Promise.resolve(createAdminClient()),
  ]);

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(authData?.users.map((u) => [u.id, u.email ?? ""]) ?? []);

  return (profiles ?? [])
    .map((p) => ({
      id: p.id,
      email: emailById.get(p.id) ?? "",
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

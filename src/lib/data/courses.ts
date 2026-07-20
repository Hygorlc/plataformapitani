import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type TypedClient = SupabaseClient<Database>;

export type CourseStatus = "new" | "in_progress" | "completed" | "available";

export interface CatalogCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor_name: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  enrolled: boolean;
  progressPercent: number;
  status: CourseStatus;
}

const PITANI_COURSES: CatalogCourse[] = [
  {
    id: "pitani-domine-sua-rotina",
    title: "Treinamento Domine sua Rotina",
    slug: "domine-sua-rotina",
    description:
      "Aprenda a organizar prioridades, criar uma rotina produtiva e avançar com consistência em direção aos seus objetivos.",
    instructor_name: "Pablo Pitani",
    thumbnail_url:
      "https://pablopitani.com.br/wp-content/uploads/2026/04/Thumb-domine-sua-rotina-1.png",
    price_cents: 0,
    enrolled: true,
    progressPercent: 0,
    status: "new",
  },
  {
    id: "pitani-neurovendas",
    title: "Treinamento Neurovendas",
    slug: "neurovendas",
    description:
      "Conheça princípios de comportamento e comunicação aplicados a vendas para criar conexões e apresentar valor com mais clareza.",
    instructor_name: "Pablo Pitani",
    thumbnail_url:
      "https://pablopitani.com.br/wp-content/uploads/2026/04/Thumb-neurovendas-2.png",
    price_cents: 0,
    enrolled: true,
    progressPercent: 0,
    status: "new",
  },
];

export function isPitaniCourseId(courseId: string): boolean {
  return courseId.startsWith("pitani-");
}

const NEW_WINDOW_DAYS = 14;

export async function getCatalogCourses(
  supabase: TypedClient,
  userId: string
): Promise<CatalogCourse[]> {
  const [{ data: courses }, { data: lessons }, { data: enrollments }, { data: progress }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("status", "published"),
      supabase.from("lessons").select("id, course_id"),
      supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", userId)
        .eq("status", "active"),
      supabase
        .from("lesson_progress")
        .select("course_id, completed")
        .eq("user_id", userId)
        .eq("completed", true),
    ]);

  const enrolledCourseIds = new Set((enrollments ?? []).map((e) => e.course_id));

  const lessonCountByCourse = new Map<string, number>();
  (lessons ?? []).forEach((l) => {
    lessonCountByCourse.set(l.course_id, (lessonCountByCourse.get(l.course_id) ?? 0) + 1);
  });

  const completedCountByCourse = new Map<string, number>();
  (progress ?? []).forEach((p) => {
    completedCountByCourse.set(p.course_id, (completedCountByCourse.get(p.course_id) ?? 0) + 1);
  });

  const now = Date.now();

  const databaseCourses = (courses ?? []).map((course) => {
    const enrolled = enrolledCourseIds.has(course.id);
    const total = lessonCountByCourse.get(course.id) ?? 0;
    const completed = completedCountByCourse.get(course.id) ?? 0;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    let status: CourseStatus;
    if (enrolled) {
      status = total > 0 && progressPercent >= 100 ? "completed" : "in_progress";
    } else {
      const ageDays = (now - new Date(course.created_at).getTime()) / (1000 * 60 * 60 * 24);
      status = ageDays <= NEW_WINDOW_DAYS ? "new" : "available";
    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      instructor_name: course.instructor_name,
      thumbnail_url: course.thumbnail_url,
      price_cents: course.price_cents,
      enrolled,
      progressPercent,
      status,
    };
  });

  const databaseSlugs = new Set(databaseCourses.map((course) => course.slug));
  const pitaniCourses = PITANI_COURSES.filter((course) => !databaseSlugs.has(course.slug));

  return [...pitaniCourses, ...databaseCourses];
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  position: number;
  completed: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  position: number;
  lessons: CourseLesson[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor_name: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  enrolled: boolean;
  modules: CourseModule[];
}

export async function getCourseDetail(
  supabase: TypedClient,
  slug: string,
  userId: string
): Promise<CourseDetail | null> {
  const pitaniCourse = PITANI_COURSES.find((course) => course.slug === slug);
  if (pitaniCourse) {
    const lessonId = `${pitaniCourse.id}-aula`;
    const videoUrl =
      slug === "domine-sua-rotina"
        ? "https://www.youtube.com/watch?v=PDN85o-jvD8"
        : "https://www.youtube.com/watch?v=9sRoTNfdEUk";

    return {
      id: pitaniCourse.id,
      title: pitaniCourse.title,
      slug: pitaniCourse.slug,
      description: pitaniCourse.description,
      instructor_name: pitaniCourse.instructor_name,
      thumbnail_url: pitaniCourse.thumbnail_url,
      price_cents: pitaniCourse.price_cents,
      enrolled: true,
      modules: [
        {
          id: `${pitaniCourse.id}-modulo`,
          title: "Treinamento",
          position: 1,
          lessons: [
            {
              id: lessonId,
              title: pitaniCourse.title,
              description: pitaniCourse.description,
              video_url: videoUrl,
              position: 1,
              completed: false,
            },
          ],
        },
      ],
    };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return null;

  const [{ data: enrollment }, { data: modules }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", course.id)
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("modules")
        .select("*")
        .eq("course_id", course.id)
        .order("position"),
      supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("position"),
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId)
        .eq("course_id", course.id),
    ]);

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  const courseModules: CourseModule[] = (modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    lessons: (lessons ?? [])
      .filter((l) => l.module_id === m.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        video_url: l.video_url,
        position: l.position,
        completed: completedLessonIds.has(l.id),
      })),
  }));

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    instructor_name: course.instructor_name,
    thumbnail_url: course.thumbnail_url,
    price_cents: course.price_cents,
    enrolled: !!enrollment,
    modules: courseModules,
  };
}

export function firstIncompleteLessonId(modules: CourseModule[]): string | null {
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (!lesson.completed) return lesson.id;
    }
  }
  return modules[0]?.lessons[0]?.id ?? null;
}

export function flattenLessons(modules: CourseModule[]): CourseLesson[] {
  return modules.flatMap((m) => m.lessons);
}

export function courseProgressPercent(modules: CourseModule[]): number {
  const lessons = flattenLessons(modules);
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((l) => l.completed).length;
  return Math.round((completed / lessons.length) * 100);
}

export function getLessonNav(modules: CourseModule[], currentLessonId: string) {
  const lessons = flattenLessons(modules);
  const index = lessons.findIndex((l) => l.id === currentLessonId);

  return {
    current: index >= 0 ? lessons[index] : null,
    prev: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
    index,
    total: lessons.length,
  };
}

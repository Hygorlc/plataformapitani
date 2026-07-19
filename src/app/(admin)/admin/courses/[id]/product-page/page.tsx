import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseCover } from "@/components/course/CourseCover";
import { Button } from "@/components/ui/Button";

export default async function CourseProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const price =
    course.price_cents === 0
      ? "Grátis"
      : (course.price_cents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Página do produto</h2>
          <p className="mt-1 text-sm text-text-secondary">
            É assim que os alunos verão seu curso no catálogo.
          </p>
        </div>
        <Link href={`/courses/${course.slug}`} target="_blank">
          <Button variant="secondary" className="flex items-center gap-2">
            Ver página <ExternalLink size={14} />
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative h-48">
          <CourseCover
            title={course.title}
            size={64}
            className="absolute inset-0"
            thumbnailUrl={course.thumbnail_url}
          />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            {course.category && (
              <span className="rounded-full border border-border px-2 py-0.5">
                {course.category}
              </span>
            )}
            {course.language && (
              <span className="rounded-full border border-border px-2 py-0.5">
                {course.language}
              </span>
            )}
            {course.sales_country && (
              <span className="rounded-full border border-border px-2 py-0.5">
                {course.sales_country}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-2xl font-semibold text-text-primary">{course.title}</h3>
          <p className="mt-1 text-sm text-primary-light">
            {course.instructor_name ?? "Pitani Academy"}
          </p>
          {course.description && (
            <p className="mt-3 text-sm text-text-secondary">{course.description}</p>
          )}
          <p className="mt-4 text-lg font-semibold text-primary">{price}</p>
        </div>
      </div>
    </div>
  );
}

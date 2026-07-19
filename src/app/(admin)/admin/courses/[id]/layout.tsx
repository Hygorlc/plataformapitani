import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseTabs } from "@/components/admin/CourseTabs";
import { CourseCover } from "@/components/course/CourseCover";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function CourseManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, status, thumbnail_url")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const published = course.status === "published";

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
            <CourseCover
              title={course.title}
              size={28}
              className="absolute inset-0"
              thumbnailUrl={course.thumbnail_url}
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{course.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-text-muted">
                ID {course.id.slice(0, 8)}
              </span>
              <Badge status="draft">Produtor</Badge>
              <Badge status={published ? "completed" : "draft"}>
                {published ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PublishToggle courseId={course.id} status={course.status} />
          <Link href={`/admin/courses/${course.id}/members-area`}>
            <Button variant="secondary">Acessar a gestão do curso</Button>
          </Link>
          <Link href="/admin/courses">
            <Button variant="secondary">Trocar Produto</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <CourseTabs courseId={course.id} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface FeedRow {
  id: string;
  body: string;
  created_at: string;
  lesson_id: string;
  courses: { slug: string; title: string } | null;
  lessons: { title: string } | null;
  profiles: { full_name: string | null } | null;
}

function timeAgo(dateString: string): string {
  const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "agora";
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, lesson_id, courses(slug, title), lessons(title), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const feed = (data ?? []) as unknown as FeedRow[];

  return (
    <div className="px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-semibold text-text-primary">Comunidade</h1>
      <p className="mt-1 text-text-secondary">
        Comentários recentes dos cursos em que você está matriculado.
      </p>

      {feed.length === 0 ? (
        <p className="mt-8 text-text-secondary">
          Nenhuma discussão ainda. Comece uma conversa em uma das suas aulas.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-surface">
          {feed.map((item) => (
            <Link
              key={item.id}
              href={item.courses ? `/courses/${item.courses.slug}/${item.lesson_id}` : "#"}
              className="flex items-start gap-3 px-5 py-4 hover:bg-surface-hover"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-background">
                {(item.profiles?.full_name ?? "A").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-text-primary">
                    {item.profiles?.full_name ?? "Aluno"}
                  </span>
                  <span className="text-text-muted">{timeAgo(item.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{item.body}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {item.courses?.title} · {item.lessons?.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

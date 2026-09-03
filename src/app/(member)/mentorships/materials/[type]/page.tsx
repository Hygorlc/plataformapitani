import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { StructuredContent } from "@/components/mentorships/StructuredContent";
import { getMentorshipAccessByEmail } from "@/lib/data/mentorship";
import { createClient } from "@/lib/supabase/server";

export default async function MentorshipMaterialPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await connection();
  const { type } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const access = await getMentorshipAccessByEmail(user.email);
  if (access.state !== "connected") notFound();

  const mentorshipModule = access.modules.find(
    (item) => item.type === type && item.status === "publicado"
  );
  if (!mentorshipModule) notFound();

  return (
    <div className="px-6 py-10 lg:px-12">
      <Link
        href="/mentorships"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para mentorias
      </Link>

      <div className="mt-6 max-w-5xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          {access.productName}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <BookOpen size={28} className="mt-1 shrink-0 text-primary" />
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">
              {mentorshipModule.title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {access.company ?? access.clientName}
            </p>
          </div>
        </div>

        <article className="mt-8 rounded-xl border border-border bg-surface p-6 lg:p-8">
          <StructuredContent value={mentorshipModule.content} />
        </article>
      </div>
    </div>
  );
}

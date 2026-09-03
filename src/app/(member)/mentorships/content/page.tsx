import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { ContentCenter } from "@/components/mentorships/ContentCenter";
import { LiveMentorshipRefresh } from "@/components/mentorships/LiveMentorshipRefresh";
import { getMentorshipAccessByEmail } from "@/lib/data/mentorship";
import { createClient } from "@/lib/supabase/server";

export default async function MentorshipContentPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const access = await getMentorshipAccessByEmail(user.email);
  if (access.state !== "connected") notFound();
  const contentModule = access.modules.find((module) => module.type === "conteudos");

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold text-text-primary">Central de Conteúdo</h1>
      <p className="mt-2 text-text-secondary">
        Escolha o tema, consulte os roteiros e organize sua comunicação.
      </p>
      <div className="mt-4"><LiveMentorshipRefresh /></div>
      <div className="mt-7">
        <ContentCenter content={contentModule?.content ?? null} />
      </div>
    </div>
  );
}

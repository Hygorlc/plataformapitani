import { connection } from "next/server";
import { Download, FileText } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { LiveMentorshipRefresh } from "@/components/mentorships/LiveMentorshipRefresh";
import { getMentorshipAccessByEmail } from "@/lib/data/mentorship";
import { createClient } from "@/lib/supabase/server";

function fileUrl(path: string | null) {
  if (!path) return null;
  try {
    const url = new URL(path, "https://id-master-system.vercel.app");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatFileDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : `Adicionado em ${date.toLocaleDateString("pt-BR")}`;
}

export default async function MentorshipFilesPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");
  const access = await getMentorshipAccessByEmail(user.email);
  if (access.state !== "connected") notFound();
  const files = access.files.filter((file) => file.visibleToClient);

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold text-text-primary">Arquivos</h1>
      <p className="mt-2 text-text-secondary">Materiais disponibilizados pela equipe</p>
      <div className="mt-4"><LiveMentorshipRefresh /></div>

      {!files.length ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-10 text-center">
          <FileText size={32} className="mx-auto text-primary" />
          <p className="mt-3 font-medium text-text-primary">Nenhum arquivo disponível ainda</p>
          <p className="mt-1 text-sm text-text-secondary">A equipe enviará os arquivos conforme o avanço da mentoria.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {files.map((file) => {
            const url = fileUrl(file.path);
            return (
              <div key={file.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText size={21} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{file.name}</p>
                    <p className="mt-1 text-xs text-text-muted">{[file.type, file.size, formatFileDate(file.createdAt)].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                {url ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"><Download size={16} />Baixar</a> : <span className="text-xs text-text-muted">Arquivo indisponível</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

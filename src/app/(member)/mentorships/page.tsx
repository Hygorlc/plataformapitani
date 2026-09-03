import { connection } from "next/server";
import { redirect } from "next/navigation";
import { BookOpen, CalendarDays, CheckCircle2, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMentorshipAccessByEmail } from "@/lib/data/mentorship";
import { LiveMentorshipRefresh } from "@/components/mentorships/LiveMentorshipRefresh";

const statusLabel: Record<string, string> = {
  ativo: "Ativa",
  pausado: "Pausada",
  concluido: "Concluída",
  nao_iniciada: "Não iniciada",
  em_andamento: "Em andamento",
  rascunho: "Em preparação",
  em_revisao: "Em revisão",
  publicado: "Disponível",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR");
}

export default async function MentorshipsPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const access = await getMentorshipAccessByEmail(user.email);

  if (access.state !== "connected") {
    return (
      <div className="px-6 py-10 lg:px-12">
        <h1 className="text-2xl font-semibold text-text-primary">Mentorias</h1>
        <div className="mt-3">
          <LiveMentorshipRefresh />
        </div>
        <div className="mt-6 max-w-2xl rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text-primary">
            {access.state === "unavailable"
              ? "Mentorias temporariamente indisponíveis"
              : "Nenhuma mentoria vinculada"}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {access.state === "unavailable"
              ? "Seus cursos continuam disponíveis normalmente. Tente acessar esta área novamente em alguns instantes."
              : "Quando uma mentoria for liberada para o seu e-mail, ela aparecerá automaticamente aqui."}
          </p>
        </div>
      </div>
    );
  }

  const availableModules = access.modules.filter(
    (module) => module.status === "publicado"
  );

  return (
    <div className="px-6 py-10 lg:px-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            {access.productName}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-text-primary">
            Minha Mentoria
          </h1>
          <p className="mt-2 text-text-secondary">
            {access.company ?? access.clientName}
          </p>
          <div className="mt-4">
            <LiveMentorshipRefresh />
          </div>
        </div>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-light">
          {statusLabel[access.clientStatus ?? ""] ?? access.clientStatus}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={CalendarDays} label="Início" value={formatDate(access.startDate)} />
        <SummaryCard icon={CheckCircle2} label="Previsão de término" value={formatDate(access.endDate)} />
        <SummaryCard icon={ListChecks} label="Tarefas" value={`${access.completedTaskCount}/${access.taskCount}`} />
        <SummaryCard icon={BookOpen} label="Materiais disponíveis" value={String(availableModules.length)} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Encontros</h2>
        <div className="mt-4 grid gap-3">
          {access.encounters.length ? (
            access.encounters.map((encounter) => (
              <div
                key={`${encounter.number}-${encounter.title}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="text-sm text-text-muted">Encontro {encounter.number}</p>
                  <p className="font-medium text-text-primary">{encounter.title}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-text-secondary">
                    {statusLabel[encounter.status] ?? encounter.status}
                  </p>
                  {encounter.scheduledAt && (
                    <p className="mt-1 text-text-muted">{formatDate(encounter.scheduledAt)}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-border bg-surface p-5 text-text-secondary">
              Os encontros aparecerão aqui assim que forem agendados.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Materiais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableModules.length ? (
            availableModules.map((module) => (
              <div key={module.type} className="rounded-xl border border-border bg-surface p-5">
                <BookOpen size={20} className="text-primary" />
                <h3 className="mt-4 font-medium text-text-primary">{module.title}</h3>
                <p className="mt-1 text-sm text-status-completed">Disponível</p>
              </div>
            ))
          ) : (
            <p className="text-text-secondary">Nenhum material publicado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Icon size={20} className="text-primary" />
      <p className="mt-4 text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  );
}

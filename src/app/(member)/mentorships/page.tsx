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
            availableModules.map((module, index) => (
              <details
                key={`${module.type}-${index}`}
                className="group rounded-xl border border-border bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
                  <BookOpen size={20} className="shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-text-primary">
                      {module.title}
                    </span>
                    <span className="mt-1 block text-sm text-status-completed">
                      Disponível
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary group-open:hidden">
                    Abrir conteúdo
                  </span>
                  <span className="hidden text-sm font-medium text-primary group-open:inline">
                    Fechar
                  </span>
                </summary>
                <div className="border-t border-border px-5 py-6">
                  <StructuredContent value={module.content} />
                </div>
              </details>
            ))
          ) : (
            <p className="text-text-secondary">Nenhum material publicado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function humanizeKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function StructuredContent({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === "") {
    return <p className="text-sm text-text-muted">Conteúdo ainda não informado.</p>;
  }

  if (typeof value === "string") {
    const url = safeExternalUrl(value);
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="break-all text-sm font-medium text-primary hover:underline"
      >
        Abrir link do material
      </a>
    ) : (
      <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
        {value}
      </p>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="text-sm text-text-secondary">{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return <p className="text-sm text-text-muted">Nenhum item informado.</p>;
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className={
              typeof item === "object" && item !== null
                ? "rounded-lg border border-border bg-background/40 p-4"
                : "border-l-2 border-primary/40 pl-3"
            }
          >
            <StructuredContent value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object" && depth < 8) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) {
      return <p className="text-sm text-text-muted">Conteúdo em preparação.</p>;
    }

    return (
      <div className="space-y-5">
        {entries.map(([key, item]) => (
          <section key={key}>
            <h4 className="mb-2 text-sm font-semibold text-text-primary">
              {humanizeKey(key)}
            </h4>
            <StructuredContent value={item} depth={depth + 1} />
          </section>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-text-muted">Conteúdo indisponível.</p>;
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

import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Fingerprint,
  ListChecks,
  PenTool,
  Stethoscope,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getMentorshipAccessesByEmail,
} from "@/lib/data/mentorship";
import { LiveMentorshipRefresh } from "@/components/mentorships/LiveMentorshipRefresh";
import { CourseCover } from "@/components/course/CourseCover";
import { Badge } from "@/components/ui/Badge";

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

const modulePresentation: Record<
  string,
  { description: string; icon: typeof BookOpen }
> = {
  diagnostico: {
    description: "Análise de mercado, SWOT, persona ideal e plano de 90 dias",
    icon: Stethoscope,
  },
  identidade_fundador: {
    description: "História de origem, valores e personalidade do fundador",
    icon: UserRound,
  },
  posicionamento: {
    description: "Categoria, tese, promessa, inimigo nomeado e público ideal",
    icon: Target,
  },
  identidade_marca: {
    description: "Propósito, arquétipos, manifesto, narrativa e códigos da marca",
    icon: Fingerprint,
  },
  conteudos: {
    description: "Pilares, calendário editorial, roteiros e guia de Stories",
    icon: PenTool,
  },
  estrategias: {
    description: "Ofertas, funil de vendas, canais e metas comerciais",
    icon: TrendingUp,
  },
  estrategias_marketing_vendas: {
    description: "Ofertas, funil de vendas, canais e metas comerciais",
    icon: TrendingUp,
  },
};

function getModulePresentation(type: string) {
  return (
    modulePresentation[type] ?? {
      description: "Conteúdo estratégico desenvolvido durante a sua mentoria",
      icon: BookOpen,
    }
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR");
}

export default async function MentorshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  await connection();
  const { client: selectedClientId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const collection = await getMentorshipAccessesByEmail(user.email);
  if (
    collection.state === "connected" &&
    collection.items.length > 1 &&
    !selectedClientId
  ) {
    return (
      <div className="px-6 py-8 lg:px-12">
        <h1 className="text-2xl font-semibold text-text-primary">Minhas Mentorias</h1>
        <p className="mt-1 text-text-secondary">
          Escolha a mentoria que deseja acessar.
        </p>
        <div className="mt-6 flex flex-wrap gap-5">
          {collection.items.map((item) => (
            <Link
              key={item.clientId}
              href={`/mentorships?client=${encodeURIComponent(item.clientId!)}`}
              className="group/card relative w-72 shrink-0 sm:w-80"
            >
              <div className="relative aspect-video overflow-hidden rounded-md ring-1 ring-border transition-all duration-300 ease-out group-hover/card:z-20 group-hover/card:scale-105 group-hover/card:ring-primary/60 group-hover/card:shadow-2xl group-hover/card:shadow-black/60">
                <CourseCover
                  title={item.productName ?? "Mentoria"}
                  size={72}
                  className="absolute inset-0"
                />
                <div className="absolute left-3 top-3 z-20">
                  <Badge status="progress">
                    <span className="text-sm font-bold">Entrar</span>
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover/card:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-background">
                    <ArrowRight size={19} />
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-0.5">
                <p className="truncate text-xs text-text-muted">Mentorias</p>
                <h2 className="truncate text-base font-semibold leading-tight text-text-primary">
                  {item.productName}
                </h2>
                <p className="truncate text-xs text-text-secondary">
                  {item.company ?? item.clientName}
                </p>
                <p className="truncate text-sm font-medium text-emerald-500">
                  Acesso liberado
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const access = selectedClientId
    ? collection.items.find((item) => item.clientId === selectedClientId)
    : collection.items[0];

  if (!access) {
    return (
      <div className="px-6 py-10 lg:px-12">
        <h1 className="text-2xl font-semibold text-text-primary">Mentorias</h1>
        <div className="mt-3">
          <LiveMentorshipRefresh />
        </div>
        <div className="mt-6 max-w-2xl rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text-primary">
            {collection.state === "unavailable"
              ? "Mentorias temporariamente indisponíveis"
              : "Nenhuma mentoria vinculada"}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {collection.state === "unavailable"
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
        <div className="flex items-center gap-3">
          {collection.items.length > 1 && (
            <Link
              href="/mentorships"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:border-primary/50 hover:text-primary"
            >
              Trocar mentoria
            </Link>
          )}
          <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-light">
            {statusLabel[access.clientStatus ?? ""] ?? access.clientStatus}
          </span>
        </div>
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

      <section className="mt-12">
        <h2 className="text-3xl font-semibold text-text-primary">Meus Materiais</h2>
        <p className="mt-2 text-text-secondary">
          Todos os módulos construídos durante a mentoria
        </p>
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {access.modules.length ? (
            access.modules.map((module) => (
              <MentorshipModuleCard
                key={module.type}
                module={module}
                clientId={access.clientId}
              />
            ))
          ) : (
            <p className="text-text-secondary">Nenhum material cadastrado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function MentorshipModuleCard({
  module,
  clientId,
}: {
  module: { type: string; title: string; status: string };
  clientId: string | null;
}) {
  const available = module.status === "publicado";
  const presentation = getModulePresentation(module.type);
  const Icon = presentation.icon;
  const cardClassName =
    "group flex min-h-64 flex-col rounded-2xl border border-border bg-surface p-6 transition-all lg:p-7";
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Icon size={24} />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            available
              ? "bg-status-completed/15 text-status-completed"
              : "bg-primary/10 text-primary-light"
          }`}
        >
          {statusLabel[module.status] ?? module.status}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-semibold text-text-primary">
        {module.title}
      </h3>
      <p className="mt-3 leading-6 text-text-secondary">
        {presentation.description}
      </p>

      <span
        className={`mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold ${
          available ? "text-primary" : "text-text-muted"
        }`}
      >
        {available ? "Ver módulo" : "Aguardando liberação"}
        {available && (
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        )}
      </span>
    </>
  );

  if (!available) {
    return <div className={`${cardClassName} opacity-75`}>{content}</div>;
  }

  return (
    <Link
      href={`/mentorships/materials/${encodeURIComponent(module.type)}?client=${encodeURIComponent(clientId ?? "")}`}
      className={`${cardClassName} hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-hover hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]`}
    >
      {content}
    </Link>
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

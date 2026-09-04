import { connection } from "next/server";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { LiveMentorshipRefresh } from "@/components/mentorships/LiveMentorshipRefresh";
import { getMentorshipAccessByEmail, type MentorshipTaskSummary } from "@/lib/data/mentorship";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  fazendo: "Em andamento",
  concluida: "Concluída",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

function formatDate(value: string | null) {
  if (!value) return "Sem prazo";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function TaskCard({ task, completed = false }: { task: MentorshipTaskSummary; completed?: boolean }) {
  const Icon = completed ? CheckCircle2 : task.status === "fazendo" ? Clock : Circle;
  return (
    <div className={`flex items-start gap-4 rounded-xl border border-border bg-surface p-5 ${completed ? "opacity-65" : ""}`}>
      <Icon size={20} className={`mt-0.5 shrink-0 ${completed ? "text-status-completed" : "text-primary"}`} />
      <div className="min-w-0 flex-1">
        <p className={`font-medium text-text-primary ${completed ? "line-through" : ""}`}>{task.title}</p>
        {task.description && <p className="mt-1 text-sm leading-6 text-text-secondary">{task.description}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary-light">
            Prioridade {priorityLabels[task.priority] ?? task.priority}
          </span>
          <span className="rounded-full bg-background px-2.5 py-1 text-text-muted">
            Prazo: {formatDate(task.deadline)}
          </span>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-background px-3 py-1 text-xs text-text-secondary">
        {statusLabels[task.status] ?? task.status}
      </span>
    </div>
  );
}

export default async function MentorshipTasksPage({ searchParams }: { searchParams: Promise<{ client?: string; product?: string }> }) {
  await connection();
  const { client: selectedClientId, product: selectedProductId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");
  const access = await getMentorshipAccessByEmail(user.email, selectedClientId, selectedProductId);
  if (access.state !== "connected") notFound();

  const clientTasks = access.tasks.filter((task) => task.owner === "cliente");
  const pending = clientTasks.filter((task) => task.status !== "concluida");
  const completed = clientTasks.filter((task) => task.status === "concluida");

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="text-3xl font-semibold text-text-primary">Minhas Pendências</h1>
      <p className="mt-2 text-text-secondary">
        {pending.length} {pending.length === 1 ? "tarefa aguarda" : "tarefas aguardam"} sua ação
      </p>
      <div className="mt-4"><LiveMentorshipRefresh /></div>

      {!clientTasks.length ? (
        <div className="mt-8 rounded-xl border border-border bg-surface p-10 text-center">
          <CheckCircle2 size={32} className="mx-auto text-status-completed" />
          <p className="mt-3 font-medium text-text-primary">Nenhuma tarefa pendente</p>
          <p className="mt-1 text-sm text-text-secondary">Tudo em dia por aqui.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {pending.length > 0 && <section><h2 className="mb-4 text-lg font-semibold text-text-primary">Para fazer</h2><div className="space-y-3">{pending.map((task) => <TaskCard key={task.id} task={task} />)}</div></section>}
          {completed.length > 0 && <section><h2 className="mb-4 text-lg font-semibold text-text-primary">Concluídas</h2><div className="space-y-3">{completed.map((task) => <TaskCard key={task.id} task={task} completed />)}</div></section>}
        </div>
      )}
    </div>
  );
}

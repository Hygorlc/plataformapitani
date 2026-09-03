import "server-only";

import { createMentorshipAdminClient } from "@/lib/supabase/mentorship-admin";
import { normalizeAssignmentEmail } from "@/lib/course-assignments";

type ExternalRecord = Record<string, unknown>;

export interface MentorshipModuleSummary {
  type: string;
  title: string;
  status: string;
  content: unknown;
}

export interface MentorshipEncounterSummary {
  number: number;
  title: string;
  status: string;
  scheduledAt: string | null;
}

export interface MentorshipTaskSummary {
  id: string;
  title: string;
  description: string | null;
  owner: string;
  deadline: string | null;
  priority: string;
  status: string;
}

export interface MentorshipFileSummary {
  id: string;
  name: string;
  path: string | null;
  type: string;
  size: string | null;
  visibleToClient: boolean;
  createdAt: string | null;
}

export interface MentorshipAccess {
  state: "connected" | "not_found" | "unavailable";
  clientName: string | null;
  company: string | null;
  productName: string | null;
  clientStatus: string | null;
  startDate: string | null;
  endDate: string | null;
  taskCount: number;
  completedTaskCount: number;
  modules: MentorshipModuleSummary[];
  encounters: MentorshipEncounterSummary[];
  tasks: MentorshipTaskSummary[];
  files: MentorshipFileSummary[];
}

const emptyAccess = (state: MentorshipAccess["state"]): MentorshipAccess => ({
  state,
  clientName: null,
  company: null,
  productName: null,
  clientStatus: null,
  startDate: null,
  endDate: null,
  taskCount: 0,
  completedTaskCount: 0,
  modules: [],
  encounters: [],
  tasks: [],
  files: [],
});

function parseStoredArray(value: unknown): ExternalRecord[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is ExternalRecord =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        )
      : [];
  } catch {
    return [];
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asRecordArray(value: unknown): ExternalRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is ExternalRecord =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    : [];
}

export async function getMentorshipAccessByEmail(
  rawEmail: string
): Promise<MentorshipAccess> {
  const email = normalizeAssignmentEmail(rawEmail);
  const mentorship = createMentorshipAdminClient();
  if (!email || !mentorship) return emptyAccess("unavailable");

  try {
    const { data: usersData, error: usersError } =
      await mentorship.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return emptyAccess("unavailable");

    const externalUser = usersData.users.find(
      (user) => normalizeAssignmentEmail(user.email ?? "") === email
    );
    if (!externalUser) return emptyAccess("not_found");

    const { data: profile, error: profileError } = await mentorship
      .from("profiles")
      .select("role, client_id")
      .eq("id", externalUser.id)
      .maybeSingle();
    if (profileError) return emptyAccess("unavailable");
    if (!profile?.client_id || profile.role !== "client") {
      return emptyAccess("not_found");
    }

    const [{ data: settings, error: settingsError }, { data: productSetting }] =
      await Promise.all([
        mentorship
          .from("app_settings")
          .select("key, value")
          .in("key", ["clients", "produtos"]),
        mentorship
          .from("client_settings")
          .select("produto")
          .eq("client_id", profile.client_id)
          .maybeSingle(),
      ]);
    if (settingsError) return emptyAccess("unavailable");

    const clients = parseStoredArray(
      settings?.find((item) => item.key === "clients")?.value
    );
    const products = parseStoredArray(
      settings?.find((item) => item.key === "produtos")?.value
    );
    const client = clients.find((item) => item.id === profile.client_id);
    if (!client) return emptyAccess("not_found");

    const productId =
      asString(productSetting?.produto) ?? asString(client.produto) ?? "id_master";
    const product = products.find((item) => item.id === productId);
    const tasks = asRecordArray(client.tasks);
    const modules = asRecordArray(client.modules);
    const encounters = asRecordArray(client.encounters);
    const files = asRecordArray(client.files);

    return {
      state: "connected",
      clientName: asString(client.nome),
      company: asString(client.empresa),
      productName: asString(product?.nome) ?? productId,
      clientStatus: asString(client.status_geral),
      startDate: asString(client.data_inicio),
      endDate: asString(client.data_fim),
      taskCount: tasks.length,
      completedTaskCount: tasks.filter((task) => task.status === "concluida").length,
      modules: modules.map((module) => ({
        type: asString(module.tipo) ?? "modulo",
        title: asString(module.titulo) ?? "Módulo",
        status: asString(module.status) ?? "rascunho",
        content: module.conteudo ?? null,
      })),
      encounters: encounters
        .map((encounter) => ({
          number:
            typeof encounter.encounter_numero === "number"
              ? encounter.encounter_numero
              : 0,
          title:
            asString(encounter.titulo) ??
            `Encontro ${String(encounter.encounter_numero ?? "")}`,
          status: asString(encounter.status) ?? "nao_iniciada",
          scheduledAt: asString(encounter.data_agendada),
        }))
        .sort((a, b) => a.number - b.number),
      tasks: tasks.map((task, index) => ({
        id: asString(task.id) ?? `task-${index}`,
        title: asString(task.titulo) ?? "Tarefa",
        description: asString(task.descricao),
        owner: asString(task.responsavel) ?? "equipe",
        deadline: asString(task.prazo),
        priority: asString(task.prioridade) ?? "media",
        status: asString(task.status) ?? "pendente",
      })),
      files: files.map((file, index) => ({
        id: asString(file.id) ?? `file-${index}`,
        name: asString(file.nome) ?? "Arquivo",
        path: asString(file.path),
        type: asString(file.tipo) ?? "Arquivo",
        size: asString(file.tamanho),
        visibleToClient: file.visivel_cliente === true,
        createdAt: asString(file.criado_em),
      })),
    };
  } catch {
    return emptyAccess("unavailable");
  }
}

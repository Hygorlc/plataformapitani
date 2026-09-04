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
  clientId: string | null;
  productId: string | null;
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
  clientId: null,
  productId: null,
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

function parseStoredStringArrayMap(value: unknown): Record<string, string[]> {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed).map(([key, items]) => [
        key,
        Array.isArray(items)
          ? items.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
          : [],
      ])
    );
  } catch {
    return {};
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
  rawEmail: string,
  selectedClientId?: string | null,
  selectedProductId?: string | null
): Promise<MentorshipAccess> {
  const collection = await getMentorshipAccessesByEmail(rawEmail);
  if (collection.state !== "connected") return emptyAccess(collection.state);
  if (!selectedClientId) return collection.items[0] ?? emptyAccess("not_found");
  return (
    collection.items.find(
      (access) =>
        access.clientId === selectedClientId &&
        (!selectedProductId || access.productId === selectedProductId)
    ) ??
    emptyAccess("not_found")
  );
}

export async function getMentorshipAccessesByEmail(
  rawEmail: string
): Promise<{
  state: MentorshipAccess["state"];
  items: MentorshipAccess[];
}> {
  const email = normalizeAssignmentEmail(rawEmail);
  const mentorship = createMentorshipAdminClient();
  if (!email || !mentorship) return { state: "unavailable", items: [] };

  try {
    const { data: usersData, error: usersError } =
      await mentorship.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) return { state: "unavailable", items: [] };

    const externalUser = usersData.users.find(
      (user) => normalizeAssignmentEmail(user.email ?? "") === email
    );
    if (!externalUser) return { state: "not_found", items: [] };

    const { data: profile, error: profileError } = await mentorship
      .from("profiles")
      .select("role, client_id")
      .eq("id", externalUser.id)
      .maybeSingle();
    if (profileError) return { state: "unavailable", items: [] };
    if (!profile || profile.role !== "client") {
      return { state: "not_found", items: [] };
    }

    const { data: settings, error: settingsError } = await mentorship
      .from("app_settings")
      .select("key, value")
      .in("key", ["clients", "produtos", "user_client_ids", "client_products"]);
    if (settingsError) return { state: "unavailable", items: [] };

    const clients = parseStoredArray(
      settings?.find((item) => item.key === "clients")?.value
    );
    const products = parseStoredArray(
      settings?.find((item) => item.key === "produtos")?.value
    );
    const userClientIds = parseStoredStringArrayMap(
      settings?.find((item) => item.key === "user_client_ids")?.value
    );
    const clientProducts = parseStoredStringArrayMap(
      settings?.find((item) => item.key === "client_products")?.value
    );
    const assignedClientIds = new Set(userClientIds[externalUser.id] ?? []);
    const eligibleClients = clients.filter((client) => {
      const clientId = asString(client.id);
      if (!clientId) return false;
      if (clientId === profile.client_id) return true;
      if (assignedClientIds.has(clientId)) return true;
      const registeredEmails = [client.email, client.contato_email, client.contato]
        .map((value) => normalizeAssignmentEmail(asString(value) ?? ""))
        .filter(Boolean);
      return registeredEmails.includes(email);
    });
    if (!eligibleClients.length) return { state: "not_found", items: [] };

    const clientIds = eligibleClients
      .map((client) => asString(client.id))
      .filter((value): value is string => Boolean(value));
    const { data: productSettings, error: productSettingsError } = await mentorship
      .from("client_settings")
      .select("client_id, produto")
      .in("client_id", clientIds);
    if (productSettingsError) return { state: "unavailable", items: [] };

    const items = eligibleClients.flatMap((client): MentorshipAccess[] => {
      const clientId = asString(client.id)!;
      const productSetting = productSettings?.find(
        (setting) => setting.client_id === clientId
      );
      const fallbackProductId =
        asString(productSetting?.produto) ?? asString(client.produto) ?? "id_master";
      const productIds = Array.from(
        new Set(
          clientProducts[clientId]?.length
            ? clientProducts[clientId]
            : [fallbackProductId]
        )
      );
      const tasks = asRecordArray(client.tasks);
      const modules = asRecordArray(client.modules);
      const encounters = asRecordArray(client.encounters);
      const files = asRecordArray(client.files);

      return productIds.map((productId): MentorshipAccess => {
        const product = products.find((item) => item.id === productId);
        return {
      state: "connected",
      clientId,
      productId,
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
      });
    });

    return { state: "connected", items };
  } catch {
    return { state: "unavailable", items: [] };
  }
}

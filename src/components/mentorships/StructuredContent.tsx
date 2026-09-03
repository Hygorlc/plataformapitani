import { ChevronDown } from "lucide-react";

const sectionTitles: Record<string, string> = {
  swot: "Análise SWOT",
  mercado: "Análise de Mercado",
  potencial: "Potencial de Mercado",
  nicho: "Definição do Nicho",
  metodologia: "Metodologia",
  historia_vida: "História de Vida",
  valores_crencas: "Valores e Crenças",
  proposito: "Propósito, Sentido e Legado",
  forcas_pontos_cegos: "Forças Naturais e Pontos Cegos",
  comunicacao: "Estilo de Comunicação",
  singularidade: "Singularidade",
  inimigo_pessoal: "Inimigo Pessoal",
  essencia: "Essência da Marca",
  personalidade: "Personalidade",
  simbolo_narrativa: "Símbolo e Narrativa",
  codigos_verbais: "Códigos Verbais",
  sintese: "Síntese",
  fragilidades: "Fragilidades",
  personas: "Personas",
  concorrentes: "Concorrentes",
  diferencial: "Diferencial",
  promessa: "Promessa",
  quadro_resumo: "Quadro-resumo",
  estrategias: "Estratégias e Pilares",
  temas: "Temas",
  roteiros: "Roteiros",
  stories: "Stories",
  prompts: "Prompts",
  ofertas: "Ofertas",
  funil_vendas: "Funil de Vendas",
  canais_captacao: "Canais de Captação",
  meta_trimestral: "Meta Trimestral",
  growth_90_dias: "Plano de Crescimento — 90 dias",
};

function humanizeKey(value: string) {
  return (
    sectionTitles[value] ??
    value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
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

export function StructuredContent({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
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
            <h2 className="mb-2 text-base font-semibold text-text-primary">
              {humanizeKey(key)}
            </h2>
            <StructuredContent value={item} depth={depth + 1} />
          </section>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-text-muted">Conteúdo indisponível.</p>;
}

export function MentorshipContentAccordion({ value }: { value: unknown }) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return <StructuredContent value={value} />;
  }

  const sections = Object.entries(value as Record<string, unknown>);
  if (!sections.length) {
    return <StructuredContent value={value} />;
  }

  return (
    <div className="space-y-3">
      {sections.map(([key, section], index) => (
        <details
          key={key}
          className="group overflow-hidden rounded-xl border border-border bg-surface"
        >
          <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-hover">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-base font-semibold text-text-primary">
              {humanizeKey(key)}
            </span>
            <ChevronDown
              size={18}
              className="shrink-0 text-text-secondary transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-border bg-background/20 p-5 lg:p-6">
            <StructuredContent value={section} depth={1} />
          </div>
        </details>
      ))}
    </div>
  );
}

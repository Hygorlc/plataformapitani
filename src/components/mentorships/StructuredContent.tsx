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

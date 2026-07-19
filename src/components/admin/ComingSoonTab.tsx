import { Construction } from "lucide-react";

export function ComingSoonTab({
  title,
  description,
  planned,
}: {
  title: string;
  description: string;
  planned: string[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-progress/15 text-status-progress">
            <Construction size={20} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Ainda não disponível</p>
            <p className="text-sm text-text-secondary">
              Esta área ainda não foi implementada na plataforma.
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-text-primary">O que está previsto:</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {planned.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

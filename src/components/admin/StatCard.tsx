import type { ComponentType } from "react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon size={18} />
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold text-text-primary">{value}</div>
      {delta && <div className="mt-1 text-sm text-status-completed">{delta}</div>}
    </div>
  );
}

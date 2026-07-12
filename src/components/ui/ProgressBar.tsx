export function ProgressBar({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-primary"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label && (
        <span className="shrink-0 text-xs text-text-secondary">{label}</span>
      )}
    </div>
  );
}

type Status = "new" | "progress" | "completed" | "draft" | "danger";

const statusClasses: Record<Status, string> = {
  new: "bg-status-new/15 text-status-new",
  progress: "bg-status-progress/15 text-status-progress",
  completed: "bg-status-completed/15 text-status-completed",
  draft: "bg-status-draft/15 text-status-draft",
  danger: "bg-status-danger/15 text-status-danger",
};

export function Badge({
  status,
  children,
}: {
  status: Status;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {children}
    </span>
  );
}

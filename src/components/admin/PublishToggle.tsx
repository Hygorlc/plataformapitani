import { togglePublish } from "@/lib/actions/admin/courses";

export function PublishToggle({
  courseId,
  status,
}: {
  courseId: string;
  status: string;
}) {
  const published = status === "published";
  const action = togglePublish.bind(null, courseId, published ? "draft" : "published");

  return (
    <form action={action}>
      <button
        type="submit"
        aria-pressed={published}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          published ? "bg-status-completed" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            published ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </form>
  );
}

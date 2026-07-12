import { postComment } from "@/lib/actions/comments";
import { Button } from "@/components/ui/Button";

export function AddCommentBox({
  lessonId,
  courseId,
  courseSlug,
  lessonPath,
  parentId,
  placeholder = "Adicione um comentário...",
}: {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  lessonPath: string;
  parentId?: string;
  placeholder?: string;
}) {
  const action = postComment.bind(
    null,
    lessonId,
    courseId,
    courseSlug,
    lessonPath,
    parentId ?? null
  );

  return (
    <form action={action} className="flex items-start gap-2">
      <textarea
        name="body"
        required
        rows={2}
        placeholder={placeholder}
        className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
      />
      <Button type="submit" size="sm">
        Enviar
      </Button>
    </form>
  );
}

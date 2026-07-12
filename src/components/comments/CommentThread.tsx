import { AddCommentBox } from "@/components/comments/AddCommentBox";
import { CommentItem } from "@/components/comments/CommentItem";
import type { CommentNode } from "@/lib/data/comments";

export function CommentThread({
  comments,
  lessonId,
  courseId,
  courseSlug,
  lessonPath,
}: {
  comments: CommentNode[];
  lessonId: string;
  courseId: string;
  courseSlug: string;
  lessonPath: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">Discussão da Comunidade</h2>

      <div className="mt-4">
        <AddCommentBox
          lessonId={lessonId}
          courseId={courseId}
          courseSlug={courseSlug}
          lessonPath={lessonPath}
        />
      </div>

      <div className="mt-4 divide-y divide-border">
        {comments.length === 0 ? (
          <p className="py-6 text-sm text-text-secondary">
            Seja o primeiro a comentar nesta aula.
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              lessonId={lessonId}
              courseId={courseId}
              courseSlug={courseSlug}
              lessonPath={lessonPath}
            />
          ))
        )}
      </div>
    </div>
  );
}

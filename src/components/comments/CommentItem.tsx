"use client";

import { useState } from "react";
import { ReactionBar } from "@/components/comments/ReactionBar";
import { AddCommentBox } from "@/components/comments/AddCommentBox";
import type { CommentNode } from "@/lib/data/comments";

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "agora";
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function CommentItem({
  comment,
  lessonId,
  courseId,
  courseSlug,
  lessonPath,
  depth = 0,
}: {
  comment: CommentNode;
  lessonId: string;
  courseId: string;
  courseSlug: string;
  lessonPath: string;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={depth > 0 ? "ml-8 border-l border-border pl-4" : ""}>
      <div className="flex items-start gap-3 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-background">
          {comment.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-text-primary">{comment.authorName}</span>
            <span className="text-text-muted">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{comment.body}</p>

          <div className="mt-2 flex items-center gap-3">
            <ReactionBar
              commentId={comment.id}
              reactions={comment.reactions}
              lessonPath={lessonPath}
            />
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="text-xs text-text-secondary hover:text-primary"
            >
              Responder
            </button>
          </div>

          {replying && (
            <div className="mt-3">
              <AddCommentBox
                lessonId={lessonId}
                courseId={courseId}
                courseSlug={courseSlug}
                lessonPath={lessonPath}
                parentId={comment.id}
                placeholder={`Responder a ${comment.authorName}...`}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          lessonId={lessonId}
          courseId={courseId}
          courseSlug={courseSlug}
          lessonPath={lessonPath}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

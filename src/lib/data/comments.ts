import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type TypedClient = SupabaseClient<Database>;

export interface ReactionSummary {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface CommentNode {
  id: string;
  body: string;
  created_at: string;
  authorId: string;
  authorName: string;
  reactions: ReactionSummary[];
  replies: CommentNode[];
}

export async function getLessonComments(
  supabase: TypedClient,
  lessonId: string,
  currentUserId: string
): Promise<CommentNode[]> {
  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, parent_id")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  if (!comments || comments.length === 0) return [];

  const commentIds = comments.map((c) => c.id);
  const userIds = [...new Set(comments.map((c) => c.user_id))];

  const [{ data: profiles }, { data: reactions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase
      .from("comment_reactions")
      .select("comment_id, emoji, user_id")
      .in("comment_id", commentIds),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Aluno"]));

  const reactionsByComment = new Map<string, ReactionSummary[]>();
  (reactions ?? []).forEach((r) => {
    const list = reactionsByComment.get(r.comment_id) ?? [];
    const existing = list.find((x) => x.emoji === r.emoji);
    if (existing) {
      existing.count += 1;
      if (r.user_id === currentUserId) existing.reactedByMe = true;
    } else {
      list.push({ emoji: r.emoji, count: 1, reactedByMe: r.user_id === currentUserId });
    }
    reactionsByComment.set(r.comment_id, list);
  });

  const nodeById = new Map<string, CommentNode>();
  comments.forEach((c) => {
    nodeById.set(c.id, {
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      authorId: c.user_id,
      authorName: nameById.get(c.user_id) ?? "Aluno",
      reactions: reactionsByComment.get(c.id) ?? [],
      replies: [],
    });
  });

  const roots: CommentNode[] = [];
  comments.forEach((c) => {
    const node = nodeById.get(c.id)!;
    if (c.parent_id && nodeById.has(c.parent_id)) {
      nodeById.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

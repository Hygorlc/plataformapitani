import { toggleReaction } from "@/lib/actions/comments";
import type { ReactionSummary } from "@/lib/data/comments";

const PRESET_EMOJIS = ["👍", "❤️", "🤔"];

export function ReactionBar({
  commentId,
  reactions,
  lessonPath,
}: {
  commentId: string;
  reactions: ReactionSummary[];
  lessonPath: string;
}) {
  const byEmoji = new Map(reactions.map((r) => [r.emoji, r]));

  return (
    <div className="flex items-center gap-1">
      {PRESET_EMOJIS.map((emoji) => {
        const summary = byEmoji.get(emoji);
        const action = toggleReaction.bind(null, commentId, emoji, lessonPath);

        return (
          <form action={action} key={emoji}>
            <button
              type="submit"
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                summary?.reactedByMe
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-text-secondary hover:bg-surface-hover"
              }`}
            >
              <span>{emoji}</span>
              {summary && summary.count > 0 && <span>{summary.count}</span>}
            </button>
          </form>
        );
      })}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleReaction } from "@/app/actions";
import { REACTION_SET, type ReactionRow, summarizeReactions } from "@/lib/reactions";

// The full, tappable reaction bar. Lives inside an open book: real buttons,
// counts, and a highlight on whichever emoji you personally left.
export function BookReactions({
  bookId,
  reactions,
  viewerId,
}: {
  bookId: string;
  reactions: ReactionRow[];
  viewerId: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { counts, mine } = summarizeReactions(reactions, viewerId);

  function react(emoji: string) {
    // toggleReaction revalidates its own paths server-side; router.refresh()
    // is what makes THIS already-mounted component pick the new data up
    // without losing local state like which book is open.
    startTransition(async () => {
      await toggleReaction(bookId, emoji);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {REACTION_SET.map((emoji) => {
        const n = counts.get(emoji) ?? 0;
        const isMine = mine.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            disabled={pending}
            onClick={() => react(emoji)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-colors disabled:opacity-50 ${
              isMine
                ? "border-black/60 bg-black/10"
                : "border-black/20 hover:border-black/40"
            }`}
          >
            <span>{emoji}</span>
            {n > 0 && <span className="text-xs text-black/50">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

// The quiet peek shown on a spine: whichever emoji got the most taps, sat
// in the corner, not interactive. Open the book to actually react.
export function ReactionBadge({ reactions }: { reactions: ReactionRow[] }) {
  if (reactions.length === 0) return null;

  const { counts } = summarizeReactions(reactions, null);
  const [topEmoji, topCount] =
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (!topEmoji) return null;

  return (
    <span
      className="pointer-events-none absolute -top-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-board px-1.5 py-0.5 text-[11px] leading-none shadow-md"
      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
    >
      {topEmoji}
      {topCount > 1 && <span className="text-chalk-dim">{topCount}</span>}
    </span>
  );
}

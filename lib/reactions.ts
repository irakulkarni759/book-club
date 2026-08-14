// The only emojis anyone can react with. A fixed, small set instead of a
// full picker: four buttons fit on a book spine, and a shelf full of random
// emoji would stop reading as a signal.
export const REACTION_SET = ["🔥", "😭", "😂", "🤔"] as const;
export type Reaction = (typeof REACTION_SET)[number];

export type ReactionRow = { emoji: string; member_id: string };
export type StoredReaction = ReactionRow & { book_id: string };

/** Buckets a flat list of reaction rows by which book they belong to. */
export function groupReactions(rows: StoredReaction[]): Map<string, ReactionRow[]> {
  const map = new Map<string, ReactionRow[]>();
  for (const r of rows) {
    const list = map.get(r.book_id) ?? [];
    list.push({ emoji: r.emoji, member_id: r.member_id });
    map.set(r.book_id, list);
  }
  return map;
}

/** Counts per emoji, and which ones the current viewer has used. */
export function summarizeReactions(rows: ReactionRow[], viewerId: string | null) {
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const r of rows) {
    counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
    if (viewerId && r.member_id === viewerId) mine.add(r.emoji);
  }
  return { counts, mine };
}

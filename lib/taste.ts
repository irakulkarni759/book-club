// Turning tags into a taste map.
//
// Each member's taste is the set of tags across all their books. To ask
// "how alike are two people" we use the Jaccard index: the number of tags
// they share divided by the number of distinct tags between them.
//
//   Ira:   {literary-fiction, bleak, class, power}
//   Samaa: {literary-fiction, funny, class}
//   shared = 2 (literary-fiction, class)
//   total  = 5 distinct tags
//   score  = 2/5 = 0.4
//
// Dividing by the union matters. Counting raw overlaps would rank whoever
// reads the most books as similar to everyone.

export type MemberTaste = {
  id: string;
  name: string;
  tags: Set<string>;
  bookCount: number;
};

export type Pair = {
  a: MemberTaste;
  b: MemberTaste;
  score: number;
  shared: string[];
};

export function tasteOf(member: {
  id: string;
  name: string;
  books: { tags: string[] | null }[];
}): MemberTaste {
  const tags = new Set<string>();
  for (const book of member.books) {
    for (const tag of book.tags ?? []) tags.add(tag);
  }
  return { id: member.id, name: member.name, tags, bookCount: member.books.length };
}

export function similarity(a: MemberTaste, b: MemberTaste): Pair {
  const shared = [...a.tags].filter((t) => b.tags.has(t));
  const union = new Set([...a.tags, ...b.tags]);
  return {
    a,
    b,
    shared,
    score: union.size === 0 ? 0 : shared.length / union.size,
  };
}

/** Every pair, most alike first. */
export function allPairs(members: MemberTaste[]): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairs.push(similarity(members[i], members[j]));
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

/** Tags shared by at least `min` members: what the group has in common. */
export function commonGround(
  members: MemberTaste[],
  min = 3
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const m of members) {
    for (const tag of m.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= min)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** A tag only one member has: what makes them the odd one out. */
export function signatures(
  members: MemberTaste[]
): Map<string, string[]> {
  const counts = new Map<string, number>();
  for (const m of members) {
    for (const tag of m.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const out = new Map<string, string[]>();
  for (const m of members) {
    out.set(
      m.id,
      [...m.tags].filter((t) => counts.get(t) === 1).sort()
    );
  }
  return out;
}

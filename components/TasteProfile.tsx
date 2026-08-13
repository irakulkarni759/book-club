import { VOCABULARY, type Dimension } from "@/lib/vocabulary";
import type { Book } from "./ShelfRoom";

// Which dimension a tag belongs to, built once from the vocabulary.
const DIMENSION_OF = new Map<string, Dimension>(
  (Object.keys(VOCABULARY) as Dimension[]).flatMap((d) =>
    VOCABULARY[d].map((t) => [t as string, d] as const)
  )
);

const ORDER: Dimension[] = ["genre", "mood", "themes", "form", "pacing", "voice", "era"];

// A member's taste, in one glance: every tag their books earned, sized by
// how often it came up. A word that shows up on four of five books is what
// they actually read for.
export function TasteProfile({ books }: { books: Book[] }) {
  const counts = new Map<string, number>();
  for (const book of books) {
    for (const tag of book.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  if (counts.size === 0) return null;

  const max = Math.max(...counts.values());

  return (
    <section className="mt-14 border-t border-edge pt-8">
      <h2 className="chalk font-display text-2xl">the shape of your taste</h2>

      <div className="mt-6 space-y-4">
        {ORDER.map((dimension) => {
          const tags = [...counts.entries()]
            .filter(([tag]) => DIMENSION_OF.get(tag) === dimension)
            .sort((a, b) => b[1] - a[1]);

          if (tags.length === 0) return null;

          return (
            <div key={dimension} className="flex gap-4">
              <span className="w-20 shrink-0 pt-1 font-display text-sm text-chalk-dim">
                {dimension}
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {tags.map(([tag, n]) => (
                  <span
                    key={tag}
                    title={`on ${n} of ${books.length} books`}
                    className="chalk font-display leading-none"
                    style={{
                      // Repeated tags are written larger and brighter, the
                      // way you would press harder on the chalk.
                      fontSize: `${0.95 + (n / max) * 0.85}rem`,
                      opacity: 0.5 + (n / max) * 0.5,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

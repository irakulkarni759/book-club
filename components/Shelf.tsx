import Link from "next/link";

type Book = { id: string; title: string };

// One member's shelf. Shelves alternate sides down the wall, so the eye
// zigzags instead of scanning a single column.
export function Shelf({
  name,
  books,
  align,
  slots = 5,
}: {
  name: string;
  books: Book[];
  align: "left" | "right";
  slots?: number;
}) {
  const blanks = Math.max(0, slots - books.length);
  const right = align === "right";

  return (
    <Link
      href={`/shelf/${name.toLowerCase()}`}
      className={`group block w-[82%] rounded-lg px-4 pt-6 transition-colors hover:bg-ink-raised ${
        right ? "ml-auto" : "mr-auto"
      }`}
    >
      <div
        className={`flex items-baseline gap-3 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        <h2 className="font-display text-2xl uppercase tracking-wide text-paper">
          {name}
        </h2>
        <span className="font-mono text-xs text-paper-dim">
          {books.length}/{slots}
        </span>
      </div>

      {/* Books stand on the plank, so the row aligns to the bottom. */}
      <div
        className={`mt-4 flex h-32 items-end gap-1.5 ${
          right ? "justify-end" : "justify-start"
        }`}
      >
        {books.map((book) => (
          <div
            key={book.id}
            title={book.title}
            className="spine h-28 w-7 rounded-[2px] transition-transform group-hover:-translate-y-1"
          />
        ))}

        {Array.from({ length: blanks }).map((_, i) => (
          <div
            key={`blank-${i}`}
            className="spine-blank h-24 w-7 rounded-[2px] opacity-70"
          />
        ))}
      </div>

      <div className="shelf-plank h-[3px] w-full rounded-full" />
    </Link>
  );
}

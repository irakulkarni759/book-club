import Link from "next/link";

type Book = { id: string; title: string };

// One member's shelf. Shelves alternate sides down the wall, and each one
// is a flex row that shares the leftover screen height equally, so four
// shelves always fit whatever screen they land on.
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
      className={`group flex min-h-0 w-[82%] flex-1 flex-col justify-end rounded-lg px-3 transition-colors hover:bg-ink-raised ${
        right ? "ml-auto" : "mr-auto"
      }`}
    >
      <div
        className={`flex shrink-0 items-baseline gap-2.5 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        <h2 className="font-display text-xl leading-none text-paper">{name}</h2>
        <span className="font-mono text-[10px] text-paper-dim">
          {books.length}/{slots}
        </span>
      </div>

      {/* Books stand on the plank, so the row aligns to the bottom. */}
      <div
        className={`mt-2 flex min-h-0 flex-1 items-end gap-1.5 ${
          right ? "justify-end" : "justify-start"
        }`}
      >
        {books.map((book) => (
          <div
            key={book.id}
            title={book.title}
            className="spine h-[88%] w-6 rounded-[2px] transition-transform group-hover:-translate-y-1"
          />
        ))}

        {Array.from({ length: blanks }).map((_, i) => (
          <div
            key={`blank-${i}`}
            className="spine-blank h-[76%] w-6 rounded-[2px] opacity-70"
          />
        ))}
      </div>

      <div className="shelf-plank mt-1 h-[3px] w-full shrink-0 rounded-full" />
    </Link>
  );
}

import Link from "next/link";

type Book = { id: string; title: string };

// One member's shelf: their books as spines, plus empty slots up to five.
export function Shelf({
  name,
  books,
  slots = 5,
}: {
  name: string;
  books: Book[];
  slots?: number;
}) {
  const blanks = Math.max(0, slots - books.length);
  const done = books.length >= slots;

  return (
    <Link
      href={`/shelf/${name.toLowerCase()}`}
      className="group block rounded-lg px-4 pt-6 transition-colors hover:bg-ink-raised"
    >
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-2xl text-paper">{name}</h2>
        <span className="font-mono text-xs text-paper-dim">
          {books.length}/{slots}
          {done ? " shelved" : " to shelve"}
        </span>
      </div>

      {/* The books stand on the plank, so they align to the bottom. */}
      <div className="mt-4 flex h-32 items-end gap-1.5">
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

      <div className="shelf-plank mt-0 h-[3px] w-full rounded-full" />
    </Link>
  );
}

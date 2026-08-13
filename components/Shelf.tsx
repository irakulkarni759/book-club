import Link from "next/link";

type Book = { id: string; title: string };

// Deterministic variation so a shelf looks like real books rather than a
// bar chart. Same book always gets the same size.
const WIDTHS = [58, 74, 50, 66, 54, 80, 62];
const HEIGHTS = [94, 82, 100, 88, 78, 96, 86];
const TONES = ["spine", "spine-b", "spine-c"];

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
      className="group flex min-h-0 w-full flex-1 flex-col justify-end rounded-lg px-2 transition-colors hover:bg-ink-raised"
    >
      {/* Books at one end, the name standing at the other, both on the
          shelf line. This is what fills the width. */}
      <div
        className={`flex min-h-0 flex-1 items-end gap-1.5 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        {books.map((book, i) => (
          <div
            key={book.id}
            title={book.title}
            className={`${TONES[i % 3]} flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] py-3 transition-transform duration-300 group-hover:-translate-y-1.5`}
            style={{ width: WIDTHS[i % 7], height: `${HEIGHTS[i % 7]}%` }}
          >
            <span className="spine-title max-h-full truncate text-[13px] font-semibold tracking-tight">
              {book.title}
            </span>
          </div>
        ))}

        {Array.from({ length: blanks }).map((_, i) => {
          const k = books.length + i;
          return (
            <div
              key={`blank-${i}`}
              className="spine-blank shrink-0 rounded-[2px]"
              style={{
                width: WIDTHS[k % 7],
                height: `${HEIGHTS[k % 7] - 12}%`,
              }}
            />
          );
        })}

        {/* Pushes the name to the far end of the plank. */}
        <div className="min-w-6 flex-1" />

        <div
          className={`flex shrink-0 items-baseline gap-2 pb-1 ${
            right ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="font-display text-2xl leading-none text-paper transition-opacity group-hover:opacity-100 opacity-85">
            {name}
          </h2>
          <span className="font-mono text-[10px] text-paper-dim">
            {books.length}/{slots}
          </span>
        </div>
      </div>

      <div className="shelf-plank mt-1.5 h-2 w-full shrink-0 rounded-sm" />
    </Link>
  );
}

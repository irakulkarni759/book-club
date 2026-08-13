"use client";

import { useState } from "react";
import { OpenBook } from "./OpenBook";

export type Book = {
  id: string;
  title: string;
  author: string | null;
  why: string | null;
};

const SLOTS = 5;

// Same sizing and paper cycle as the shelf wall, so a book looks like the
// same object in both places.
const WIDTHS = [58, 74, 50, 66, 54, 80, 62];
const PAPERS = ["spine-bone", "spine-cream", "spine-oat", "spine-linen"];

export function ShelfRoom({
  memberId,
  books,
}: {
  memberId: string;
  books: Book[];
}) {
  // useState is how a component remembers something between clicks.
  // `openIndex` is which slot is open, or null when the shelf is closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const slots: (Book | null)[] = Array.from(
    { length: Math.max(SLOTS, books.length + 1) },
    (_, i) => books[i] ?? null
  );

  return (
    <>
      <div className="mt-14 flex h-64 items-end gap-2">
        {slots.map((book, i) => (
          <button
            key={book?.id ?? `blank-${i}`}
            onClick={() => setOpenIndex(i)}
            aria-label={book ? `Open ${book.title}` : "Add a book"}
            className={`group flex items-center justify-center overflow-hidden rounded-[3px] py-4 transition-all duration-300 hover:-translate-y-2 ${
              book
                ? `${PAPERS[i % 4]} h-56`
                : "spine-blank h-44 opacity-70 hover:opacity-100"
            }`}
            style={{ width: `min(${WIDTHS[i % 7]}px, 15vw)` }}
          >
            {/* Titles run down the spine, the way they do on a real book. */}
            {book && (
              <span className="spine-title max-h-full truncate font-display text-base">
                {book.title}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="shelf-ledge mt-1.5 h-2.5 w-full rounded-[2px]" />

      <p className="mt-6 font-display text-base text-chalk-dim">
        {books.length >= SLOTS
          ? "shelf is full, but you can always add more"
          : `${SLOTS - books.length} more to go`}
      </p>

      {openIndex !== null && (
        <OpenBook
          memberId={memberId}
          book={slots[openIndex]}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

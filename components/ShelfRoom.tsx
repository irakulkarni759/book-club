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
const WORDS = ["none", "one", "two", "three", "four", "five"];

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
      <div className="mt-14 flex h-56 items-end gap-2">
        {slots.map((book, i) => (
          <button
            key={book?.id ?? `blank-${i}`}
            onClick={() => setOpenIndex(i)}
            aria-label={book ? `Open ${book.title}` : "Add a book"}
            className={`group relative rounded-[3px] transition-all duration-300 hover:-translate-y-2 ${
              book ? "spine h-48 w-11" : "spine-blank h-40 w-11 opacity-70"
            }`}
          >
            {/* Titles run vertically down the spine, like a real one. */}
            {book && (
              <span
                className="absolute inset-0 flex items-center justify-center px-1 text-[10px] font-medium tracking-wide text-black/80 mix-blend-overlay"
                style={{ writingMode: "vertical-rl" }}
              >
                {book.title}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="shelf-plank h-[3px] w-full rounded-full" />

      {/* Milkyway has no digits, so counts are spelled out here. */}
      <p className="mt-6 text-sm text-paper-dim">
        {books.length >= SLOTS
          ? "shelf is full but you can always add more"
          : `${WORDS[SLOTS - books.length]} more to go`}
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

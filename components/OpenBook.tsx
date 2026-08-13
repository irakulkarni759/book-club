"use client";

import { useEffect, useState } from "react";
import { saveBook } from "@/app/actions";
import type { Book } from "./ShelfRoom";

const FACT_SLOTS = 5;

export function OpenBook({
  memberId,
  book,
  onClose,
}: {
  memberId: string;
  book: Book | null;
  onClose: () => void;
}) {
  // The book plays an opening animation the moment it mounts, driven by
  // CSS. `shutting` swaps in the reverse animation before unmounting.
  const [shutting, setShutting] = useState(false);
  const [saving, setSaving] = useState(false);

  function close() {
    setShutting(true);
    setTimeout(onClose, 380);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const existingFacts = (book?.why ?? "").split("\n").filter(Boolean);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        shutting ? "veil-out" : "veil-in"
      }`}
      style={{
        background: "rgba(4,4,6,0.82)",
        backdropFilter: "blur(6px)",
      }}
      onClick={close}
    >
      <div
        className="book-stage w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`book-spread relative flex h-[70vh] max-h-[520px] w-full ${
            shutting ? "book-shutting" : "book-opening"
          }`}
          style={{ boxShadow: "0 50px 90px -30px rgba(0,0,0,0.95)" }}
        >
          <form
            action={async (formData) => {
              setSaving(true);
              await saveBook(formData);
              close();
            }}
            className="flex h-full w-full"
          >
            <input type="hidden" name="memberId" value={memberId} />
            {book && <input type="hidden" name="bookId" value={book.id} />}

            {/* Outer page edges, so it reads as a stack of sheets. */}
            <div className="page-edges-left w-2 rounded-l-[3px]" />

            {/* LEFT PAGE: what the book is */}
            <div className="page page-left flex flex-1 flex-col px-9 py-10">
              <label className="text-xs uppercase tracking-wide text-black/45">
                the book
              </label>
              <input
                name="title"
                defaultValue={book?.title ?? ""}
                placeholder="Title"
                autoFocus
                required
                className="mt-3 w-full border-b border-black/20 bg-transparent pb-2 text-2xl outline-none placeholder:text-black/25 focus:border-black/50"
              />
              <input
                name="author"
                defaultValue={book?.author ?? ""}
                placeholder="Author"
                className="mt-6 w-full border-b border-black/15 bg-transparent pb-2 text-base outline-none placeholder:text-black/25 focus:border-black/40"
              />

              <div className="mt-auto flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-black px-5 py-2 text-sm text-[#f2efe8] transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  {saving ? "shelving" : "shelve it"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="text-sm text-black/45 hover:text-black"
                >
                  close
                </button>
              </div>
            </div>

            {/* THE SPINE, standing between the pages */}
            <div className="book-gutter w-3" />

            {/* RIGHT PAGE: five facts */}
            <div className="page page-right flex flex-1 flex-col px-9 py-10">
              <label className="text-xs uppercase tracking-wide text-black/45">
                five things you love about it
              </label>

              <ol className="mt-4 space-y-3">
                {Array.from({ length: FACT_SLOTS }).map((_, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="font-display text-xs text-black/40">
                      {i + 1}
                    </span>
                    <input
                      name="fact"
                      defaultValue={existingFacts[i] ?? ""}
                      placeholder="..."
                      className="w-full border-b border-black/15 bg-transparent pb-1.5 text-sm outline-none placeholder:text-black/20 focus:border-black/40"
                    />
                  </li>
                ))}
              </ol>
            </div>

            <div className="page-edges-right w-2 rounded-r-[3px]" />
          </form>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shelf } from "@/components/Shelf";
import { groupReactions } from "@/lib/reactions";

// These pages read live data that changes whenever anyone shelves a book.
// Without this, Next.js pre-renders them at build time and Vercel serves
// that snapshot forever, so new books never appear. Four readers is not a
// traffic problem; a stale page is.
export const dynamic = "force-dynamic";

export default async function Home() {
  // Two independent queries, not one nested select. If the reactions
  // table does not exist yet (the migration has not been run), that
  // query alone comes back empty and the shelves still render fine.
  // A single nested query would fail as a whole and take the wall down.
  const [{ data: members }, { data: reactionRows }] = await Promise.all([
    supabase.from("members").select("id, name, books(id, title)").order("name"),
    supabase.from("reactions").select("book_id, emoji, member_id"),
  ]);

  const reactionsByBook = groupReactions(reactionRows ?? []);

  return (
    // h-dvh is the real height of the screen, phone browser chrome included.
    // Everything below is sized in fractions of it, so the whole wall fits
    // on one screen without scrolling.
    <main className="relative mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden px-6 pt-8 pb-6">
      <div className="flex shrink-0 flex-col items-center">
        {/* Live text again, not an image. School Club has every glyph. */}
        <h1 className="chalk font-display text-5xl tracking-wide">
          bis book club
        </h1>
        <p className="chalk mt-1 font-display text-lg text-chalk-dim">
          one shot per missed book
        </p>
        <div className="mt-2 flex gap-4">
          <Link
            href="/map"
            className="chalk font-display text-sm text-chalk-dim underline-offset-4 hover:text-chalk hover:underline"
          >
            see the taste map
          </Link>
          <Link
            href="/pick"
            className="chalk font-display text-sm text-chalk-dim underline-offset-4 hover:text-chalk hover:underline"
          >
            the pick
          </Link>
        </div>
      </div>

      <div className="relative mt-6 flex min-h-0 flex-1 flex-col justify-between gap-1">
        {members?.map((member, i) => (
          <Shelf
            key={member.id}
            name={member.name}
            books={member.books.map((b) => ({
              ...b,
              reactions: reactionsByBook.get(b.id) ?? [],
            }))}
            align={i % 2 === 0 ? "left" : "right"}
          />
        ))}
      </div>
    </main>
  );
}

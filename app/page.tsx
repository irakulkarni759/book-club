import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Shelf } from "@/components/Shelf";

// These pages read live data that changes whenever anyone shelves a book.
// Without this, Next.js pre-renders them at build time and Vercel serves
// that snapshot forever, so new books never appear. Four readers is not a
// traffic problem; a stale page is.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: members } = await supabase
    .from("members")
    .select("id, name, books(id, title)")
    .order("name");

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
        <Link
          href="/map"
          className="chalk mt-2 font-display text-sm text-chalk-dim underline-offset-4 hover:text-chalk hover:underline"
        >
          see the taste map
        </Link>
      </div>

      <div className="relative mt-6 flex min-h-0 flex-1 flex-col justify-between gap-1">
        {members?.map((member, i) => (
          <Shelf
            key={member.id}
            name={member.name}
            books={member.books}
            align={i % 2 === 0 ? "left" : "right"}
          />
        ))}
      </div>
    </main>
  );
}

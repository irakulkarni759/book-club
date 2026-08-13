import { supabase } from "@/lib/supabase";
import { LiquidWordmark } from "@/components/LiquidWordmark";
import { Shelf } from "@/components/Shelf";

export default async function Home() {
  const { data: members } = await supabase
    .from("members")
    .select("id, name, books(id, title)")
    .order("name");

  return (
    // h-dvh is the real height of the screen, phone browser chrome included.
    // Everything below is sized in fractions of it, so the whole wall fits
    // on one screen without scrolling.
    <main className="relative mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden px-6 pt-7 pb-6">
      {/* A soft pool of light behind the wordmark so the top of the page
          is not pure void. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-96"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 55%, rgba(150,158,180,0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex shrink-0 flex-col items-center">
        <LiquidWordmark />
        <p className="-mt-1 text-sm text-paper-dim">one shot per missed book</p>
      </div>

      <div className="relative mt-5 flex min-h-0 flex-1 flex-col justify-between gap-1">
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

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
    <main className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-6 pt-8 pb-6">
      <LiquidWordmark />

      <p className="mt-1 shrink-0 text-sm text-paper-dim">
        one shot per missed book
      </p>

      <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between">
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

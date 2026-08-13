import { supabase } from "@/lib/supabase";
import { LiquidWordmark } from "@/components/LiquidWordmark";
import { Shelf } from "@/components/Shelf";

export default async function Home() {
  const { data: members } = await supabase
    .from("members")
    .select("id, name, books(id, title)")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-20 pb-32">
      <LiquidWordmark />

      <p className="mt-8 max-w-md text-paper-dim">
        Five books each. The shelves decide what we read. Fall behind and a
        bottle shows up on yours.
      </p>

      <div className="mt-20 space-y-10">
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

import { supabase } from "@/lib/supabase";
import { LiquidHeader } from "@/components/LiquidHeader";
import { Shelf } from "@/components/Shelf";

export default async function Home() {
  const { data: members } = await supabase
    .from("members")
    .select("id, name, books(id, title)")
    .order("name");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32">
      <LiquidHeader />

      <div className="-mt-12 relative">
        <h1 className="font-serif text-6xl tracking-tight">Book Club</h1>
        <p className="mt-3 max-w-md text-paper-dim">
          Five books each. The shelves decide what we read. Fall behind and a
          bottle shows up on yours.
        </p>
      </div>

      <div className="mt-16 space-y-8">
        {members?.map((member) => (
          <Shelf key={member.id} name={member.name} books={member.books} />
        ))}
      </div>
    </main>
  );
}

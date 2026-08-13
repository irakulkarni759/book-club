import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShelfRoom } from "@/components/ShelfRoom";

// The [name] folder makes this one file serve /shelf/ira, /shelf/isha,
// and any other name. Next.js hands us the URL segment as a param.
export default async function ShelfPage({
  params,
}: PageProps<"/shelf/[name]">) {
  const { name } = await params;

  const { data: member } = await supabase
    .from("members")
    .select("id, name, books(id, title, author, why, created_at)")
    .ilike("name", name)
    .single();

  if (!member) notFound();

  const books = [...member.books].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-10 pb-32">
      <Link
        href="/"
        className="font-display text-sm text-chalk-dim hover:text-chalk"
      >
        &larr; all shelves
      </Link>

      <h1 className="chalk mt-6 font-display text-5xl lowercase">{member.name}</h1>
      <p className="chalk mt-2 font-display text-base text-chalk-dim">
        open a book and tell us why you love it
      </p>

      <ShelfRoom memberId={member.id} books={books} />
    </main>
  );
}

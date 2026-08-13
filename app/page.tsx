import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .order("name");

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Book Club</h1>

      <p className="mt-4 text-lg text-zinc-600">
        Four people, five favorite books each, and one bottle of wine owed for
        every month you fall behind.
      </p>

      <h2 className="mt-16 text-sm font-medium uppercase tracking-wide text-zinc-500">
        Members
      </h2>

      <ul className="mt-4 space-y-2">
        {members?.map((member) => (
          <li key={member.id} className="text-zinc-700">
            {member.name}
          </li>
        ))}
      </ul>

      <h2 className="mt-16 text-sm font-medium uppercase tracking-wide text-zinc-500">
        How it works
      </h2>

      <ol className="mt-4 space-y-3 text-zinc-700">
        <li>1. Everyone adds five books they love and why.</li>
        <li>2. We map the overlap and find the group&apos;s shared taste.</li>
        <li>3. That picks the book of the month.</li>
        <li>4. Comment as you read, chapter by chapter.</li>
        <li>5. Show up in December. Miss a book, bring a bottle.</li>
      </ol>
    </main>
  );
}

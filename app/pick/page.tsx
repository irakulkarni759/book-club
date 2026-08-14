import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getViewerId } from "@/lib/identity";
import { generateCandidates } from "@/app/actions";
import { VotePanel, type Candidate } from "@/components/VotePanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "the pick" };

const SLOTS = 5; // must match ShelfRoom.SLOTS: what "a full shelf" means

export default async function PickPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  const month = monthStart.toISOString().slice(0, 10);

  const [{ data: settled }, { data: members }, { data: candidates }, { data: votes }, viewerId] =
    await Promise.all([
      supabase.from("picks").select("*").eq("month", month).maybeSingle(),
      supabase.from("members").select("id, name, books(id)").order("name"),
      supabase
        .from("candidates")
        .select("id, title, author, reason, created_at")
        .order("created_at"),
      supabase.from("candidate_votes").select("candidate_id, member_id"),
      getViewerId(),
    ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24">
      <Link href="/" className="font-display text-sm text-chalk-dim hover:text-chalk">
        &larr; all shelves
      </Link>

      <h1 className="chalk mt-6 font-display text-5xl">the pick</h1>

      {settled ? (
        <SettledPick pick={settled} />
      ) : (
        <OpenRound
          members={members ?? []}
          candidates={candidates ?? []}
          votes={votes ?? []}
          viewerId={viewerId}
        />
      )}
    </main>
  );
}

function SettledPick({
  pick,
}: {
  pick: { title: string; author: string | null; reason: string | null };
}) {
  return (
    <div className="mt-10">
      <p className="text-sm text-chalk-dim">this month, the group is reading</p>
      <h2 className="chalk mt-2 font-display text-4xl">{pick.title}</h2>
      {pick.author && <p className="mt-1 text-chalk-dim">{pick.author}</p>}
      {pick.reason && (
        <p className="mt-6 max-w-xl leading-relaxed text-chalk-dim">{pick.reason}</p>
      )}
      <p className="mt-10 font-display text-sm text-chalk-dim">
        chapter comments live here soon
      </p>
    </div>
  );
}

function OpenRound({
  members,
  candidates,
  votes,
  viewerId,
}: {
  members: { id: string; name: string; books: { id: string }[] }[];
  candidates: { id: string; title: string; author: string | null; reason: string | null }[];
  votes: { candidate_id: string; member_id: string }[];
  viewerId: string | null;
}) {
  const shortShelves = members.filter((m) => m.books.length < SLOTS);
  const allFull = shortShelves.length === 0;

  if (candidates.length === 0) {
    return (
      <div className="mt-10">
        {allFull ? (
          <>
            <p className="max-w-md text-chalk-dim">
              Every shelf is full. Fireworks can now read all of them and
              propose three books for the group to vote on.
            </p>
            <form action={generateCandidates} className="mt-6">
              <button
                type="submit"
                className="rounded-full border border-chalk px-5 py-2 font-display text-sm text-chalk hover:bg-board-deep"
              >
                reveal three candidates
              </button>
            </form>
          </>
        ) : (
          <p className="max-w-md text-chalk-dim">
            Still waiting on{" "}
            {shortShelves.map((m) => m.name.toLowerCase()).join(", ")} to
            finish shelving five books each. The pick draws on every shelf,
            so it waits for all of them.
          </p>
        )}
      </div>
    );
  }

  const votesByCandidate = new Map<string, number>();
  for (const v of votes) {
    votesByCandidate.set(v.candidate_id, (votesByCandidate.get(v.candidate_id) ?? 0) + 1);
  }
  const myVote = votes.find((v) => v.member_id === viewerId)?.candidate_id ?? null;
  const voted = new Set(votes.map((v) => v.member_id));
  const stillVoting = members.filter((m) => !voted.has(m.id));

  const rows: Candidate[] = candidates.map((c) => ({
    ...c,
    votes: votesByCandidate.get(c.id) ?? 0,
  }));

  return (
    <div className="mt-10">
      <p className="text-chalk-dim">
        Three books, drawn from what the whole group already loves. Vote for
        the one you want to read.
      </p>

      <VotePanel candidates={rows} myVote={myVote} />

      <p className="mt-6 font-display text-sm text-chalk-dim">
        {stillVoting.length === 0
          ? "everyone has voted"
          : `waiting on ${stillVoting.map((m) => m.name.toLowerCase()).join(", ")}`}
      </p>

      {allFull && (
        <form action={generateCandidates} className="mt-8">
          <button
            type="submit"
            className="font-display text-sm text-chalk-dim underline decoration-dotted underline-offset-4 hover:text-chalk"
          >
            not feeling these? reroll
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { castVote } from "@/app/actions";

export type Candidate = {
  id: string;
  title: string;
  author: string | null;
  reason: string | null;
  votes: number;
};

export function VotePanel({
  candidates,
  myVote,
}: {
  candidates: Candidate[];
  myVote: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function vote(id: string) {
    startTransition(async () => {
      await castVote(id);
      router.refresh();
    });
  }

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-3">
      {candidates.map((c) => {
        const mine = myVote === c.id;
        return (
          <div
            key={c.id}
            className={`flex flex-col rounded-lg border p-5 transition-colors ${
              mine ? "border-chalk bg-board-deep" : "border-edge"
            }`}
          >
            <h3 className="font-display text-xl text-chalk">{c.title}</h3>
            {c.author && (
              <p className="mt-0.5 text-sm text-chalk-dim">{c.author}</p>
            )}
            {c.reason && (
              <p className="mt-3 flex-1 text-sm leading-relaxed text-chalk-dim">
                {c.reason}
              </p>
            )}

            <button
              type="button"
              disabled={pending}
              onClick={() => vote(c.id)}
              className={`mt-5 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                mine
                  ? "border-chalk bg-chalk text-board"
                  : "border-edge text-chalk hover:border-chalk"
              }`}
            >
              {mine ? "your vote" : "vote for this one"}
            </button>

            <p className="mt-2 font-display text-xs text-chalk-dim">
              {c.votes === 0
                ? "no votes yet"
                : c.votes === 1
                  ? "one vote"
                  : `${c.votes} votes`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

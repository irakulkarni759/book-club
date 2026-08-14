"use client";

import { chooseIdentity } from "@/app/actions";

// A full-board overlay shown exactly once per browser, the first time
// anyone opens the site without the identity cookie set. Picking a name
// unlocks reacting (and later, comments and the shots tally) as that
// person, everywhere, without a password.
export function WhoAmI({ members }: { members: { id: string; name: string }[] }) {
  return (
    <div className="veil-in fixed inset-0 z-[60] flex items-center justify-center bg-board/95 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xs text-center">
        <h2 className="chalk font-display text-3xl">who&apos;s reading?</h2>
        <p className="mt-2 text-sm text-chalk-dim">
          pick your name, this browser will remember it
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {members.map((m) => (
            <form key={m.id} action={chooseIdentity}>
              <input type="hidden" name="memberId" value={m.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-edge py-3 font-display text-xl text-chalk transition-colors hover:border-chalk hover:bg-board-deep"
              >
                {m.name.toLowerCase()}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}

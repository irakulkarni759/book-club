"use client";

import { switchIdentity } from "@/app/actions";

// The quiet corner tag confirming which name reactions will post under,
// and the only way to change it once picked.
export function ViewerTag({ name }: { name: string }) {
  return (
    <div className="pointer-events-none fixed top-3 right-4 z-40 font-display text-xs text-chalk-dim">
      <span className="pointer-events-auto">{name.toLowerCase()}</span>
      <form action={switchIdentity} className="pointer-events-auto inline">
        <button
          type="submit"
          className="ml-2 underline decoration-dotted underline-offset-2 hover:text-chalk"
        >
          not you?
        </button>
      </form>
    </div>
  );
}

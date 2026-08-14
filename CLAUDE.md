@AGENTS.md

# Book Club

A private book club app for four people: Ira, Isha, Samaa, Shanyu.
Everyone shelves five favorite books, the group's combined taste picks a
monthly read, people comment chapter by chapter, and anyone who skips the
last chapter gets a shot added to their shelf.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres) for all data. Client in `lib/supabase.ts`.
- Fireworks for book tagging, recommendations, and judging comments
- No login. Public link, plus one soft identity layer: a name picked once
  from the four real members and remembered in a cookie (`lib/identity.ts`).
  It exists only to attribute reactions/comments to a person, not to gate
  reading or shelving. RLS policies are wide open by design.

## Design rules

The look is a **chalkboard**: slate-green board, chalk lettering, paper books
on wooden ledges. There is no chrome, silver, or WebGL anywhere. If a change
starts reaching for metallic gradients, it is off-brief.

- **Never hardcode a color.** Use the tokens in `app/globals.css`:
  `board`, `board-deep`, `chalk`, `chalk-dim`, `edge`, `ledge`, `coral`.
  As Tailwind classes: `bg-board`, `text-chalk-dim`, `border-edge`, etc.
- **Books are paper, never white.** Spines use `.spine-bone`, `.spine-cream`,
  `.spine-oat`, `.spine-linen`, cycled by position. Stark white is wrong;
  these are warm off-whites. An empty slot is `.spine-blank`, a dashed chalk
  outline drawn straight on the board.
- **School Club (`font-display`) is the voice.** Full character set, so it
  handles headings, names, labels, counts, and spine titles. `font-sans`
  (Geist) is only for text the members type, so their own words stay
  readable at length.
- **Chalk text uses the `.chalk` class**, which adds the soft bloom. Crisp
  text on the board looks printed rather than written.
- **The wordmark is live text**, not an image. Change the words in
  `app/page.tsx`.
- **The shelf is the interface.** Navigation happens by touching a shelf or a
  book, not through a nav bar.
- **Shelves zigzag.** They alternate left and right down the page via the
  `align` prop on `<Shelf>`.
- **The whole wall fits one screen.** The homepage is `h-dvh` with no
  scrolling: shelves share the leftover height via `flex-1` and size their
  spines in percentages. Anything added to the homepage must keep that true.
- Books stand on a ledge, so spine rows align to the bottom (`items-end`).
- `coral` is reserved for shots owed and deadlines. Do not spend it on
  ordinary UI or it stops reading as an alarm.

## Conventions

- Pages are server components that read from Supabase directly.
  Add `"use client"` only when a file needs browser-only behavior
  (form state, timers, clicks).
- Shared UI lives in `components/`, one component per file, named export.
- Schema lives in `supabase/schema.sql`. Keep it updated when tables change.
- **Query optional data separately from required data.** e.g. `reactions`
  is fetched as its own query and merged in with `groupReactions()`
  (`lib/reactions.ts`), never nested inside the `members`/`books` select.
  A missing or broken optional table then degrades to "shows nothing";
  nesting it would take the whole page down if that table has a problem.
- Reactions: fixed emoji set (`REACTION_SET` in `lib/reactions.ts`), one
  row per (book, member, emoji) in the `reactions` table, tapping again
  removes it. Full picker inside an open book; a non-interactive top-emoji
  badge peeks from the corner of a spine on the wall and on a member's own
  shelf.
- **The pick** (`/pick`, `app/pick/page.tsx`) is a state machine over three
  tables, not one page with one query:
  1. No `candidates` row and any shelf under 5 books &rarr; "waiting on X, Y".
  2. No `candidates` row, every shelf full &rarr; a "reveal three candidates"
     button, which calls `generateCandidates()`. It reads every shelf and
     tags via `proposeCandidates()` (`lib/fireworks.ts`), which needs a much
     larger token budget than tagging a single book (see the comment above
     the call) because it has to reason about four shelves at once, not one.
  3. `candidates` rows exist, not everyone has voted &rarr; `<VotePanel>`,
     one vote per member for the whole round (`castVote` moves your vote
     rather than adding a second one; voting for your own pick again un-votes).
  4. Once every member has voted, `settleIfEveryoneVoted()` (inside
     `castVote`, in `app/actions.ts`) picks the plurality winner, writes it
     to `picks` for the current month, and clears `candidates` (which
     cascades to `candidate_votes`). There is exactly one open round at a
     time; generating fresh candidates always clears whatever was there.
  5. A `picks` row exists for the current month &rarr; the settled view.
     There can only be one `picks` row per month (`month` is `unique`).

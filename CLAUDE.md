@AGENTS.md

# Book Club

A private book club app for four people: Ira, Isha, Samaa, Shanyu.
Everyone shelves five favorite books, the group's combined taste picks a
monthly read, people comment chapter by chapter, and anyone who skips the
last chapter gets a wine bottle added to their shelf.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres) for all data. Client in `lib/supabase.ts`.
- `@paper-design/shaders-react` for the liquid metal treatment
- Fireworks for book tagging, recommendations, and judging comments
- No auth. Public link, pick-your-name. RLS policies are wide open by design.

## Design rules

The look is liquid chrome on near-black. Reference: paper-design/liquid-logo.

- **Never hardcode a color.** Use the tokens in `app/globals.css`:
  `ink`, `ink-raised`, `paper`, `paper-dim`, `edge`, `brass`.
  As Tailwind classes: `bg-ink`, `text-paper-dim`, `border-edge`, etc.
- **Shrofa (`font-display`) for names and headings only.** It is a display
  face under a personal-use license, uppercase-looking and very wide. Never
  use it for body text, book titles, or anything longer than a few words.
  Sans (`font-sans`) for all reading text, mono (`font-mono`) for counts,
  timers, and tallies.
- **The wordmark is a PNG, not live text.** `public/wordmark.png` is "bis
  book club" set in Shrofa, white on transparent, used as the shader's mask.
  To change the words, re-render the PNG rather than adding text on top.
- **Shelves zigzag.** They alternate left and right down the page via the
  `align` prop on `<Shelf>`.
- **Real WebGL shaders are rationed.** Browsers cap out around 8-16 canvases
  per page. Use `<LiquidMetal>` only for hero moments: the header, the book
  of the month, wine bottles. Everything else fakes metal with the `.spine`
  and `.spine-blank` CSS gradient classes.
- **The shelf is the interface.** Navigation happens by touching a shelf or a
  book, not through a nav bar.
- Books stand on a plank, so spine rows align to the bottom (`items-end`).

## Conventions

- Pages are server components that read from Supabase directly.
  Add `"use client"` only when a file needs browser-only behavior
  (form state, WebGL, timers, clicks).
- Shared UI lives in `components/`, one component per file, named export.
- Schema lives in `supabase/schema.sql`. Keep it updated when tables change.

# bis book club

A private book club for four people: Ira, Isha, Samaa, Shanyu.

Everyone shelves five books they love and says why. An AI describes each book
in a shared vocabulary, which lets the app map whose taste overlaps with
whose, and pick a book for the month from what the group has in common.
People comment chapter by chapter. Anyone who skips the last chapter owes a
shot at the December meetup.

**Live:** https://book-club-ira-1a7f.vercel.app

---

## Built while learning

This was built from zero web development knowledge. Below is what each piece
of the stack actually does, in the order it was learned. It doubles as the
project's documentation.

### The web, from the bottom

A website is text files sent to a browser. Three kinds:

| | Job | Analogy |
|---|---|---|
| **HTML** | Content and structure | Skeleton |
| **CSS** | Appearance | Skin and clothes |
| **JavaScript** | Behavior | Muscles |

Everything else is a tool for writing those three more easily.

### React

Lets you build a page out of **components**: reusable pieces defined once and
used many times. Define a book spine once, render twenty of them.

It also keeps the screen in sync with the data automatically. Add a book to
the list and React redraws what changed. You never write instructions to find
an element and modify it.

Seen here in `components/Shelf.tsx`, where `.map()` turns a list of books into
a row of spines.

### Next.js

React handles what is *inside* a page. Next.js handles everything *around*
pages, and it is a **framework**, meaning it runs your code rather than the
other way round. You put files where it expects and it comes looking.

- **Folders become URLs.** `app/map/page.tsx` serves `/map`. No routing config.
- **`[name]` folders are dynamic.** `app/shelf/[name]/page.tsx` serves
  `/shelf/ira`, `/shelf/isha`, and every other name, from one file.
- **Server components by default.** Pages run on the server, query the
  database, and send finished HTML. Browsers never touch the database.
- **`"use client"`** marks the exceptions: files needing a browser, for form
  state, clicks, timers.
- **`"use server"`** marks the opposite: functions the browser may *call* but
  which only ever *run* on the server. That is how a form writes to the
  database with no API endpoint, in `app/actions.ts`.

### Tailwind CSS

Styling by class names in the markup: `mx-auto max-w-2xl px-6`. Each class is
one rule. Ugly to read, but you never leave the file to change how something
looks and never invent CSS names.

Design tokens live once in `app/globals.css` (`board`, `chalk`, `ledge`,
`coral`). Components use the names, never raw hex. That is what stops a
vibe-coded project from drifting into fifteen shades of grey.

### Supabase

A hosted Postgres database. Four tables that point at each other with
**foreign keys**:

```
members ──< books
        └──< comments >── picks
```

`books.member_id` holds the id of whoever shelved it. That relationship is
what lets one query fetch members *and* their books at once, and what makes
"who reads alike" answerable at all.

Schema in `supabase/schema.sql`.

**Row Level Security** is enabled with wide-open policies, a deliberate
trade-off for having no logins. The publishable key is public by design; the
RLS policies, not the key, are what control access.

### Fonts, and reading a licence

Fonts came from 1001fonts.com under **Free For Personal Use** licences, which
explicitly cover "recreational websites for friends and family". A private
book club qualifies. A commercial product would not.

Two things learned the hard way:

- **Demo fonts are often crippled.** Milkyway's demo has 56 glyphs: letters
  and space. No digits, no punctuation. Unusable for body text, and it was
  only caught by inspecting the font file rather than the sample image.
- **Check the character set before designing around a font.** School Club has
  172 glyphs including digits and punctuation, which is why it could become
  the whole voice of the app.

Fonts are converted to WOFF2 (smaller, web-native, permitted by the licence)
and the original OTF/TTF is not served, so the installable file is not
redistributed.

### Vercel

Hosting, by the company that makes Next.js. Connected to the GitHub repo, so:

```
edit a file → git push → GitHub → Vercel rebuilds → live in ~40s
```

No deploy command is ever run.

**Environment variables** hold anything account-specific. `.env.local` stays
on the laptop and is gitignored; the same values are entered separately in
Vercel's dashboard. Vercel only picks up changes on the next deployment.

Also learned: new Vercel projects enable **Deployment Protection** by
default, which hides the site behind a login. It has to be turned off for a
site meant to be shared.

### Fireworks

Runs open models via an OpenAI-compatible API. Used to describe each book in
the shared vocabulary. See `lib/fireworks.ts`.

Four things that turned out to matter more than the model choice:

1. **A controlled vocabulary.** `lib/vocabulary.ts` defines ~60 allowed
   terms. Left free, a model tags one book `melancholy` and another
   `melancholic` and the two look unrelated to a computer. Forcing every book
   through identical words is what makes similarity measurable.
2. **Constrain, then verify anyway.** The request uses a JSON schema listing
   allowed values, *and* the code rechecks every returned tag against the
   vocabulary. Models drift.
3. **Save the human's work before calling the model.** `saveBook` writes the
   title and notes to Postgres first, then tags. If the API is down, nobody
   loses what they typed. `tagBook` never throws.
4. **Test on the real workload.** `gpt-oss-20b` passed a toy schema and
   returned *empty* on the real one, having spent its whole token budget
   reasoning. Hence the automatic fallback to a second model.

Models were chosen by measurement, not reputation:

| Model | Outcome |
|---|---|
| `qwen3p7-plus` | Reasoning text before the JSON, unparseable |
| `glm-5p2` | Empty response |
| `gpt-oss-20b` | Empty on the real schema |
| `deepseek-v4-flash` | Correct, ~6.6s → fallback |
| `gpt-oss-120b` | Correct, ~2.9s → **primary** |

### The taste map

`lib/taste.ts`. Similarity uses the **Jaccard index**: shared tags divided by
total distinct tags between two people.

```
Ira:   {literary-fiction, bleak, class, power}
Samaa: {literary-fiction, funny, class}
shared 2 / union 5 = 40%
```

Dividing by the union matters. Counting raw overlaps would rank whoever reads
the most as similar to everybody.

The map itself (`components/TasteMap.tsx`) is hand-drawn SVG: members on a
circle, the line between any two drawn heavier the more they share. It is
deliberately *not* a force-directed layout, which would imply precision this
data does not have.

---

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3001.

Needs a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
FIREWORKS_API_KEY=...
```

Optional overrides: `FIREWORKS_MODEL`, `FIREWORKS_FALLBACK_MODEL`.

## Layout

```
app/
  page.tsx              the shelf wall, fits one screen, no scrolling
  map/page.tsx          the group taste map
  shelf/[name]/page.tsx one member's shelf, one file for all names
  actions.ts            server actions: saving a book, tagging it
  globals.css           design tokens and the chalkboard
components/
  Shelf.tsx             a row of spines on a ledge
  ShelfRoom.tsx         a member's own shelf, opens books
  OpenBook.tsx          the two-page spread you type into
  TasteProfile.tsx      one person's taste, sized by frequency
  TasteMap.tsx          the constellation
lib/
  supabase.ts           database connection
  vocabulary.ts         the ~60 allowed tags
  fireworks.ts          tagging, with fallback
  taste.ts              similarity maths
supabase/schema.sql     tables, policies, seed members
CLAUDE.md               design rules, so AI edits stay on-brief
```

## Still to build

- [ ] AI proposes three candidate books, the group votes
- [ ] The monthly pick gets its own page with a deadline you set
- [ ] Chapter-by-chapter comments, plus overall comments
- [ ] Shots appear on the shelf of anyone who skipped the last chapter

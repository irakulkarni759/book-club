-- Book club schema.
-- Paste this into the Supabase SQL Editor and hit Run.

-- 1. MEMBERS ---------------------------------------------------------------
create table members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- 2. BOOKS -----------------------------------------------------------------
-- Each row is one favorite book belonging to one member.
create table books (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members(id) on delete cascade,
  title      text not null,
  author     text,
  why        text,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- One member cannot shelve the same title twice. Case-insensitive, so
-- "Beloved" and "beloved" collide. This is the last line of defence against
-- double-submits; the app also checks before inserting.
create unique index books_member_title_idx
  on books (member_id, lower(title));

-- 3. REACTIONS ---------------------------------------------------------
-- One row per (book, reactor, emoji). Tapping an emoji you already used
-- deletes this row instead of adding another, which is what makes
-- reacting a toggle. The unique index is what makes that safe even if
-- someone taps twice quickly.
create table reactions (
  id         uuid primary key default gen_random_uuid(),
  book_id    uuid not null references books(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (book_id, member_id, emoji)
);

-- 5. CANDIDATES --------------------------------------------------------
-- The three books Fireworks proposes for the group to vote on. There is
-- only ever one open round: generating a fresh set of candidates clears
-- whatever was here before, votes included (the foreign key cascades).
create table candidates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  author     text,
  reason     text,
  created_at timestamptz not null default now()
);

-- 6. CANDIDATE VOTES -----------------------------------------------------
-- One member, one vote, across the whole round -- not one vote PER
-- candidate. The app enforces "one active vote per member" by deleting
-- their previous vote before inserting a new one; this index only stops
-- the same member voting for the same candidate twice.
create table candidate_votes (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (candidate_id, member_id)
);

-- 7. PICKS -----------------------------------------------------------------
-- The book of the month, once voting settles.
create table picks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  month       date not null unique,
  reason      text,
  chapter_count int,
  created_at  timestamptz not null default now()
);

-- 8. COMMENTS --------------------------------------------------------------
create table comments (
  id         uuid primary key default gen_random_uuid(),
  pick_id    uuid not null references picks(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  chapter    int not null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ACCESS -------------------------------------------------------------------
-- Supabase locks every new table by default. These tables are open to anyone
-- with the link, which is the tradeoff we chose by skipping logins.
alter table members         enable row level security;
alter table books           enable row level security;
alter table reactions       enable row level security;
alter table candidates      enable row level security;
alter table candidate_votes enable row level security;
alter table picks           enable row level security;
alter table comments        enable row level security;

create policy "public access" on members         for all using (true) with check (true);
create policy "public access" on books           for all using (true) with check (true);
create policy "public access" on reactions       for all using (true) with check (true);
create policy "public access" on candidates      for all using (true) with check (true);
create policy "public access" on candidate_votes for all using (true) with check (true);
create policy "public access" on picks           for all using (true) with check (true);
create policy "public access" on comments        for all using (true) with check (true);

-- SEED ---------------------------------------------------------------------
insert into members (name) values ('Ira'), ('Isha'), ('Samaa'), ('Shanyu');

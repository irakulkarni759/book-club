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

-- 3. PICKS -----------------------------------------------------------------
-- The book of the month.
create table picks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text,
  month       date not null unique,
  reason      text,
  chapter_count int,
  created_at  timestamptz not null default now()
);

-- 4. COMMENTS --------------------------------------------------------------
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
alter table members  enable row level security;
alter table books    enable row level security;
alter table picks    enable row level security;
alter table comments enable row level security;

create policy "public access" on members  for all using (true) with check (true);
create policy "public access" on books    for all using (true) with check (true);
create policy "public access" on picks    for all using (true) with check (true);
create policy "public access" on comments for all using (true) with check (true);

-- SEED ---------------------------------------------------------------------
insert into members (name) values ('Ira'), ('Isha'), ('Samaa'), ('Shanyu');

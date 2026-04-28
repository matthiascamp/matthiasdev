-- ============================================================
--  Cornerstone Tracker — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists page_views (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  url          text        not null,
  path         text        not null,
  title        text,
  referrer     text,
  browser      text,
  os           text,
  device_type  text,
  screen_size  text,
  language     text,
  session_id   text        not null,
  site_id      text
);

-- Performance indexes
create index if not exists idx_pv_created_at  on page_views (created_at desc);
create index if not exists idx_pv_path        on page_views (path);
create index if not exists idx_pv_session_id  on page_views (session_id);
create index if not exists idx_pv_site_id     on page_views (site_id);

-- Enable Row Level Security
alter table page_views enable row level security;

-- Allow the embed script (anon key) to INSERT tracking rows
create policy "anon_insert"
  on page_views for insert
  to anon
  with check (true);

-- Allow the dashboard (anon key) to SELECT all rows
create policy "anon_select"
  on page_views for select
  to anon
  using (true);

-- ============================================================
--  After running this SQL, also do:
--  Supabase Dashboard → Database → Replication
--  → toggle "page_views" ON under Supabase Realtime
--  (required for the live feed in dashboard.html)
-- ============================================================

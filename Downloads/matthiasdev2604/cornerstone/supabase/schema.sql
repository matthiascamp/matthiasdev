-- =============================================================
--  EXALT DIGITAL — DATABASE SCHEMA
--  Run this in: Supabase Dashboard → SQL Editor
--
--  Run once to set up the orders table. Safe to re-run —
--  all statements use IF NOT EXISTS / IF NOT EXISTS guards.
-- =============================================================

-- Orders table — one row per purchase (Google Ads or SEO plan)
create table if not exists orders (
  id                     uuid        primary key default gen_random_uuid(),
  user_id                uuid        references auth.users(id) on delete set null,

  -- What kind of purchase
  type                   text        not null check (type in ('google_ads', 'seo_plan')),
  status                 text        not null default 'pending'
                           check (status in ('pending', 'live', 'completed', 'cancelled')),

  -- Common fields
  site_url               text        not null,
  amount_cents           integer     not null,  -- total paid in cents
  customer_email         text,
  stripe_session_id      text,

  -- Google Ads specific
  keywords               text,
  location               text,
  ad_budget_cents        integer,               -- 75% of amount_cents
  google_campaign_id     text,                  -- filled in after campaign is created

  -- SEO plan specific
  plan_tier              text        check (plan_tier in ('starter', 'growth', 'pro', 'authority')),
  stripe_subscription_id text,
  articles_delivered     integer     default 0,

  -- Timestamps
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- Index for fast user dashboard loads
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_stripe_session_idx on orders(stripe_session_id);

-- Row Level Security
alter table orders enable row level security;

-- Authenticated users can only see their own orders
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'users_see_own_orders'
  ) then
    execute $p$
      create policy "users_see_own_orders" on orders
        for select to authenticated
        using (user_id = auth.uid())
    $p$;
  end if;
end $$;

-- Service role (used by Edge Functions) can read and write everything
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'orders' and policyname = 'service_role_full_access'
  ) then
    execute $p$
      create policy "service_role_full_access" on orders
        for all to service_role
        using (true) with check (true)
    $p$;
  end if;
end $$;

-- Auto-update updated_at on any change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- =============================================================
--  Contact messages table
-- =============================================================

create table if not exists contact_messages (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  subject    text        not null,
  message    text        not null,
  created_at timestamptz default now()
);

-- RLS: anyone can submit, nobody can read (only service role)
alter table contact_messages enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'contact_messages' and policyname = 'anyone_can_insert_contact'
  ) then
    execute $p$
      create policy "anyone_can_insert_contact" on contact_messages
        for insert to anon, authenticated
        with check (true)
    $p$;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'contact_messages' and policyname = 'service_role_read_contact'
  ) then
    execute $p$
      create policy "service_role_read_contact" on contact_messages
        for all to service_role
        using (true) with check (true)
    $p$;
  end if;
end $$;

-- =============================================================
--  Clean up old fake traffic delivery (if you ran campaign_setup.sql before)
--  Uncomment and run these if you set up the old system:
--
--  select cron.unschedule('deliver-campaign');
--  drop function if exists insert_campaign_visits();
-- =============================================================

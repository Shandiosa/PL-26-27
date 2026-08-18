-- ============================================================
--  Premier League 26/27 – Supabase-skjema
--  Kjør hele filen i SQL Editor. Idempotent (kan kjøres på nytt).
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Profiler ────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text not null default '',
  fav_club    text,
  is_admin    boolean not null default false,
  active      boolean not null default true,
  paid        boolean not null default false,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ── Innleveringer (ett tips per bruker) ─────────────────────
create table if not exists submissions (
  user_id      uuid primary key references profiles(id) on delete cascade,
  name         text not null default '',
  prediction   jsonb not null,
  submitted_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Kladd ───────────────────────────────────────────────────
create table if not exists drafts (
  user_id    uuid primary key references profiles(id) on delete cascade,
  prediction jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Fasit (én rad, id = 1) ──────────────────────────────────
create table if not exists results (
  id         int primary key default 1 check (id = 1),
  pl_order   jsonb not null default '[]'::jsonb,
  promotion  jsonb not null default '[]'::jsonb,
  awards     jsonb not null default '{}'::jsonb,
  published  jsonb not null default '{}'::jsonb,
  snapshot   jsonb not null default '{"active":false,"note":""}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into results (id) values (1) on conflict (id) do nothing;

-- ── Innstillinger (én rad, id = 1) ──────────────────────────
create table if not exists settings (
  id            int primary key default 1 check (id = 1),
  lock_override boolean not null default false,
  deadline      timestamptz not null default '2026-08-14T18:00:00+02',
  updated_at    timestamptz not null default now()
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ── Profil opprettes automatisk ved registrering ────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, fav_club)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'fav_club'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Hjelpefunksjoner ────────────────────────────────────────
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

-- Tippingen er stengt når admin har låst, eller fristen er passert.
create or replace function is_locked()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select lock_override or now() > deadline from settings where id = 1),
    false)
$$;

-- ── RLS ─────────────────────────────────────────────────────
alter table profiles    enable row level security;
alter table submissions enable row level security;
alter table drafts      enable row level security;
alter table results     enable row level security;
alter table settings    enable row level security;

-- Profiler: alle innloggede ser deltakerlista (navn/klubb/betalt),
-- men bare admin kan endre andre enn seg selv.
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from profiles p where p.id = auth.uid())
              and paid = (select p.paid from profiles p where p.id = auth.uid()));

drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles
  for all to authenticated using (is_admin()) with check (is_admin());

-- Innleveringer: egen alltid; andres først etter låsing.
drop policy if exists subs_select on submissions;
create policy subs_select on submissions
  for select to authenticated
  using (user_id = auth.uid() or is_locked() or is_admin());

drop policy if exists subs_insert on submissions;
create policy subs_insert on submissions
  for insert to authenticated
  with check (user_id = auth.uid() and not is_locked());

drop policy if exists subs_update on submissions;
create policy subs_update on submissions
  for update to authenticated
  using (user_id = auth.uid() and not is_locked())
  with check (user_id = auth.uid() and not is_locked());

drop policy if exists subs_admin_all on submissions;
create policy subs_admin_all on submissions
  for all to authenticated using (is_admin()) with check (is_admin());

-- Kladd: kun egen.
drop policy if exists drafts_own on drafts;
create policy drafts_own on drafts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Fasit: alle leser, kun admin skriver.
drop policy if exists results_select on results;
create policy results_select on results for select to authenticated using (true);
drop policy if exists results_write on results;
create policy results_write on results for all to authenticated
  using (is_admin()) with check (is_admin());

-- Innstillinger: alle leser, kun admin skriver.
drop policy if exists settings_select on settings;
create policy settings_select on settings for select to authenticated using (true);
drop policy if exists settings_write on settings;
create policy settings_write on settings for all to authenticated
  using (is_admin()) with check (is_admin());

-- ── Realtime (valgfritt: live leaderboard uten polling) ─────
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table results;

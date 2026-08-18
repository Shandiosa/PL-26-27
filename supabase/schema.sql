-- ============================================================
--  Premier League 26/27 – Supabase-skjema
--  Kjør hele filen i SQL Editor. Kan kjøres på nytt uten skade.
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
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Innleveringer (ett tips per bruker) ─────────────────────
create table if not exists submissions (
  user_id      uuid primary key references profiles(id) on delete cascade,
  email        text not null,
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
  insert into profiles (id, email, name, fav_club, verified)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'fav_club',
    new.email_confirmed_at is not null
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
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false)
$$;

-- Tippingen er stengt når admin har låst, eller fristen er passert.
create or replace function is_locked()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select s.lock_override or now() > s.deadline from settings s where s.id = 1), false)
$$;

-- Hindrer at en vanlig bruker gjør seg selv til admin / markerer seg som betalt.
create or replace function guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    new.is_admin := old.is_admin;
    new.paid     := old.paid;
    new.paid_at  := old.paid_at;
    new.active   := old.active;
    new.email    := old.email;
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard on profiles;
create trigger profiles_guard before update on profiles
  for each row execute function guard_profile_update();

-- ── Selvbetjent passordreset via favorittklubb ──────────────
create or replace function reset_password_with_club(
  p_email text, p_fav_club text, p_new_password text)
returns text language plpgsql security definer set search_path = public, auth, extensions as $$
declare v_id uuid; v_club text;
begin
  select id, fav_club into v_id, v_club from profiles where email = lower(p_email);
  if v_id is null then return 'Fant ingen bruker med denne e-posten.'; end if;
  if v_club is null or v_club <> p_fav_club then
    return 'Favorittklubben stemmer ikke med det du registrerte.';
  end if;
  if length(coalesce(p_new_password,'')) < 6 then
    return 'Passordet må ha minst 6 tegn.';
  end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = v_id;
  return 'ok';
end $$;

revoke all on function reset_password_with_club(text, text, text) from public;
grant execute on function reset_password_with_club(text, text, text) to anon, authenticated;

-- ── RLS ─────────────────────────────────────────────────────
alter table profiles    enable row level security;
alter table submissions enable row level security;
alter table drafts      enable row level security;
alter table results     enable row level security;
alter table settings    enable row level security;

drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated using (true);

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles for all to authenticated
  using (is_admin()) with check (is_admin());

-- Innleveringer: egen alltid; andres først etter at tippingen er stengt.
drop policy if exists subs_select on submissions;
create policy subs_select on submissions for select to authenticated
  using (user_id = auth.uid() or is_locked() or is_admin());

drop policy if exists subs_insert on submissions;
create policy subs_insert on submissions for insert to authenticated
  with check (user_id = auth.uid() and not is_locked());

drop policy if exists subs_update on submissions;
create policy subs_update on submissions for update to authenticated
  using (user_id = auth.uid() and not is_locked())
  with check (user_id = auth.uid() and not is_locked());

drop policy if exists subs_admin_all on submissions;
create policy subs_admin_all on submissions for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists drafts_own on drafts;
create policy drafts_own on drafts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists results_select on results;
create policy results_select on results for select to authenticated using (true);
drop policy if exists results_write on results;
create policy results_write on results for all to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists settings_select on settings;
create policy settings_select on settings for select to authenticated using (true);
drop policy if exists settings_write on settings;
create policy settings_write on settings for all to authenticated
  using (is_admin()) with check (is_admin());

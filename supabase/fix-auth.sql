-- ============================================================
--  Fiks for "Database error saving new user"
--  Kjør hele filen i Supabase → SQL Editor. Trygg å kjøre flere ganger.
-- ============================================================

-- Sørg for at kolonnene finnes (hvis et eldre skjema ble kjørt)
alter table profiles add column if not exists verified boolean not null default false;
alter table submissions add column if not exists email text;

-- Trigger-en må ALDRI blokkere registrering. Feiler den, logges det som warning.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, fav_club, verified, is_admin)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'fav_club',
    new.email_confirmed_at is not null,
    lower(new.email) = 'j.e.holmen@gmail.com'
  )
  on conflict (id) do update
    set email    = excluded.email,
        name     = case when profiles.name = '' then excluded.name else profiles.name end,
        fav_club = coalesce(profiles.fav_club, excluded.fav_club);
  return new;
exception when others then
  raise warning 'handle_new_user feilet for %: %', new.email, sqlerrm;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Appen kan opprette sin egen profil hvis trigger-en har feilet.
drop policy if exists profiles_insert_self on profiles;
create policy profiles_insert_self on profiles for insert to authenticated
  with check (id = auth.uid());

grant select, insert, update on profiles to authenticated;
grant select, insert, update, delete on submissions, drafts to authenticated;
grant select on results, settings to authenticated;
grant update on results, settings to authenticated;

-- Reparer eventuelle auth-brukere som mangler profil
insert into profiles (id, email, name, fav_club, verified, is_admin)
select u.id, lower(u.email),
       coalesce(u.raw_user_meta_data->>'name',''),
       u.raw_user_meta_data->>'fav_club',
       u.email_confirmed_at is not null,
       lower(u.email) = 'j.e.holmen@gmail.com'
  from auth.users u
  left join profiles p on p.id = u.id
 where p.id is null
on conflict (id) do nothing;

-- Admin-flagget settes uansett
update profiles set is_admin = true where email = 'j.e.holmen@gmail.com';

-- Kontroll: skal vise auth-brukere og profiler side om side
select u.email, u.email_confirmed_at is not null as bekreftet, p.is_admin, p.fav_club
  from auth.users u left join profiles p on p.id = u.id order by u.created_at;

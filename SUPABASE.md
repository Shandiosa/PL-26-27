# Koble appen til Supabase

Appen er ferdig koblet – den bytter datalag automatisk så snart nøklene ligger i
`supabase/config.js`. Er de tomme, kjører alt videre lokalt i nettleseren, som før.

## 1. Opprett prosjekt
1. supabase.com → **New project** (region: Frankfurt/EU, sett et databasepassord).
2. Settings → API: kopier **Project URL** og **anon public** key.

## 2. Kjør skjemaet
SQL Editor → **New query** → lim inn hele `supabase/schema.sql` → **Run**.
Lager tabellene `profiles`, `submissions`, `drafts`, `results`, `settings`, auto-profil
ved registrering, passordreset via favorittklubb, og RLS-policyer.

## 3. Lim inn nøklene
Åpne `supabase/config.js` og fyll inn:

```js
window.SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJ...';
```

Det er alt – ingen andre filer skal endres. (anon-nøkkelen er laget for å ligge i
klienten; RLS er det som beskytter dataene.)

## 4. Auth-innstillinger
- Authentication → Providers → **Email**: på.
- **Confirm email**: på hvis du vil ha e-postverifisering. Av = deltakerne kommer rett inn.
- Authentication → URL Configuration:
  - **Site URL**: `https://<bruker>.github.io/<repo>/`
  - **Redirect URLs**: `https://<bruker>.github.io/<repo>/**` og `http://localhost:8080/**`

## 5. Gjør deg til admin
Registrer deg i appen med admin-e-posten, og kjør så i SQL Editor:

```sql
update profiles set is_admin = true where email = 'j.e.holmen@gmail.com';
```

## 6. Flytt over eksisterende tips (valgfritt)
På en enhet som har tipset ditt lagret lokalt: logg inn i appen, åpne
nettleserkonsollen (F12) og kjør:

```js
await migrateFromLocalStorage()
```

## Hva RLS gir deg
- Deltaker ser og endrer bare sitt eget tips, og bare før frist/låsing.
- Alle tips blir lesbare for alle **etter** at admin har låst tippingen.
- Fasit, låsing og betalingsstatus kan bare skrives av admin.
- En vanlig bruker kan ikke gjøre seg selv til admin eller markere seg som betalt.

## Merk
- **Nytt passord** i adminpanelet sender nå en tilbakestillingslenke på e-post
  i stedet for å vise et midlertidig passord.
- Sletting av bruker fjerner profil og tips. Selve auth-brukeren slettes i
  Supabase → Authentication → Users.

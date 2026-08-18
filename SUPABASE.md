# Koble appen til Supabase

## 1. Opprett prosjekt
1. supabase.com → New project (region: Frankfurt/EU).
2. Kopier **Project URL** og **anon public key** fra Settings → API.

## 2. Kjør skjemaet
SQL Editor → lim inn hele `supabase/schema.sql` → Run.
Dette lager tabellene `profiles`, `submissions`, `drafts`, `results`, `settings`,
en trigger som lager profil ved registrering, og RLS-policyer.

## 3. Auth-innstillinger
- Authentication → Providers → Email: på.
- Confirm email: **på** (e-postverifisering). Slå av hvis du vil sleppe deltakerne rett inn.
- Authentication → URL Configuration → Site URL: adressen til GitHub Pages-siden.

## 4. Sett admin
Etter at du har registrert deg i appen med admin-e-posten:

```sql
update profiles set is_admin = true where email = 'j.e.holmen@gmail.com';
```

## 5. Bytt datalag i appen
I `index.html`, `admin.html`, `leaderboard.html` og `stats.html`:

```html
<!-- erstatt   <script src="store.js"></script>   med: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="supabase/config.js"></script>
<script src="supabase/store.supabase.js"></script>
```

Lag `supabase/config.js` (kopi av `config.example.js`) med dine nøkler.
`anon`-nøkkelen er trygg i klienten – RLS beskytter dataene.

## 6. Async-tilpasning
`store.supabase.js` eksponerer samme funksjonsnavn som `store.js`, men de returnerer
Promise. I komponentene betyr det `await` / `.then()` rundt kallene:

```js
const subs = await getSubmissions();
```

Funksjonene som er rene oppslag (`currentUser`, `getResults`, `getSettings`) leser fra
en cache som fylles av `await initStore()` ved oppstart, slik at eksisterende synkrone
kall i render fortsatt virker. Kall `await initStore()` før `ReactDOM.render`.

## 7. Migrere eksisterende tips
Kjør i konsollen på en enhet som har data i localStorage:

```js
await migrateFromLocalStorage();
```

## Sikkerhet – hva RLS gir deg
- Deltaker ser og endrer bare sin egen innlevering, og bare før frist/låsing.
- Alle innleveringer blir lesbare for alle **etter** at admin har låst tippingen.
- Fasit og innstillinger kan bare skrives av admin.
- Betalingsstatus kan bare settes av admin.

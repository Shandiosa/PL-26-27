# Premier League 26/27 – Tippekonkurranse

Statisk web-app (React via Babel i nettleseren, ingen byggesteg). Kjører i dag helt lokalt
mot `localStorage`, og er strukturert for å kobles på Supabase uten å endre UI-koden.

## Innhold

| Fil | Rolle |
|---|---|
| `index.html` / `app.jsx` | Tippeskjema for deltakere (tabell, opprykk, nedrykk, kåringer) |
| `admin.html` / `admin.jsx` | Adminpanel: fasit, låsing, brukere, betaling, hent tropper |
| `leaderboard.html` / `leaderboard.jsx` | Live stilling |
| `stats.html` / `stats.jsx` | Statistikk over alle innleveringer |
| `store.js` | All datatilgang (auth, innleveringer, fasit, innstillinger) |
| `data.js` | Klubber, managere, frist, admin-e-post, poengregler |
| `players.js` | Spiller- og keeperbase (pr. 13. august 2026) |
| `ui.jsx`, `sortable.jsx`, `styles.css` | Delte komponenter, drag & drop, design |
| `supabase/schema.sql` | Tabeller, indekser og RLS-policyer |
| `supabase/store.supabase.js` | Drop-in erstatning for `store.js` (async) |

## Kjøre lokalt

Åpne ikke filene direkte fra disk (fetch/JSX krever http). Bruk en enkel server:

```bash
npx serve .
# eller
python3 -m http.server 8080
```

## Publisere på GitHub Pages

1. Nytt repo → last opp innholdet i denne mappen (ikke mappen selv).
2. Settings → Pages → Source: `main` / `/ (root)`.
3. Appen ligger på `https://<bruker>.github.io/<repo>/`.

## Konfigurasjon

Rediger i `data.js`:

```js
const DEADLINE   = new Date('2026-08-14T18:00:00');
const ADMIN_EMAIL = 'j.e.holmen@gmail.com';
```

Vipps-QR: bytt `assets/vipps_qr.jpg` med din egen personlige QR.

## Neste steg: Supabase

Se `SUPABASE.md` for full oppkobling (5 minutter).

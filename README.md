# Premier League 26/27 – Tippekonkurranse

Statisk web-app (React via Babel i nettleseren, ingen byggesteg). Fungerer både
lokalt i nettleseren (`localStorage`) og mot Supabase – bytter automatisk basert
på om `supabase/config.js` har nøkler.

## Innhold

| Fil | Rolle |
|---|---|
| `index.html` / `app.jsx` | Tippeskjema for deltakere (tabell, opprykk, nedrykk, kåringer) |
| `admin.html` / `admin.jsx` | Adminpanel: fasit, låsing, brukere, betaling, hent tropper |
| `leaderboard.html` / `leaderboard.jsx` | Live stilling |
| `stats.html` / `stats.jsx` | Statistikk over alle innleveringer |
| `store.js` | Datalag (localStorage) |
| `supabase/store.supabase.js` | Datalag (Supabase) – overtar når nøkler finnes |
| `supabase/schema.sql` | Tabeller, triggere og RLS-policyer |
| `data.js` | Klubber, managere, frist, admin-e-post, poengregler |
| `players.js` | Spiller- og keeperbase (pr. 13. august 2026) |
| `ui.jsx`, `sortable.jsx`, `styles.css` | Delte komponenter, drag & drop, design |

## Kjøre lokalt

Ikke åpne filene direkte fra disk – JSX-lasting krever http:

```bash
npx serve .          # eller: python3 -m http.server 8080
```

## Publisere på GitHub Pages

1. Nytt repo → last opp **innholdet** i denne mappen (ikke mappen selv).
2. Settings → Pages → Source: `main` / `/ (root)`.
3. Appen ligger på `https://<bruker>.github.io/<repo>/`.

## Konfigurasjon

I `data.js`:

```js
const DEADLINE    = new Date('2026-08-14T18:00:00');
const ADMIN_EMAIL = 'j.e.holmen@gmail.com';
```

Vipps-QR: bytt ut `assets/vipps_qr.jpg` med din egen.

## Supabase

Se **SUPABASE.md** – fire steg, ingen kodeendringer.

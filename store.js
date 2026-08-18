// ============================================================
//  Premier League 26/27 – Lagring, auth og innleveringer
//  Prototype: alt lagres lokalt i nettleseren (localStorage).
//  Strukturert slik at en ekte backend (f.eks. Supabase) kan
//  kobles p\u00e5 senere uten \u00e5 endre UI-koden.
// ============================================================

const LS = {
  USERS:    'pl2627_users',        // [{ name, email, pwHash, favClub, active, isAdmin, createdAt, tempPw, verified }]
  SESSION:  'pl2627_session',      // email til innlogget bruker
  SUBS:     'pl2627_submissions',  // [{ email, name, prediction, submittedAt, updatedAt }]
  RESULTS:  'pl2627_results',      // fasit (admin)
  SETTINGS: 'pl2627_settings',     // admin-styrte innstillinger (låsing m.m.)
};

function getSettings() { return lsGet(LS.SETTINGS, { lockOverride: false }); }
function saveSettings(s) { lsSet(LS.SETTINGS, s); }
function setLockOverride(on) { saveSettings({ ...getSettings(), lockOverride: !!on }); }

function lsGet(k, fallback) {
  try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? fallback : v; }
  catch { return fallback; }
}
function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

// ── Lett "hashing" (ikke sikker \u2013 kun for \u00e5 unng\u00e5 klartekst i localStorage) ──
function pwHash(pw) {
  let h = 5381;
  const s = 'pl2627::' + pw;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return 'h' + (h >>> 0).toString(36);
}
function randomPassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 4) + '-' + s.slice(4);
}

// ── Brukere ──────────────────────────────────────────────────
function getUsers()  { return lsGet(LS.USERS, []); }
function saveUsers(u) { lsSet(LS.USERS, u); }
function findUser(email) {
  if (!email) return null;
  return getUsers().find(u => u.email === email.trim().toLowerCase()) || null;
}

function registerUser({ name, email, password, favClub }) {
  email = (email || '').trim().toLowerCase();
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    return { ok: false, error: 'Det finnes allerede en bruker med denne e-posten.' };
  }
  const isFirst = users.length === 0; // f\u00f8rste bruker blir admin
  const user = {
    name: (name || '').trim(),
    email,
    pwHash: pwHash(password),
    favClub: favClub || null,
    active: true,
    isAdmin: email === ADMIN_EMAIL,
    createdAt: new Date().toISOString(),
    tempPw: null,
    verified: email === ADMIN_EMAIL,
  };
  users.push(user);
  saveUsers(users);
  lsSet(LS.SESSION, email);
  return { ok: true, user };
}

function loginUser({ email, password }) {
  email = (email || '').trim().toLowerCase();
  let user = findUser(email);
  // Admin-kontoen finnes alltid: hvis den ikke er opprettet ennå,
  // "claimes" den ved første innlogging – passordet du skriver inn blir admin-passordet.
  if (!user && email === ADMIN_EMAIL) {
    if ((password || '').length < 4) {
      return { ok: false, error: 'Velg et admin-passord på minst 4 tegn (settes ved første innlogging).' };
    }
    user = {
      name: 'Jan Erlend Holmen',
      email,
      pwHash: pwHash(password),
      favClub: null,
      active: true,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      tempPw: null,
    };
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    lsSet(LS.SESSION, email);
    return { ok: true, user };
  }
  if (!user) return { ok: false, error: 'Fant ingen bruker med denne e-posten.' };
  if (!user.active) return { ok: false, error: 'Denne kontoen er deaktivert. Kontakt administrator.' };
  if (user.pwHash !== pwHash(password)) return { ok: false, error: 'Feil passord.' };
  lsSet(LS.SESSION, email);
  return { ok: true, user };
}

function logout() { localStorage.removeItem(LS.SESSION); }
function currentUser() { return findUser(lsGet(LS.SESSION, null)); }

function updateUser(email, patch) {
  const users = getUsers();
  const i = users.findIndex(u => u.email === email);
  if (i < 0) return null;
  users[i] = { ...users[i], ...patch };
  saveUsers(users);
  return users[i];
}

function changePassword(email, newPassword) {
  return updateUser(email, { pwHash: pwHash(newPassword), tempPw: null });
}

// Admin: generer nytt midlertidig passord (vises i panelet)
function adminResetPassword(email) {
  const pw = randomPassword();
  updateUser(email, { pwHash: pwHash(pw), tempPw: pw });
  return pw;
}
function adminSetActive(email, active) { return updateUser(email, { active }); }
function adminSetAdmin(email, isAdmin) { return updateUser(email, { isAdmin }); }
function adminSetVerified(email, verified) { return updateUser(email, { verified }); }

// Selvbetjent épassordreset – uten e-post, verifiseres via favorittklubb valgt ved registrering.
function resetPasswordWithSecurity({ email, favClub, newPassword }) {
  const user = findUser(email);
  if (!user) return { ok:false, error:'Fant ingen bruker med denne e-posten.' };
  if (!user.favClub || user.favClub !== favClub) return { ok:false, error:'Favorittklubben stemmer ikke med det du registrerte.' };
  if ((newPassword||'').length < 4) return { ok:false, error:'Passordet må ha minst 4 tegn.' };
  changePassword(user.email, newPassword);
  return { ok:true };
}
// Betaling (kr. 50,- deltakeravgift)
function setPaid(email, paid) {
  return updateUser(email, { paid: !!paid, paidAt: paid ? new Date().toISOString() : null });
}
function hasPaid(email) {
  if (!email) return false;
  if (email === ADMIN_EMAIL) return true;
  return !!findUser(email)?.paid;
}
function adminDeleteUser(email) {
  saveUsers(getUsers().filter(u => u.email !== email));
  // fjern ogs\u00e5 innlevering
  lsSet(LS.SUBS, getSubmissions().filter(s => s.email !== email));
}

// ── Innleveringer ────────────────────────────────────────────
function getSubmissions() { return lsGet(LS.SUBS, []); }
function getSubmission(email) { return getSubmissions().find(s => s.email === email) || null; }

function saveSubmission(email, name, prediction) {
  const subs = getSubmissions();
  const i = subs.findIndex(s => s.email === email);
  const now = new Date().toISOString();
  if (i >= 0) {
    subs[i] = { ...subs[i], name, prediction, updatedAt: now };
  } else {
    subs.push({ email, name, prediction, submittedAt: now, updatedAt: now });
  }
  lsSet(LS.SUBS, subs);
  return subs;
}

// Lagre kladd (ikke endelig innlevering) per bruker
function draftKey(email) { return 'pl2627_draft_' + email; }
function getDraft(email) { return lsGet(draftKey(email), null); }
function saveDraft(email, prediction) { lsSet(draftKey(email), prediction); }

// ── Fasit / resultater (admin) ───────────────────────────────
function getResults() {
  return lsGet(LS.RESULTS, {
    plOrder: [], promotion: [],
    awards: { scorer:'', assist:'', cards:'', player:'', redcard:'', keeper:'', leader3:'', firstfired:'' },
    published: { table:false, promotion:false, scorer:false, assist:false, cards:false, player:false, redcard:false, keeper:false, leader3:false, firstfired:false },
    snapshot: { active:false, note:'' },
  });
}
function saveResults(r) { lsSet(LS.RESULTS, r); }

function isPastDeadline() { return getSettings().lockOverride || new Date() > DEADLINE; }

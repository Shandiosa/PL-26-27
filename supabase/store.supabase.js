// ============================================================
//  store.supabase.js – Supabase-datalag
//  Drop-in erstatning for store.js. Samme funksjonsnavn, men
//  asynkront. Kall  await initStore()  før appen rendres; da er
//  bruker, fasit og innstillinger cachet slik at synkrone
//  oppslag i render fortsatt virker.
//  Krever: supabase-js UMD + supabase/config.js lastet først.
// ============================================================

const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const cache = { user: null, results: null, settings: null, users: [], subs: [] };

async function initStore() {
  const { data } = await sb.auth.getSession();
  if (data.session) await refreshUser();
  await Promise.all([refreshResults(), refreshSettings()]);
  sb.auth.onAuthStateChange(() => refreshUser());
  return cache;
}

// ── Auth ────────────────────────────────────────────────────
async function registerUser({ name, email, password, favClub }) {
  const { error } = await sb.auth.signUp({
    email: (email || '').trim().toLowerCase(),
    password,
    options: { data: { name: (name || '').trim(), fav_club: favClub || null } },
  });
  if (error) return { ok: false, error: error.message };
  await refreshUser();
  return { ok: true, user: cache.user, needsVerification: !cache.user };
}

async function loginUser({ email, password }) {
  const { error } = await sb.auth.signInWithPassword({
    email: (email || '').trim().toLowerCase(), password,
  });
  if (error) return { ok: false, error: 'Feil e-post eller passord.' };
  const user = await refreshUser();
  if (user && !user.active) { await logout(); return { ok: false, error: 'Kontoen er deaktivert.' }; }
  return { ok: true, user };
}

async function logout() { cache.user = null; await sb.auth.signOut(); }
function currentUser() { return cache.user; }

async function refreshUser() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { cache.user = null; return null; }
  const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
  cache.user = p ? {
    id: p.id, name: p.name, email: p.email, favClub: p.fav_club,
    isAdmin: p.is_admin, active: p.active, paid: p.paid, paidAt: p.paid_at,
    createdAt: p.created_at, verified: !!user.email_confirmed_at,
  } : null;
  return cache.user;
}

// Passordreset via e-post (Supabase sender lenken).
async function requestPasswordReset(email) {
  const { error } = await sb.auth.resetPasswordForEmail((email || '').trim().toLowerCase(),
    { redirectTo: location.origin + location.pathname });
  return error ? { ok: false, error: error.message } : { ok: true };
}
async function changePassword(_email, newPassword) {
  const { error } = await sb.auth.updateUser({ password: newPassword });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── Brukere (admin) ─────────────────────────────────────────
async function getUsers() {
  const { data } = await sb.from('profiles').select('*').order('created_at');
  cache.users = (data || []).map(p => ({
    id: p.id, name: p.name, email: p.email, favClub: p.fav_club,
    isAdmin: p.is_admin, active: p.active, paid: p.paid, paidAt: p.paid_at,
    createdAt: p.created_at,
  }));
  return cache.users;
}
async function findUser(email) {
  const { data } = await sb.from('profiles').select('*')
    .eq('email', (email || '').trim().toLowerCase()).maybeSingle();
  return data;
}
async function updateUser(id, patch) {
  const map = { name:'name', favClub:'fav_club', isAdmin:'is_admin', active:'active', paid:'paid', paidAt:'paid_at' };
  const row = {};
  for (const k in patch) if (map[k]) row[map[k]] = patch[k];
  const { data, error } = await sb.from('profiles').update(row).eq('id', id).select().single();
  return error ? null : data;
}
const adminSetActive   = (id, active)  => updateUser(id, { active });
const adminSetAdmin    = (id, isAdmin) => updateUser(id, { isAdmin });
const setPaid          = (id, paid)    => updateUser(id, { paid, paidAt: paid ? new Date().toISOString() : null });
async function adminDeleteUser(id) {
  // Sletter profil + innlevering. auth-brukeren slettes i Supabase-dashbordet
  // (eller via en Edge Function med service_role-nøkkel).
  await sb.from('submissions').delete().eq('user_id', id);
  await sb.from('profiles').delete().eq('id', id);
}
function hasPaid(user) { return !!(user && (user.isAdmin || user.paid)); }

// ── Innleveringer ───────────────────────────────────────────
async function getSubmissions() {
  const { data } = await sb.from('submissions')
    .select('user_id, name, prediction, submitted_at, updated_at, profiles(email)');
  cache.subs = (data || []).map(s => ({
    userId: s.user_id, email: s.profiles?.email, name: s.name,
    prediction: s.prediction, submittedAt: s.submitted_at, updatedAt: s.updated_at,
  }));
  return cache.subs;
}
async function getSubmission(userId) {
  const { data } = await sb.from('submissions').select('*').eq('user_id', userId).maybeSingle();
  return data ? { userId: data.user_id, name: data.name, prediction: data.prediction,
                  submittedAt: data.submitted_at, updatedAt: data.updated_at } : null;
}
async function saveSubmission(userId, name, prediction) {
  const { error } = await sb.from('submissions').upsert({
    user_id: userId, name, prediction, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── Kladd ───────────────────────────────────────────────────
async function getDraft(userId) {
  const { data } = await sb.from('drafts').select('prediction').eq('user_id', userId).maybeSingle();
  return data?.prediction || null;
}
async function saveDraft(userId, prediction) {
  await sb.from('drafts').upsert({ user_id: userId, prediction,
    updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

// ── Fasit ───────────────────────────────────────────────────
function getResults() { return cache.results; }
async function refreshResults() {
  const { data } = await sb.from('results').select('*').eq('id', 1).single();
  cache.results = data ? {
    plOrder: data.pl_order || [], promotion: data.promotion || [],
    awards: data.awards || {}, published: data.published || {},
    snapshot: data.snapshot || { active: false, note: '' },
  } : null;
  return cache.results;
}
async function saveResults(r) {
  const { error } = await sb.from('results').update({
    pl_order: r.plOrder, promotion: r.promotion, awards: r.awards,
    published: r.published, snapshot: r.snapshot, updated_at: new Date().toISOString(),
  }).eq('id', 1);
  if (!error) cache.results = r;
  return { ok: !error, error: error?.message };
}

// ── Innstillinger / låsing ──────────────────────────────────
function getSettings() { return cache.settings || { lockOverride: false, deadline: null }; }
async function refreshSettings() {
  const { data } = await sb.from('settings').select('*').eq('id', 1).single();
  cache.settings = data ? { lockOverride: data.lock_override, deadline: data.deadline } : null;
  return cache.settings;
}
async function setLockOverride(on) {
  const { error } = await sb.from('settings')
    .update({ lock_override: !!on, updated_at: new Date().toISOString() }).eq('id', 1);
  if (!error) await refreshSettings();
  return { ok: !error };
}
function isPastDeadline() {
  const s = getSettings();
  if (s.lockOverride) return true;
  const dl = s.deadline ? new Date(s.deadline) : (typeof DEADLINE !== 'undefined' ? DEADLINE : null);
  return dl ? new Date() > dl : false;
}

// ── Live oppdatering (erstatter 10-sekunders polling) ───────
function subscribeLive(onChange) {
  return sb.channel('pl2627')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, async () => {
      await refreshResults(); onChange();
    })
    .subscribe();
}

// ── Migrering fra localStorage ──────────────────────────────
async function migrateFromLocalStorage() {
  const user = currentUser();
  if (!user) throw new Error('Logg inn først.');
  const subs = JSON.parse(localStorage.getItem('pl2627_submissions') || '[]');
  const mine = subs.find(s => s.email === user.email);
  if (mine) await saveSubmission(user.id, mine.name, mine.prediction);
  if (user.isAdmin) {
    const res = JSON.parse(localStorage.getItem('pl2627_results') || 'null');
    if (res) await saveResults(res);
  }
  return { migratedSubmission: !!mine };
}

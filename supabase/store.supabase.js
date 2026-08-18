// ============================================================
//  store.supabase.js – Supabase-datalag
//  Lastes ETTER store.js. Overtar bare hvis supabase/config.js
//  har satt SUPABASE_URL. Beholder det synkrone API-et fra
//  store.js ved å holde en cache som fylles av initStore() og
//  oppdateres hvert 10. sekund + optimistisk ved skriving.
// ============================================================
(function () {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.info('[store] Supabase ikke konfigurert – bruker localStorage.');
    return;
  }
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  window.sb = sb;

  const EMPTY_RESULTS = {
    plOrder: [], promotion: [],
    awards: { scorer:'', assist:'', cards:'', player:'', redcard:'', keeper:'', leader3:'', firstfired:'' },
    published: { table:false, promotion:false, scorer:false, assist:false, cards:false, player:false, redcard:false, keeper:false, leader3:false, firstfired:false },
    snapshot: { active:false, note:'' },
  };

  const C = { me:null, users:[], subs:[], drafts:{}, results:EMPTY_RESULTS, settings:{ lockOverride:false, deadline:null } };
  const idOf = (email) => {
    const e = (email || '').trim().toLowerCase();
    if (C.me && C.me.email === e) return C.me.id;
    return (C.users.find(u => u.email === e) || {}).id || null;
  };
  const mapProfile = (p) => ({
    id:p.id, name:p.name || '', email:p.email, favClub:p.fav_club,
    isAdmin:!!p.is_admin, active:p.active !== false, paid:!!p.paid, paidAt:p.paid_at,
    verified:!!p.verified, createdAt:p.created_at, tempPw:null,
  });

  // ── Refresh ───────────────────────────────────────────────
  async function refreshMe() {
    const { data:{ user } } = await sb.auth.getUser();
    if (!user) { C.me = null; return null; }
    let { data:p } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    // Selv-reparasjon: mangler profilraden (trigger feilet), lager vi den her.
    if (!p) {
      const md = user.user_metadata || {};
      const ins = await sb.from('profiles').insert({
        id: user.id, email: (user.email || '').toLowerCase(),
        name: md.name || '', fav_club: md.fav_club || null,
        verified: !!user.email_confirmed_at,
      }).select().maybeSingle();
      p = ins.data;
      if (ins.error) console.error('[store] kunne ikke opprette profil', ins.error.message);
    }
    C.me = p ? { ...mapProfile(p), verified: !!user.email_confirmed_at || !!p.verified } : null;
    return C.me;
  }
  async function refreshUsers() {
    const { data } = await sb.from('profiles').select('*').order('created_at');
    if (data) C.users = data.map(mapProfile);
    return C.users;
  }
  async function refreshSubs() {
    const { data } = await sb.from('submissions')
      .select('user_id, email, name, prediction, submitted_at, updated_at');
    if (data) C.subs = data.map(s => ({
      userId:s.user_id, email:s.email, name:s.name,
      prediction:s.prediction, submittedAt:s.submitted_at, updatedAt:s.updated_at,
    }));
    return C.subs;
  }
  async function refreshResults() {
    const { data } = await sb.from('results').select('*').eq('id', 1).maybeSingle();
    if (data) C.results = {
      plOrder:data.pl_order || [], promotion:data.promotion || [],
      awards:{ ...EMPTY_RESULTS.awards, ...(data.awards || {}) },
      published:{ ...EMPTY_RESULTS.published, ...(data.published || {}) },
      snapshot:data.snapshot || { active:false, note:'' },
    };
    return C.results;
  }
  async function refreshSettings() {
    const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
    if (data) C.settings = { lockOverride:!!data.lock_override, deadline:data.deadline };
    return C.settings;
  }
  async function refreshAll() {
    await Promise.all([refreshUsers(), refreshSubs(), refreshResults(), refreshSettings()]);
    window.dispatchEvent(new Event('pl-data'));
  }

  async function initStore() {
    await refreshMe();
    await refreshAll();
    if (C.me) {
      const { data } = await sb.from('drafts').select('prediction').eq('user_id', C.me.id).maybeSingle();
      if (data) C.drafts[C.me.email] = data.prediction;
    }
    sb.auth.onAuthStateChange(() => { refreshMe(); });
    setInterval(refreshAll, 10000);
  }
  // Appen kaller bootStore(render) i stedet for å rendre direkte.
  window.bootStore = async function (render) {
    try { await initStore(); }
    catch (e) { console.error('[store] init feilet', e); }
    render();
  };

  // ── Auth ──────────────────────────────────────────────────
  async function registerUser({ name, email, password, favClub }) {
    email = (email || '').trim().toLowerCase();
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { name:(name || '').trim(), fav_club: favClub || null } },
    });
    if (error) return { ok:false, error: error.message.match(/already/i)
      ? 'Det finnes allerede en bruker med denne e-posten.' : error.message };
    if (!data.session) return { ok:false, error:'Sjekk e-posten din og bekreft adressen – så kan du logge inn.' };
    const user = await refreshMe();
    await refreshAll();
    return user ? { ok:true, user } : { ok:false, error:'Kontoen ble opprettet, men profilen mangler. Logg inn på nytt.' };
  }

  async function loginUser({ email, password }) {
    email = (email || '').trim().toLowerCase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok:false, error: /confirm/i.test(error.message)
      ? 'E-posten er ikke bekreftet ennå – sjekk innboksen.' : 'Feil e-post eller passord.' };
    const user = await refreshMe();
    if (!user) return { ok:false, error:'Fant ingen profil for denne kontoen.' };
    if (!user.active) { await sb.auth.signOut(); C.me = null; return { ok:false, error:'Denne kontoen er deaktivert. Kontakt administrator.' }; }
    await refreshAll();
    return { ok:true, user };
  }

  function logout() { C.me = null; sb.auth.signOut(); }
  function currentUser() { return C.me; }
  function findUser(email) {
    const e = (email || '').trim().toLowerCase();
    if (C.me && C.me.email === e) return C.me;
    return C.users.find(u => u.email === e) || null;
  }
  let usersAt = 0;
  function getUsers() {
    if (Date.now() - usersAt > 2000) { usersAt = Date.now(); refreshUsers(); }
    return C.users;
  }

  function updateUser(email, patch) {
    const id = idOf(email);
    if (!id) return null;
    const map = { name:'name', favClub:'fav_club', isAdmin:'is_admin', active:'active', paid:'paid', paidAt:'paid_at', verified:'verified' };
    const row = {};
    for (const k in patch) if (map[k]) row[map[k]] = patch[k];
    // optimistisk oppdatering av cache
    const i = C.users.findIndex(u => u.id === id);
    if (i >= 0) C.users[i] = { ...C.users[i], ...patch };
    if (C.me && C.me.id === id) C.me = { ...C.me, ...patch };
    sb.from('profiles').update(row).eq('id', id).then(refreshUsers);
    return i >= 0 ? C.users[i] : null;
  }
  const adminSetActive   = (email, active)   => updateUser(email, { active });
  const adminSetAdmin    = (email, isAdmin)  => updateUser(email, { isAdmin });
  const adminSetVerified = (email, verified) => updateUser(email, { verified });
  const setPaid = (email, paid) => updateUser(email, { paid:!!paid, paidAt: paid ? new Date().toISOString() : null });
  function hasPaid(email) {
    if (!email) return false;
    if (email === (typeof ADMIN_EMAIL !== 'undefined' ? ADMIN_EMAIL : null)) return true;
    return !!(findUser(email) || {}).paid;
  }
  function adminDeleteUser(email) {
    const id = idOf(email);
    if (!id) return;
    C.users = C.users.filter(u => u.id !== id);
    C.subs  = C.subs.filter(s => s.userId !== id);
    sb.from('submissions').delete().eq('user_id', id)
      .then(() => sb.from('profiles').delete().eq('id', id))
      .then(refreshAll);
  }
  // Passordreset: Supabase sender e-post med lenke (kan ikke settes av admin fra klienten).
  function adminResetPassword(email) {
    sb.auth.resetPasswordForEmail((email || '').trim().toLowerCase(),
      { redirectTo: location.origin + location.pathname });
    return 'e-post sendt';
  }
  function changePassword(_email, newPassword) {
    sb.auth.updateUser({ password:newPassword });
    return C.me;
  }
  // Selvbetjent reset via favorittklubb: verifiseres server-side i en RPC.
  async function resetPasswordWithSecurity({ email, favClub, newPassword }) {
    const { data, error } = await sb.rpc('reset_password_with_club', {
      p_email:(email || '').trim().toLowerCase(), p_fav_club:favClub, p_new_password:newPassword,
    });
    if (error) return { ok:false, error: error.message };
    if (data !== 'ok') return { ok:false, error: data };
    return { ok:true };
  }

  // ── Innleveringer ─────────────────────────────────────────
  function getSubmissions() { return C.subs; }
  function getSubmission(email) {
    const e = (email || '').trim().toLowerCase();
    return C.subs.find(s => s.email === e) || null;
  }
  function saveSubmission(email, name, prediction) {
    const id = idOf(email);
    if (!id) return C.subs;
    const e = (email || '').trim().toLowerCase();
    const now = new Date().toISOString();
    const i = C.subs.findIndex(s => s.email === e);
    if (i >= 0) C.subs[i] = { ...C.subs[i], name, prediction, updatedAt:now };
    else C.subs.push({ userId:id, email:e, name, prediction, submittedAt:now, updatedAt:now });
    sb.from('submissions').upsert({ user_id:id, email:e, name, prediction, updated_at:now },
      { onConflict:'user_id' }).then(refreshSubs);
    return C.subs;
  }

  // ── Kladd ─────────────────────────────────────────────────
  function getDraft(email) { return C.drafts[(email || '').trim().toLowerCase()] || null; }
  let draftTimer = null;
  function saveDraft(email, prediction) {
    const e = (email || '').trim().toLowerCase();
    C.drafts[e] = prediction;
    const id = idOf(e);
    if (!id) return;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      sb.from('drafts').upsert({ user_id:id, prediction, updated_at:new Date().toISOString() },
        { onConflict:'user_id' });
    }, 800);
  }

  // ── Fasit ─────────────────────────────────────────────────
  function getResults() { return C.results; }
  function saveResults(r) {
    C.results = r;
    sb.from('results').update({
      pl_order:r.plOrder, promotion:r.promotion, awards:r.awards,
      published:r.published, snapshot:r.snapshot, updated_at:new Date().toISOString(),
    }).eq('id', 1).then(refreshResults);
    return r;
  }

  // ── Innstillinger / låsing ────────────────────────────────
  function getSettings() { return C.settings; }
  function setLockOverride(on) {
    C.settings = { ...C.settings, lockOverride:!!on };
    sb.from('settings').update({ lock_override:!!on, updated_at:new Date().toISOString() })
      .eq('id', 1).then(refreshSettings);
  }
  function isPastDeadline() {
    if (C.settings.lockOverride) return true;
    const dl = C.settings.deadline ? new Date(C.settings.deadline)
      : (typeof DEADLINE !== 'undefined' ? DEADLINE : null);
    return dl ? new Date() > dl : false;
  }

  // ── Migrering fra localStorage (kjøres i konsollen) ────────
  async function migrateFromLocalStorage() {
    if (!C.me) throw new Error('Logg inn først.');
    const subs = JSON.parse(localStorage.getItem('pl2627_submissions') || '[]');
    const mine = subs.find(s => s.email === C.me.email);
    if (mine) saveSubmission(C.me.email, mine.name, mine.prediction);
    if (C.me.isAdmin) {
      const res = JSON.parse(localStorage.getItem('pl2627_results') || 'null');
      if (res) saveResults(res);
    }
    return { migrertTips:!!mine };
  }

  Object.assign(window, {
    initStore, refreshAll, migrateFromLocalStorage,
    registerUser, loginUser, logout, currentUser, findUser, getUsers, updateUser,
    adminSetActive, adminSetAdmin, adminSetVerified, setPaid, hasPaid,
    adminDeleteUser, adminResetPassword, changePassword, resetPasswordWithSecurity,
    getSubmissions, getSubmission, saveSubmission,
    getDraft, saveDraft, getResults, saveResults,
    getSettings, setLockOverride, isPastDeadline,
  });
  console.info('[store] Supabase aktivt.');
})();

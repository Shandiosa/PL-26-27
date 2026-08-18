// ============================================================
//  Tabelltippen – Adminpanel
//  Tilgang: KUN j.e.holmen@gmail.com (ADMIN_EMAIL fra data.js)
// ============================================================
const { useState, useEffect } = React;
const PL_CODES_A = PL_TEAMS.map(t => t.code);

const ALL_AWARDS = [
  ['scorer',    '⚽', 'Toppscorer',             'player'],
  ['assist',    '🅰️', 'Flest assist',            'player'],
  ['cards',     '🟨', 'Flest kortpoeng',          'player'],
  ['player',    '⭐', 'Årets Spiller',           'player'],
  ['redcard',   '🟥', 'Første røde kort',        'player'],
  ['keeper',    '🧤', 'Flest clean sheets (min. 60 min.)', 'keeper'],
  ['leader3',   '🔝', 'Leder etter 3 runder',    'team'],
  ['firstfired','🚪', 'Første manager sparket',  'manager'],
];

function awardDispAdmin(key, val) {
  if (!val) return '–';
  if (key === 'leader3') return (typeof team==='function'&&team(val)?.name)||val;
  return val;
}

// ── UsersTab ─────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState(getUsers());
  const [temp, setTemp] = useState({});
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const reload = () => setUsers(getUsers());

  function reset(email) { const pw = adminResetPassword(email); setTemp(t=>({...t,[email]:pw})); reload(); }
  function toggleActive(u) { adminSetActive(u.email, !u.active); reload(); }
  function togglePaid(u) { setPaid(u.email, !u.paid); reload(); }
  function del(u) {
    if (!confirm(`Slette ${u.name||u.email}? Fjerner også tippet.`)) return;
    adminDeleteUser(u.email); reload();
  }
  function startEdit(u) { setEditing(u.email); setEditName(u.name||''); }
  function saveEdit() {
    if (!editName.trim()) return;
    updateUser(editing, { name: editName.trim() });
    setEditing(null); reload();
  }

  return (
    <div>
      <div className="lb-stats" style={{marginTop:0}}>
        <div className="lb-stat"><div className="n">{users.length}</div><div className="l">Brukere</div></div>
        <div className="lb-stat"><div className="n">{users.filter(u=>u.paid||u.email===ADMIN_EMAIL).length}</div><div className="l">Betalt</div></div>
        <div className="lb-stat"><div className="n">{getSubmissions().length}</div><div className="l">Levert tipp</div></div>
      </div>
      <div className="banner info" style={{marginTop:10,fontSize:12.5}}>
        💰 Premiepott: <b style={{color:'var(--acc)'}}>kr. {users.filter(u=>u.paid&&u.email!==ADMIN_EMAIL).length * 50},-</b>
        <span className="muted" style={{marginLeft:6}}>
          ({users.filter(u=>!u.paid&&u.email!==ADMIN_EMAIL).length} mangler betaling)
        </span>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>{
          const rows=[['Navn','E-post','Betalt','Bekreftet','Levert','Aktiv']];
          users.forEach(u=>rows.push([u.name||'',u.email,u.paid?'Ja':'Nei',u.verified?'Ja':'Nei',getSubmission(u.email)?'Ja':'Nei',u.active?'Ja':'Nei']));
          const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
          const a=document.createElement('a');
          a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
          a.download='brukere.csv'; a.click();
        }}>📥 CSV (brukere)</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:12}}>
        {users.length===0 && <div className="empty">Ingen registrerte brukere ennå.</div>}
        {users.map(u => (
          <div key={u.email} className={`urow ${u.active?'':'off'}`} style={{flexWrap:'wrap',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:12,width:'100%'}}>
              <span className="uava">{(u.name||'?').charAt(0).toUpperCase()}</span>
              <div className="uinfo">
                {editing===u.email
                  ? <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <input className="input" value={editName} onChange={e=>setEditName(e.target.value)}
                        style={{flex:1,padding:'7px 10px',fontSize:14}} autoFocus
                        onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape')setEditing(null);}} />
                      <button className="ubtn" onClick={saveEdit}>Lagre</button>
                      <button className="ubtn" onClick={()=>setEditing(null)}>Avbryt</button>
                    </div>
                  : <div className="uname">{u.name||'(uten navn)'}
                      {u.email===ADMIN_EMAIL && <span className="pill admin">Admin</span>}
                      {!u.active && <span className="pill off">Deaktivert</span>}
                      {u.email!==ADMIN_EMAIL && !u.verified && <span className="pill off">Ubekreftet e-post</span>}
                      {u.email!==ADMIN_EMAIL && (u.paid
                        ? <span className="pill ok">✓ Betalt</span>
                        : <span className="pill off">Ikke betalt</span>)}
                      {getSubmission(u.email) && <span className="pill ok">Levert</span>}
                    </div>}
                <div className="uemail">{u.email}</div>
              </div>
            </div>
            {editing!==u.email && (
              <div className="uactions" style={{width:'100%'}}>
                {u.email!==ADMIN_EMAIL && <button className="ubtn" onClick={()=>togglePaid(u)}>{u.paid?'↩ Angre betalt':'💰 Marker betalt'}</button>}
                {u.email!==ADMIN_EMAIL && !u.verified && <button className="ubtn" onClick={()=>{adminSetVerified(u.email,true);reload();}}>✓ Bekreft e-post</button>}
                <button className="ubtn" onClick={()=>startEdit(u)}>✏ Navn</button>
                <button className="ubtn" onClick={()=>reset(u.email)}>🔑 Nytt passord</button>
                <button className="ubtn" onClick={()=>toggleActive(u)}>{u.active?'⏸ Deaktiver':'▶ Aktiver'}</button>
                {u.email!==ADMIN_EMAIL && <button className="ubtn danger" onClick={()=>del(u)}>🗑 Slett</button>}
              </div>
            )}
            {temp[u.email] && editing!==u.email && (
              <div className="temp-pw" style={{width:'100%'}}>
                Nytt passord: <code>{temp[u.email]}</code>
                <button className="ubtn" onClick={()=>{ try{navigator.clipboard.writeText(temp[u.email]);}catch(e){} }}>Kopier</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SubsTab ───────────────────────────────────────────────────
function SubsTab() {
  const results = getResults();
  const live = results.published && Object.values(results.published).some(Boolean);
  const [open, setOpen] = useState(null);
  const subs = getSubmissions()
    .map(s=>({...s, bd:breakdownScore(s.prediction,results)}))
    .sort((a,b)=>live?b.bd.total-a.bd.total:(a.name||'').localeCompare(b.name||'','no'));

  function exportCSV() {
    const hdrs = ['Navn','E-post','Levert','Poeng','Vinnertips',...ALL_AWARDS.map(([_,__,l])=>l)];
    const rows = [hdrs];
    subs.forEach(s=>{
      const p=s.prediction;
      rows.push([s.name,s.email,s.submittedAt||'',s.bd.total,
        (typeof team==='function'&&team(p.plOrder?.[0])?.name)||'',
        ...ALL_AWARDS.map(([k])=>k==='leader3'?(typeof team==='function'&&team(p.awards?.[k])?.name)||p.awards?.[k]||'':p.awards?.[k]||'')
      ]);
    });
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));
    a.download='tabelltippen.csv'; a.click();
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div className="muted">{subs.length} innleveringer</div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 CSV</button>
      </div>
      {subs.length===0 && <div className="empty">Ingen innleveringer ennå.</div>}
      <div className="lb-list">
        {subs.map((s,i)=>(
          <div key={s.email}>
            <button className="lb-row" onClick={()=>setOpen(open===s.email?null:s.email)}>
              <span className="lb-rank">{i+1}</span>
              <span className="uava" style={{width:34,height:34}}>{(s.name||'?').charAt(0).toUpperCase()}</span>
              <span className="lb-who"><span className="lb-name">{s.name}</span><span className="lb-meta">{s.email}</span></span>
              <span className="lb-score">{live?s.bd.total:'–'}<span className="lbl">poeng</span></span>
            </button>
            {open===s.email && (
              <div className="lb-detail">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px 14px',marginBottom:10}}>
                  {s.prediction.plOrder?.map((c,idx)=>(
                    <div key={c} style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5}}>
                      <span style={{width:16,color:'var(--txt3)',fontWeight:800,fontFamily:'Archivo'}}>{idx+1}</span>
                      <ClubBadge code={c} size={16} radius={4} /><span style={{color:'var(--txt2)'}}>{(typeof team==='function'&&team(c)?.short)||c}</span>
                    </div>
                  ))}
                </div>
                <div className="bd-row"><span>Opprykk</span><span className="v">{s.prediction.promotion?.map(c=>(typeof team==='function'&&team(c)?.short)||c).join(', ')||'–'}</span></div>
                {ALL_AWARDS.map(([k,e,l])=>(
                  <div className="bd-row" key={k}>
                    <span>{e} {l}</span>
                    <span className="v">{awardDispAdmin(k, s.prediction.awards?.[k])}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ResultsTab ────────────────────────────────────────────────
function PubBtn({ on, onClick, label }) {
  return <button className={`toggle-pub ${on?'on':''}`} onClick={onClick}>{on?`✓ ${label||'Publisert'}`:(label||'Publiser')}</button>;
}

// Kobling til football-data.org (gratis API-nøkkel) for å hente inn PL-tabellen automatisk.
const FD_KEY_LS = 'pl2627_fd_apikey';
const FD_NAME_TO_CODE = {
  'Arsenal FC':'ARS','Aston Villa FC':'AVL','AFC Bournemouth':'BOU','Brentford FC':'BRE','Brighton & Hove Albion FC':'BHA',
  'Chelsea FC':'CHE','Coventry City FC':'COV','Crystal Palace FC':'CRY','Everton FC':'EVE','Fulham FC':'FUL',
  'Hull City AFC':'HUL','Ipswich Town FC':'IPS','Leeds United FC':'LEE','Liverpool FC':'LIV','Manchester City FC':'MCI',
  'Manchester United FC':'MUN','Newcastle United FC':'NEW','Nottingham Forest FC':'NFO','Sunderland AFC':'SUN','Tottenham Hotspur FC':'TOT',
};
function fdCodeFor(name) {
  if (FD_NAME_TO_CODE[name]) return FD_NAME_TO_CODE[name];
  const hit = PL_TEAMS.find(t => name && (name.includes(t.name) || t.name.includes(name.replace(/ FC$| AFC$/,''))));
  return hit ? hit.code : null;
}

function FetchStandings({ onFetched }) {
  const [key, setKey] = useState(()=>localStorage.getItem(FD_KEY_LS)||'');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function run() {
    if (!key.trim()) { setMsg('⚠ Lim inn en gratis API-nøkkel fra football-data.org først.'); return; }
    localStorage.setItem(FD_KEY_LS, key.trim());
    setBusy(true); setMsg('');
    try {
      const r = await fetch('https://api.football-data.org/v4/competitions/PL/standings', { headers:{ 'X-Auth-Token': key.trim() } });
      if (!r.ok) throw new Error('API svarte ' + r.status);
      const data = await r.json();
      const table = data?.standings?.find(s=>s.type==='TOTAL')?.table || [];
      const order = table.map(row => fdCodeFor(row.team.name)).filter(Boolean);
      if (order.length !== 20) { setMsg(`⚠ Fant kun ${order.length}/20 lag – navnematch feilet for noen. Sjekk manuelt.`); }
      else setMsg('✓ Tabell hentet og fylt inn – husk å publisere.');
      if (order.length) onFetched(order);
    } catch (e) {
      setMsg('⚠ Klarte ikke å hente tabell: ' + e.message + ' (krever nettverkstilgang og gyldig nøkkel)');
    }
    setBusy(false);
  }
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:13,padding:14,marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:800,color:'var(--txt2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>
        Hent tabell automatisk (football-data.org)
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input className="input" style={{flex:1,minWidth:180}} value={key} onChange={e=>setKey(e.target.value)} placeholder="API-nøkkel (gratis på football-data.org)" />
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={run}>{busy?'Henter…':'⬇ Hent tabell'}</button>
      </div>
      {msg && <div style={{fontSize:12,marginTop:8,color:'var(--txt2)'}}>{msg}</div>}
    </div>
  );
}

function FetchPlayers({ onFetched }) {
  const [key, setKey] = useState(()=>localStorage.getItem(FD_KEY_LS)||'');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const POS_MAP = { Goalkeeper:'Keeper', Defence:'Forsvar', Midfield:'Midtbane', Offence:'Spiss', Attack:'Spiss' };
  async function run() {
    if (!key.trim()) { setMsg('⚠ Lim inn en gratis API-nøkkel fra football-data.org først.'); return; }
    localStorage.setItem(FD_KEY_LS, key.trim());
    setBusy(true); setMsg('');
    try {
      const r = await fetch('https://api.football-data.org/v4/competitions/PL/teams', { headers:{ 'X-Auth-Token': key.trim() } });
      if (!r.ok) throw new Error('API svarte ' + r.status);
      const data = await r.json();
      const players = [], keepers = [];
      let teamsMatched = 0;
      (data.teams||[]).forEach(t => {
        const code = fdCodeFor(t.name);
        if (!code) return;
        teamsMatched++;
        (t.squad||[]).forEach(p => {
          if (p.position === 'Goalkeeper') keepers.push({ name:p.name, team:code });
          else players.push({ name:p.name, team:code, pos: POS_MAP[p.position] || 'Midtbane' });
        });
      });
      if (teamsMatched < 20 || !players.length) setMsg(`⚠ Fant kun ${teamsMatched}/20 lag med spillerdata – sjekk manuelt før du stoler på listen.`);
      else setMsg(`✓ Hentet ${players.length} utespillere og ${keepers.length} keepere fra alle 20 lag.`);
      setPlayersOverride({ players, keepers, fetchedAt: new Date().toISOString() });
      onFetched && onFetched();
    } catch (e) {
      setMsg('⚠ Klarte ikke å hente spillere: ' + e.message);
    }
    setBusy(false);
  }
  const override = getOverride();
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:13,padding:14,marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:800,color:'var(--txt2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>
        Hent spillere &amp; keepere automatisk (football-data.org)
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input className="input" style={{flex:1,minWidth:180}} value={key} onChange={e=>setKey(e.target.value)} placeholder="API-nøkkel (gratis på football-data.org)" />
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={run}>{busy?'Henter…':'⬇ Hent tropper'}</button>
        {override && <button className="btn btn-ghost btn-sm" onClick={()=>{clearPlayersOverride();setMsg('Tilbakestilt til den innebygde listen.');onFetched&&onFetched();}}>↩ Bruk innebygd liste</button>}
      </div>
      {override && <div style={{fontSize:11.5,color:'var(--txt3)',marginTop:8}}>Bruker hentet liste fra {new Date(override.fetchedAt).toLocaleString('no-NO')} (kun i denne nettleseren).</div>}
      {msg && <div style={{fontSize:12,marginTop:8,color:'var(--txt2)'}}>{msg}</div>}
    </div>
  );
}

function ResultsTab() {
  const [res, setRes] = useState(()=>{
    const r = getResults();
    if (!r.plOrder||r.plOrder.length!==20) r.plOrder=PL_CODES_A.slice();
    if (!r.promotion) r.promotion=[];
    if (!r.awards) r.awards={};
    if (!r.published) r.published={};
    if (!r.snapshot) r.snapshot={active:false,note:''};
    ALL_AWARDS.forEach(([k])=>{ if(!r.awards[k])r.awards[k]=''; if(r.published[k]===undefined)r.published[k]=false; });
    return r;
  });
  const [tab, setTab] = useState('table');
  const [saved, setSaved] = useState(false);

  function commit(next){ setRes(next); saveResults(next); setSaved(true); setTimeout(()=>setSaved(false),1800); }
  function togglePub(k){ commit({...res, published:{...res.published,[k]:!res.published[k]}}); }
  function setAward(k,v){ commit({...res, awards:{...res.awards,[k]:v}}); }
  function setSnap(patch){ commit({...res, snapshot:{...res.snapshot,...patch}}); }

  const sortedCH = [...CH_TEAMS].sort((a,b)=>a.name.localeCompare(b.name,'no'));

  return (
    <div>
      <div className="banner warn" style={{marginBottom:12,fontSize:13}}>
        Registrer fasit etter hvert som sesongen spilles. «Publiser» deler ut poeng for den kategorien.
        <span className={`save-pill ${saved?'show':''}`} style={{marginLeft:8}}>✓ Lagret</span>
      </div>
      <div className="tabs" style={{padding:'0 0 12px'}}>
        {[['table','Sluttabell'],['promotion','Opprykk'],['awards','Kåringer']].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='table' && <div>
        <FetchStandings onFetched={order=>commit({...res,plOrder:order})} />
        {/* Foreløpig note */}
        <div style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:13,padding:'14px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:800,color:'var(--txt2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>
            Foreløpig stilling (vises på leaderboard)
          </div>
          <input className="input" value={res.snapshot?.note||''}
            onChange={e=>setSnap({note:e.target.value})}
            placeholder="F.eks. «pr. 28. september 2026»"
            style={{marginBottom:10}} />
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <button className={`toggle-pub ${res.snapshot?.active?'on':''}`}
              onClick={()=>setSnap({active:!res.snapshot?.active})}>
              {res.snapshot?.active ? '📊 Foreløpig publisert' : 'Publiser som foreløpig'}
            </button>
            <div style={{flex:1}}></div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <PubBtn on={res.published.table} onClick={()=>togglePub('table')} label="Endelig" />
            </div>
          </div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--line)',borderRadius:13,padding:14,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700}}>🔒 Lås tipping manuelt</div>
            <div style={{fontSize:11.5,color:'var(--txt3)',marginTop:2}}>Stenger levering uansett klokke på deltakerens enhet – nyttig hvis klokken er feil, eller for å låse tidlig.</div>
          </div>
          <LockToggle />
        </div>
        <div className="muted" style={{marginBottom:8,fontSize:12}}>Sett endelig PL-sluttabell (dra til riktig rekkefølge)</div>
        <SortableTable order={res.plOrder} onChange={o=>commit({...res,plOrder:o})} />
      </div>}

      {tab==='promotion' && <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div className="muted">Velg 3 opprykklag ({res.promotion.length}/3)</div>
          <PubBtn on={res.published.promotion} onClick={()=>togglePub('promotion')} />
        </div>
        <div className="pick-grid">
          {sortedCH.map(t=>{
            const on=res.promotion.includes(t.code);
            return (
              <button key={t.code} className={`pick ${on?'on':''}`}
                disabled={res.promotion.length>=3&&!on}
                onClick={()=>{
                  const p=on?res.promotion.filter(c=>c!==t.code):[...res.promotion,t.code];
                  commit({...res,promotion:p});
                }}>
                <ClubBadge code={t.code} size={28} />
                <span className="pick-name">{t.name}{t.promoted&&<span className="tag-new" style={{marginLeft:4}}>NY</span>}</span>
                <span className="pick-check">{on?'✓':''}</span>
              </button>
            );
          })}
        </div>
      </div>}

      {tab==='awards' && <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <FetchPlayers onFetched={()=>{}} />
        <div style={{fontSize:11.5,color:'var(--txt3)',background:'var(--surface)',border:'1px solid var(--line)',borderRadius:10,padding:'8px 12px'}}>
          💡 Ved delt topplassering (uavgjort): skriv flere navn adskilt med komma, f.eks. «Erling Haaland, Alexander Isak» – alle som har tippet ett av dem får full pott.
        </div>
        {ALL_AWARDS.map(([k,e,l,type])=>(
          <div className="award" key={k}>
            <div className="award-top">
              <div className="award-emoji">{e}</div>
              <div><div className="award-h">{l}</div></div>
              <div style={{marginLeft:'auto'}}><PubBtn on={res.published[k]} onClick={()=>togglePub(k)} /></div>
            </div>
            {type==='team'    ? <TeamSelect    value={res.awards[k]} onChange={v=>setAward(k,v)} />
            :type==='manager' ? <ManagerSelect value={res.awards[k]} onChange={v=>setAward(k,v)} />
            :type==='keeper'  ? <PlayerAutocomplete value={res.awards[k]} onChange={v=>setAward(k,v)} placeholder="Søk etter keeper…" searchFn={searchKeepers} />
            :<PlayerAutocomplete value={res.awards[k]} onChange={v=>setAward(k,v)} placeholder="Søk etter spiller…" />}
          </div>
        ))}
      </div>}
    </div>
  );
}

function LockToggle() {
  const [on, setOn] = useState(()=>getSettings().lockOverride);
  return (
    <button className={`toggle-pub ${on?'on':''}`} onClick={()=>{ const v=!on; setLockOverride(v); setOn(v); }}>
      {on ? '✓ Låst nå' : 'Lås nå'}
    </button>
  );
}

// ── AdminApp ──────────────────────────────────────────────────
function AdminApp() {
  const [user] = useState(() => currentUser());
  const [tab, setTab] = useState('users');
  const isAdmin = user && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="app"><div className="lock"><div className="lock-card">
        <div className="auth-mark" style={{background:'var(--surface2)',border:'1px solid var(--line)'}}>
          <img src="assets/PL.png" alt="" style={{width:'100%',height:'100%',objectFit:'contain',padding:4}} />
        </div>
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:8,marginTop:8}}>Kun for admin</h2>
        <p className="muted" style={{marginBottom:20}}>
          {user ? 'Din konto har ikke admin-tilgang.' : 'Logg inn med admin-kontoen for å se dette panelet.'}
        </p>
        <a className="btn btn-primary btn-block" href="index.html">{user?'Til tippingen':'Logg inn'}</a>
      </div></div></div>
    );
  }

  return (
    <div className="app">
      <div className="topbar admin-bar">
        <div className="brand">
          <div className="brand-mark"><img src="assets/PL.png" alt="" /></div>
          <div className="brand-txt"><div className="brand-name">Admin</div><div className="brand-sub">PL 26/27 Tippekonk</div><div className="brand-by">av Jan Erlend Holmen</div></div>
        </div>
        <span className="admin-tag">Admin</span>
        <div className="top-spacer"></div>
        <a className="btn btn-ghost btn-sm" href="leaderboard.html">📊 Tabell</a>
      </div>
      <div className="tabs">
        {[['users','👥 Brukere'],['subs','📋 Tipp'],['results','📊 Fasit']].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="admin-main">
        {tab==='users'   && <UsersTab />}
        {tab==='subs'    && <SubsTab />}
        {tab==='results' && <ResultsTab />}
      </div>
    </div>
  );
}
bootStore(() => ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />));

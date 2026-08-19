// ============================================================
//  Tabelltippen – Deltakerflyt (app.jsx)
// ============================================================
const { useState, useEffect, useRef } = React;
const PL_CODES = PL_TEAMS.map(t => t.code);

function timeLeft() {
  const ms = DEADLINE - new Date();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d}d ${h}t` : h > 0 ? `${h}t ${m}m` : `${m}m`;
}
function Countdown() {
  const [t, setT] = useState(timeLeft());
  useEffect(() => { const id = setInterval(() => setT(timeLeft()), 30000); return () => clearInterval(id); }, []);
  if (!t) return <div className="countdown"><span className="dot" style={{background:'var(--red)',boxShadow:'0 0 8px var(--red)'}}></span> Fristen er ute</div>;
  return <div className="countdown"><span className="dot"></span> Frist om <b>{t}</b></div>;
}

// ── Kåringer-metadata ────────────────────────────────────────
const AWARDS_META = [
  { key:'scorer',     emoji:'⚽', h:'Toppscorer',              d:'Flest mål i Premier League',           pts:SCORING.awards.scorer,     ph:'F.eks. Erling Haaland',     type:'player' },
  { key:'assist',     emoji:'🅰️', h:'Flest assist',             d:'Flest målgivende pasninger i PL',      pts:SCORING.awards.assist,     ph:'F.eks. Mohamed Salah',      type:'player' },
  { key:'cards',      emoji:'🟨', h:'Flest kortpoeng',          d:'Gult = 1, rødt = 2 (uansett om det er dobbelt gult)',        pts:SCORING.awards.cards,      ph:'F.eks. Declan Rice',        type:'anyplayer' },
  { key:'player',     emoji:'⭐', h:'Årets Spiller',            d:'PFA Player of the Year',               pts:SCORING.awards.player,     ph:'F.eks. Cole Palmer',        type:'anyplayer' },
  { key:'redcard',    emoji:'🟥', h:'Første røde kort',         d:'Sesongens første utvisning i PL',      pts:SCORING.awards.redcard,    ph:'Uheldig forsvarsspiller…',  type:'anyplayer' },
  { key:'keeper',     emoji:'🧤', h:'Flest clean sheets',       d:'Keeperen med flest målløse kamper, min. 60 min.', pts:SCORING.awards.keeper,     ph:'F.eks. David Raya',         type:'keeper' },
  { key:'leader3',    emoji:'🔝', h:'Leder etter 3 runder',     d:'Hvem topper tabellen etter runde 3?',  pts:SCORING.awards.leader3,    ph:'',                          type:'team' },
  { key:'firstfired', emoji:'🚪', h:'Første manager sparket',   d:'Hvem mister jobben først i 26/27?',    pts:SCORING.awards.firstfired, ph:'',                          type:'manager' },
];

function awardDisplay(key, value) {
  if (!value) return '–';
  if (key === 'leader3') return (typeof team === 'function' && team(value)?.name) || value;
  return value;
}
function awardMatch(key, predVal, actVal) {
  if (!predVal || !actVal) return false;
  if (key === 'leader3') return predVal === actVal;
  const options = actVal.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return options.includes(predVal.trim().toLowerCase());
}

// ── AuthScreen ───────────────────────────────────────────────
function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [fav, setFav] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [resetFav, setResetFav] = useState(null);

  async function submit() {
    setErr(''); setOk('');
    if (mode === 'register') {
      if (!name.trim()) return setErr('Skriv inn navnet ditt.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Ugyldig e-postadresse.');
      if (pw.length < 4) return setErr('Passordet må ha minst 4 tegn.');
      if (pw !== pw2) return setErr('Passordene er ikke like.');
      if (!fav) return setErr('Velg favorittklubb – brukes også til å gjenopprette passord senere.');
      const res = await registerUser({ name, email, password: pw, favClub: fav });
      if (!res.ok) return setErr(res.error);
      onAuthed(res.user);
    } else if (mode === 'reset') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr('Ugyldig e-postadresse.');
      if (!resetFav) return setErr('Velg favorittklubben du registrerte deg med.');
      if (pw.length < 4) return setErr('Nytt passord må ha minst 4 tegn.');
      if (pw !== pw2) return setErr('Passordene er ikke like.');
      const res = await resetPasswordWithSecurity({ email, favClub: resetFav, newPassword: pw });
      if (!res.ok) return setErr(res.error);
      setOk('Passord endret – du kan nå logge inn.');
      setMode('login'); setPw(''); setPw2('');
    } else {
      const res = await loginUser({ email, password: pw });
      if (!res.ok) return setErr(res.error);
      onAuthed(res.user);
    }
  }
  if (mode === 'reset') return (
    <div className="app">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-mark"><img src="assets/PL.png" alt="Premier League" /></div>
          <div><div className="auth-h">Gjenopprett passord</div><div className="auth-tag">26/27 Tippekonk</div></div>
        </div>
        <p style={{fontSize:13,color:'var(--txt2)',lineHeight:1.5,marginBottom:4}}>
          Bekreft e-post og favorittklubben du valgte ved registrering, og velg et nytt passord.
        </p>
        <div className="field"><label>E-post</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="navn@epost.no" />
        </div>
        <div className="field"><label>Favorittklubb</label>
          <div className="fav-grid">
            {PL_TEAMS.map(t => (
              <button key={t.code} className={`fav-pick ${resetFav===t.code?'on':''}`} onClick={()=>setResetFav(t.code)}>
                <ClubBadge code={t.code} size={18} radius={5} /> {t.short}
              </button>
            ))}
          </div>
        </div>
        <div className="field"><label>Nytt passord</label>
          <input className="input" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••" />
        </div>
        <div className="field"><label>Bekreft nytt passord</label>
          <input className="input" type={showPw?'text':'password'} value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="••••••" />
        </div>
        {err && <div className="err">⚠ {err}</div>}
        <button className="btn btn-primary btn-block" style={{marginTop:8}} onClick={submit}>Sett nytt passord</button>
        <div className="auth-foot"><a className="link" onClick={()=>{setMode('login');setErr('');}}>← Tilbake til innlogging</a></div>
      </div>
    </div>
  );
  return (
    <div className="app">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-mark"><img src="assets/PL.png" alt="Premier League" /></div>
          <div><div className="auth-h">Premier League</div><div className="auth-tag">26/27 Tippekonk</div><div className="brand-by" style={{marginTop:3}}>av Jan Erlend Holmen</div></div>
        </div>
        <div className="seg-toggle">
          <button className={mode==='login'?'on':''} onClick={()=>{setMode('login');setErr('');}}>Logg inn</button>
          <button className={mode==='register'?'on':''} onClick={()=>{setMode('register');setErr('');}}>Registrer deg</button>
        </div>
        {mode==='register' && <div className="field"><label>Navn</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Ditt navn (vises på tabellen)" />
        </div>}
        <div className="field"><label>E-post</label>
          <input className="input" type="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="navn@epost.no" />
        </div>
        <div className="field"><label>Passord</label>
          <div className="pw-row">
            <input className="input" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
              placeholder="••••••" onKeyDown={e=>e.key==='Enter'&&mode==='login'&&submit()} />
            <button className="toggle" onClick={()=>setShowPw(s=>!s)}>{showPw?'Skjul':'Vis'}</button>
          </div>
        </div>
        {mode==='register' && <>
          <div className="field"><label>Bekreft passord</label>
            <input className="input" type={showPw?'text':'password'} value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="••••••" />
          </div>
          <div className="field"><label>Favorittklubb</label>
            <div className="fav-grid">
              {PL_TEAMS.map(t => (
                <button key={t.code} className={`fav-pick ${fav===t.code?'on':''}`} onClick={()=>setFav(fav===t.code?null:t.code)}>
                  <ClubBadge code={t.code} size={18} radius={5} /> {t.short}
                </button>
              ))}
            </div>
            <div style={{fontSize:11.5,color:'var(--txt3)',marginTop:6}}>Brukes til å bekrefte identiteten din hvis du senere må gjenopprette passordet.</div>
          </div>
        </>}
        {ok && <div className="banner" style={{marginBottom:4}}>✓ {ok}</div>}
        {err && <div className="err">⚠ {err}</div>}
        <button className="btn btn-primary btn-block" style={{marginTop:8}} onClick={submit}>
          {mode==='login' ? 'Logg inn' : 'Opprett konto og start'}
        </button>
        {mode==='login' && <div className="auth-foot" style={{marginTop:-4}}><a className="link" onClick={()=>{setMode('reset');setErr('');setOk('');}}>Glemt passord?</a></div>}
        <div className="auth-foot">
          {mode==='login'
            ? <>Ny her? <a className="link" onClick={()=>{setMode('register');setErr('');}}>Registrer deg</a></>
            : <>Har du konto? <a className="link" onClick={()=>{setMode('login');setErr('');}}>Logg inn</a></>}
        </div>
      </div>
    </div>
  );
}

// ── UserMenu ─────────────────────────────────────────────────
function UserMenu({ user, onLogout, onPoeng }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function h(e){ if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, []);
  const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  return (
    <div className="usermenu" ref={ref}>
      <button className="user-chip" onClick={()=>setOpen(o=>!o)}>
        <span className="avatar">{(user.name||'?').charAt(0).toUpperCase()}</span>
        <span style={{maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name||'Konto'}</span>
      </button>
      {open && (
        <div className="dropdown">
          <div className="dd-head"><div className="dd-name">{user.name}</div><div className="dd-email">{user.email}</div></div>
          <a className="dd-item" href="leaderboard.html">📊 Resultattabell</a>
          <a className="dd-item" href="stats.html">📈 Statistikk</a>
          <button className="dd-item" onClick={()=>{setOpen(false);onPoeng&&onPoeng();}}>🏆 Poengsystem</button>
          {isAdmin && <a className="dd-item" href="admin.html">🛠 Adminpanel</a>}
          <button className="dd-item danger" onClick={onLogout}>↩ Logg ut</button>
        </div>
      )}
    </div>
  );
}
function Header({ user, onLogout, onDonasjon, onPoeng }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark"><img src="assets/PL.png" alt="" /></div>
        <div className="brand-txt"><div className="brand-name">Premier League</div><div className="brand-sub">26/27 Tippekonk</div><div className="brand-by">av Jan Erlend Holmen</div></div>
      </div>
      <div className="top-spacer"></div>
      {onDonasjon && (
        <button onClick={onDonasjon} style={{
          background:'none',border:'1px solid var(--line)',borderRadius:20,
          padding:'5px 11px',fontSize:11,fontWeight:600,color:'var(--txt2)',
          cursor:'pointer',whiteSpace:'nowrap',marginRight:8,lineHeight:1.2
        }}>🫶 Donasjon</button>
      )}
      <UserMenu user={user} onLogout={onLogout} onPoeng={onPoeng} />
    </div>
  );
}

// ── PoengsystemScreen ───────────────────────────────────────
function PoengsystemScreen({ onBack }) {
  const maxTable  = 20 * SCORING.table.exact + SCORING.championBonus;
  const maxRel    = 3  * SCORING.relegationEach;
  const maxProm   = 3  * SCORING.promotionEach;
  const maxAwards = Object.values(SCORING.awards).reduce((a,b)=>a+b,0);
  const maxTotal  = maxTable + maxRel + maxProm + maxAwards;

  const Section = ({title, max, children}) => (
    <div style={{marginBottom:22}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',
        borderBottom:'1px solid var(--line)',paddingBottom:6,marginBottom:8}}>
        <div style={{fontWeight:800,fontSize:14,letterSpacing:-.2}}>{title}</div>
        <div style={{fontSize:11,color:'var(--txt3)',fontWeight:600}}>maks {max} p</div>
      </div>
      {children}
    </div>
  );

  const Row = ({label, pts, sub}) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'8px 0',borderBottom:'1px solid var(--line)'}}>
      <div style={{flex:1,paddingRight:12}}>
        <div style={{fontSize:13,fontWeight:500}}>{label}</div>
        {sub && <div style={{fontSize:11,color:'var(--txt3)',marginTop:2,lineHeight:1.4}}>{sub}</div>}
      </div>
      <div style={{fontWeight:800,fontSize:17,color:'var(--acc)',minWidth:44,textAlign:'right',flexShrink:0}}>
        {pts} <span style={{fontWeight:400,fontSize:11,color:'var(--txt3)'}}>p</span>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div style={{maxWidth:480,margin:'0 auto',padding:'20px 16px 48px'}}>
        <button onClick={onBack} style={{
          background:'none',border:'none',color:'var(--txt3)',
          fontSize:13,cursor:'pointer',padding:'0 0 18px',display:'flex',alignItems:'center',gap:4
        }}>← Tilbake</button>

        <h1 style={{fontSize:22,fontWeight:900,letterSpacing:-.4,marginBottom:4}}>🏆 Poengsystem</h1>
        <p style={{fontSize:13,color:'var(--txt3)',marginBottom:24,lineHeight:1.5}}>
          Maks mulig poengsum: <b style={{color:'var(--acc)'}}>{maxTotal} poeng</b>
        </p>

        <Section title="📋 Tabellspådom" max={maxTable}>
          <Row label="Serievinner-bonus" pts={SCORING.championBonus}
            sub="Ekstra om du spår riktig lag på topp (i tillegg til tabellpoeng)" />
          <Row label="Eksakt riktig plassering" pts={SCORING.table.exact} />
          <Row label="±1 plass" pts={SCORING.table.off1} />
          <Row label="±2 plasser" pts={SCORING.table.off2} />
        </Section>

        <Section title="⬇️ Nedrykk (3 lag)" max={maxRel}>
          <Row label="Per riktig nedrykkslag" pts={SCORING.relegationEach}
            sub="Rekkefølge teller ikke – bare riktig lag" />
        </Section>

        <Section title="⬆️ Championship-opprykk (3 lag)" max={maxProm}>
          <Row label="Per riktig opprykksklubb" pts={SCORING.promotionEach}
            sub="Tre lag rykker opp fra Championship" />
        </Section>

        <Section title="⭐ Kåringer" max={maxAwards}>
          {[...AWARDS_META].sort((a,b)=>b.pts-a.pts).map(a => (
            <Row key={a.key} label={a.emoji+' '+a.h} pts={a.pts} sub={a.d} />
          ))}
        </Section>

        <div style={{
          background:'var(--surface2)',border:'1px solid var(--line)',
          borderRadius:12,padding:'14px 16px',
          display:'flex',justifyContent:'space-between',alignItems:'center'
        }}>
          <div style={{fontSize:14,fontWeight:700}}>Maks totalt</div>
          <div style={{fontSize:22,fontWeight:900,color:'var(--acc)'}}>{maxTotal} <span style={{fontSize:13,fontWeight:400,color:'var(--txt3)'}}>poeng</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Steg 1: Tabell ───────────────────────────────────────────
function StepTable({ pred, setPred }) {
  return (
    <div>
      <div className="step-kicker">Steg 1 av 4</div>
      <h1 className="step-title">Spå hele tabellen</h1>
      <p className="step-desc">Dra lagene i den rekkefølgen du tror de ender på. Bruk pilene på mobil.</p>
      <div className="tbl-tools">
        <button className="tbl-tool" onClick={()=>setPred(p=>({...p, plOrder: PL_CODES.slice()}))}>↺ Tilbakestill</button>
        <button className="tbl-tool" onClick={()=>setPred(p=>({...p, plOrder: [...p.plOrder].sort((a,b)=>(team(a)?.name||a).localeCompare(team(b)?.name||b,'no'))}))}>A–Å</button>
      </div>
      <div className="legend">
        <span><i style={{background:'var(--gold)'}}></i>Seriemester</span>
        <span><i style={{background:'var(--acc)'}}></i>Champions League</span>
        <span><i style={{background:'var(--europa)'}}></i>Europa</span>
        <span><i style={{background:'var(--red)'}}></i>Nedrykk</span>
      </div>
      <SortableTable order={pred.plOrder} onChange={o => setPred(p => ({ ...p, plOrder: o }))} />
    </div>
  );
}

// ── Steg 2: Opprykk ──────────────────────────────────────────
function StepPromotion({ pred, setPred }) {
  const sel = pred.promotion;
  function toggle(code) {
    setPred(p => {
      if (p.promotion.includes(code)) return { ...p, promotion: p.promotion.filter(c=>c!==code) };
      if (p.promotion.length >= 3) return p;
      return { ...p, promotion: [...p.promotion, code] };
    });
  }
  const sorted = [...CH_TEAMS].sort((a,b)=>a.name.localeCompare(b.name,'no'));
  return (
    <div>
      <div className="step-kicker">Steg 2 av 4</div>
      <h1 className="step-title">Hvem rykker opp?</h1>
      <p className="step-desc">Velg de 3 Championship-lagene du tror går opp til Premier League.</p>
      <div className="pick-counter"><span>Valgte lag</span><span><b>{sel.length}</b> / 3</span></div>
      <div className="pick-grid">
        {sorted.map(t => {
          const on = sel.includes(t.code);
          return (
            <button key={t.code} className={`pick ${on?'on':''}`} disabled={sel.length>=3&&!on} onClick={()=>toggle(t.code)}>
              <ClubBadge code={t.code} size={30} />
              <span className="pick-name">
                {t.name}
                {t.promoted && <span className="tag-new" style={{marginLeft:5}}>NY</span>}
                {t.relegated && <span className="pick-tag" style={{marginLeft:5}}>NED</span>}
              </span>
              <span className="pick-check">{on?'✓':''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Steg 3: Kåringer ─────────────────────────────────────────
function awardInput(a, value, onChange) {
  if (a.type === 'team')    return <TeamSelect value={value} onChange={onChange} />;
  if (a.type === 'manager') return <ManagerSelect value={value} onChange={onChange} />;
  const sf = a.type === 'keeper' ? searchKeepers : (a.type === 'anyplayer' ? searchAllPlayers : undefined);
  return <PlayerAutocomplete value={value} onChange={onChange} placeholder={a.ph} searchFn={sf} />;
}
function StepAwards({ pred, setPred }) {
  function set(key, v) { setPred(p => ({ ...p, awards: { ...p.awards, [key]: v } })); }
  return (
    <div>
      <div className="step-kicker">Steg 3 av 4</div>
      <h1 className="step-title">Kåringer</h1>
      <p className="step-desc">Hvem stikker av med prisene? Fyll ut alle 8 for å kunne levere.</p>
      {AWARDS_META.map(a => (
        <div className="award" key={a.key}>
          <div className="award-top">
            <div className="award-emoji">{a.emoji}</div>
            <div><div className="award-h">{a.h}</div><div className="award-d">{a.d}</div></div>
            <div className="award-pts">+{a.pts} p</div>
          </div>
          {awardInput(a, pred.awards[a.key], v=>set(a.key,v))}
        </div>
      ))}
    </div>
  );
}

// ── PredSummary (tipp + fasit) ───────────────────────────────
function PredSummary({ pred, results }) {
  const pub = results?.published || {};
  const actIdx = {};
  if (pub.table && results.plOrder?.length) results.plOrder.forEach((c,i)=>{ actIdx[c]=i; });
  return (
    <div>
      <div className="rev-sec">
        <div className="rev-h">🏆 Din PL-tabell</div>
        <div className="rev-list">
          {pred.plOrder.map((code, i) => {
            const z = zoneFor(i);
            const col = z==='champion'?'gold':z==='ucl'?'acc':z==='europa'?'europa':z==='releg'?'red':'txt3';
            let fp = null;
            if (pub.table && results.plOrder?.length && actIdx[code] !== undefined) {
              const diff = Math.abs(actIdx[code] - i);
              fp = <span className={`fasit-pos ${diff===0?'exact':diff<=2?'close':'miss'}`}>#{actIdx[code]+1}</span>;
            }
            return (
              <div className="rev-row" key={code}>
                <span className="rn" style={{color:`var(--${col})`}}>{i+1}</span>
                <ClubBadge code={code} size={24} />
                <span className="rt">{team(code)?.name}</span>
                {ZONE_LABEL[z] && <span className={`zone-pill zp-${z}`}>{ZONE_LABEL[z]}</span>}
                {fp}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rev-sec">
        <div className="rev-h">⬆ Opprykk fra Championship</div>
        <div className="rev-list">
          {pred.promotion.length === 0 && <div className="muted">Ingen valgt</div>}
          {pred.promotion.map(code => {
            const correct = pub.promotion && results.promotion?.includes(code);
            return (
              <div className="rev-row" key={code}>
                <ClubBadge code={code} size={24} />
                <span className="rt">{team(code)?.name}</span>
                {pub.promotion && <span className={correct?'fasit-ok':'fasit-wrong'} style={{marginLeft:'auto',fontSize:14}}>{correct?'✓':'✗'}</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="rev-sec">
        <div className="rev-h">⭐ Kåringer</div>
        {AWARDS_META.map(a => {
          const pv = pred.awards[a.key]; const av = results?.awards?.[a.key];
          const published = pub[a.key];
          const correct = published && awardMatch(a.key, pv, av);
          return (
            <div className="rev-kv" key={a.key}>
              <span className="rev-k">{a.emoji} {a.h}</span>
              <div style={{textAlign:'right'}}>
                <span className="rev-v">{awardDisplay(a.key, pv)}</span>
                {published && <div className={`fasit-badge ${correct?'fasit-ok':'fasit-wrong'}`}>
                  {correct ? '✓ Riktig!' : `✗ Fasit: ${awardDisplay(a.key, av)}`}
                </div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Steg 4 + Kvittering ──────────────────────────────────────
function Submitted({ pred, onEdit, locked }) {
  const results = getResults();
  return (
    <div>
      <div className="banner" style={{marginBottom:16,alignItems:'flex-start'}}>
        <span style={{fontSize:18}}>✓</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,marginBottom:2}}>Tipp levert</div>
          <div style={{fontSize:12,color:'var(--txt2)'}}>
            {locked ? 'Fristen er ute – tippet ditt er låst.' : 'Du kan endre frem til fristen.'}
          </div>
        </div>
        <Countdown />
      </div>
      {!locked && (
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(1)}>✏ Tabell</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(2)}>✏ Championship</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(3)}>✏ Spesialer</button>
        </div>
      )}
      <PredSummary pred={pred} results={results} />
    </div>
  );
}

function StepReview({ pred, onEdit }) {
  return (
    <div>
      <div className="step-kicker">Steg 4 av 4</div>
      <h1 className="step-title">Sjekk og lever</h1>
      <p className="step-desc">Gå gjennom tippet. Du kan endre alt frem til fristen.</p>
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(1)}>Endre tabell</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(2)}>Endre opprykk</button>
        <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(3)}>Endre kåringer</button>
      </div>
      <PredSummary pred={pred} />
    </div>
  );
}
// ── Tipper (hovedflyt) ───────────────────────────────────────
const EMPTY_AWARDS = { scorer:'', assist:'', cards:'', player:'', redcard:'', keeper:'', leader3:'', firstfired:'' };

function Tipper({ user, onLogout, onDonasjon, onPoeng }) {
  const past = isPastDeadline();
  const existing = getSubmission(user.email);
  const [submitted, setSubmitted] = useState(!!existing);
  const [step, setStep] = useState(0);
  const [pred, setPred] = useState(() => {
    const base = existing?.prediction || getDraft(user.email);
    return {
      plOrder: base?.plOrder?.length === 20 ? base.plOrder : PL_CODES.slice(),
      promotion: base?.promotion || [],
      awards: { ...EMPTY_AWARDS, ...(base?.awards||{}) },
    };
  });
  useEffect(() => { if (!submitted) saveDraft(user.email, pred); }, [pred, submitted, user.email]);
  useEffect(() => { if (submitted||past) setStep(0); else setStep(1); }, []);

  function submit() { saveSubmission(user.email, user.name, pred); setSubmitted(true); setStep(0); window.scrollTo(0,0); }
  function goEdit(s){ setSubmitted(false); setStep(s); window.scrollTo(0,0); }

  const valid2 = pred.promotion.length === 3;
  const valid3 = AWARDS_META.every(a => (pred.awards[a.key]||'').trim());

  if (past && !submitted) return (
    <div className="app"><Header user={user} onLogout={onLogout} onDonasjon={onDonasjon} onPoeng={onPoeng} />
      <div className="main"><div className="success">
        <div className="success-badge" style={{background:'var(--red)',boxShadow:'0 0 50px rgba(255,90,95,.4)'}}>⏱</div>
        <h2>Fristen er ute</h2><p>Det er ikke lenger mulig å levere tipp.</p>
        <a className="btn btn-primary" href="leaderboard.html" style={{maxWidth:300,margin:'0 auto',width:'100%'}}>Se resultattabellen</a>
      </div></div>
    </div>
  );

  if (submitted) return (
    <div className="app"><Header user={user} onLogout={onLogout} onDonasjon={onDonasjon} onPoeng={onPoeng} />
      <div className="main"><Submitted pred={pred} onEdit={goEdit} locked={past} /></div>
    </div>
  );

  return (
    <div className="app">
      <Header user={user} onLogout={onLogout} onDonasjon={onDonasjon} onPoeng={onPoeng} />
      <div className="main">
        <div className="steps">{[1,2,3,4].map(s=><div key={s} className={`seg ${step>s?'done':step===s?'active':''}`}></div>)}</div>
        {step===1 && <StepTable pred={pred} setPred={setPred} />}
        {step===2 && <StepPromotion pred={pred} setPred={setPred} />}
        {step===3 && <StepAwards pred={pred} setPred={setPred} />}
        {step===4 && <StepReview pred={pred} onEdit={s=>{setStep(s);window.scrollTo(0,0);}} />}
      </div>
      <div className="actionbar"><div className="actionbar-inner">
        {step>1 && <button className="btn btn-ghost" onClick={()=>{setStep(step-1);window.scrollTo(0,0);}}>Tilbake</button>}
        {step<4 && <button className="btn btn-primary"
          disabled={(step===2&&!valid2)||(step===3&&!valid3)}
          onClick={()=>{setStep(step+1);window.scrollTo(0,0);}}>
          {step===1?'Neste: Championship':step===2?(valid2?'Neste: spesialer':`Velg ${3-pred.promotion.length} lag til`):(valid3?'Se oppsummering':'Fyll ut alle spesialer')}
        </button>}
        {step===4 && <button className="btn btn-primary" disabled={!valid2||!valid3} onClick={submit}>🏆 Lever tippet</button>}
      </div></div>
    </div>
  );
}

// ── Vipps-nummer (kopier) ────────────────────────────────────
const VIPPS_NR = '45441656';
function VippsNummer({ label = 'Kopier Vipps-nummer' }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(VIPPS_NR).then(done).catch(done);
    } else {
      const t = document.createElement('textarea');
      t.value = VIPPS_NR; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); done();
    }
  }
  return (
    <button
      onClick={copy}
      className="btn btn-block"
      style={{
        background:'#FF5B24',color:'#fff',border:'none',cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,
        fontSize:16,fontWeight:800,padding:'14px 20px',borderRadius:10,marginBottom:12
      }}
    >
      <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
        <path d="M10 42 C17 42 24 18 33 18 C40 18 40 32 47 32 C54 32 55 22 55 22" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {copied ? 'Kopiert: ' + VIPPS_NR : label + ' ' + VIPPS_NR}
    </button>
  );
}

function VippsApne() {
  const [state, setState] = useState('idle');
  function go() {
    const nr = VIPPS_NR;
    if (navigator.clipboard && navigator.clipboard.writeText) { try { navigator.clipboard.writeText(nr); } catch (e) {} }
    setState('copied');
    const mobil = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (mobil) { setTimeout(() => { window.location.href = 'vipps://'; }, 120); }
    setTimeout(() => setState('idle'), 3500);
  }
  return (
    <>
      <button onClick={go} className="btn btn-block" style={{
        background:'#FF5B24',color:'#fff',border:'none',cursor:'pointer',
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,
        fontSize:16,fontWeight:800,padding:'14px 20px',borderRadius:10,marginBottom:10
      }}>
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
          <path d="M10 42 C17 42 24 18 33 18 C40 18 40 32 47 32 C54 32 55 22 55 22" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {state === 'copied' ? 'Nummer kopiert – åpner Vipps…' : 'Åpne Vipps og kopier nummer'}
      </button>
      <div style={{fontSize:12,color:'var(--txt3)',textAlign:'center',marginBottom:20,lineHeight:1.6}}>
        Trykk <b style={{color:'var(--txt2)'}}>Send</b> i Vipps og lim inn nummeret
        (<b style={{color:'var(--txt2)'}}>{VIPPS_NR}</b>) – det ligger allerede på utklippstavla.
        <br/>På PC: scan QR-koden over med mobilkameraet.
      </div>
    </>
  );
}

// ── DonasjonScreen ───────────────────────────────────────────
function DonasjonScreen({ onBack }) {
  return (
    <div className="app">
      <div className="auth-wrap" style={{gap:0}}>
        <div className="auth-logo" style={{marginBottom:20}}>
          <div className="auth-mark"><img src="assets/PL.png" alt="Premier League" /></div>
          <div>
            <div className="auth-h">Premier League</div>
            <div className="auth-tag">26/27 Tippekonk</div>
          </div>
        </div>

        <div style={{fontWeight:800,fontSize:19,letterSpacing:-.3,marginBottom:10}}>🫶 Frivillig donasjon</div>

        <div style={{fontSize:14,lineHeight:1.65,color:'var(--txt2)',marginBottom:24}}>
          Tippeadministrasjonen tar donasjoner! Selvsagt 100&nbsp;% frivillig, men bidrar til
          hosting av side og administrering av konkurransen.
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <div style={{background:'#fff',padding:10,borderRadius:12,border:'1px solid var(--line)'}}>
            <img src="assets/vipps_qr.jpg" alt="Vipps QR-kode" style={{width:180,height:180,objectFit:'contain',display:'block',borderRadius:6}} />
          </div>
        </div>

        <VippsApne />

        <button className="btn btn-ghost btn-block" style={{fontSize:14}} onClick={onBack}>
          ← Tilbake
        </button>
      </div>
    </div>
  );
}

// ── VippsWelcome ─────────────────────────────────────────────
const VIPPS_ACK_KEY = email => 'pl2627_vipps_ack_' + email;

function hasVippsAck(email) {
  if (!email) return false;
  if (email === ADMIN_EMAIL) return true;
  // Betalingsstatus ligger på brukeren (kan også settes av admin).
  // localStorage-nykkelen beholdes som fallback for eldre kvitteringer.
  if (typeof hasPaid === 'function' && hasPaid(email)) return true;
  return !!localStorage.getItem(VIPPS_ACK_KEY(email));
}
function setVippsAck(email) {
  localStorage.setItem(VIPPS_ACK_KEY(email), '1');
  if (typeof setPaid === 'function') setPaid(email, true);
}

function VippsWelcome({ user, onContinue }) {
  return (
    <div className="app">
      <div className="auth-wrap" style={{gap:0}}>

        {/* Header */}
        <div className="auth-logo" style={{marginBottom:20}}>
          <div className="auth-mark"><img src="assets/PL.png" alt="Premier League" /></div>
          <div>
            <div className="auth-h">Premier League</div>
            <div className="auth-tag">26/27 Tippekonk</div>
          </div>
        </div>

        <div style={{fontWeight:800,fontSize:19,letterSpacing:-.3,marginBottom:10}}>
          Velkommen, {user.name.split(' ')[0]}! 👋
        </div>

        <div style={{
          fontSize:14,lineHeight:1.65,color:'var(--txt2)',marginBottom:20
        }}>
          For å delta, Vipps <b>kr.&nbsp;50,-</b> til tippeadministrasjonen.
          Alle penger går rett i premiepotten og vil uavkortet gå til de tre beste tipperne.
        </div>

        {/* QR-kort */}
        <div style={{
          background:'#FF5B24',borderRadius:16,padding:'20px 20px 16px',
          marginBottom:16,display:'flex',flexDirection:'column',alignItems:'center',gap:12
        }}>
          {/* QR-bilde – kroppet til selve QR-firkanten */}
          <div style={{
            width:200,height:255,borderRadius:10,overflow:'hidden',
            background:'#fff',flexShrink:0
          }}>
            <img
              src="assets/vipps_qr.jpg"
              alt="Vipps QR-kode"
              style={{
                width:200,
                marginTop:'-35px',
                display:'block'
              }}
            />
          </div>

        </div>

        <VippsNummer label="Vipps kr. 50,- til" />

        <div style={{fontSize:11,color:'var(--txt3)',textAlign:'center',marginBottom:14,lineHeight:1.5}}>
          Scan QR-koden over med kameraet, eller søk opp nummeret i Vipps-appen.
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{fontSize:15,fontWeight:700}}
          onClick={onContinue}
        >
          Jeg har Vippset – start tipping →
        </button>

      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => currentUser());
  const [vippsAcked, setVippsAcked] = useState(() => hasVippsAck(currentUser()?.email));

  function handleAuthed(u) {
    setUser(u);
    setVippsAcked(hasVippsAck(u.email));
  }
  function handleVippsAck() {
    setVippsAck(user.email);
    setVippsAcked(true);
  }

  const [showDonasjon, setShowDonasjon] = useState(false);
  const [showPoeng,    setShowPoeng]    = useState(false);

  if (!user) return <AuthScreen onAuthed={handleAuthed} />;
  if (!vippsAcked) return <VippsWelcome user={user} onContinue={handleVippsAck} />;
  if (showDonasjon) return <DonasjonScreen onBack={() => setShowDonasjon(false)} />;
  if (showPoeng)    return <PoengsystemScreen onBack={() => setShowPoeng(false)} />;
  return <Tipper user={user} onLogout={()=>{ logout(); setUser(null); setVippsAcked(false); }} onDonasjon={() => setShowDonasjon(true)} onPoeng={() => setShowPoeng(true)} />;
}
bootStore(() => ReactDOM.createRoot(document.getElementById('root')).render(<App />));

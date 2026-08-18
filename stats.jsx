// ============================================================
//  Statistikk – aggregert fra alle innleveringer
// ============================================================
const { useState, useEffect } = React;

const AWARDS_STAT = [
  { key:'scorer',     emoji:'⚽', h:'Toppscorer',              d:'Mest tippet toppscorer' },
  { key:'assist',     emoji:'🅰️', h:'Flest assist',             d:'Mest tippet assistent' },
  { key:'cards',      emoji:'🟨', h:'Flest kortpoeng',          d:'Mest tippet kortkonge' },
  { key:'player',     emoji:'⭐', h:'Årets Spiller',            d:'Mest tippet PFA-vinner' },
  { key:'redcard',    emoji:'🟥', h:'Første røde kort',         d:'Mest tippet til første utvisning' },
  { key:'keeper',     emoji:'🧤', h:'Flest clean sheets',       d:'Mest tippet keeper' },
  { key:'leader3',    emoji:'🔝', h:'Leder etter 3 runder',     d:'Mest tippet leder etter runde 3', isTeam:true },
  { key:'firstfired', emoji:'🚪', h:'Første manager sparket',   d:'Mest tippet til å gå først' },
];

function topN(counts, n) {
  return Object.entries(counts)
    .sort((a,b)=>b[1]-a[1])
    .slice(0, n);
}

function pct(count, total) {
  if (!total) return '0%';
  return Math.round(count/total*100) + '%';
}

function StatEntry({ rank, badge, name, count, total }) {
  const r = rank <= 3 ? `r${rank}` : '';
  const p = total ? count/total : 0;
  return (
    <div className="stat-entry">
      <span className={`stat-rank ${r}`}>{rank}</span>
      {badge}
      <div className="stat-info">
        <div className="stat-name">{name}</div>
        <div className="stat-bar-wrap"><div className="stat-bar" style={{width:`${Math.round(p*100)}%`}}></div></div>
      </div>
      <div className="stat-pct">{pct(count,total)}</div>
    </div>
  );
}

function StatSection({ emoji, title, sub, children }) {
  return (
    <div className="stat-section">
      <div className="stat-section-h">
        <div className="stat-section-emoji">{emoji}</div>
        <div><div className="stat-section-title">{title}</div><div className="stat-section-sub">{sub}</div></div>
      </div>
      {children}
    </div>
  );
}

function StatsPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(()=>setTick(t=>t+1), 10000); return () => clearInterval(id); }, []);
  const subs = getSubmissions();
  const n = subs.length;
  const user = currentUser();

  if (!n) {
    return (
      <div className="app">
        <TopBar user={user} />
        <div className="main"><div className="no-subs">
          <div style={{fontSize:40,marginBottom:12}}>📊</div>
          <div style={{fontWeight:800,fontSize:18,marginBottom:6}}>Ingen tipp ennå</div>
          <div style={{fontSize:14}}>Statistikken vises når deltakerne begynner å levere.</div>
        </div></div>
      </div>
    );
  }

  // ── Seriemester ──
  const winnerCounts = {};
  subs.forEach(s => {
    const c = s.prediction?.plOrder?.[0];
    if (c) winnerCounts[c] = (winnerCounts[c]||0) + 1;
  });

  // ── Nedrykk (posisjoner 17-19, tell per lag) ──
  const relCounts = {};
  subs.forEach(s => {
    (s.prediction?.plOrder||[]).slice(17).forEach(c => {
      relCounts[c] = (relCounts[c]||0) + 1;
    });
  });

  // ── Opprykk ──
  const promoCounts = {};
  subs.forEach(s => {
    (s.prediction?.promotion||[]).forEach(c => {
      promoCounts[c] = (promoCounts[c]||0) + 1;
    });
  });

  // ── Spesialer ──
  const awardCounts = {};
  AWARDS_STAT.forEach(a => { awardCounts[a.key] = {}; });
  subs.forEach(s => {
    AWARDS_STAT.forEach(a => {
      const v = s.prediction?.awards?.[a.key];
      if (v) awardCounts[a.key][v] = (awardCounts[a.key][v]||0) + 1;
    });
  });

  const winTop = topN(winnerCounts, 3);
  const relTop = topN(relCounts, 3);
  const promoTop = topN(promoCounts, 3);

  return (
    <div className="app">
      <TopBar user={user} />
      <div className="main" style={{paddingBottom:60}}>

        <div style={{padding:'8px 0 14px'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--acc)',marginBottom:4}}>Statistikk</div>
          <h1 style={{fontSize:28,fontWeight:900,lineHeight:1.1,marginBottom:4}}>Hva tror folket?</h1>

        </div>

        {/* Seriemester */}
        <StatSection emoji="🏆" title="Mest tippet seriemester" sub="Hvem tror deltakerne vinner PL?">
          {winTop.map(([code,cnt],i)=>(
            <StatEntry key={code} rank={i+1}
              badge={<ClubBadge code={code} size={30} />}
              name={team(code)?.name||code} count={cnt} total={n} />
          ))}
          {winTop.length===0 && <div className="muted">Ingen data ennå</div>}
        </StatSection>

        {/* Nedrykk */}
        <StatSection emoji="⬇" title="Mest tippet til nedrykk" sub="Lagene flest tror havner i bunn 3">
          {relTop.map(([code,cnt],i)=>(
            <StatEntry key={code} rank={i+1}
              badge={<ClubBadge code={code} size={30} />}
              name={team(code)?.name||code} count={cnt} total={n*3} />
          ))}
          {relTop.length===0 && <div className="muted">Ingen data ennå</div>}
        </StatSection>

        {/* Opprykk */}
        <StatSection emoji="⬆" title="Mest tippet opprykkslag" sub="Championship-lag flest tror rykker opp">
          {promoTop.map(([code,cnt],i)=>(
            <StatEntry key={code} rank={i+1}
              badge={<ClubBadge code={code} size={30} />}
              name={team(code)?.name||code} count={cnt} total={n*3} />
          ))}
          {promoTop.length===0 && <div className="muted">Ingen data ennå</div>}
        </StatSection>

        {/* Spesialer */}
        {AWARDS_STAT.map(a => {
          const top = topN(awardCounts[a.key], 3).filter(([,c])=>c>0);
          if (!top.length) return null;
          return (
            <StatSection key={a.key} emoji={a.emoji} title={a.h} sub={a.d}>
              {top.map(([val,cnt],i)=>{
                const badge = a.isTeam
                  ? <ClubBadge code={val} size={28} />
                  : <span style={{width:28,height:28,borderRadius:8,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{a.emoji}</span>;
                const name = a.isTeam ? (team(val)?.name||val) : val;
                return <StatEntry key={val} rank={i+1} badge={badge} name={name} count={cnt} total={n} />;
              })}
            </StatSection>
          );
        })}

      </div>
    </div>
  );
}

function TopBar({ user }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark"><img src="assets/PL.png" alt="" /></div>
        <div className="brand-txt"><div className="brand-name">Statistikk</div><div className="brand-sub">PL 26/27 Tippekonk</div><div className="brand-by">av Jan Erlend Holmen</div></div>
      </div>
      <div className="top-spacer"></div>
      <div style={{display:'flex',gap:8}}>
        <a className="btn btn-ghost btn-sm" href="leaderboard.html">Tabell</a>
        <a className="btn btn-ghost btn-sm" href="index.html">Mitt tipp</a>
      </div>
    </div>
  );
}

bootStore(() => ReactDOM.createRoot(document.getElementById('root')).render(<StatsPage />));

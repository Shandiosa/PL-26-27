// ============================================================
//  Tabelltippen – Resultattabell (leaderboard)
// ============================================================
const { useState, useEffect } = React;

function anyPublished(res) {
  return res.published && Object.values(res.published).some(Boolean);
}

function Row({ entry, rank, me, live }) {
  const r = rank <= 3 ? `r${rank}` : '';
  const champ = entry.prediction?.plOrder?.[0];
  return (
    <div className={`lb-row ${r} ${me?'me':''}`}>
      <span className={`lb-rank ${r}`}>{rank}</span>
      {entry.favClub
        ? <ClubBadge code={entry.favClub} size={34} />
        : <span style={{width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,opacity:.5}}>⚽</span>}
      <span className="lb-who">
        <span className="lb-name">{entry.name}{me && <span className="pill ok" style={{marginLeft:6}}>DEG</span>}</span>
        <span className="lb-meta">
          {champ && <><ClubBadge code={champ} size={15} radius={4} />{' '}{team(champ)?.short} til topps</>}
        </span>
      </span>
      <span className="lb-score">{live ? entry.score : '–'}<span className="lbl">poeng</span></span>
    </div>
  );
}

function Leaderboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(()=>setTick(t=>t+1), 10000); return () => clearInterval(id); }, []);
  const me = currentUser();
  const results = getResults();
  const live = anyPublished(results);

  const entries = getSubmissions().map(s => {
    const user = findUser(s.email);
    const bd = breakdownScore(s.prediction, results);
    return { email:s.email, name:s.name, favClub:user?.favClub, prediction:s.prediction, score:bd.total, bd };
  }).sort((a,b)=> live ? b.score - a.score : a.name.localeCompare(b.name,'no'));

  const top = live ? (entries[0]?.score || 0) : 0;

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark"><img src="assets/PL.png" alt="" /></div>
          <div className="brand-txt">
            <div className="brand-name">Resultattabell</div>
            <div className="brand-sub">PL 26/27 Tippekonk</div>
            <div className="brand-by">av Jan Erlend Holmen</div>
          </div>
        </div>
        <div className="top-spacer"></div>
        <a className="btn btn-ghost btn-sm" href="stats.html">📈 Stats</a>
        <a className="btn btn-ghost btn-sm" href="index.html">Mitt tipp</a>
      </div>

      <div className="main" style={{paddingBottom:100}}>
        <div className="lb-hero" style={{padding:'8px 0 0'}}>
          <div className="lb-title">{live ? 'Stillingen' : 'Påmeldte'}</div>
          {results.snapshot?.active && results.snapshot?.note && (
            <div className="banner" style={{marginTop:8,marginBottom:4,fontSize:13}}>
              <span>📊</span>
              <span>Foreløpig stilling – om alt står seg slik det er <b>{results.snapshot.note}</b></span>
            </div>
          )}
          <div className="lb-sub">{live
            ? 'Poeng oppdateres etter hvert som fasit publiseres gjennom sesongen.'
            : 'Sesongen er ikke i gang ennå. Poeng vises når de første resultatene publiseres.'}</div>
        </div>

        <div className="lb-stats">
          <div className="lb-stat"><div className="n">{entries.length}</div><div className="l">Deltakere</div></div>
          <div className="lb-stat"><div className="n">{live ? top : '–'}</div><div className="l">Toppoeng</div></div>
        </div>

        {entries.length === 0 && <div className="empty">Ingen har levert tipp ennå.<br/>Bli den første!</div>}

        <div className="lb-list" style={{marginTop:10}}>
          {entries.map((e, i) => (
            <Row key={e.email} entry={e} rank={i+1} me={me && me.email===e.email} live={live} />
          ))}
        </div>
      </div>

      <div className="lb-actions"><div className="lb-actions-inner">
        <a className="btn btn-primary btn-block" href="index.html">Tilbake til tippingen</a>
      </div></div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Leaderboard />);

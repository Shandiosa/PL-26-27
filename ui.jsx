// ============================================================
//  Delte UI-komponenter: klubbmerke + spiller-autocomplete
//  Lastes som <script type="text/babel" src="ui.jsx">
// ============================================================
const { useState: useStateUI, useEffect: useEffectUI, useRef: useRefUI } = React;

// ── ClubBadge ────────────────────────────────────────────────
// Pr\u00f8ver \u00e5 laste ekte crest fra crests/<CODE>.png.
// Faller tilbake til et fargemerke med monogram dersom filen mangler.
// => Legg offisielle logoer i mappen "crests/" (f.eks. crests/ARS.png)
//    s\u00e5 dukker de opp automatisk, uten kodeendring.
function ClubBadge({ code, size = 40, radius }) {
  const t = (typeof team === 'function') ? team(code) : null;
  const [imgOk, setImgOk] = useStateUI(true);
  const r = radius != null ? radius : Math.round(size * 0.26);
  if (!t) {
    return <div style={{ width:size, height:size, borderRadius:r, background:'#2a2f2d' }} />;
  }
  const fontSize = Math.round(size * (t.short.length >= 3 ? 0.30 : 0.38));
  const useCrest = imgOk && (typeof hasCrest === 'function') && hasCrest(code);

  // Ekte crest: vis transparent PNG helt og uavkortet, uten fargebrikke/monogram
  if (useCrest) {
    return (
      <div style={{
        position:'relative', width:size, height:size, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <img src={`crests/${code}.png`} alt={t.name} onError={() => setImgOk(false)}
          style={{ width:'100%', height:'100%', objectFit:'contain',
                   filter:'drop-shadow(0 1px 2px rgba(0,0,0,.45))' }} />
      </div>
    );
  }

  return (
    <div style={{
      position:'relative', width:size, height:size, borderRadius:r, flexShrink:0,
      background:t.c1, color:t.tc, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'inset 0 0 0 1px rgba(255,255,255,.10), 0 1px 2px rgba(0,0,0,.3)',
    }}>
      {/* sekund\u00e6rfarge-aksent (gir merkene mer karakter) */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:Math.max(3, size*0.11), background:t.c2, opacity:.9 }} />
      <span style={{ fontFamily:'"Archivo", sans-serif', fontWeight:800, fontSize, letterSpacing:'-.02em', lineHeight:1, zIndex:1 }}>
        {t.short}
      </span>
    </div>
  );
}

// ── PlayerAutocomplete ───────────────────────────────────────
function PlayerAutocomplete({ value, onChange, placeholder, icon, searchFn }) {
  const [open, setOpen] = useStateUI(false);
  const wrapRef = useRefUI(null);
  const sfn = searchFn || (typeof searchPlayers === 'function' ? searchPlayers : () => []);
  const suggestions = sfn(value || '');
  useEffectUI(() => {
    function h(e){ if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, []);
  const show = open && (value || '').trim().length >= 1;
  const exact = (value||'').trim() && PLAYERS.some(p => p.name.toLowerCase() === value.trim().toLowerCase());
  return (
    <div ref={wrapRef} className="ac-wrap">
      <div className="ac-field">
        {icon && <span className="ac-icon">{icon}</span>}
        <input
          className="ac-input" value={value || ''} placeholder={placeholder} autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={e => { onChange(e.target.value); setOpen(true); }} />
        {value && <button className="ac-clear" onClick={() => { onChange(''); setOpen(false); }} aria-label="T\u00f8m">×</button>}
      </div>
      {show && (
        <div className="ac-drop">
          {suggestions.map((p, i) => (
            <div key={i} className="ac-item"
              onPointerDown={e => { e.preventDefault(); onChange(p.name); setOpen(false); }}>
              <ClubBadge code={p.team} size={26} />
              <div className="ac-meta">
                <div className="ac-name">{p.name}</div>
                <div className="ac-sub">{team(p.team)?.name} · {p.pos}</div>
              </div>
            </div>
          ))}
          {!exact && (value||'').trim() && (
            <div className="ac-free">
              <span>✎</span> Bruk «<b>{value.trim()}</b>» som eget svar
            </div>
          )}
          {suggestions.length === 0 && !(value||'').trim() && (
            <div className="ac-free">Begynn å skrive for forslag…</div>
          )}
        </div>
      )}
    </div>
  );
}


// ── TeamSelect – dropdown for PL-lag ──────────────────────────
function TeamSelect({ value, onChange }) {
  const sel = PL_TEAMS.find(t => t.code === value);
  return (
    <div className="ac-field" style={{position:'relative'}}>
      {sel && <span style={{marginLeft:4,display:'flex',alignItems:'center'}}><ClubBadge code={sel.code} size={22} /></span>}
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        className="ac-input sel-native" style={{paddingLeft: sel ? 6 : 14}}>
        <option value="">Velg lag…</option>
        {PL_TEAMS.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
      </select>
      <span style={{pointerEvents:'none',color:'var(--txt2)',paddingRight:12,fontSize:11}}>&#9660;</span>
    </div>
  );
}

// ── ManagerSelect – dropdown for managere ─────────────────────
function ManagerSelect({ value, onChange }) {
  return (
    <div className="ac-field" style={{position:'relative'}}>
      <select value={value||''} onChange={e=>onChange(e.target.value)}
        className="ac-input sel-native">
        <option value="">Velg manager…</option>
        {(typeof MANAGERS !== 'undefined' ? MANAGERS : []).map(m => (
          <option key={m.name} value={m.name}>{m.name} – {(typeof team==='function'&&team(m.team)?.short)||m.team}</option>
        ))}
      </select>
      <span style={{pointerEvents:'none',color:'var(--txt2)',paddingRight:12,fontSize:11}}>&#9660;</span>
    </div>
  );
}

Object.assign(window, { ClubBadge, PlayerAutocomplete, TeamSelect, ManagerSelect });

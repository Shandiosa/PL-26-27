// ============================================================
//  SortableTable – pointer-basert drag/drop for PL-tabellen
//  Touch + mus, auto-scroll mot skjermkant, opp/ned-knapper
//  som tilgjengelig backup. Live posisjonsnummer og soner.
// ============================================================
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS, useCallback: useCallbackS, memo: memoS } = React;

// Sone for en gitt 0-indeks (0 = 1.plass)
function zoneFor(i) {
  if (i === 0) return 'champion';
  if (i <= 4) return 'ucl';       // 1–5: Champions League (ca.)
  if (i === 5) return 'europa';   // 6: Europa
  if (i >= 17) return 'releg';    // 18–20: nedrykk
  return 'mid';
}
const ZONE_LABEL = { champion:'Mester', ucl:'Champions League', europa:'Europa', releg:'Nedrykk', mid:'' };

// Én rad – memoisert så bare raden som faktisk endrer seg re-rendres
const SRow = memoS(function SRow({ code, index, vi, zone, isDragging, translate, isFirst, isLast, firstRef, onUp, onDown, onHandleDown }) {
  const t = team(code);
  return (
    <div
      ref={firstRef}
      className={`srow zone-${zone} ${isDragging ? 'dragging' : ''}`}
      style={{
        transform: `translateY(${translate}px)`,
        transition: isDragging ? 'none' : 'transform .18s cubic-bezier(.2,.8,.2,1)',
        zIndex: isDragging ? 50 : 1,
      }}
    >
      <div className={`pos pos-${zone}`}>{vi + 1}</div>
      <ClubBadge code={code} size={34} />
      <div className="srow-name">
        <span className="srow-team">{t?.name}</span>
        {t?.promoted && <span className="tag-up">OPP</span>}
        {ZONE_LABEL[zone] && <span className={`zone-pill zp-${zone}`}>{ZONE_LABEL[zone]}</span>}
      </div>
      <div className="srow-arrows">
        <button className="arrow" aria-label="Opp" disabled={isFirst}
          onPointerDown={e => e.stopPropagation()} onClick={() => onUp(index)}>▲</button>
        <button className="arrow" aria-label="Ned" disabled={isLast}
          onPointerDown={e => e.stopPropagation()} onClick={() => onDown(index)}>▼</button>
      </div>
      <div className="handle" onPointerDown={e => onHandleDown(e, index)} aria-label="Dra for å flytte">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
});

function SortableTable({ order, onChange, rowHeight = 58 }) {
  const n = order.length;
  const [drag, setDrag] = useStateS(null); // { fromIndex, toIndex, startPageY, dy }
  const rowH = useRefS(rowHeight);
  const firstRowRef = useRefS(null);
  const lastClientY = useRefS(0);
  const rafRef = useRefS(0);

  useEffectS(() => {
    if (firstRowRef.current) {
      const h = firstRowRef.current.getBoundingClientRect().height;
      if (h) rowH.current = h;
    }
  });

  // Refs så drag-loopen aldri avhenger av ustabile prop-identiteter
  const orderRef = useRefS(order); orderRef.current = order;
  const onChangeRef = useRefS(onChange); onChangeRef.current = onChange;
  const nRef = useRefS(n); nRef.current = n;

  const move = useCallbackS((from, to) => {
    const cur = orderRef.current;
    if (to < 0 || to >= cur.length || to === from) return;
    const next = cur.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChangeRef.current(next);
  }, []);

  const moveUp   = useCallbackS(i => move(i, i - 1), [move]);
  const moveDown = useCallbackS(i => move(i, i + 1), [move]);

  // Oppdater dy/toIndex – returnerer samme objekt hvis ingenting endret seg
  const recompute = useCallbackS(() => {
    const pageY = lastClientY.current + window.scrollY;
    setDrag(d => {
      if (!d) return d;
      const dy = pageY - d.startPageY;
      const slots = Math.round(dy / rowH.current);
      const toIndex = Math.max(0, Math.min(nRef.current - 1, d.fromIndex + slots));
      if (d.dy === dy && d.toIndex === toIndex) return d;
      return { ...d, dy, toIndex };
    });
  }, []);

  const onHandleDown = useCallbackS((e, index) => {
    e.preventDefault();
    lastClientY.current = e.clientY;
    setDrag({ fromIndex: index, toIndex: index, startPageY: e.clientY + window.scrollY, dy: 0 });
    try { e.target.setPointerCapture?.(e.pointerId); } catch {}
  }, []);

  // Én effekt for hele dragen – kun avhengig av om vi drar eller ikke,
  // slik at rAF-kjeden aldri kanselleres midt i en drag.
  const dragging = !!drag;
  useEffectS(() => {
    if (!dragging) return;

    function onMove(e) { lastClientY.current = e.clientY; recompute(); }
    function onUp() {
      setDrag(d => { if (d && d.toIndex !== d.fromIndex) move(d.fromIndex, d.toIndex); return null; });
    }

    const EDGE = 110, BOTTOM_GAP = 150, MAX = 22;
    function tick() {
      const y = lastClientY.current, h = window.innerHeight;
      let v = 0;
      if (y < EDGE) v = -MAX * Math.min(1, (EDGE - y) / EDGE);
      else if (y > h - BOTTOM_GAP) v = MAX * Math.min(1, (y - (h - BOTTOM_GAP)) / EDGE);
      if (v) {
        const before = window.scrollY;
        window.scrollBy(0, v);
        if (window.scrollY !== before) recompute();
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive:false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, recompute, move]);

  // Visuell indeks (for live posisjonsnummer + forskyvning)
  function visualIndex(j) {
    if (!drag) return j;
    const { fromIndex, toIndex } = drag;
    if (j === fromIndex) return toIndex;
    if (fromIndex < toIndex && j > fromIndex && j <= toIndex) return j - 1;
    if (fromIndex > toIndex && j >= toIndex && j < fromIndex) return j + 1;
    return j;
  }

  return (
    <div className="sortable">
      {order.map((code, j) => {
        const vi = visualIndex(j);
        const isDragging = !!drag && drag.fromIndex === j;
        let translate = 0;
        if (drag) translate = isDragging ? drag.dy : (vi - j) * rowH.current;
        return (
          <SRow
            key={code}
            code={code}
            index={j}
            vi={vi}
            zone={zoneFor(vi)}
            isDragging={isDragging}
            translate={translate}
            isFirst={vi === 0}
            isLast={vi === n - 1}
            firstRef={j === 0 ? firstRowRef : null}
            onUp={moveUp}
            onDown={moveDown}
            onHandleDown={onHandleDown}
          />
        );
      })}
    </div>
  );
}

Object.assign(window, { SortableTable, zoneFor, ZONE_LABEL });

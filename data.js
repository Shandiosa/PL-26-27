// ============================================================
//  Premier League 26/27 – Tippekonkurranse
//  Statiske data: lag, farger, poengsystem
// ============================================================

// ── Premier League 2026/27 (20 lag) ──────────────────────────
// 17 som ble v\u00e6rende + opprykk: Coventry, Ipswich, Hull
// (erstatter West Ham, Wolves, Burnley)
const PL_TEAMS = [
  { code:'ARS', name:'Arsenal',                 short:'ARS', c1:'#EF0107', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'AVL', name:'Aston Villa',             short:'AVL', c1:'#670E36', c2:'#95BFE5', tc:'#95BFE5' },
  { code:'BOU', name:'Bournemouth',             short:'BOU', c1:'#D71920', c2:'#000000', tc:'#FFFFFF' },
  { code:'BRE', name:'Brentford',               short:'BRE', c1:'#E30613', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'BHA', name:'Brighton',                short:'BHA', c1:'#0057B8', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'CHE', name:'Chelsea',                 short:'CHE', c1:'#034694', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'COV', name:'Coventry City',           short:'COV', c1:'#4B92DB', c2:'#FFFFFF', tc:'#FFFFFF', promoted:true },
  { code:'CRY', name:'Crystal Palace',          short:'CRY', c1:'#1B458F', c2:'#C4122E', tc:'#FFFFFF' },
  { code:'EVE', name:'Everton',                 short:'EVE', c1:'#003399', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'FUL', name:'Fulham',                  short:'FUL', c1:'#E6E6E6', c2:'#000000', tc:'#16181A' },
  { code:'HUL', name:'Hull City',               short:'HUL', c1:'#F5A12D', c2:'#000000', tc:'#16181A', promoted:true },
  { code:'IPS', name:'Ipswich Town',            short:'IPS', c1:'#0044A9', c2:'#FFFFFF', tc:'#FFFFFF', promoted:true },
  { code:'LEE', name:'Leeds United',            short:'LEE', c1:'#1D428A', c2:'#FFE100', tc:'#FFE100' },
  { code:'LIV', name:'Liverpool',               short:'LIV', c1:'#C8102E', c2:'#F6EB61', tc:'#FFFFFF' },
  { code:'MCI', name:'Manchester City',         short:'MCI', c1:'#6CABDD', c2:'#1C2C5B', tc:'#0B1B3F' },
  { code:'MUN', name:'Manchester United',       short:'MUN', c1:'#DA291C', c2:'#FBE122', tc:'#FFFFFF' },
  { code:'NEW', name:'Newcastle United',        short:'NEW', c1:'#16181A', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'NFO', name:'Nottingham Forest',       short:'NFO', c1:'#DD0000', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'SUN', name:'Sunderland',              short:'SUN', c1:'#EB172B', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'TOT', name:'Tottenham Hotspur',       short:'TOT', c1:'#132257', c2:'#FFFFFF', tc:'#FFFFFF' },
];

// ── EFL Championship 2026/27 (24 lag) ────────────────────────
const CH_TEAMS = [
  { code:'BIR', name:'Birmingham City',          short:'BIR', c1:'#0000C4', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'BLB', name:'Blackburn Rovers',         short:'BLB', c1:'#009EE0', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'BOL', name:'Bolton Wanderers',         short:'BOL', c1:'#122B59', c2:'#C8102E', tc:'#FFFFFF', promoted:true },
  { code:'BRC', name:'Bristol City',             short:'BRC', c1:'#E21C38', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'BUR', name:'Burnley',                  short:'BUR', c1:'#6C1D45', c2:'#99D6EA', tc:'#99D6EA', relegated:true },
  { code:'CAR', name:'Cardiff City',             short:'CAR', c1:'#0070B5', c2:'#FFFFFF', tc:'#FFFFFF', promoted:true },
  { code:'CHA', name:'Charlton Athletic',        short:'CHA', c1:'#D4021D', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'DER', name:'Derby County',             short:'DER', c1:'#1D1D1B', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'LIN', name:'Lincoln City',             short:'LIN', c1:'#DA291C', c2:'#FFFFFF', tc:'#FFFFFF', promoted:true },
  { code:'MID', name:'Middlesbrough',            short:'MID', c1:'#E21C38', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'MIL', name:'Millwall',                 short:'MIL', c1:'#002D62', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'NOR', name:'Norwich City',             short:'NOR', c1:'#FFF200', c2:'#007A33', tc:'#00733B' },
  { code:'POR', name:'Portsmouth',               short:'POR', c1:'#001489', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'PNE', name:'Preston North End',        short:'PNE', c1:'#1B1F3B', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'QPR', name:'Queens Park Rangers',      short:'QPR', c1:'#1D5BA4', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'SHU', name:'Sheffield United',         short:'SHU', c1:'#EE2737', c2:'#000000', tc:'#FFFFFF' },
  { code:'SOU', name:'Southampton',              short:'SOU', c1:'#D71920', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'STO', name:'Stoke City',               short:'STO', c1:'#E03A3E', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'SWA', name:'Swansea City',             short:'SWA', c1:'#E6E6E6', c2:'#000000', tc:'#16181A' },
  { code:'WAT', name:'Watford',                  short:'WAT', c1:'#FBEE23', c2:'#11210F', tc:'#11210F' },
  { code:'WBA', name:'West Bromwich Albion',     short:'WBA', c1:'#122F67', c2:'#FFFFFF', tc:'#FFFFFF' },
  { code:'WHU', name:'West Ham United',          short:'WHU', c1:'#7A263A', c2:'#1BB1E7', tc:'#1BB1E7', relegated:true },
  { code:'WOL', name:'Wolverhampton Wanderers',  short:'WOL', c1:'#FDB913', c2:'#231F20', tc:'#231F20', relegated:true },
  { code:'WRX', name:'Wrexham',                  short:'WRX', c1:'#DD0000', c2:'#FFFFFF', tc:'#FFFFFF' },
];

// ── Ekte klubblogoer (crests) ────────────────────────────────
// Appen viser fargemerker med initialer som standard. Vil du bruke
// offisielle logoer: legg PNG-filer i mappen "crests/" (f.eks.
// crests/ARS.png) og f\u00f8r opp koden(e) her \u2013 eller sett CRESTS = 'ALL'
// for \u00e5 pr\u00f8ve \u00e5 laste alle. Da byttes fargemerket ut automatisk.
const CRESTS = ['ARS','AVL','BOU','BRE','BHA','CHE','COV','CRY','EVE','FUL','HUL','IPS','LEE','LIV','MCI','MUN','NEW','NFO','SUN','TOT']; // f.eks. ['ARS','LIV','MUN'] eller 'ALL'
function hasCrest(code) { return CRESTS === 'ALL' || (Array.isArray(CRESTS) && CRESTS.includes(code)); }

// Oppslag: code -> team (begge ligaer)
const TEAM_BY_CODE = {};
[...PL_TEAMS, ...CH_TEAMS].forEach(t => { TEAM_BY_CODE[t.code] = t; });
function team(code) { return TEAM_BY_CODE[code] || null; }

// ── Frist ────────────────────────────────────────────────────
// PL 26/27 starter l\u00f8rdag 22. august 2026. Frist: fredagen f\u00f8r.
const DEADLINE = new Date('2026-08-14T18:00:00');

// ── Admin-konto (kun denne får tilgang til adminpanel) ──────────
const ADMIN_EMAIL = 'j.e.holmen@gmail.com';

// ── PL-managere 26/27 ──────────────────────────────
// Komplett linje-up bekreftet av Premier League 13. juli 2026 (åtte nye)
const MANAGERS = [
  { name:'Mikel Arteta',      team:'ARS' },
  { name:'Unai Emery',        team:'AVL' },
  { name:'Marco Rose',        team:'BOU' },   // NY – erstattet Iraola
  { name:'Keith Andrews',     team:'BRE' },
  { name:'Fabian Hürzeler',   team:'BHA' },
  { name:'Xabi Alonso',       team:'CHE' },   // NY – fra juli 2026
  { name:'Frank Lampard',     team:'COV' },
  { name:'Pierre Sage',       team:'CRY' },   // NY – erstattet Glasner
  { name:'David Moyes',       team:'EVE' },
  { name:'Álvaro Arbeloa',    team:'FUL' },   // NY – fra juli 2026
  { name:'Sergej Jakirović',  team:'HUL' },
  { name:'Gary O\'Neil',      team:'IPS' },   // NY – McKenna trakk seg
  { name:'Daniel Farke',      team:'LEE' },
  { name:'Andoni Iraola',     team:'LIV' },   // NY – erstattet Slot
  { name:'Enzo Maresca',      team:'MCI' },   // NY – etterfulgte Guardiola
  { name:'Michael Carrick',   team:'MUN' },
  { name:'Eddie Howe',        team:'NEW' },
  { name:'Oliver Glasner',    team:'NFO' },   // NY – fra juli 2026
  { name:'Régis Le Bris',     team:'SUN' },
  { name:'Roberto De Zerbi',  team:'TOT' },   // NY – inn mot slutten av 25/26
];

// ── Poengsystem (kan justeres) ─────────────────────────
const SCORING = {
  table: { exact: 6, off1: 3, off2: 1 },
  championBonus: 10,
  relegationEach: 6,
  promotionEach: 6,
  awards: { scorer:15, assist:12, cards:10, player:15, redcard:6, keeper:12, leader3:6, firstfired:10 },
};

function tablePointsFor(predIdx, actualIdx) {
  const d = Math.abs(predIdx - actualIdx);
  if (d === 0) return SCORING.table.exact;
  if (d === 1) return SCORING.table.off1;
  if (d === 2) return SCORING.table.off2;
  return 0;
}

// ── Poengberegning for en innlevering mot fasit ──────────────
// prediction: { plOrder:[20 codes], promotion:[3 codes], awards:{scorer,assist,cards,player} }
// actual:     { plOrder:[20 codes]?, promotion:[3 codes]?, awards:{...}?, published:{...} }
//   actual.published = { table:bool, promotion:bool, scorer:bool, assist:bool, cards:bool, player:bool }
function calcScore(prediction, actual) {
  const bd = breakdownScore(prediction, actual);
  return bd.total;
}

function breakdownScore(prediction, actual) {
  const bd = {
    tablePts: 0, tableExact: 0, tableClose: 0,
    championPts: 0, relegationPts: 0, relegationHits: 0,
    promotionPts: 0, promotionHits: 0,
    awards: { scorer:0, assist:0, cards:0, player:0, redcard:0, keeper:0, leader3:0, firstfired:0 },
    total: 0,
  };
  if (!prediction || !actual) return bd;
  const pub = actual.published || {};

  // PL-tabell
  if (pub.table && Array.isArray(actual.plOrder) && actual.plOrder.length) {
    const actualIdx = {};
    actual.plOrder.forEach((c, i) => { actualIdx[c] = i; });
    (prediction.plOrder || []).forEach((code, predIdx) => {
      const ai = actualIdx[code];
      if (ai === undefined) return;
      const p = tablePointsFor(predIdx, ai);
      bd.tablePts += p;
      if (predIdx === ai) bd.tableExact++;
      else if (Math.abs(predIdx - ai) <= 2) bd.tableClose++;
    });
    // Serievinner-bonus
    if ((prediction.plOrder || [])[0] && prediction.plOrder[0] === actual.plOrder[0]) {
      bd.championPts = SCORING.championBonus;
    }
    // Nedrykk (bunn 3, uavhengig av rekkef\u00f8lge)
    const predRel = new Set((prediction.plOrder || []).slice(17));
    const actRel = (actual.plOrder || []).slice(17);
    actRel.forEach(code => { if (predRel.has(code)) { bd.relegationHits++; } });
    bd.relegationPts = bd.relegationHits * SCORING.relegationEach;
  }

  // Championship-opprykk
  if (pub.promotion && Array.isArray(actual.promotion) && actual.promotion.length) {
    const actSet = new Set(actual.promotion);
    (prediction.promotion || []).forEach(code => { if (actSet.has(code)) bd.promotionHits++; });
    bd.promotionPts = bd.promotionHits * SCORING.promotionEach;
  }

  // K\u00e5ringer
  const pa = prediction.awards || {};
  const aa = actual.awards || {};
  // Ved delt topplassering (uavgjort) skriver admin flere navn adskilt med komma i
  // fasitfeltet; alle som har tippet ETT av dem regnes som riktig.
  const match = (predVal, actVal) => {
    if (!predVal || !actVal) return false;
    const options = actVal.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return options.includes(predVal.trim().toLowerCase());
  };
  if (pub.scorer && match(pa.scorer, aa.scorer)) bd.awards.scorer = SCORING.awards.scorer;
  if (pub.assist && match(pa.assist, aa.assist)) bd.awards.assist = SCORING.awards.assist;
  if (pub.cards  && match(pa.cards,  aa.cards))  bd.awards.cards  = SCORING.awards.cards;
  if (pub.player && match(pa.player, aa.player)) bd.awards.player = SCORING.awards.player;
  if (pub.redcard    && match(pa.redcard,    aa.redcard))    bd.awards.redcard    = SCORING.awards.redcard;
  if (pub.keeper     && match(pa.keeper,     aa.keeper))     bd.awards.keeper     = SCORING.awards.keeper;
  if (pub.firstfired && match(pa.firstfired, aa.firstfired)) bd.awards.firstfired = SCORING.awards.firstfired;
  if (pub.leader3 && pa.leader3 && aa.leader3 && pa.leader3 === aa.leader3) bd.awards.leader3 = SCORING.awards.leader3;

  bd.total = bd.tablePts + bd.championPts + bd.relegationPts + bd.promotionPts
    + Object.values(bd.awards).reduce((a, b) => a + b, 0);
  return bd;
}

// Maks mulig poengsum (for visning)
function maxPossibleScore() {
  return 20 * SCORING.table.exact + SCORING.championBonus + 3 * SCORING.relegationEach
    + 3 * SCORING.promotionEach
    + Object.values(SCORING.awards).reduce((a, b) => a + b, 0);
}

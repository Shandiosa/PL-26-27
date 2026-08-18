// ============================================================
//  Premier League 26/27 – Spillere for autocomplete
//  Oppdatert 13. august 2026 (sommervinduet stenger 1. sept)
//  Listen er et utgangspunkt – deltakere kan også skrive fritt.
// ============================================================

const PLAYERS = [
  // Arsenal
  { name:'Bukayo Saka', team:'ARS', pos:'Kant' },
  { name:'Martin Ødegaard', team:'ARS', pos:'Midtbane' },
  { name:'Viktor Gyökeres', team:'ARS', pos:'Spiss' },
  { name:'Eberechi Eze', team:'ARS', pos:'Midtbane' },
  { name:'Kai Havertz', team:'ARS', pos:'Spiss' },
  { name:'Gabriel Martinelli', team:'ARS', pos:'Kant' },
  { name:'Declan Rice', team:'ARS', pos:'Midtbane' },
  { name:'Ethan Nwaneri', team:'ARS', pos:'Midtbane' },
  { name:'Christos Tzolis', team:'ARS', pos:'Kant' },
  { name:'Piero Hincapié', team:'ARS', pos:'Forsvar' },
  { name:'Bruno Guimarães', team:'ARS', pos:'Midtbane' },
  { name:'Fabio Vieira', team:'ARS', pos:'Midtbane' },
  // Aston Villa
  { name:'Ollie Watkins', team:'AVL', pos:'Spiss' },
  { name:'Evann Guessand', team:'AVL', pos:'Spiss' },
  { name:'Johan Manzambi', team:'AVL', pos:'Midtbane' },
  { name:'John McGinn', team:'AVL', pos:'Midtbane' },
  { name:'Leon Bailey', team:'AVL', pos:'Kant' },
  { name:'João Gomes', team:'AVL', pos:'Midtbane' },
  { name:'Alejandro Garnacho', team:'AVL', pos:'Kant' },
  { name:'Modou Kéba Cissé', team:'AVL', pos:'Forsvar' },
  { name:'Harvey Elliott', team:'AVL', pos:'Midtbane' },
  // Bournemouth
  { name:'Antoine Semenyo', team:'BOU', pos:'Kant' },
  { name:'Evanilson', team:'BOU', pos:'Spiss' },
  { name:'Justin Kluivert', team:'BOU', pos:'Midtbane' },
  { name:'Álvaro Rodríguez', team:'BOU', pos:'Spiss' },
  { name:'Antonio Silva', team:'BOU', pos:'Forsvar' },
  { name:'Juanlu Sánchez', team:'BOU', pos:'Forsvar' },
  // Brentford
  { name:'Yoane Wissa', team:'BRE', pos:'Spiss' },
  { name:'Kevin Schade', team:'BRE', pos:'Kant' },
  { name:'Jaidon Anthony', team:'BRE', pos:'Kant' },
  { name:'Callum Wilson', team:'BRE', pos:'Spiss' },
  { name:'Mamadou Sangaré', team:'BRE', pos:'Midtbane' },
  { name:'Jannik Schuster', team:'BRE', pos:'Forsvar' },
  // Brighton
  { name:'Kaoru Mitoma', team:'BHA', pos:'Kant' },
  { name:'Georginio Rutter', team:'BHA', pos:'Midtbane' },
  { name:'Evan Ferguson', team:'BHA', pos:'Spiss' },
  { name:'Zadok Yohanna', team:'BHA', pos:'Spiss' },
  { name:'Luka Vušković', team:'BHA', pos:'Forsvar' },
  { name:'Pascal Struijk', team:'BHA', pos:'Forsvar' },
  { name:'Jan Paul van Hecke', team:'BHA', pos:'Forsvar' },
  { name:'Costinha', team:'BHA', pos:'Forsvar' },
  { name:'Michael Svoboda', team:'BHA', pos:'Forsvar' },
  { name:'Rodrigo Rêgo', team:'BHA', pos:'Kant' },
  // Chelsea
  { name:'Cole Palmer', team:'CHE', pos:'Midtbane' },
  { name:'João Pedro', team:'CHE', pos:'Spiss' },
  { name:'Morgan Rogers', team:'CHE', pos:'Midtbane' },
  { name:'Estêvão', team:'CHE', pos:'Kant' },
  { name:'Liam Delap', team:'CHE', pos:'Spiss' },
  { name:'Emmanuel Emegha', team:'CHE', pos:'Spiss' },
  { name:'Danny Welbeck', team:'CHE', pos:'Spiss' },
  { name:'Jordan Henderson', team:'CHE', pos:'Midtbane' },
  { name:'Mykhailo Mudryk', team:'CHE', pos:'Kant' },
  { name:'Geovany Quenda', team:'CHE', pos:'Kant' },
  { name:'Enzo Fernández', team:'CHE', pos:'Midtbane' },
  { name:'Moisés Caicedo', team:'CHE', pos:'Midtbane' },
  { name:'Pedro Neto', team:'CHE', pos:'Kant' },
  { name:'Maxence Lacroix', team:'CHE', pos:'Forsvar' },
  { name:'Valentín Barco', team:'CHE', pos:'Midtbane' },
  { name:'Marc Palestra', team:'CHE', pos:'Forsvar' },
  { name:'Pep Chavarría', team:'CHE', pos:'Forsvar' },
  { name:'Nicolas Jackson', team:'CHE', pos:'Spiss' },
  // Coventry
  { name:'Haji Wright', team:'COV', pos:'Spiss' },
  { name:'Ellis Simms', team:'COV', pos:'Spiss' },
  { name:'Loum Tchaouna', team:'COV', pos:'Kant' },
  { name:'Frank Onyeka', team:'COV', pos:'Midtbane' },
  { name:'Gustavo Hamer', team:'COV', pos:'Midtbane' },
  { name:'Caleb Yirenkyi', team:'COV', pos:'Midtbane' },
  { name:'Aurèle Amenda', team:'COV', pos:'Forsvar' },
  // Crystal Palace
  { name:'Jean-Philippe Mateta', team:'CRY', pos:'Spiss' },
  { name:'Ismaïla Sarr', team:'CRY', pos:'Kant' },
  { name:'Adam Wharton', team:'CRY', pos:'Midtbane' },
  { name:'Matheus França', team:'CRY', pos:'Midtbane' },
  { name:'Dwight McNeil', team:'CRY', pos:'Kant' },
  { name:'Takehiro Tomiyasu', team:'CRY', pos:'Forsvar' },
  { name:'Oscar Mingueza', team:'CRY', pos:'Forsvar' },
  { name:'Evann Guessand', team:'CRY', pos:'Spiss' },
  // Everton
  { name:'Iliman Ndiaye', team:'EVE', pos:'Kant' },
  { name:'Jack Grealish', team:'EVE', pos:'Kant' },
  { name:'Beto', team:'EVE', pos:'Spiss' },
  { name:'Brennan Johnson', team:'EVE', pos:'Kant' },
  { name:'Merlin Röhl', team:'EVE', pos:'Midtbane' },
  { name:'Hayden Hackney', team:'EVE', pos:'Midtbane' },
  { name:'Tyrique George', team:'EVE', pos:'Kant' },
  { name:'Christian Nørgaard', team:'EVE', pos:'Midtbane' },
  // Fulham
  { name:'Rodrigo Muniz', team:'FUL', pos:'Spiss' },
  { name:'Alex Iwobi', team:'FUL', pos:'Midtbane' },
  { name:'Emile Smith Rowe', team:'FUL', pos:'Midtbane' },
  { name:'Jonah Kusi-Asare', team:'FUL', pos:'Spiss' },
  { name:'Gonzalo García', team:'FUL', pos:'Spiss' },
  { name:'Shea Charles', team:'FUL', pos:'Midtbane' },
  { name:'César Palacios', team:'FUL', pos:'Midtbane' },
  // Hull
  { name:'Enis Destan', team:'HUL', pos:'Spiss' },
  { name:'Hidemasa Morita', team:'HUL', pos:'Midtbane' },
  { name:'Oscar Zambrano', team:'HUL', pos:'Midtbane' },
  { name:'Matt Targett', team:'HUL', pos:'Forsvar' },
  { name:'Jack Butland', team:'HUL', pos:'Keeper' },
  // Ipswich
  { name:'Emersonn', team:'IPS', pos:'Spiss' },
  { name:'Chuba Akpom', team:'IPS', pos:'Spiss' },
  { name:'Daizen Maeda', team:'IPS', pos:'Kant' },
  { name:'Abdul Fatawu', team:'IPS', pos:'Kant' },
  { name:'Omari Hutchinson', team:'IPS', pos:'Midtbane' },
  { name:'Sasa Lukić', team:'IPS', pos:'Midtbane' },
  { name:'Issa Diop', team:'IPS', pos:'Forsvar' },
  { name:'Florentino Luís', team:'IPS', pos:'Midtbane' },
  // Leeds
  { name:'Joel Piroe', team:'LEE', pos:'Spiss' },
  { name:'Harry Wilson', team:'LEE', pos:'Kant' },
  { name:'Daniel James', team:'LEE', pos:'Kant' },
  { name:'Brenden Aaronson', team:'LEE', pos:'Midtbane' },
  { name:'Mateo Joseph', team:'LEE', pos:'Spiss' },
  { name:'Tarik Muharemović', team:'LEE', pos:'Forsvar' },
  { name:'James Trafford', team:'LEE', pos:'Keeper' },
  // Liverpool  (Mohamed Salah forlot klubben sommeren 2026)
  { name:'Alexander Isak', team:'LIV', pos:'Spiss' },
  { name:'Florian Wirtz', team:'LIV', pos:'Midtbane' },
  { name:'Hugo Ekitike', team:'LIV', pos:'Spiss' },
  { name:'Cody Gakpo', team:'LIV', pos:'Kant' },
  { name:'Dominik Szoboszlai', team:'LIV', pos:'Midtbane' },
  { name:'Víctor Muñoz', team:'LIV', pos:'Kant' },
  { name:'Jeremy Jacquet', team:'LIV', pos:'Forsvar' },
  { name:'Ronald Araújo', team:'LIV', pos:'Forsvar' },
  // Man City
  { name:'Erling Haaland', team:'MCI', pos:'Spiss' },
  { name:'Phil Foden', team:'MCI', pos:'Midtbane' },
  { name:'Rayan Cherki', team:'MCI', pos:'Midtbane' },
  { name:'Omar Marmoush', team:'MCI', pos:'Spiss' },
  { name:'Jérémy Doku', team:'MCI', pos:'Kant' },
  { name:'Savinho', team:'MCI', pos:'Kant' },
  { name:'Elliot Anderson', team:'MCI', pos:'Midtbane' },
  { name:'Rodri', team:'MCI', pos:'Midtbane' },
  { name:'Jeremy Monga', team:'MCI', pos:'Kant' },
  // Man Utd
  { name:'Bryan Mbeumo', team:'MUN', pos:'Kant' },
  { name:'Matheus Cunha', team:'MUN', pos:'Spiss' },
  { name:'Benjamin Šeško', team:'MUN', pos:'Spiss' },
  { name:'Bruno Fernandes', team:'MUN', pos:'Midtbane' },
  { name:'Amad Diallo', team:'MUN', pos:'Kant' },
  { name:'Marcus Rashford', team:'MUN', pos:'Kant' },
  { name:'Youri Tielemans', team:'MUN', pos:'Midtbane' },
  { name:'Andrey Santos', team:'MUN', pos:'Midtbane' },
  { name:'Karl Darlow', team:'MUN', pos:'Keeper' },
  // Newcastle  (Anthony Gordon solgt til Barcelona)
  { name:'Nick Woltemade', team:'NEW', pos:'Spiss' },
  { name:'Harvey Barnes', team:'NEW', pos:'Kant' },
  { name:'Jacob Murphy', team:'NEW', pos:'Kant' },
  { name:'Bazoumana Touré', team:'NEW', pos:'Kant' },
  { name:'Aladji Bamba', team:'NEW', pos:'Midtbane' },
  { name:'Sean Steur', team:'NEW', pos:'Midtbane' },
  { name:'Lukas Hornicek', team:'NEW', pos:'Keeper' },
  // Nottingham Forest
  { name:'Chris Wood', team:'NFO', pos:'Spiss' },
  { name:'Morgan Gibbs-White', team:'NFO', pos:'Midtbane' },
  { name:'Callum Hudson-Odoi', team:'NFO', pos:'Kant' },
  { name:'Arnaud Kalimuendo', team:'NFO', pos:'Spiss' },
  { name:'Xaver Schlager', team:'NFO', pos:'Midtbane' },
  { name:'Ousmane Diomande', team:'NFO', pos:'Forsvar' },
  // Sunderland
  { name:'Wilson Isidor', team:'SUN', pos:'Spiss' },
  { name:'Granit Xhaka', team:'SUN', pos:'Midtbane' },
  { name:'Simon Adingra', team:'SUN', pos:'Kant' },
  { name:'Enzo Le Fée', team:'SUN', pos:'Midtbane' },
  { name:'Thomas Meunier', team:'SUN', pos:'Forsvar' },
  // Tottenham  (Son Heung-min forlot klubben i 2025)
  { name:'Dominic Solanke', team:'TOT', pos:'Spiss' },
  { name:'Xavi Simons', team:'TOT', pos:'Midtbane' },
  { name:'Mohammed Kudus', team:'TOT', pos:'Kant' },
  { name:'James Maddison', team:'TOT', pos:'Midtbane' },
  { name:'Mateus Fernandes', team:'TOT', pos:'Midtbane' },
  { name:'Sandro Tonali', team:'TOT', pos:'Midtbane' },
  { name:'Andy Robertson', team:'TOT', pos:'Forsvar' },
  { name:'Marcos Senesi', team:'TOT', pos:'Forsvar' },
  { name:'Martin Dubravka', team:'TOT', pos:'Keeper' },
];

// ── API-oppdatering ────────────────────────────────────────
// Admin kan hente fersk troppsdata fra football-data.org. Resultatet lagres i
// nettleserens localStorage og overstyrer listene under – ingen filer trenger
// å endres. (Overstyringen er per nettleser inntil appen får en felles backend.)
const PLAYERS_OVERRIDE_LS = 'pl2627_players_override';
function getOverride() { try { return JSON.parse(localStorage.getItem(PLAYERS_OVERRIDE_LS) || 'null'); } catch(e) { return null; } }
function setPlayersOverride(data) { localStorage.setItem(PLAYERS_OVERRIDE_LS, JSON.stringify(data)); }
function clearPlayersOverride() { localStorage.removeItem(PLAYERS_OVERRIDE_LS); }
function effectivePlayers() { const o = getOverride(); return (o && o.players && o.players.length) ? o.players : PLAYERS; }
function effectiveKeepers() { const o = getOverride(); return (o && o.keepers && o.keepers.length) ? o.keepers : KEEPERS; }

// Enkelt søk: matcher på navn (delstreng), rangerer treff som starter med søkeord først
function searchPlayers(q) {
  q = (q || '').trim().toLowerCase();
  const list = effectivePlayers();
  if (!q) return list.slice(0, 8);
  const starts = [], contains = [];
  list.forEach(p => {
    const n = p.name.toLowerCase();
    if (n.startsWith(q)) starts.push(p);
    else if (n.includes(q)) contains.push(p);
  });
  return [...starts, ...contains].slice(0, 8);
}

// ── Keepere (PL 26/27) ───────────────────────────────────────
const KEEPERS = [
  { name:'David Raya',            team:'ARS' },
  { name:'Emiliano Martínez',     team:'AVL' },
  { name:'Đorđe Petrović',        team:'BOU' },
  { name:'Caoimhín Kelleher',     team:'BRE' },
  { name:'Bart Verbruggen',       team:'BHA' },
  { name:'Robert Sánchez',        team:'CHE' },
  { name:'Carl Rushworth',        team:'COV' },
  { name:'Dean Henderson',        team:'CRY' },
  { name:'Jordan Pickford',       team:'EVE' },
  { name:'Bernd Leno',            team:'FUL' },
  { name:'Jack Butland',          team:'HUL' },
  { name:'Konstantinos Tzolakis', team:'HUL' },
  { name:'Kjell Scherpen',        team:'IPS' },
  { name:'James Trafford',        team:'LEE' },
  { name:'Alisson',               team:'LIV' },
  { name:'Giorgi Mamardashvili',  team:'LIV' },
  { name:'Gianluigi Donnarumma',  team:'MCI' },
  { name:'Gerónimo Rulli',        team:'MCI' },
  { name:'Senne Lammens',         team:'MUN' },
  { name:'Karl Darlow',           team:'MUN' },
  { name:'Nick Pope',             team:'NEW' },
  { name:'Lukas Hornicek',        team:'NEW' },
  { name:'Matz Sels',             team:'NFO' },
  { name:'Robin Roefs',           team:'SUN' },
  { name:'Guglielmo Vicario',     team:'TOT' },
  { name:'Martin Dubravka',       team:'TOT' },
];
function searchKeepers(q) {
  q = (q || '').trim().toLowerCase();
  const list = effectiveKeepers();
  if (!q) return list.slice(0, 8);
  const starts = [], contains = [];
  list.forEach(p => {
    const n = p.name.toLowerCase();
    if (n.startsWith(q)) starts.push(p);
    else if (n.includes(q)) contains.push(p);
  });
  return [...starts, ...contains].slice(0, 8);
}

// Utespillere + keepere samlet – for kåringer der en keeper også er et gyldig svar
// (kortpoeng, Årets spiller, første røde kort).
function searchAllPlayers(q) {
  q = (q || '').trim().toLowerCase();
  const all = [...effectivePlayers(), ...effectiveKeepers().map(k => ({ ...k, pos: k.pos || 'Keeper' }))];
  if (!q) return all.slice(0, 8);
  const starts = [], contains = [];
  all.forEach(p => {
    const n = p.name.toLowerCase();
    if (n.startsWith(q)) starts.push(p);
    else if (n.includes(q)) contains.push(p);
  });
  return [...starts, ...contains].slice(0, 8);
}

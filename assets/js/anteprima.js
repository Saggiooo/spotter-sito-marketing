/* ============================================================
   SPOTTER — helper condivisi delle anteprime app (anteprima/*.html)
   Copia del mockup originale: dati e account sono simulati.
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const USER_POS = [45.4642, 9.1900]; // Duomo — posizione utente simulata

/* ---------- Geo ---------- */
function distKm(lat, lng) {
  const R = 6371, toR = d => d * Math.PI / 180;
  const dLat = toR(lat - USER_POS[0]), dLng = toR(lng - USER_POS[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(USER_POS[0])) * Math.cos(toR(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
const fmtKm = km => km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;
const mapsUrl = g => `https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}`;

/* ---------- Orari ---------- */
function hoursFor(g, d = new Date()) {
  if (g.hours === '24h') return ['00:00', '24:00'];
  const day = d.getDay();
  return day === 0 ? g.hours.sun : day === 6 ? g.hours.sat : g.hours.wk;
}
function openStatus(g, d = new Date()) {
  if (g.hours === '24h') return { open: true, label: 'Aperto 24 ore su 24' };
  const h = hoursFor(g, d);
  if (!h) return { open: false, label: 'Chiuso oggi' };
  const toMin = s => { const [a, b] = s.split(':').map(Number); return a * 60 + b; };
  const now = d.getHours() * 60 + d.getMinutes();
  const [o, c] = h.map(toMin);
  if (now >= o && now < c) {
    const soon = c - now <= 60;
    return { open: true, soon, label: soon ? `Chiude presto · ${h[1]}` : `Aperto · chiude alle ${h[1]}` };
  }
  return { open: false, label: now < o ? `Chiuso · apre alle ${h[0]}` : 'Chiuso · apre domani' };
}

/* ---------- Preferiti ---------- */
function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) { return null; }
}
const getFavs = () => store('spotter_favs') || ['ferro', 'forma'];
function toggleFav(id) {
  const f = getFavs();
  const i = f.indexOf(id);
  i >= 0 ? f.splice(i, 1) : f.push(id);
  store('spotter_favs', f);
  return i < 0;
}

/* ---------- Sessione (finta, solo UI) ---------- */
const getSession = () => store('spotter_session');
const setSession = s => store('spotter_session', s);
function logout() { try { localStorage.removeItem('spotter_session'); } catch (e) {} location.href = 'account.html'; }
const getMyGym = () => store('spotter_my_gym');
const setMyGym = g => store('spotter_my_gym', g);
const accountHome = () => { const s = getSession(); return !s ? 'account.html' : s.role === 'gym' ? 'gestione.html' : 'profilo.html'; };
// la palestra registrata dall'app finisce nella coda "In verifica" dell'admin
function pushToAdmin(g, status) {
  const over = store('spotter_admin_gyms') || {};
  over[g.id] = { ...g, _new: !GYMS.find(x => x.id === g.id), _status: status, _plan: g._plan || 'base', _owner: (getSession() || {}).name || '—', _updated: 'adesso' };
  store('spotter_admin_gyms', over);
}

/* ---------- Filtri ---------- */
const DEFAULT_FILTERS = {
  q: '', types: [], equip: [], priceMax: 100, distMax: null,
  trial: false, openNow: false, h24: false, amenities: [], rating: 0, dbMax: 0, women: false,
};
const loadFilters = () => ({ ...DEFAULT_FILTERS, ...(store('spotter_filters') || {}) });
const saveFilters = f => store('spotter_filters', f);

function gymMatches(g, f) {
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [g.name, g.type, g.area, ...g.equipment.map(e => EQUIP[e[0]].name)].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.types.length && !f.types.includes(g.type)) return false;
  const ids = g.equipment.map(e => e[0]);
  if (f.equip.some(e => !ids.includes(e))) return false;
  if (f.priceMax < 100 && g.price > f.priceMax) return false;
  if (f.distMax && distKm(g.lat, g.lng) > f.distMax) return false;
  if (f.trial && !g.trial) return false;
  if (f.openNow && !openStatus(g).open) return false;
  if (f.h24 && g.hours !== '24h') return false;
  if (f.amenities.some(a => !g.amenities.includes(a))) return false;
  if (f.rating && g.rating < f.rating) return false;
  if (f.dbMax && eqMaxKg(g, 'manubri') < f.dbMax) return false;
  if (f.women && !['area-donne', 'solo-donne'].includes(g.gender)) return false;
  return true;
}
function activeFilterCount(f) {
  return f.types.length + f.equip.length + f.amenities.length +
    (f.priceMax < 100) + (!!f.distMax) + f.trial + f.openNow + f.h24 + (!!f.rating) + (!!f.dbMax) + (!!f.women);
}

/* ---------- UI bits ---------- */
function starsHtml(r, size = 13) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const fill = Math.max(0, Math.min(1, r - i + 1));
    s += `<span class="star" style="--f:${fill * 100}%;width:${size}px;height:${size}px"></span>`;
  }
  return `<span class="stars">${s}</span>`;
}

function toast(msg) {
  let t = $('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    $('.screen').appendChild(t);
  }
  t.innerHTML = `${ui('check', 16)}<span>${msg}</span>`;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

function initials(name) { return name.split(' ').map(p => p[0]).join('').slice(0, 2); }

/* ---------- Bottom sheet ---------- */
function openSheet(html, cls = '') {
  closeSheet(true);
  const scr = $('.screen');
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-scrim"></div><div class="sheet ${cls}"><div class="sheet-grab"></div>${html}</div>`;
  scr.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  $('.sheet-scrim', wrap).onclick = () => closeSheet();
  $$('[data-close]', wrap).forEach(b => b.onclick = () => closeSheet());
  return wrap;
}
function closeSheet(instant) {
  const w = $('.sheet-wrap');
  if (!w) return;
  if (instant) return w.remove();
  w.classList.remove('open');
  setTimeout(() => w.remove(), 380);
}

/* ---------- Shell: status bar, tab bar, deck desktop ---------- */
const SCREENS = [
  ['App'],
  ['index.html', 'Mappa'],
  ['cerca.html', 'Cerca & filtri'],
  ['palestra.html?id=ferro', 'Pagina palestra'],
  ['salvate.html', 'Salvate'],
  ['Account'],
  ['account.html', 'Benvenuto / accedi'],
  ['registrati.html?tipo=utente', 'Registrazione utente'],
  ['registrati.html?tipo=palestra', 'Registrazione palestra'],
  ['palestra-nuova.html', 'Inserisci palestra'],
  ['rivendica.html?id=dock', 'Rivendica palestra'],
  ['profilo.html', 'Profilo utente'],
  ['gestione.html', 'Gestione palestra'],
  ['business.html', 'Piani business'],
];

function mountShell(active) {
  const scr = $('.screen');
  // status bar
  const sb = document.createElement('div');
  sb.className = 'statusbar' + (scr.dataset.status === 'light' ? ' light' : '');
  sb.innerHTML = `<span class="sb-time">9:41</span><span class="island"></span>
    <span class="sb-icons">
      <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="6" rx="1"/><rect x="10" y="2.5" width="3" height="8.5" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.1-1.1A10 10 0 0 0 8 .6 10 10 0 0 0 .9 3.5L2 4.6a8.5 8.5 0 0 1 6-2.4zm0 3.2c1.4 0 2.7.5 3.7 1.4l1.1-1.1A7 7 0 0 0 8 3.8a7 7 0 0 0-4.8 1.9l1.1 1.1c1-.9 2.3-1.4 3.7-1.4zM8 8.6c.6 0 1.1.2 1.5.6L8 10.8 6.5 9.2c.4-.4.9-.6 1.5-.6z"/></svg>
      <svg width="27" height="12" viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2"/><path d="M24 4v4c.8-.3 1.5-1 1.5-2s-.7-1.7-1.5-2z" opacity=".4"/></svg>
    </span>`;
  scr.prepend(sb);

  // status bar "solida" quando il contenuto scorre sotto
  const sc = $('.scroll', scr);
  const darkHero = $('.biz-hero', scr);
  if (sc && !$('.compact-bar', scr)) {
    sc.addEventListener('scroll', () => {
      const overDark = darkHero && sc.scrollTop < darkHero.offsetHeight - 54;
      sb.classList.toggle('solid', sc.scrollTop > 8 && !overDark);
      sb.classList.toggle('light', !!overDark);
    }, { passive: true });
  }

  // tab bar
  const tb = $('#tabbar');
  if (tb) {
    const ses = getSession();
    const tabs = [['index.html', 'map', 'Esplora'], ['cerca.html', 'search', 'Cerca'], ['salvate.html', 'heart', 'Salvate'], [accountHome(), 'user', 'Account', 'account.html']];
    tb.className = 'tabbar';
    tb.innerHTML = tabs.map(([h, i, l, key]) => {
      const on = (key || h) === active;
      const ic = key && ses ? `<span class="tab-av ${ses.role === 'gym' ? 'gym' : ''}">${initials(ses.name || 'U')}</span>` : ui(i, 22);
      return `<a href="${h}" class="tab ${on ? 'on' : ''}">${ic}<span>${l}</span></a>`;
    }).join('');
  }

  // deck desktop
  const deck = document.createElement('aside');
  deck.className = 'deck';
  deck.innerHTML = `
    <div class="deck-brand"><span class="logo-dot"></span>SPOTTER</div>
    <p class="deck-sub">La mappa delle palestre.<br>Bozza UI mobile · v0.1</p>
    <nav class="deck-nav">${(() => { let n = 0; const here = location.pathname.split('/').pop() + location.search; return SCREENS.map(([h, t]) => !t
      ? `<span class="deck-grp">${h}</span>`
      : `<a href="${h}" class="${h === here || (h.split('?')[0] === here.split('?')[0] && !h.includes('?')) ? 'on' : ''}"><span class="n">${String(++n).padStart(2, '0')}</span><b>${t}</b></a>`).join(''); })()}
    </nav>
    <button class="deck-reset" id="deckReset">Reset demo (esci + svuota dati)</button>
    <div class="deck-swatches">
      <span style="--c:#EFEBE2"></span><span style="--c:#FBF9F4"></span><span style="--c:#121211"></span><span style="--c:#D8FF3C"></span><span style="--c:#1E9E5A"></span>
    </div>
    <p class="deck-foot">Archivo Expanded · Instrument Sans · Martian Mono</p>`;
  document.body.prepend(deck);
  $('#deckReset').onclick = () => {
    ['spotter_session', 'spotter_my_gym', 'spotter_bookings', 'spotter_filters', 'spotter_claim'].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    location.href = 'account.html';
  };
}

/* ---------- Tile mappa (Esri Light Gray, senza API key) ---------- */
function addTiles(map) {
  const base = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  L.tileLayer(base + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, maxNativeZoom: 16, attribution: '© Esri · OpenStreetMap',
  }).addTo(map);
  L.tileLayer(base + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, maxNativeZoom: 16, pane: 'overlayPane', className: 'tile-labels',
  }).addTo(map);
}

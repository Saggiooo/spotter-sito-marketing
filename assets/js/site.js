/* ============================================================
   SPOTTER — sito
   Dipende da assets/js/data.js e assets/js/icons.js (caricati prima in index.html)
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

UI_ICONS.play = '<path d="M5 3.8v16.4a1 1 0 0 0 1.5.9l13.7-8.2a1 1 0 0 0 0-1.8L6.5 2.9A1 1 0 0 0 5 3.8z"/>';

/* ---------- icone ---------- */
$$('[data-ui]').forEach(el => el.innerHTML = ui(el.dataset.ui, el.closest('.f-pin') ? 18 : el.closest('.checks, .mini-ticket') ? 15 : 20));
$$('[data-eq]').forEach(el => el.innerHTML = eqIcon(el.dataset.eq, 28));

/* ---------- cursore ---------- */
if (fine && !reduce) {
  document.body.classList.add('has-cursor');
  const c = $('#cursor'), d = $('#cursorDot');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`; });
  (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    const big = e.target.closest('a, button, .pk, .qa, iframe');
    const txt = !big && e.target.closest('input');
    c.classList.toggle('big', !!big);
    c.classList.toggle('text', !!txt);
  });
} else { $('#cursor').remove(); $('#cursorDot').remove(); }

/* ---------- bottoni magnetici ---------- */
if (fine && !reduce) $$('[data-magnet]').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
  });
  b.addEventListener('mouseleave', () => b.style.transform = '');
});

/* ---------- nav, progress, menu ---------- */
let lastY = 0;
function onScrollNav() {
  const y = scrollY;
  $('#nav').classList.toggle('solid', y > 30);
  $('#nav').classList.toggle('hide', y > 500 && y > lastY && !document.body.classList.contains('menu-open'));
  lastY = y;
  $('#progress').style.transform = `scaleX(${y / (document.documentElement.scrollHeight - innerHeight)})`;
}
$('#burger').onclick = () => document.body.classList.toggle('menu-open');
$$('#mmenu a').forEach(a => a.onclick = () => document.body.classList.remove('menu-open'));

/* ---------- parola che ruota ---------- */
const WORDS = ['lo squat rack.', 'la leg press.', 'la prova gratis.', 'i manubri da 60.', 'la piscina.', 'l\'area donne.', 'orari 24/7.'];
let wi = 0;
if (!reduce) setInterval(() => {
  const rot = $('#rot');
  const old = $('.w:not(.out)', rot);
  wi = (wi + 1) % WORDS.length;
  const nw = document.createElement('span');
  nw.className = 'w in'; nw.textContent = WORDS[wi];
  old.classList.add('out');
  rot.appendChild(nw);
  setTimeout(() => old.remove(), 460);
}, 2300);

/* ---------- telefono 3D + elementi fluttuanti ---------- */
const stage = $('#stage'), phone = $('#heroPhone');
if (fine && !reduce) {
  stage.addEventListener('mousemove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    phone.style.transform = `rotateY(${-14 + px * 26}deg) rotateX(${6 - py * 18}deg) rotateZ(${2 - px * 4}deg)`;
    $$('.float', stage).forEach(f => { const k = +f.dataset.depth; f.style.transform = `translate(${px * k}px, ${py * k}px)`; });
  });
  stage.addEventListener('mouseleave', () => { phone.style.transform = ''; $$('.float', stage).forEach(f => f.style.transform = ''); });
}

/* ---------- marquee ---------- */
const BAND1 = ['squat-rack', 'leg-press', 'manubri', 'hack', 'panca', 'cavi', 'pendulum', 'vogatore', 'pec-deck', 'kettlebell'];
const BAND2 = ['tapis', 'sacco', 'trazioni', 'pedana', 'leg-curl', 'air-bike', 'box', 'smith', 'rope', 'skierg'];
const bandHtml = ids => ids.map(id => `<span class="it">${eqIcon(id, 40)}${EQUIP[id].name}<span class="sep"></span></span>`).join('');
$('#band1').innerHTML = bandHtml(BAND1).repeat(2);
$('#band2').innerHTML = bandHtml(BAND2).repeat(2);

/* ---------- manifesto: parole che si accendono con lo scroll ---------- */
const scrub = $('#scrub');
scrub.innerHTML = scrub.textContent.split(/(\[[^\]]+\]|\s+)/).filter(Boolean).map(t => {
  if (/^\s+$/.test(t)) return ' ';
  if (t.startsWith('[')) return t.slice(1, -1).split(' ').map(w => `<span class="wd hl">${w}</span>`).join(' ');
  return `<span class="wd">${t}</span>`;
}).join('');
const words = $$('.wd', scrub);
function onScrollScrub() {
  const r = scrub.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
  const n = Math.round(p * words.length);
  words.forEach((w, i) => w.classList.toggle('on', i < n));
}

/* ---------- filtro interattivo (dati demo) ---------- */
const PICK = ['squat-rack', 'pedana', 'panca', 'smith', 'leg-press', 'cavi', 'lat', 'tapis', 'vogatore', 'air-bike', 'kettlebell', 'sacco'];
const sel = new Set(['squat-rack']);
let kgMin = 0, shown = GYMS.length;
$('#pick').innerHTML = PICK.map((id, i) => `<button class="pk rv ${sel.has(id) ? 'on' : ''}" data-id="${id}" style="--d:${i * .03}s"><span class="ck">${ui('check', 12)}</span>${eqIcon(id, 40)}${EQUIP[id].name}</button>`).join('');
$$('#pick .pk').forEach(b => b.onclick = () => { sel.has(b.dataset.id) ? sel.delete(b.dataset.id) : sel.add(b.dataset.id); b.classList.toggle('on'); runFilter(); });
$('#kg').oninput = e => {
  kgMin = +e.target.value;
  e.target.style.setProperty('--p', (kgMin / 60 * 100) + '%');
  $('#kgV').textContent = kgMin ? `${kgMin} kg` : 'Tutti';
  runFilter();
};
function animateNum(el, to) {
  const from = +el.textContent || 0;
  if (from === to) return;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  const t0 = performance.now(), dur = 450;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function runFilter() {
  const res = GYMS.filter(g => [...sel].every(id => g.equipment.some(e => e[0] === id)) && (!kgMin || eqMaxKg(g, 'manubri') >= kgMin))
    .sort((a, b) => a.price - b.price);
  animateNum($('#count'), res.length);
  $('#countL').innerHTML = res.length === 1 ? 'palestra di esempio<br>ha tutto questo' : res.length ? 'palestre di esempio<br>hanno tutto questo' : 'palestre, per ora.<br>Togli qualcosa.';
  $('#resList').innerHTML = res.length ? res.slice(0, 4).map((g, i) => `
    <div class="rc" style="--d:${i * .06}s"><img src="${photo(g.photos[0], 160)}" alt="" loading="lazy">
      <span><b>${g.name}</b><small>${g.type} · ${g.area}${eqMaxKg(g, 'manubri') ? ` · manubri fino a ${eqMaxKg(g, 'manubri')} kg` : ''}</small></span>
      <span class="pr">€${g.price}<small>/mese</small></span></div>`).join('')
    : `<div class="res-empty">Nessuna palestra di esempio ha tutti questi attrezzi.</div>`;
  $('#resMore').textContent = res.length > 4 ? `+ altre ${res.length - 4}` : sel.size ? `${sel.size} attrezzi selezionati` : 'Nessun filtro';
}
runFilter();

/* ---------- dentro l'app: scroll orizzontale ---------- */
const inside = $('#dentro'), track = $('#htrack');
let framesLoaded = false;
function loadFrames() { if (framesLoaded) return; framesLoaded = true; $$('iframe[data-src]', inside).forEach(f => f.src = f.dataset.src); }
function onScrollInside() {
  const r = inside.getBoundingClientRect();
  if (r.top < innerHeight * 2) loadFrames();
  if (innerWidth < 900) return;
  const total = inside.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  const max = track.scrollWidth - innerWidth;
  track.style.transform = `translateX(${-p * max}px)`;
  $('#bigword').style.transform = `translate(${-p * 40}vw, -50%)`;
  $('#hbar').style.transform = `scaleX(${p})`;
}

/* ---------- come funziona: mini animazioni ---------- */
const TYPED = ['Navigli', 'squat rack', 'Isola', 'piscina', 'sotto 40 €'];
let ti = 0, tc = 0, del = false;
(function type() {
  const w = TYPED[ti];
  if (!del) { tc++; if (tc > w.length) { del = true; return setTimeout(type, 1300); } }
  else { tc--; if (tc === 0) { del = false; ti = (ti + 1) % TYPED.length; } }
  $('#typed').textContent = w.slice(0, tc);
  setTimeout(type, del ? 45 : 95);
})();
if (!reduce) setInterval(() => { const cs = $$('[data-chip]'); cs[Math.floor(Math.random() * cs.length)].classList.toggle('on'); }, 1100);

/* ---------- contatori ---------- */
function countUp(el) {
  const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(to * e) + suf;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- dashboard palestre ---------- */
$('#dashImg').src = photo(5, 160);
$('#dashEq').innerHTML = [['squat-rack', 'Squat rack', '×3'], ['manubri', 'Manubri', '2–40 kg'], ['leg-press', 'Leg press', '×2']]
  .map(([id, name, v], i) => `<div style="transition-delay:${i * .08}s">${eqIcon(id, 26)}<b>${name}</b><span>${v}</span></div>`).join('');

/* ---------- FAQ ---------- */
const QA = [
  ['Spotter è gratis?', 'Sì, per chi si allena è gratis: cercare, filtrare, salvare palestre e chiedere prove gratuite. Le palestre stanno sulla mappa gratis con il piano Free, oppure scelgono Plus, Advance o Max per avere più foto, contatti diretti e visibilità.'],
  ['Da dove arrivano le informazioni sulle palestre?', 'Le schede le cura il nostro staff, partendo dalle informazioni pubbliche delle palestre e da quelle che ci inviano i titolari. Se qualcosa non torna, puoi segnalarlo direttamente dalla scheda.'],
  ['In quali città funziona?', 'Siamo partiti da Bologna e Milano, con le rispettive province, e stiamo aggiungendo altre zone.'],
  ['C\'è un\'app da scaricare?', 'Per ora Spotter funziona dal browser, sia da telefono sia da computer, senza installare nulla. Le app per iPhone e Android sono i prossimi passi.'],
  ['Ho una palestra: come la aggiungo?', 'Registrati come palestra e cerca il nome: se è già sulla mappa la rivendichi, altrimenti ci invii attrezzi, prezzi e orari. Il nostro staff verifica i dati e pubblica la scheda; le foto le carichiamo insieme a te.'],
];
$('#qas').innerHTML = QA.map(([q, a], i) => `<div class="qa ${i === 0 ? 'open' : ''}"><button>${q}<span class="pm">${ui('plus', 20)}</span></button><div class="ans"><div><p>${a}</p></div></div></div>`).join('');
$$('.qa button').forEach(b => b.onclick = () => b.parentElement.classList.toggle('open'));

/* ---------- mega wordmark ---------- */
$('#mega').innerHTML = 'SPOTTER'.split('').map(c => `<span>${c}</span>`).join('') + '<span class="pin-dot"></span>';

/* ---------- reveal + contatori al primo ingresso ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.dataset.count) countUp(e.target);
  if (e.target.querySelector && e.target.querySelector('[data-count]')) countUp(e.target.querySelector('[data-count]'));
  io.unobserve(e.target);
}), { threshold: .2 });
$$('.rv, #dash').forEach(el => io.observe(el));

/* ---------- loop scroll ---------- */
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { onScrollNav(); onScrollScrub(); onScrollInside(); ticking = false; });
}, { passive: true });
addEventListener('resize', onScrollInside);
onScrollNav(); onScrollScrub(); onScrollInside();

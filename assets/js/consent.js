/* ============================================================
   SPOTTER — consenso cookie
   - Nessun cookie o script non necessario prima della scelta.
   - La scelta resta nel cookie tecnico gs_consent per 180 giorni,
     poi il banner viene riproposto (anche se cambia CFG.version).
   - Ogni scelta viene registrata da api/consent.php come prova del
     consenso (ID casuale, data, scelta, IP troncato, browser).
   - Chiudere il banner con la X equivale a rifiutare i cookie facoltativi.
   Qualsiasi link o pulsante con [data-consent-open] riapre le preferenze.
   ============================================================ */
(() => {
  'use strict';

  const CFG = {
    version: '2026-10-21',           // da aumentare quando cambiano categorie o cookie policy
    cookie: 'gs_consent',
    days: 180,
    logUrl: '/api/consent.php',
    policyUrl: '/cookie-policy',
    googleAdsId: '',                 // es. 'AW-123456789': vuoto = nessuno script Google
  };

  const NECESSARY = [
    ['gs_consent', 'gymspotter.it', 'Cookie tecnico', 'Ricorda la tua scelta sui cookie e l’ID del consenso.', '180 giorni'],
    ['spotter_*', 'gymspotter.it', 'Archiviazione locale', 'Stato delle anteprime interattive dell’app (palestre salvate, filtri di prova). Non lascia il tuo dispositivo.', 'Finché non lo cancelli'],
  ];
  const MARKETING = [
    ['_gcl_au', 'gymspotter.it', 'Google Ads', 'Collega le visite al sito agli annunci Google Ads (conversioni).', '90 giorni'],
    ['_gcl_aw', 'gymspotter.it', 'Google Ads', 'Memorizza il clic su un annuncio con cui sei arrivato sul sito.', '90 giorni'],
    ['IDE', 'doubleclick.net', 'Google Ads', 'Misura l’efficacia degli annunci e permette il remarketing.', '13 mesi'],
    ['test_cookie', 'doubleclick.net', 'Google Ads', 'Verifica che il browser accetti i cookie.', '15 minuti'],
  ];

  /* ---------- utilità ---------- */
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    el.append(...kids.flat().filter(k => k != null && k !== false));
    return el;
  };
  const svgX = () => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '22'); s.setAttribute('height', '22');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2.2'); s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M6 6l12 12M18 6L6 18');
    s.append(p);
    return s;
  };
  const uuid = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const x = [...b].map(n => n.toString(16).padStart(2, '0')).join('');
    return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
  };
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  /* ---------- cookie della scelta ---------- */
  function read() {
    const m = document.cookie.match(new RegExp('(?:^|; )' + CFG.cookie + '=([^;]*)'));
    if (!m) return null;
    try {
      const c = JSON.parse(decodeURIComponent(m[1]));
      if (!c || !UUID_RE.test(c.id) || typeof c.marketing !== 'boolean') return null;
      return c;
    } catch (e) { return null; }
  }
  function write(c) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CFG.cookie}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${CFG.days * 86400}; Path=/; SameSite=Lax${secure}`;
  }
  function clearMarketingCookies() {
    const host = location.hostname, parts = host.split('.');
    const domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split('; ').map(c => c.split('=')[0]).filter(n => /^_gcl_|^_gac_/.test(n)).forEach(n => {
      domains.forEach(d => { document.cookie = `${n}=; Max-Age=0; Path=/${d ? '; Domain=' + d : ''}`; });
    });
  }

  /* ---------- Google Ads (solo con consenso marketing) ---------- */
  let adsLoaded = false;
  function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }
  function applyConsent(c) {
    if (!CFG.googleAdsId) { if (!c.marketing) clearMarketingCookies(); return; }
    if (c.marketing) {
      if (!adsLoaded) {
        adsLoaded = true;
        gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
        gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
        gtag('js', new Date());
        gtag('config', CFG.googleAdsId);
        document.head.append(h('script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.googleAdsId) }));
      } else {
        gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
      }
    } else {
      if (adsLoaded) gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      clearMarketingCookies();
    }
  }

  /* ---------- registro dei consensi ---------- */
  function log(c, choice) {
    try {
      fetch(CFG.logUrl, {
        method: 'POST', keepalive: true, credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, version: c.version, choice, marketing: c.marketing, page: location.pathname }),
      }).catch(() => {});
    } catch (e) { /* il registro non deve mai bloccare la navigazione */ }
  }

  let current = read();
  if (current && current.version !== CFG.version) current = { id: current.id, stale: true };
  const consentId = (current && current.id) || uuid();

  function save(marketing, choice) {
    const c = { id: consentId, version: CFG.version, marketing, ts: new Date().toISOString() };
    write(c); current = c;
    applyConsent(c);
    log(c, choice);
    hideBanner();
    if (modal.open) modal.close();
    if (choice !== 'close') toast('Preferenze salvate');
  }

  /* ---------- toast ---------- */
  let toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = h('div', { class: 'gsc gsc-toast', role: 'status', 'aria-live': 'polite' });
      document.body.append(toastEl);
    }
    toastEl.replaceChildren(h('i', { 'aria-hidden': 'true' }, '✓'), h('span', {}, msg));
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- banner ---------- */
  const banner = h('section', { class: 'gsc gsc-banner', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'gsc-title', 'aria-describedby': 'gsc-text', tabindex: '-1', hidden: true },
    h('div', { class: 'gsc-head' },
      h('h2', { class: 'gsc-title', id: 'gsc-title' }, h('i', { 'aria-hidden': 'true' }), 'Diamo valore alla tua privacy'),
      h('button', { class: 'gsc-x', type: 'button', 'aria-label': 'Chiudi: continua senza accettare', onclick: () => save(false, 'close') }, svgX())),
    h('p', { class: 'gsc-text', id: 'gsc-text' },
      'Usiamo i cookie di Google Ads solo con il tuo consenso, per misurare le nostre campagne. Puoi cambiare idea quando vuoi. ',
      h('a', { href: CFG.policyUrl }, 'Cookie policy')),
    h('div', { class: 'gsc-actions' },
      h('button', { class: 'gsc-btn gsc-btn-line', type: 'button', onclick: () => openPrefs() }, 'Personalizza'),
      h('button', { class: 'gsc-btn gsc-btn-ink', type: 'button', onclick: () => save(false, 'reject_all') }, 'Rifiuta tutto'),
      h('button', { class: 'gsc-btn gsc-btn-volt gsc-wide', type: 'button', onclick: () => save(true, 'accept_all') }, 'Accetta tutti')));

  const scrim = h('div', { class: 'gsc gsc-scrim', 'aria-hidden': 'true', hidden: true });
  function showBanner() {
    banner.hidden = scrim.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('show'); banner.classList.add('show'); banner.focus({ preventScroll: true }); }));
  }
  function hideBanner() {
    banner.classList.remove('show'); scrim.classList.remove('show');
    setTimeout(() => { if (!banner.classList.contains('show')) banner.hidden = scrim.hidden = true; }, 500);
  }

  /* ---------- preferenze ---------- */
  const table = rows => h('table', { class: 'gsc-table' },
    h('thead', {}, h('tr', {}, ['Nome', 'Fornitore', 'Scopo', 'Durata'].map(t => h('th', { scope: 'col' }, t)))),
    h('tbody', {}, rows.map(([name, domain, kind, purpose, dur]) => h('tr', {},
      h('td', { 'data-label': 'Nome' }, h('code', {}, name)),
      h('td', { 'data-label': 'Fornitore' }, kind, h('br'), h('small', {}, domain)),
      h('td', { 'data-label': 'Scopo' }, purpose),
      h('td', { 'data-label': 'Durata' }, dur)))));

  const mkToggle = h('input', { type: 'checkbox', role: 'switch', id: 'gsc-marketing', 'aria-describedby': 'gsc-marketing-d' });
  const idCode = h('code', {}, consentId);
  const modal = h('dialog', { class: 'gsc gsc-modal', 'aria-labelledby': 'gsc-mtitle' },
    h('div', { class: 'gsc-mhead' },
      h('h2', { class: 'gsc-title', id: 'gsc-mtitle' }, 'Preferenze cookie'),
      h('button', { class: 'gsc-x', type: 'button', 'aria-label': 'Chiudi senza salvare', onclick: () => modal.close() }, svgX())),
    h('div', { class: 'gsc-mbody' },
      h('p', {}, 'Scegli quali categorie di cookie autorizzare. I cookie strettamente necessari non si possono disattivare perché senza di essi il sito non funzionerebbe. ',
        h('a', { href: CFG.policyUrl }, 'Leggi la cookie policy'), '.'),
      h('div', { class: 'gsc-cat' },
        h('div', { class: 'gsc-cat-top' }, h('h3', {}, 'Strettamente necessari'), h('span', { class: 'gsc-always' }, 'Sempre attivi')),
        h('p', {}, 'Indispensabili per il funzionamento del sito e per ricordare la tua scelta sui cookie.'),
        h('details', {}, h('summary', {}, `Dettagli (${NECESSARY.length})`), table(NECESSARY))),
      h('div', { class: 'gsc-cat' },
        h('div', { class: 'gsc-cat-top' }, h('h3', {}, h('label', { for: 'gsc-marketing' }, 'Marketing')), h('span', { class: 'gsc-switch' }, mkToggle, h('span', { 'aria-hidden': 'true' }))),
        h('p', { id: 'gsc-marketing-d' }, 'Misurano le visite e le richieste arrivate dagli annunci Google Ads e ci permettono di mostrare i nostri annunci a chi ha già visitato il sito (remarketing).'),
        h('details', {}, h('summary', {}, `Cookie (${MARKETING.length})`), table(MARKETING))),
      h('p', { class: 'gsc-id' }, 'ID del tuo consenso: ', idCode)),
    h('div', { class: 'gsc-mfoot' },
      h('button', { class: 'gsc-btn gsc-btn-line', type: 'button', onclick: () => save(false, 'reject_all') }, 'Rifiuta tutto'),
      h('button', { class: 'gsc-btn gsc-btn-line', type: 'button', onclick: () => save(mkToggle.checked, 'custom') }, 'Salva preferenze'),
      h('button', { class: 'gsc-btn gsc-btn-volt', type: 'button', onclick: () => save(true, 'accept_all') }, 'Accetta tutti')));

  modal.addEventListener('close', () => { if (!current || current.stale) showBanner(); });
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  function openPrefs() {
    mkToggle.checked = !!(current && !current.stale && current.marketing);
    hideBanner();
    if (!modal.open) modal.showModal();
  }

  /* ---------- avvio ---------- */
  function init() {
    document.body.append(scrim, banner, modal);
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-consent-open]');
      if (t) { e.preventDefault(); openPrefs(); }
    });
    if (current && !current.stale) applyConsent(current);
    else showBanner();
  }
  window.gsConsent = { open: openPrefs, get: () => (current && !current.stale ? { ...current } : null) };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();

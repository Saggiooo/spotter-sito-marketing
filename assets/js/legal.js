/* SPOTTER — pagine legali: indice aperto su desktop e voce attiva durante lo scroll */
(() => {
  const toc = document.querySelector('.toc details');
  if (!toc) return;
  const wide = matchMedia('(min-width: 1000px)');
  const sync = () => { if (wide.matches) toc.open = true; };
  sync(); wide.addEventListener('change', sync);

  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove('on'));
      const a = byId.get(e.target.id);
      if (a) a.classList.add('on');
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  links.forEach(a => a.addEventListener('click', () => { if (!wide.matches) toc.open = false; }));
})();

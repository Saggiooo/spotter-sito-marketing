# Sito GymSpotter

Sito di presentazione per `gymspotter.it`. HTML, CSS e JavaScript puri, senza build; PHP (8.1 o superiore) serve solo per registrare i consensi cookie.

## Struttura

```
index.html            Pagina principale
privacy-policy/       Privacy policy        → /privacy-policy
cookie-policy/        Cookie policy         → /cookie-policy
terms/                Termini e condizioni  → /terms
api/consent.php       Registro dei consensi cookie (POST dal banner)
maintenance/          Modalità manutenzione con password (config.php, gate.php, index.php)
storage/consent/      File del registro, uno al giorno (mai serviti dal web)
scripts/dev-router.php Router per il server PHP di sviluppo
.htaccess             Protezioni per Apache (storage/, scripts/, file nascosti)
robots.txt            Esclude /anteprima/, /api/, /storage/ dai motori di ricerca
sitemap.xml
anteprima/            Schermate dell'app mostrate nei telefoni della pagina (iframe)
assets/
  css/
    fonts.css         @font-face dei font locali
    site.css          Stili del sito
    legal.css         Stili delle pagine legali
    consent.css       Banner e preferenze cookie
    anteprima.css     Stili delle schermate in anteprima/
  js/
    site.js           Animazioni e interazioni del sito
    consent.js        Banner, preferenze cookie e Google Ads con consenso
    legal.js          Indice delle pagine legali
    anteprima.js      Helper delle schermate in anteprima/
    data.js           Palestre e attrezzi dimostrativi (usati da sito e anteprime)
    icons.js          Icone SVG di attrezzi e interfaccia
  fonts/              Archivo, Instrument Sans, Martian Mono (woff2, licenza OFL)
  img/favicon.svg
  vendor/leaflet/     Leaflet 1.9.4 (mappa delle anteprime, licenza BSD-2)
```

## Avvio locale

```sh
php -S 127.0.0.1:5518 -t . scripts/dev-router.php
```

Poi apri http://127.0.0.1:5518/. Il router blocca `storage/` e `scripts/` come in produzione. Senza PHP il sito funziona anche con `python3 -m http.server 5518`, ma il registro dei consensi risponde 404.

## Modalità manutenzione

Attiva adesso: chi apre il sito vede «Lavori in corso» e una password; dopo la password giusta il sito funziona normalmente per 7 giorni in quel browser.

- Configurazione in `maintenance/config.php`: `enabled` (true/false), `password_hash` (solo hash bcrypt, mai la password in chiaro), `unlock_hours`. Nuova password: `php -r 'echo password_hash("nuova", PASSWORD_DEFAULT), "\n";'` e incolla l'hash. In alternativa imposta `GS_MAINT_PASSWORD_HASH` nell'ambiente PHP, che ha la precedenza e resta fuori dal repository.
- Cambiare password revoca tutti gli sblocchi. Lo sblocco è il cookie tecnico `gs_maint` (HttpOnly, firmato con HMAC e una chiave casuale creata al primo avvio in `storage/maintenance/secret.key`, esclusa da Git).
- Massimo 5 password errate ogni 10 minuti per IP. Le pagine bloccate rispondono 503 con `Retry-After` e tutte le risposte, anche dopo lo sblocco, hanno `noindex` e `Cache-Control: private, no-store`, così né Google né la CDN le conservano.
- **Apache/LiteSpeed**: `.htaccess` manda tutte le richieste a `maintenance/index.php`, che controlla la password e poi serve il file. Per lo spegnimento definitivo metti `enabled => false` e, se vuoi che Apache torni a servire i file direttamente, commenta le tre righe `Rewrite` in `.htaccess`.
- **nginx**: `try_files` verso `/maintenance/index.php` per ogni richiesta (es. `location / { try_files /maintenance/index.php =404; }` con PHP-FPM), oppure togli la manutenzione e servi i file statici direttamente.
- In locale vale lo stesso comportamento tramite `scripts/dev-router.php`.

## Cookie e consensi

- `assets/js/consent.js` mostra il banner alla prima visita. Nessun cookie facoltativo prima della scelta; la X equivale a «Rifiuta tutto». La scelta resta nel cookie tecnico `gs_consent` per 180 giorni.
- Per attivare Google Ads imposta `googleAdsId` (es. `AW-123456789`) in cima a `consent.js`: lo script Google viene caricato solo dopo il consenso marketing, con Consent Mode. Finché è vuoto non parte alcuna richiesta a Google.
- Se cambi cookie o categorie, aggiorna `version` in `consent.js` e la cookie policy: il banner verrà richiesto di nuovo a tutti.
- `api/consent.php` salva ogni scelta in `storage/consent/consent-AAAA-MM-GG.jsonl` (data UTC, ID casuale, versione, scelta, pagina, IP troncato, user agent). Accetta solo POST JSON dallo stesso dominio, massimo 2 KB. I file più vecchi di 180 giorni si cancellano da soli, al più una volta al giorno.
- In produzione conviene tenere il registro fuori dalla root web: imposta `GS_CONSENT_DIR=/percorso/privato` nell'ambiente PHP. Dietro Cloudflare, se il server accetta traffico solo da Cloudflare, imposta `GS_CLIENT_IP_HEADER=CF-Connecting-IP` per registrare l'IP (troncato) del visitatore invece di quello del proxy.
- Pulizia anche da cron, facoltativa: `php api/consent.php --purge`.
- Con **nginx** `.htaccess` non vale: aggiungi `location ~ ^/(storage|scripts)/ { deny all; }` e `location ~ /\.(?!well-known) { deny all; }`, e passa `api/*.php` a PHP-FPM.
- Le pagine legali contengono segnaposto evidenziati in giallo (`<span class="todo">`): vanno completati con i dati del titolare prima della pubblicazione.

## Note

- I pulsanti «Apri l'app», «Apri i filtri» e «Registra la tua palestra» portano all'app reale su `https://app.gymspotter.it`.
- Le schermate in `anteprima/` sono la copia del mockup originale (`Spotter/demo/`) e usano dati finti: account, preferiti e prenotazioni restano nel browser di chi le prova.
- Le foto arrivano da Unsplash e le tile della mappa da Esri: sono le uniche risorse esterne.
- Quando cambi un file CSS o JS, aumenta il suo `?v=` nell'HTML per evitare copie vecchie nella cache.

# Sito GymSpotter

Sito di presentazione statico per `gymspotter.it`. HTML, CSS e JavaScript puri: nessuna build, nessuna dipendenza da installare.

## Struttura

```
index.html            Pagina principale
robots.txt            Esclude /anteprima/ dai motori di ricerca
sitemap.xml
anteprima/            Schermate dell'app mostrate nei telefoni della pagina (iframe)
assets/
  css/
    fonts.css         @font-face dei font locali
    site.css          Stili del sito
    anteprima.css     Stili delle schermate in anteprima/
  js/
    site.js           Animazioni e interazioni del sito
    anteprima.js      Helper delle schermate in anteprima/
    data.js           Palestre e attrezzi dimostrativi (usati da sito e anteprime)
    icons.js          Icone SVG di attrezzi e interfaccia
  fonts/              Archivo, Instrument Sans, Martian Mono (woff2, licenza OFL)
  img/favicon.svg
  vendor/leaflet/     Leaflet 1.9.4 (mappa delle anteprime, licenza BSD-2)
```

## Avvio locale

```sh
python3 -m http.server 5518 --bind 127.0.0.1
```

Poi apri http://127.0.0.1:5518/. Serve un server: aperta come file, la pagina non carica gli iframe.

## Note

- I pulsanti «Apri l'app», «Apri i filtri» e «Registra la tua palestra» portano all'app reale su `https://app.gymspotter.it`.
- Le schermate in `anteprima/` sono la copia del mockup originale (`Spotter/demo/`) e usano dati finti: account, preferiti e prenotazioni restano nel browser di chi le prova.
- Le foto arrivano da Unsplash e le tile della mappa da Esri: sono le uniche risorse esterne.
- La waitlist in fondo alla pagina non invia ancora nulla.
- Il footer rimanda a `/privacy-policy`, `/cookie-policy` e `/terms`, pagine ancora da pubblicare.
- Quando cambi un file CSS o JS, aumenta il suo `?v=` nell'HTML per evitare copie vecchie nella cache.

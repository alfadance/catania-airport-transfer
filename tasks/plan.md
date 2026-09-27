# Piano: grafica del sito 2027, cinque specialisti in fila

## Cosa si fa

Cinque passate di design sul sito, una per skill, ognuna sul lavoro della precedente. L'unico dato fisso è la
palette del marchio; layout, tipografia, componenti, ritmo e dettagli si possono cambiare. Si lavora sul ramo
`grafica-2027`: un push su `main` pubblica il sito, quindi niente push finché il titolare non ha visto il risultato.

## Vincoli per tutte le passate

- **Palette:** Night Black `#050608`, Harbour Navy `#1B3F5D`, Signal Orange `#EE8211` e hover `#FF8F24`, Paper
  `#FFFFFF`, Mist `#F4F6F9`, neutri ink/slate già in `DESIGN.md`. Nessun'altra tinta (il rosso dell'errore del
  modulo resta l'unica eccezione).
- Niente veli colorati in trasparenza sopra le foto, niente aloni o bagliori colorati, niente `mix-blend`.
- Arancione mai come testo su fondo chiaro (2,7:1); testo su chiaro in navy o ink, almeno 4,5:1.
- Testi: il contenuto è approvato. Non si aggiungono affermazioni, numeri, superlativi o nomi di clienti; non si
  dice chi esegue i servizi. Etichette nuove brevi e in inglese semplice.
- Il modulo `#agency-rates` mantiene `name`, `id`, `action` e gli agganci GA4; `request-rates.php` non si tocca.
- Accessibilità: bersagli di 44 px, focus visibile, campi a 16 px su telefono, movimento solo senza
  `prefers-reduced-motion`.
- Pagina statica: HTML + Tailwind 3.4 compilato. Niente React, niente librerie JS nuove, niente CDN esterni.

## Ordine e perché

| # | Skill | Compito |
|---|---|---|
| 1 | `frontend-design` | Direzione estetica: carattere visivo, tipografia, composizione dell'hero e delle sezioni |
| 2 | `ui-ux-pro-max` | Sistema: scala tipografica e spaziature, gerarchia, coerenza dei componenti, UX delle sezioni |
| 3 | `21st` | Componenti: riferimenti dal catalogo 21st.dev portati in HTML statico (schede, FAQ, recensioni, footer) |
| 4 | `impeccable` | Critica e rifinitura: anti-pattern, dettagli, micro-interazioni, `DESIGN.md` aggiornato |
| 5 | `frontend-ui-engineering` | Qualità di produzione: responsive 360–1440, accessibilità, peso, pulizia del codice |

In fila e non in parallelo: tutte toccano `index.html`, e ognuna deve vedere il lavoro di chi la precede.

## Compiti

Ogni passata: legge `DESIGN.md`, `PRODUCT.md` e le note delle passate precedenti in fondo a questo file; modifica;
lancia `npm run build:css`; fa screenshot a 1440 e 390 px con `scripts/verifica/fullshot.mjs` e controlla i colori
con `scripts/verifica/palette-check.py`; fa un commit sul ramo; aggiunge qui la sua nota.

**Accettazione di ogni passata:** build pulita; nessun pixel fuori palette oltre le foto (antialias a parte);
nessuno scorrimento orizzontale a 360 px; modulo ancora funzionante nel markup; commit con messaggio chiaro.

### Checkpoint finale
- [ ] Cinque commit sul ramo, uno per skill
- [ ] Screenshot prima/dopo a 1440 e 390 px
- [ ] Il titolare guarda l'anteprima e decide se unire e pubblicare

## Rischi

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Cinque gusti diversi, risultato incoerente | Alto | Ordine dal generale al particolare; ogni passata legge le note delle precedenti e non disfa senza motivo scritto |
| Il catalogo 21st.dev è React e il suo server MCP può mancare | Medio | Si usano come riferimento visivo, portati a mano in HTML/Tailwind |
| Colori fuori palette introdotti per sbaglio | Alto | `palette-check.py` sullo screenshot a ogni passata |
| Pubblicazione accidentale | Alto | Solo ramo locale, nessun push |

## Note delle passate


### Passata 1 — frontend-design

**Direzione scelta.** La segnaletica dei trasporti: un solo carattere, Archivo variabile (self-hosted,
`assets/fonts/archivo-latin-wdth.woff2`, set latino, pesi 100–900 e larghezze 62–125%), usato espanso e in
grassetto per titoli e numeri (classi `stretch-wide` 125% e `stretch-semi` 112% in `src/tailwind.css`) e a
larghezza normale per il testo. La cosa memorabile è la tipografia del titolo e il tabellone delle tratte; il resto
resta quieto. Allineamento sempre a sinistra, griglia a 12 colonne su `max-w-7xl`.

**Cosa è cambiato.**
- Montserrat tolto (tre file eliminati); `@font-face` spostato nel CSS compilato, così vale anche per `privacy.html`.
- Hero: titolo a tutta larghezza in bianco (l'arancione resta solo sulle azioni), sotto il testo a sinistra e i
  due pulsanti a destra, poi la foto in una fascia larga senza cornice né velo, poi i tre fatti in una riga con
  filetti navy (niente schede).
- Why us: il riquadro "For agencies and DMCs" diventa un pannello navy pieno con elenco a filetti.
- Routes: da quattro schede a un tabellone delle partenze (miniatura, "Catania Airport to" piccolo, destinazione
  grande espansa, durata a destra). Su telefono miniatura a sinistra e testo a destra.
- Reviews: fascia navy piena, recensione lunga in grande a sinistra, le altre due a destra, divise da filetti.
- Events: niente schede; foto, filetto navy, numero grande espanso.
- How it works: passi senza schede su una linea navy continua (è una sequenza vera, quindi `<ol>`).
- Modulo tariffe: secondo momento nero della pagina, pannello bianco; campi a 16px ovunque e alti 48px.
- FAQ a due colonne con elenco a filetti; contatti in `<dl>` a filetti; navigazione e nomi del marchio in
  maiuscolo/minuscolo normale (tolto il maiuscolo spaziato).
- Tolte le frecce nei pulsanti e l'ombra colorata sul logo.

**Lasciato alle passate successive.** Scala tipografica e spaziature da sistematizzare (le classi dei titoli sono
ripetute a mano in ogni sezione: candidate a un componente); `DESIGN.md` non è ancora aggiornato (dice ancora
Montserrat, schede per le tratte, prima riga del titolo in arancione); `privacy.html` ha solo il nuovo carattere,
header e impaginazione vecchi; peso del font (90 KB, un file solo) da valutare in passata 5; nella cattura a pagina
intera header e barra mobile fissi compaiono a metà pagina (artefatto della cattura, già presente prima).

**Da non disfare.** Archivo espanso come voce del marchio; tabellone delle tratte a righe; titolo dell'hero in
bianco e arancione solo per le azioni; fasce nere in apertura e sul modulo, fascia navy per le recensioni; nessuna
scheda dove bastano filetti; nessuna numerazione decorativa.

Verifiche: build pulita; palette-check 0 pixel fuori palette a 1440 e 360, 7 a 390 (il logo nell'header fisso
catturato fuori dalla maschera delle immagini); a 360 px `scrollWidth` = 360, nessun elemento oltre il bordo.

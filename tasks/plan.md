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

### Passata 2 — ui-ux-pro-max

**Cosa è cambiato.**
- Le classi ripetute a mano sono diventate un sistema in `@layer components` di `src/tailwind.css`, con la scala
  scritta in testa al blocco. Titoli dal più grande: `t-hero` (uno solo), `t-cta` (modulo tariffe), `t-h2` (ogni
  sezione), `t-stat-lg`, `t-route`, `t-stat`, `t-h3`. Testo: `t-lead`, `t-body`, `t-meta`. Le classi fissano solo
  le misure: il colore resta nell'HTML perché dipende dal fondo.
- Spaziature: `wrap` (contenitore `max-w-7xl` con i margini laterali), `section-pad` (16/20/28), `section-head`
  (titolo più apertura, stessa distanza dal contenuto). La sezione contatti prima aveva `lg:py-24`, ora è allineata.
- Componenti: `btn` + `btn-primary` / `btn-outline-dark` / `btn-outline-light`, variante `btn-sm` per header e barra
  mobile; `link` (sottolineatura arancione, colore dal fondo); `field` e `field-label` per il modulo; `route-row` e
  `route-img` per il tabellone; `faq-item`, `faq-q`, `faq-a`. I pulsanti hanno tutti la stessa misura (48 px,
  testo 16 px); il focus e i 44 px valgono anche per `.btn`, non solo per le classi `rounded-full`.
- Percorso verso il modulo: l'azione primaria ha lo stesso testo ovunque, "Get the 2027 agency rates" (anche il link
  sotto le tratte e la barra mobile, prima "Get the rate sheet" e "Get agency rates"). Nell'hero il pulsante
  WhatsApp per i privati è più piccolo (14 px), così il peso visivo va alle agenzie; testo e pulsanti ora in 5+7
  colonne e senza andare a capo da 640 px in su.
- Navigazione su telefono: prima non c'era (solo il pulsante tariffe). Ora un menu `<details>` nativo ("Menu" /
  "Close") con le quattro sezioni più Contact, voci alte 48 px; si chiude dopo la scelta o con Esc (poche righe di
  script inline). Su telefono il pulsante tariffe dell'header è tolto perché c'è già nella barra in basso, dove ora è
  il pulsante più largo.
- `scroll-margin-top` sulle ancore, così i titoli non finiscono sotto l'header fisso.

**Lasciato alle passate successive.** `privacy.html` non usa ancora il sistema (header e impaginazione vecchi);
`DESIGN.md` da riscrivere con la scala qui sopra (passata 4); banner dei cookie e footer non convertiti ai
componenti (testi 12 px, da valutare); la barra mobile potrebbe nascondersi quando il modulo è a schermo; il peso
del font resta per la passata 5.

**Da non disfare.** Le classi `t-*`, `btn*`, `wrap`/`section-pad`/`section-head`: una modifica di misura si fa lì,
non sull'HTML. Una sola etichetta per l'azione primaria. Menu mobile senza librerie e funzionante senza JS.

Verifiche: `npm run build:css` pulita; palette-check 0 pixel fuori palette a 1440, 7 a 390 e 4 a 360 (tutti sul
logo dell'header fisso catturato a metà pagina, artefatto noto); a 360 px `scrollWidth` = 360 e nessun elemento
oltre il bordo, anche con il menu aperto; modulo con `name`, `id`, `action` e script GA4 invariati (cambiano solo le
classi).

### Passata 3 — 21st

**Catalogo consultato** (piano gratuito, solo strumenti in lettura; risposte e anteprime in `_shots/21st/`, fuori da
git). Ricerche: testimonials, faq accordion, timeline steps, contact form, footer, cookie banner, più un
`get_inspiration` con il nostro sistema come contesto. Anteprime guardate: Testimonial (6286), Accordion di wensity
(31351), Process Timeline (28374), Cookie Banner (5194), Centered Contact Form (27904), Footer with Suite (29773).
Codice scaricato con i due `get_component` del giorno: **Footer with Suite (29773)** e **Centered Contact Form
(27904)**. Il resto è stato portato dalle anteprime.

**Cosa è entrato e come.** Niente React né shadcn: la struttura è tradotta in HTML e in classi di
`@layer components`, ricolorate con la palette.
- Footer (29773): colonne a filetti navy (descrizione e logo, cinque ancore della pagina, recapiti in `<dl>` con
  etichetta a sinistra e valore a destra), poi il nome del marchio in Archivo espanso a tutta larghezza (classe
  `footer-wordmark`, `aria-hidden` perché il nome c'è già nel logo e nel copyright): su una riga da 1024 px, su tre
  righe sotto. Riga finale con copyright, Privacy e Cookie preferences, ora alti 44 px (prima `min-h-0`); il testo
  legale resta invariato. Classe nuova `footer-link`.
- Modulo tariffe (27904): la frase sulla privacy passa sotto l'invio, in una riga separata da un filetto, con un
  lucchetto navy (classe `form-foot`); il pulsante d'invio è a tutta larghezza su telefono. Campi: bordo più scuro
  al passaggio del mouse e al focus bordo più anello navy da 1 px, cioè 2 px navy pieni. Il badge "risposta entro
  24 ore" dell'originale non è entrato: sarebbe un'affermazione nuova.
- FAQ (31351): il +/− diventa una freccia che gira di 180° all'apertura (`faq-chevron`, transizione solo con
  `motion-safe`); resta `<details>` nativo.
- How it works (28374): su telefono i passi sono in colonna con l'icona a sinistra e un tratto navy verticale che
  unisce un'icona alla successiva (un `::after` per passo, tolto sull'ultimo). Da tablet in su resta la linea
  orizzontale. Nessun numero: le icone restano.
- Banner dei cookie (5194): da barra a tutta larghezza a scheda flottante nera con bordo navy, testo da 12 a 14 px,
  pulsanti `btn btn-sm` (rifiuto a contorno, accettazione arancione), link alla privacy come `.link` bianco. Gli
  `id` e lo script del consenso non cambiano.

**Lasciato alle successive.** Recensioni: nessun riferimento del catalogo rispetta i vincoli (loghi di clienti,
avatar, marquee), quindi la fascia navy resta com'è. Barra mobile: invariata; resta aperta l'idea di nasconderla
quando il modulo è a schermo. `privacy.html` non ha ancora footer e banner nuovi. Il blocco Social della sezione
contatti non ha una sua riga nel footer (le icone restano nei contatti). L'apertura animata dei `<details>`
(`::details-content`) è stata scartata perché la supportano solo i browser più recenti: da rivalutare in passata 4.

**Da non disfare.** Il nome del marchio a tutta larghezza come chiusura della pagina; nel footer filetti e non
schede; la riga di garanzia sotto l'invio del modulo, senza affermazioni che non siano nella lista dei fatti; le
frecce della FAQ; il tratto verticale dei passi su telefono; il banner dei cookie come scheda con i pulsanti del
sistema.

Verifiche: `npm run build:css` pulita; palette-check 1 pixel fuori palette a 1440, 7 a 390 e 7 a 360, tutti sul
logo dell'header fisso catturato fuori dalla maschera delle immagini (artefatto noto); a 360 px `scrollWidth` = 360
e 0 elementi oltre il bordo, con il banner dei cookie aperto; banner controllato a 360 e 1440 px; `git grep`
dell'inizio della chiave di 21st.dev: nessun file tracciato la contiene; modulo con `name`, `id`, `action` e
script GA4 invariati.

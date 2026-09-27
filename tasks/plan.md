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


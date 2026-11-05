// Pagina privata del titolare (spostato dal vecchio decidi.html, logica invariata): accetta o rifiuta una richiesta dal sito.
document.documentElement.lang = 'it';
(function () {
  'use strict';
  var ENDPOINT = 'https://lsekwlvnlumjxliyysuy.supabase.co/functions/v1/sito-decidi';
  var MEZZI = { business_sedan: 'Business Sedan', business_minivan: 'Business Minivan' };
  var STATI = { in_attesa: 'In attesa della tua decisione', link_inviato: 'Già accettata: link di pagamento inviato', rifiutata: 'Già rifiutata',
    pagata: 'Pagata', scaduta: 'Link scaduto', annullata: 'Annullata', nuova: 'Non ancora sul gestionale' };
  var token = new URLSearchParams(location.hash.slice(1)).get('t') || '';
  // Il token resta in memoria: via dalla barra e dalla cronologia del browser (se ricarichi la pagina, riapri il link dalla mail).
  if (token) history.replaceState(null, '', location.pathname);
  var DOMANDE = {
    accetta: 'Confermi? La cliente riceve subito la mail con il link di pagamento SumUp.',
    accetta_stripe: 'Confermi? La cliente riceve subito la mail con il link di pagamento Stripe.',
    rifiuta: 'Confermi? La cliente riceve subito la mail di rifiuto.'
  };
  var scelta = '';
  var $ = function (id) { return document.getElementById(id); };

  function testo(el, valore) { el.textContent = valore; }
  function mostra(id, si) { $(id).hidden = !si; }

  function riga(etichetta, valore) {
    var r = document.createElement('div'); r.className = 'dc-row';
    var dt = document.createElement('dt'); testo(dt, etichetta);
    var dd = document.createElement('dd'); testo(dd, valore);
    r.appendChild(dt); r.appendChild(dd);
    return r;
  }

  function scrivi(rie) {
    var dati = $('dati'); dati.textContent = '';
    var rotta = rie.direzione === 'da_aeroporto' ? 'Aeroporto di Catania → ' + rie.luogo : rie.luogo + ' → Aeroporto di Catania';
    var d = String(rie.data).split('-').reverse().join('/');
    var rit = rie.ritorno;
    var righe = [['Richiesta', rie.codice], ['Tratta', rotta], ['Quando', d + ' alle ' + rie.ora]];
    if (rit) righe.push(['Ritorno', String(rit.data).split('-').reverse().join('/') + ' alle ' + rit.ora + (rit.volo ? ', volo ' + rit.volo : '')]);
    righe.push(['Mezzo', MEZZI[rie.mezzo] || rie.mezzo], ['Passeggeri', String(rie.pax)], ['Note', rie.note || '-'],
      ['Prezzo', '€' + Number(rie.prezzo).toFixed(2) + ' IVA inclusa' + (rit ? ' (andata €' + Number(rit.prezzo_andata).toFixed(2) + ' + ritorno scontato del 20% €' + Number(rit.prezzo_ritorno).toFixed(2) + ')' : '')]);
    righe.forEach(function (c) { dati.appendChild(riga(c[0], c[1])); });
    var st = $('stato'); st.className = 'dc-status'; testo(st, STATI[rie.stato] || rie.stato);
    mostra('azioni', rie.stato === 'in_attesa');
  }

  function errore(messaggio) {
    mostra('caricamento', false); mostra('scheda', true);
    var st = $('stato'); st.className = 'dc-status is-error'; testo(st, messaggio);
  }

  function chiama(op) {
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: token, op: op }), cache: 'no-store', referrerPolicy: 'no-referrer' })
      .then(function (r) { return r.json().catch(function () { return { ok: false, errore: 'Risposta non valida' }; }); })
      .catch(function () { return { ok: false, errore: 'Rete assente: riprova fra poco' }; });
  }

  function carica() {
    if (!token) { errore('Apri questa pagina dal pulsante della mail.'); return; }
    chiama('vedi').then(function (r) {
      mostra('caricamento', false); mostra('scheda', true);
      if (r.riepilogo) scrivi(r.riepilogo);
      if (!r.ok) errore(r.errore || 'Errore');
    });
  }

  function chiedi(op) {
    scelta = op;
    testo($('domanda'), DOMANDE[op]);
    mostra('azioni', false); mostra('conferma', true);
  }

  function esegui() {
    $('si').disabled = true; $('no').disabled = true;
    chiama(scelta).then(function (r) {
      $('si').disabled = false; $('no').disabled = false;
      mostra('conferma', false);
      if (r.ok) {
        var st = $('stato'); st.className = 'dc-status';
        testo(st, r.esito === 'accettata' ? 'Fatto: la mail col link di pagamento ' + (r.metodo === 'stripe' ? 'Stripe' : 'SumUp') + ' è partita.' : 'Fatto: la mail di rifiuto è partita.');
        return;
      }
      errore(r.errore || 'Errore');
      if (r.riepilogo && r.riepilogo.stato === 'in_attesa') mostra('azioni', true);
    });
  }

  $('accetta').addEventListener('click', function () { chiedi('accetta'); });
  $('accetta-stripe').addEventListener('click', function () { chiedi('accetta_stripe'); });
  $('rifiuta').addEventListener('click', function () { chiedi('rifiuta'); });
  $('no').addEventListener('click', function () { mostra('conferma', false); mostra('azioni', true); });
  $('si').addEventListener('click', esegui);
  carica();
})();

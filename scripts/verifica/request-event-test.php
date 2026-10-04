<?php
// Prova delle funzioni di request-event.php, senza inviare niente. Uso: php scripts/verifica/request-event-test.php
// (PHP di winget senza php.ini: aggiungere -d extension_dir=<cartella php>/ext -d extension=mbstring)
define('REQUEST_EVENT_TEST', true);
$falliti = 0;
$eseguite = 0;
const PROVE_ATTESE = 16;
// Se il gestore esce durante il require (exit nel flusso principale) le prove non partono e l'uscita sarebbe 0: un verde vuoto.
register_shutdown_function(function () {
  global $eseguite;
  if ($eseguite !== PROVE_ATTESE) { echo "FAIL  eseguite $eseguite prove su " . PROVE_ATTESE . "\n"; exit(1); }
});
require __DIR__ . '/../../request-event.php';

function prova($nome, $atteso, $ottenuto) {
  global $falliti, $eseguite;
  $eseguite++;
  if ($atteso === $ottenuto) { echo "ok    $nome\n"; return; }
  $falliti++;
  echo "FAIL  $nome: atteso " . var_export($atteso, true) . ", ottenuto " . var_export($ottenuto, true) . "\n";
}

// Da quale pagina arriva la richiesta
prova('nessun campo = wedding (pagina matrimoni in cache)', 'wedding', pagina_chiave([], $PAGES));
prova('form=events (pagina aziendale in cache)', 'events', pagina_chiave(['form' => 'events'], $PAGES));
prova('page=hub', 'hub', pagina_chiave(['page' => 'hub'], $PAGES));
prova('page=events', 'events', pagina_chiave(['page' => 'events'], $PAGES));
prova('page sconosciuto = wedding', 'wedding', pagina_chiave(['page' => '../x'], $PAGES));
prova('page vince su form', 'hub', pagina_chiave(['page' => 'hub', 'form' => 'events'], $PAGES));

// Tipo di evento
prova('wedding in cache, senza etype = wedding', 'wedding', tipo_evento([], 'wedding', $ETYPE));
prova('hub senza etype = non valido', '', tipo_evento([], 'hub', $ETYPE));
prova('aziendale senza etype = non valido', '', tipo_evento(['form' => 'events'], 'events', $ETYPE));
prova('aziendale con conference', 'conference', tipo_evento(['etype' => 'conference'], 'events', $ETYPE));
prova('tipo cambiato sulla pagina matrimoni', 'conference', tipo_evento(['page' => 'wedding', 'etype' => 'conference'], 'wedding', $ETYPE));
prova('wedding con etype vuoto inviato = non valido', '', tipo_evento(['page' => 'wedding', 'etype' => ''], 'wedding', $ETYPE));
prova('etype inventato = non valido', '', tipo_evento(['etype' => 'zzz'], 'hub', $ETYPE));
prova('etype con a capo = pulito e non valido', '', tipo_evento(['etype' => "wedding\r\nBcc: x@y.z"], 'hub', $ETYPE));

// Oggetto della mail
prova('oggetto wedding', 'Wedding transfer plan request - ACME', oggetto('wedding', 'ACME'));
prova('oggetto evento', 'Event transport plan request - ACME', oggetto('conference', 'ACME'));

exit($falliti ? 1 : 0);

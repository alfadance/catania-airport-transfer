<?php
// Prova di sembra_spam() di request-rates.php. Uso: php scripts/verifica/spam-rates-test.php
// Carica solo la funzione (il file intero fa exit e manda mail). Esce con 1 se una prova fallisce o se ne gira meno di 8.
$src = file_get_contents(__DIR__ . '/../../request-rates.php');
if (!preg_match('/function sembra_spam\(.*?\r?\n}\r?\n/s', $src, $m)) { fwrite(STDERR, "funzione non trovata\n"); exit(1); }
eval($m[0]);

$casi = [
  // [azienda, messaggio, atteso spam?]
  ['Webexpert', "The way people search online is changing. We offer a combined SEO + AEO strategy to improve visibility. Let me know if you'd like our service proposal.", true],
  ['NA', "You're reading this because I just used your contact form. Opt out here: https://example.com/unsubscribe", true],
  ['N/A', 'Hello', true],
  ['-', 'Hello', true],
  ['Scott Dunn', 'We plan Sicily trips for 2027 and need net rates from Catania Airport to Taormina and Siracusa.', false],
  ['Backroads', '', false],
  ['Perillo Tours', 'Please send the 2027 rates. Our site is https://perillotours.com', false],
  ['Context Travel', 'Do you cover Etna and Siracusa day trips for groups of 10?', false],
];
$n = 0; $ko = 0;
foreach ($casi as [$a, $msg, $atteso]) {
  $n++;
  if (sembra_spam($a, $msg) !== $atteso) { $ko++; fwrite(STDERR, "FALLITA: $a / " . substr($msg, 0, 40) . "\n"); }
}
if ($n < 8) { fwrite(STDERR, "troppe poche prove: $n\n"); exit(1); }
echo $ko === 0 ? "ok: $n prove\n" : "$ko prove fallite su $n\n";
exit($ko === 0 ? 0 : 1);

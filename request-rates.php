<?php
// Modulo "Request the 2027 agency rates" (sezione #agency-rates di index.html).
// Manda la richiesta a info@ con l'oggetto "2027 agency rates request": e' lo
// stesso oggetto del vecchio link email, quindi il registro dei contatti B2B la
// riconosce allo stesso modo. Non salva nulla sul server, a parte un contatore
// temporaneo per indirizzo IP contro gli abusi (cancellato dopo un'ora).
//
// Dal 2026-09-27 (audit del percorso cliente, punto 10):
// - copia di sicurezza della richiesta alla casella personale del titolare, se info@ non la ricevesse;
// - conferma automatica a chi compila, in inglese, con tempi di risposta e un canale di riserva. La conferma non
//   ripete nulla di quanto scritto nel modulo, cosi' il modulo non puo' servire a mandare testo a indirizzi altrui,
//   e parte al massimo LIMITE volte all'ora dallo stesso IP.

$TO = 'info@cataniaairporttransfer.net';
$BACKUP = 'web.comedas@gmail.com';
$FROM = 'Catania Airport Transfer <noreply@cataniaairporttransfer.net>';
$LIMITE = 5;
$HOW = [
  'google' => 'Google search',
  'linkedin' => 'LinkedIn',
  'wtm' => 'WTM London',
  'email' => 'An email from you',
  'referral' => 'Recommended by someone',
  'other' => 'Other',
];

function back($esito) {
  header('Location: /?rates=' . $esito . '#agency-rates', true, 303);
  exit;
}
// Toglie a capo e caratteri di controllo: nessun campo puo' aggiungere intestazioni alla mail.
function clean($s, $max) {
  $s = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string)$s));
  return mb_substr($s, 0, $max);
}
function invia($to, $subject, $body, $headers) {
  // Mittente di busta sul dominio: SPF (che autorizza l'IP del server) passa allineato al From, quindi anche DMARC.
  return mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-fnoreply@cataniaairporttransfer.net');
}
// Quante richieste ha fatto questo IP nell'ultima ora (file temporaneo, solo un hash dell'IP e gli orari).
function sotto_limite($limite) {
  $f = sys_get_temp_dir() . '/cat-rates-' . hash('sha256', 'cat' . ($_SERVER['REMOTE_ADDR'] ?? '')) . '.txt';
  $ora = time();
  $volte = [];
  if (is_file($f)) {
    foreach (explode("\n", (string)@file_get_contents($f)) as $t) {
      if ((int)$t > $ora - 3600) $volte[] = (int)$t;
    }
  }
  $volte[] = $ora;
  @file_put_contents($f, implode("\n", $volte), LOCK_EX);
  return count($volte) <= $limite;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') back('error');

// Campo trappola: le persone non lo vedono, i programmi di spam lo riempiono.
if (!empty($_POST['website'])) back('sent');

$name = clean($_POST['name'] ?? '', 100);
$agency = clean($_POST['agency'] ?? '', 150);
$country = clean($_POST['country'] ?? '', 80);
$email = clean($_POST['email'] ?? '', 200);
$how = clean($_POST['how'] ?? '', 20);
$message = mb_substr(trim(str_replace("\r", '', (string)($_POST['message'] ?? ''))), 0, 2000);

if ($name === '' || $agency === '' || $country === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !isset($HOW[$how])) {
  back('error');
}

$subject = '2027 agency rates request - ' . $agency;
$body = "New request from the website form (cataniaairporttransfer.net)\n\n"
  . "Name: $name\n"
  . "Company: $agency\n"
  . "Country: $country\n"
  . "Email: $email\n"
  . "How they found us: {$HOW[$how]}\n\n"
  . "Message:\n" . ($message !== '' ? $message : '(none)') . "\n";

$headers = "From: $FROM\r\n"
  . "Reply-To: $email\r\n"
  . "Content-Type: text/plain; charset=UTF-8\r\n";

$ok = invia($TO, $subject, $body, $headers);
invia($BACKUP, '[copia] ' . $subject, $body, $headers);

if ($ok && sotto_limite($LIMITE)) {
  $conferma = "Thank you for your request.\n\n"
    . "We have received it and will reply by email with our 2027 agency rates. We usually reply within the hour,\n"
    . "Monday to Friday, 9:00 to 18:00 Italian time. If you write outside office hours, we reply when the office\n"
    . "reopens.\n\n"
    . "If you need us sooner, call or WhatsApp +39 320 052 8300.\n\n"
    . "Sebastiano Valenti, Founder\n"
    . "Catania Airport Transfer\n"
    . "https://cataniaairporttransfer.net\n\n"
    . "You are receiving this message because this address was entered in the rates request form on our website.\n"
    . "If you did not send the request, you can ignore this email: we will not contact you again.\n";
  $h = "From: $FROM\r\n"
    . "Reply-To: $TO\r\n"
    . "Auto-Submitted: auto-replied\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";
  invia($email, 'We have your request for our 2027 agency rates', $conferma, $h);
}

back($ok ? 'sent' : 'error');

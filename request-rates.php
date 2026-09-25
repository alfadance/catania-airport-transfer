<?php
// Modulo "Request the 2027 agency rates" (sezione #agency-rates di index.html).
// Manda la richiesta a info@ con l'oggetto "2027 agency rates request": e' lo
// stesso oggetto del vecchio link email, quindi il registro dei contatti B2B la
// riconosce allo stesso modo. Non salva nulla sul server.

$TO = 'info@cataniaairporttransfer.net';
$FROM = 'Catania Airport Transfer <noreply@cataniaairporttransfer.net>';
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

// Mittente di busta sul dominio: SPF (che autorizza l'IP del server) passa allineato al From, quindi anche DMARC.
$ok = mail($TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-fnoreply@cataniaairporttransfer.net');
back($ok ? 'sent' : 'error');

<?php
// Modulo "Request an event plan" delle tre pagine evento: events.html (hub), wedding-transfers-taormina.html e
// event-transportation-sicily.html. Un solo gestore: il campo `etype` dice che tipo di evento e', il campo nascosto
// `page` dice a quale pagina tornare. Le pagine gia' in cache dei visitatori mandano ancora i campi vecchi
// (nessun `page` e nessun `etype` per i matrimoni, `form=events` per gli eventi aziendali): restano valide.
// Stessa struttura di request-rates.php: manda la richiesta a info@ e una copia di sicurezza alla casella
// personale del titolare, non salva nulla sul server a parte un contatore temporaneo per indirizzo IP contro gli
// abusi (cancellato dopo un'ora). A differenza del modulo tariffe non manda una conferma a chi compila: la conferma
// e' il riquadro sulla pagina, e cosi' il modulo non puo' servire a spedire posta a indirizzi altrui.

$TO = 'info@cataniaairporttransfer.net';
$BACKUP = 'web.comedas@gmail.com';
$FROM = 'Catania Airport Transfer <noreply@cataniaairporttransfer.net>';
$LIMITE = 5;
$PAGES = [
  'wedding' => 'wedding-transfers-taormina.html',
  'events' => 'event-transportation-sicily.html',
  'hub' => 'events.html',
];
$ETYPE = [
  'wedding' => 'Wedding',
  'conference' => 'Conference or convention',
  'show' => 'Fashion show or presentation',
  'film' => 'Film premiere or festival',
  'corporate' => 'Corporate event or incentive',
  'other' => 'Other',
];
$ARRIVAL = [
  'catania' => 'Catania Airport',
  'palermo' => 'Palermo Airport',
  'comiso' => 'Comiso Airport',
  'several' => 'Several places',
  'unknown' => 'Not known yet',
];

// Toglie a capo e caratteri di controllo: nessun campo puo' aggiungere intestazioni alla mail.
function clean($s, $max) {
  $s = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string)$s));
  return mb_substr($s, 0, $max);
}
// Da quale pagina arriva la richiesta: `page`; altrimenti `form=events` (pagina aziendale in cache); altrimenti i matrimoni.
function pagina_chiave($post, $pages) {
  $k = clean($post['page'] ?? '', 20);
  if ($k === '' && ($post['form'] ?? '') === 'events') $k = 'events';
  return isset($pages[$k]) ? $k : 'wedding';
}
// Tipo di evento: la pagina matrimoni in cache non manda `etype` e vale 'wedding'. Ogni altro caso deve essere in elenco.
function tipo_evento($post, $key, $etypes) {
  if (!isset($post['etype']) && $key === 'wedding') return 'wedding';
  $t = clean($post['etype'] ?? '', 20);
  return isset($etypes[$t]) ? $t : '';
}
function oggetto($etype, $agency) {
  return ($etype === 'wedding' ? 'Wedding transfer plan request - ' : 'Event transport plan request - ') . $agency;
}

$KEY = pagina_chiave($_POST, $PAGES);
$PAGINA = $PAGES[$KEY];

function back($esito) {
  global $PAGINA;
  header('Location: /' . $PAGINA . '?event=' . $esito . '#event-request', true, 303);
  exit;
}
function invia($to, $subject, $body, $headers) {
  // Mittente di busta sul dominio: SPF passa allineato al From, quindi anche DMARC.
  return mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers, '-fnoreply@cataniaairporttransfer.net');
}
// Quante richieste ha fatto questo IP nell'ultima ora (file temporaneo, solo un hash dell'IP e gli orari).
function sotto_limite($limite) {
  $f = sys_get_temp_dir() . '/cat-event-' . hash('sha256', 'cat' . ($_SERVER['REMOTE_ADDR'] ?? '')) . '.txt';
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

if (!defined('REQUEST_EVENT_TEST')) {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') back('error');

  // Campo trappola: le persone non lo vedono, i programmi di spam lo riempiono.
  if (!empty($_POST['website'])) back('sent');

  // Oltre il limite orario per IP la richiesta non parte e la persona vede l'errore, con l'email di riserva.
  if (!sotto_limite($LIMITE)) back('error');

  $name = clean($_POST['name'] ?? '', 100);
  $agency = clean($_POST['agency'] ?? '', 150);
  $country = clean($_POST['country'] ?? '', 80);
  $email = clean($_POST['email'] ?? '', 200);
  $date = clean($_POST['date'] ?? '', 60);
  $venue = clean($_POST['venue'] ?? '', 150);
  $guests = clean($_POST['guests'] ?? '', 40);
  $arrival = clean($_POST['arrival'] ?? '', 20);
  $etype = tipo_evento($_POST, $KEY, $ETYPE);
  $message = mb_substr(trim(str_replace("\r", '', (string)($_POST['message'] ?? ''))), 0, 2000);

  if ($name === '' || $agency === '' || $country === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)
      || $date === '' || $venue === '' || $guests === '' || !isset($ARRIVAL[$arrival]) || $etype === '') {
    back('error');
  }

  $subject = oggetto($etype, $agency);
  $body = "New request from the website form (cataniaairporttransfer.net/$PAGINA)\n\n"
    . "Name: $name\n"
    . "Company: $agency\n"
    . "Country: $country\n"
    . "Email: $email\n\n"
    . "Event type: {$ETYPE[$etype]}\n"
    . "Date: $date\n"
    . "Venue or town: $venue\n"
    . "Guests to move: $guests\n"
    . "Guests arrive from: {$ARRIVAL[$arrival]}\n\n"
    . "Message:\n" . ($message !== '' ? $message : '(none)') . "\n";

  $headers = "From: $FROM\r\n"
    . "Reply-To: $email\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

  $ok = invia($TO, $subject, $body, $headers);
  invia($BACKUP, '[copia] ' . $subject, $body, $headers);

  back($ok ? 'sent' : 'error');
}

// Quale blocco mostrare lo dice l'indirizzo (#paid o #cancelled). Senza JavaScript resta visibile il blocco neutro (regola noscript).
const chosen = { '#paid': 'paid', '#cancelled': 'cancelled' }[location.hash] || 'unknown';
['paid', 'cancelled', 'unknown'].forEach((id) => {
  document.getElementById(id).hidden = id !== chosen;
});
// Il link «Skip to content» punta al contenuto del blocco mostrato.
document.querySelector('.skip')?.setAttribute('href', `#content-${chosen}`);

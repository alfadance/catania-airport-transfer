// Old email links point to /#agency-rates: the agency rates form now lives on /partners/.
if (location.pathname === '/' && location.hash === '#agency-rates') location.replace('/partners/?role=agency#apply');

// The phone and tablet menu, on every page.
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    toggle.focus();
  }
});

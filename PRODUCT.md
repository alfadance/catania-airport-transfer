# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Travel agencies, tour operators and DMCs outside Italy (UK, USA, Malta, Australia, New Zealand, Ireland and
others) looking for a reliable ground-transport supplier in Sicily. They reach the site from a prospecting email,
LinkedIn, the WTM London fair or a link shared on WhatsApp, usually after a first contact, and they check whether
the promises hold before sending guests.

Private travellers are a secondary audience. They are not addressed by the page copy; they get one side door to
book on WhatsApp.

## Product Purpose

The site turns an agency's visit into a request for the 2027 net rate sheet, through the form in `#agency-rates`
(handled by `request-rates.php`, which emails info@cataniaairporttransfer.net and stores nothing). Private
travellers are sent to WhatsApp with a prefilled message. Success is a qualified rate-sheet request, counted in
GA4 as `richiesta_tariffe` (only after cookie consent).

## Positioning

Based at Catania Airport and working across the whole of Sicily. Over 20 years in the trade, more than 5,000
transfers since 2022, and around 97% of the business every year comes from partners who come back. The driver is
at the pickup point 15 minutes before the agreed time. Agencies get one annual net rate sheet with written terms,
and a fuel adjustment tied to the official monthly diesel average that works in both directions.

## Operating Context

- Traffic is low (about 20 sessions a month in 2026): agencies are reached by prospecting, LinkedIn and fairs,
  not by search. The page has to convince someone who already has the link.
- Office Monday to Friday, 9:00 to 18:00; emergency line (phone and WhatsApp) 24/7 for every service in progress.
- Drivers and office speak English and Italian. The site is in English only.
- The rate sheet itself is a PDF sent on request; it is not published on the site.

## Capabilities and Constraints

- Static site: `index.html` and `privacy.html`, Tailwind CSS 3.4 compiled to `assets/tailwind.css`
  (`npm run build:css`), fonts self-hosted.
- Deploy: push to `main` runs GitHub Actions, which checks that the compiled CSS matches the sources and syncs over
  FTPS to Bluehost. Bluehost has a proxy cache in front of the site: pages are sent with `Cache-Control: no-cache`
  so it revalidates them.
- Analytics load only after cookie consent.
- Decided on 2026-09-25: a call (`tel:`) link sits next to WhatsApp in the contacts and the footer (not in the mobile
  bar); no Instagram icon until there is an active profile; no veil over the hero photo.

## Brand Commitments

- Every claim comes from the approved list of verifiable facts kept in the owner's vault
  (`analisi/brand-b2b-2027/fatti-verificabili.md`). A claim that is not on the list does not go on the site.
- Never name a client, not even described.
- Never say or hint who executes a service (no "partner network", no share of services run by colleagues).
- Offers and conditions for private travellers never appear in material for agencies.
- The number of Google reviews is stated only from 20 upward; today the site says "Rated 5.0 on Google".
- Palette is the company's navy and orange only; no semi-transparent colour veils over photos.
- Every text is checked with the humanizer rules before it ships: plain English, no sales inflation.

## Evidence on Hand

- Three real Google reviews quoted on the page (names shortened to initial), all 5 stars.
- Photos in `assets/` (hero with Etna, four routes, three event scenes).
- Company details in the footer: VAT IT05924950875, REA CT-448461.
- No case studies, press or client logos exist, and none may be invented.

## Product Principles

1. Facts over adjectives: a number with a source beats any superlative.
2. One primary action for agencies, the rate sheet; everything else is secondary.
3. Agencies first, private travellers through the side door.
4. Say what is guaranteed, never who does it.

## Accessibility & Inclusion

WCAG 2.2 AA: text contrast of at least 4.5:1, touch targets of at least 44px for controls, visible keyboard focus,
motion only without `prefers-reduced-motion`. Readers are international and read English as a second language
more often than not, so sentences stay short and plain.

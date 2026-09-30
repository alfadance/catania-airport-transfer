---
name: Catania Airport Transfer
description: Airport and chauffeur transfers across Sicily, for travel agencies and DMCs.
colors:
  night-black: "#050608"
  harbour-navy: "#1B3F5D"
  signal-orange: "#EE8211"
  signal-orange-hover: "#FF8F24"
  paper: "#FFFFFF"
  mist: "#F4F6F9"
  button-ink: "#000000"
  ink: "#1E293B"
  ink-soft: "#334155"
  ink-muted: "#475569"
  rule-dark: "#64748B"
  on-dark: "#E2E8F0"
  on-dark-soft: "#CBD5E1"
  on-dark-muted: "#94A3B8"
typography:
  hero:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.5rem to 4.6rem"
    fontWeight: 700
    fontStretch: "125%"
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  cta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "2.25rem to 3.75rem"
    fontWeight: 700
    fontStretch: "125%"
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.875rem to 3rem"
    fontWeight: 700
    fontStretch: "112%"
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  stat-lg:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem to 3.75rem"
    fontWeight: 700
    fontStretch: "125%"
  route:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem to 2.25rem"
    fontWeight: 700
    fontStretch: "125%"
  stat:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.875rem to 2.25rem"
    fontWeight: 700
    fontStretch: "125%"
  h3:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem to 1.5rem"
    fontWeight: 700
    fontStretch: "125%"
  quote:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.25rem to 1.75rem"
    fontWeight: 400
    lineHeight: 1.35
  lead:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem to 1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  meta:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  small-print:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  gutter: "16px, 24px from 640px"
  section: "64px, 80px from 640px, 112px from 1024px"
  section-head: "40px, 56px from 1024px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.button-ink}"
    rounded: "{rounded.full}"
    height: "48px"
    typography: "16px semibold"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange-hover}"
  button-outline-dark:
    backgroundColor: "{colors.night-black}"
    textColor: "{colors.on-dark}"
    border: "1px {colors.rule-dark}, orange on hover"
  button-outline-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.harbour-navy}"
    border: "1px {colors.harbour-navy}, orange on hover"
  button-small:
    height: "44px"
    typography: "14px semibold"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    border: "1px harbour-navy at 60% (3.5:1 on white, WCAG 1.4.11), full on hover, full plus a 1px ring on focus"
    rounded: "{rounded.md}"
    height: "48px"
    typography: "16px"
  icon-chip:
    backgroundColor: "{colors.harbour-navy}"
    textColor: "{colors.signal-orange}"
    rounded: "{rounded.lg}"
    size: "48px, icon 24px, stroke 2"
---

# Design System: Catania Airport Transfer

## Overview

**Creative North Star: "The Departures Board"**

The site reads like the signage of an airport and the board above the arrivals hall: one expanded grotesque in
bold for names and numbers, plain text for everything else, hairline rules instead of boxes. It is written for an
agency that has to trust it with its guests, so facts, times and written terms carry the page. Colour appears where
an action waits and nowhere else.

The page opens on night black (the airport at dusk), then runs on white and mist in navy ink, with one navy band
for the reviews and a second black moment for the rate-sheet form. It closes on the brand name set across the
whole width of the footer. Nothing moves unless the visitor asks for it.

**Key characteristics**
- Archivo expanded is the brand voice; normal width is the reading voice.
- Rules, not cards. A box appears only where it holds something: the form, the agencies panel, the cookie banner.
- Navy for reading, orange for pressing.
- Solid fills only: no glows, blurs, colour veils or gradients.
- Always aligned left, on a 12-column grid inside `max-w-7xl`.

## Base rules

Since 2026-09-30 every change to this site also follows the project's 30 base design rules (hierarchy, spacing,
alignment, typography, colour, components, usability, polish). They live in one place, the owner's vault:
`cevvello/wiki/concepts/regole-di-design.md`, with a measurable check for each rule. They are not copied here.
They apply inside this document: the brand colours below do not change, and a rule that seems to need a new colour
is met with shape, words or icons. Where a rule collides with a decision recorded here, the recorded decision holds
until the owner changes it.

How the rules map onto this site's tokens:

| Rules | Where they land here |
|---|---|
| 1–4 hierarchy | one `t-hero` per page; one filled `btn-primary` per section; expanded type only for headings, places and numbers |
| 5–8 spacing | Tailwind's 4px scale; `section-pad`, `section-head`, `wrap` |
| 9–12 alignment | the 12-column grid in `wrap`; radii 8 / 12 / 16 / full as listed under Shapes |
| 13–16 typography | the `t-*` scale only; body leading 1.625; 4.5:1 on the rendered page |
| 17–20 colour | orange is the one accent; `palette-check.py` at 0 pixels off palette; states carry words or icons |
| 21–24 components | `btn*`, `field`, `link` classes with hover, focus, active, disabled and loading states |
| 25–27 usability | the rate-sheet form, its sending and result states, the sticky header and phone bar |
| 28–30 polish | 44px targets, 16px fields, reduced motion, 360–1440px without horizontal scroll, Lucide stroke 2 icons |

Owner decisions of 2026-09-30 (briefing after the first review against the rules), written here as exceptions so a
later review does not flag them again:
- **The long review (`t-quote`)** stays at 20–28px with leading 1.35, and reviews may run past five lines: they are
  quotations, not body copy (rules 3, 14, 16).
- **Photo radii** follow the photo type: 8px route thumbnails, 12px event photos, 16px hero (rule 12).
- **Drive times** in the routes board stay right-aligned from 1024px, like a departures board (rule 6).
- **Line length**: the 45-character minimum applies from 640px; on phones 16px body text is enough (rule 14).
- **Beside the form**, the short text column may leave empty black space below it, next to the taller form panel
  (rule 8).

## Colors

Two brand colours on a neutral ground: navy for everything read, orange for everything pressed. The Tailwind names
are `brandBlack`, `brandNavy`, `brandOrange`, `brandOrangeHover` and `mist`; the neutrals are Tailwind's slate.

### Primary
- **Signal Orange** `#EE8211`: the only colour that asks for an action. Filled buttons, the underline of text
  links and nav links, the icons inside navy chips, list dots, stars, text selection. Never text on white or mist
  (2.7:1).
- **Signal Orange Hover** `#FF8F24`: hover state of filled orange buttons.

### Secondary
- **Harbour Navy** `#1B3F5D`: headings, links and labels on light grounds; the reviews band, the agencies panel,
  icon chips, the process line and every rule (full strength for the rule that opens a list, 20% between items);
  caret and native accent colour.

### Neutral
- **Night Black** `#050608`: header, hero, the form section, footer, cookie banner, mobile bar. Always solid.
- **Paper** `#FFFFFF` and **Mist** `#F4F6F9`: the light section grounds, alternating; Paper also for the form
  panel and fields.
- **Button Ink** `#000000`: the label on orange buttons (8.4:1).
- **Ink** slate-800, **Ink Soft** slate-700, **Ink Muted** slate-600: body, secondary text and small labels on
  light grounds, all above 4.5:1.
- **On Dark** slate-100/200, **On Dark Soft** slate-300, **On Dark Muted** slate-400: text on black and navy.
  slate-500 (`#64748B`) is only a rule or a border on dark, never text.
- The one exception to the palette is the red of the form error box, kept because an error needs a meaning colour.

### Named Rules
**The Solid Fill Rule.** Every coloured surface is a solid palette colour. A palette colour in transparency is no
longer that colour: over a photo, or even over white, it turns purple, brown or peach. Rules at 20% navy are the
only transparency, and they are lines, not surfaces. Check the rendered screenshot, not the CSS
(`scripts/verifica/palette-check.py`).

**The Read Navy, Press Orange Rule.** Text on a light ground is navy or ink. Orange marks what can be pressed.

## Typography

**Font:** Archivo, variable, self-hosted (`assets/fonts/archivo-latin-400-700.woff2`, Latin set, 57 KB). The axes
are cut to what the site uses: weights 400 to 700, widths 100% to 125%. A weight or width outside those ranges must
be regenerated from the full Archivo file (fontTools `varLib.instancer`), otherwise the browser fakes it. A new
file gets a new name: `.htaccess` caches fonts for a year as immutable. One file, declared in `src/tailwind.css`,
so both pages get it.

**Character:** the expanded cut (`stretch-wide`, 125%) in bold works like road and airport signage: place names,
numbers, the hero. Section headings sit a notch narrower (`stretch-semi`, 112%). Body text is normal width.

### Scale (classes in `@layer components` of `src/tailwind.css`)
The classes fix size, weight, width and leading; colour stays in the HTML because it depends on the ground.

| Class | Use | Size, phone to desktop |
|---|---|---|
| `t-hero` | the page headline, one only | 40px to 74px, 125%, 700, leading 0.98 |
| `t-cta` | the rate-sheet form heading | 36px to 60px, 125%, 700 |
| `t-h2` | every section heading (and the privacy H1) | 30px to 48px, 112%, 700 |
| `t-stat-lg` | event numbers | 48px to 60px, 125% |
| `t-route` | destination in the routes board | 24px to 36px, 125% |
| `t-stat` | hero facts | 30px to 36px, 125% |
| `t-h3` | step and panel headings | 20px to 24px, 125% |
| `t-quote` | the long review | 20px to 28px, normal width, 400 |
| `t-lead` | opening paragraph of a section | 16px to 18px, leading 1.625 |
| `t-body` | paragraphs | 16px, leading 1.625 |
| `t-meta` | small labels ("Catania Airport to", "Scale", dates) | 14px, 500 |

Headings use `text-wrap: balance`. Small print (the legal line in the footer) is 12px; nothing a visitor must read
is smaller, and body copy is never under 16px.

### Named Rules
**The No Kicker Rule.** No tracked-uppercase label above a heading. A small label may sit above a number or a place
name when it says what the number is ("Scale", "Catania Airport to"); it never introduces a section.

**The One Voice Rule.** Expanded is for names and numbers. A sentence longer than a headline is set at normal width.

## Layout

- Container `wrap`: `max-w-7xl`, 16px gutter, 24px from 640px.
- Section rhythm `section-pad`: 64px, 80px from 640px, 112px from 1024px, top and bottom.
- Section head `section-head`: heading in 8 columns, opening paragraph in 4, aligned at the bottom; 40px, then
  56px, to the content.
- Grids: 7+5 for text beside a panel, 5+7 for the form, 4+8 for the FAQ (on large screens the heading stays in
  view while the answers scroll, and so does the text beside the form), three columns for events and steps. Every
  12-column grid, `section-head` included, uses the same 48px column gap from 1024px (`lg:gap-x-12`), and the three
  columns use it too, so all columns fall on the same lines down the page.
- Phones and tablets (below 1024px): the fixed bottom bar carries WhatsApp and the rate sheet, so the footer keeps
  80px of bottom padding. On the home page the bar slides in only once the hero's orange button has left the screen,
  so one orange button is in view at a time; without JavaScript it is always there.
  Event photos hide below 640px and, being `loading="lazy"`, are not downloaded there. `html` has
  `scroll-padding-top: 5rem` (and 4.5rem at the bottom below 1024px), so neither an anchor nor the keyboard focus lands
  under the sticky header or the bottom bar (WCAG 2.2, 2.4.11).

## Elevation & Depth

Flat, with no shadows at all. Depth comes from the ground changing (black, white, mist, navy). The floating cookie
banner is set apart by its navy border, not by a shadow. No coloured shadow or glow anywhere.

## Shapes

Buttons and the skip link are fully round. Photos take 8px (route thumbnails), 12px (event photos) and 16px
(hero); the form panel, the agencies panel and the cookie banner 16px; fields 8px; icon chips 12px. Photos carry
no overlay.

## Components

### Buttons (`btn` plus a variant)
- **`btn`**: 48px tall, 16px semibold, fully round, no wrapping from 640px. Colour and transform transitions of
  150ms, ease-out.
- **`btn-primary`**: orange fill, black label, orange-hover on hover. The primary action has one label everywhere:
  "Get the 2027 agency rates" (the header pill says "Agency rates").
- **`btn-outline-dark`**: black fill, slate-500 border, light label; the border turns orange on hover. The
  private-traveller side door, cookie reject, the mobile menu toggle.
- **`btn-outline-light`**: white fill, navy border and label; the border turns orange on hover. Contact actions.
- **`btn-sm`**: 44px, 14px, for the header, the mobile bar and the cookie banner.
- **Disabled** (the form while sending): solid slate-300 fill, slate-800 label, wait cursor, no hover and no press
  effect; the label reads "Sending…" beside a Lucide `loader-circle` that spins only without reduced motion.
- **Focus:** 2px outline in the text colour, 3px offset. On orange buttons the outline is navy on light grounds
  and orange inside `.on-dark`. **Active:** scale 0.97, only without reduced motion. Every control is 44px or more.

### Links
- **`link`**: semibold, 2px orange underline 4px below; on hover the underline takes the text colour. Navy text on
  light grounds, white on dark ones.
- **`nav-link`**: header links on black, slate-200, 44px tall, turning white with a 2px orange underline on hover.
- **`footer-link`**: 44px rows, slate-300, white on hover.

### Routes board (`route-row`, `route-img`, signature)
The routes are a departures board, not cards: a navy rule on top, then one row per destination with a thumbnail,
"Catania Airport to" in `t-meta`, the place in `t-route`, a one-line use case, and the drive time in navy semibold
tabular figures aligned right. On phones the thumbnail sits left and the time drops under the text. Thumbnails come in two files, `route-*-480.webp` (phones and 1x screens) and the 900px original, chosen by `srcset`; the hero adds a 1200px step between the 800px and 1600px files.

### Rule lists
The agencies panel list, the FAQ, the contacts, the footer columns and the legal sections of `privacy.html` use the
same device: a strong rule to open the list, 20% rules between items, no boxes.

### FAQ (`faq-item`, `faq-q`, `faq-a`, `faq-chevron`)
Native `<details>`. Question in navy semibold, 44px or more; a stroke chevron that turns 180° when open
(transition only without reduced motion).

### Form (`field-label`, `field`, `form-foot`)
White panel on the black section. Two groups, "about you" (name, company, country, email) and "your request" (how
you heard of us, message), each a `fieldset` whose `legend` is for screen readers only; a 20% navy rule and 32px
separate them. Fields 48px, 16px text everywhere (no zoom on iOS), navy border at 60% (3.5:1, enough to see
the field), full navy on hover, full navy plus a 1px ring on focus. The select draws the FAQ chevron in navy instead of the system arrow.
Under the submit button, a rule and a navy lock with the privacy line. Success is a white box with an orange
border and a navy Lucide `circle-check`; error is the red box with a `circle-alert`, and an email fallback. Both are
16px text with 16px padding, and take the focus when the page comes back from `request-rates.php`, so a screen
reader reads them. A field the visitor has touched or tried to submit while invalid gets a red-800 border and ring
(`:user-invalid`); the browser's own message gives the words. The submit button disables itself (see Buttons) and a
polite live region says "Sending…".

### Icon chip (signature)
A 48px Harbour Navy square with 12px corners holding a 24px Signal Orange stroke icon (2 stroke, round caps),
used for the three steps of "How it works" and joined by a navy line (horizontal from 768px, vertical on phones).
Every drawn icon on the site belongs to this stroke family: step icons, chevrons, the lock. The two social marks
(Facebook, LinkedIn) are the brands' own filled logos. Rating stars are one Lucide star (`#star`, filled) used five times.

### Reviews band
Solid navy. The long review in `t-quote` on the left (7 columns), the two shorter ones on the right, each under a
slate rule; stars in orange, name in white, date and source in slate-300.

### Header, footer, cookie banner, mobile bar
The same markup on both pages. Header sticky on black with a navy rule: logo plus the name in expanded, five
`nav-link`s (Why us, Routes, Reviews, FAQ, Contact) and the orange pill from 1024px; below that a native `<details>` menu ("Menu" / "Close", closes on choice or Esc).
Logo on black: header and footer use `image_0-dark*.webp`, the CAT mark with its navy turned to white and the
lighter navy to slate-300 (orange unchanged), because the navy disappears on Night Black. The original `image_0*.webp`
stays for light grounds and for the structured data.
Footer: logo and line, page links, contacts in a rule list, then copyright, Privacy, Cookie preferences and the
legal line. No oversized brand name as a sign-off: the name is already in the logo, the copyright and the legal line
(removed on 2026-09-27 at the owner's request, it read as out of place).
Cookie banner: floating black card, navy border, 14px text, reject as outline and accept as primary. Opened from "Cookie preferences", it takes the focus and gives it back to that button after the choice. The phone bottom bar is a `<nav aria-label="Quick contact">`.

### Browser surfaces
Text selection is orange with black text; caret and native accents are navy; focus rings as above.

### Icons
Icons are Lucide (ISC licence), copied as inline SVG: 24 viewBox, stroke 2, `currentColor`, round caps and joins; no icon library or CDN at runtime. The only exceptions are brand marks, which Lucide does not draw: the Facebook and LinkedIn logos in the contacts, and WhatsApp if its logo is ever added.

## Pages

- **`index.html`**: hero, why us, routes board, reviews, events, how it works, rate-sheet form, FAQ, contacts.
- **`privacy.html`**: the same header, footer, banner and mobile bar (links point to `index.html#…`). A black
  opening with the title in `t-h2` and the date in `t-meta` under it, then the legal text on white in a 68ch
  column (`legal`), each section under a rule, headings in navy `stretch-semi`.

## Do's and Don'ts

### Do:
- **Do** change a size in the `t-*`, `btn*`, `wrap` and `section-pad` classes, not in the HTML.
- **Do** use Signal Orange only for things that can be pressed, and for icons, dots, stars and link underlines.
- **Do** set text on light grounds in navy or ink, at 4.5:1 or more.
- **Do** keep every coloured surface a solid palette colour and check it on a screenshot.
- **Do** keep controls 44px or taller and fields at 16px.
- **Do** keep one primary action with one label.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading.
- **Don't** turn rule lists back into cards, or add decorative section numbers (01, 02, 03).
- **Don't** use a hue outside navy and orange (the red error box is the only exception).
- **Don't** use glows, blurred blobs, `mix-blend`, gradients or translucent colour veils.
- **Don't** set orange text on white or mist.
- **Don't** use Unicode glyphs or emoji as icons.

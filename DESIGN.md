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
  ink: "#1E293B"
  ink-soft: "#334155"
  ink-muted: "#475569"
  on-dark: "#E2E8F0"
  on-dark-muted: "#94A3B8"
typography:
  display:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  gutter: "16px"
  card: "24px"
  section: "64px"
  section-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.night-black}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.harbour-navy}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  icon-chip:
    backgroundColor: "{colors.harbour-navy}"
    textColor: "{colors.signal-orange}"
    rounded: "{rounded.md}"
    size: "40px"
---

# Design System: Catania Airport Transfer

## Overview

**Creative North Star: "The Dispatcher's Notebook"**

The page reads like the notebook of the person who runs the dispatch: tidy, exact, written for someone who has to
trust it with their guests. Facts, times and written terms carry the page. Colour appears where an action waits,
and nowhere else. A night-black opening sets the airport at dusk; everything after it sits on white and mist, in
navy ink.

Density is moderate. Sections are short, one idea each, separated by generous vertical space rather than by
decoration. Nothing moves unless the visitor asks for it.

**Key Characteristics:**
- Dark opening, light body: one black hero, then white and mist bands.
- Navy for reading, orange for doing.
- Solid fills only; no glows, blurs or colour veils.
- Numbers and terms stated plainly, never dressed up.

## Colors

Two brand colours on a neutral ground: navy for everything read, orange for everything pressed.

### Primary
- **Signal Orange**: the only colour that asks for an action. Filled buttons, icons inside navy chips, the
  underline of text links, list markers. Never used as text on white or mist: it reaches only about 2.7:1 there.
- **Signal Orange Hover**: hover state of filled orange buttons, and the second stop when two oranges meet.

### Secondary
- **Harbour Navy**: headings, links, labels and every piece of text that needs weight on a light ground; also the
  solid fill of icon chips and the process connectors.

### Neutral
- **Night Black**: the hero, the header, the footer, the cookie banner and the mobile bar, always solid (no blur,
  no radial glow).
- **Paper** and **Mist**: alternating section grounds on the light part of the page; Paper also for cards and inputs.
- **Ink**, **Ink Soft**, **Ink Muted**: body text, secondary text and small print on light grounds, all above 4.5:1.
- **On Dark** and **On Dark Muted**: text on Night Black.

### Named Rules
**The Solid Fill Rule.** Every coloured surface is a solid palette colour. A palette colour in transparency is no
longer that colour: over a photo, or even over white, it turns purple, brown or peach. Check it on the rendered
screenshot, not in the CSS.

**The Read Navy, Press Orange Rule.** Text on a light ground is navy or ink. Orange marks what can be pressed.

## Typography

**Display Font:** Montserrat (with system-ui, sans-serif)
**Body Font:** Montserrat (with system-ui, sans-serif)

**Character:** One geometric sans in three weights (400, 500, 600), self-hosted and cut to the Latin alphabet. The
700 weight is not loaded; semibold is the heaviest voice.

### Hierarchy
- **Display** (600, 30px to 48px, 1.05): the hero headline only. First line in Signal Orange on Night Black.
- **Headline** (600, 24px to 30px, 1.2): one per section, in navy.
- **Title** (600, 16px to 18px): card and step headings.
- **Body** (400, 14px to 16px, 1.625): paragraphs, capped around 36rem wide.
- **Label** (600, 12px to 14px): buttons, route names, small facts.

### Named Rules
**The No Kicker Rule.** No tracked-uppercase label above a heading. The heading says it on its own.

**The 12px Floor Rule.** Nothing a visitor must read is smaller than 12px; body copy is 14px or more.

## Layout

A single centred column capped at 72rem, with a 16px gutter. Sections alternate Paper and Mist and are 64px tall at
the top and bottom on mobile, 80px to 96px on large screens. Inside a section, simple grids do the
work: two columns for text beside a card, three or four for cards. Route cards stay in two
columns even on phones; event photos are hidden below 640px. The mobile sticky bar at the bottom carries the two
actions (WhatsApp and the rate sheet), so the footer keeps 80px of bottom padding on mobile.

## Elevation & Depth

Mostly flat, with one soft shadow. Cards and panels sit on a hairline navy border with a small shadow
(`shadow-sm`). The only deeper shadows are the hero photo frame and the hero call to action, both on black, both
neutral black. No coloured shadow or glow anywhere.

### Named Rules
**The Neutral Shadow Rule.** A shadow is black and offset downward. A zero-offset coloured halo is decoration.

## Shapes

Rounded, never sharp. Buttons and pills are fully round. Cards take 16px corners, panels and the form 24px, inputs
and icon chips 12px. Borders are 1px navy at low strength. Photos are clipped by the card that holds them and
carry no overlay, the hero photo included.

## Components

### Buttons
- **Shape:** fully round (9999px).
- **Primary:** Signal Orange fill, Night Black semibold label, 12px by 24px; on hover it moves to Signal Orange
  Hover. One primary action per view: "Get the 2027 agency rates".
- **Secondary:** Paper fill, hairline navy border, navy label; on hover the border turns orange.
- **On dark:** outline in orange with an orange label, for the private-traveller side door.
- **Focus / Active:** a 2px outline in the text colour, 3px offset. On orange buttons the outline is navy on light
  grounds and orange on dark ones (containers marked `on-dark`). A 0.97 scale on press when reduced motion is not
  requested. Every button is at least 44px tall. A "Skip to content" link is the first focus stop.

### Cards / Containers
- **Corner Style:** 16px (cards), 24px (panels, form).
- **Background:** Paper on Mist, or Paper on Paper with a border.
- **Shadow Strategy:** `shadow-sm` only.
- **Border:** 1px Harbour Navy at 10 to 15% strength.
- **Internal Padding:** 16px to 32px.

### Inputs / Fields
- **Style:** Paper fill, 1px navy border at 20%, 12px corners, 16px text on phones (no zoom on iOS), 14px above.
- **Focus:** border turns Harbour Navy, plus the global focus outline.
- **Error:** a red alert box above the form with a plain message and an email fallback; the only non-palette
  colour on the page, kept because errors need a meaning colour.

### Navigation
- **Style:** uppercase 12px links with wide tracking on Night Black; an orange underline on hover. The "Agency
  rates" pill in orange is always visible, also on phones where the links are hidden.

### Icon Chip (signature)
A 40px Harbour Navy square with 12px corners holding a 20px Signal Orange icon (3.9:1), used for the three steps of
"How it works". It is the only place orange and navy touch at full strength, and it replaces the old translucent
orange tint.

## Do's and Don'ts

### Do:
- **Do** use Signal Orange only for things that can be pressed, and for icons and link underlines.
- **Do** set text on light grounds in Harbour Navy or Ink, at 4.5:1 or more.
- **Do** keep every coloured surface a solid palette colour and check it on a screenshot.
- **Do** keep controls at least 44px tall and form fields at 16px on phones.
- **Do** keep one primary action per view.

### Don't:
- **Don't** put a kicker or eyebrow label above a heading.
- **Don't** use green, purple or any hue outside navy and orange (the red error box is the only exception).
- **Don't** use glows, blurred blobs, `mix-blend` effects or translucent colour veils.
- **Don't** set orange text on white or mist.
- **Don't** add decorative section numbers (01, 02, 03).

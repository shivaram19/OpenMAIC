# PRODUCT.md — Dr. Math (powered by OpenMAIC)

**Last updated:** 2026-06-04  
**Scope:** Design context for the Dr. Math product UI and marketing surfaces. Read this before any `/impeccable` command.

---

## Product

**Name:** Dr. Math  
**Tagline:** Adaptive worksheets that learn how your students learn.  
**What it is:** An AI worksheet generator + OMR scan + adaptive next-worksheet loop for Indian K-12 and test-prep.

The core loop:

1. Teacher selects a topic and board.
2. Dr. Math generates a personalized, board-aligned worksheet PDF for each student.
3. Students answer on paper; teacher scans the OMR strip with a phone.
4. Dr. Math grades, updates a per-student "Mark," and recommends the next worksheet.

---

## Audience

### Primary decision-makers
- **Tuition centre owners** (Tier 2/3 India) who run 50–500 student centres.
- **School principals / academic coordinators** at budget private schools.
- **Teachers** who currently create worksheets and grade them by hand.

### End users
- **Students** in Class 6–12, CBSE and major state boards.
- **Parents** who want simple progress proof (scores, gaps, next topics).

### Context of use
- Low-bandwidth classrooms and homes.
- Mixed device ownership; teachers often use Android phones.
- Paper worksheets are the default ritual; digital-only tools fail.
- Trust is low after the BYJU’S collapse; outcomes and transparency matter more than features.

---

## Brand / Product Lane

**Product-first, with a small brand layer.**

- The app UI is the main surface: dashboards, rosters, worksheet previews, scan results, reports.
- The marketing site is secondary: a single landing page that explains the loop, shows outcome proof, and gets a pilot conversation.

---

## Voice

- **Calm.** No exclamation marks, no “revolutionary,” no “unlock your potential.”
- **Clinical but warm.** Teachers are professionals; speak to them as such.
- **Outcome-oriented.** Every feature statement ties back to time saved or learning gained.
- **Local.** Use Indian context naturally (boards, marks, terms like “worksheet,” “OMR,” “remedial”).

### Examples

| Instead of | Use |
|------------|-----|
| “AI-powered personalized learning revolution” | “Worksheets that match each student’s gaps.” |
| “Supercharge your classroom!” | “Reduce worksheet prep and grading time.” |
| “Gamified, immersive experience” | “Clear progress for every student.” |
| “One-click magic” | “Generate, print, scan, and adapt.” |

---

## Anti-References

Do not use:

- **Purple gradients or purple primary buttons.** The existing OpenMAIC palette uses purple; Dr. Math must differentiate with a calmer, non-hype identity.
- **Glassmorphism, blur, or dark glows.** These feel expensive and fragile in low-end Android browsers.
- **Cartoon mascots or playful illustrations.** This is a teaching tool, not a children’s game.
- **Cards nested inside cards.** Keep surfaces flat and scannable.
- **Aggressive upsell modals or countdown timers.** Trust-building, not pressure-selling.
- **System-default Inter everywhere.** Use Geist Sans for UI and Geist Mono for data.
- **Pure black (#000) or pure gray.** Tint neutrals with warmth.
- **Bounce/elastic easing.** Use subtle fades and slides only.

---

## What It Should Feel Like

- **A well-organized teacher’s desk:** everything has a place, nothing shouts.
- **A diagnostic report:** numbers are clear, trends are visible, next steps are obvious.
- **A local tuition centre:** practical, affordable, reliable.

---

## Key Jobs-to-be-Done

1. Generate a board-aligned worksheet in under 60 seconds.
2. Print and distribute worksheets without changing classroom rituals.
3. Grade a stack of papers by scanning with a phone.
4. See which students need remediation and on which topics.
5. Share progress with parents in Hindi or English.

---

## Constraints

- **DPDP 2023:** student data is personal data; minors require verifiable parental consent; no behavioral ads or cross-border transfers by default.
- **Low bandwidth:** PDF-first, lightweight HTML, no heavy animations.
- **Multilingual:** English and Hindi day-one; regional languages later.
- **Print-friendly:** worksheets must render cleanly on A4 black-and-white printers.

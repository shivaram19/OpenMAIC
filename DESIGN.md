# DESIGN.md — Dr. Math

**Last updated:** 2026-06-04  
**Related:** `PRODUCT.md`, `AGENTS.md`

---

## Design Tokens

### Color

Use warm, tinted neutrals. Avoid the purple primary inherited from OpenMAIC.

| Token | Light mode | Dark mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#fafaf9` (warm white) | `#1c1917` (warm charcoal) | Page background |
| `--foreground` | `#1c1917` | `#fafaf9` | Primary text |
| `--card` | `#ffffff` | `#292524` | Cards, panels |
| `--card-foreground` | `#1c1917` | `#fafaf9` | Text on cards |
| `--primary` | `#0d7377` (deep teal) | `#14b8a6` | Primary actions, links |
| `--primary-foreground` | `#ffffff` | `#042f2e` | Text on primary |
| `--secondary` | `#f5f5f4` | `#44403c` | Secondary surfaces |
| `--secondary-foreground` | `#44403c` | `#e7e5e4` | Text on secondary |
| `--muted` | `#f5f5f4` | `#44403c` | Muted backgrounds |
| `--muted-foreground` | `#78716c` | `#a8a29e` | Secondary text |
| `--accent` | `#f59e0b` (amber) | `#fbbf24` | Warnings, highlights, mastery badges |
| `--accent-foreground` | `#422006` | `#422006` | Text on accent |
| `--destructive` | `#dc2626` | `#ef4444` | Errors, destructive actions |
| `--border` | `#e7e5e4` | `#44403c` | Dividers, borders |
| `--ring` | `#0d7377` | `#14b8a6` | Focus rings |

**Rules:**
- No purple as a primary, secondary, or accent color.
- No pure black or pure gray; all neutrals are warm-tinted.
- Text on colored backgrounds must pass WCAG 2.1 AA.

### Typography

- **Font family:** Geist Sans (`--font-sans`) for UI; Geist Mono (`--font-mono`) for metrics, scores, and code.
- **Hindi/regional fallback:** Noto Sans Devanagari / Noto Sans Tamil / Noto Sans Kannada (load only when medium is set).
- **Base size:** 16px / 1rem.
- **Scale:** 12, 14, 16, 18, 20, 24, 30, 36px.
- **Line height:** 1.5 for body, 1.25 for headings.
- **Font weights:** 400 regular, 500 medium, 600 semibold, 700 bold.

### Spacing & Radius

- **Grid:** 4px base unit.
- **Common spacers:** 4, 8, 12, 16, 24, 32, 48, 64px.
- **Radius:** 8px for inputs/buttons, 12px for cards, 16px for dialogs.
- No fully rounded pills unless for tags/chips.

### Motion

- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for UI transitions.
- **Durations:** 150ms for micro-interactions, 250ms for page transitions.
- **Avoid:** bounce, elastic, or heavy parallax.
- **Respect `prefers-reduced-motion`.**

---

## Components

### Worksheet Card

- Clean A4 preview thumbnail.
- Topic, board, grade, number of questions, generated date.
- Primary action: **Print**; secondary: **Regenerate**, **Download PDF**.
- State badges: Draft, Printed, Scanned, Graded.

### Student Row

- Avatar fallback (initials only; no photos of minors).
- Name, grade, board, last worksheet date, mastery sparkline.
- Hover reveals quick actions: Generate worksheet, View report.

### OMR Scan Upload

- Large drop zone with camera/upload toggle.
- Clear instructions: “Use blue/black ballpoint pen. Fill bubbles completely.”
- Confidence indicator per question; low-confidence rows flagged yellow.
- Teacher override: tap a row to edit the answer.

### Mastery Report

- Donut or horizontal bar per topic; use teal for mastered, amber for building, red for struggling.
- No more than 6 topics per chart.
- Plain-language next step: “Practice Quadratic Equations next.”

### Parent Digest

- One-page summary in selected medium (English/Hindi).
- Big numbers: worksheets completed, accuracy trend, top gap.
- WhatsApp-friendly image export option.

### Marketing Landing Page (Abhyāsa)

- Served at `abhyasa.trayini.ai` via middleware rewrite to `/abhyasa`.
- Hero: benefit-first headline, Sanskrit epigraph (Yoga Sūtra 1.14), dual CTAs, trust bar.
- Problem section mirrors audience pain points before presenting the solution.
- Loop diagram: Generate → Print → Scan → Adapt.
- Features: board-aligned, multilingual, phone-scan grading, adaptive practice, DPDP-ready, parent reports.
- Audience cards: tuition centres, budget schools, parents, students.
- Pricing cards: Starter (free), Growth (popular), Enterprise.
- Pilot form: minimal fields, privacy note, mailto fallback.
- FAQ: objections around boards, hardware, data safety, languages, pilot terms.
- See `docs/research/abhyasa-landing-design-decomposition.md` for component-dimension mapping.

---

## Layout

### App shell

- Fixed top navigation with product name, board/grade selector, help.
- Sidebar on desktop: Roster, Worksheets, Scans, Reports, Settings.
- Mobile: bottom tab bar or collapsible drawer.
- Max content width: 1280px, centered.

### Worksheet preview

- A4 aspect ratio container.
- Print button prominent.
- Board/medium badge in header.

---

## Accessibility

- WCAG 2.1 AA minimum.
- Touch targets at least 44×44px.
- Focus visible on all interactive elements.
- Hindi/regional text must render correctly (use Noto fallbacks).
- PDFs must be screen-reader friendly where possible (semantic HTML → PDF).

---

## Anti-Patterns to Enforce

| Rule | Why |
|------|-----|
| No purple primary | Product differentiation and anti-hype stance |
| No cards inside cards | Reduces visual noise |
| No gray text on colored backgrounds | Legibility |
| No pure black/white | Warmer, less harsh on low-end screens |
| No bounce easing | Feels dated and unprofessional |
| No student photos | DPDP minimization |
| No autoplay video on marketing page | Bandwidth and accessibility |

---

## Files That Implement This System

- `app/globals.css` — CSS variables and theme tokens.
- `lib/worksheet/pdf-template.ts` — worksheet PDF HTML structure.
- `app/api/generate-worksheet-pdf/route.ts` — worksheet generation API.
- `components/ui/*` — shadcn/ui components using the tokens above.
- `app/abhyasa/page.tsx` + `app/abhyasa/landing-content.tsx` — public marketing landing page.
- `docs/research/abhyasa-landing-design-decomposition.md` — component & dimension decomposition.
- `docs/research/abhyasa-landing-research.md` — research backing for name, audience, conversion, and design.

# Abhyāsa Landing Page — Component & Dimension Decomposition

Every component below is mapped to the audience, emotional, conversion, design, content, and technical dimensions that shaped it. Citations refer to `docs/research/abhyasa-landing-research.md`.

## 1. Information architecture

```
/abhyasa (served at abhyasa.trayini.ai via middleware rewrite)
├── page.tsx                              # server shell + SEO metadata
├── landing-content.tsx                   # orchestrator: every section drives action
├── _components/
│   ├── sticky-header.tsx                 # persistent CTA + navigation
│   ├── hero.tsx                          # value prop + dual CTAs + trust bar
│   ├── problem.tsx                       # pain-point mirror + transition to solution
│   ├── loop.tsx                          # Generate → Print → Scan → Adapt
│   ├── features.tsx                      # 6 benefit-led cards + CTA
│   ├── for-whom.tsx                      # audience self-identification + CTA
│   ├── pricing.tsx                       # transparent tiers + tier CTAs
│   ├── pilot-form.tsx                    # minimal lead-capture form
│   ├── faq.tsx                           # objection handling + final CTA
│   └── footer.tsx                        # trust + legal links
└── _lib/
    ├── constants.ts                      # board options, nav links, Sanskrit quote
    └── scroll.ts                         # shared scroll-to-pilot helper
```

## 2. Component-by-component research mapping

### 2.1 `sticky-header.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Keep the primary conversion action one tap away at all times. | — |
| Conversion | Minimal nav (How it works, Features, Pricing, FAQ) + single primary CTA. Reduces decision paralysis. | T6, T8 |
| Audience | Familiar labels; “Pricing” helps owners self-qualify before asking. | T8 |
| Emotional | Sticky CTA removes the “I’ll decide later” drop-off. | T7 |
| Design | Solid `bg-background` border-bottom; no glassmorphism. Calm authority. | T10, T13 |
| Technical | Mobile hamburger with the same CTA; touch target 44×44px. | T9 |

### 2.2 `hero.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Communicate the value proposition and offer two clear next steps. | — |
| Content | Headline benefit-first; subhead explains mechanism and outcome in one sentence. | T6, T7 |
| Conversion | Primary “Start free pilot” + secondary “See how it works” (anchors to loop). | T7 |
| Emotional | Secondary CTA is low-commitment; primary CTA promises a free pilot. | T9 |
| Audience | Badge filters visitors and builds belonging. | T4, T6 |
| Cultural | Sanskrit epigraph links name to Patanjali’s Yoga Sūtra 1.14. | T1, T2 |
| Design | Teal headline, amber reserved for primary button; 60-30-10 discipline. | T11, T13 |
| Trust | Trust bar: CBSE, State Boards, DPDP-ready, India-hosted, A4 print. | T6, T9 |

### 2.3 `problem.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Validate pain, then transition the visitor to the solution section with one click. | — |
| Audience | Mirrors owner/teacher/parent pain points directly. | T4, T5 |
| Emotional | “They understand me” trust before any sell. | T9 |
| Content | Three short pain points + transition link. | T6 |
| Design | Muted problem cards; teal arrow link signals resolution. | T10 |

### 2.4 `loop.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Make the workflow understandable in 10 seconds, then convert that understanding into a pilot request. | — |
| Content | Four steps: Generate, Print, Scan, Adapt; each with one-line outcome. | T7 |
| Audience | Teachers/owners understand paper-first workflow; parents see feedback loop. | T4 |
| Emotional | “Adapt” step removes fear of stagnation. | T4 |
| Design | Horizontal flow on desktop, stacked on mobile; teal icons, amber numbers. | T11 |
| Conversion | Non-clickable step cards guide eye toward the repeated CTA at bottom. | T8 |

### 2.5 `features.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Translate capabilities into outcomes, then ask for the pilot while intent is high. | — |
| Content | Each card leads with benefit, then feature. | T6 |
| Audience | Six cards cover owners, teachers, parents, students. | T4 |
| Emotional | Icons + concise copy reduce cognitive load. | T12 |
| Design | 3-column grid, subtle cards, no nested cards. | T13 |
| Conversion | Repeated primary CTA after the grid. | T8 |

### 2.6 `for-whom.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Let each visitor self-identify and move to the pilot form while relevance is fresh. | — |
| Audience | Four cards: Tuition centres, Budget schools, Parents, Students. | T4 |
| Emotional | Creates “this is for me” moment. | T9 |
| Content | Bullet points in the audience’s language. | T6 |
| Conversion | CTA immediately follows self-identification. | T8 |

### 2.7 `pricing.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Remove price ambiguity so buyers self-qualify, then convert each tier to its next step. | — |
| Conversion | Three transparent tiers with distinct CTAs. | T8 |
| Audience | Starter lowers barrier; Growth anchors value; Enterprise captures chains. | T8 |
| Emotional | “No setup fees for pilots” removes upfront-risk anxiety. | T9 |
| Design | Popular tier highlighted with primary border. | T11 |

### 2.8 `pilot-form.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Capture a high-intent lead with minimal friction, reassure about privacy, and hand the request to the sales inbox. | — |
| Conversion | Five fields only: name, organisation, email, phone, student count, board. | T9 |
| Emotional | Privacy note under submit: “No spam. Data stays in India.” | T6, T9 |
| Audience | Mobile-optimised inputs; large touch targets. | T7, T9 |
| Technical | Client-side validation; mailto fallback until CRM is integrated. | — |

### 2.9 `faq.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Remove last objections, then offer a low-friction path back to the pilot form. | — |
| Conversion | Addresses objections: cost, data safety, board support, language, pilot terms. | T6 |
| Audience | Questions written in voice of principal/parent. | T4 |
| Technical | Native `<details>`/`<summary>` for lightweight interaction and SEO-friendly text. | T6 |

### 2.10 `footer.tsx`

| Dimension | Decision | Citation |
|-----------|----------|----------|
| **Action goal** | Reinforce trust and legal anchors without distracting from the pilot. | — |
| Trust | Links to privacy, terms, Trayini.ai, contact. | T6 |
| Emotional | Closing line: “A Trayini.ai initiative. Student-first. Teacher-led. Privacy-safe.” | T9 |
| Design | Muted background, small text, no clutter. | T13 |

## 3. Cross-cutting design system tokens

Defined in `app/globals.css` and documented in `DESIGN.md`.

| Token | Value | Role | Dimension |
|-------|-------|------|-----------|
| `--background` | `#fafaf9` | Page surface | Warm, approachable neutral [T12] |
| `--foreground` | `#1c1917` | Primary text | High contrast, serious but warm |
| `--card` | `#ffffff` | Elevated surfaces | Clean, printable feel |
| `--primary` | `#0d7377` | CTAs, links, icons | Trust + calm authority [T10] |
| `--accent` | `#f59e0b` | Highlights, numbers | Attention, warmth [T11] |
| `--muted-foreground` | `#78716c` | Secondary text | Lower hierarchy without cold grey |
| `--border` | `#e7e5e4` | Dividers, borders | Subtle structure |
| `--radius` | `0.625rem` | Corners | Friendly but not playful |

## 4. Technical decomposition

| Concern | Implementation | Rationale |
|---------|----------------|-----------|
| Subdomain routing | `middleware.ts` rewrites `abhyasa.trayini.ai/` → `/abhyasa` | One Next.js app serves multiple sub-brands |
| Public access | `AccessCodeGuard` whitelists `/abhyasa*` | Landing page must not be blocked by OpenMAIC access code |
| SEO | Server `metadata` in `page.tsx` | Title, description, OpenGraph |
| Performance | SVG icons; minimal JS; static prerender | Fast load improves conversion [T7] |
| Responsiveness | Tailwind mobile-first classes | Majority of Indian traffic is mobile |
| Accessibility | WCAG 2.1 AA contrast, semantic headings, focus rings | Inclusive and legally safer |

## 5. Copy principles

1. **Lead with the student’s outcome**, not the AI feature.
2. **Use “you” and “your centre/school/child”** to create ownership.
3. **Quantify where possible** (e.g. “in seconds”, “A4 black-and-white”).
4. **Avoid hype words** like “revolutionary”, “AI-powered magic”. Calm, clinical, proven.
5. **Repeat the primary CTA** after every major section.

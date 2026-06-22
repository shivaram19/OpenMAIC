# ADR-002 — End-to-End Demo Engine with Mock Data

**Status:** Accepted  
**Date:** 2026-06-20  
**Author:** Kimi CLI Agent  
**Related:** ADR-001-adaptive-engine-with-omr-loop.md, docs/decisions/DECISION-20260614-001-pdf-rendering.md

---

## Context

ADR-001 defines a long-term adaptive worksheet engine using 1PL IRT, BKT, and a Python OMR microservice. Before investing in psychometric calibration, hardware-grade OMR, or multi-tenant backend persistence, we need a **principal-ready demo** that proves the pedagogical workflow end-to-end.

The school has no live student data yet. We therefore need a **mock-data, browser-local** implementation that can be shown on a laptop in a single meeting.

## Decision

Build a minimal end-to-end engine demo inside the existing OpenMAIC Next.js app with the following properties:

1. **All state is local.** Demo data lives in `localStorage`; no backend persistence or database changes are required for the dashboards.
2. **Rule-based adaptation.** Topic-level accuracy and difficulty drive question selection. IRT/BKT are explicitly deferred.
3. **Three role pages.** Teacher dashboard, operator worksheet view, and principal overview.
4. **Re-use existing PDF pipeline.** Assigned worksheet sets are rendered through the existing `/api/generate-worksheet-pdf` route.
5. **Mock but realistic.** 30 students, 60 vault questions across Maths/Physics/Chemistry, one corrected exam with right/wrong/partial outcomes.

## Consequences

### Positive

- Demo can be shown offline after first load.
- No LLM calls are needed for dashboards; only PDF generation hits the existing API.
- Surfaces UX gaps before building production backend services.
- Gives the institution a concrete artifact to approve a pilot.

### Negative / Trade-offs

- Not production-grade; data is lost if `localStorage` is cleared.
- Adaptation is simpler than the full IRT/BKT vision.
- OMR scanning is represented by mock corrected results, not live image processing.

## Alternatives Considered

| Alternative | Why rejected |
|-------------|--------------|
| Standalone HTML/JS demo | Would not leverage OpenMAIC’s existing worksheet PDF pipeline and UI components. |
| Full backend + PostgreSQL + IRT for demo | Too much code and infrastructure before validating the workflow with the school. |
| Build only teacher dashboard | Principal explicitly needs oversight; incomplete loop would weaken the demo. |

## Implementation Sketch

```
┌─────────────────────────────────────────────────────────────────┐
│  /engine/demo        /engine/teacher      /engine/operator       │
│  seed/clear state    diagnose + pick      generate PDF           │
│                                                                  │
│  /engine/principal                                               │
│  school overview                                                 │
└──────────────────────────────┬───────────────────────────────────┘
                               │ localStorage
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  lib/abhyasa-engine/                                             │
│    mock-data.ts         — seed data                              │
│    diagnostics.ts       — compute weak topics & mastery          │
│    selector.ts          — pick next questions from vault         │
│    format-worksheet.ts  — build payload for PDF API              │
└─────────────────────────────────────────────────────────────────┘
```

## Metrics for Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Principal understands class health | ≤ 30 seconds on `/engine/principal` | Observation |
| Teacher assigns worksheet | ≤ 2 minutes on `/engine/teacher` | Observation |
| Operator generates PDF | ≤ 1 click on `/engine/operator` | Observation |
| Demo runs without backend | All dashboards work with `localStorage` only | Manual test |

## References

- ADR-001 — Adaptive Worksheet Engine with OMR Scan Loop
- Research Report 001 — Dr. Math Adaptive Engine
- `docs/decisions/DECISION-20260614-001-pdf-rendering.md`

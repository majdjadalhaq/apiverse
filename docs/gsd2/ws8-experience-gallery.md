# GSD2 — WS8 Experience Gallery

**Spec:** [`../specs/2026-04-22-ws8-experience-gallery-design.md`](../specs/2026-04-22-ws8-experience-gallery-design.md)
**Plan:** [`../plans/2026-04-22-ws8-experience-gallery.md`](../plans/2026-04-22-ws8-experience-gallery.md)
**Priority:** P1-Critical (the single biggest "wow" lever on the portfolio)
**Est:** 5–7 days

---

## G — Goal

**Goal:** Ship 25 interactive experience pages organised into 5 clusters — 10 **flagships** (each with a bespoke signature technique) and 15 **minis** (shared card layout, per-cluster accent) — each backed by a real public API, each offering a live interaction, each hitting a 90+ mobile Lighthouse perf score despite the creative ambition.

**Success metric (rollup):**
- 25 routes ship under `/experiences/*` + one index page `/experiences`
- Each flagship has its own signature technique (no two pages share a technique):
  1. **Weather** — fragment-shader live sky
  2. **Space** — R3F solar system + live ISS tracker
  3. **Music** — Web Audio reactive waveform + album-art colour extraction
  4. **Finance** — kinetic token cloud + candlestick with motion physics
  5. **Art** — kinetic gallery wall + FLIP zoom transitions
  6. **Anime** — parallax dioramas + D3 force-graph voice-actor network
  7. **News Sentiment** — streaming heatmap + topic timeline
  8. **Sports Live-Pitch** — SVG field + pulse animations on live events
  9. **Games Isometric** — isometric RAWG tile hero + hover-depth parallax
  10. **Jokes / Quotes Typographic** — kinetic typography scene, no images
- Each of 15 minis uses the shared `ExperienceCard` primitive + per-cluster accent + one interactive widget (sparkline / sample / preview)
- Lighthouse mobile ≥ 90 perf, ≥ 95 a11y on every experience page (budget-guarded per PR)
- Each page respects `prefers-reduced-motion` with a static fallback (no exceptions)
- Each page has its own edge-generated OG image
- Each page lists the APIs it uses with badges linking back to catalog
- i18n-ready (all copy in `messages/en.json`, no hard-coded strings)
- Each page survives offline mode with cached last-known state (PWA)

**Failure condition:**
- Any flagship stalls a frame > 50ms on mid-tier mobile (Moto G Power class)
- Any shader / R3F scene renders on a device where `prefers-reduced-motion` is true
- Any text fails 4.5:1 contrast on the page's own bg
- Any API rate-limit is hit during soak test (cache tier must absorb bursts)

**Scope:**
- **IN:** `/experiences` index + 25 sub-routes · `ExperienceCard` + `FlagshipShell` primitives · 10 bespoke flagship components · 15 mini-experience configs · cluster-specific motion kits (GSAP, R3F, Web Audio, D3, SVG) · per-page OG image generators · per-page i18n keys · PWA cache config per route
- **OUT:** Composer / Dashboards (already shipped WS3) · catalog search (WS10) · admin featuring tooling (WS9)
- **DEFERRED:** VR/AR variants, WebXR space scene, hand-tracking music visualizer

---

## S — Strategy

### Approach A — Build all 25 in one branch

Single branch, 25 sub-routes, one giant PR.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 2 |
| Performance | 25% | 2 |
| Maintainability | 20% | 1 |
| Risk | 20% | 1 |
| Reversibility | 15% | 1 |
| **Weighted** | | **1.45** |

### Approach B — Shell first, then 5 cluster PRs

Shell = index + primitives + shared motion kit. Then one PR per cluster (Immersive, Reactive, Gallery, Data, Playful). Each cluster PR contains 2 flagships + 3 minis.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | 4 |
| Maintainability | 20% | 4 |
| Risk | 20% | 4 |
| Reversibility | 15% | 4 |
| **Weighted** | | **4.00** |

### Approach C — Shell first, then mesh-per-flagship + shared-minis PR (recommended)

Shell + index + primitives land first. Then 10 parallel flagship developers (each one PR). Minis batched into one PR (shared card, only content differs). Total: 1 shell PR + 10 flagship PRs + 1 minis PR = 12 PRs.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | **5** (parallelism) |
| Performance | 25% | **5** (per-PR Lighthouse, per-flagship budget) |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **5** |
| **Weighted** | | **5.00** |

---

## D — Decision

**Chosen: C — Shell first, mesh-per-flagship, shared-minis.** Score 5.00.

**Swarm:** **Mesh inside Hierarchical shell.**
- Hierarchical: shell (index + primitives + motion kit + OG generator + PWA config) lands first
- Mesh: 10 parallel flagship developers, each owning one page end-to-end (design + impl + test + screenshot baseline + OG); 1 developer for the 15 minis (shared card, different content)

**Role assignment:**
- **Architect:** spec (per-flagship technique brief)
- **Developer (shell):** 1 engineer, ~1 day
- **Developers (flagships, mesh):** 10 engineers, one each, ~0.5 day each running concurrently
- **Developer (minis):** 1 engineer, 1 day, 15 configs
- **QA:** per-flagship Playwright visual + a11y axe + Lighthouse budget + `prefers-reduced-motion` smoke
- **Reviewer:** PR reviewer per PR + motion/perf specialist pass

---

## Execution checklist

- [ ] Branch `feat/ws8-experiences-shell` — index + primitives + motion kit + OG generator + PWA config → PR
- [ ] Branch out 10 parallel flagship developers (one branch each) → 10 PRs
- [ ] Minis branch `feat/ws8-experiences-minis` → 1 PR with 15 configs
- [ ] Lighthouse mobile ≥ 90 on every one of 26 routes (index + 25)
- [ ] Reduced-motion smoke on each flagship
- [ ] Each flagship has its own OG image rendered at edge
- [ ] API rate-limit soak test passed (all pages left open 30 min without 429s)
- [ ] i18n: zero hard-coded strings grep-clean
- [ ] Pattern card written

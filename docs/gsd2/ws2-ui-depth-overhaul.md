# GSD2 — WS2 UI/UX Depth Overhaul

**Spec:** [`../specs/2026-04-22-ui-depth-overhaul-design.md`](../specs/2026-04-22-ui-depth-overhaul-design.md)
**Plan:** [`../plans/2026-04-22-ui-depth-overhaul.md`](../plans/2026-04-22-ui-depth-overhaul.md)
**Priority:** P1-Critical (single biggest portfolio-perception lever)
**Est:** 2–3 days of focused work

---

## G — Goal

**Goal:** Replace the current flat aesthetic with a deliberate Aurora-Glass + Technical-Mono design language, backed by a real token layer, propagated to every route, without regressing perf or a11y.

**Success metric:**
- Zero hex colours in any component file after migration (grepable)
- Lighthouse on landing (mobile): LCP < 2.5s, CLS < 0.05, Perf ≥ 90, A11y = 100
- Extra JS for primitives + shader < 40 KB gzip vs pre-WS2 baseline
- `prefers-reduced-motion` toggle kills shader + staggered reveals (manual QA screenshots)
- Playwright visual baselines locked for `/`, `/explore`, `/community`

**Failure condition:**
- Landing LCP regresses > 10% vs current baseline
- Any route loses its keyboard focus ring
- Shader renders on a device that blew contrast of any text block to < 4.5:1
- Dark-mode and light-mode fall out of parity (any token missing its light variant)

**Scope:**
- **IN:** token system (`lib/design/tokens.ts` + `@theme`), 4 primitives (`GlassPanel` / `Button` / `SectionHeader` / `Badge`), WebGL Aurora shader, landing re-choreograph, route-by-route re-skin, Playwright visual baselines
- **OUT:** new features (WS3), backend changes, per-route OG images (already in WS1)
- **EXPLICITLY DEFERRED:** theme toggle UI — the system lives in CSS via `prefers-color-scheme` until there's a product reason to expose a manual toggle

---

## S — Strategy

### Approach A — Tokens → primitives → hero → route-by-route re-skin (sequential)

One branch `feat/ui-depth-overhaul`. Commit per task. Routes migrated one at a time so every commit keeps the app buildable.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **4** (sequential but each step unblocks many) |
| Performance impact | 25% | **5** (budget guarded at every commit) |
| Maintainability | 20% | **5** (primitives first = no class-soup regressions downstream) |
| Risk level | 20% | **4** (visual-regression tests catch surprises) |
| Reversibility | 15% | **4** (per-commit revert works, but late-branch revert is big) |
| **Weighted total** | | **4.45** |

### Approach B — shadcn-first (import shadcn/ui, replace primitives with theirs)

Adopt shadcn's `Button`, `Card`, etc. as the primitive layer instead of hand-rolling.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **5** (library does heavy lifting) |
| Performance impact | 25% | 3 (CSS-vars and Radix add weight we don't need) |
| Maintainability | 20% | 3 (fighting the library when it doesn't match Aurora Glass) |
| Risk level | 20% | 3 (their tokens wrestle ours) |
| Reversibility | 15% | 2 (once imported, uprooting is painful) |
| **Weighted total** | | **3.35** |

### Approach C — big-bang rewrite (all routes in one commit)

Bulldoze every route in a single "v2" commit.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 3 |
| Performance impact | 25% | 3 |
| Maintainability | 20% | **1** (irreversible, unreviewable) |
| Risk level | 20% | **1** (a11y regressions hide in the diff) |
| Reversibility | 15% | **1** |
| **Weighted total** | | **1.85**

---

## D — Decision

**Chosen: Approach A.** Tokens-first, primitive-first, route-by-route.

**Why:** highest weighted score. Keeps the app shippable at every commit. Primitives get used *and* tested before routes lean on them. Visual regression baselines lock the look.

**Rejected:**
- **B** — shadcn is great but its defaults clash with the Aurora Glass + Technical Mono direction; we'd spend more time overriding than building.
- **C** — too big to review, a11y and perf regressions would hide, rollback is cross-route.

**Swarm:** **Mesh inside a hierarchical shell.**
- Hierarchical: tokens → primitives → hero → route-skins → visual baselines.
- Mesh: within the route-skins stage, each route (explore / detail / collections / community / profile / login) is independent and can be implemented in parallel by separate coder subagents.

**Agent assignment:**
- **Architect:** already shipped in the spec
- **Coder (shell pass):** one subagent for tokens + primitives + hero + section choreography
- **Coders (route pass, mesh):** six parallel subagents, one per route, each given the primitives and the spec's per-route notes
- **Tester:** Playwright screenshot baselines + Vitest unit tests for primitives
- **Reviewer:** `feature-dev:code-reviewer` + manual Lighthouse runs + a `prefers-reduced-motion` smoke pass

---

## Execution checklist

- [ ] Shell pass commits green: tokens, primitives, hero, motion config
- [ ] Mesh-launch 6 route coder subagents (each gets spec section + primitive contracts)
- [ ] Integration agent reconciles shared import paths / style tokens / shared types
- [ ] Playwright visual baselines generated + committed
- [ ] Lighthouse: landing mobile, LCP / CLS / Perf / A11y
- [ ] Reduced-motion manual QA (toggle OS setting, verify static fallbacks)
- [ ] Open PR, CI green, squash-merge, delete branch, sync main
- [ ] Write pattern card with score

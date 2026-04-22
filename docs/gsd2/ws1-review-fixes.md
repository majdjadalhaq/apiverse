# GSD2 — WS1 Review Fixes & SEO Hygiene

**Spec:** [`../specs/2026-04-22-review-fixes-design.md`](../specs/2026-04-22-review-fixes-design.md)
**Plan:** [`../plans/2026-04-22-review-fixes.md`](../plans/2026-04-22-review-fixes.md)
**Priority:** P1-Critical (blocks WS2/WS3 polish perception)
**Est:** 45 min

---

## G — Goal

**Goal:** Close every legitimate external-review finding and ship the SEO / social surface a shipped portfolio project is expected to have, in one review-cycle.

**Success metric:**
- Lighthouse SEO = 100 on `/`, `/explore`, `/api/[slug]`
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image` all return 200 in production
- Zero `"Create Next App"` string anywhere in repo
- Zero hydration warnings from React DevTools on cold load
- `npm test` = 34/34+ still pass

**Failure condition:**
- Any net-new CI failure
- OG image exceeds 1s render on Edge runtime (warning sign of payload bloat)
- Sitemap fails during build because the `apis` table query blows up without env vars

**Scope:**
- **IN:** metadata, sitemap, robots, OG image, NavLink extraction, `supabase db push` doc update, `suppressHydrationWarning` on `<html>`
- **OUT:** any visual redesign (that's WS2), any new feature (that's WS3), per-route OG images (deferred to WS2)

---

## S — Strategy

### Approach A — One PR, 6 commits

Single branch `chore/review-fixes`, commits grouped by concern: metadata, NavLink, sitemap, robots, OG, README. Sequential.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **5** (linear, no coordination cost) |
| Performance impact | 25% | **4** (small gains only — SEO, not perf) |
| Maintainability | 20% | **5** (one clean history chunk) |
| Risk level (lower = better) | 20% | **5** (all additive, easy revert) |
| Reversibility | 15% | **5** (trivial) |
| **Weighted total** | | **4.70** |

### Approach B — Two PRs (review-fixes + SEO-surface)

Split metadata/NavLink/README into PR 1, sitemap/robots/OG into PR 2. More isolated review.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 3 (two cycles of CI wait) |
| Performance impact | 25% | 4 |
| Maintainability | 20% | 4 |
| Risk level | 20% | 5 |
| Reversibility | 15% | 5 |
| **Weighted total** | | **4.10** |

### Approach C — Stash into WS2 PR

Fold into the UI overhaul. Zero extra review cycles.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 4 |
| Performance impact | 25% | 4 |
| Maintainability | 20% | **2** (massive diff, hard to review) |
| Risk level | 20% | 3 (SEO regressions hide in visual noise) |
| Reversibility | 15% | 2 (coupled revert) |
| **Weighted total** | | **3.05** |

---

## D — Decision

**Chosen: Approach A.** Single dedicated PR, 6 commits, reviewer can sign off in one pass.

**Why:** highest weighted score. Clean history. WS2 inherits a clean base. Fastest to green CI.

**Rejected:**
- **B** — unnecessary ceremony for a < 1h change; two rounds of review is wasted.
- **C** — defeats the point of SEO hygiene being visible and verifiable on its own.

**Swarm:** **Hierarchical** (Architect done — spec exists → Developer → QA → Reviewer).

**Role assignment:**
- **Architect:** already shipped in [`../specs/2026-04-22-review-fixes-design.md`](../specs/2026-04-22-review-fixes-design.md)
- **Developer:** one engineer, six conventional commits
- **QA:** TDD steps already encoded in the plan (NavLink test)
- **Reviewer:** PR reviewer + manual Lighthouse pass

---

## Execution checklist

- [ ] Checkout `chore/review-fixes` from main
- [ ] Assign developer the plan as scope of work
- [ ] After each commit, run `npm run lint && npx tsc --noEmit && npm test`
- [ ] Spec-compliance review (every success-metric met)
- [ ] Code-quality review (DRY, focus rings consistent, no dead imports)
- [ ] Open PR, wait for CI green, squash-merge, delete branch, sync main
- [ ] Write pattern card to `patterns/WS1-review-fixes-pattern.md` with score

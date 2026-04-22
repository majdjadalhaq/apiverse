# GSD2 — Master Orchestration (Phase 2)

**Goal cards:**
- [`ws1-review-fixes.md`](./ws1-review-fixes.md)
- [`ws2-ui-depth-overhaul.md`](./ws2-ui-depth-overhaul.md)
- [`ws3-composer-and-dashboards.md`](./ws3-composer-and-dashboards.md)

**Scope:** the full Phase-2 APIVerse upgrade — close external-review findings, redesign the visual layer to portfolio-grade depth, and ship the two flagship non-AI features (API Composer + Live Dashboards).

---

## G — Goal

**Goal:** In one focused sprint, take APIVerse from a "shipped MVP with review feedback" to a **portfolio-defining** project: clean SEO surface, unmistakable design language, two flagship interactive features — with every intermediate commit reviewable and revertible.

**Success metric (rolled up across WS1+WS2+WS3):**
- Lighthouse mobile on `/`, `/explore`, `/compose`, `/dashboards/[slug]`: Perf ≥ 90, A11y = 100, SEO = 100
- 0 hex colours left in components post-WS2 (grep-clean)
- 3 curated dashboards + 1 shareable composition pre-seeded in production
- 0 service-key leaks, 0 unauthorised RLS writes (red-team pass)
- CI green on every PR; no skipped tests; `npm test` grows not shrinks
- Total Phase-2 surface: **1 single-PR hotfix sweep + 1 multi-commit UI branch + 5 feature branches** = 7 merges to main

**Failure condition:**
- Any merge to `main` breaks CI or lands with a regressed Lighthouse score
- WS2 primitives land in production with incomplete dark-mode parity
- WS3 feature is demoable but fails red-team review (sandbox escape / key leak / RLS bypass)

**Scope:**
- **IN:** WS1 (hygiene + SEO), WS2 (design language + primitives + route re-skin), WS3 (Composer + Dashboards)
- **OUT:** Phase-3 features (auth redesign, pricing, CMS, blog), mobile app, i18n
- **EXPLICITLY DEFERRED:** Phase-3 roadmap until Phase-2 ships + a week of passive usage signals

---

## S — Strategy

### Approach A — Strict sequential (WS1 → WS2 → WS3, one at a time)

Finish WS1, merge, rebase WS2, finish, merge, rebase WS3. Zero overlap. Matches each workstream's own branch order.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 2 (longest wall-clock) |
| Performance impact | 25% | **5** (each workstream audited clean before next starts) |
| Maintainability | 20% | **5** (simple history) |
| Risk level | 20% | **5** (no cross-workstream merge conflicts) |
| Reversibility | 15% | **5** |
| **Weighted total** | | **4.40** |

### Approach B — Pipelined (WS1 ships → WS2 starts; WS2 primitives merge → WS3 starts)

Dependency-aware pipelining. Each workstream starts the moment its dependency lands, but never before.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **5** (overlap reduces wall-clock by ~30%) |
| Performance impact | 25% | **5** (each merge still audited in isolation) |
| Maintainability | 20% | 4 (slightly trickier rebase cadence) |
| Risk level | 20% | 4 (WS3 UI depends on WS2 primitives landing first — small coupling) |
| Reversibility | 15% | **5** |
| **Weighted total** | | **4.55** |

### Approach C — Full parallel (WS1 + WS2 + WS3 all in flight)

Three long-lived branches, merged at the end.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **5** (fastest wall-clock) |
| Performance impact | 25% | 2 (no intermediate audit — regressions hide) |
| Maintainability | 20% | **1** (three branches drifting on shared files — merge hell) |
| Risk level | 20% | **1** |
| Reversibility | 15% | 2 |
| **Weighted total** | | **2.55** |

---

## D — Decision

**Chosen: Approach B.** Pipelined with dependency-aware starts.

**Why:** highest weighted score. WS1 is short (45 min) and touches only metadata/scaffolding — it unblocks a clean SEO baseline for WS2's visual work. WS2's **design tokens + primitives** (Task 1–4 of the WS2 plan) are the minimum dependency for WS3 UI — once those primitives land on `main`, WS3 can start its foundations + runtime branches without waiting for the full route re-skin. This overlap cuts wall-clock meaningfully without introducing the merge-hell of full parallelism.

**Rejected:**
- **A** — too conservative; WS3 foundations don't need WS2 route re-skins, only primitives. Waiting wastes time.
- **C** — three branches rebasing against each other on shared files is exactly the scenario we're avoiding with small PRs.

**Dependency graph:**
```
WS1 (review fixes)
  └─► unblocks clean baseline for WS2

WS2 (UI overhaul)
  ├─ tokens + primitives  ──────► unblocks WS3 UI work
  └─ route re-skin + visual baselines (runs in parallel with WS3 foundations)

WS3 (composer + dashboards)
  └─ 5-branch sequential pipeline
```

---

## Execution timeline

**Day 1 (morning):** WS1 — single PR, 6 commits, ~45 min + CI. Merge.
**Day 1 (afternoon) – Day 2:** WS2 shell pass — tokens + 4 primitives + hero + motion config. Land as a merged branch (not main yet — visual baselines still pending).
**Day 3–4:** WS2 mesh pass — 6 parallel route-skin developers + integration engineer + Playwright visual baselines. Merge to main.
**Day 3 (in parallel with WS2 route pass):** WS3 Branch 1 `feat/composer-foundations` starts (pure types + transformers + topo-sort — no UI dependency yet). Merge when green.
**Day 4:** WS3 Branch 2 `feat/composer-runtime` (DAG executor + sandbox bridge + AES-GCM + RLS). Merge when green.
**Day 5:** WS3 Branch 3 `feat/composer-ui` — now depends on WS2 primitives (which shipped on Day 3–4). Mesh 4 node coders. Merge.
**Day 5–6:** WS3 Branch 4 `feat/dashboards-core` — mesh 3 seed-dashboard coders. Merge.
**Day 6:** WS3 Branch 5 `feat/dashboards-embed` — embed route + sandbox iframe + public RLS read. Merge. Final Lighthouse + red-team sweep.

**Total:** ~6 working days, 7 PRs, reviewable history.

---

## Swarm shape across Phase 2

- **Outer:** **Hierarchical** — WS1 → (WS2 shell → WS2 routes ∥ WS3 foundations) → WS3 UI → WS3 dashboards → WS3 embed
- **Inner (within WS2 routes):** **Mesh** — 6 route-skinner coders
- **Inner (within WS3 composer UI):** **Mesh** — 4 node-type coders
- **Inner (within WS3 dashboards-core):** **Mesh** — 3 seed-dashboard coders

Mesh-inside-Hierarchical is the repeating pattern: a stable shell that guarantees dependency correctness, with opportunistic parallelism inside each phase where subtasks are genuinely independent.

---

## Risk register (rolled up)

| Risk | Workstream | Mitigation |
|---|---|---|
| Design-token churn mid-mesh | WS2 | Lock tokens in shell pass before branching out route developers |
| Primitive API drift between routes | WS2 | Integration agent reconciles imports before visual baselines |
| RLS bypass in Composer | WS3 | Dedicated security red-team pass before merge |
| Sandbox escape via postMessage | WS3 | correlationId + origin check + structured message schema |
| Scheduler drains battery when tab hidden | WS3 | Page Visibility API bail on every tick |
| Lighthouse perf regresses on landing | WS2 | Budget-guard per commit: ≤ 40 KB gzip added by shader+primitives |
| CI flake on visual baselines | WS2 | Pin Playwright browser version, disable animations in baseline runs |

---

## Pattern card (post-ship)

Each workstream drops its own card in [`patterns/`](./patterns/). The master card summarising Phase 2 is written once all three ship and includes:
- Aggregate score across WS1/WS2/WS3
- Which approaches were reused vs. adapted
- What to keep / change for Phase 3

```
score = goal_achieved * 0.40
      + zero_errors * 0.25
      + performance_target_hit * 0.20
      + time_estimate_accuracy * 0.15
```

Target: **master score > 0.8** — reuse the Mesh-inside-Hierarchical pattern as the default for multi-workstream sprints.

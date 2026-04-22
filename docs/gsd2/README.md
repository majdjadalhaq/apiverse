# GSD2 — Goal · Strategy · Decision

Every non-trivial workstream in APIVerse is planned against the GSD2 protocol before a line of code is written. Two-to-five minutes upfront, hours saved downstream.

## How we run it

```
Goal Card (this doc)
  ↓
Strategy — 2–3 approaches scored on 5 criteria
  ↓
Decision — one chosen, rejections documented
  ↓
Execution — Hierarchical (sequential) or Mesh (parallel sub-tasks)
  ↓
Pattern Score — recorded post-ship for reuse
```

## Roles

| Role | Responsibility | Artifact |
|------|----------------|----------|
| **Architect** | Spec the design, data model, contracts | `docs/specs/*-design.md` |
| **Developer** | Implement against spec, TDD, small commits | Feature branch + PR |
| **QA** | Vitest unit + Playwright e2e, edge cases | `tests/` |
| **Reviewer** | Awwwards / a11y / perf / security / UX pass | PR review + `docs/gsd2/patterns/*.md` |

## Swarm shape

- **Hierarchical** — default. Sequential: Architect → Developer → QA → Reviewer.
- **Mesh** — only when sub-tasks are truly independent and ≥ 2. Parallel developers → Integration → Reviewer.

## Decision rule

```
if task has blocking dependencies:      Hierarchical
elif task has independent subtasks ≥ 2: Mesh
else:                                   Hierarchical (default)
```

## Scoring

After each workstream ships, drop a pattern card in [`patterns/`](./patterns/):

```
score = goal_achieved * 0.40
      + zero_errors * 0.25
      + performance_target_hit * 0.20
      + time_estimate_accuracy * 0.15
```

`score > 0.8` → reuse as-is. `0.5–0.8` → adapt. `< 0.5` → avoid.

## Active goal cards

- [`ws1-review-fixes.md`](./ws1-review-fixes.md)
- [`ws2-ui-depth-overhaul.md`](./ws2-ui-depth-overhaul.md)
- [`ws3-composer-and-dashboards.md`](./ws3-composer-and-dashboards.md)
- [`master-phase-2.md`](./master-phase-2.md) — orchestration across all three

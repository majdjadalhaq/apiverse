# GSD2 — Master Orchestration (Phase 2 + Phase 3)

**Phase 2 goal cards:**
- [`ws1-review-fixes.md`](./ws1-review-fixes.md)
- [`ws2-ui-depth-overhaul.md`](./ws2-ui-depth-overhaul.md) *(superseded by WS7 — see note below)*
- [`ws3-composer-and-dashboards.md`](./ws3-composer-and-dashboards.md)

**Phase 3 goal cards:**
- [`ws4-schema-and-rbac.md`](./ws4-schema-and-rbac.md)
- [`ws5-auth-expansion.md`](./ws5-auth-expansion.md)
- [`ws6-api-os-engine.md`](./ws6-api-os-engine.md)
- [`ws7-visual-rebrand.md`](./ws7-visual-rebrand.md)
- [`ws8-experience-gallery.md`](./ws8-experience-gallery.md)
- [`ws9-admin-suite.md`](./ws9-admin-suite.md)
- [`ws10-community-and-platform.md`](./ws10-community-and-platform.md)

---

## Scope

Evolve APIVerse from a shipped MVP into a portfolio-defining public-API platform: clean SEO surface (WS1), composer + live dashboards (WS3), full schema + RBAC (WS4), modern auth with passkeys (WS5), production-grade API gateway (WS6), three-voice visual rebrand (WS7), 25-page Experience Gallery (WS8), full admin suite (WS9), and community + platform layers (WS10).

**WS2 note:** The original Aurora-Glass overhaul in WS2 is **superseded** by WS7's three-voice hybrid rebrand (Brutalist-Editorial shell + Kinetic-Maximalist flagships + Swiss-Neutral admin). WS2's token work seeds WS7; its per-route re-skin is absorbed by WS7's theme pass. WS2 PR will close once WS7 lands.

---

## G — Goal

**Goal:** Ship every workstream in the lock table with every PR small, reviewable, and independently revertible, entirely on free tiers, no AI keys at runtime, RLS-enforced, WCAG AA, Lighthouse mobile ≥ 90 perf / = 100 a11y / = 100 SEO.

**Rollup success metric:**
- ~50 new routes live
- 22 new tables with full RLS
- 6 roles enforced end-to-end
- Zero paid services in the stack
- ≥ 80% test coverage across changed modules
- CI green on every PR; no skipped tests
- Lighthouse budget enforced per PR in CI
- Zero `AGENTS.md`, `CLAUDE.md`, or AI-attribution trace in repo or git history

**Failure condition:**
- Any merge breaks CI
- Any route regresses Lighthouse score
- Free-tier quota exceeded in steady-state usage
- Security red-team finds an RLS bypass, an admin-bypass, or a sandbox escape

---

## S — Strategy

The delivery model across both phases is **Mesh-inside-Hierarchical** — a stable sequential shell guarantees dependency correctness, and mesh parallelism kicks in wherever subtasks are genuinely independent.

### Dependency graph

```
Phase 2
  WS1 review-fixes  ──► unblocks clean baseline
  WS3 composer+dashboards  (independent, can run in parallel with WS4+)

Phase 3
  WS4 schema+rbac  ──► blocks WS5, WS6, WS9
      │
      ├─► WS5 auth-expansion
      │       │
      │       ▼
      │   WS6 api-os-engine
      │       │
      │       ▼
      │   WS7 visual-rebrand ──┬──► WS8 experiences  ┐
      │                        ├──► WS9 admin-suite  ├──► merge to main
      │                        └──► WS10 community   ┘
      │
      └──► WS8 + WS9 + WS10 can run in parallel once WS7 primitives land
```

### Execution order (pipelined, dependency-respecting)

| Day | Track A (shell) | Track B (independent) |
|---|---|---|
| 1 (AM) | WS1 — merge | — |
| 1 (PM) – 3 | WS4 schema + RBAC | WS3 composer foundations |
| 3 – 5 | WS5 auth-expansion (mesh 7) | WS3 composer runtime + UI |
| 5 – 7 | WS6 api-os-engine | WS3 dashboards-core + embed |
| 7 – 9 | WS7 visual-rebrand (mesh 3) | — |
| 10 – 15 | WS8 experiences (mesh 10) ∥ WS9 admin (mesh 10) ∥ WS10 community (mesh 6) | — |

**Total: ~15 working days, ~35 small PRs, fully reviewable.**

---

## D — Decision

**Chosen swarm for the master rollup: Mesh-inside-Hierarchical.** Already proven on WS1–WS3.

**Rejected:**
- Strict-sequential master (too slow) — see `master-phase-2.md` for the original Phase-2 scoring (4.40)
- Full-parallel master (shared-files merge hell)

---

## Risk register

| Risk | Workstream | Mitigation |
|---|---|---|
| Schema churn blocks all downstream | WS4 | Freeze schema contract on Day 1; only additive migrations after |
| Auth rotation breaks long-lived sessions | WS5 | Force-logout on middleware version bump + user comms |
| Rate-limit bypass | WS6 | Red-team checklist: IP spoof, UA swap, cookie swap, role claim forge |
| Theme drift across three voices | WS7 | Visual baselines before merge, theme token audit in CI |
| Flagship perf regresses landing | WS8 | Per-flagship budget ≤ 80KB gzip; dynamic import everything 3D |
| Admin audit-chain tamper | WS9 | Hash-chain + tamper-detection test in CI |
| Resend free-tier quota exhausted | WS10 | Server-side queue + daily counter + degrade to in-app-only |
| i18n missing strings ship | WS10 | Build-time grep fails CI if `en` key referenced without value |

---

## Pattern card roll-up

Each workstream drops its own card in [`patterns/`](./patterns/). Master card written once everything ships. Target master score > 0.8 to reuse **Mesh-inside-Hierarchical** as the default for any multi-workstream sprint.

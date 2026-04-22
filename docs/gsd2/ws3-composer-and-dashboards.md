# GSD2 — WS3 API Composer + Live Dashboards

**Spec:** [`../specs/2026-04-22-composer-and-dashboards-design.md`](../specs/2026-04-22-composer-and-dashboards-design.md)
**Plan:** [`../plans/2026-04-22-composer-and-dashboards.md`](../plans/2026-04-22-composer-and-dashboards.md)
**Priority:** P2-High (the two "flagship demo" features — what a reviewer screenshots)
**Est:** 4–6 days of focused work

---

## G — Goal

**Goal:** Ship the two most impressive non-AI-dependent features in one polished pass — the **API Composer** (a DAG editor that chains public APIs through pure transformers, with a browser-local AES-GCM key vault and a sandboxed runtime) and **Live Dashboards** (fork-able, multi-API boards with a visibility-aware scheduler and a public read-only embed view).

**Success metric:**
- Composer: user can build, save, share, run, and replay a 3-node graph in < 90 s on a cold visit
- Composer: no outbound request from the main origin — **all** API calls happen inside `<iframe sandbox="allow-scripts">`
- Vault: passphrase-derived AES-GCM encryption, keys never hit network, plaintext never leaves memory, passphrase failure surfaces a plain user error (not a crash)
- Dashboards: 3 curated seed boards ship pre-populated (Dev Pulse / Morning Brief / Crypto Watch)
- Dashboards: embed renders in < 2s on a cold iframe, respects `prefers-reduced-motion`, refreshes only when tab is visible (Page Visibility API)
- All server actions Zod-validated; RLS policies verified via Supabase integration test; 0 unauthorised writes in a red-team pass
- Typecheck + `npm test` stay green at every commit

**Failure condition:**
- Any code path leaks a raw API key into Supabase, logs, URL, or network trace
- DAG executor enters an infinite loop on a cyclic graph (must detect + reject with a user-readable error)
- Sandbox iframe can reach parent window's origin or Supabase via `postMessage` spoofing
- Dashboard scheduler keeps firing when the tab is hidden (battery / quota regression)
- Lighthouse perf on `/compose` or `/dashboards/[slug]` drops below 85 mobile

**Scope:**
- **IN (α — API Composer):** `/compose` page, React Flow v12 canvas, 4 transformer node types (`pick` / `map` / `filter` / `merge`), DAG executor with topological sort + `AbortController`, `SandboxBridge` via `postMessage` + `correlationId`, AES-GCM key vault UI + passphrase unlock modal, `compositions` table + RLS, share-link read path
- **IN (γ — Live Dashboards):** `/dashboards`, `/dashboards/[slug]`, `/dashboards/[slug]/embed`, `dashboards` + `widgets` tables + RLS, visibility-aware jittered scheduler with concurrency cap, 3 curated seed dashboards (Dev Pulse / Morning Brief / Crypto Watch), fork + edit flow, embed iframe with `sandbox="allow-scripts"` and public read-only RPC
- **OUT:** LLM/AI integration of any kind (user constraint), paid-API integrations, real-time collab editing, versioning/rollback of compositions, alerting/notifications, dashboard theming, mobile-first edit mode for composer (read-only on mobile is fine)
- **EXPLICITLY DEFERRED:** PDF export, scheduled email delivery, webhook outputs (all would require an always-on worker — out of scope for a portfolio)

---

## S — Strategy

### Approach A — Sequential 5-branch pipeline (Composer first, then Dashboards)

`feat/composer-foundations` → `feat/composer-runtime` → `feat/composer-ui` → `feat/dashboards-core` → `feat/dashboards-embed`. One branch in flight at a time. Each closes with its own PR. Matches the existing plan file.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 4 (sequential, but each branch is small and ships) |
| Performance impact | 25% | **5** (each PR can be Lighthouse-audited in isolation) |
| Maintainability | 20% | **5** (atomic PRs, easy bisect, each branch has a testable outcome) |
| Risk level | 20% | **5** (foundations land before runtime — type errors caught early) |
| Reversibility | 15% | **5** (any branch can be reverted without touching others) |
| **Weighted total** | | **4.80** |

### Approach B — Parallel α + γ (Composer and Dashboards in parallel branches)

Two long-lived feature branches merged at the end via an integration branch.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | **5** (wall-clock wins) |
| Performance impact | 25% | 3 (merge conflicts on shared primitives, late perf issues) |
| Maintainability | 20% | 2 (two drifting branches, shared types diverge) |
| Risk level | 20% | 2 (integration bugs surface at the end, no chance to course-correct) |
| Reversibility | 15% | 2 (reverting touches both) |
| **Weighted total** | | **2.90** |

### Approach C — Single mega-PR

One branch, one review. Ship both features together.

| Criterion | Weight | Score |
|---|---|---|
| Implementation speed | 20% | 3 |
| Performance impact | 25% | 2 (no incremental audit) |
| Maintainability | 20% | **1** (unreviewable diff, security-sensitive code) |
| Risk level | 20% | **1** (sandbox + crypto + RLS in one diff — one bug, no bisect) |
| Reversibility | 15% | **1** |
| **Weighted total** | | **1.65** |

---

## D — Decision

**Chosen: Approach A.** Sequential 5-branch pipeline.

**Why:** highest weighted score. Security-sensitive surfaces (AES-GCM vault, sandbox bridge, RLS) MUST be reviewable in isolation. Each branch produces a working, demoable slice. The branch order mirrors the dependency graph: types → runtime → UI → dashboards → embed. A regression in one branch never blocks the next.

**Rejected:**
- **B** — parallel branches on shared types means merge hell in crypto-adjacent code. Not worth the wall-clock win on a solo project.
- **C** — one-shot PR for a feature that touches auth, RLS, encryption, sandboxing, and scheduling is malpractice. Reviewers (future-me + any human) deserve digestible diffs.

**Swarm:** **Hierarchical with a small Mesh slice inside the UI branch.**
- **Hierarchical (outer shell):** foundations → runtime → UI → dashboards-core → embed. No branch starts until the prior merges.
- **Mesh (inner, only inside `feat/composer-ui` and `feat/dashboards-core`):** independent React Flow node components (pick / map / filter / merge) can be implemented by parallel coder subagents. Same for the 3 seed dashboards (Dev Pulse / Morning Brief / Crypto Watch) — independent curated content, one subagent each.

**Agent assignment:**
- **Architect:** already shipped in [`../specs/2026-04-22-composer-and-dashboards-design.md`](../specs/2026-04-22-composer-and-dashboards-design.md)
- **Coder (foundations / runtime / embed):** one implementer subagent per branch, sequential
- **Coders (UI node types, mesh):** 4 parallel subagents (one per transformer node) inside `feat/composer-ui`
- **Coders (seed dashboards, mesh):** 3 parallel subagents (one per seed) inside `feat/dashboards-core`
- **Tester:** Vitest unit tests for pure transformers + topo-sort + visibility scheduler, Playwright e2e for the compose happy path and a dashboard embed
- **Security reviewer:** `feature-dev:code-reviewer` + manual red-team of RLS policies + a sandbox-escape smoke test (try to postMessage from parent with wrong `correlationId`)
- **Reviewer:** `feature-dev:code-reviewer` per PR + manual Lighthouse per route

---

## Execution checklist

- [ ] Branch 1 `feat/composer-foundations` — types, pure transformers, topo-sort, tests green → PR
- [ ] Branch 2 `feat/composer-runtime` — DAG executor, sandbox bridge, AES-GCM vault, Zod'd server actions, RLS policies + integration test → PR
- [ ] Branch 3 `feat/composer-ui` — mesh-launch 4 node coders, wire into React Flow canvas, passphrase modal, share-link read → PR
- [ ] Branch 4 `feat/dashboards-core` — tables, scheduler, mesh-launch 3 seed-dashboard coders, fork flow → PR
- [ ] Branch 5 `feat/dashboards-embed` — embed route, sandbox iframe, public RLS read → PR
- [ ] Sandbox-escape red-team pass (try cross-origin postMessage, try leak via URL, try spoof correlationId)
- [ ] Lighthouse per route: `/compose`, `/dashboards`, `/dashboards/[slug]`, `/dashboards/[slug]/embed`
- [ ] Playwright e2e: build-save-share-run composition happy path + fork-and-view dashboard
- [ ] Write pattern card with score

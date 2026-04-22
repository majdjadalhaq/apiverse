# GSD2 — WS9 Admin Suite

**Spec:** [`../specs/2026-04-22-ws9-admin-suite-design.md`](../specs/2026-04-22-ws9-admin-suite-design.md)
**Plan:** [`../plans/2026-04-22-ws9-admin-suite.md`](../plans/2026-04-22-ws9-admin-suite.md)
**Priority:** P1-Critical (everything community-facing needs moderation + ops visibility)
**Est:** 4–5 days

---

## G — Goal

**Goal:** Build a full-suite admin surface at `/admin/*` that manages every entity and every subsystem — users, APIs, community submissions, collections, compositions/dashboards, comments+flags, content, analytics, system ops, audit log — in the Swiss-Neutral theme (quiet, data-dense, built for operators, not for show).

**Success metric:**
- 10 admin modules shipped: A Users · B APIs · C Community · D Collections · E Compositions+Dashboards · F Comments+Flags · G Content · H Analytics · I System · J Audit
- Every admin action writes an immutable row to `audit_log` with `actor_id · action · target_type · target_id · diff · ip · ua · timestamp`
- RBAC: moderator has A(read+ban), B(read+flag), C(approve/reject), D(moderate), E(disable), F(queue) · admin has all of A–I · owner has A–J (audit is read-only for admin, read-only for owner too — audit is immutable by design)
- Every table has: search, filter, sort, pagination, bulk action, CSV export, keyboard shortcuts
- Analytics (H) includes: DAU/MAU sparklines, top APIs by requests, cache hit rate trend, provider health rollup, slow-query log, top errors
- System (I) includes: feature flags, rate-limit tuner, cache inspector, cron jobs list, queue depth, env check
- "Impersonate as user" (read-only) renders the full app in an `iframe` with a banner + auto-expiry after 5 min
- Admin routes ≥ 95 Lighthouse perf (Swiss theme is lean by design)
- Zero admin action is reversible without audit trail (immutable + hash-chained for tamper evidence)

**Failure condition:**
- Any admin module can be reached without role-gate middleware
- Any audit-log mutation succeeds (table is append-only; should fail even for owner)
- Impersonation mode allows any write
- Bulk action misses rows because it uses visible-page pagination only (must count selection across pages)
- CSV export leaks PII to non-admin roles

**Scope:**
- **IN:** `/admin` layout + navigation · 10 modules · `AuditLog` table with trigger-based hash-chain · impersonation helper · rate-limit tuner UI · feature-flag CRUD · cache inspector · CSV exports · keyboard shortcut layer · per-module Playwright tests
- **OUT:** billing (none, free product) · CMS for blog posts (WS10) · public analytics (that's the `/status` page in WS6)
- **DEFERRED:** real-time admin dashboard (WebSocket live stats) — batch-refresh every 30s is enough

---

## S — Strategy

### Approach A — One giant admin SPA

Single route `/admin` with client-side routing to tabs. Heavy client bundle.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | 2 (heavy bundle even for operators) |
| Maintainability | 20% | 2 (one file per tab) |
| Risk | 20% | 3 |
| Reversibility | 15% | 3 |
| **Weighted** | | **2.75** |

### Approach B — Per-module App-Router route (recommended)

`/admin/users`, `/admin/apis`, ..., `/admin/audit`. Each module is its own server component tree with streaming. Shared `<AdminShell>` layout. Shared `<DataTable>` primitive.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | **5** |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.80** |

### Approach C — Third-party admin (Retool / Supabase Studio fork)

Lean on an existing admin framework. Fast, but clashes with Swiss theme + custom RBAC.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | **5** |
| Performance | 25% | 2 |
| Maintainability | 20% | 2 |
| Risk | 20% | 3 |
| Reversibility | 15% | 2 |
| **Weighted** | | **2.85** |

---

## D — Decision

**Chosen: B — Per-module App-Router routes.** Score 4.80.

**Swarm:** **Mesh inside Hierarchical shell.**
- Hierarchical: `<AdminShell>` layout + `<DataTable>` primitive + `AuditLog` hash-chain trigger + role middleware land first
- Mesh: 10 parallel developers, one per module, each consuming the shared primitives

**Role assignment:**
- **Architect:** spec
- **Developer (shell):** 1 engineer — layout, table primitive, audit trigger, role middleware, impersonation helper
- **Developers (modules, mesh):** 10 engineers, one each
- **QA:** Playwright e2e per module + RLS integration test (every module × every role)
- **Security reviewer:** red-team admin-bypass attempts + audit-chain tamper test
- **Reviewer:** PR reviewer + Lighthouse on `/admin/apis` (biggest table) + keyboard-shortcut a11y smoke

---

## Execution checklist

- [ ] Branch `feat/ws9-admin-shell` → PR (layout + table + audit + middleware + impersonation)
- [ ] Branch out 10 parallel module developers → 10 PRs
- [ ] Audit-chain tamper test passes (any edit is detected via hash mismatch)
- [ ] RLS × role × module integration (6 × 10 = 60 assertions) all pass
- [ ] Keyboard shortcuts: `g u` goto Users, `g a` goto APIs, etc., documented in `?` modal
- [ ] CSV export includes `X-Audit-Id` header linking to the audit row
- [ ] Impersonation auto-expires after 5 min
- [ ] Lighthouse `/admin/apis` ≥ 95 perf
- [ ] Pattern card written

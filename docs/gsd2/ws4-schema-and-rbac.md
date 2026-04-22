# GSD2 — WS4 Schema + RBAC + RLS Foundations

**Spec:** [`../specs/2026-04-22-ws4-schema-and-rbac-design.md`](../specs/2026-04-22-ws4-schema-and-rbac-design.md)
**Plan:** [`../plans/2026-04-22-ws4-schema-and-rbac.md`](../plans/2026-04-22-ws4-schema-and-rbac.md)
**Priority:** P1-Critical (every downstream workstream depends on it)
**Est:** 1–1.5 days

---

## G — Goal

**Goal:** Land the complete Phase-3 database schema, 6-tier role ladder, and Row-Level Security policies in a single reviewable migration bundle — so every downstream workstream (auth, engine, experiences, admin, community) builds on a locked contract.

**Success metric:**
- 22 new tables created with explicit `ON DELETE` semantics and migration-safe defaults
- 6 roles (`anon / user / contributor / moderator / admin / owner`) enforced via `public.user_role` enum + `profiles.role` column
- Every table has `ENABLE ROW LEVEL SECURITY` + a `SELECT`, `INSERT`, `UPDATE`, `DELETE` policy per role — no table ships without all four
- Zod contracts exported from `lib/db/schema.ts` match SQL column types 1:1 (type-test fails CI otherwise)
- RLS integration test: for each role × each table × each verb (6 × 22 × 4 = 528 cases), generate an assertion + run against a test Supabase project
- `supabase db push` runs cleanly on a fresh project in < 60s
- `pg_cron` extension enabled and one smoke-test job scheduled (used by WS6)
- `pgvector` extension enabled and a 384-dim column added to `apis` + `compositions` + `dashboards` (used by WS10 semantic search)

**Failure condition:**
- Any table ships without RLS
- Any role can read/write a row that belongs to another user
- Any foreign key cascade deletes community-authored content on user delete (should soft-delete instead)
- Migration fails idempotency — re-running breaks state

**Scope:**
- **IN:** 22 tables, role enum + ladder, RLS policies, pgvector + pg_cron extensions, indexes on every FK + every filtered column, soft-delete columns (`deleted_at`), audit log table, TypeScript types generated via `supabase gen types`
- **OUT:** any UI, any server action, any edge function (those are WS5/6/9/10)
- **DEFERRED:** read replicas (free tier doesn't have them), partitioning, materialized views

---

## S — Strategy

### Approach A — One big migration file

Single `.sql` with all 22 tables + all policies + all extensions.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | 4 |
| Maintainability | 20% | 2 (huge file, hard to review) |
| Risk | 20% | 2 (one typo breaks everything) |
| Reversibility | 15% | 2 |
| **Weighted** | | **2.90** |

### Approach B — One migration file per table (22 files)

Each table + its policies in its own migration.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 2 (ceremony overhead) |
| Performance | 25% | 4 |
| Maintainability | 20% | 4 |
| Risk | 20% | 4 |
| Reversibility | 15% | 5 |
| **Weighted** | | **3.60** |

### Approach C — One migration per logical domain (recommended)

6 migrations: `01_extensions_and_roles`, `02_profiles_and_auth`, `03_catalog`, `04_community`, `05_compositions_and_dashboards`, `06_gamification_and_audit`. Each is reviewable in one pass. Grouped by responsibility.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | **5** |
| Performance | 25% | **5** |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **4** |
| **Weighted** | | **4.85** |

---

## D — Decision

**Chosen: C — 6 migrations by domain.** Score 4.85.

**Swarm:** **Hierarchical.** Single developer, 6 migrations, one PR. RLS and schema too tightly coupled to parallelise without breaking review atomicity.

**Role assignment:**
- **Architect:** spec in [`../specs/2026-04-22-ws4-schema-and-rbac-design.md`](../specs/2026-04-22-ws4-schema-and-rbac-design.md)
- **Developer:** one engineer, 6 migrations, TDD-per-migration (RLS assertions written before the migration SQL)
- **QA:** RLS property test harness (528 assertions)
- **Reviewer:** PR reviewer + manual red-team (login as each role, try to break out)

---

## Execution checklist

- [ ] Branch `feat/ws4-schema-and-rbac` from `main`
- [ ] 6 migrations drafted, `supabase db push` clean on fresh project
- [ ] Generated TS types committed to `lib/db/types.gen.ts`
- [ ] RLS test harness: 528 assertions generated, all pass
- [ ] Zod schemas in `lib/db/schema.ts` match SQL 1:1
- [ ] `pg_cron` smoke job scheduled + firing
- [ ] `pgvector` extension + 384-dim columns added
- [ ] CI green, Lighthouse N/A (no UI), `npm test` ≥ 80% coverage on schema module
- [ ] PR opened, reviewer red-team pass, squash-merge, delete branch
- [ ] Pattern card written

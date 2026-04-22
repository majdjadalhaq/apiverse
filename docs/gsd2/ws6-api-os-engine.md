# GSD2 — WS6 API OS Engine

**Spec:** [`../specs/2026-04-22-ws6-api-os-engine-design.md`](../specs/2026-04-22-ws6-api-os-engine-design.md)
**Plan:** [`../plans/2026-04-22-ws6-api-os-engine.md`](../plans/2026-04-22-ws6-api-os-engine.md)
**Priority:** P1-Critical (every experience page, composition, dashboard calls through it)
**Est:** 2–3 days

---

## G — Goal

**Goal:** Build a production-grade API gateway that proxies, caches, rate-limits, sandboxes, and observes every call to a public API — with a role-aware rate bucket, stale-while-revalidate cache, scheduled re-warming via `pg_cron`, and live provider-health telemetry visible in admin. The whole platform's "backend showcase."

**Success metric:**
- Every outbound public-API request goes through `/api/proxy/[slug]` — grep proves no client-direct call remains
- Cache hit rate ≥ 70% on top-50 APIs after first day (measured via `api_calls` log table)
- Rate limiter enforces per-role tiers: anon 30/min, user 120/min, contributor 300/min, mod 600/min, admin uncapped
- Per-call span recorded: timestamp · API slug · role · duration_ms · cache (HIT/MISS/STALE) · status_code · error_class
- `pg_cron` job every 5 min re-warms top-20 APIs (keeps p95 latency < 200ms)
- `/status` page shows live uptime % per API, p95 latency, last-error snippet
- Dead-API circuit breaker: 5 consecutive 5xx → mark `degraded` → exponential backoff before retry
- Web Worker transform sandbox used by Composer never imports from parent bundle
- iframe embed uses `sandbox="allow-scripts"` + strict CSP

**Failure condition:**
- Cache serves stale data > 24h
- Rate limiter can be bypassed by changing user-agent or IP
- Observability log keeps raw API responses (PII leak) — must log metadata only
- Circuit breaker keeps hammering a dead API (no backoff)
- Any API call originates from client JS bypassing proxy

**Scope:**
- **IN:** `/api/proxy/[...slug]` edge route · KV cache layer (Supabase `api_cache` table with TTL + ETag) · role-aware rate-limit middleware (Upstash-free-tier style with Supabase counters) · circuit breaker + retry policy · `pg_cron` revalidation + provider-health table · `/status` public page · `api_calls` observability log · Web Worker transform runtime · iframe embed CSP
- **OUT:** HMAC request signing (covered in plan as optional extension per-API), webhook receivers, outgoing email (Resend is WS10)
- **DEFERRED:** multi-region edge deploys (Vercel free tier is single-region)

---

## S — Strategy

### Approach A — Vercel middleware only, per-route handlers

Single `middleware.ts` + per-API route handlers. No central proxy.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | 3 (middleware runs on every request, not just API calls) |
| Maintainability | 20% | 2 (no single chokepoint — telemetry scattered) |
| Risk | 20% | 3 |
| Reversibility | 15% | 3 |
| **Weighted** | | **2.95** |

### Approach B — Single edge proxy route with pluggable stages (recommended)

`/api/proxy/[...slug]` → stages: auth → rate-limit → cache-lookup → fetch → cache-write → observe → respond. Each stage is a small function, easy to test, easy to reorder.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | **5** (one chokepoint, perfectly instrumented) |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.80** |

### Approach C — Dedicated Node service (Fly.io free or Deno Deploy)

Standalone service. More flexibility. Another thing to deploy.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 2 |
| Performance | 25% | 4 |
| Maintainability | 20% | 3 |
| Risk | 20% | 3 |
| Reversibility | 15% | 2 |
| **Weighted** | | **2.85** |

---

## D — Decision

**Chosen: B.** Score 4.80.

**Rejected:**
- **A** — scattered chokepoint kills observability story
- **C** — second hosting dependency violates "one Vercel project" free-tier principle

**Swarm:** **Hierarchical.** Engine is tightly-coupled, sequential stages. Single developer, multi-commit.

**Role assignment:**
- **Architect:** spec
- **Developer:** one engineer, 8 commits (one per stage + one per observability surface)
- **QA:** Vitest for each stage + k6 load test on proxy (run once manually, no CI because free-tier limits)
- **Security reviewer:** red-team try to bypass rate-limit (change IP, spoof UA, cookie swap, role claim forge)
- **Reviewer:** PR reviewer + manual cold-start timing + CSP audit on iframe embed

---

## Execution checklist

- [ ] Branch `feat/ws6-api-os-engine` from `main` (after WS4 merge)
- [ ] `/api/proxy/[...slug]` shell + auth stage
- [ ] Cache stage (ETag + stale-while-revalidate + Supabase `api_cache` table)
- [ ] Rate-limit stage (role tiers + sliding-window counter)
- [ ] Fetch stage (timeout + retry + circuit breaker)
- [ ] Observe stage (span insert into `api_calls`)
- [ ] `pg_cron` revalidator + provider-health rollup
- [ ] `/status` public page with live uptime chart
- [ ] Web Worker transform sandbox + iframe CSP
- [ ] Red-team pass (6 bypass attempts documented, all rejected)
- [ ] Lighthouse `/status` ≥ 90 perf
- [ ] Pattern card written

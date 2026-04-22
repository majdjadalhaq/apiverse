# GSD2 — WS10 Community, Gamification, Content, Search, Realtime, PWA, Social

**Spec:** [`../specs/2026-04-22-ws10-community-and-platform-design.md`](../specs/2026-04-22-ws10-community-and-platform-design.md)
**Plan:** [`../plans/2026-04-22-ws10-community-and-platform.md`](../plans/2026-04-22-ws10-community-and-platform.md)
**Priority:** P2-High (turns the product from "fancy catalog" into "place people return to")
**Est:** 5–6 days

---

## G — Goal

**Goal:** Ship the six cross-cutting product layers that make APIVerse feel alive: gamification progression, semantic search, realtime presence + notifications, content surfaces (blog / changelog / docs / status / legal), PWA + offline, and social graph (profiles / follow / feed / reactions / RSS).

**Success metric:**
- **Gamification:** XP system, 50-level curve, 30 badges, streak tracker, weekly leaderboard, OG profile card generator, weekly digest via Resend — all functional and gated by the 6-role ladder
- **Search:** `⌘K` global overlay with hybrid ranking (Postgres FTS + pgvector cosine), ≤ 120ms p95 on cold search, facets + recent + saved searches, semantic matching verified ("apis returning forecasts" matches weather-category results)
- **Realtime:** Supabase Realtime channels for presence on compositions/dashboards, live cursors, in-app notification bell with badge count, notification center with mark-read/mark-all, email digests via Resend free tier (100/day cap enforced + queued), Web Push via VAPID + service worker
- **Content:** `/blog` (MDX + shiki syntax highlight), `/changelog` (generated from git tags), `/docs` (MDX tree + sidebar), `/status` (from WS6 provider-health), `/legal` (ToS, privacy, cookie policy, GDPR banner)
- **PWA:** installable manifest + icons + splash, service worker with stale-while-revalidate for catalog, offline "last seen" cache, Web Share API, Android + iOS app-capable tested
- **Social:** `/u/[username]` profile, follow/unfollow with count cache, personalised `/feed`, comments + reactions on APIs/compositions/dashboards/blog posts, RSS feed per user + global
- Lighthouse PWA score = 100, a11y = 100, perf ≥ 90 on all new routes
- i18n: `en` fully translated, `es` / `ar` / `zh` scaffolded with empty keys (structure-ready, machine-translatable later)

**Failure condition:**
- Resend free-tier quota exceeded (need queue + rate-limit)
- Web Push subscription leaks VAPID key (must be server-only)
- Semantic search returns unrelated results because embeddings weren't rebuilt after catalog update
- Offline cache serves stale data > 7 days
- Follow graph can be abused (no rate-limit on follow action → bot farms)

**Scope:**
- **IN:** all six layers with the specifics above
- **OUT:** DM / chat (Phase 4), video calls (never), paid tiers (never), blog comment threading > 2 levels deep
- **DEFERRED:** native push on iOS Safari (experimental, ship when stable), translation auto-complete, user-generated i18n

---

## S — Strategy

### Approach A — One branch per layer (6 branches, 6 PRs)

Linear: gamification → search → realtime → content → PWA → social.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 3 (sequential) |
| Performance | 25% | **5** |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.60** |

### Approach B — One giant cross-cutting branch

One PR for all six layers.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 3 |
| Performance | 25% | 2 |
| Maintainability | 20% | 1 |
| Risk | 20% | 1 |
| Reversibility | 15% | 1 |
| **Weighted** | | **1.60** |

### Approach C — Mesh the six layers into parallel branches, reconcile at the end (recommended)

All six layers kicked off in parallel. Each has its own branch + PR. Integration engineer reconciles shared pieces (nav badge count, profile page sections, i18n keys) before merge.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | **5** |
| Performance | 25% | **5** |
| Maintainability | 20% | 4 (integration cost is real) |
| Risk | 20% | 4 |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.65** |

---

## D — Decision

**Chosen: C — Mesh the six layers, reconcile.** Score 4.65 (narrowly over A's 4.60 — the speed win is real, integration cost manageable because the six layers touch mostly-disjoint files).

**Swarm:** **Mesh with Integration step.**
- 6 parallel developers, one per layer
- 1 integration engineer merges shared touchpoints: nav bell count, profile tabs, footer links, i18n keys, service-worker cache list
- Then PR reviewer + QA

**Role assignment:**
- **Architect:** spec
- **Developers (layers, mesh):** 6 engineers, one each:
  - Gamification (XP, badges, leaderboard, OG card, digest)
  - Search (FTS + pgvector + ⌘K overlay)
  - Realtime (presence + cursors + notifications + Web Push)
  - Content (blog + changelog + docs + status + legal)
  - PWA (manifest + SW + offline + Web Share)
  - Social (profile + follow + feed + comments + reactions + RSS)
- **Integration engineer:** 1 engineer, reconciles shared surfaces
- **QA:** Playwright e2e per layer + Vitest unit + a11y axe + Lighthouse budget
- **Reviewer:** PR reviewer per PR + manual content-surface copy review

---

## Execution checklist

- [ ] Branch out 6 parallel layer developers → 6 PRs opened in parallel
- [ ] Integration PR lands after all six are green
- [ ] Resend quota guard tested (100 emails/day cap enforced in queue)
- [ ] Web Push verified on Chrome + Firefox + Edge (iOS Safari skipped per DEFERRED)
- [ ] Semantic search accuracy spot-check (10 test queries documented with expected results)
- [ ] PWA offline mode verified (airplane mode → catalog still browsable)
- [ ] Lighthouse PWA = 100, a11y = 100
- [ ] RSS feeds validate against W3C feed validator
- [ ] i18n: `en` complete, 3 other locales scaffolded, ICU message format verified
- [ ] Pattern card written

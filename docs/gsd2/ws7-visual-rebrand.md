# GSD2 — WS7 Visual Rebrand

**Spec:** [`../specs/2026-04-22-ws7-visual-rebrand-design.md`](../specs/2026-04-22-ws7-visual-rebrand-design.md)
**Plan:** [`../plans/2026-04-22-ws7-visual-rebrand.md`](../plans/2026-04-22-ws7-visual-rebrand.md)
**Priority:** P1-Critical (every downstream UI workstream depends on primitives)
**Est:** 3 days

---

## G — Goal

**Goal:** Replace Aurora-Glass with a **three-voice hybrid design language** — Brutalist-Editorial shell, Kinetic-Maximalist flagships, Swiss-Neutral admin — backed by one token layer + per-surface theme overrides + a primitive kit that serves all three. Ship Playwright visual baselines locking each voice.

**Success metric:**
- Three design systems shipped behind one set of tokens (`--color-bg-base` resolves differently per surface via `data-theme` attr)
- 8 primitives cover all three voices: `Button`, `Surface`, `HeroType`, `SectionHeader`, `Badge`, `Field`, `EmptyState`, `StatusBar`
- Shell surfaces (`/`, `/explore`, `/api/[slug]`, `/collections`, `/community`, `/profile`, `/compose`, `/dashboards`) wear Brutalist-Editorial
- Flagship experience pages wear Kinetic-Maximalist (per-page accent palette + motion language, but same primitives)
- Admin surfaces (`/admin/*`) wear Swiss-Neutral
- Zero raw hex values in component files — every colour via token
- Lighthouse landing mobile: LCP < 2.5s, CLS < 0.05, Perf ≥ 90, A11y = 100
- Per-surface shader/motion budget: ≤ 40KB gzip added vs pre-WS7 baseline
- `prefers-reduced-motion` kills every GSAP scroll scene + every R3F canvas fallback
- Playwright visual baselines locked for 10 canonical routes × 3 themes × light+dark = 60 screenshots

**Failure condition:**
- Any primitive is hard-coded to one theme (e.g. `bg-black` instead of `bg-surface`)
- Any surface leaks another surface's theme (admin scroll-restore doesn't reset theme flash)
- Dark-mode parity broken for any of three sub-languages
- Any font file served un-subsetted (Brutalist uses Söhne or Inter; Swiss uses IBM Plex; Kinetic uses variable display — all subsetted + preloaded critical)

**Scope:**
- **IN:** token system (`lib/design/tokens.ts` + Tailwind `@theme` + per-surface overrides) · 8 primitives · 3 font pairs subsetted + preloaded · one signature motion language per voice · 1 landing hero shader (Brutalist) · 2 flagship motion frameworks (GSAP scroll scenes + R3F canvas skeleton) · admin quiet-motion motion tokens · Playwright visual baselines
- **OUT:** per-route content migration (that's WS8 for experiences and WS9 for admin)
- **DEFERRED:** theme-toggle UI beyond system + manual — per-user "custom accent" unlock lands in WS10 (gamification)

---

## S — Strategy

### Approach A — Build one voice fully, clone+mutate for the other two

Brutalist first, 100% done. Then clone + swap tokens for Swiss + Kinetic.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | 3 (clones carry dead code) |
| Maintainability | 20% | 2 (three parallel diverging codebases) |
| Risk | 20% | 3 |
| Reversibility | 15% | 3 |
| **Weighted** | | **2.95** |

### Approach B — Token-first, one primitive kit, three themes at the end (recommended)

Tokens + primitives are theme-agnostic. Themes are thin config files. Brutalist, Kinetic, Swiss each = one palette + one typography pair + one motion spec.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | **5** |
| Maintainability | 20% | **5** |
| Risk | 20% | **5** |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.80** |

### Approach C — Three independent design systems in `packages/`

Monorepo shared packages. Heavy setup, best long-term, violates "evolve same repo" decision.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 2 |
| Performance | 25% | 4 |
| Maintainability | 20% | 4 |
| Risk | 20% | 3 |
| Reversibility | 15% | 2 |
| **Weighted** | | **3.05** |

---

## D — Decision

**Chosen: B — Token-first, one kit, three themes.** Score 4.80.

**Swarm:** **Mesh inside Hierarchical shell.**
- Hierarchical: tokens + primitive kit + storybook-like showcase at `/dev/primitives` land first, then themes
- Mesh: 3 parallel developers, one per theme (Brutalist, Kinetic, Swiss), each receives the primitive contract and delivers a theme + its signature motion scene

**Role assignment:**
- **Architect:** spec
- **Developer (shell):** 1 engineer — tokens + 8 primitives + `/dev/primitives` showcase + motion tokens
- **Developers (themes, mesh):** 3 engineers in parallel, one per voice
- **QA:** Playwright visual baselines (60 screenshots) + Vitest primitive unit tests + axe a11y scan across all themes
- **Reviewer:** PR reviewer + manual Lighthouse on each theme's flagship route + reduced-motion smoke

---

## Execution checklist

- [ ] Branch `feat/ws7-visual-shell` — tokens + primitives + `/dev/primitives` showcase → PR
- [ ] Branch out 3 parallel theme developers (Brutalist shell, Kinetic flagship, Swiss admin)
- [ ] Integration engineer reconciles per-theme motion budgets
- [ ] Playwright visual baselines committed (60 screenshots)
- [ ] Lighthouse landing mobile ≥ 90
- [ ] Reduced-motion QA on all three voices
- [ ] Font perf: all critical fonts subsetted + preloaded, no FOIT
- [ ] Pattern card written

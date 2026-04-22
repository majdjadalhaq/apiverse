# Workstream 1 — Review Fixes & Polish (Design)

**Status:** Locked · 2026-04-22

**Goal:** Close every legitimate finding from the external code review, plus ship the SEO / OG / sitemap hygiene a shipped portfolio project is expected to have.

**Non-goals:** Visual redesign (WS2), new features (WS3).

---

## Findings addressed

| ID | Finding | Verdict | Action |
|----|---------|---------|--------|
| CR-001 | Hydration mismatch on `<body>` | Real — browser extensions (Dark Reader, Grammarly) inject attrs pre-hydration | Add `suppressHydrationWarning` to `<html>` |
| CR-002 | Root metadata still `"Create Next App"` | Real | Full metadata rewrite with OG + Twitter + `metadataBase` |
| CR-003 | Nav link Tailwind string repetition | Fair | Extract `<NavLink>` component, render via array |
| CR-004 | `SmoothScroll` mounted as sibling | Rejected — Lenis patches `window` scroll globally, sibling mount is correct | Leave as-is, add code comment explaining why |
| Docs | README says "paste SQL manually" | Fair | Swap to `supabase db push` with link to local CLI install |
| SEO | No sitemap, no robots | Gap | Add `app/sitemap.ts`, `app/robots.ts` |
| SEO | No OG image | Gap | Add dynamic OG image via `app/opengraph-image.tsx` (Edge runtime, `ImageResponse`) |

## Architecture

Single PR, ~7 discrete commits, each independently revertible.

```
components/shell/
  NavLink.tsx          [NEW] — typed link with consistent focus/hover styles
app/
  layout.tsx           [MOD] — real metadata, suppressHydrationWarning, metadataBase
  sitemap.ts           [NEW] — static + dynamic routes
  robots.ts            [NEW] — allow all, reference sitemap
  opengraph-image.tsx  [NEW] — Edge-runtime dynamic OG image
  (main)/layout.tsx    [MOD] — render NavLinks from array, keep SmoothScroll sibling
public/
  favicon.ico          [NEW if missing]
  icon.svg             [NEW] — monochrome SVG used by Next's icon convention
README.md              [MOD] — supabase db push flow
```

### `NavLink` contract

```tsx
interface NavLinkProps {
  href: string
  children: React.ReactNode
  exact?: boolean   // match only when pathname === href, default false
}
```

- Active-route highlighting via `usePathname()`
- Full focus-visible ring consistent with rest of shell
- Works for both top nav and future footer nav

### Metadata shape

`metadataBase = new URL('https://apiverse.dev')` (or Vercel's `VERCEL_URL` fallback).
Default title template: `%s · APIVerse`, default site title `APIVerse — A universe of public APIs, with live demos you can actually run.`

Covers: `openGraph`, `twitter`, `icons`, `authors`, `creator`, `keywords`.

### OG image

Edge runtime, Geist font loaded via `@vercel/og`'s font fetch, composition:
- Gradient background (indigo-500 → fuchsia-500 → rose-500)
- `APIVerse` in 96px bold
- Tagline in 36px regular
- Subtle grid overlay for visual depth

Per-route OG images come later — WS2 will revisit for API / collection pages.

## Risk

Low. Each change is isolated and rollback-safe. `suppressHydrationWarning` on `<html>` is the officially documented Next.js escape hatch for exactly this class of problem.

## Test plan

- Unit: none needed (no new logic).
- Manual: verify `/sitemap.xml`, `/robots.txt`, `/opengraph-image` all 200.
- Social preview: paste production URL into [opengraph.xyz](https://www.opengraph.xyz) and confirm card renders.
- Lighthouse: SEO score → 100.

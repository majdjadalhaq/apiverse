# WS1 — Review Fixes Implementation Plan

> Execute task-by-task. Completed steps use `- [x]`.

**Goal:** Ship the review-finding fixes + SEO/OG hygiene in a single tight PR.

**Spec:** [`docs/specs/2026-04-22-review-fixes-design.md`](../specs/2026-04-22-review-fixes-design.md)

**Architecture:** No new architectural surface — tiny additive primitives + metadata polish.

**Branch:** `chore/review-fixes`

---

## Task 1 — Real root metadata + hydration guard

**Files:** `app/layout.tsx`

- [ ] **Step 1.1: Update the root layout.**

```tsx
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'APIVerse — live, sandboxed demos for public APIs',
    template: '%s · APIVerse',
  },
  description:
    'Browse hundreds of public APIs, run live sandboxed demos in your browser, save favourites, build collections.',
  keywords: ['public APIs', 'API catalog', 'API playground', 'developer tools'],
  authors: [{ name: 'Majd Jadalhaq' }],
  creator: 'Majd Jadalhaq',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'APIVerse',
    title: 'APIVerse — live, sandboxed demos for public APIs',
    description: 'A universe of public APIs, with demos you can actually run.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APIVerse',
    description: 'A universe of public APIs, with demos you can actually run.',
  },
  icons: { icon: '/icon.svg', shortcut: '/favicon.ico', apple: '/apple-icon.png' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 1.2: Build, verify metadata.**

Run: `NEXT_PUBLIC_SUPABASE_URL=x NEXT_PUBLIC_SUPABASE_ANON_KEY=x SUPABASE_SERVICE_ROLE_KEY=x npm run build`
Expected: PASS, 11+ routes.

- [ ] **Step 1.3: Commit.**

```bash
git add app/layout.tsx
git commit -m "fix(seo): replace scaffold metadata, add metadataBase and OG/Twitter cards"
```

---

## Task 2 — `<NavLink>` primitive

**Files:** Create `components/shell/NavLink.tsx`, modify `app/(main)/layout.tsx`.

- [ ] **Step 2.1: Write failing test.**

`tests/unit/NavLink.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/explore',
}))

import { NavLink } from '@/components/shell/NavLink'

describe('NavLink', () => {
  it('marks the active route with aria-current', () => {
    render(<NavLink href="/explore">Explore</NavLink>)
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('does not mark inactive routes', () => {
    render(<NavLink href="/community">Community</NavLink>)
    expect(screen.getByRole('link', { name: /community/i })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
```

- [ ] **Step 2.2: Run it — fail.** `npm test -- NavLink`

- [ ] **Step 2.3: Implement.**

```tsx
// components/shell/NavLink.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  exact?: boolean
  className?: string
}

export function NavLink({ href, children, exact = false, className }: NavLinkProps) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded outline-none transition',
        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
        'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
        'aria-[current=page]:text-neutral-900 dark:aria-[current=page]:text-neutral-100',
        className,
      )}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Step 2.4: Run it — pass.**

- [ ] **Step 2.5: Rewrite `app/(main)/layout.tsx` nav.**

Replace the 4 repeated `<Link>` blocks with a mapped array:

```tsx
import { NavLink } from '@/components/shell/NavLink'

const NAV_ITEMS = [
  { href: '/explore', label: 'Explore' },
  { href: '/community', label: 'Community' },
  { href: '/collections', label: 'Collections' },
  { href: '/profile', label: 'Profile' },
] as const

// inside <nav>
<div className="flex items-center gap-5 text-sm">
  {NAV_ITEMS.map((item) => (
    <NavLink key={item.href} href={item.href}>
      {item.label}
    </NavLink>
  ))}
  <NavLink href="/login" exact>Sign in</NavLink>
</div>
```

Add a one-line comment above `<SmoothScroll />` explaining why it's a sibling:

```tsx
{/* Lenis patches window scroll globally — mounting as a sibling is correct. */}
<SmoothScroll />
```

- [ ] **Step 2.6: Gates.** `npm run lint && npx tsc --noEmit && npm test`

- [ ] **Step 2.7: Commit.**

```bash
git add components/shell/NavLink.tsx app/\(main\)/layout.tsx tests/unit/NavLink.test.tsx
git commit -m "refactor(shell): extract NavLink primitive with active-route state"
```

---

## Task 3 — Sitemap + robots

- [ ] **Step 3.1: Create `app/sitemap.ts`.**

```ts
import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/community`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('apis')
      .select('slug, created_at')
      .limit(1000)
    const apiRoutes: MetadataRoute.Sitemap = (data ?? []).map((r) => ({
      url: `${BASE}/api/${r.slug}`,
      lastModified: new Date(r.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    return [...staticRoutes, ...apiRoutes]
  } catch {
    return staticRoutes
  }
}
```

- [ ] **Step 3.2: Create `app/robots.ts`.**

```ts
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/seed'] }],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
```

- [ ] **Step 3.3: Build + curl.**

`npm run build && npm start` (in another shell: `curl localhost:3000/sitemap.xml | head`)

Expected: XML with at least the 3 static routes.

- [ ] **Step 3.4: Commit.**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): add sitemap and robots with dynamic api route listing"
```

---

## Task 4 — Dynamic OG image

- [ ] **Step 4.1: Create `app/opengraph-image.tsx`.**

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'APIVerse — live, sandboxed demos for public APIs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background:
            'linear-gradient(135deg, #0a0a0f 0%, #1a103d 40%, #3b1053 100%)',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#a0aec0',
            marginBottom: 16,
          }}
        >
          [01] A universe of public APIs
        </div>
        <div
          style={{
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            backgroundImage: 'linear-gradient(90deg, #818cf8, #d946ef, #f43f5e)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          APIVerse
        </div>
        <div style={{ fontSize: 36, color: '#cbd5e1', marginTop: 24, maxWidth: 900 }}>
          Live, sandboxed demos you can actually run. No keys. No curl. No swearing at CORS.
        </div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 4.2: Verify.** `npm run build` succeeds. Open `/opengraph-image` in browser → PNG renders.

- [ ] **Step 4.3: Commit.**

```bash
git add app/opengraph-image.tsx
git commit -m "feat(seo): add edge-runtime dynamic OG image"
```

---

## Task 5 — README `supabase db push`

- [ ] **Step 5.1: Edit the migrations section.**

Replace the manual-paste step with:

```md
# 3. Run migrations (first time only)
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

- [ ] **Step 5.2: Commit.**

```bash
git add README.md
git commit -m "docs(readme): use supabase db push instead of manual SQL paste"
```

---

## Task 6 — PR + merge

- [ ] **Step 6.1: Push + open PR.**

```bash
git push -u origin chore/review-fixes
gh pr create --title "chore: review fixes + SEO hygiene (metadata, sitemap, OG image, NavLink)" \
  --body-file docs/plans/_pr-bodies/review-fixes.md
```

- [ ] **Step 6.2: Wait for CI green. Squash-merge + delete branch. Sync main.**

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull --ff-only
```

---

## Self-review checklist

- [ ] No `"Create Next App"` string anywhere in repo
- [ ] `suppressHydrationWarning` only on `<html>`, not on data-bearing elements
- [ ] `<NavLink>` passes both test cases
- [ ] `app/(main)/layout.tsx` nav is under 25 lines
- [ ] `/sitemap.xml` and `/robots.txt` resolve in prod build
- [ ] `/opengraph-image` renders a valid PNG
- [ ] All 34+ existing tests still pass
- [ ] Lighthouse SEO on landing = 100

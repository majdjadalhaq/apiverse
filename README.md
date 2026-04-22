# APIVerse

> A universe of public APIs, with live demos you can actually run.

APIVerse is where you go when you want to *see* an API work before you touch it. Browse hundreds of public APIs, hit **Run** on a live sandboxed demo, save your favourites, build collections, and — soon — share your own demos with the community.

No keys. No `curl`. No swearing at CORS.

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** — strict mode, no `any` hiding in corners
- **Supabase** — Postgres + Auth (GitHub / Google OAuth) + Realtime
- **Tailwind CSS v4** — styling
- **Framer Motion + GSAP** — motion design
- **React Three Fiber** — the hero looks like it belongs in a museum
- **Lenis** — smooth scroll that doesn't feel like a gimmick
- **Vitest + Playwright** — unit and E2E tests

---

## Local development

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in Supabase credentials from your project dashboard

# 3. Run migrations (once)
# Paste contents of supabase/migrations/*.sql into Supabase SQL Editor

# 4. Go
npm run dev         # http://localhost:3000
npm run lint
npm test
npm run test:e2e    # Playwright
```

---

## Project layout

```
app/                Next.js App Router pages
components/         UI components (kept small and focused)
lib/                Supabase clients, utilities, demo sandbox helpers
public/sandbox/     Isolated iframe runner for live demos
supabase/           Database migrations and RLS policies
tests/              Vitest unit tests
docs/               Plans and specs (see superpowers/plans/)
```

---

## How the demo sandbox works

Every live demo runs inside an isolated `<iframe sandbox>` served from `/sandbox/runner.html`. The main app talks to it via `postMessage` — it can never reach the parent window, cookies, or localStorage. Community-submitted demos can be added safely because of this boundary.

```
Main app  ──RENDER_DEMO──▶  Sandbox iframe  ──fetch──▶  Public API
         ◀──DEMO_RESULT──
```

---

## Why this project exists

This started as a portfolio piece and became something I actually wanted to exist. The [public-apis](https://github.com/public-apis/public-apis) list is a goldmine but it's just… a list. You still have to click, read docs, write a curl, copy-paste. APIVerse turns "I wonder what this returns" into "oh, *that's* what it returns."

---

## Roadmap

- ✅ Browse + search + filter APIs by category
- ✅ Live sandboxed demos with parameter inputs
- ✅ Bookmarks + personal collections
- ✅ Community-submitted demos with upvotes and comments
- ✅ User profile page
- ⏳ API key manager (encrypted per-user)
- ⏳ Realtime comment/upvote updates

---

## Deploy

Production runs on Vercel, connected directly to `main` via the GitHub integration. Every PR gets an isolated preview URL.

**Required env vars** (set in the Vercel project dashboard under Settings → Environment Variables):

| Key | Scope | Source |
|-----|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Preview + Production | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview + Production | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only (server-only) | Supabase → Settings → API |

See [`.env.example`](./.env.example) for the local-dev equivalents.

**CI** runs on every push and PR via [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm test`
4. `npm run build`

---

## Development plan

The full implementation plan lives at [`docs/superpowers/plans/2026-04-21-apiverse.md`](./docs/superpowers/plans/2026-04-21-apiverse.md). It's built task-by-task with real PRs, TDD where it makes sense, and commits that a senior dev wouldn't be embarrassed by.

---

Built with care by [@majdjadalhaq](https://github.com/majdjadalhaq).

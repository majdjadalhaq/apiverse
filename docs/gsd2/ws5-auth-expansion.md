# GSD2 — WS5 Auth Expansion

**Spec:** [`../specs/2026-04-22-ws5-auth-expansion-design.md`](../specs/2026-04-22-ws5-auth-expansion-design.md)
**Plan:** [`../plans/2026-04-22-ws5-auth-expansion.md`](../plans/2026-04-22-ws5-auth-expansion.md)
**Priority:** P1-Critical (blocks any feature needing a role, which is all of Phase 3)
**Est:** 2 days

---

## G — Goal

**Goal:** Ship the full modern-auth surface on Supabase Auth — email+password with username, keep magic-link, add Google/GitHub/Discord OAuth, add TOTP 2FA, add WebAuthn passkeys, plus session management UI (device list, revoke, recovery codes) — with full a11y, `prefers-reduced-motion`, and zero custom crypto.

**Success metric:**
- 5 sign-in paths live: email+password, magic-link, Google OAuth, GitHub OAuth, Discord OAuth
- 2 step-up paths: TOTP 2FA (optional), WebAuthn passkeys (optional)
- `/settings/security` exposes: active sessions with device fingerprint, sign-out-everywhere, 10 one-time recovery codes, 2FA enrolment, passkey registration
- Username validation: 3–24 chars, `^[a-zA-Z0-9_]+$`, reserved-words check, DB unique index
- Password rules: ≥ 10 chars, checked against zxcvbn ≥ 3, "breach" check via `pwnedpasswords` range API
- Recovery: forgot-password, email change with verify-both-addresses, account deletion with 30-day soft delete
- Every form: visible label + helper text + inline validation + aria-live error
- All routes ≥ 95 Lighthouse a11y + perf
- Playwright e2e for each sign-in path

**Failure condition:**
- Any credential hashed with anything other than Supabase's default
- Recovery codes stored in plaintext anywhere (must be sha256-hashed at rest)
- Passkey registration succeeds but sign-in fails (cross-browser smoke broken)
- Session revoke doesn't actually revoke (must verify JWT rotation)
- Username race: two users register same username in same millisecond (must be DB-enforced unique)

**Scope:**
- **IN:** sign-up / sign-in / sign-out / forgot-password / reset-password / verify-email / change-email / delete-account flows · `/settings/security` with device list + 2FA + passkeys + recovery codes · OAuth callback handler · middleware enforcing role claim · username reservation + history · breach-check helper
- **OUT:** SSO SAML (overkill), phone auth (paid on Supabase free tier)
- **DEFERRED:** anonymous-to-authenticated account merge flow (Phase 4)

---

## S — Strategy

### Approach A — Wrap Supabase Auth as-is, minimal custom UI

Use Supabase Auth UI pre-built components. Least custom code.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | **5** |
| Performance | 25% | 3 (their components drag bundle weight) |
| Maintainability | 20% | 3 (can't style to match brutalist shell) |
| Risk | 20% | 4 |
| Reversibility | 15% | 3 |
| **Weighted** | | **3.65** |

### Approach B — Hand-rolled forms on top of `@supabase/ssr` (recommended)

Own every form. Server actions. Zod validation. Radix primitives for unstyled accessibility. Framer for motion.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 4 |
| Performance | 25% | **5** |
| Maintainability | 20% | **5** |
| Risk | 20% | 4 (custom = more surface, but everything is tested) |
| Reversibility | 15% | **5** |
| **Weighted** | | **4.55** |

### Approach C — Custom auth from scratch (no Supabase Auth)

Own JWT issuance, session management, password hashing. Portfolio flex.

| Criterion | Weight | Score |
|---|---|---|
| Impl speed | 20% | 1 |
| Performance | 25% | 4 |
| Maintainability | 20% | 2 |
| Risk | 20% | **1** (custom crypto = malpractice) |
| Reversibility | 15% | 1 |
| **Weighted** | | **1.85** |

---

## D — Decision

**Chosen: B.** Score 4.55.

**Rejected:**
- **A** — can't theme to Brutalist shell without fighting the library
- **C** — rolling auth from scratch on a portfolio project is a red flag, not a green one

**Swarm:** **Mesh inside Hierarchical shell.**
- Hierarchical: middleware + session helpers + `/settings/security` layout → lands first
- Mesh: 5 parallel developers, one per sign-in flow (email+password, magic-link, Google, GitHub, Discord), plus 2 for step-up (TOTP, passkeys)

**Role assignment:**
- **Architect:** spec in [`../specs/2026-04-22-ws5-auth-expansion-design.md`](../specs/2026-04-22-ws5-auth-expansion-design.md)
- **Developer (shell):** 1 engineer, middleware + session helpers + settings layout
- **Developers (auth flows, mesh):** 7 engineers (5 sign-in + 2 step-up) in parallel
- **QA:** Playwright e2e per flow + Vitest unit for validators + a11y axe scan
- **Reviewer:** PR reviewer + manual security pass (token rotation, CSRF, timing attacks on username reservation)

---

## Execution checklist

- [ ] Branch `feat/ws5-auth-shell` (middleware + session helpers + layout) → PR
- [ ] Branch out 7 parallel auth-flow developers → one PR per flow
- [ ] Session rotation verified (revoke → new JWT → old denied)
- [ ] Breach-check integration tested (offline fixture + live range API)
- [ ] All 7 flows have Playwright happy + sad path
- [ ] Axe a11y scan 0 violations
- [ ] Lighthouse a11y + perf ≥ 95 on `/sign-in`, `/sign-up`, `/settings/security`
- [ ] Manual security pass (timing, CSRF, token rotation, passkey fallback)
- [ ] Pattern card written

# Workstream 2 — UI/UX Depth Overhaul (Design)

**Status:** Locked · 2026-04-22

**Goal:** Replace the current flat "AI-generated" landing + shell with a deliberate, layered, technical-luxury aesthetic — Aurora glass depth (primary) with technical/mono accents (secondary). Ship a cohesive design system that propagates to every route.

**Non-goals:** New features (WS3), backend changes.

---

## Design direction

**Primary language — Aurora Glass.** Inspired by Arc browser, Raycast, Vercel Ship keynotes. Animated mesh-gradient backgrounds, frosted glass panels with real blur + inner highlight + 1px border, deep dark neutrals, saturated spot highlights (indigo / fuchsia / cyan), generous whitespace.

**Secondary language — Technical Mono.** Inspired by Linear's docs and tldraw's engineering site. Monospace labels, numeric counters with tabular figures, thin rules, bracketed section numbers (`[01]`, `[02]`), uppercase micro-caps for meta, no emoji anywhere.

**Motion intensity — Bold but motion-safe.** Hero = shader aurora + parallax. Sections = stagger reveal with spring. Cards = press/scale feedback. Everything gated behind `prefers-reduced-motion: reduce` with a graceful static fallback.

## Design tokens (lock these first)

### Color system

```ts
// lib/design/tokens.ts
export const tokens = {
  // Base neutrals — true blacks avoided, all warmed slightly
  bg: {
    base: 'oklch(0.14 0.006 265)',          // near-black with cool cast
    raised: 'oklch(0.18 0.008 265)',        // panels
    inset: 'oklch(0.11 0.006 265)',         // wells
    glass: 'oklch(0.22 0.01 265 / 0.6)',    // frosted panels
  },
  fg: {
    primary: 'oklch(0.98 0.005 265)',       // headings
    secondary: 'oklch(0.78 0.008 265)',     // body
    muted: 'oklch(0.56 0.01 265)',          // meta
    disabled: 'oklch(0.38 0.008 265)',
  },
  // Spot hues — use sparingly, never more than two per viewport
  accent: {
    indigo: 'oklch(0.68 0.22 270)',
    fuchsia: 'oklch(0.70 0.27 330)',
    cyan: 'oklch(0.78 0.16 210)',
    amber: 'oklch(0.82 0.17 75)',
    rose: 'oklch(0.68 0.22 20)',
  },
  // Semantic
  success: 'oklch(0.72 0.18 155)',
  warning: 'oklch(0.80 0.17 75)',
  danger: 'oklch(0.65 0.24 25)',
  // Rings — always 2px, always accent-tinted
  ring: {
    focus: 'oklch(0.72 0.22 270 / 0.7)',
    danger: 'oklch(0.65 0.24 25 / 0.6)',
  },
  // Elevation — consistent scale, not random
  shadow: {
    1: '0 1px 2px oklch(0 0 0 / 0.3)',
    2: '0 4px 12px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.04)',
    3: '0 16px 48px oklch(0 0 0 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.06)',
    glow: '0 0 64px oklch(0.68 0.22 270 / 0.25)',
  },
} as const
```

Why OKLCH: perceptual uniformity, better gradients, future-proof (Tailwind v4 supports natively via `@theme`).

Why true black is banned: it flattens the aurora. Everything sits on a dark-cool near-black so the saturated spots pop.

### Light mode

Light mode flips base/raised/inset and fg values; accents stay identical. Dark is primary — light is secondary. Both designed together, not inverted mechanically.

### Type scale

```
display     56 / 1.05 / -0.03em  — Geist Sans 600
h1          40 / 1.1  / -0.02em
h2          30 / 1.2  / -0.02em
h3          22 / 1.3  / -0.01em
body-lg     18 / 1.6
body        16 / 1.6                — default
body-sm     14 / 1.5
mono-label  12 / 1.4  / 0.06em upper — Geist Mono 500
mono-meta   11 / 1.4  / 0.08em upper
```

Tabular figures (`font-variant-numeric: tabular-nums`) on all counters, prices, stats.

### Spacing scale

Strict 4px grid. Allowed steps: `0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 72 / 96 / 128`. No arbitrary values. Tailwind v4 `@theme` locks this.

### Radii

`sm 6 / md 10 / lg 14 / xl 22 / pill 999`. No random `rounded-[13px]`.

### Borders

Single width `1px`. Color is always `oklch(1 0 0 / 0.06)` on dark glass panels for the inner-light effect. Outer borders `oklch(1 0 0 / 0.1)`.

## Component system

Promote these primitives to `components/ui/` (shadcn-style):

| Component | Variants | Notes |
|-----------|----------|-------|
| `GlassPanel` | `raised / inset / flat` | Backdrop-blur + inner highlight + border, motion-safe hover lift |
| `Button` | `primary / secondary / ghost / destructive` + `sm/md/lg` + `icon` | 44px touch target on `md`, ring on focus-visible |
| `Badge` | `default / accent / success / warning / danger / mono` | Mono variant uses `mono-label` style |
| `Ring` | `focus / danger / success` | 2px offset ring used by button/input/link |
| `NumberCounter` | animated via framer-motion's `animate` | Tabular, for stats |
| `SectionHeader` | with `[NN]` bracket label | Forces mono-label meta above every section |

Kill ad-hoc className soup — any repeated 3+ util combo becomes a primitive.

## Hero

**Stack (back to front):**
1. **Aurora shader** — custom WebGL fragment shader, fullscreen `<canvas>`, animated noise-driven gradient blobs in indigo/fuchsia/cyan. ~300 LoC GLSL. Fixed position, `pointer-events: none`, `mix-blend-mode: screen` over base bg. Pauses when tab hidden (Page Visibility API). Bails entirely on `prefers-reduced-motion`.
2. **Constellation field** — `@react-three/fiber` scene with ~200 instanced points drifting slowly. `frameloop="demand"` during scroll for battery. Optional — can ship without it in first cut.
3. **Grid underlay** — CSS `linear-gradient` SVG grid, 64px cells, fading radially from center.
4. **Content card** — glass panel, `h1` display, mono tagline, primary CTA, secondary ghost CTA, mono stats strip.
5. **Scroll cue** — animated chevron with reduced-motion static fallback.

### Shader approach

`<Aurora />` client component. Uses a single full-screen triangle (not quad — avoids overdraw), `requestAnimationFrame` loop clamped to 60fps, `preserveDrawingBuffer: false`. GPU shader logic:

```glsl
// Simplified sketch
float noise = fbm(uv * 2.0 + time * 0.05);
vec3 a = mix(indigo, fuchsia, noise);
vec3 b = mix(a, cyan, fbm(uv + time * 0.07));
gl_FragColor = vec4(b, smoothstep(0.3, 1.0, noise));
```

Fallback when WebGL unavailable or `prefers-reduced-motion`: static multi-stop radial gradient that looks *intentional*, not broken.

## Section choreography

Every scroll section follows the same rhythm:
1. `[NN]` mono bracket + micro-caps label enters first
2. Display heading fades + translates up (30px → 0, 500ms, spring)
3. Body text follows (40ms stagger)
4. Cards / media reveal with 50ms stagger between siblings
5. `viewport={{ once: true, margin: '-20%' }}` — trigger 20% early so it feels alive

Exit animations 60–70% of enter duration.

## Routes to update

| Route | Treatment |
|-------|-----------|
| `/` (landing) | Full aurora hero + choreographed sections + upgraded footer |
| `/explore` | Section header primitive, glass cards, inset search, mono filter chips |
| `/api/[slug]` | Split layout: mono meta rail + glass hero + demo panel with tab chrome |
| `/collections`, `/collections/[id]` | Glass cards, empty states refined |
| `/community` | Glass demo cards, mono vote counter |
| `/profile` | Consistent glass cards, avatar treatment with ring-glow |
| `/login` | Full-screen aurora backdrop + compact glass card |

## Performance budget

| Metric | Budget |
|--------|--------|
| LCP (mobile) | < 2.5s |
| CLS | < 0.05 |
| Hero shader GPU cost | < 4ms per frame on mid-tier laptop integrated GPU |
| Extra JS for tokens + primitives | < 8 KB gzip |
| Total landing JS | < 180 KB gzip |

Shader is client-only and lazy-hydrated behind `next/dynamic` with `ssr: false`. Landing server-renders without it, the canvas fades in post-mount.

## Accessibility

- Full keyboard path across nav → hero → sections → footer with visible 2px rings
- Shader is `aria-hidden`, decorative only
- `prefers-reduced-motion` disables: shader animation, section stagger, hover lifts, scale on press. Layout static, content identical.
- `prefers-contrast: more` swaps glass panels to opaque raised panels.
- Every interactive element ≥ 44×44px.

## Migration plan

Old components stay until replacements ship per-route. No big-bang rewrite — each route migrates in its own commit inside the WS2 PR, so diffs stay reviewable.

## Risk

- Custom shader has a bug surface. Mitigated by static fallback.
- Aurora over text can hurt contrast. Mitigated by glass panel forcing ≥ 4.5:1 bg behind text.
- OKLCH in Tailwind v4 — already supported in current version per tokens reference.

## Test plan

- Unit: `NavLink` active state, `Button` variants snapshot, `NumberCounter` animation end state.
- Visual: Playwright screenshot regression on landing + 2 routes (we already use Playwright — add the screenshots feature).
- Lighthouse: LCP, CLS, perf score.
- Reduced-motion: toggle system setting, verify shader + transitions disabled.

# WS2 — UI/UX Depth Overhaul Implementation Plan

> Execute task-by-task. Completed steps use `- [x]`.

**Goal:** Ship the Aurora-Glass + Technical-Mono design language across the whole app, backed by a real token layer and a small primitive library. Every route gets re-skinned with studied hierarchy, motion rhythm, and reduced-motion fallbacks.

**Spec:** [`docs/specs/2026-04-22-ui-depth-overhaul-design.md`](../specs/2026-04-22-ui-depth-overhaul-design.md)

**Branch:** `feat/ui-depth-overhaul`

**Commit cadence:** One commit per task. Each commit keeps the app buildable and tested.

---

## Task 1 — Design tokens (tailwind v4 `@theme`)

**Files:** `app/globals.css`, `lib/design/tokens.ts`

- [ ] **Step 1.1: Token source of truth.**

```ts
// lib/design/tokens.ts
// Single source of truth for the design system. Consumed by Tailwind via the
// CSS @theme block and by runtime code (shader uniforms, chart colors).
export const tokens = {
  bg: {
    base: 'oklch(0.14 0.006 265)',
    raised: 'oklch(0.18 0.008 265)',
    inset: 'oklch(0.11 0.006 265)',
    glass: 'oklch(0.22 0.01 265 / 0.6)',
  },
  fg: {
    primary: 'oklch(0.98 0.005 265)',
    secondary: 'oklch(0.78 0.008 265)',
    muted: 'oklch(0.56 0.01 265)',
    disabled: 'oklch(0.38 0.008 265)',
  },
  accent: {
    indigo: 'oklch(0.68 0.22 270)',
    fuchsia: 'oklch(0.70 0.27 330)',
    cyan: 'oklch(0.78 0.16 210)',
    amber: 'oklch(0.82 0.17 75)',
    rose: 'oklch(0.68 0.22 20)',
  },
  semantic: {
    success: 'oklch(0.72 0.18 155)',
    warning: 'oklch(0.80 0.17 75)',
    danger: 'oklch(0.65 0.24 25)',
  },
  ring: {
    focus: 'oklch(0.72 0.22 270 / 0.7)',
    danger: 'oklch(0.65 0.24 25 / 0.6)',
  },
  radius: { sm: '6px', md: '10px', lg: '14px', xl: '22px', pill: '9999px' },
  shadow: {
    1: '0 1px 2px oklch(0 0 0 / 0.3)',
    2: '0 4px 12px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.04)',
    3: '0 16px 48px oklch(0 0 0 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.06)',
    glow: '0 0 64px oklch(0.68 0.22 270 / 0.25)',
  },
} as const

export type Accent = keyof typeof tokens.accent
```

- [ ] **Step 1.2: Map into Tailwind v4 `@theme`.**

Append to `app/globals.css`:

```css
@theme {
  --color-bg-base: oklch(0.14 0.006 265);
  --color-bg-raised: oklch(0.18 0.008 265);
  --color-bg-inset: oklch(0.11 0.006 265);
  --color-bg-glass: oklch(0.22 0.01 265 / 0.6);

  --color-fg-primary: oklch(0.98 0.005 265);
  --color-fg-secondary: oklch(0.78 0.008 265);
  --color-fg-muted: oklch(0.56 0.01 265);

  --color-accent-indigo: oklch(0.68 0.22 270);
  --color-accent-fuchsia: oklch(0.70 0.27 330);
  --color-accent-cyan: oklch(0.78 0.16 210);
  --color-accent-amber: oklch(0.82 0.17 75);
  --color-accent-rose: oklch(0.68 0.22 20);

  --color-success: oklch(0.72 0.18 155);
  --color-warning: oklch(0.80 0.17 75);
  --color-danger: oklch(0.65 0.24 25);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 22px;

  --shadow-1: 0 1px 2px oklch(0 0 0 / 0.3);
  --shadow-2: 0 4px 12px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.04);
  --shadow-3: 0 16px 48px oklch(0 0 0 / 0.55), inset 0 1px 0 oklch(1 0 0 / 0.06);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  color-scheme: dark;
  background-color: var(--color-bg-base);
  color: var(--color-fg-primary);
}

@media (prefers-color-scheme: light) {
  :root {
    --color-bg-base: oklch(0.98 0.003 265);
    --color-bg-raised: oklch(1 0 0);
    --color-bg-inset: oklch(0.96 0.004 265);
    --color-bg-glass: oklch(1 0 0 / 0.65);
    --color-fg-primary: oklch(0.20 0.008 265);
    --color-fg-secondary: oklch(0.40 0.012 265);
    --color-fg-muted: oklch(0.55 0.014 265);
    color-scheme: light;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 1.3: Build + commit.**

```bash
npm run build   # placeholder env as before
git add lib/design/tokens.ts app/globals.css
git commit -m "feat(design): add OKLCH token system and @theme mapping (WS2 foundation)"
```

---

## Task 2 — Primitive: `GlassPanel`

**Files:** `components/ui/GlassPanel.tsx`, `tests/unit/GlassPanel.test.tsx`

- [ ] **Step 2.1: Failing test.**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassPanel } from '@/components/ui/GlassPanel'

describe('GlassPanel', () => {
  it('renders children inside a glass surface', () => {
    render(<GlassPanel>content</GlassPanel>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })
  it('forwards role when provided', () => {
    render(<GlassPanel role="region" aria-label="x">x</GlassPanel>)
    expect(screen.getByRole('region', { name: 'x' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Implement.**

```tsx
// components/ui/GlassPanel.tsx
import { cn } from '@/lib/utils'

type Variant = 'raised' | 'inset' | 'flat'

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  as?: 'div' | 'section' | 'article'
}

const variantStyles: Record<Variant, string> = {
  raised:
    'bg-[color-mix(in_oklch,var(--color-bg-raised)_88%,transparent)] shadow-[var(--shadow-2)] border border-white/[0.06]',
  inset:
    'bg-[color-mix(in_oklch,var(--color-bg-inset)_92%,transparent)] shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] border border-white/[0.04]',
  flat: 'bg-transparent border border-white/[0.06]',
}

export function GlassPanel({
  variant = 'raised',
  as: Tag = 'div',
  className,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <Tag
      className={cn(
        'rounded-[var(--radius-lg)] backdrop-blur-md',
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 2.3: Pass + commit.**

```bash
git add components/ui/GlassPanel.tsx tests/unit/GlassPanel.test.tsx
git commit -m "feat(ui): add GlassPanel primitive with raised/inset/flat variants"
```

---

## Task 3 — Primitive: `Button`

**Files:** `components/ui/Button.tsx`, `tests/unit/Button.test.tsx`

- [ ] **Step 3.1: Failing test.**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders the primary variant with a 44px min height', () => {
    render(<Button>Run</Button>)
    const btn = screen.getByRole('button', { name: 'Run' })
    expect(btn).toHaveClass('h-11')
  })
  it('respects variant + size props', () => {
    render(<Button variant="ghost" size="sm">x</Button>)
    const btn = screen.getByRole('button', { name: 'x' })
    expect(btn).toHaveClass('h-9')
  })
})
```

- [ ] **Step 3.2: Implement.**

```tsx
// components/ui/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] font-medium ' +
  'outline-none transition motion-safe:active:scale-[0.98] ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-indigo)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)] ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-[var(--color-accent-indigo)] to-[var(--color-accent-fuchsia)] text-white shadow-[var(--shadow-2)] hover:brightness-110',
  secondary:
    'bg-[var(--color-bg-raised)] text-[var(--color-fg-primary)] border border-white/[0.08] hover:border-white/[0.16]',
  ghost:
    'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)] hover:bg-white/[0.04]',
  destructive:
    'bg-[var(--color-danger)] text-white hover:brightness-110 focus-visible:ring-[var(--color-danger)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-11 w-11 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...rest} />
})
```

- [ ] **Step 3.3: Pass + commit.**

```bash
git add components/ui/Button.tsx tests/unit/Button.test.tsx
git commit -m "feat(ui): add Button primitive with variants/sizes and motion-safe press"
```

---

## Task 4 — Primitive: `SectionHeader` + `Badge`

**Files:** `components/ui/SectionHeader.tsx`, `components/ui/Badge.tsx`

- [ ] **Step 4.1: `SectionHeader.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  index: number
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ index, eyebrow, title, description, className }: SectionHeaderProps) {
  const label = index.toString().padStart(2, '0')
  return (
    <header className={cn('mb-10 flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">
        <span aria-hidden="true">[{label}]</span>
        <span>{eyebrow}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-fg-primary)] sm:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-[var(--color-fg-secondary)]">{description}</p>}
    </header>
  )
}
```

- [ ] **Step 4.2: `Badge.tsx`**

```tsx
import { cn } from '@/lib/utils'

type Variant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'mono'

const variants: Record<Variant, string> = {
  default: 'bg-white/[0.06] text-[var(--color-fg-secondary)]',
  accent: 'bg-[color-mix(in_oklch,var(--color-accent-indigo)_22%,transparent)] text-[var(--color-accent-indigo)]',
  success: 'bg-[color-mix(in_oklch,var(--color-success)_22%,transparent)] text-[var(--color-success)]',
  warning: 'bg-[color-mix(in_oklch,var(--color-warning)_22%,transparent)] text-[var(--color-warning)]',
  danger: 'bg-[color-mix(in_oklch,var(--color-danger)_22%,transparent)] text-[var(--color-danger)]',
  mono: 'bg-transparent border border-white/[0.1] font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.08em] text-[var(--color-fg-muted)]',
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...rest
}: { variant?: Variant } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4.3: Commit.**

```bash
git add components/ui/SectionHeader.tsx components/ui/Badge.tsx
git commit -m "feat(ui): add SectionHeader and Badge primitives"
```

---

## Task 5 — Aurora shader (lazy client)

**Files:** `components/landing/Aurora.tsx`, `components/landing/aurora.frag.glsl`

- [ ] **Step 5.1: Fragment shader.**

```glsl
// components/landing/aurora.frag.glsl
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

// Simplex-ish FBM — compact, good enough for a background
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0; float amp = 0.5;
  for (int i = 0; i < 5; i++) { v += amp * noise(p); p *= 2.0; amp *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv * 2.0 - 1.0; p.x *= uRes.x / uRes.y;
  float t = uTime * 0.06;
  float n1 = fbm(p * 1.4 + t);
  float n2 = fbm(p * 2.1 - t * 1.3 + 10.0);
  vec3 col = mix(uA, uB, smoothstep(0.2, 0.8, n1));
  col = mix(col, uC, smoothstep(0.3, 0.9, n2));
  float vignette = smoothstep(1.4, 0.2, length(p));
  gl_FragColor = vec4(col * vignette, 1.0);
}
```

- [ ] **Step 5.2: Component.**

```tsx
// components/landing/Aurora.tsx
'use client'

import { useEffect, useRef } from 'react'
import fragSrc from './aurora.frag.glsl?raw'

const VERT_SRC = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// oklch tokens converted once to linear-space RGB for the shader
const COLORS = {
  a: [0.14, 0.10, 0.32] as const, // indigo-ish
  b: [0.42, 0.10, 0.45] as const, // fuchsia-ish
  c: [0.10, 0.32, 0.48] as const, // cyan-ish
}

export function Aurora() {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    function compile(type: number, src: string): WebGLShader {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    // fullscreen triangle
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uRes = gl.getUniformLocation(prog, 'uRes')
    gl.uniform3fv(gl.getUniformLocation(prog, 'uA'), COLORS.a)
    gl.uniform3fv(gl.getUniformLocation(prog, 'uB'), COLORS.b)
    gl.uniform3fv(gl.getUniformLocation(prog, 'uC'), COLORS.c)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = innerWidth * dpr
      canvas!.height = innerHeight * dpr
      canvas!.style.width = `${innerWidth}px`
      canvas!.style.height = `${innerHeight}px`
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
    }
    resize()
    addEventListener('resize', resize, { passive: true })

    let raf = 0
    let running = true
    function frame(t: number) {
      if (!running) return
      gl!.uniform1f(uTime, t * 0.001)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    function onVisibility() {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) }
      else if (!running) { running = true; raf = requestAnimationFrame(frame) }
    }
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 motion-reduce:hidden"
    />
  )
}
```

- [ ] **Step 5.3: Commit.**

```bash
git add components/landing/Aurora.tsx components/landing/aurora.frag.glsl
git commit -m "feat(landing): add WebGL aurora shader with reduced-motion + visibility pauses"
```

---

## Task 6 — Rewire `Hero`

**Files:** `components/landing/Hero.tsx`

- [ ] **Step 6.1: Replace Hero contents.**

```tsx
// components/landing/Hero.tsx
'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GlassPanel } from '@/components/ui/GlassPanel'

const Aurora = dynamic(() => import('./Aurora').then((m) => m.Aurora), { ssr: false })

const STATS = [
  { label: 'APIs cataloged', value: '29+' },
  { label: 'Demos shipped', value: '12' },
  { label: 'Categories', value: '12' },
] as const

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-4 pb-24 pt-32 sm:pt-40">
        <Badge variant="mono">[01] A universe of public APIs</Badge>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl text-5xl font-semibold tracking-[-0.03em] text-[var(--color-fg-primary)] sm:text-7xl"
        >
          The APIs you know, with{' '}
          <span className="bg-gradient-to-br from-[var(--color-accent-indigo)] via-[var(--color-accent-fuchsia)] to-[var(--color-accent-rose)] bg-clip-text text-transparent">
            demos you can actually run.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-lg text-[var(--color-fg-secondary)]"
        >
          Browse hundreds of public APIs. Hit run on a live, sandboxed demo. Save, collect, share.
          No keys. No curl. No swearing at CORS.
        </motion.p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" asChildLike>
            <Link href="/explore">Start exploring →</Link>
          </Button>
          <Button variant="ghost" size="lg" asChildLike>
            <Link href="/community">See community demos</Link>
          </Button>
        </div>
        <GlassPanel className="grid w-full max-w-2xl grid-cols-3 divide-x divide-white/[0.06] p-0">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-start gap-1 p-5">
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
                {s.label}
              </span>
              <span className="text-2xl font-semibold tabular-nums text-[var(--color-fg-primary)]">{s.value}</span>
            </div>
          ))}
        </GlassPanel>
      </div>
    </section>
  )
}
```

Note: `Button` doesn't accept `asChildLike`; if you need `<Link>` as a child, wrap the `Link` around `Button` instead. Switch to:

```tsx
<Link href="/explore"><Button size="lg">Start exploring →</Button></Link>
<Link href="/community"><Button variant="ghost" size="lg">See community demos</Button></Link>
```

- [ ] **Step 6.2: Commit.**

```bash
git add components/landing/Hero.tsx
git commit -m "feat(landing): rebuild Hero with Aurora shader, mono labels, glass stats"
```

---

## Task 7 — Re-choreograph landing sections

**Files:** `components/landing/FeatureGrid.tsx`, `HowItWorks.tsx`, `CallToAction.tsx`, `Footer.tsx`

- [ ] **Step 7.1: Replace each with SectionHeader + glass cards + staggered motion.**

Common motion config (extract to `components/landing/motion.ts`):

```ts
export const STAGGER = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-15%' },
  variants: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  },
} as const

export const ITEM = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  },
} as const
```

Each section uses `<SectionHeader index={N} eyebrow="..." title="..." />` + `<GlassPanel variant="raised">` + mono labels. Keep copy existing; swap containers to the primitives.

- [ ] **Step 7.2: Commit.**

```bash
git add components/landing/
git commit -m "feat(landing): apply SectionHeader rhythm and glass primitives across sections"
```

---

## Task 8 — Shell re-skin (nav, page scaffold)

**Files:** `app/(main)/layout.tsx`, `components/shell/NavLink.tsx` (style update)

- [ ] **Step 8.1: Update shell bg + border to tokens.**

Replace hex+Tailwind colour utilities in the `<div>` shell and `<header>` with token-backed ones:

```tsx
<div className="min-h-dvh bg-[var(--color-bg-base)]">
  <SmoothScroll />
  <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[color-mix(in_oklch,var(--color-bg-base)_72%,transparent)] backdrop-blur-md">
    ...
  </header>
  {children}
</div>
```

- [ ] **Step 8.2: `NavLink` style parity.**

Replace the old indigo-specific focus ring with a token-based one and add a hairline indicator under active items:

```tsx
'relative rounded-md px-1 py-1 text-sm outline-none transition',
'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)]',
'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-indigo)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-base)]',
'aria-[current=page]:text-[var(--color-fg-primary)]',
"aria-[current=page]:after:content-[''] aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-1 aria-[current=page]:after:-bottom-0.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-gradient-to-r aria-[current=page]:after:from-[var(--color-accent-indigo)] aria-[current=page]:after:to-[var(--color-accent-fuchsia)]",
```

- [ ] **Step 8.3: Commit.**

```bash
git add app/\(main\)/layout.tsx components/shell/NavLink.tsx
git commit -m "feat(shell): re-skin app layout + nav with tokens and active underline"
```

---

## Task 9 — Route-level migrations

Re-skin each route using only primitives + tokens. **No bespoke classNames copied between files.** One commit per route.

- [ ] **Step 9.1: `/explore`** — SectionHeader + inset search field + mono filter badges + glass ApiCard grid.
- [ ] **Step 9.2: `/api/[slug]`** — mono meta rail on the left (author, category, auth, CORS), glass hero + demo panel with mono tab chrome.
- [ ] **Step 9.3: `/collections` + `/collections/[id]`** — glass cards, empty states refined, delete button uses `Button variant="destructive" size="icon"`.
- [ ] **Step 9.4: `/community`** — DemoCard wrapped in GlassPanel, mono vote counter with tabular nums, aria-pressed on UpvoteButton verified.
- [ ] **Step 9.5: `/profile`** — ring-glow avatar, SectionHeader `[01] Profile` / `[02] Stats` / `[03] Bookmarks`, glass stat cards.
- [ ] **Step 9.6: `/login`** — full-screen Aurora backdrop + compact GlassPanel card, big provider buttons using `Button variant="secondary" size="lg"`.

Each step: make edits → `npm test && npm run lint && npx tsc --noEmit` → commit:

```bash
git commit -m "feat(route): re-skin /<route> with design system primitives"
```

---

## Task 10 — Playwright visual regression

**Files:** `playwright.config.ts` (mod), `tests/e2e/visual.spec.ts`

- [ ] **Step 10.1: Enable screenshots in playwright config.**

Ensure `toHaveScreenshot` is configured and a `screenshots/` dir is gitignored for local noise but CI baselines live under `tests/e2e/__screenshots__/`.

- [ ] **Step 10.2: Baseline test.**

```ts
import { test, expect } from '@playwright/test'

test.describe('visual baseline', () => {
  for (const route of ['/', '/explore', '/community']) {
    test(`screenshot ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(route)
      await expect(page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.02 })
    })
  }
})
```

- [ ] **Step 10.3: Commit baselines.**

```bash
git add tests/e2e/visual.spec.ts tests/e2e/__screenshots__/
git commit -m "test(visual): add Playwright screenshot baselines for landing/explore/community"
```

---

## Task 11 — PR + merge

- [ ] Push branch, open PR with body at `docs/plans/_pr-bodies/ui-depth-overhaul.md`, wait for CI, merge squash, delete branch, sync main.

## Self-review checklist

- [ ] Zero hex colours in any component file (all via tokens)
- [ ] Zero `rounded-[13px]` or other off-scale radii
- [ ] Every interactive element ≥ 44px tall on `md`+
- [ ] Aurora bails on `prefers-reduced-motion` and hidden tabs
- [ ] Landing LCP < 2.5s (mobile throttled), CLS < 0.05
- [ ] Extra JS on landing < 40 KB gzip vs previous baseline
- [ ] Lighthouse accessibility = 100 on every re-skinned route

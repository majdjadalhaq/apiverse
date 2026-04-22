# WS3 — API Composer + Live Dashboards Implementation Plan

> Execute task-by-task. Completed steps use `- [x]`.

**Goal:** Ship the two biggest features — **API Composer** (α) and **Live Dashboards** (γ). No AI API keys anywhere.

**Spec:** [`docs/specs/2026-04-22-composer-and-dashboards-design.md`](../specs/2026-04-22-composer-and-dashboards-design.md)

**Branches (in order):**
1. `feat/composer-core` — graph + execution + canvas (α)
2. `feat/composer-persist` — save/fork/publish (α)
3. `feat/dashboards-core` — grid, widgets, schedule (γ)
4. `feat/dashboards-seed` — the three curated dashboards (γ)
5. `feat/composer-dashboard-bridge` — publish composition as widget (α↔γ)

Each branch → PR → review → squash-merge → sync main → next branch. Keeps diffs reviewable.

---

# BRANCH 1 — `feat/composer-core`

## Task 1 — Migration: `compositions` table

**Files:** `supabase/migrations/003_compositions.sql`

- [ ] **Step 1.1: Write migration.** Copy the SQL from the spec (data-model section α).
- [ ] **Step 1.2: Run `npx supabase db push` locally, verify RLS.**
- [ ] **Step 1.3: Commit.** `git commit -m "feat(db): add compositions table with RLS"`

---

## Task 2 — Graph types + topological sort

**Files:** `lib/composer/graph.ts`, `tests/unit/composer-graph.test.ts`

- [ ] **Step 2.1: Failing test.**

```ts
import { describe, it, expect } from 'vitest'
import { topoSort, hasCycle } from '@/lib/composer/graph'

describe('composer/graph', () => {
  it('orders a linear chain', () => {
    const graph = {
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any,
      edges: [{ from: 'a', to: 'b', toField: '_' }, { from: 'b', to: 'c', toField: '_' }],
    }
    expect(topoSort(graph).map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })
  it('detects cycles', () => {
    const graph = {
      nodes: [{ id: 'a' }, { id: 'b' }] as any,
      edges: [{ from: 'a', to: 'b', toField: '_' }, { from: 'b', to: 'a', toField: '_' }],
    }
    expect(hasCycle(graph)).toBe(true)
  })
})
```

- [ ] **Step 2.2: Implement.**

```ts
// lib/composer/graph.ts
export type NodeId = string
export interface NodeBase { id: NodeId }
export interface Edge { from: NodeId; fromField?: string; to: NodeId; toField: string }
export interface Graph<N extends NodeBase = NodeBase> { nodes: N[]; edges: Edge[] }

export function topoSort<N extends NodeBase>(g: Graph<N>): N[] {
  const inDeg = new Map<NodeId, number>()
  const byId = new Map<NodeId, N>()
  for (const n of g.nodes) { inDeg.set(n.id, 0); byId.set(n.id, n) }
  for (const e of g.edges) inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1)

  const queue: NodeId[] = []
  for (const [id, d] of inDeg) if (d === 0) queue.push(id)

  const result: N[] = []
  while (queue.length) {
    const id = queue.shift()!
    result.push(byId.get(id)!)
    for (const e of g.edges) {
      if (e.from !== id) continue
      const next = (inDeg.get(e.to) ?? 0) - 1
      inDeg.set(e.to, next)
      if (next === 0) queue.push(e.to)
    }
  }
  if (result.length !== g.nodes.length) throw new Error('cycle detected')
  return result
}

export function hasCycle<N extends NodeBase>(g: Graph<N>): boolean {
  try { topoSort(g); return false } catch { return true }
}
```

- [ ] **Step 2.3: Pass + commit.** `git commit -m "feat(composer): graph types, topo sort, cycle detection"`

---

## Task 3 — Transformers (pure, isolated)

**Files:** `lib/composer/transformers/*.ts`, `tests/unit/composer-transformers.test.ts`

- [ ] **Step 3.1: Failing test.**

```ts
import { describe, it, expect } from 'vitest'
import { pick } from '@/lib/composer/transformers/pick'
import { map } from '@/lib/composer/transformers/map'

describe('transformers', () => {
  it('pick extracts a JSON pointer', () => {
    expect(pick({ user: { login: 'majd' } }, { path: 'user.login' })).toBe('majd')
  })
  it('map applies a template to each item', () => {
    expect(
      map([{ id: 1 }, { id: 2 }], { template: { label: '${id}' } }),
    ).toEqual([{ label: '1' }, { label: '2' }])
  })
})
```

- [ ] **Step 3.2: Implement.**

```ts
// lib/composer/transformers/pick.ts
export function pick(input: unknown, { path }: { path: string }): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[key]
  }, input)
}
```

```ts
// lib/composer/transformers/map.ts
export function map(
  input: unknown,
  { template }: { template: Record<string, string> },
): unknown[] {
  if (!Array.isArray(input)) return []
  return input.map((item) => {
    const out: Record<string, unknown> = {}
    for (const [k, tmpl] of Object.entries(template)) {
      out[k] = tmpl.replace(/\$\{(\w+)\}/g, (_, key: string) =>
        String((item as Record<string, unknown>)[key] ?? ''),
      )
    }
    return out
  })
}
```

(Similar files for `filter.ts`, `merge.ts`, `format.ts`. Each pure, each tested.)

- [ ] **Step 3.3: Commit.** `git commit -m "feat(composer): add pure transformer library (pick/map/filter/merge/format)"`

---

## Task 4 — DAG executor

**Files:** `lib/composer/execute.ts`, `tests/unit/composer-execute.test.ts`

- [ ] **Step 4.1: Failing test.**

```ts
import { describe, it, expect, vi } from 'vitest'
import { executeGraph } from '@/lib/composer/execute'

describe('executeGraph', () => {
  it('runs nodes in topo order and returns per-node outputs', async () => {
    const runner = vi.fn().mockImplementation(async (id: string) => `result:${id}`)
    const graph = {
      nodes: [
        { id: 'a', type: 'api' as const },
        { id: 'b', type: 'api' as const },
      ],
      edges: [{ from: 'a', to: 'b', toField: 'input' }],
    }
    const { outputs } = await executeGraph(graph, { runNode: runner })
    expect(outputs.get('a')).toBe('result:a')
    expect(outputs.get('b')).toBe('result:b')
    expect(runner).toHaveBeenCalledTimes(2)
  })
  it('cancels on abort', async () => {
    const ctrl = new AbortController()
    ctrl.abort()
    await expect(
      executeGraph({ nodes: [], edges: [] }, { runNode: async () => 'x', signal: ctrl.signal }),
    ).rejects.toThrow(/abort/i)
  })
})
```

- [ ] **Step 4.2: Implement.**

```ts
// lib/composer/execute.ts
import { topoSort, type Graph, type NodeBase, type NodeId } from './graph'

interface ExecOptions<N extends NodeBase> {
  runNode: (id: NodeId, node: N, resolvedInputs: Record<string, unknown>) => Promise<unknown>
  signal?: AbortSignal
  onState?: (id: NodeId, state: 'running' | 'ok' | 'error', payload?: unknown) => void
}

export interface ExecutionResult {
  outputs: Map<NodeId, unknown>
  errors: Map<NodeId, unknown>
}

export async function executeGraph<N extends NodeBase>(
  graph: Graph<N>,
  opts: ExecOptions<N>,
): Promise<ExecutionResult> {
  if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError')

  const order = topoSort(graph)
  const outputs = new Map<NodeId, unknown>()
  const errors = new Map<NodeId, unknown>()
  const failed = new Set<NodeId>()

  const upstreamOf = (id: NodeId) => graph.edges.filter((e) => e.to === id)

  for (const node of order) {
    if (opts.signal?.aborted) throw new DOMException('aborted', 'AbortError')
    const ups = upstreamOf(node.id)
    if (ups.some((e) => failed.has(e.from))) {
      failed.add(node.id)
      continue
    }
    const resolved: Record<string, unknown> = {}
    for (const e of ups) resolved[e.toField] = outputs.get(e.from)
    opts.onState?.(node.id, 'running')
    try {
      const out = await opts.runNode(node.id, node, resolved)
      outputs.set(node.id, out)
      opts.onState?.(node.id, 'ok', out)
    } catch (err) {
      errors.set(node.id, err)
      failed.add(node.id)
      opts.onState?.(node.id, 'error', err)
    }
  }
  return { outputs, errors }
}
```

- [ ] **Step 4.3: Commit.** `git commit -m "feat(composer): DAG executor with abort + per-node state events"`

---

## Task 5 — Sandbox bridge for API nodes

**Files:** `lib/composer/sandbox-bridge.ts`, `tests/unit/composer-sandbox.test.ts`

- [ ] **Step 5.1: Reuse existing sandbox runner** at `/sandbox/runner.html`. Add `runApiCall(slug, inputs)` that postMessage-dispatches and awaits the reply with a `correlationId`.

```ts
// lib/composer/sandbox-bridge.ts
let iframe: HTMLIFrameElement | null = null

function ensureFrame(): HTMLIFrameElement {
  if (iframe) return iframe
  const f = document.createElement('iframe')
  f.src = '/sandbox/runner.html'
  f.sandbox.add('allow-scripts')
  f.style.display = 'none'
  document.body.appendChild(f)
  iframe = f
  return f
}

export async function runApiCall(slug: string, inputs: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
  const frame = ensureFrame()
  const correlationId = crypto.randomUUID()

  return new Promise((resolve, reject) => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== frame.contentWindow) return
      const data = ev.data as { correlationId?: string; ok?: boolean; result?: unknown; error?: string }
      if (data.correlationId !== correlationId) return
      window.removeEventListener('message', onMessage)
      signal?.removeEventListener('abort', onAbort)
      data.ok ? resolve(data.result) : reject(new Error(data.error ?? 'sandbox error'))
    }
    const onAbort = () => {
      window.removeEventListener('message', onMessage)
      reject(new DOMException('aborted', 'AbortError'))
    }
    window.addEventListener('message', onMessage)
    signal?.addEventListener('abort', onAbort, { once: true })
    frame.contentWindow?.postMessage({ type: 'RENDER_DEMO', correlationId, slug, inputs }, '*')
  })
}
```

- [ ] **Step 5.2: Commit.** `git commit -m "feat(composer): postMessage bridge to sandbox iframe for API nodes"`

---

## Task 6 — Canvas UI + palette + inspector

**Files:** `components/composer/Canvas.tsx`, `NodePalette.tsx`, `Inspector.tsx`, `RunBar.tsx`, `app/(main)/composer/new/page.tsx`

- [ ] **Step 6.1:** Install `@xyflow/react` (React Flow v12). `npm i @xyflow/react`. Add light import via dynamic boundary to avoid SSR cost.

- [ ] **Step 6.2:** `Canvas.tsx` renders `<ReactFlow>`, wires node/edge changes into a store (use `zustand` — `npm i zustand`).

- [ ] **Step 6.3:** `NodePalette.tsx` lists cataloged APIs (fetched at page mount from `/api/list` or existing server-loaded list) + transformer nodes. Search-filter with simple `.includes`.

- [ ] **Step 6.4:** `Inspector.tsx` edits the selected node's config via form controls. Mono field labels. Field mapper uses an autocomplete fed by inferred upstream schema.

- [ ] **Step 6.5:** `RunBar.tsx` calls `executeGraph` with `runNode` that dispatches to `runApiCall` or the correct transformer.

- [ ] **Step 6.6:** `app/(main)/composer/new/page.tsx` is a client component that composes Canvas + Palette + Inspector + RunBar inside a `requireAuth` server wrapper.

- [ ] **Step 6.7: Commit each incrementally.**

```bash
git commit -m "feat(composer): canvas + palette + inspector + run bar"
```

---

# BRANCH 2 — `feat/composer-persist`

## Task 7 — Server action: save/fork/publish

**Files:** `app/actions/composer.ts`, `tests/unit/composer-actions.test.ts`

- [ ] **Step 7.1:** Actions mirror spec:

```ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  graph: z.record(z.unknown()),
  is_public: z.boolean().default(true),
})

export async function saveComposition(input: z.infer<typeof saveSchema>) {
  const parsed = saveSchema.parse(input)
  const user = await requireAuth()
  const supabase = await createClient()
  const row = { ...parsed, author_id: user.id, updated_at: new Date().toISOString() }
  const q = parsed.id
    ? supabase.from('compositions').update(row).eq('id', parsed.id).select('id').single()
    : supabase.from('compositions').insert(row).select('id').single()
  const { data, error } = await q
  if (error) return { ok: false as const, error: error.message }
  revalidatePath(`/composer/${data.id}`)
  return { ok: true as const, id: data.id }
}
```

- [ ] **Step 7.2:** `forkComposition(id)` copies row setting `author_id = user.id, fork_of = id`.

- [ ] **Step 7.3: Commit.** `git commit -m "feat(composer): save/fork actions with zod validation + RLS-gated writes"`

---

## Task 8 — Route: `/composer/[id]`

**Files:** `app/(main)/composer/[id]/page.tsx`

- [ ] Server-fetch the composition (RLS handles access). Hydrate client Canvas with the graph. If current user is author, enable edit mode; else read-only with Fork CTA.
- [ ] Commit: `git commit -m "feat(composer): dynamic composition route with fork + read-only modes"`

---

# BRANCH 3 — `feat/dashboards-core`

## Task 9 — Migration: `dashboards` + `widgets`

Copy SQL from spec data-model γ. `git commit -m "feat(db): add dashboards + widgets tables with RLS"`

---

## Task 10 — `schedule.ts` (visibility-aware, jittered)

**Files:** `lib/dashboards/schedule.ts`, `tests/unit/schedule.test.ts`

- [ ] **Step 10.1: Failing test (fake timers).**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createScheduler } from '@/lib/dashboards/schedule'

describe('scheduler', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('invokes tick on the configured cadence', async () => {
    const tick = vi.fn()
    const s = createScheduler([{ id: 'a', periodMs: 1000, tick }])
    s.start()
    await vi.advanceTimersByTimeAsync(3100)
    expect(tick.mock.calls.length).toBeGreaterThanOrEqual(2)
    s.stop()
  })
})
```

- [ ] **Step 10.2: Implement.**

```ts
// lib/dashboards/schedule.ts
interface Job { id: string; periodMs: number; tick: () => Promise<void> | void }

export function createScheduler(jobs: Job[]) {
  const timers = new Map<string, number>()
  const running = new Set<string>()
  const concurrency = 4
  let active = 0

  async function fire(j: Job) {
    if (document.hidden) return
    if (active >= concurrency) return
    active++
    running.add(j.id)
    try { await j.tick() } finally { active--; running.delete(j.id) }
  }

  function start() {
    jobs.forEach((j, i) => {
      if (j.periodMs <= 0) return
      const jitter = Math.random() * 0.25 * j.periodMs + i * 200
      const schedule = () => {
        timers.set(j.id, window.setTimeout(async () => {
          await fire(j)
          schedule()
        }, j.periodMs + jitter))
      }
      schedule()
    })
  }
  function stop() {
    timers.forEach((id) => clearTimeout(id))
    timers.clear()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })

  return { start, stop, running }
}
```

- [ ] **Step 10.3: Commit.** `git commit -m "feat(dashboards): visibility-aware jittered scheduler with concurrency cap"`

---

## Task 11 — Grid + WidgetFrame + ApiWidget

**Files:** `components/dashboards/DashboardGrid.tsx`, `WidgetFrame.tsx`, `widgets/ApiWidget.tsx`

- [ ] **Step 11.1:** Use CSS grid (`grid-cols-12`) + widget `position.{x,y,w,h}` computed to `gridColumn` / `gridRow`. Keyboard reorder via arrow keys on focused widget (store-driven).

- [ ] **Step 11.2:** `WidgetFrame` = `<GlassPanel>` with mono `[NN]` bracket + live-dot indicator + refresh badge.

- [ ] **Step 11.3:** `ApiWidget` fetches via existing sandbox bridge, renders json/table/markdown/card per widget config. Skeleton shimmer until first fetch resolves.

- [ ] **Step 11.4:** Commit: `git commit -m "feat(dashboards): grid + widget frame + api widget renderer"`

---

## Task 12 — Dashboard routes

- [ ] `/dashboards` — gallery server component, public dashboards, fork CTA on each card.
- [ ] `/dashboards/[slug]` — dashboard view, hydrate widgets, start scheduler on mount, stop on unmount.
- [ ] `/dashboards/[slug]/edit` — auth-gated, drag-grid enabled, WidgetPicker drawer.
- [ ] `/embed/dashboard/[slug]` — minimal chrome for iframe embed, CSP-safe.

Commit per route. `git commit -m "feat(dashboards): <route> page"`

---

# BRANCH 4 — `feat/dashboards-seed`

## Task 13 — Seed curated dashboards

**Files:** `supabase/seed/curated-dashboards.sql`, `scripts/seed-dashboards.ts`

- [ ] Seed the three dashboards (Dev Pulse, Morning Brief, Crypto Watch) + their widgets via a `scripts/seed-dashboards.ts` that uses the service-role key server-side.
- [ ] Add `npm run seed:dashboards` script to `package.json`.
- [ ] Run against staging Supabase, verify.
- [ ] Commit: `git commit -m "feat(dashboards): seed Dev Pulse, Morning Brief, Crypto Watch"`

---

# BRANCH 5 — `feat/composer-dashboard-bridge`

## Task 14 — Publish composition → widget

**Files:** `components/composer/PublishAsWidgetDialog.tsx`, `components/dashboards/widgets/ComposerWidget.tsx`

- [ ] **Step 14.1:** Dialog in Composer's RunBar. User picks a target dashboard (or "new dashboard"), picks widget size, confirms → creates a `widgets` row with `kind='composer', ref_id=composition.id`.

- [ ] **Step 14.2:** `ComposerWidget` loads the composition graph, re-runs it via `executeGraph` on each scheduler tick, renders output via the composition's `OutputNode` format.

- [ ] **Step 14.3: Commit.** `git commit -m "feat(bridge): publish composition as dashboard widget"`

---

## Task 15 — End-to-end Playwright

**Files:** `tests/e2e/composer.spec.ts`, `tests/e2e/dashboards.spec.ts`

- [ ] **Step 15.1: Composer e2e** — login → open `/composer/new` → drop a GitHub-user API node + format node + output → fill input "majdjadalhaq" → Run → assert output card shows login.
- [ ] **Step 15.2: Dashboards e2e** — open `/dashboards/dev-pulse` → 3 widgets render within 5s → each shows non-empty content.
- [ ] **Step 15.3: Embed e2e** — `/embed/dashboard/dev-pulse` → `document.cookie` from inside iframe is empty (sandbox isolation works).

Commit: `git commit -m "test(e2e): composer + dashboards + embed flows"`

---

## Self-review checklist

**Composer (α)**
- [ ] Graph/execute/transformers have >= 85% line coverage
- [ ] Cycles caught with a clear error, not a stack overflow
- [ ] Canvas at 20 nodes stays > 55fps on pan/zoom (profile manually)
- [ ] Cancel mid-run actually aborts in-flight fetches
- [ ] LocalStorage key vault never writes plaintext keys
- [ ] Composer canvas bundle code-split and lazy (< 120 KB extra)

**Dashboards (γ)**
- [ ] Scheduler pauses on tab hidden, resumes on visible (manual QA)
- [ ] Dashboard view route has zero client JS for static chrome (grid + widget frames)
- [ ] Only the widget bodies hydrate as client components
- [ ] Embed URL has no parent-cookie access from inside the iframe
- [ ] IndexedDB cache keyed by widget id, TTL-respected

**Integration**
- [ ] Publish-as-widget creates the right DB rows and the widget renders on the target dashboard after one navigation
- [ ] Forking a composition duplicates its graph + nulls `fork_of` chain never deeper than the immediate parent
- [ ] RLS: can only read other users' compositions when `is_public = true`

**Code hygiene**
- [ ] Every new file has a header comment explaining its single responsibility
- [ ] Zero `any` — all Supabase returns typed with `.returns<T>()`
- [ ] Every server action validates input with zod
- [ ] Every new route has a `Metadata` export (title + description)
- [ ] No hex colours — everything through WS2 tokens

# Workstream 3 — API Composer + Live Dashboards (Design)

**Status:** Locked · 2026-04-22

**Goal:** Turn APIVerse from a *catalogue* into a *platform*. Users can chain public APIs into visual pipelines (Composer) and curate multi-API boards (Dashboards) that update live. No AI keys anywhere — everything runs on the cataloged public APIs already seeded.

**Non-goals:** AI-generated code/demos. Monetization. External API keys (all cataloged APIs are keyless or use user-supplied keys encrypted client-side).

---

## Why these two

Both require real engineering (node-graph editors, DAG execution, state sync, live polling). Both prove distinct skills (data-flow thinking + product curation). They compose: a published Composer pipeline can become a Dashboard widget.

---

## Feature α — API Composer

**Elevator:** "Figma for public APIs." Drag an API onto a canvas, drag another, wire them together, map fields, run the chain, see live output. Save, share, fork.

### User stories

1. As an explorer, I can open a blank canvas at `/composer/new`.
2. I can drag any cataloged API onto the canvas as a *node*.
3. Each node has typed inputs (query params, headers, body shape) and a typed output (the JSON response schema, inferred from a first successful call).
4. I can wire node A's output to node B's input with a field mapper (`A.user.login` → `B.params.username`).
5. I can add transformer nodes: `pick / map / filter / merge / format-string`. Transformers are pure, client-only, no external deps.
6. Hit **Run** → the DAG executes, each node shows status (idle/running/ok/error) + its response, latencies, token counts (chars in/out).
7. Save to my account. Get a shareable `/composer/:id` URL. Public by default, togglable private.
8. Fork another user's public composition.
9. Publish a composition as a **Dashboard widget** (feeds into feature γ).

### Architecture

```
app/
  (main)/composer/
    new/page.tsx                        — blank canvas (client-only shell)
    [id]/page.tsx                       — loaded canvas by id (server-fetch + hydrate)
components/composer/
  Canvas.tsx                            — <ReactFlow> wrapper, pan/zoom, grid
  NodePalette.tsx                       — left drawer: API search + transformer nodes
  nodes/
    ApiNode.tsx                         — renders an API call node
    TransformNode.tsx                   — renders a transformer node
    OutputNode.tsx                      — terminal "show result" node
  Inspector.tsx                         — right drawer: selected-node config
  FieldMapper.tsx                       — autocomplete from upstream schema
  RunBar.tsx                            — Run / Stop / Status toasts
  UseKeyDialog.tsx                      — per-API key entry (stored in browser, never server)
lib/composer/
  graph.ts                              — Graph type: nodes, edges, topologicalSort
  execute.ts                            — DAG runner, async, cancellable
  schema-infer.ts                       — JSON → schema (types + example values)
  sandbox-bridge.ts                     — reuses /public/sandbox/runner.html per-API
  storage.ts                            — Supabase persistence
  transformers/                         — pick, map, filter, merge, format
    index.ts
    pick.ts
    map.ts
    filter.ts
    merge.ts
    format.ts
app/actions/composer.ts                 — saveComposition, publishComposition, forkComposition
supabase/migrations/003_compositions.sql
```

### Data model

```sql
-- supabase/migrations/003_compositions.sql

create table compositions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  description text check (length(description) <= 1000),
  graph jsonb not null,                 -- { nodes: [...], edges: [...] }
  is_public boolean not null default true,
  fork_of uuid references compositions(id) on delete set null,
  run_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on compositions(author_id);
create index on compositions(is_public) where is_public;

-- RLS
alter table compositions enable row level security;
create policy "read public or own" on compositions for select
  using (is_public or author_id = auth.uid());
create policy "write own" on compositions for all
  using (author_id = auth.uid()) with check (author_id = auth.uid());
```

### Graph type

```ts
// lib/composer/graph.ts
export type NodeId = string

export interface ApiNode {
  id: NodeId
  type: 'api'
  apiSlug: string                       // from apis table
  inputs: Record<string, InputSource>   // key -> { source: 'literal'|'upstream', value|ref }
  cache?: { ttlMs: number }
}

export interface TransformNode {
  id: NodeId
  type: 'transform'
  kind: 'pick' | 'map' | 'filter' | 'merge' | 'format'
  config: Record<string, unknown>       // kind-specific
  upstream: NodeId[]
}

export interface OutputNode {
  id: NodeId
  type: 'output'
  upstream: NodeId                      // single source
  format: 'json' | 'table' | 'markdown' | 'card'
}

export type Node = ApiNode | TransformNode | OutputNode

export interface Edge {
  from: NodeId
  fromField?: string                    // JSON pointer into upstream output
  to: NodeId
  toField: string                       // target input key
}

export interface Graph {
  nodes: Node[]
  edges: Edge[]
}
```

Graph is the only source of truth. React Flow's state is derived.

### Execution

`executeGraph(graph, { signal, onNodeState }): Promise<ExecutionResult>`

1. Topological sort (Kahn's algorithm). Reject cycles with a clear error.
2. For each node in order, resolve inputs from upstream outputs (by JSON pointer) and literal defaults.
3. API nodes fetch via existing `/sandbox` iframe — same security posture as the current demo system. Every API call sandboxed, no credentials leaked.
4. Transform nodes run in a Web Worker (`new Worker()`) — isolates CPU spikes from main thread.
5. Errors short-circuit downstream branches only; unrelated branches continue.
6. Results stream back to the UI via a small event bus; UI re-renders per-node.

Cancellation via `AbortController` at the graph level and per-fetch.

### Keys without a server

Some cataloged APIs require a user-supplied key. Composer gets a **per-API key vault** stored in `window.localStorage` under `apiverse:keys:<slug>`, encrypted at rest with a user-chosen passphrase via Web Crypto `deriveKey` → AES-GCM. Keys never leave the browser. The vault UI lives in `UseKeyDialog`. Plaintext API keys are never persisted server-side, never logged, never put in URLs.

### Performance

- Canvas virtualization via React Flow's built-in viewport culling.
- Node response JSON truncated in the inspector preview to 2KB (full payload on expand).
- DAG re-run debounced 300ms when the user edits a field.
- Cache layer: each node stores `{ inputsHash, output, ts }`; a re-run with identical inputs within `ttlMs` reuses the cached output.

### Accessibility

- Full keyboard graph navigation: Tab moves focus through nodes, Enter opens the Inspector.
- Drag-and-drop has a keyboard alternative: Ctrl+A opens the palette with a combobox.
- `aria-live="polite"` region announces run state changes.
- High-contrast mode thickens edge strokes and drops decorative shadows.

### UI treatment (inherits WS2)

- Canvas on `bg.inset`, 32px dot-grid texture.
- Nodes = glass panels with 1px accent border matched to node type (api=indigo, transform=cyan, output=fuchsia).
- Edges = bezier with animated-dash flow indicator during execution.
- Inspector = right-side glass drawer, 380px wide, mono labels, code-font monospace for field paths.
- RunBar = bottom-center pill, primary CTA runs, Cmd/Ctrl+Enter shortcut.

---

## Feature γ — Live Dashboards

**Elevator:** Fork-able multi-API dashboards. Morning Brief, Dev Pulse, Weather Wall — each one a grid of widgets drawing from cataloged APIs, auto-refreshing on a schedule.

### User stories

1. Gallery at `/dashboards` shows curated + community dashboards as preview cards (live preview iframes disabled until opened for perf).
2. Open a dashboard at `/dashboards/:slug` → full grid rendered, widgets live-fetching.
3. Fork to my account → I can edit the grid, add/remove widgets, rearrange (drag).
4. A widget is either:
   - A **direct API card** (single cataloged API, simple render), or
   - A **Composer-published widget** (graph from feature α rendered via OutputNode format).
5. Widgets specify a refresh schedule (`off / 30s / 5m / 1h`).
6. Embed: any public dashboard renders a `<iframe>` embed at `/embed/dashboard/:slug`, `sandbox="allow-scripts"` only.

### Architecture

```
app/
  (main)/dashboards/
    page.tsx                            — gallery
    [slug]/page.tsx                     — dashboard view
    [slug]/edit/page.tsx                — edit mode (auth-gated)
  embed/dashboard/[slug]/page.tsx       — minimal chrome for iframe
components/dashboards/
  DashboardGrid.tsx                     — react-grid-layout-style, keyboard reorder
  WidgetFrame.tsx                       — glass panel chrome + schedule badge + refresh
  widgets/
    ApiWidget.tsx                       — direct API render (json/table/markdown/card)
    ComposerWidget.tsx                  — runs a saved composition + renders OutputNode
  WidgetPicker.tsx                      — add-widget drawer
  DashboardHeader.tsx                   — title, author, fork button
lib/dashboards/
  schedule.ts                           — visible-tab-aware setInterval
  fetchDashboard.ts                     — hydrate dashboard + widget definitions
app/actions/dashboards.ts               — create/update/delete/fork
supabase/migrations/004_dashboards.sql
```

### Data model

```sql
-- supabase/migrations/004_dashboards.sql

create table dashboards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  description text check (length(description) <= 1000),
  layout jsonb not null,                -- { cols, rows, items: [...] }
  is_public boolean not null default true,
  fork_of uuid references dashboards(id) on delete set null,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references dashboards(id) on delete cascade,
  kind text not null check (kind in ('api', 'composer')),
  ref_id text not null,                 -- api slug for kind=api, composition id for kind=composer
  config jsonb not null default '{}',
  refresh_ms integer not null default 0 check (refresh_ms in (0, 30000, 300000, 3600000)),
  position jsonb not null,              -- { x, y, w, h }
  created_at timestamptz not null default now()
);

create index on widgets(dashboard_id);

alter table dashboards enable row level security;
alter table widgets enable row level security;

create policy "read public or own" on dashboards for select
  using (is_public or author_id = auth.uid());
create policy "write own" on dashboards for all
  using (author_id = auth.uid()) with check (author_id = auth.uid());

create policy "widgets inherit dashboard rls" on widgets for select
  using (exists (
    select 1 from dashboards d
    where d.id = widgets.dashboard_id
      and (d.is_public or d.author_id = auth.uid())
  ));
create policy "widgets write via owned dashboard" on widgets for all
  using (exists (
    select 1 from dashboards d
    where d.id = widgets.dashboard_id and d.author_id = auth.uid()
  ));
```

### Scheduling

`lib/dashboards/schedule.ts` uses:
- `document.visibilityState` — pause all refreshes when tab hidden.
- Staggered offsets so 6 widgets with the same 30s cycle don't hit at once.
- Jittered backoff on failures (200ms → 2s → 10s, capped).
- Global concurrency cap of 4 simultaneous fetches.

### Seed dashboards

Ship three curated dashboards on launch:

1. **Dev Pulse** — GitHub trending + Hacker News top + dev.to fresh (3 cataloged APIs).
2. **Morning Brief** — weather (OpenWeather public tier) + sunrise/sunset + Wikipedia on-this-day + cat-fact of the day.
3. **Crypto Watch** — CoinGecko top 10 + exchange rate + price spark-line sketched as inline SVG (no extra chart dep).

All three use only APIs already seeded into the `apis` table.

### Performance

- `loading="lazy"` on any widget-rendered image.
- Widgets render skeleton shimmer until first fetch resolves.
- Dashboard grid virtualizes rows below the fold.
- Initial dashboard HTML streams server-side with a snapshot of the last-cached payload per widget (stored client-side in IndexedDB, key = widget id).
- Edit mode is a separate route, not a toggle — keeps view route lean.

### Security

- Embed iframe has `sandbox="allow-scripts"` (no `allow-same-origin`). It can run widgets but can't read parent cookies or DOM.
- Composer widgets execute the saved graph via the existing sandbox iframe runner — no new code-execution surface.

### UI treatment (inherits WS2)

- Grid = 12-column CSS grid, gap 16px.
- Widget frame = glass panel with `[NN]` bracket label + live-dot indicator (pulses on fetch, red on error).
- Refresh badge in the top-right of the frame: `[30s]`, `[5m]`, `[1h]`, or static dot.
- Draggable state: scale 0.98, elevated shadow, ring-focus hint.
- Error state: frame border turns `danger`, single-line error + retry CTA.

### Accessibility

- Keyboard reorder: widget focused → arrow keys move by one grid cell, Enter confirms.
- Every widget has a programmatic name for screen readers.
- Refresh schedule announced on change via `aria-live`.

---

## Integration between α and γ

Publishing a composition from Composer creates a row in `widgets`-ready format: `{ kind: 'composer', ref_id: composition.id }`. Adding to a dashboard is a one-click action from the Composer RunBar.

## Risk

| Risk | Mitigation |
|------|-----------|
| Node-graph editor is a big surface | Use `@xyflow/react` (React Flow v12) — mature, accessible |
| DAG execution bugs silently drop data | Deterministic traces: every run logs inputsHash → output per node in IndexedDB, Inspector shows "explain run" |
| Live polling batters user data plans | Pause on hidden tab, jitter, concurrency cap, explicit off option |
| Cataloged APIs change or disappear | Cache last-known response in IndexedDB, mark widget as "stale" in UI, don't hard-error |
| LocalStorage key vault compromised by XSS | Keys encrypted AES-GCM with user passphrase; passphrase never persisted. XSS mitigated by strict CSP (separate task, noted in WS1 follow-up) |

## Test plan

Unit:
- `graph.ts` — topological sort correctness, cycle detection
- `execute.ts` — happy path, branch-isolated error, cancellation
- `transformers/*` — each transformer in isolation
- `schedule.ts` — pause on hidden, jitter, concurrency cap
- `WidgetFrame` — skeleton, error, refresh states

Integration (Playwright):
- Build a 3-node composition end-to-end, run, verify output
- Save, fork, verify cloned graph matches
- Open Dev Pulse dashboard, verify 3 widgets render within 5s
- Embed URL renders in iframe without parent cookie access

Perf:
- Composer canvas with 20 nodes stays > 55fps on pan/zoom
- Dashboard with 6 live widgets + 30s schedule keeps main-thread under 100ms per refresh cycle

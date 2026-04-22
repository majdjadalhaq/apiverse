import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchApis, fetchApiBySlug } from '@/lib/api-data/fetch-apis'
import { getDemoConfig } from '@/lib/demo-sandbox/demo-configs'
import { DemoControls } from '@/components/demo/DemoControls'
import { ApiCard } from '@/components/api-card/ApiCard'
import { BookmarkButton } from '@/components/api-card/BookmarkButton'
import { AddToCollectionMenu } from '@/components/collections/AddToCollectionMenu'
import { DemoCard } from '@/components/community/DemoCard'
import { SubmitDemoForm } from '@/components/community/SubmitDemoForm'
import { fetchDemosForApi } from '@/lib/community/fetch-demos'
import { createClient } from '@/lib/supabase/server'
import type { ApiRow } from '@/lib/api-data/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const api = await fetchApiBySlug(slug)
  if (!api) return { title: 'API not found · APIVerse' }
  return {
    title: `${api.name} · APIVerse`,
    description: api.description,
  }
}

export default async function ApiDetailPage({ params }: PageProps) {
  const { slug } = await params
  const api = await fetchApiBySlug(slug)
  if (!api) notFound()

  const demoConfig = getDemoConfig(api.slug)

  const allApis = await fetchApis()
  const related = allApis
    .filter((a) => a.category === api.category && a.slug !== api.slug)
    .slice(0, 3)

  // Bookmarks are DB-backed, so they only light up once the catalog has
  // been seeded (every row has an `id`). Fallback rows are slug-only.
  const apiRow = 'id' in api ? (api as ApiRow) : null
  let isLoggedIn = false
  let currentUserId: string | null = null
  let isBookmarked = false
  let userCollections: { id: string; name: string; hasApi: boolean }[] = []
  if (apiRow) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isLoggedIn = !!user
    currentUserId = user?.id ?? null
    if (user) {
      const [{ data: existing }, { data: collections }, { data: joined }] =
        await Promise.all([
          supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('api_id', apiRow.id)
            .maybeSingle(),
          supabase
            .from('collections')
            .select('id, name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .returns<{ id: string; name: string }[]>(),
          supabase
            .from('collection_apis')
            .select('collection_id')
            .eq('api_id', apiRow.id)
            .returns<{ collection_id: string }[]>(),
        ])
      isBookmarked = !!existing
      const joinedSet = new Set((joined ?? []).map((j) => j.collection_id))
      userCollections = (collections ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        hasApi: joinedSet.has(c.id),
      }))
    }
  }

  const demos = apiRow ? await fetchDemosForApi(apiRow.id, currentUserId) : []

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/explore"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <ArrowLeftIcon /> Back to explore
      </Link>

      <header className="flex flex-col gap-6 border-b border-neutral-200 pb-8 dark:border-neutral-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-indigo-500">{api.category}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{api.name}</h1>
          <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {api.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {apiRow && (
            <BookmarkButton
              apiId={apiRow.id}
              slug={apiRow.slug}
              initialBookmarked={isBookmarked}
              isLoggedIn={isLoggedIn}
            />
          )}
          {apiRow && (
            <AddToCollectionMenu
              apiId={apiRow.id}
              slug={apiRow.slug}
              collections={userCollections}
              isLoggedIn={isLoggedIn}
            />
          )}
          <a
            href={api.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-sm font-medium outline-none transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-offset-neutral-950"
          >
            Official docs <ExternalLinkIcon />
          </a>
        </div>
      </header>

      <div className="my-8 flex flex-wrap gap-2">
        {api.auth !== 'No' && (
          <Pill tone="amber">Requires {api.auth}</Pill>
        )}
        {api.https && <Pill tone="emerald">HTTPS</Pill>}
        {api.cors === 'Yes' && <Pill tone="indigo">CORS enabled</Pill>}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Live demo</h2>
          <p className="text-xs text-neutral-500">Runs in a sandboxed iframe</p>
        </div>

        {demoConfig ? (
          <DemoControls
            demoKey={demoConfig.demoKey}
            paramDefs={demoConfig.paramDefs}
            height={demoConfig.height}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No live demo yet.{' '}
            <Link href="/login" className="text-indigo-500 hover:underline">
              Sign in
            </Link>{' '}
            to submit the first one.
          </div>
        )}
      </section>

      {apiRow && (
        <section className="mt-16 flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Community demos</h2>
            <p className="text-xs text-neutral-500">
              {demos.length} submission{demos.length === 1 ? '' : 's'}
            </p>
          </div>

          <SubmitDemoForm apiId={apiRow.id} slug={apiRow.slug} isLoggedIn={isLoggedIn} />

          {demos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
              No community demos yet — be the first to share one.
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {demos.map((d) => (
                <li key={d.id}>
                  <DemoCard demo={d} slug={apiRow.slug} currentUserId={currentUserId} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-semibold">More in {api.category}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <ApiCard key={r.slug} api={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

type Tone = 'amber' | 'emerald' | 'indigo'
const toneClasses: Record<Tone, string> = {
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
}

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm ${toneClasses[tone]}`}>{children}</span>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
      <path d="M21 14v7H3V3h7" />
    </svg>
  )
}

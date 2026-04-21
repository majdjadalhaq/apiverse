import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchApis, fetchApiBySlug } from '@/lib/api-data/fetch-apis'
import { getDemoConfig } from '@/lib/demo-sandbox/demo-configs'
import { DemoControls } from '@/components/demo/DemoControls'
import { ApiCard } from '@/components/api-card/ApiCard'

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
        <a
          href={api.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
        >
          Official docs <ExternalLinkIcon />
        </a>
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

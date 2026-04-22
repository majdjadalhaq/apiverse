import Link from 'next/link'
import type { Metadata } from 'next'
import { fetchRecentDemos } from '@/lib/community/fetch-demos'

export const metadata: Metadata = {
  title: 'Community · APIVerse',
  description: 'The newest demos and ideas submitted by the APIVerse community.',
}

export default async function CommunityFeedPage() {
  const demos = await fetchRecentDemos(30)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-indigo-500">
          Community
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Fresh demos from the community
        </h1>
        <p className="max-w-2xl text-neutral-600 dark:text-neutral-400">
          The newest ideas, snippets, and reference projects people have shared
          for each API. Jump into any one to upvote and discuss.
        </p>
      </header>

      {demos.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-4">
          {demos.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm transition hover:border-indigo-400 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-indigo-500/60"
            >
              <Link
                href={`/api/${d.api_slug}`}
                className="block rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {d.api_category}
                  </span>
                  <span className="text-sm font-medium text-indigo-500">
                    {d.api_name}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-semibold transition-colors hover:text-indigo-500">
                  {d.title}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {d.author_name ?? 'Anonymous'} · {d.upvotes_count} upvote
                  {d.upvotes_count === 1 ? '' : 's'}
                </p>
                {d.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {d.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        No demos yet. Browse the{' '}
        <Link href="/explore" className="text-indigo-500 hover:underline">
          catalog
        </Link>{' '}
        and submit the first one.
      </p>
    </div>
  )
}

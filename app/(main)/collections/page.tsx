import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { NewCollectionForm } from '@/components/collections/NewCollectionForm'
import { DeleteCollectionButton } from '@/components/collections/DeleteCollectionButton'

export const metadata: Metadata = {
  title: 'Your collections · APIVerse',
  description: 'Curated groups of public APIs you saved for later.',
}

interface CollectionRow {
  id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  collection_apis: { count: number }[]
}

export default async function CollectionsPage() {
  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('collections')
    .select('id, name, description, is_public, created_at, collection_apis(count)')
    .order('created_at', { ascending: false })
    .returns<CollectionRow[]>()

  const collections = data ?? []

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-wider text-indigo-500">
          Collections
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your curated API stacks
        </h1>
        <p className="max-w-2xl text-neutral-600 dark:text-neutral-400">
          Group APIs by project, theme, or vibe. Pull them up instantly next
          time you need a weather provider, image source, or joke endpoint.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">New collection</h2>
        <NewCollectionForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Your collections{' '}
          <span className="text-sm font-normal text-neutral-500">
            ({collections.length})
          </span>
        </h2>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
          >
            Couldn&rsquo;t load collections: {error.message}
          </div>
        ) : collections.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => {
              const count = c.collection_apis?.[0]?.count ?? 0
              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/60 p-5 backdrop-blur-sm transition hover:border-indigo-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-indigo-500/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/collections/${c.id}`}
                      className="min-w-0 flex-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <h3 className="truncate font-semibold transition-colors hover:text-indigo-500">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        {count} API{count === 1 ? '' : 's'} ·{' '}
                        {c.is_public ? 'Public' : 'Private'}
                      </p>
                    </Link>
                  </div>

                  {c.description && (
                    <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {c.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <Link
                      href={`/collections/${c.id}`}
                      className="text-sm font-medium text-indigo-500 transition hover:text-indigo-600"
                    >
                      Open →
                    </Link>
                    <DeleteCollectionButton id={c.id} name={c.name} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        No collections yet. Create one above, or browse the{' '}
        <Link href="/explore" className="text-indigo-500 hover:underline">
          API catalog
        </Link>{' '}
        and add APIs as you find them.
      </p>
    </div>
  )
}

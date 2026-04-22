import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { ApiCard } from '@/components/api-card/ApiCard'
import { DeleteCollectionButton } from '@/components/collections/DeleteCollectionButton'
import { RemoveFromCollectionButton } from '@/components/collections/RemoveFromCollectionButton'
import type { ApiRow } from '@/lib/api-data/types'

interface PageProps {
  params: Promise<{ id: string }>
}

interface CollectionDetail {
  id: string
  name: string
  description: string | null
  is_public: boolean
  user_id: string
  created_at: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select('name, description')
    .eq('id', id)
    .maybeSingle()

  if (!data) return { title: 'Collection · APIVerse' }
  return {
    title: `${data.name} · APIVerse`,
    description: data.description ?? undefined,
  }
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, description, is_public, user_id, created_at')
    .eq('id', id)
    .maybeSingle<CollectionDetail>()

  if (!collection) notFound()

  const isOwner = collection.user_id === user.id

  const { data: joinRows } = await supabase
    .from('collection_apis')
    .select('api:apis(id, name, description, category, url, auth, https, cors, slug, created_at)')
    .eq('collection_id', id)
    .returns<{ api: ApiRow | null }[]>()

  const apis: ApiRow[] = (joinRows ?? [])
    .map((r) => r.api)
    .filter((a): a is ApiRow => a !== null)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center gap-1.5 rounded text-sm text-neutral-500 outline-none transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-neutral-100"
      >
        <ArrowLeftIcon /> All collections
      </Link>

      <header className="mb-8 flex flex-col gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-wider text-indigo-500">
            {collection.is_public ? 'Public collection' : 'Private collection'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
              {collection.description}
            </p>
          )}
          <p className="mt-3 text-xs text-neutral-500">
            {apis.length} API{apis.length === 1 ? '' : 's'}
          </p>
        </div>

        {isOwner && (
          <div className="flex shrink-0 items-center gap-2">
            <DeleteCollectionButton
              id={collection.id}
              name={collection.name}
              redirectTo="/collections"
            />
          </div>
        )}
      </header>

      {apis.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apis.map((api) => (
            <li key={api.id} className="relative">
              <ApiCard api={api} />
              {isOwner && (
                <div className="absolute right-3 top-3">
                  <RemoveFromCollectionButton
                    collectionId={collection.id}
                    apiId={api.id}
                    apiName={api.name}
                  />
                </div>
              )}
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
        This collection is empty. Head to the{' '}
        <Link href="/explore" className="text-indigo-500 hover:underline">
          catalog
        </Link>{' '}
        and hit <span className="font-medium">Add to collection</span> on any
        API detail page.
      </p>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

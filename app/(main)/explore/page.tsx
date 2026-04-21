import { Suspense } from 'react'
import { ApiGrid } from '@/components/explore/ApiGrid'
import { ApiCardSkeleton } from '@/components/api-card/ApiCardSkeleton'
import { fetchApis } from '@/lib/api-data/fetch-apis'

export const metadata = {
  title: 'Explore · APIVerse',
  description: 'Browse hundreds of public APIs and try their demos in-browser.',
}

async function ExploreContent() {
  const apis = await fetchApis()
  const categories = [...new Set(apis.map((a) => a.category))].sort()
  return <ApiGrid apis={apis} categories={categories} />
}

function ExploreSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <ApiCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10">
        <h1 className="bg-gradient-to-br from-neutral-900 to-neutral-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-white dark:to-neutral-500 sm:text-5xl">
          Explore APIs
        </h1>
        <p className="mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
          Browse and test a curated catalog of public APIs — each one runs
          live in a sandboxed iframe so you can see the response before
          copying a single line of code.
        </p>
      </header>

      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreContent />
      </Suspense>
    </main>
  )
}

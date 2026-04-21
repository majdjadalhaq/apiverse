'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ApiCard } from '@/components/api-card/ApiCard'
import { SearchBar } from './SearchBar'
import { CategoryFilter } from './CategoryFilter'
import type { PublicApi } from '@/lib/api-data/types'

interface ApiGridProps {
  apis: (PublicApi & { id?: string })[]
  categories: string[]
}

/**
 * Client-side filter + search over a server-fetched API list. Keeps the
 * full list in memory and narrows it with `useMemo` so typing stays
 * responsive — the catalog is small enough (<500 rows) that indexing it
 * would be premature optimisation.
 */
export function ApiGrid({ apis, categories }: ApiGridProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const api of apis) map[api.category] = (map[api.category] ?? 0) + 1
    return map
  }, [apis])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return apis.filter((api) => {
      const matchQuery =
        !q || api.name.toLowerCase().includes(q) || api.description.toLowerCase().includes(q)
      const matchCategory = !selected || api.category === selected
      return matchQuery && matchCategory
    })
  }, [apis, search, selected])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="sm:max-w-sm sm:flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <p className="text-sm text-neutral-500">
          {filtered.length} of {apis.length} APIs
        </p>
      </div>

      <CategoryFilter
        categories={categories}
        selected={selected}
        onSelect={setSelected}
        counts={counts}
      />

      <motion.ul
        key={`${search}|${selected ?? 'all'}`}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
      >
        {filtered.map((api) => (
          <motion.li
            key={api.id ?? api.slug}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
          >
            <ApiCard api={api} />
          </motion.li>
        ))}
      </motion.ul>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-neutral-400">
          No APIs match. Try clearing the search or a different category.
        </p>
      )}
    </div>
  )
}

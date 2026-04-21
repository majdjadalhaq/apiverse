'use client'

import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onSelect: (category: string | null) => void
  counts?: Record<string, number>
}

export function CategoryFilter({ categories, selected, onSelect, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip active={selected === null} onClick={() => onSelect(null)}>
        All
        {counts && (
          <span className="ml-1 text-[11px] opacity-60">
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </span>
        )}
      </FilterChip>

      {categories.map((cat) => (
        <FilterChip
          key={cat}
          active={selected === cat}
          onClick={() => onSelect(cat)}
        >
          {cat}
          {counts?.[cat] !== undefined && (
            <span className="ml-1 text-[11px] opacity-60">{counts[cat]}</span>
          )}
        </FilterChip>
      ))}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition',
        active
          ? 'border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-100',
      )}
    >
      {children}
    </button>
  )
}

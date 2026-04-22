'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCollection } from '@/app/actions/collections'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  name: string
  redirectTo?: string
}

export function DeleteCollectionButton({ id, name, redirectTo }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    const ok = window.confirm(
      `Delete the collection "${name}"? This cannot be undone.`,
    )
    if (!ok) return

    startTransition(async () => {
      const result = await deleteCollection(id)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Delete collection ${name}`}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-rose-200 px-4 text-sm font-medium text-rose-600 transition',
        'hover:border-rose-400 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
        'dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/40 dark:focus-visible:ring-offset-neutral-950',
        'disabled:cursor-wait disabled:opacity-60',
      )}
    >
      <TrashIcon />
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  )
}

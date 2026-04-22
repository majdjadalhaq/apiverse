'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeApiFromCollection } from '@/app/actions/collections'
import { cn } from '@/lib/utils'

interface Props {
  collectionId: string
  apiId: string
  apiName: string
}

export function RemoveFromCollectionButton({ collectionId, apiId, apiName }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const result = await removeApiFromCollection(collectionId, apiId)
      if (!result.ok) {
        window.alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Remove ${apiName} from collection`}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition',
        'hover:border-rose-300 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
        'dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-rose-900/80 dark:hover:text-rose-400 dark:focus-visible:ring-offset-neutral-950',
        'disabled:cursor-wait disabled:opacity-60',
      )}
    >
      <XIcon />
    </button>
  )
}

function XIcon() {
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
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

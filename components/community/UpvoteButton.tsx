'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleUpvote } from '@/app/actions/community'
import { cn } from '@/lib/utils'

interface Props {
  demoId: string
  slug: string
  initialCount: number
  initialUpvoted: boolean
  isLoggedIn: boolean
}

export function UpvoteButton({
  demoId,
  slug,
  initialCount,
  initialUpvoted,
  isLoggedIn,
}: Props) {
  const [count, setCount] = useState(initialCount)
  const [upvoted, setUpvoted] = useState(initialUpvoted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/api/${slug}`)
      return
    }

    const nextUpvoted = !upvoted
    setUpvoted(nextUpvoted)
    setCount((c) => c + (nextUpvoted ? 1 : -1))

    startTransition(async () => {
      const result = await toggleUpvote(demoId, slug)
      if (!result.ok) {
        setUpvoted(!nextUpvoted)
        setCount((c) => c + (nextUpvoted ? -1 : 1))
        return
      }
      setUpvoted(result.data!.upvoted)
      setCount(result.data!.count)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={upvoted}
      aria-label={`${upvoted ? 'Remove upvote' : 'Upvote'} (${count})`}
      className={cn(
        'inline-flex h-10 min-w-[3.5rem] flex-col items-center justify-center rounded-lg border text-sm font-medium outline-none transition',
        'focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
        'disabled:cursor-wait disabled:opacity-70',
        upvoted
          ? 'border-indigo-300 bg-indigo-50 text-indigo-600 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300'
          : 'border-neutral-300 text-neutral-700 hover:border-neutral-500 focus-visible:ring-indigo-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500',
      )}
    >
      <ArrowUpIcon filled={upvoted} />
      <span className="text-xs tabular-nums leading-none">{count}</span>
    </button>
  )
}

function ArrowUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  )
}

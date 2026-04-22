'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleBookmark } from '@/app/actions/bookmarks'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  apiId: string
  slug: string
  initialBookmarked: boolean
  isLoggedIn: boolean
}

export function BookmarkButton({
  apiId,
  slug,
  initialBookmarked,
  isLoggedIn,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/api/${slug}`)
      return
    }

    // Optimistic flip; revert if the server says we failed.
    setBookmarked((b) => !b)

    startTransition(async () => {
      const result = await toggleBookmark(apiId, slug)
      if (!result.ok) {
        setBookmarked((b) => !b)
        return
      }
      setBookmarked(result.bookmarked)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium outline-none transition disabled:cursor-wait',
        'focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950',
        bookmarked
          ? 'border-rose-200 bg-rose-50 text-rose-600 focus-visible:ring-rose-500 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
          : 'border-neutral-300 text-neutral-700 hover:border-neutral-500 focus-visible:ring-indigo-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500',
      )}
    >
      <HeartIcon filled={bookmarked} />
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
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
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
